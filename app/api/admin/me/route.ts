// app/api/admin/me/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAdminFromCookie } from "@/lib/auth";
import { createHmac, timingSafeEqual } from "node:crypto";

// ============================================================
// Types
// ============================================================

type SessionPayload = {
  userId?: string;
  email?: string | null;
  role?: string;
  iat?: number;
  exp?: number;
  jti?: string;
  v?: number;
  tv?: number | null;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
};

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: "admin";
};

type AdminRow = Record<string, any>;

type FetchAdminResult = {
  user: AdminRow | null;
  tableMissing: boolean;
};

// ============================================================
// Configuration
// ============================================================

const COOKIE_NAME = "admin_session";

const MAX_TOKEN_LENGTH = 8192;
const MAX_USER_ID_LENGTH = 255;
const CLOCK_SKEW_SECONDS = 30;
const MIN_SECRET_LENGTH = 32;

const SESSION_ALG = "HS256";
const SESSION_TYP = "session";
const EXPECTED_SESSION_VERSION = 1;

const DB_TIMEOUT_MS = 8000;

// السماح باستخدام الجلسات القديمة فقط عند الحاجة للانتقال التدريجي.
// في الإنتاج يُفضَّل تركه false.
const ALLOW_LEGACY_ADMIN_SESSION =
  process.env.ALLOW_LEGACY_ADMIN_SESSION === "true";

// ============================================================
// Env helpers
// ============================================================

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

function getSessionSecret(): string | null {
  const secret =
    env("ADMIN_SESSION_SECRET") ||
    env("APP_SESSION_SECRET") ||
    env("JWT_SECRET");

  if (!secret) {
    return null;
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    console.warn(
      `[AdminMe] Weak session secret detected. Use at least ${MIN_SECRET_LENGTH} characters.`
    );
  }

  return secret;
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

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
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

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);

    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

// ============================================================
// Signed session verification
// ============================================================

function parseSignedAdminSession(
  token: string | null | undefined,
  secret: string
): SessionPayload | null {
  if (!token || token.length > MAX_TOKEN_LENGTH) {
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
    const expectedSignature = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (!safeEqualStrings(signature, expectedSignature)) {
      return null;
    }

    const headerJson = JSON.parse(
      Buffer.from(header, "base64url").toString("utf8")
    ) as Record<string, unknown>;

    if (
      headerJson?.alg !== SESSION_ALG ||
      headerJson?.typ !== SESSION_TYP
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const userId =
      typeof payload.userId === "string" ? payload.userId.trim() : "";

    if (!userId || userId.length > MAX_USER_ID_LENGTH) {
      return null;
    }

    const role = normalizeRole(payload.role);

    if (role !== "admin") {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    // الجلسة الموقّعة يجب أن تحمل exp صالحًا.
    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    // رفض التوكن الصادر في المستقبل بأكثر من سماحية زمنية.
    if (
      typeof payload.iat === "number" &&
      Number.isFinite(payload.iat) &&
      payload.iat > now + CLOCK_SKEW_SECONDS
    ) {
      return null;
    }

    // فحص نسخة التوكن إذا وُجدت.
    if (payload.v !== undefined && payload.v !== null) {
      const version = Number(payload.v);

      if (!Number.isFinite(version) || version !== EXPECTED_SESSION_VERSION) {
        return null;
      }
    }

    // فحص issuer وaudience اختياريًا.
    const configuredIssuer = env("SESSION_ISSUER");
    if (configuredIssuer && payload.iss !== configuredIssuer) {
      return null;
    }

    const configuredAudience = env("SESSION_AUDIENCE");
    if (configuredAudience && payload.aud !== configuredAudience) {
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

// ============================================================
// Legacy session fallback
// ============================================================

async function resolveLegacyAdminId(
  req: NextRequest
): Promise<string | null> {
  if (!ALLOW_LEGACY_ADMIN_SESSION) {
    return null;
  }

  try {
    // نتعامل مع getAdminFromCookie بمرونة لأنه قد يرجع:
    // - string userId
    // - UserProfile فيه id
    // - null
    const result: unknown = await (getAdminFromCookie as any)(
      req.headers.get("cookie")
    );

    if (!result) {
      return null;
    }

    if (typeof result === "string") {
      return result.trim() || null;
    }

    if (typeof result === "object") {
      const obj = result as Record<string, unknown>;

      const id =
        typeof obj.id === "string"
          ? obj.id
          : typeof obj.userId === "string"
          ? obj.userId
          : "";

      return id.trim() || null;
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================
// Supabase helpers
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

function getTokenVersion(row: AdminRow | null): number | null {
  const raw =
    row?.token_version ?? row?.auth_version ?? row?.password_version ?? null;

  const num = Number(raw);

  return Number.isFinite(num) ? num : null;
}

function createSupabaseClient(): SupabaseClient | null {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");

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
  userId: string
): Promise<FetchAdminResult> {
  const queryId = idForQuery(userId);

  const selects = [
    "id,email,name,role,is_active,token_version",
    "id,email,name,role,is_active,auth_version",
    "id,email,name,role,is_active",
    "id,email,name,role",
    "id,email,role,is_active",
    "id,email,role",
    "id,email,name",
    "id,email",
  ];

  for (const select of selects) {
    try {
      const result = (await supabase
        .from("admin_users")
        .select(select)
        .eq("id", queryId)
        .maybeSingle()) as { data: AdminRow | null; error: any };

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
        isMissingColumnError(result.error, "auth_version") ||
        isMissingColumnError(result.error, "password_version") ||
        isMissingColumnError(result.error, "is_active") ||
        isMissingColumnError(result.error, "role") ||
        isMissingColumnError(result.error, "name")
      ) {
        continue;
      }

      console.error("[AdminMe] fetchAdminUser error:", result.error);

      return {
        user: null,
        tableMissing: false,
      };
    } catch (error) {
      console.error("[AdminMe] fetchAdminUser exception:", error);

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

  return res;
}

function adminUserResponse(user: AdminUser | null): NextResponse {
  return setSecurityHeaders(NextResponse.json({ user }));
}

function methodNotAllowed(): NextResponse {
  const res = NextResponse.json(
    { user: null, error: "Method not allowed" },
    { status: 405 }
  );

  res.headers.set("Allow", "GET");

  return setSecurityHeaders(res);
}

// ============================================================
// Main handler
// ============================================================

async function handleMe(req: NextRequest): Promise<NextResponse> {
  try {
    const secret = getSessionSecret();

    if (!secret) {
      console.error(
        "[AdminMe] Missing ADMIN_SESSION_SECRET / APP_SESSION_SECRET / JWT_SECRET."
      );

      return adminUserResponse(null);
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    let payload = token ? parseSignedAdminSession(token, secret) : null;

    // fallback اختياري للجلسات القديمة فقط إذا فعّلته صراحةً.
    if (!payload) {
      const legacyUserId = await resolveLegacyAdminId(req);

      if (legacyUserId) {
        payload = {
          userId: legacyUserId,
          role: "admin",
        };
      }
    }

    if (!payload?.userId || normalizeRole(payload.role) !== "admin") {
      return adminUserResponse(null);
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[AdminMe] Supabase is not configured.");

      return adminUserResponse(null);
    }

    let fetched: FetchAdminResult;

    try {
      fetched = await withTimeout(
        fetchAdminUser(supabase, payload.userId),
        DB_TIMEOUT_MS,
        "admin_me_fetch"
      );
    } catch (error) {
      console.error("[AdminMe] fetch timeout/error:", error);

      return adminUserResponse(null);
    }

    if (fetched.tableMissing) {
      console.error("[AdminMe] admin_users table is missing.");

      return adminUserResponse(null);
    }

    const data = fetched.user;

    if (!data) {
      return adminUserResponse(null);
    }

    // إذا وجد عمود role، يجب أن يكون admin.
    // إذا لم يكن العمود موجودًا، نفترض أن جدول admin_users مخصص للأدمن فقط.
    const dbRole = normalizeRole(data.role);

    if (dbRole && dbRole !== "admin") {
      return adminUserResponse(null);
    }

    // إذا وجد عمود is_active وكان false، نرفض الجلسة.
    if (data.is_active === false) {
      return adminUserResponse(null);
    }

    // دعم إبطال الجلسات عبر token_version / auth_version.
    const dbTokenVersion = getTokenVersion(data);
    const rawPayloadTokenVersion = payload.tv;

    if (
      dbTokenVersion !== null &&
      rawPayloadTokenVersion !== undefined &&
      rawPayloadTokenVersion !== null
    ) {
      const payloadTokenVersion = Number(rawPayloadTokenVersion);

      if (
        Number.isFinite(payloadTokenVersion) &&
        payloadTokenVersion !== dbTokenVersion
      ) {
        return adminUserResponse(null);
      }
    }

    const user: AdminUser = {
      id: String(data.id ?? payload.userId),
      email: String(data.email ?? payload.email ?? ""),
      name: typeof data.name === "string" ? data.name : null,
      role: "admin",
    };

    return adminUserResponse(user);
  } catch (error) {
    console.error("[AdminMe] Unexpected error:", error);

    return adminUserResponse(null);
  }
}

// ============================================================
// Route handlers
// ============================================================

export async function GET(req: NextRequest) {
  return handleMe(req);
}

export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}