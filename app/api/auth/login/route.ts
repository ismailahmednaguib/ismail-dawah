// app/api/login/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  verifyPassword,
  hashPasswordCombinedAsync,
  setAdminSessionCookies,
  setUserSessionCookies,
  normalizeAuthEmail,
  isValidAuthEmail,
  ADMIN_SESSION_MAX_AGE,
  USER_SESSION_MAX_AGE,
  type Role,
} from "@/lib/auth";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

const MAX_BODY_BYTES = 20_000; // 20KB
const DB_TIMEOUT_MS = 8_000;
const AUDIT_TIMEOUT_MS = 3_000;

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 10;
const MAX_RATE_STORE_SIZE = 2_000;

// ============================================================
// Types
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

type LoginBody = {
  email?: unknown;
  password?: unknown;
  lang?: unknown;
};

type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

// ============================================================
// Global in-memory Rate Limiter
// في الإنتاج مع Serverless يُفضَّل Redis/Upstash
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __loginRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__loginRateLimit ?? new Map<string, RateRecord>();

globalRef.__loginRateLimit = rateLimitStore;

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

function consumeRateLimit(
  ip: string,
  email: string
): {
  limited: boolean;
  retryAfter: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();

  const entries: Array<[string, number]> = [
    [`login-ip:${ip}`, MAX_ATTEMPTS_PER_IP],
    [`login-email:${email.toLowerCase()}`, MAX_ATTEMPTS_PER_EMAIL],
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

function resetEmailRateLimit(email: string): void {
  const key = `login-email:${email.toLowerCase()}`;
  rateLimitStore.delete(key);
}

// ============================================================
// General Helpers
// ============================================================

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

function normalizeLang(value: unknown): "ar" | "en" {
  const lang = String(value || "").trim().toLowerCase();
  return lang === "en" ? "en" : "ar";
}

function getRedirectForRole(role: Role, lang: "ar" | "en"): string {
  const base = lang === "en" ? "/en" : "/ar";

  if (role === "admin") {
    return (
      process.env.NEXT_PUBLIC_ADMIN_HOME_URL?.trim() ||
      `${base}/admin`
    );
  }

  return (
    process.env.NEXT_PUBLIC_USER_HOME_URL?.trim() ||
    `${base}/account`
  );
}

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);

    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

function getStringValue(row: any, keys: string[]): string | null {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getPasswordParts(row: any): {
  hash: string | null;
  salt: string | null;
} {
  const hash = getStringValue(row, [
    "password_hash",
    "password",
    "hashed_password",
    "crypt",
  ]);

  const salt = getStringValue(row, ["salt"]);

  return { hash, salt };
}

function getRowRole(row: any): Role | null {
  const value = getStringValue(row, ["role", "user_role", "type"])?.toLowerCase();

  if (value === "admin" || value === "user") {
    return value;
  }

  return null;
}

function isRowActive(row: any): boolean {
  if (row?.is_active === false || row?.active === false) {
    return false;
  }

  const status = String(row?.status || "").trim().toLowerCase();

  if (
    status === "inactive" ||
    status === "disabled" ||
    status === "banned" ||
    status === "suspended"
  ) {
    return false;
  }

  return true;
}

function getTokenVersion(row: any): number | undefined {
  const raw = row?.token_version ?? row?.auth_version ?? row?.password_version;
  const num = Number(raw);

  return Number.isFinite(num) ? num : undefined;
}

function publicUser(row: any, role: Role): PublicUser {
  return {
    id: String(row?.id ?? ""),
    email: String(row?.email ?? ""),
    name:
      getStringValue(row, ["name", "full_name", "display_name"]) ?? null,
    role,
  };
}

function sessionExtras(row: any): Record<string, unknown> {
  const extras: Record<string, unknown> = {};

  const email = getStringValue(row, ["email"]);
  if (email) {
    extras.email = email;
  }

  const tv = getTokenVersion(row);
  if (typeof tv === "number") {
    extras.tv = tv;
  }

  return extras;
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Origin, Authorization");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (isProduction) {
    res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  }

  return res;
}

function unauthorizedResponse(): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "invalid_credentials",
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      },
      { status: 401 }
    )
  );
}

function inactiveResponse(): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "inactive_account",
        message: "هذا الحساب غير مفعّل. تواصل مع المسؤول.",
      },
      { status: 403 }
    )
  );
}

function serverErrorResponse(message = "حدث خطأ في الخادم. حاول لاحقًا."): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message,
      },
      { status: 500 }
    )
  );
}

function rateLimitedResponse(retryAfter: number): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)),
          "X-RateLimit-Limit": String(MAX_ATTEMPTS_PER_IP),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  );
}

// ============================================================
// Query Helpers
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

async function runQuery(
  builder: any,
  label: string
): Promise<{
  data: any | null;
  error: any | null;
}> {
  try {
    const result = await withTimeout(
      builder as PromiseLike<any>,
      DB_TIMEOUT_MS,
      label
    );

    return {
      data: result?.data ?? null,
      error: result?.error ?? null,
    };
  } catch (error) {
    return {
      data: null,
      error,
    };
  }
}

function getErrorMessage(error: unknown): string {
  return String((error as any)?.message || error || "");
}

function isMissingTableError(error: unknown): boolean {
  const message = getErrorMessage(error);

  return (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message) ||
    /schema/i.test(message)
  );
}

function isMissingColumnError(error: unknown, column: string): boolean {
  const message = getErrorMessage(error);

  return (
    new RegExp(column, "i").test(message) &&
    (/column.*does not exist/i.test(message) ||
      /Could not find the column/i.test(message) ||
      /schema.*does not exist/i.test(message))
  );
}

// ============================================================
// DB Lookup
// ============================================================

async function findRowByEmail(
  client: any,
  table: "admin_users" | "users",
  email: string
): Promise<any | null> {
  const attempts = [
    () => client.from(table).select("*").ilike("email", email).maybeSingle(),
    () => client.from(table).select("*").eq("email", email).maybeSingle(),
  ];

  for (const createBuilder of attempts) {
    const result = await runQuery(createBuilder(), `find_${table}_by_email`);

    if (!result.error) {
      return result.data;
    }

    if (isMissingTableError(result.error)) {
      return null;
    }

    if (isMissingColumnError(result.error, "email")) {
      continue;
    }

    console.error(`[Login] ${table} lookup error:`, result.error);
    return null;
  }

  return null;
}

async function getAdminStatusById(
  client: any,
  userId: string
): Promise<{
  exists: boolean;
  active: boolean;
}> {
  const result = await runQuery(
    client
      .from("admin_users")
      .select("*")
      .eq("id", idForQuery(userId))
      .maybeSingle(),
    "admin_status_by_id"
  );

  if (!result.error) {
    if (!result.data) {
      return { exists: false, active: false };
    }

    return {
      exists: true,
      active: isRowActive(result.data),
    };
  }

  if (isMissingTableError(result.error)) {
    return { exists: false, active: false };
  }

  if (isMissingColumnError(result.error, "id")) {
    return { exists: false, active: false };
  }

  console.warn("[Login] admin_users status check error:", result.error);
  return { exists: false, active: false };
}

// ============================================================
// Password Upgrade (best-effort)
// ============================================================

async function maybeUpgradePassword(
  client: any,
  table: "admin_users" | "users",
  row: any,
  password: string
): Promise<void> {
  try {
    const { hash, salt } = getPasswordParts(row);

    if (!hash) {
      return;
    }

    // لا ترقية إذا كان bcrypt بالفعل
    if (hash.startsWith("$2")) {
      return;
    }

    // نرقّي فقط SHA-256 القديم المملّح، لأنه أضعف
    const isLegacySaltedSha256 = Boolean(salt && hash.length === 64);

    if (!isLegacySaltedSha256) {
      return;
    }

    const newHash = await hashPasswordCombinedAsync(password);
    const id = idForQuery(String(row.id));

    const payloads = [
      { password_hash: newHash, salt: null },
      { password: newHash, salt: null },
      { hashed_password: newHash, salt: null },
      { password_hash: newHash },
      { password: newHash },
      { hashed_password: newHash },
    ];

    for (const payload of payloads) {
      const result = await runQuery(
        client.from(table).update(payload as any).eq("id", id),
        `upgrade_password_${table}`
      );

      if (!result.error) {
        return;
      }

      if (isMissingTableError(result.error)) {
        return;
      }

      if (
        isMissingColumnError(result.error, "password_hash") ||
        isMissingColumnError(result.error, "password") ||
        isMissingColumnError(result.error, "hashed_password") ||
        isMissingColumnError(result.error, "salt")
      ) {
        continue;
      }

      console.warn(`[Login] password upgrade error for ${table}:`, result.error);
      return;
    }
  } catch (error) {
    console.warn("[Login] password upgrade unexpected error:", error);
  }
}

// ============================================================
// Audit Log (best-effort)
// ============================================================

async function logAttempt(
  client: any,
  params: {
    role?: Role | null;
    email: string;
    ip: string;
    userAgent: string;
    success: boolean;
    reason?: string;
  }
): Promise<void> {
  if (!client) {
    return;
  }

  const rows = [
    {
      role: params.role ?? null,
      email: params.email,
      ip: params.ip,
      user_agent: params.userAgent,
      success: params.success,
      failure_reason: params.reason ?? null,
      created_at: new Date().toISOString(),
    },
    {
      role: params.role ?? null,
      email: params.email,
      ip: params.ip,
      success: params.success,
      failure_reason: params.reason ?? null,
      created_at: new Date().toISOString(),
    },
    {
      email: params.email,
      success: params.success,
      failure_reason: params.reason ?? null,
      created_at: new Date().toISOString(),
    },
    {
      email: params.email,
      success: params.success,
    },
  ];

  for (const row of rows) {
    try {
      const result = await withTimeout(
        client.from("auth_login_attempts").insert(row) as PromiseLike<any>,
        AUDIT_TIMEOUT_MS,
        "login_audit"
      );

      const error = (result as any)?.error;

      if (!error) {
        return;
      }

      if (isMissingTableError(error)) {
        return;
      }

      if (
        isMissingColumnError(error, "role") ||
        isMissingColumnError(error, "ip") ||
        isMissingColumnError(error, "user_agent") ||
        isMissingColumnError(error, "failure_reason") ||
        isMissingColumnError(error, "created_at")
      ) {
        continue;
      }

      console.warn("[Login] audit log error:", error);
      return;
    } catch (error) {
      console.warn("[Login] audit log unexpected error:", error);
      return;
    }
  }
}

// ============================================================
// Body Parser
// ============================================================

async function readLoginBody(req: NextRequest): Promise<LoginBody | null> {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();

  try {
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();

      return {
        email: formData.get("email"),
        password: formData.get("password"),
        lang: formData.get("lang"),
      };
    }

    return (await req.json()) as LoginBody;
  } catch {
    try {
      const formData = await req.formData();

      return {
        email: formData.get("email"),
        password: formData.get("password"),
        lang: formData.get("lang"),
      };
    } catch {
      return null;
    }
  }
}

// ============================================================
// POST /api/login
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) Body size guard
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: false,
            error: "payload_too_large",
            message: "الطلب كبير جدًا.",
          },
          { status: 413 }
        )
      );
    }

    // 2) Read body
    const body = await readLoginBody(req);

    if (!body) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: false,
            error: "bad_request",
            message: "صيغة الطلب غير صحيحة.",
          },
          { status: 400 }
        )
      );
    }

    const email = normalizeAuthEmail(body.email);
    const password =
      typeof body.password === "string" ? body.password : "";

    const lang = normalizeLang(
      body.lang ||
        req.nextUrl.searchParams.get("lang") ||
        req.cookies.get("NEXT_LOCALE")?.value ||
        req.headers.get("x-language")
    );

    // 3) Basic validation
    if (!email || !password) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: false,
            error: "missing_credentials",
            message: "البريد الإلكتروني وكلمة المرور مطلوبان.",
          },
          { status: 400 }
        )
      );
    }

    if (!isValidAuthEmail(email)) {
      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: false,
            error: "invalid_email",
            message: "صيغة البريد الإلكتروني غير صحيحة.",
          },
          { status: 400 }
        )
      );
    }

    // 4) Rate limit
    const rate = consumeRateLimit(ip, email);

    if (rate.limited) {
      await logAttempt(null, {
        email,
        ip,
        userAgent,
        success: false,
        reason: "rate_limited",
      });

      return rateLimitedResponse(rate.retryAfter);
    }

    // 5) Supabase client
    let client: any;

    try {
      client = createAdminClient();
    } catch (error) {
      console.error("[Login] Supabase client error:", error);
      return serverErrorResponse("الإعدادات الخادمية غير مكتملة.");
    }

    // ========================================================
    // First: Admin from admin_users
    // ========================================================

    const adminRow = await findRowByEmail(client, "admin_users", email);

    if (adminRow) {
      if (!isRowActive(adminRow)) {
        await logAttempt(client, {
          role: "admin",
          email,
          ip,
          userAgent,
          success: false,
          reason: "account_disabled",
        });

        return inactiveResponse();
      }

      const { hash, salt } = getPasswordParts(adminRow);

      const passwordOk = await verifyPassword(
        password,
        hash || "",
        salt ?? undefined
      );

      if (!passwordOk) {
        await logAttempt(client, {
          role: "admin",
          email,
          ip,
          userAgent,
          success: false,
          reason: "wrong_password",
        });

        return unauthorizedResponse();
      }

      await maybeUpgradePassword(client, "admin_users", adminRow, password);

      resetEmailRateLimit(email);

      await logAttempt(client, {
        role: "admin",
        email,
        ip,
        userAgent,
        success: true,
      });

      const res = NextResponse.json({
        ok: true,
        role: "admin",
        redirect: getRedirectForRole("admin", lang),
        user: publicUser(adminRow, "admin"),
      });

      try {
        setAdminSessionCookies(res, String(adminRow.id), sessionExtras(adminRow));
      } catch (error) {
        console.error("[Login] set admin cookies error:", error);
        return serverErrorResponse("تعذر إنشاء جلسة الأدمن.");
      }

      return withSecurityHeaders(res);
    }

    // ========================================================
    // Second: User from users
    // ========================================================

    const userRow = await findRowByEmail(client, "users", email);

    if (!userRow) {
      await logAttempt(client, {
        role: "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "user_not_found",
      });

      return unauthorizedResponse();
    }

    if (!isRowActive(userRow)) {
      await logAttempt(client, {
        role: getRowRole(userRow) ?? "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "account_disabled",
      });

      return inactiveResponse();
    }

    const { hash, salt } = getPasswordParts(userRow);

    const passwordOk = await verifyPassword(
      password,
      hash || "",
      salt ?? undefined
    );

    if (!passwordOk) {
      await logAttempt(client, {
        role: getRowRole(userRow) ?? "user",
        email,
        ip,
        userAgent,
        success: false,
        reason: "wrong_password",
      });

      return unauthorizedResponse();
    }

    let role: Role = getRowRole(userRow) ?? "user";

    // If users.role says admin, verify admin_users status if table exists
    if (role === "admin") {
      const adminStatus = await getAdminStatusById(client, String(userRow.id));

      if (adminStatus.exists && !adminStatus.active) {
        await logAttempt(client, {
          role: "admin",
          email,
          ip,
          userAgent,
          success: false,
          reason: "admin_disabled",
        });

        return inactiveResponse();
      }
    }

    await maybeUpgradePassword(client, "users", userRow, password);

    resetEmailRateLimit(email);

    await logAttempt(client, {
      role,
      email,
      ip,
      userAgent,
      success: true,
    });

    const res = NextResponse.json({
      ok: true,
      role,
      redirect: getRedirectForRole(role, lang),
      user: publicUser(userRow, role),
    });

    try {
      if (role === "admin") {
        setAdminSessionCookies(res, String(userRow.id), sessionExtras(userRow));
      } else {
        setUserSessionCookies(res, String(userRow.id), sessionExtras(userRow));
      }
    } catch (error) {
      console.error("[Login] set cookies error:", error);
      return serverErrorResponse("تعذر إنشاء جلسة المستخدم.");
    }

    return withSecurityHeaders(res);
  } catch (error) {
    console.error("[Login] unexpected error:", error);

    await logAttempt(null, {
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
  return withSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        error: "method_not_allowed",
        message: "Method not allowed",
      },
      {
        status: 405,
        headers: {
          Allow: "POST",
        },
      }
    )
  );
}