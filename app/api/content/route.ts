// app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getContent } from "@/lib/content";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const MAX_BODY_BYTES = 2_000_000; // 2MB
const DB_TIMEOUT_MS = 5_000;

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_POSTS_PER_IP = 20;

const MAX_DEPTH = 20;
const MAX_NODES = 50_000;
const MAX_STRING_LENGTH = 1_000_000;
const MAX_ARRAY_LENGTH = 5_000;
const MAX_OBJECT_KEYS = 500;
const MAX_KEY_LENGTH = 128;

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة (Base64 فقط).
 *
 * ⚠️ أمنيًا:
 * - لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 * - بعد أن يسجّل الآدمن الدخول من جديد بالنظام الموقّع، اضبطها على false.
 */
const ALLOW_LEGACY_SESSIONS =
  process.env.ALLOW_LEGACY_SESSIONS === "true";

const DANGEROUS_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

// ============================================================
// Types
// ============================================================

type SessionPayload = {
  userId?: string | number;
  email?: string | null;
  role?: string;
  type?: string;
  exp?: number;
  jti?: string;
};

type AdminCandidate = {
  userId: string;
  email: string | null;
  source: "admin_session" | "user_session" | "session" | "legacy";
  signed: boolean;
};

type AuthResult =
  | {
      ok: true;
      candidate: AdminCandidate;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

type RateRecord = {
  count: number;
  resetAt: number;
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
  const key = `content:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return true;
  }

  if (record.count >= MAX_POSTS_PER_IP) {
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

function normalizeUserId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const id = value.trim();
    if (id && id.length <= 128) {
      return id;
    }
  }

  return null;
}

function sanitizeKey(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, MAX_KEY_LENGTH);
}

function sanitizeStringValue(value: string): string {
  if (value.length > MAX_STRING_LENGTH) {
    throw new Error("string_too_long");
  }

  return value.replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
    ""
  );
}

function sanitizeValue(
  value: unknown,
  depth: number,
  state: { nodes: number }
): unknown {
  if (depth > MAX_DEPTH) {
    throw new Error("too_deep");
  }

  state.nodes += 1;

  if (state.nodes > MAX_NODES) {
    throw new Error("too_many_nodes");
  }

  if (value === null) {
    return null;
  }

  const type = typeof value;

  if (type === "boolean") {
    return value;
  }

  if (type === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (type === "string") {
    return sanitizeStringValue(value as string);
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      throw new Error("array_too_long");
    }

    return value.map((item) => sanitizeValue(item, depth + 1, state));
  }

  if (type === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length > MAX_OBJECT_KEYS) {
      throw new Error("object_too_large");
    }

    const output: Record<string, unknown> = {};

    for (const rawKey of keys) {
      const key = sanitizeKey(rawKey);

      if (!key) {
        continue;
      }

      if (DANGEROUS_KEYS.has(key.toLowerCase())) {
        continue;
      }

      output[key] = sanitizeValue(obj[rawKey], depth + 1, state);
    }

    return output;
  }

  return null;
}

function sanitizeContent(value: unknown): unknown {
  return sanitizeValue(value, 0, { nodes: 0 });
}

// ============================================================
// Session Verification
// ============================================================

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: string[]
): (SessionPayload & { role: string }) | null {
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

    const role = String(payload.role || payload.type || "").toLowerCase();
    const userId = normalizeUserId(payload.userId);

    if (!userId) {
      return null;
    }

    if (!expectedRoles.includes(role)) {
      return null;
    }

    if (
      typeof payload.exp === "number" &&
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      ...payload,
      userId,
      role,
    };
  } catch {
    return null;
  }
}

function parseLegacySession(
  token: string | undefined | null
): (SessionPayload & { role: string }) | null {
  if (!ALLOW_LEGACY_SESSIONS || !token) {
    return null;
  }

  // الجلسات الموقّعة تحتوي نقاط. إذا وجدت نقاط فهي ليست legacy.
  if (token.includes(".")) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    ) as SessionPayload;

    const role = String(payload.role || payload.type || "").toLowerCase();
    const userId = normalizeUserId(payload.userId);

    if (!userId || role !== "admin") {
      return null;
    }

    return {
      ...payload,
      userId,
      role,
    };
  } catch {
    return null;
  }
}

function findAdminSession(req: NextRequest): AdminCandidate | null {
  const adminToken = req.cookies.get("admin_session")?.value;
  const userToken = req.cookies.get("user_session")?.value;
  const sessionToken = req.cookies.get("session")?.value;

  const adminSecret = getAdminSecret();
  const userSecret = getUserSecret();

  // 1) admin_session موقّع
  const adminSigned = parseSignedSession(adminToken, adminSecret, ["admin"]);
  if (adminSigned?.userId) {
    return {
      userId: String(adminSigned.userId),
      email: adminSigned.email ?? null,
      source: "admin_session",
      signed: true,
    };
  }

  // 2) user_session موقّع ولكن بدور admin فقط
  const userSignedAsAdmin = parseSignedSession(userToken, userSecret, ["admin"]);
  if (userSignedAsAdmin?.userId) {
    return {
      userId: String(userSignedAsAdmin.userId),
      email: userSignedAsAdmin.email ?? null,
      source: "user_session",
      signed: true,
    };
  }

  // 3) session موقّع، قد يكون قادمًا من register/login القديم
  const sessionSignedByAdminSecret = parseSignedSession(
    sessionToken,
    adminSecret,
    ["admin"]
  );

  if (sessionSignedByAdminSecret?.userId) {
    return {
      userId: String(sessionSignedByAdminSecret.userId),
      email: sessionSignedByAdminSecret.email ?? null,
      source: "session",
      signed: true,
    };
  }

  const sessionSignedByUserSecret = parseSignedSession(
    sessionToken,
    userSecret,
    ["admin"]
  );

  if (sessionSignedByUserSecret?.userId) {
    return {
      userId: String(sessionSignedByUserSecret.userId),
      email: sessionSignedByUserSecret.email ?? null,
      source: "session",
      signed: true,
    };
  }

  // 4) fallback للجلسات القديمة غير الموقّعة، فقط إذا فعّلت ALLOW_LEGACY_SESSIONS
  const legacyCandidates = [
    { token: adminToken, source: "legacy" as const },
    { token: userToken, source: "legacy" as const },
    { token: sessionToken, source: "legacy" as const },
  ];

  for (const item of legacyCandidates) {
    const legacy = parseLegacySession(item.token);

    if (legacy?.userId) {
      return {
        userId: String(legacy.userId),
        email: legacy.email ?? null,
        source: item.source,
        signed: false,
      };
    }
  }

  return null;
}

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const candidate = findAdminSession(req);

  if (!candidate) {
    return {
      ok: false,
      status: 401,
      error: "غير مصرح لك. سجّل دخول الآدمن أولًا.",
    };
  }

  return {
    ok: true,
    candidate,
  };
}

// ============================================================
// Best-effort admin active check
// ============================================================

async function ensureAdminActive(
  supabase: any,
  candidate: AdminCandidate
): Promise<boolean> {
  try {
    const first = await withTimeout(
      supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", candidate.userId)
        .maybeSingle() as unknown as Promise<{
        data: any;
        error: any;
      }>,
      DB_TIMEOUT_MS,
      "admin_active_check"
    );

    if (!first.error) {
      if (!first.data) {
        return false;
      }

      if (first.data.is_active === false) {
        return false;
      }

      return true;
    }

    const message = String(first.error?.message || "");

    // لو عمود is_active غير موجود بعد
    if (/is_active/i.test(message)) {
      const second = await withTimeout(
        supabase
          .from("admin_users")
          .select("id")
          .eq("id", candidate.userId)
          .maybeSingle() as unknown as Promise<{
          data: any;
          error: any;
        }>,
        DB_TIMEOUT_MS,
        "admin_active_check_fallback"
      );

      if (!second.error) {
        return Boolean(second.data);
      }
    }

    // لو جدول admin_users غير موجود
    if (
      /does not exist/i.test(message) ||
      /Could not find the table/i.test(message) ||
      /relation/i.test(message)
    ) {
      try {
        const users = await withTimeout(
          supabase
            .from("users")
            .select("id, role, is_active")
            .eq("id", candidate.userId)
            .maybeSingle() as unknown as Promise<{
            data: any;
            error: any;
          }>,
          DB_TIMEOUT_MS,
          "users_admin_check"
        );

        if (!users.error) {
          if (!users.data) {
            return false;
          }

          const role = String(users.data.role || "").toLowerCase();

          if (role !== "admin") {
            return false;
          }

          if (users.data.is_active === false) {
            return false;
          }

          return true;
        }

        const usersMessage = String(users.error?.message || "");

        if (/is_active/i.test(usersMessage)) {
          const usersFallback = await withTimeout(
            supabase
              .from("users")
              .select("id, role")
              .eq("id", candidate.userId)
              .maybeSingle() as unknown as Promise<{
              data: any;
              error: any;
            }>,
            DB_TIMEOUT_MS,
            "users_admin_check_fallback"
          );

          if (!usersFallback.error && usersFallback.data) {
            const role = String(usersFallback.data.role || "").toLowerCase();
            return role === "admin";
          }
        }

        if (
          /does not exist/i.test(usersMessage) ||
          /Could not find the table/i.test(usersMessage) ||
          /relation/i.test(usersMessage)
        ) {
          // لا يوجد جدول تحقّق. نسمح بالجلسات الموقّعة فقط، ونرفض القديمة.
          return candidate.signed;
        }
      } catch {
        return candidate.signed;
      }

      return candidate.signed;
    }

    // خطأ قاعدة بيانات آخر: نسمح بالجلسات الموقّعة لتجنب قفل النظام،
    // ونرفض الجلسات القديمة غير الموقّعة.
    return candidate.signed;
  } catch {
    return candidate.signed;
  }
}

// ============================================================
// Audit Log
// ============================================================

async function logContentUpdate(
  supabase: any,
  params: {
    adminId: string;
    adminEmail: string | null;
    ip: string;
    userAgent: string;
    sizeBytes: number;
    checksum: string;
  }
): Promise<void> {
  try {
    await withTimeout(
      supabase.from("admin_content_updates").insert({
        admin_id: params.adminId,
        admin_email: params.adminEmail,
        ip: params.ip,
        user_agent: params.userAgent,
        size_bytes: params.sizeBytes,
        checksum: params.checksum,
        created_at: new Date().toISOString(),
      }) as unknown as Promise<{ error: any }>,
      DB_TIMEOUT_MS,
      "content_audit"
    );
  } catch (error) {
    // فشل سجل التدقيق لا يجب أن يكسر الحفظ
    console.error("[Content] Failed to write audit log:", error);
  }
}

// ============================================================
// GET /api/content
// ============================================================

export async function GET() {
  try {
    const hasDb = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    );

    const content = await getContent();

    return jsonResponse({
      content,
      live: hasDb,
    });
  } catch (error) {
    console.error("[Content] GET error:", error);

    return jsonResponse(
      {
        content: null,
        live: false,
        error: "تعذر جلب المحتوى. حاول لاحقًا.",
      },
      500
    );
  }
}

// ============================================================
// POST /api/content
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) Rate Limiting
    if (!checkRateLimit(ip)) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد المحاولات كثير جدًأ. حاول لاحقًا.",
        },
        429
      );
    }

    // 2) منع Body ضخم من الرأس أولًا
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب كبير جدًأ.",
        },
        413
      );
    }

    // 3) المصادقة قبل قراءة الجسم
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

    // 4) Supabase
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[Content] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        500
      );
    }

    // 5) تحقق إضافي من أن الآدمن ما زال فعالًا إن أمكن
    const active = await ensureAdminActive(supabase, auth.candidate);

    if (!active) {
      return jsonResponse(
        {
          ok: false,
          error: "هذا الحساب غير مفعّل أو لم يعد مصرحًا له.",
        },
        403
      );
    }

    // 6) قراءة الجسم
    let text: string;

    try {
      text = await req.text();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "تعذر قراءة الطلب.",
        },
        400
      );
    }

    const bodyBytes = Buffer.byteLength(text, "utf8");

    if (bodyBytes > MAX_BODY_BYTES) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب كبير جدًأ.",
        },
        413
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(text);
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة JSON غير صحيحة.",
        },
        400
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب يجب أن يكون كائن JSON.",
        },
        400
      );
    }

    const payload = body as Record<string, unknown>;

    if (!("content" in payload) || payload.content === undefined) {
      return jsonResponse(
        {
          ok: false,
          error: "لا يوجد محتوى للحفظ.",
        },
        400
      );
    }

    // 7) تنظيف المحتوى
    let cleanContent: unknown;

    try {
      cleanContent = sanitizeContent(payload.content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "invalid_content";

      console.warn("[Content] Sanitization rejected:", message);

      return jsonResponse(
        {
          ok: false,
          error: "المحتوى غير صالح أو أكبر من الحد المسموح.",
        },
        400
      );
    }

    // 8) الحفظ
    const updatedAt = new Date().toISOString();

    const upsertResult = await withTimeout(
      supabase
        .from("site_content")
        .upsert({
          id: 1,
          data: cleanContent,
          updated_at: updatedAt,
        }) as unknown as Promise<{ error: any }>,
      DB_TIMEOUT_MS,
      "content_upsert"
    ).catch((error) => ({
      error,
    }));

    if (upsertResult.error) {
      console.error("[Content] Supabase upsert error:", upsertResult.error);

      return jsonResponse(
        {
          ok: false,
          error: "تعذر حفظ المحتوى. حاول لاحقًا.",
        },
        500
      );
    }

    // 9) سجل تدقيق اختياري
    const serialized = JSON.stringify(cleanContent);
    const checksum = crypto
      .createHash("sha256")
      .update(serialized, "utf8")
      .digest("hex");

    await logContentUpdate(supabase, {
      adminId: auth.candidate.userId,
      adminEmail: auth.candidate.email,
      ip,
      userAgent,
      sizeBytes: Buffer.byteLength(serialized, "utf8"),
      checksum,
    });

    return jsonResponse({
      ok: true,
      saved_at: updatedAt,
      size_bytes: Buffer.byteLength(serialized, "utf8"),
      checksum,
    });
  } catch (error) {
    console.error("[Content] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع. حاول لاحقًا.",
      },
      500
    );
  }
}