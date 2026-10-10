// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MAX_BODY_BYTES = positiveNumber(
  process.env.NEWSLETTER_MAX_BODY_BYTES,
  10_000
);

const RATE_WINDOW_MS = positiveNumber(
  process.env.NEWSLETTER_RATE_WINDOW_MS,
  10 * 60 * 1000
);

const MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.NEWSLETTER_MAX_REQUESTS_PER_IP,
  20
);

const MAX_REQUESTS_PER_EMAIL = positiveNumber(
  process.env.NEWSLETTER_MAX_REQUESTS_PER_EMAIL,
  3
);

const SUBSCRIBE_TIMEOUT_MS = positiveNumber(
  process.env.NEWSLETTER_SUBSCRIBE_TIMEOUT_MS,
  8000
);

const TURNSTILE_TIMEOUT_MS = positiveNumber(
  process.env.NEWSLETTER_TURNSTILE_TIMEOUT_MS,
  5000
);

const REQUIRE_ORIGIN = process.env.NEWSLETTER_REQUIRE_ORIGIN !== "false";

const ALLOWED_ORIGINS = (process.env.NEWSLETTER_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().toLowerCase())
  .filter(Boolean);

const TURNSTILE_SECRET =
  process.env.TURNSTILE_SECRET_KEY ||
  process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
  "";

const ENABLE_TURNSTILE = Boolean(TURNSTILE_SECRET);

// ============================================================
// Types
// ============================================================

type Lang = "ar" | "en";

type Body = Record<string, unknown>;

type RateRecord = {
  count: number;
  resetAt: number;
};

type SubscribeResult = {
  ok: boolean;
  message: string;
};

// ============================================================
// Messages
// ============================================================

const MESSAGES: Record<
  Lang,
  {
    success: string;
    invalidEmail: string;
    rateLimited: string;
    serverError: string;
    badRequest: string;
    forbidden: string;
    turnstileFailed: string;
  }
> = {
  ar: {
    success: "تم الاشتراك بنجاح. ستصلك الرسائل قريبًا.",
    invalidEmail: "البريد الإلكتروني غير صحيح.",
    rateLimited: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
    serverError: "تعذر الاشتراك حاليًا. حاول لاحقًا.",
    badRequest: "الطلب غير صالح.",
    forbidden: "طلب غير مصرح به.",
    turnstileFailed: "فشل التحقق الأمني. حاول مرة أخرى.",
  },
  en: {
    success: "You have been subscribed successfully. You will receive updates soon.",
    invalidEmail: "Invalid email address.",
    rateLimited: "Too many attempts. Please try again later.",
    serverError: "Subscription failed temporarily. Please try again later.",
    badRequest: "Invalid request.",
    forbidden: "Forbidden request.",
    turnstileFailed: "Security verification failed. Please try again.",
  },
};

// ============================================================
// In-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يُفضَّل استخدام Redis/Upstash
// ============================================================

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function consumeRateLimit(ip: string, email: string): {
  limited: boolean;
  retryAfter: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();

  const entries: Array<[string, number]> = [
    [`newsletter-ip:${ip}`, MAX_REQUESTS_PER_IP],
    [`newsletter-email:${email.toLowerCase()}`, MAX_REQUESTS_PER_EMAIL],
  ];

  let limited = false;
  let retryAfter = 0;

  for (const [key, max] of entries) {
    let record = rateLimitStore.get(key);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + RATE_WINDOW_MS,
      };

      rateLimitStore.set(key, record);
      continue;
    }

    if (record.count >= max) {
      limited = true;
      retryAfter = Math.max(
        retryAfter,
        Math.ceil((record.resetAt - now) / 1000)
      );
    } else {
      record.count += 1;
    }
  }

  return { limited, retryAfter };
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
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value: unknown): string {
  return sanitizeText(value, 254)
    .toLowerCase()
    .replace(/\s+/g, "");
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function normalizeLang(value: unknown, acceptLanguage?: string | null): Lang {
  const direct = sanitizeText(value, 10).toLowerCase();

  if (direct === "ar" || direct === "en") {
    return direct;
  }

  const headerLang = (acceptLanguage || "")
    .split(",")[0]
    ?.split("-")[0]
    ?.trim()
    .toLowerCase();

  if (headerLang === "ar" || headerLang === "en") {
    return headerLang;
  }

  return "ar";
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (!domain) {
    return "***";
  }

  if (!local) {
    return `***@${domain}`;
  }

  return `${local.slice(0, 1)}***@${domain}`;
}

function isAllowedOrigin(req: NextRequest): boolean {
  if (!isProduction || !REQUIRE_ORIGIN) {
    return true;
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const candidate = originHeader || refererHeader;

  if (!candidate) {
    return false;
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();

    const hostHeader = (req.headers.get("host") || "")
      .split(":")[0]
      .toLowerCase();

    if (hostHeader && hostname === hostHeader) {
      return true;
    }

    const allowed = new Set<string>(ALLOWED_ORIGINS);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (siteUrl) {
      try {
        allowed.add(new URL(siteUrl).hostname.toLowerCase());
      } catch {
        // ignore invalid NEXT_PUBLIC_SITE_URL
      }
    }

    return Array.from(allowed).some((allowedHost) => {
      return (
        hostname === allowedHost ||
        hostname.endsWith(`.${allowedHost}`)
      );
    });
  } catch {
    return false;
  }
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): NextResponse {
  const res = NextResponse.json(body, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      res.headers.set(key, value);
    }
  }

  return res;
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

async function readBody(req: NextRequest): Promise<Body | null> {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();

  const contentLengthHeader = req.headers.get("content-length");
  const contentLength = Number(contentLengthHeader || "0");

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_BODY_BYTES
  ) {
    return null;
  }

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();

      if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
        return null;
      }

      const params = new URLSearchParams(text);
      const obj: Body = {};

      for (const [key, value] of params.entries()) {
        obj[key] = value;
      }

      return obj;
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const obj: Body = {};

      for (const [key, value] of formData.entries()) {
        if (
          typeof value === "object" &&
          value !== null &&
          "name" in value
        ) {
          obj[key] = String((value as { name: unknown }).name);
        } else {
          obj[key] = String(value);
        }
      }

      return obj;
    }

    const text = await req.text();

    if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
      return null;
    }

    try {
      const parsed = JSON.parse(text) as unknown;

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Body;
      }

      return null;
    } catch {
      const params = new URLSearchParams(text);
      const obj: Body = {};

      for (const [key, value] of params.entries()) {
        obj[key] = value;
      }

      return obj;
    }
  } catch {
    return null;
  }
}

function getTurnstileToken(body: Body): string {
  return sanitizeText(
    body.turnstileToken ??
      body["cf-turnstile-response"] ??
      body.token ??
      "",
    4096
  );
}

async function verifyTurnstile(token: string): Promise<boolean> {
  if (!ENABLE_TURNSTILE) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);

    const res = await withTimeout(
      fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }),
      TURNSTILE_TIMEOUT_MS,
      "turnstile_verify"
    );

    const data = (await res.json()) as { success?: boolean };

    return Boolean(data?.success);
  } catch (error) {
    console.error("[Newsletter] Turnstile verification error:", error);
    return false;
  }
}

function normalizeSubscribeResult(
  result: unknown,
  lang: Lang
): SubscribeResult {
  const messages = MESSAGES[lang];

  if (!result || typeof result !== "object") {
    return {
      ok: false,
      message: messages.serverError,
    };
  }

  const obj = result as Record<string, unknown>;

  const ok = obj.ok === true || obj.success === true;

  if (ok) {
    return {
      ok: true,
      message:
        typeof obj.message === "string" && obj.message.trim()
          ? obj.message
          : messages.success,
    };
  }

  const errorText = String(
    obj.error || obj.message || ""
  ).toLowerCase();

  // منع كشف حالة الاشتراك السابق — نُرجع نجاحًا عامًا إذا كان مسجلًا بالفعل
  if (
    /already|exist|duplicate|subscribed|member/.test(errorText)
  ) {
    return {
      ok: true,
      message: messages.success,
    };
  }

  return {
    ok: false,
    message: messages.serverError,
  };
}

// ============================================================
// POST /api/newsletter
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) Origin / CSRF check
    if (!isAllowedOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          error: MESSAGES.ar.forbidden,
        },
        403
      );
    }

    // 2) Read body safely
    const body = await readBody(req);

    if (!body) {
      return jsonResponse(
        {
          ok: false,
          error: MESSAGES.ar.badRequest,
        },
        400
      );
    }

    const lang = normalizeLang(
      body.lang,
      req.headers.get("accept-language")
    );

    const messages = MESSAGES[lang];

    // 3) Honeypot — لو امتلأ، نتظاهر بالنجاح بدون اشتراك
    const honeypot = sanitizeText(
      body.website ??
        body.newsletter_website ??
        body.hp ??
        body.url ??
        "",
      255
    );

    if (honeypot) {
      return jsonResponse({
        ok: true,
        message: messages.success,
      });
    }

    // 4) Validate email
    const email = normalizeEmail(body.email);
    const name = sanitizeText(body.name, 100);

    // 5) Rate limit — نستخدم invalid key لو الإيميل غير صالح
    const rate = consumeRateLimit(ip, email || `invalid:${ip}`);

    if (rate.limited) {
      return jsonResponse(
        {
          ok: false,
          error: messages.rateLimited,
        },
        429,
        {
          "Retry-After": String(rate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)),
        }
      );
    }

    if (!email || !isValidEmail(email)) {
      return jsonResponse(
        {
          ok: false,
          error: messages.invalidEmail,
        },
        400
      );
    }

    // 6) Optional Turnstile
    const turnstileToken = getTurnstileToken(body);
    const turnstileOk = await verifyTurnstile(turnstileToken);

    if (!turnstileOk) {
      return jsonResponse(
        {
          ok: false,
          error: ENABLE_TURNSTILE
            ? messages.turnstileFailed
            : messages.serverError,
        },
        400
      );
    }

    // 7) Subscribe
    let rawResult: unknown;

    try {
      rawResult = await withTimeout(
        Promise.resolve(subscribeEmail(email, name || undefined)),
        SUBSCRIBE_TIMEOUT_MS,
        "subscribeEmail"
      );
    } catch (error) {
      console.error("[Newsletter] subscribeEmail error:", {
        ip,
        email: maskEmail(email),
        lang,
        error: error instanceof Error ? error.message : String(error),
      });

      return jsonResponse(
        {
          ok: false,
          error: messages.serverError,
        },
        500
      );
    }

    const result = normalizeSubscribeResult(rawResult, lang);

    if (!result.ok) {
      console.warn("[Newsletter] subscription rejected:", {
        ip,
        email: maskEmail(email),
        lang,
      });
    }

    return jsonResponse(result, result.ok ? 200 : 422);
  } catch (error) {
    console.error("[Newsletter] unexpected error:", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse(
      {
        ok: false,
        error: MESSAGES.ar.serverError,
      },
      500
    );
  }
}

// ============================================================
// GET: Method Not Allowed
// ============================================================

export async function GET() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "POST",
    }
  );
}

// ============================================================
// OPTIONS: Preflight support
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Requested-With, cf-turnstile-response",
      "Access-Control-Max-Age": "86400",
      "Cache-Control": "no-store",
    },
  });
}