// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

// مدة جلسة الأدمن بالثواني — افتراضيًا 8 ساعات
const ADMIN_SESSION_MAX_AGE = Number(
  process.env.ADMIN_SESSION_MAX_AGE || 8 * 60 * 60
);

// مدة جلسة المستخدم العادي بالثواني — افتراضيًا 30 يوم
const USER_SESSION_MAX_AGE = Number(
  process.env.USER_SESSION_MAX_AGE || 30 * 24 * 60 * 60
);

const MAX_BODY_BYTES = 20_000; // 20KB

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 دقيقة
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 10;

type Role = "admin" | "user";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type RowResult<T = Record<string, any>> = {
  data: T | null;
  error: any | null;
};

// ============================================================
// In-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يُفضَّل استخدام Redis/Upstash
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateRecord>();

function cleanupRateLimitStore() {
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
    [`ip:${ip}`, MAX_ATTEMPTS_PER_IP],
    [`email:${email.toLowerCase()}`, MAX_ATTEMPTS_PER_EMAIL],
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

function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getSecretForRole(role: Role): string {
  const appSecret = process.env.APP_SESSION_SECRET;
  const jwtSecret = process.env.JWT_SECRET;

  if (role === "admin") {
    return (
      process.env.ADMIN_SESSION_SECRET ||
      appSecret ||
      jwtSecret ||
      ""
    );
  }

  return (
    process.env.USER_SESSION_SECRET ||
    appSecret ||
    jwtSecret ||
    ""
  );
}

function signSession(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "session" })
  ).toString("base64url");

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

async function verifyPasswordFlexible(
  password: string,
  storedHash?: string | null,
  storedSalt?: string | null
): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  // 1) bcrypt — الأفضل والأحدث
  if (storedHash.startsWith("$2")) {
    try {
      const bcryptModule: any = await import("bcryptjs");
      const bcrypt = bcryptModule.default ?? bcryptModule;

      if (typeof bcrypt.compare === "function") {
        return await bcrypt.compare(password, storedHash);
      }
    } catch {
      return false;
    }
  }

  // 2) fallback متوافق مع النظام القديم: SHA-256 + salt
  if (storedSalt) {
    try {
      const computed = crypto
        .createHash("sha256")
        .update(password + storedSalt)
        .digest("hex");

      if (computed.length !== storedHash.length) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(computed, "hex"),
        Buffer.from(storedHash, "hex")
      );
    } catch {
      return false;
    }
  }

  return false;
}

async function maybeUpgradePassword(
  supabase: any,
  table: "admin_users" | "users",
  userId: string,
  password: string,
  currentHash?: string | null
): Promise<void> {
  // لو Hash بالفعل bcrypt، لا حاجة للترقية
  if (!currentHash || currentHash.startsWith("$2")) {
    return;
  }

  try {
    const bcryptModule: any = await import("bcryptjs");
    const bcrypt = bcryptModule.default ?? bcryptModule;

    if (typeof bcrypt.hash !== "function") {
      return;
    }

    const newHash = await bcrypt.hash(password, 12);

    await supabase
      .from(table)
      .update({
        password_hash: newHash,
        salt: null,
      })
      .eq("id", userId);
  } catch {
    // فشل الترقية لا يجب أن يكسر تسجيل الدخول
  }
}

async function logAttempt(params: {
  role?: Role | null;
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
  reason?: string;
}): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return;
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });

    await supabase.from("auth_login_attempts").insert({
      role: params.role ?? null,
      email: params.email,
      ip: params.ip,
      user_agent: params.userAgent,
      success: params.success,
      failure_reason: params.reason ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Login] Failed to write audit log:", error);
  }
}

async function fetchAdminByEmail(
  supabase: any,
  email: string
): Promise<RowResult> {
  // حاول أولًا مع is_active
  const first = await supabase
    .from("admin_users")
    .select("id, email, name, password_hash, salt, is_active")
    .eq("email", email)
    .maybeSingle();

  if (!first.error) {
    return { data: first.data, error: null };
  }

  const message = String(first.error?.message || "");

  // لو عمود is_active غير موجود، أعد المحاولة بدونه
  if (/is_active/i.test(message)) {
    const second = await supabase
      .from("admin_users")
      .select("id, email, name, password_hash, salt")
      .eq("email", email)
      .maybeSingle();

    if (!second.error) {
      return { data: second.data, error: null };
    }

    return { data: null, error: second.error };
  }

  // لو جدول admin_users غير موجود، نكمل كأنه لا يوجد أدمن بهذا الإيميل
  if (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message)
  ) {
    return { data: null, error: null };
  }

  return { data: null, error: first.error };
}

function setAuthCookie(
  res: NextResponse,
  name: string,
  value: string,
  maxAge: number,
  sameSite: "strict" | "lax" = "lax"
): void {
  res.cookies.set(name, value, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? sameSite : "lax",
    maxAge,
    path: "/",
  });
}

function publicUser(row: Record<string, any>, role: Role) {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? null,
    role,
  };
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    },
    { status: 401 }
  );
}

function serverErrorResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "خطأ في الخادم. حاول لاحقًا.",
    },
    { status: 500 }
  );
}

// ============================================================
// POST /api/login
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
      return NextResponse.json(
        {
          ok: false,
          error: "الطلب كبير جدًا",
        },
        { status: 413 }
      );
    }

    // 2) قراءة الـ body
    let body: LoginBody;

    try {
      body = (await req.json()) as LoginBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "صيغة الطلب غير صحيحة",
        },
        { status: 400 }
      );
    }

    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    // 3) تحقق أساسي
    if (!email || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: "البريد الإلكتروني وكلمة المرور مطلوبان",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "صيغة البريد الإلكتروني غير صحيحة",
        },
        { status: 400 }
      );
    }

    // 4) Rate Limiting
    const rate = consumeRateLimit(ip, email);

    if (rate.limited) {
      await logAttempt({
        email,
        ip,
        userAgent,
        success: false,
        reason: "rate_limited",
      });

      return NextResponse.json(
        {
          ok: false,
          error: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
          retryAfter: rate.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter || 900),
          },
        }
      );
    }

    // 5) Supabase config
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Login] Supabase is not configured.");
      return serverErrorResponse();
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // ========================================================
    // أولًا: محاولة الأدمن من admin_users
    // ========================================================

    const adminResult = await fetchAdminByEmail(supabase, email);

    if (adminResult.error) {
      console.error("[Login] Admin lookup error:", adminResult.error);

      await logAttempt({
        role: "admin",
        email,
        ip,
        userAgent,
        success: false,
        reason: "admin_db_error",
      });

      return serverErrorResponse();
    }

    if (adminResult.data) {
      const adminUser = adminResult.data;

      const validPassword = await verifyPasswordFlexible(
        password,
        adminUser.password_hash,
        adminUser.salt
      );

      if (!validPassword) {
        await logAttempt({
          role: "admin",
          email,
          ip,
          userAgent,
          success: false,
          reason: "wrong_password",
        });

        return unauthorizedResponse();
      }

      if (adminUser.is_active === false) {
        await logAttempt({
          role: "admin",
          email,
          ip,
          userAgent,
          success: false,
          reason: "account_disabled",
        });

        return NextResponse.json(
          {
            ok: false,
            error: "هذا الحساب غير مفعّل. تواصل مع المسؤول.",
          },
          { status: 403 }
        );
      }

      const adminSecret = getSecretForRole("admin");

      if (!adminSecret) {
        console.error("[Login] Missing ADMIN_SESSION_SECRET.");
        return serverErrorResponse();
      }

      const now = Math.floor(Date.now() / 1000);

      const adminPayload = {
        userId: adminUser.id,
        email: adminUser.email,
        role: "admin",
        ip,
        userAgent: userAgent.slice(0, 200),
        iat: now,
        exp: now + ADMIN_SESSION_MAX_AGE,
        jti: crypto.randomUUID(),
      };

      const adminToken = signSession(adminPayload, adminSecret);

      // أيضًا نشغّل user_session للأدمن حتى تتوافق مع endpoints القديمة
      const userSecret = getSecretForRole("user") || adminSecret;

      const userPayloadForAdmin = {
        ...adminPayload,
        role: "admin",
      };

      const userTokenForAdmin = signSession(
        userPayloadForAdmin,
        userSecret
      );

      await maybeUpgradePassword(
        supabase,
        "admin_users",
        adminUser.id,
        password,
        adminUser.password_hash
      );

      await logAttempt({
        role: "admin",
        email,
        ip,
        userAgent,
        success: true,
      });

      const res = NextResponse.json({
        ok: true,
        user: publicUser(adminUser, "admin"),
      });

      setAuthCookie(
        res,
        "admin_session",
        adminToken,
        ADMIN_SESSION_MAX_AGE,
        "strict"
      );

      setAuthCookie(
        res,
        "user_session",
        userTokenForAdmin,
        ADMIN_SESSION_MAX_AGE,
        "lax"
      );

      res.headers.set("Cache-Control", "no-store");
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("X-Frame-Options", "DENY");

      return res;
    }

    // ========================================================
    // ثانيًا: محاولة المستخدم العادي من users
    // ========================================================

    const userResult = await supabase
      .from("users")
      .select("id, email, name, password_hash, salt")
      .eq("email", email)
      .maybeSingle();

    if (userResult.error) {
      console.error("[Login] User lookup error:", userResult.error);

      await logAttempt({
        role: "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "user_db_error",
      });

      return serverErrorResponse();
    }

    if (!userResult.data) {
      await logAttempt({
        role: "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "user_not_found",
      });

      // رسالة موحدة حتى لا نكشف إذا كان الإيميل موجودًا أم لا
      return unauthorizedResponse();
    }

    const regularUser = userResult.data;

    const validPassword = await verifyPasswordFlexible(
      password,
      regularUser.password_hash,
      regularUser.salt
    );

    if (!validPassword) {
      await logAttempt({
        role: "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "wrong_password",
      });

      return unauthorizedResponse();
    }

    const userSecret = getSecretForRole("user");

    if (!userSecret) {
      console.error("[Login] Missing USER_SESSION_SECRET.");
      return serverErrorResponse();
    }

    const now = Math.floor(Date.now() / 1000);

    const userPayload = {
      userId: regularUser.id,
      email: regularUser.email,
      role: "user",
      ip,
      userAgent: userAgent.slice(0, 200),
      iat: now,
      exp: now + USER_SESSION_MAX_AGE,
      jti: crypto.randomUUID(),
    };

    const userToken = signSession(userPayload, userSecret);

    await maybeUpgradePassword(
      supabase,
      "users",
      regularUser.id,
      password,
      regularUser.password_hash
    );

    await logAttempt({
      role: "user",
      email,
      ip,
      userAgent,
      success: true,
    });

    const res = NextResponse.json({
      ok: true,
      user: publicUser(regularUser, "user"),
    });

    setAuthCookie(res, "user_session", userToken, USER_SESSION_MAX_AGE, "lax");

    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");

    return res;
  } catch (error) {
    console.error("[Login] Unexpected error:", error);

    await logAttempt({
      email: "unknown",
      ip,
      userAgent,
      success: false,
      reason: "unexpected_error",
    });

    return serverErrorResponse();
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