// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createHash,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  randomUUID,
} from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Types
// ============================================================

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
};

type RateRecord = {
  count: number;
  resetAt: number;
};

type UserRow = Record<string, any>;

type HashedPassword = {
  hash: string;
  salt: string;
  method: "pbkdf2" | "sha256";
};

type InsertUserResult = {
  user: UserRow | null;
  error: any;
  duplicate: boolean;
};

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

const USER_SESSION_COOKIE = "user_session";
const LEGACY_SESSION_COOKIE = "session";

const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const SESSION_MAX_AGE = (() => {
  const parsed = Number(process.env.USER_SESSION_MAX_AGE);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_MAX_AGE;
})();

const MAX_BODY_BYTES = 20_000; // 20KB
const MIN_PASSWORD_LENGTH = isProduction ? 10 : 8;
const MAX_PASSWORD_LENGTH = 256;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

const DB_TIMEOUT_MS = 8_000;
const LOG_TIMEOUT_MS = 3_000;

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_IP = 10;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_RATE_STORE_SIZE = 5_000;

const MIN_SECRET_LENGTH = 32;

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

// إذا كان نظام login القديم لا يدعم PBKDF2، يمكنك تشغيل هذا الوضع مؤقتًا.
// غير موصى به أمنيًا.
const USE_LEGACY_SHA256 =
  process.env.REGISTER_USE_LEGACY_SHA256 === "true";

// للتوافق مع كود قديم كان يقرأ cookie اسمه session.
// إذا كنت متأكدًا أنه غير مستخدم، اضبط:
// SET_LEGACY_SESSION_COOKIE=false
const SET_LEGACY_SESSION_COOKIE =
  process.env.SET_LEGACY_SESSION_COOKIE !== "false";

// ============================================================
// Common weak passwords
// ============================================================

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "abc12345",
  "iloveyou",
  "admin123",
  "user1234",
  "welcome1",
  "islam123",
  "muslim123",
  "quran123",
]);

// ============================================================
// Global rate-limit store
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __registerRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__registerRateLimit ?? new Map<string, RateRecord>();

globalRef.__registerRateLimit = rateLimitStore;

// ============================================================
// Env helpers
// ============================================================

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

function getSessionSecret(): string | null {
  const secret =
    env("USER_SESSION_SECRET") ||
    env("APP_SESSION_SECRET") ||
    env("JWT_SECRET");

  if (!secret) {
    return null;
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    console.warn(
      `[Register] Weak session secret detected. Use at least ${MIN_SECRET_LENGTH} characters.`
    );
  }

  return secret;
}

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

// ============================================================
// General helpers
// ============================================================

function withTimeout<T>(
  promise: PromiseLike<T>,
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
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F-\u009F\s]/g, "")
    .toLowerCase()
    .slice(0, MAX_EMAIL_LENGTH);
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isWeakPassword(password: string): boolean {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return true;
  }

  const normalized = password.toLowerCase().trim();

  if (COMMON_PASSWORDS.has(normalized)) {
    return true;
  }

  // منع كلمة مرور من حرف واحد مكرر مثل: aaaaaaaa
  if (/^(.)\1*$/.test(password)) {
    return true;
  }

  return false;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getUserAgent(req: NextRequest): string {
  return (req.headers.get("user-agent") || "unknown").slice(0, 500);
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signSession(payload: Record<string, unknown>, secret: string): string {
  const header = base64UrlJson({
    alg: "HS256",
    typ: "session",
  });

  const body = base64UrlJson(payload);

  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

// ============================================================
// Password hashing
// ============================================================

async function hashPasswordSecure(password: string): Promise<HashedPassword> {
  const salt = randomBytes(16).toString("hex");

  if (USE_LEGACY_SHA256) {
    const hash = createHash("sha256")
      .update(password + salt)
      .digest("hex");

    return { hash, salt, method: "sha256" };
  }

  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  ).toString("hex");

  return { hash, salt, method: "pbkdf2" };
}

// ============================================================
// Supabase error helpers
// ============================================================

function isMissingTableError(error: unknown): boolean {
  const message = String((error as any)?.message || "");

  return (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message) ||
    /schema/i.test(message)
  );
}

function isMissingColumnError(error: unknown, column: string): boolean {
  const message = String((error as any)?.message || "");

  return (
    new RegExp(column, "i").test(message) &&
    (/column.*does not exist/i.test(message) ||
      /Could not find the column/i.test(message) ||
      /schema.*does not exist/i.test(message))
  );
}

function isDuplicateError(error: unknown): boolean {
  const code = String((error as any)?.code || "");
  const message = String((error as any)?.message || "");

  return (
    code === "23505" ||
    /duplicate key value/i.test(message) ||
    /unique constraint/i.test(message)
  );
}

// ============================================================
// Rate limiting
// ============================================================

function cleanupRateLimitStore(): void {
  if (rateLimitStore.size <= MAX_RATE_STORE_SIZE) {
    return;
  }

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
  const normalizedEmail = email.toLowerCase();

  const entries: Array<[string, number]> = [
    [`ip:${ip}`, MAX_ATTEMPTS_PER_IP],
    [`email:${normalizedEmail}`, MAX_ATTEMPTS_PER_EMAIL],
  ];

  let limited = false;
  let retryAfter = 0;

  // أولًا: فحص هل أي مفتاح تجاوز الحد
  for (const [key, max] of entries) {
    const record = rateLimitStore.get(key);

    if (record && record.resetAt > now && record.count >= max) {
      limited = true;
      retryAfter = Math.max(
        retryAfter,
        Math.ceil((record.resetAt - now) / 1000)
      );
    }
  }

  if (limited) {
    return { limited: true, retryAfter };
  }

  // ثانيًا: زيادة العدادات فقط إذا لم يكن محدودًا
  for (const [key] of entries) {
    const record = rateLimitStore.get(key);

    if (!record || record.resetAt <= now) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + RATE_WINDOW_MS,
      });
    } else {
      record.count += 1;
    }
  }

  return { limited: false, retryAfter: 0 };
}

// ============================================================
// Supabase helpers
// ============================================================

function createSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function emailExists(
  supabase: SupabaseClient,
  email: string
): Promise<{ exists: boolean; error: any }> {
  try {
    const query = supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle() as unknown as PromiseLike<any>;

    const result = await withTimeout(
      query,
      DB_TIMEOUT_MS,
      "register_existing_check"
    );

    const error = (result as any)?.error;

    if (error) {
      return { exists: false, error };
    }

    return {
      exists: Boolean((result as any)?.data),
      error: null,
    };
  } catch (error) {
    return { exists: false, error };
  }
}

async function insertUser(
  supabase: SupabaseClient,
  input: {
    email: string;
    name: string;
    password: HashedPassword;
  }
): Promise<InsertUserResult> {
  const combinedHash = input.password.salt
    ? `${input.password.salt}:${input.password.hash}`
    : input.password.hash;

  const createdAt = new Date().toISOString();

  const attempts: Array<{
    payload: Record<string, unknown>;
    select: string;
  }> = [
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: input.password.hash,
        salt: input.password.salt,
        is_active: true,
        created_at: createdAt,
      },
      select: "id,email,name,token_version",
    },
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: input.password.hash,
        salt: input.password.salt,
        is_active: true,
        created_at: createdAt,
      },
      select: "id,email,name",
    },
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: input.password.hash,
        salt: input.password.salt,
        created_at: createdAt,
      },
      select: "id,email,name",
    },
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: input.password.hash,
        salt: input.password.salt,
        is_active: true,
      },
      select: "id,email,name",
    },
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: combinedHash,
        is_active: true,
        created_at: createdAt,
      },
      select: "id,email,name",
    },
    {
      payload: {
        email: input.email,
        name: input.name,
        password_hash: combinedHash,
      },
      select: "id,email,name",
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      const query = supabase
        .from("users")
        .insert(attempt.payload)
        .select(attempt.select)
        .single() as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        DB_TIMEOUT_MS,
        "register_insert"
      );

      const error = (result as any)?.error;

      if (!error) {
        return {
          user: (result as any)?.data ?? null,
          error: null,
          duplicate: false,
        };
      }

      lastError = error;

      if (isDuplicateError(error)) {
        return {
          user: null,
          error,
          duplicate: true,
        };
      }

      if (
        isMissingColumnError(error, "salt") ||
        isMissingColumnError(error, "is_active") ||
        isMissingColumnError(error, "created_at") ||
        isMissingColumnError(error, "token_version")
      ) {
        continue;
      }

      return {
        user: null,
        error,
        duplicate: false,
      };
    } catch (error) {
      lastError = error;

      if (isDuplicateError(error)) {
        return {
          user: null,
          error,
          duplicate: true,
        };
      }

      return {
        user: null,
        error,
        duplicate: false,
      };
    }
  }

  return {
    user: null,
    error: lastError,
    duplicate: false,
  };
}

async function logRegisterAttempt(
  supabase: SupabaseClient | null,
  params: {
    email: string;
    ip: string;
    userAgent: string;
    success: boolean;
    reason?: string;
    userId?: string | null;
  }
): Promise<void> {
  if (!supabase) {
    return;
  }

  const email = params.email.slice(0, MAX_EMAIL_LENGTH);
  const ip = params.ip.slice(0, 100);
  const userAgent = params.userAgent.slice(0, 500);
  const success = Boolean(params.success);
  const failureReason = params.reason
    ? String(params.reason).slice(0, 100)
    : null;
  const userId = params.userId ?? null;
  const createdAt = new Date().toISOString();

  const rows: Record<string, unknown>[] = [
    {
      email,
      ip,
      user_agent: userAgent,
      success,
      failure_reason: failureReason,
      user_id: userId,
      created_at: createdAt,
    },
    {
      email,
      ip,
      user_agent: userAgent,
      success,
      failure_reason: failureReason,
      user_id: userId,
    },
    {
      email,
      ip,
      success,
      failure_reason: failureReason,
      user_id: userId,
      created_at: createdAt,
    },
    {
      email,
      success,
      user_id: userId,
    },
    {
      email,
      success,
    },
  ];

  for (const row of rows) {
    try {
      const query = supabase
        .from("auth_register_events")
        .insert(row) as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        LOG_TIMEOUT_MS,
        "register_audit_log"
      );

      const error = (result as any)?.error;

      if (!error) {
        return;
      }

      if (isMissingTableError(error)) {
        return;
      }

      if (
        isMissingColumnError(error, "user_agent") ||
        isMissingColumnError(error, "failure_reason") ||
        isMissingColumnError(error, "user_id") ||
        isMissingColumnError(error, "created_at") ||
        isMissingColumnError(error, "ip")
      ) {
        continue;
      }

      console.warn("[Register] Failed to write audit log:", error);
      return;
    } catch (error) {
      console.warn("[Register] Unexpected audit log error:", error);
      return;
    }
  }
}

// ============================================================
// Response helpers
// ============================================================

function setSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Authorization");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return res;
}

function jsonResponse(body: unknown, status = 200): NextResponse {
  return setSecurityHeaders(
    NextResponse.json(body as any, { status })
  );
}

function setSessionCookies(res: NextResponse, token: string): void {
  const domain = env("AUTH_COOKIE_DOMAIN") || undefined;
  const sameSite = (isProduction ? "strict" : "lax") as "strict" | "lax";

  const cookieOptions: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    ...(domain ? { domain } : {}),
  };

  res.cookies.set(USER_SESSION_COOKIE, token, cookieOptions);

  if (SET_LEGACY_SESSION_COOKIE) {
    res.cookies.set(LEGACY_SESSION_COOKIE, token, cookieOptions);
  }
}

function methodNotAllowed(): NextResponse {
  const res = jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405
  );

  res.headers.set("Allow", "POST");

  return res;
}

// ============================================================
// POST /api/register
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  let email = "";
  let supabase: SupabaseClient | null = null;

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

    // 2) قراءة الـ body
    let rawBody: unknown;

    try {
      rawBody = await req.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة الطلب غير صحيحة",
        },
        400
      );
    }

    const body: RegisterBody =
      rawBody && typeof rawBody === "object" && !Array.isArray(rawBody)
        ? (rawBody as RegisterBody)
        : {};

    email = normalizeEmail(body.email);
    const password =
      typeof body.password === "string" ? body.password : "";
    const name = sanitizeText(body.name, MAX_NAME_LENGTH);

    // 3) تحقق أساسي
    if (!email || !password || !name) {
      return jsonResponse(
        {
          ok: false,
          error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة",
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة البريد الإلكتروني غير صحيحة",
        },
        400
      );
    }

    if (name.length < 2) {
      return jsonResponse(
        {
          ok: false,
          error: "الاسم قصير جدًا",
        },
        400
      );
    }

    if (isWeakPassword(password)) {
      return jsonResponse(
        {
          ok: false,
          error: `كلمة المرور ضعيفة. يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف وألا تكون من الكلمات الشائعة.`,
        },
        400
      );
    }

    // 4) Rate Limiting
    const rate = consumeRateLimit(ip, email);

    if (rate.limited) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
          retryAfter: rate.retryAfter,
        },
        429
      );
    }

    // 5) Supabase config
    supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[Register] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        500
      );
    }

    // 6) Session secret
    const secret = getSessionSecret();

    if (!secret) {
      console.error(
        "[Register] Missing USER_SESSION_SECRET / APP_SESSION_SECRET / JWT_SECRET."
      );

      await logRegisterAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        reason: "missing_session_secret",
      });

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        500
      );
    }

    // 7) فحص أولي لوجود البريد
    const existing = await emailExists(supabase, email);

    if (existing.error) {
      console.error("[Register] Existing email check error:", existing.error);

      await logRegisterAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        reason: "db_check_error",
      });

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        500
      );
    }

    if (existing.exists) {
      await logRegisterAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        reason: "email_exists",
      });

      return jsonResponse(
        {
          ok: false,
          error: "هذا البريد الإلكتروني مسجل بالفعل",
        },
        409
      );
    }

    // 8) Hash password
    const hashedPassword = await hashPasswordSecure(password);

    // 9) Insert user
    const inserted = await insertUser(supabase, {
      email,
      name,
      password: hashedPassword,
    });

    if (inserted.duplicate) {
      await logRegisterAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        reason: "email_exists_race",
      });

      return jsonResponse(
        {
          ok: false,
          error: "هذا البريد الإلكتروني مسجل بالفعل",
        },
        409
      );
    }

    if (inserted.error || !inserted.user?.id) {
      console.error("[Register] Insert error:", inserted.error);

      await logRegisterAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        reason: inserted.error ? "insert_error" : "no_user_returned",
      });

      return jsonResponse(
        {
          ok: false,
          error: "فشل إنشاء الحساب. حاول لاحقًا.",
        },
        500
      );
    }

    const user = inserted.user;

    // 10) Create signed session
    const now = Math.floor(Date.now() / 1000);

    const sessionPayload: Record<string, unknown> = {
      userId: String(user.id),
      email: String(user.email ?? email),
      role: "user",
      iat: now,
      exp: now + SESSION_MAX_AGE,
      jti: randomUUID(),
      v: 1,
    };

    const rawTokenVersion =
      user.token_version ?? user.auth_version ?? user.password_version;

    if (rawTokenVersion !== null && rawTokenVersion !== undefined) {
      const tokenVersion =
        typeof rawTokenVersion === "number"
          ? rawTokenVersion
          : Number(rawTokenVersion);

      if (Number.isFinite(tokenVersion)) {
        sessionPayload.tv = tokenVersion;
      }
    }

    const sessionToken = signSession(sessionPayload, secret);

    await logRegisterAttempt(supabase, {
      email,
      ip,
      userAgent,
      success: true,
      userId: String(user.id),
    });

    const res = jsonResponse(
      {
        ok: true,
        user: {
          id: String(user.id),
          email: String(user.email ?? email),
          name: typeof user.name === "string" ? user.name : name,
          role: "user",
        },
      },
      201
    );

    setSessionCookies(res, sessionToken);

    return res;
  } catch (error) {
    console.error("[Register] Unexpected error:", error);

    if (supabase) {
      await logRegisterAttempt(supabase, {
        email: email || "unknown",
        ip,
        userAgent,
        success: false,
        reason: "unexpected_error",
      }).catch(() => null);
    }

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
  return methodNotAllowed();
}