// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const MAX_BODY_BYTES = 20_000; // 20KB
const MAX_STRING_LENGTH = 512;
const MAX_EVENT_NAME_LENGTH = 128;
const MAX_PROPS_KEYS = 20;
const MAX_PROP_STRING_LENGTH = 256;

const RATE_LIMIT_WINDOW_MS = 60_000; // دقيقة واحدة
const RATE_LIMIT_MAX_REQUESTS = 120; // 120 طلب/دقيقة لكل IP

const DB_TIMEOUT_MS = 2_500;

const SUPPORTED_LANGS = new Set(["ar", "en"]);
const ALLOW_BOTS = process.env.ANALYTICS_ALLOW_BOTS === "true";

// ============================================================
// Types
// ============================================================

type TrackType = "page_view" | "event";

type TrackPayload = {
  type?: unknown;
  name?: unknown;
  page?: unknown;
  lang?: unknown;
  referrer?: unknown;
  props?: unknown;
  sessionId?: unknown;
  userId?: unknown;
};

type SafeProps = Record<string, string | number | boolean | null>;

type SupabaseInsertResult = {
  error?: {
    message?: string;
  } | null;
};

// ============================================================
// In-memory rate limiter
// ملاحظة: في الإنتاج مع Serverless يُفضَّل استخدام Redis/Upstash
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimit() {
  const now = Date.now();

  for (const [ip, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(ip);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupRateLimit();

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count += 1;

  return true;
}

// ============================================================
// Helpers
// ============================================================

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizePage(value: unknown): string {
  let page = sanitizeText(value, MAX_STRING_LENGTH);

  if (!page) {
    return "/";
  }

  if (!page.startsWith("/")) {
    page = `/${page}`;
  }

  // إزالة query و hash
  page = page.split("?")[0].split("#")[0];

  // توحيد الشرطات المتكررة
  page = page.replace(/\/{2,}/g, "/");

  // إزالة الشرطة الأخيرة إلا لو الجذر
  if (page.length > 1 && page.endsWith("/")) {
    page = page.slice(0, -1);
  }

  return page || "/";
}

function normalizeLang(value: unknown, fallback?: string | null): string {
  const lang = sanitizeText(value, 10).toLowerCase();

  if (SUPPORTED_LANGS.has(lang)) {
    return lang;
  }

  const fallbackLang = sanitizeText(fallback, 10).toLowerCase();

  if (SUPPORTED_LANGS.has(fallbackLang)) {
    return fallbackLang;
  }

  return "ar";
}

function normalizeReferrer(value: unknown): string | null {
  const referrer = sanitizeText(value, MAX_STRING_LENGTH);

  if (!referrer || referrer === "null" || referrer === "undefined") {
    return null;
  }

  return referrer;
}

function normalizeEventName(value: unknown, type: TrackType): string {
  if (type === "page_view") {
    return "page_view";
  }

  const name = sanitizeText(value, MAX_EVENT_NAME_LENGTH);

  return name || "custom_event";
}

function normalizeProps(input: unknown): SafeProps {
  const output: SafeProps = {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return output;
  }

  let count = 0;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (count >= MAX_PROPS_KEYS) {
      break;
    }

    const safeKey = sanitizeText(key, 64);

    if (!safeKey) {
      continue;
    }

    if (typeof value === "string") {
      output[safeKey] = sanitizeText(value, MAX_PROP_STRING_LENGTH);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      output[safeKey] = value;
    } else if (typeof value === "boolean") {
      output[safeKey] = value;
    } else if (value === null) {
      output[safeKey] = null;
    } else {
      continue;
    }

    count += 1;
  }

  return output;
}

function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent) {
    return false;
  }

  return /bot|crawl|spider|headless|puppeteer|playwright|phantomjs|lighthouse|pagespeed|gtmetrix|webpagetest|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|facebookexternalhit|twitterbot|whatsapp|telegrambot|discordbot|slackbot|curl|wget|python-requests|go-http-client|java\/|okhttp/i.test(
    userAgent
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function okResponse() {
  return NextResponse.json({ ok: true });
}

// ============================================================
// POST /api/analytics/track
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // 1) منع Body ضخم
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return okResponse();
    }

    // 2) Rate Limiting بصمت
    const ip = getClientIP(req);

    if (!checkRateLimit(ip)) {
      return okResponse();
    }

    // 3) قراءة الـ body بأمان
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return okResponse();
    }

    const payload = (body || {}) as TrackPayload;

    // 4) تحديد نوع الحدث
    const rawType = sanitizeText(payload.type, 32).toLowerCase();
    const type: TrackType = rawType === "event" ? "event" : "page_view";

    // 5) تنظيف المدخلات
    const page = normalizePage(payload.page);

    const acceptLanguage = req.headers
      .get("accept-language")
      ?.split(",")[0]
      ?.split("-")[0]
      ?.trim();

    const lang = normalizeLang(payload.lang, acceptLanguage);

    const referrer = normalizeReferrer(
      payload.referrer ?? req.headers.get("referer")
    );

    const userAgent = sanitizeText(
      req.headers.get("user-agent"),
      MAX_STRING_LENGTH
    );

    const eventName = normalizeEventName(payload.name, type);

    const props = normalizeProps(payload.props);

    const sessionId =
      sanitizeText(payload.sessionId, 128) || null;

    const userId =
      sanitizeText(payload.userId, 128) || null;

    // 6) تجاهل البوتات افتراضيًا
    if (!ALLOW_BOTS && isBotUserAgent(userAgent)) {
      return okResponse();
    }

    // 7) التحقق من Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return okResponse();
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // 8) تجهيز الصف
    const row = {
      type,
      event_name: eventName,
      page,
      lang,
      referrer,
      user_agent: userAgent || null,
      session_id: sessionId,
      user_id: userId,
      props,
      created_at: new Date().toISOString(),
    };

    // 9) الإدخال مع Timeout
    const insertPromise = supabase
      .from("analytics_events")
      .insert(row) as unknown as Promise<SupabaseInsertResult>;

    const result = await withTimeout(
      insertPromise,
      DB_TIMEOUT_MS,
      "analytics_track_insert"
    );

    if (result?.error) {
      console.error(
        "[AnalyticsTrack] Supabase insert error:",
        result.error.message
      );
    }

    // دائمًا نرد ok حتى لا نكشف تفاصيل أو نكسر العميل
    return okResponse();
  } catch (error) {
    console.error("[AnalyticsTrack] Unexpected error:", error);

    return okResponse();
  }
}

// ============================================================
// GET: Method Not Allowed
// ============================================================

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Method not allowed",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}