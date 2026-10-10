// app/api/admin/login/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createHash,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

// ============================================================
// Types
// ============================================================

type RateRecord = {
  attempts: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining?: number;
  retryAfter?: number;
};

type LoginAttempt = {
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: string;
};

type AdminUserRow = Record<string, any>;

// ============================================================
// Configuration
// ============================================================

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 ساعات
const SESSION_VERSION = 1;

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // دقيقة واحدة
const RATE_LIMIT_MAX_ATTEMPTS_PER_IP = 20;
const RATE_LIMIT_MAX_ATTEMPTS_PER_EMAIL = 5;

const MIN_SECRET_LENGTH = 32;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;
const MAX_BODY_BYTES = 10_000;

const DB_TIMEOUT_MS = 8_000;
const LOG_TIMEOUT_MS = 3_000;
const UPGRADE_TIMEOUT_MS = 3_000;

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

const isProduction = process.env.NODE_ENV === "production";

// ============================================================
// Global rate-limit store
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __adminLoginRateLimit?: Map<string, RateRecord>;
};

const rateLimitMap =
  globalRef.__adminLoginRateLimit ?? new Map<string, RateRecord>();

globalRef.__adminLoginRateLimit = rateLimitMap;

// ============================================================
// Env helpers
// ============================================================

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

function getSessionSecret(): string {
  const secret =
    env("ADMIN_SESSION_SECRET") ||
    env("APP_SESSION_SECRET") ||
    env("JWT_SECRET");

  if (secret) {
    if (secret.length < MIN_SECRET_LENGTH) {
      console.warn(
        `[AdminLogin] Weak session secret detected. Use at least ${MIN_SECRET_LENGTH} characters.`
      );
    }

    return secret;
  }

  if (isProduction) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET / APP_SESSION_SECRET / JWT_SECRET in production."
    );
  }

  return "dev-fallback-change-me-in-production-32chars-min!!";
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

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signSession(payload: Record<string, unknown>): string {
  const secret = getSessionSecret();

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

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isValidEmail(value: unknown): boolean {
  const email = normalizeEmail(value);

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeRole(value: unknown): "admin" | "user" | null {
  const role = String(value || "")
    .trim()
    .toLowerCase();

  if (role === "admin" || role === "user") {
    return role;
  }

  return null;
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getUserAgent(req: Request): string {
  return (req.headers.get("user-agent") || "unknown").slice(0, 500);
}

function stripPort(host: string): string {
  const value = host.trim();

  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    return end > -1 ? value.slice(1, end) : value;
  }

  return value.split(":")[0] || value;
}

function getHostname(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function getRequestHostname(req: Request): string | null {
  const forwardedHost = req
    .headers.get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    return stripPort(forwardedHost);
  }

  const hostHeader = req.headers.get("host");

  if (hostHeader) {
    return stripPort(hostHeader);
  }

  return getHostname(req.url);
}

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");

  // السماح للطلبات بدون Origin مثل بعض أدوات الاختبار أو الطلبات الداخلية
  if (!origin) {
    return true;
  }

  const originHost = getHostname(origin);

  if (!originHost) {
    return false;
  }

  const allowed = new Set<string>();

  const requestHost = getRequestHostname(req);
  if (requestHost) {
    allowed.add(requestHost);
  }

  const siteHost = getHostname(env("NEXT_PUBLIC_SITE_URL"));
  if (siteHost) {
    allowed.add(siteHost);
  }

  const forwardedHost = req
    .headers.get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    allowed.add(stripPort(forwardedHost));
  }

  if (!isProduction) {
    allowed.add("localhost");
    allowed.add("127.0.0.1");
    allowed.add("0.0.0.0");
  }

  return allowed.has(originHost);
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function hashPassword(password: string): {
  hash: string;
  salt: string;
} {
  const salt = randomBytes(16).toString("hex");

  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  ).toString("hex");

  return { hash, salt };
}

/**
 * في هذه النسخة لا نعتمد على bcryptjs حتى لا يكسر البناء إذا لم تكن مثبتة.
 *
 * إذا كانت كلمات المرور عندك تبدأ بـ $2a$ أو $2b$،
 * فستحتاج تثبيت bcryptjs واستخدام النسخة البديلة أسفل هذا الملف.
 */
async function verifyPasswordFlexible(
  password: string,
  storedHash: string,
  salt?: string | null
): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  const hash = storedHash.trim();

  // bcrypt غير مدعوم في هذه النسخة البناء-آمنة
  if (hash.startsWith("$2")) {
    console.warn(
      "[AdminLogin] bcrypt hash detected but bcryptjs support is disabled in this build-safe route. Install bcryptjs and enable bcrypt verification if needed."
    );
    return false;
  }

  let effectiveSalt = salt?.trim() || "";
  let effectiveHash = hash;

  // combined format: salt:hash
  if (!effectiveSalt && hash.includes(":")) {
    const index = hash.indexOf(":");
    effectiveSalt = hash.slice(0, index);
    effectiveHash = hash.slice(index + 1);
  }

  if (!effectiveSalt) {
    return false;
  }

  // legacy SHA-256 + salt
  if (effectiveHash.length === 64) {
    const candidate = createHash("sha256")
      .update(password + effectiveSalt)
      .digest("hex");

    return safeEqualHex(candidate, effectiveHash);
  }

  // PBKDF2 + salt
  if (effectiveHash.length === 128) {
    const candidate = pbkdf2Sync(
      password,
      effectiveSalt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    ).toString("hex");

    return safeEqualHex(candidate, effectiveHash);
  }

  return false;
}

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

// ============================================================
// Rate limiting
// ============================================================

function cleanupRateLimit(now: number): void {
  if (rateLimitMap.size <= 1000) {
    return;
  }

  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(key: string, maxAttempts: number): RateLimitResult {
  const now = Date.now();

  cleanupRateLimit(now);

  const record = rateLimitMap.get(key);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(key, {
      attempts: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
    };
  }

  if (record.attempts >= maxAttempts) {
    return {
      allowed: false,
      limit: maxAttempts,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.attempts += 1;

  return {
    allowed: true,
    limit: maxAttempts,
    remaining: Math.max(0, maxAttempts - record.attempts),
  };
}

// ============================================================
// Supabase helpers
// ============================================================

function createSupabaseClient(): SupabaseClient | null {
  const url =
    env("SUPABASE_URL") ||
    env("NEXT_PUBLIC_SUPABASE_URL");

  const key =
    env("SUPABASE_SERVICE_KEY") ||
    env("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function fetchAdminUser(
  supabase: SupabaseClient,
  email: string
): Promise<{ user: AdminUserRow | null; tableMissing: boolean }> {
  const selects = [
    "id,email,name,password_hash,salt,role,is_active,token_version",
    "id,email,name,password_hash,salt,role,is_active",
    "id,email,name,password_hash,salt,role",
    "id,email,name,password_hash,salt",
    "id,email,name,password_hash",
  ];

  for (const select of selects) {
    try {
      const result = (await supabase
        .from("admin_users")
        .select(select)
        .eq("email", email)
        .maybeSingle()) as { data: AdminUserRow | null; error: any };

      if (!result.error) {
        return {
          user: result.data,
          tableMissing: false,
        };
      }

      if (isMissingTableError(result.error)) {
        return {
          user: null,
          tableMissing: true,
        };
      }

      if (
        isMissingColumnError(result.error, "token_version") ||
        isMissingColumnError(result.error, "is_active") ||
        isMissingColumnError(result.error, "role") ||
        isMissingColumnError(result.error, "salt") ||
        isMissingColumnError(result.error, "name")
      ) {
        continue;
      }

      console.error("[AdminLogin] fetchAdminUser error:", result.error);
      return {
        user: null,
        tableMissing: false,
      };
    } catch (error) {
      console.error("[AdminLogin] fetchAdminUser exception:", error);
      return {
        user: null,
        tableMissing: false,
      };
    }
  }

  return {
    user: null,
    tableMissing: false,
  };
}

async function logAttempt(
  supabase: SupabaseClient | null,
  attempt: LoginAttempt
): Promise<void> {
  if (!supabase) {
    return;
  }

  const email = attempt.email.slice(0, MAX_EMAIL_LENGTH);
  const ip = attempt.ip.slice(0, 100);
  const userAgent = attempt.userAgent.slice(0, 500);
  const success = Boolean(attempt.success);
  const failureReason = attempt.failureReason
    ? String(attempt.failureReason).slice(0, 100)
    : null;
  const createdAt = attempt.timestamp;

  const logRows: Record<string, unknown>[] = [
    {
      email,
      ip,
      user_agent: userAgent,
      success,
      failure_reason: failureReason,
      created_at: createdAt,
    },
    {
      email,
      ip,
      user_agent: userAgent,
      success,
      failure_reason: failureReason,
    },
    {
      email,
      ip,
      success,
      failure_reason: failureReason,
      created_at: createdAt,
    },
    {
      email,
      success,
    },
  ];

  for (const logRow of logRows) {
    try {
      const query = supabase
        .from("admin_login_attempts")
        .insert(logRow as any) as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        LOG_TIMEOUT_MS,
        "admin_login_log"
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
        isMissingColumnError(error, "created_at") ||
        isMissingColumnError(error, "ip")
      ) {
        continue;
      }

      console.warn("[AdminLogin] Failed to log attempt:", error);
      return;
    } catch (error) {
      console.warn("[AdminLogin] Unexpected log attempt error:", error);
      return;
    }
  }
}

// ============================================================
// Response helpers
// ============================================================

function jsonResponse(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const res = NextResponse.json(body as any, init);

  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return res;
}

function setSessionCookie(res: NextResponse, token: string): void {
  const domain = env("AUTH_COOKIE_DOMAIN") || undefined;

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    ...(domain ? { domain } : {}),
  });
}

// ============================================================
// Handler
// ============================================================

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);
  const timestamp = new Date().toISOString();

  let email = "";
  let supabase: SupabaseClient | null = null;

  try {
    // 1) Origin check لمنع CSRF الإضافي
    if (!isAllowedOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          error: "origin_not_allowed",
        },
        { status: 403 }
      );
    }

    // 2) حد حجم الجسم
    const contentLength = Number(req.headers.get("content-length") || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "payload_too_large",
        },
        { status: 413 }
      );
    }

    // 3) Rate limit على مستوى IP أولاً
    const ipRate = checkRateLimit(
      `ip:${ip}`,
      RATE_LIMIT_MAX_ATTEMPTS_PER_IP
    );

    if (!ipRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا.",
          retryAfter: ipRate.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipRate.retryAfter || 60),
            "X-RateLimit-Limit": String(ipRate.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 4) Parse JSON
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة الطلب غير صحيحة",
        },
        { status: 400 }
      );
    }

    const record =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};

    email = normalizeEmail(record.email);
    const password =
      typeof record.password === "string" ? record.password : "";

    // 5) Validation
    if (
      !email ||
      !password ||
      email.length > MAX_EMAIL_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH ||
      !isValidEmail(email)
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "البريد الإلكتروني وكلمة المرور مطلوبان وصيغتهما غير صحيحة",
        },
        { status: 400 }
      );
    }

    // 6) Rate limit على مستوى IP + Email
    const emailRate = checkRateLimit(
      `ip:${ip}|email:${email}`,
      RATE_LIMIT_MAX_ATTEMPTS_PER_EMAIL
    );

    if (!emailRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "تم تجاوز عدد المحاولات المسموح لهذا البريد. حاول لاحقًا.",
          retryAfter: emailRate.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailRate.retryAfter || 60),
            "X-RateLimit-Limit": String(emailRate.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 7) Supabase client
    supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[AdminLogin] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        { status: 500 }
      );
    }

    const genericError = "بيانات الدخول غير صحيحة";

    // 8) Fetch admin user
    let fetched: { user: AdminUserRow | null; tableMissing: boolean };

    try {
      fetched = await withTimeout(
        fetchAdminUser(supabase, email),
        DB_TIMEOUT_MS,
        "fetch_admin_user"
      );
    } catch (error) {
      console.error("[AdminLogin] fetch admin timeout/error:", error);

      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "db_error",
        timestamp,
      });

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في الخادم. حاول لاحقًا.",
        },
        { status: 500 }
      );
    }

    if (fetched.tableMissing) {
      console.error("[AdminLogin] admin_users table is missing.");

      return jsonResponse(
        {
          ok: false,
          error: "خطأ في إعدادات الخادم. حاول لاحقًا.",
        },
        { status: 500 }
      );
    }

    const user = fetched.user;

    if (!user) {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "user_not_found",
        timestamp,
      });

      return jsonResponse(
        {
          ok: false,
          error: genericError,
        },
        { status: 401 }
      );
    }

    // 9) Role check
    const role = normalizeRole(user.role) ?? "admin";

    if (role !== "admin") {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "role_not_admin",
        timestamp,
      });

      return jsonResponse(
        {
          ok: false,
          error: genericError,
        },
        { status: 401 }
      );
    }

    // 10) Active check
    if (user.is_active === false) {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "account_disabled",
        timestamp,
      });

      // رسالة موحدة لمنع كشف وجود الحساب
      return jsonResponse(
        {
          ok: false,
          error: genericError,
        },
        { status: 401 }
      );
    }

    // 11) Password verify
    const passwordHash = String(user.password_hash || "").trim();
    const salt =
      typeof user.salt === "string" ? user.salt.trim() : "";

    if (!passwordHash) {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "missing_password_hash",
        timestamp,
      });

      return jsonResponse(
        {
          ok: false,
          error: genericError,
        },
        { status: 401 }
      );
    }

    let validPassword = false;

    try {
      validPassword = await verifyPasswordFlexible(
        password,
        passwordHash,
        salt || null
      );
    } catch (error) {
      console.error("[AdminLogin] password verify error:", error);
      validPassword = false;
    }

    if (!validPassword) {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "wrong_password",
        timestamp,
      });

      return jsonResponse(
        {
          ok: false,
          error: genericError,
        },
        { status: 401 }
      );
    }

    // 12) Best-effort upgrade legacy SHA-256 to PBKDF2
    if (passwordHash.length === 64 && salt) {
      try {
        const upgraded = hashPassword(password);

        const query = supabase
          .from("admin_users")
          .update({
            password_hash: upgraded.hash,
            salt: upgraded.salt,
          })
          .eq("id", user.id) as unknown as PromiseLike<any>;

        await withTimeout(
          query,
          UPGRADE_TIMEOUT_MS,
          "upgrade_password_hash"
        );
      } catch (error) {
        console.warn("[AdminLogin] Failed to upgrade password hash:", error);
      }
    }

    // 13) Create signed session
    const now = Math.floor(Date.now() / 1000);

    const sessionPayload: Record<string, unknown> = {
      userId: String(user.id),
      email: String(user.email || email),
      role,
      iat: now,
      exp: now + SESSION_MAX_AGE,
      jti: randomUUID(),
      v: SESSION_VERSION,
    };

    const rawTokenVersion = user.token_version;

    if (rawTokenVersion !== null && rawTokenVersion !== undefined) {
      const tokenVersion =
        typeof rawTokenVersion === "number"
          ? rawTokenVersion
          : Number(rawTokenVersion);

      if (Number.isFinite(tokenVersion)) {
        sessionPayload.tv = tokenVersion;
      }
    }

    const token = signSession(sessionPayload);

    // 14) Log success
    await logAttempt(supabase, {
      email,
      ip,
      userAgent,
      success: true,
      timestamp,
    });

    // 15) Response + cookie
    const res = jsonResponse(
      {
        ok: true,
        user: {
          id: String(user.id),
          email: String(user.email || email),
          name:
            typeof user.name === "string"
              ? user.name.slice(0, 120)
              : null,
          role,
        },
      },
      { status: 200 }
    );

    setSessionCookie(res, token);

    return res;
  } catch (error) {
    console.error("[AdminLogin] Unexpected error:", error);

    if (supabase) {
      await logAttempt(supabase, {
        email,
        ip,
        userAgent,
        success: false,
        failureReason: "server_error",
        timestamp,
      }).catch(() => null);
    }

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع. حاول لاحقًا.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return jsonResponse(
    {
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