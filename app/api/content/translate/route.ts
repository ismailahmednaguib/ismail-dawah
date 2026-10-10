// app/api/contact/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const MAX_BODY_BYTES = 20_000; // 20KB
const DB_TIMEOUT_MS = 2_500;

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_IP = 30;

const MAX_ID_LENGTH = 128;
const MAX_VALUE_LENGTH = 10_000;

/**
 * اللغات المسموح ترجمتها.
 * يمكن تعديلها من البيئة:
 * SUPPORTED_TRANSLATION_LANGS=ar,en,fr,ur
 */
const SUPPORTED_LANGS = new Set(
  (process.env.SUPPORTED_TRANSLATION_LANGS || "ar,en")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

if (SUPPORTED_LANGS.size === 0) {
  SUPPORTED_LANGS.add("ar");
  SUPPORTED_LANGS.add("en");
}

/**
 * الجداول/المجموعات المسموح تحديث ترجمتها.
 * لا تسمح للعميل بإرسال أي اسم جدول عشوائي.
 */
const ALLOWED_COLLECTIONS = new Set(
  (
    process.env.TRANSLATION_COLLECTIONS ||
    "fields,lessons,videos,articles,books,audio,photos,schedule,fatwas,projects,news,places,adhkar"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

if (ALLOWED_COLLECTIONS.size === 0) {
  ALLOWED_COLLECTIONS.add("fields");
}

/**
 * الحقول المسموح ترجمتها داخل عمود t.
 */
const ALLOWED_FIELDS = new Set(
  (
    process.env.TRANSLATION_FIELDS ||
    "title,name,desc,description,text,q,a,caption,category,topic,place,area,note,excerpt,body"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

if (ALLOWED_FIELDS.size === 0) {
  ALLOWED_FIELDS.add("name");
  ALLOWED_FIELDS.add("desc");
}

/**
 * خيار التوافق المؤقت مع النظام القديم الذي كان يستخدم x-admin-key.
 *
 * ⚠️ التوصية الأمنية:
 * - اجعله false في الإنتاج.
 * - اعتمد على admin_session أو user_session بدور admin بعد تسجيل دخول الأدمن.
 */
const ALLOW_LEGACY_ADMIN_KEY =
  process.env.TRANSLATE_ALLOW_ADMIN_KEY === "true";

// ============================================================
// Types
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

type SessionPayload = {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
  jti?: string;
};

type AuthenticatedAdmin = {
  id: string | null;
  email: string | null;
};

type AuthResult =
  | {
      ok: true;
      admin: AuthenticatedAdmin;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

// ============================================================
// In-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
// ============================================================

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `translate:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
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

function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
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

function normalizeCollection(value: unknown): string | null {
  const collection = sanitizeText(value, 64).toLowerCase();
  return ALLOWED_COLLECTIONS.has(collection) ? collection : null;
}

function normalizeField(value: unknown): string | null {
  const field = sanitizeText(value, 64).toLowerCase();
  return ALLOWED_FIELDS.has(field) ? field : null;
}

function normalizeLang(value: unknown): string | null {
  const lang = sanitizeText(value, 10).toLowerCase();
  return SUPPORTED_LANGS.has(lang) ? lang : null;
}

function normalizeId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const id = value.trim();

  if (!id || id.length > MAX_ID_LENGTH) {
    return null;
  }

  // يسمح بـ UUID، أرقام، شرطات، underscore
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return null;
  }

  return id;
}

function normalizeTranslationValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (value.length > MAX_VALUE_LENGTH) {
    return null;
  }

  // يزيل أحرف التحكم مع الحفاظ على الأسطر العادية إن وجدت
  return value
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
      ""
    )
    .replace(/\r\n/g, "\n")
    .trim();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function getAdminSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.APP_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    ""
  );
}

function getUserSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.APP_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    ""
  );
}

function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
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

function jsonResponse(body: unknown, status = 200): NextResponse {
  const res = NextResponse.json(body, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

// ============================================================
// Session Verification
// ============================================================

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: string[]
): SessionPayload | null {
  if (!token || !secret) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;

  if (!header || !body || !signature) {
    return null;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const headerJson = JSON.parse(
      Buffer.from(header, "base64url").toString("utf-8")
    );

    if (headerJson?.alg !== "HS256") {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as SessionPayload;

    if (!payload.userId) {
      return null;
    }

    if (!payload.role || !expectedRoles.includes(payload.role)) {
      return null;
    }

    if (
      typeof payload.exp === "number" &&
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isAuthorizedByLegacyKey(req: NextRequest): boolean {
  if (!ALLOW_LEGACY_ADMIN_KEY) {
    return false;
  }

  const key = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_KEY;

  if (!key || !expected) {
    return false;
  }

  return safeEqual(key, expected);
}

async function getAdminProfile(
  supabase: any,
  userId: string
): Promise<{ id: string; email: string; name?: string | null } | null> {
  try {
    const first = await withTimeout(
      supabase
        .from("admin_users")
        .select("id, email, name, is_active")
        .eq("id", userId)
        .maybeSingle() as unknown as Promise<{
        data: any;
        error: any;
      }>,
      DB_TIMEOUT_MS,
      "admin_profile"
    );

    if (!first.error) {
      if (!first.data) {
        return null;
      }

      if (first.data.is_active === false) {
        return null;
      }

      return {
        id: first.data.id,
        email: first.data.email,
        name: first.data.name ?? null,
      };
    }

    const message = String(first.error?.message || "");

    // لو عمود is_active غير موجود بعد، أعد المحاولة بدونه
    if (/is_active/i.test(message)) {
      const second = await withTimeout(
        supabase
          .from("admin_users")
          .select("id, email, name")
          .eq("id", userId)
          .maybeSingle() as unknown as Promise<{
          data: any;
          error: any;
        }>,
        DB_TIMEOUT_MS,
        "admin_profile_fallback"
      );

      if (!second.error && second.data) {
        return {
          id: second.data.id,
          email: second.data.email,
          name: second.data.name ?? null,
        };
      }

      return null;
    }

    // لو الجدول غير موجود
    if (
      /does not exist/i.test(message) ||
      /Could not find the table/i.test(message) ||
      /relation/i.test(message)
    ) {
      return null;
    }

    console.error("[ContactTranslate] admin profile error:", first.error);
    return null;
  } catch (error) {
    console.error("[ContactTranslate] unexpected admin profile error:", error);
    return null;
  }
}

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const adminToken = req.cookies.get("admin_session")?.value;
  const userToken = req.cookies.get("user_session")?.value;

  // 1) admin_session الموقّع
  let payload = parseSignedSession(adminToken, getAdminSecret(), ["admin"]);

  // 2) user_session الموقّع ولكن بدور admin فقط
  if (!payload) {
    payload = parseSignedSession(userToken, getUserSecret(), ["admin"]);
  }

  if (payload?.userId) {
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[ContactTranslate] Supabase is not configured.");
      return {
        ok: false,
        status: 500,
        error: "خطأ في الخادم. حاول لاحقًا.",
      };
    }

    const admin = await getAdminProfile(supabase, payload.userId);

    if (admin) {
      return {
        ok: true,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      };
    }

    return {
      ok: false,
      status: 401,
      error: "غير مصرح لك بهذا الإجراء",
    };
  }

  // 3) توافق مؤقت مع x-admin-key إذا فعّلته صراحةً
  if (isAuthorizedByLegacyKey(req)) {
    return {
      ok: true,
      admin: {
        id: null,
        email: "admin-key",
      },
    };
  }

  return {
    ok: false,
    status: 401,
    error: "غير مصرح لك بهذا الإجراء",
  };
}

// ============================================================
// Audit Log
// ============================================================

async function logTranslationUpdate(
  supabase: any,
  params: {
    adminId: string | null;
    adminEmail: string | null;
    collection: string;
    recordId: string;
    lang: string;
    field: string;
    oldValue: string | null;
    newValue: string;
    ip: string;
    userAgent: string;
  }
): Promise<void> {
  try {
    await withTimeout(
      supabase.from("admin_translation_updates").insert({
        admin_id: params.adminId,
        admin_email: params.adminEmail,
        collection: params.collection,
        record_id: params.recordId,
        lang: params.lang,
        field: params.field,
        old_value: params.oldValue,
        new_value: params.newValue,
        ip: params.ip,
        user_agent: params.userAgent,
        created_at: new Date().toISOString(),
      }) as unknown as Promise<{ error: any }>,
      DB_TIMEOUT_MS,
      "translation_audit"
    );
  } catch (error) {
    // فشل سجل التدقيق لا يجب أن يكسر عملية التحديث
    console.error("[ContactTranslate] Failed to write audit log:", error);
  }
}

// ============================================================
// POST /api/contact/translate
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) منع Body ضخم
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب كبير جدًا",
        },
        413
      );
    }

    // 2) Rate Limiting
    if (!checkRateLimit(ip)) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
        },
        429
      );
    }

    // 3) المصادقة
    const auth = await authenticate(req);

    if (!auth.ok) {
      return jsonResponse(
        {
          ok: false,
          error: auth.error,
        },
        auth.status
      );
    }

    // 4) قراءة الـ body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة الطلب غير صحيحة",
        },
        400
      );
    }

    const payload = (body || {}) as Record<string, unknown>;

    const collection = normalizeCollection(payload.collection);
    const id = normalizeId(payload.id);
    const lang = normalizeLang(payload.lang);
    const field = normalizeField(payload.field);
    const value = normalizeTranslationValue(payload.value);

    // 5) تحقق من المدخلات
    if (!collection || !id || !lang || !field || value === null) {
      return jsonResponse(
        {
          ok: false,
          error: "بيانات غير صالحة أو حقل غير مسموح",
        },
        400
      );
    }

    // 6) Supabase
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[ContactTranslate] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        500
      );
    }

    // 7) جلب العنصر الحالي
    const fetchResult = await withTimeout(
      supabase
        .from(collection)
        .select("id, t")
        .eq("id", id)
        .maybeSingle() as unknown as Promise<{
        data: any;
        error: any;
      }>,
      DB_TIMEOUT_MS,
      "translation_fetch"
    ).catch((error) => ({
      data: null,
      error,
    }));

    if (fetchResult.error) {
      console.error("[ContactTranslate] fetch error:", fetchResult.error);

      return jsonResponse(
        {
          ok: false,
          error: "تعذر جلب العنصر. حاول لاحقًا.",
        },
        500
      );
    }

    if (!fetchResult.data) {
      return jsonResponse(
        {
          ok: false,
          error: "العنصر غير موجود",
        },
        404
      );
    }

    const item = fetchResult.data as {
      id: string;
      t?: unknown;
    };

    const currentTranslations = isPlainObject(item.t) ? item.t : {};

    const currentLangValue = isPlainObject(currentTranslations[lang])
      ? (currentTranslations[lang] as Record<string, unknown>)
      : {};

    const oldValue =
      typeof currentLangValue[field] === "string"
        ? (currentLangValue[field] as string)
        : null;

    // 8) بناء الترجمة الجديدة
    const nextTranslations = {
      ...currentTranslations,
      [lang]: {
        ...currentLangValue,
        [field]: value,
      },
    };

    // 9) التحديث
    const updateResult = await withTimeout(
      supabase
        .from(collection)
        .update({ t: nextTranslations })
        .eq("id", id) as unknown as Promise<{ error: any }>,
      DB_TIMEOUT_MS,
      "translation_update"
    ).catch((error) => ({
      error,
    }));

    if (updateResult.error) {
      console.error("[ContactTranslate] update error:", updateResult.error);

      return jsonResponse(
        {
          ok: false,
          error: "تعذر حفظ الترجمة. حاول لاحقًا.",
        },
        500
      );
    }

    // 10) سجل التدقيق
    await logTranslationUpdate(supabase, {
      adminId: auth.admin.id,
      adminEmail: auth.admin.email,
      collection,
      recordId: id,
      lang,
      field,
      oldValue,
      newValue: value,
      ip,
      userAgent,
    });

    return jsonResponse({
      ok: true,
    });
  } catch (error) {
    console.error("[ContactTranslate] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع. حاول لاحقًا.",
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
    405
  );
}