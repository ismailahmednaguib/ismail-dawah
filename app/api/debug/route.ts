// app/api/debug/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

/**
 * Debug endpoint يجب أن يكون معطلًا في الإنتاج افتراضيًا.
 *
 * في التطوير: يعمل إلا إذا ضبطت DEBUG_ENABLED=false
 * في الإنتاج: لا يعمل إلا إذا ضبطت DEBUG_ENABLED=true
 */
const DEBUG_ENABLED = isProduction
  ? env("DEBUG_ENABLED") === "true"
  : env("DEBUG_ENABLED") !== "false";

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة Base64.
 *
 * ⚠️ لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 */
const ALLOW_LEGACY_SESSIONS = env("ALLOW_LEGACY_SESSIONS") === "true";

/**
 * السماح مؤقتًا باستخدام x-admin-key القديم.
 *
 * ⚠️ التوصية: اجعله false واعتمد على admin_session.
 */
const ALLOW_LEGACY_ADMIN_KEY = env("DEBUG_ALLOW_ADMIN_KEY") === "true";

/**
 * عرض تفاصيل أكثر للأدمن فقط.
 * حتى مع VERBOSE=true لن يتم كشف قيم المتغيرات السرية.
 */
const VERBOSE = env("DEBUG_VERBOSE") === "true";

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_IP = 10;
const MAX_RATE_STORE_SIZE = 2_000;

const DB_TIMEOUT_MS = 3_000;
const LOG_TIMEOUT_MS = 2_000;

const KNOWN_BUCKETS = ["uploads", "media", "content", "assets", "images"];

// ============================================================
// Types
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

type SessionCandidate = {
  userId: string;
  role: string;
  email?: string | null;
  source: "signed_session" | "legacy_session";
};

type AuthResult =
  | {
      ok: true;
      method: "signed_session" | "legacy_session" | "admin_key";
      userId: string | null;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

// ============================================================
// Global in-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __debugRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__debugRateLimit ?? new Map<string, RateRecord>();

globalRef.__debugRateLimit = rateLimitStore;

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

function checkRateLimit(ip: string): boolean {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `debug:${ip}`;
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
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function getUserAgent(req: NextRequest): string {
  return (req.headers.get("user-agent") || "unknown").slice(0, 500);
}

function safeEqual(a: string, b: string): boolean {
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

function getAdminSecret(): string {
  return (
    env("ADMIN_SESSION_SECRET") ||
    env("APP_SESSION_SECRET") ||
    env("JWT_SECRET")
  );
}

function getUserSecret(): string {
  return (
    env("USER_SESSION_SECRET") ||
    env("APP_SESSION_SECRET") ||
    env("JWT_SECRET")
  );
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

function jsonResponse(body: unknown, status = 200): NextResponse {
  const res = NextResponse.json(body as any, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Authorization");
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
// Session Verification
// ============================================================

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: string[]
): SessionCandidate | null {
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
    const expectedSignature = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const headerJson = JSON.parse(
      Buffer.from(header, "base64url").toString("utf8")
    ) as Record<string, unknown>;

    if (headerJson?.alg !== "HS256") {
      return null;
    }

    if (headerJson?.typ && headerJson.typ !== "session") {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Record<string, unknown>;

    const role = String(payload.role ?? payload.type ?? "")
      .trim()
      .toLowerCase();

    const userId = normalizeUserId(payload.userId);

    if (!userId || !expectedRoles.includes(role)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = Number(payload.exp);

    if (!Number.isFinite(exp) || exp <= now) {
      return null;
    }

    const iat = Number(payload.iat);

    if (Number.isFinite(iat) && iat > now + 60) {
      return null;
    }

    return {
      userId,
      role,
      email: typeof payload.email === "string" ? payload.email : null,
      source: "signed_session",
    };
  } catch {
    return null;
  }
}

function parseLegacySession(
  token: string | undefined | null
): SessionCandidate | null {
  if (!ALLOW_LEGACY_SESSIONS || !token) {
    return null;
  }

  // الجلسات الموقّعة تحتوي نقاط. إذا وجدت نقاط فهي ليست legacy.
  if (token.includes(".")) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as Record<string, unknown>;

    const role = String(payload.role ?? payload.type ?? "")
      .trim()
      .toLowerCase();

    const userId = normalizeUserId(payload.userId);

    if (!userId || role !== "admin") {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = Number(payload.exp);

    if (Number.isFinite(exp) && exp <= now) {
      return null;
    }

    return {
      userId,
      role,
      email: typeof payload.email === "string" ? payload.email : null,
      source: "legacy_session",
    };
  } catch {
    return null;
  }
}

function findAdminSession(req: NextRequest): SessionCandidate | null {
  const adminToken = req.cookies.get("admin_session")?.value;
  const userToken = req.cookies.get("user_session")?.value;
  const sessionToken = req.cookies.get("session")?.value;

  const adminSecret = getAdminSecret();
  const userSecret = getUserSecret();

  const signed =
    parseSignedSession(adminToken, adminSecret, ["admin"]) ||
    parseSignedSession(userToken, userSecret, ["admin"]) ||
    parseSignedSession(sessionToken, adminSecret, ["admin"]) ||
    parseSignedSession(sessionToken, userSecret, ["admin"]);

  if (signed) {
    return signed;
  }

  const legacy =
    parseLegacySession(adminToken) ||
    parseLegacySession(userToken) ||
    parseLegacySession(sessionToken);

  if (legacy) {
    return legacy;
  }

  return null;
}

function authorizedByAdminKey(req: NextRequest): boolean {
  if (!ALLOW_LEGACY_ADMIN_KEY) {
    return false;
  }

  const key = req.headers.get("x-admin-key");
  const expected = env("ADMIN_KEY");

  if (!key || !expected) {
    return false;
  }

  return safeEqual(key, expected);
}

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const candidate = findAdminSession(req);

  if (candidate) {
    return {
      ok: true,
      method: candidate.source,
      userId: candidate.userId,
    };
  }

  if (authorizedByAdminKey(req)) {
    return {
      ok: true,
      method: "admin_key",
      userId: null,
    };
  }

  return {
    ok: false,
    status: 401,
    error: "غير مصرح لك بعرض الـ debug. سجّل دخول الآدمن أولًا.",
  };
}

// ============================================================
// Optional Audit Log
// ============================================================

async function logDebugAccess(
  supabase: SupabaseClient | null,
  params: {
    userId: string | null;
    method: string;
    ip: string;
    userAgent: string;
    status: string;
  }
): Promise<void> {
  if (!supabase) {
    return;
  }

  const adminId = params.userId;
  const authMethod = params.method.slice(0, 50);
  const ip = params.ip.slice(0, 100);
  const userAgent = params.userAgent.slice(0, 500);
  const status = params.status.slice(0, 50);
  const createdAt = new Date().toISOString();

  const rows: Record<string, unknown>[] = [
    {
      admin_id: adminId,
      auth_method: authMethod,
      ip,
      user_agent: userAgent,
      status,
      created_at: createdAt,
    },
    {
      admin_id: adminId,
      auth_method: authMethod,
      ip,
      user_agent: userAgent,
      status,
    },
    {
      admin_id: adminId,
      auth_method: authMethod,
      ip,
      status,
      created_at: createdAt,
    },
    {
      admin_id: adminId,
      auth_method: authMethod,
      status,
    },
    {
      status,
    },
  ];

  for (const row of rows) {
    try {
      const query = supabase
        .from("admin_debug_access")
        .insert(row) as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        LOG_TIMEOUT_MS,
        "debug_audit"
      );

      const error = (result as any)?.error;

      if (!error) {
        return;
      }

      if (isMissingTableError(error)) {
        return;
      }

      if (
        isMissingColumnError(error, "admin_id") ||
        isMissingColumnError(error, "auth_method") ||
        isMissingColumnError(error, "user_agent") ||
        isMissingColumnError(error, "ip") ||
        isMissingColumnError(error, "status") ||
        isMissingColumnError(error, "created_at")
      ) {
        continue;
      }

      console.warn("[Debug] Failed to write audit log:", error);
      return;
    } catch (error) {
      console.warn("[Debug] Unexpected audit log error:", error);
      return;
    }
  }
}

// ============================================================
// GET /api/debug
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 0) Debug endpoint must be explicitly enabled in production
    if (!DEBUG_ENABLED) {
      return jsonResponse(
        {
          ok: false,
          error: "debug_disabled",
        },
        404
      );
    }

    // 1) Rate Limiting
    if (!checkRateLimit(ip)) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد المحاولات كثير جدًا. حاول لاحقًا.",
        },
        429
      );
    }

    // 2) Authentication
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

    // 3) Build safe report
    const envChecks = {
      supabase_url: Boolean(env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL")),
      supabase_service_key: Boolean(
        env("SUPABASE_SERVICE_KEY") || env("SUPABASE_SERVICE_ROLE_KEY")
      ),
      admin_session_secret: Boolean(getAdminSecret()),
      user_session_secret: Boolean(getUserSecret()),
      admin_key: Boolean(env("ADMIN_KEY")),
      debug_enabled: true,
      verbose: VERBOSE,
      legacy_sessions_allowed: ALLOW_LEGACY_SESSIONS,
      legacy_admin_key_allowed: ALLOW_LEGACY_ADMIN_KEY,
    };

    const report: Record<string, any> = {
      ok: true,
      status: "checking",
      timestamp: new Date().toISOString(),
      auth: {
        authorized: true,
        method: auth.method,
        user_id: auth.userId,
      },
      checks: {
        env: envChecks,
        database: {
          configured:
            envChecks.supabase_url && envChecks.supabase_service_key,
          site_content_readable: null,
          row_found: null,
        },
        storage: {
          checked: false,
          listable: null,
          bucket_count: null,
          known_buckets: Object.fromEntries(
            KNOWN_BUCKETS.map((bucket) => [bucket, false])
          ),
        },
        write_test: {
          enabled: false,
          reason: "read_only_debug",
        },
      },
    };

    let degraded =
      !envChecks.supabase_url || !envChecks.supabase_service_key;

    if (!degraded) {
      const supabase = createSupabaseClient();

      if (!supabase) {
        degraded = true;
        report.checks.database.configured = false;
        report.checks.database.error = "client_init_failed";
      } else {
        // 4) Test reading site_content without writing/deleting
        try {
          const query = supabase
            .from("site_content")
            .select("id")
            .limit(1) as unknown as PromiseLike<any>;

          const result = await withTimeout(
            query,
            DB_TIMEOUT_MS,
            "site_content_select"
          );

          const error = (result as any)?.error;

          if (error) {
            degraded = true;
            report.checks.database.site_content_readable = false;
            report.checks.database.error_code = error?.code || null;

            if (VERBOSE) {
              report.checks.database.error_message =
                error?.message || null;
            }
          } else {
            const rows = Array.isArray((result as any)?.data)
              ? (result as any).data
              : [];

            report.checks.database.site_content_readable = true;
            report.checks.database.row_found = rows.length > 0;
          }
        } catch (error) {
          degraded = true;
          report.checks.database.site_content_readable = false;

          if (VERBOSE) {
            report.checks.database.error_message =
              error instanceof Error ? error.message : String(error);
          }
        }

        // 5) Test storage listing, but do not expose all bucket names
        try {
          const query = supabase.storage.listBuckets() as unknown as PromiseLike<any>;

          const result = await withTimeout(
            query,
            DB_TIMEOUT_MS,
            "storage_list_buckets"
          );

          const error = (result as any)?.error;

          report.checks.storage.checked = true;

          if (error) {
            report.checks.storage.listable = false;
            report.checks.storage.error_code = error?.code || null;

            if (VERBOSE) {
              report.checks.storage.error_message =
                error?.message || null;
            }
          } else {
            const buckets = Array.isArray((result as any)?.data)
              ? (result as any).data
              : [];

            const bucketNames = new Set<string>(
              buckets
                .map((bucket: any) => String(bucket?.name || "").trim())
                .filter(Boolean)
            );

            report.checks.storage.listable = true;
            report.checks.storage.bucket_count = buckets.length;

            for (const bucket of KNOWN_BUCKETS) {
              report.checks.storage.known_buckets[bucket] =
                bucketNames.has(bucket);
            }
          }
        } catch (error) {
          report.checks.storage.checked = true;
          report.checks.storage.listable = false;

          if (VERBOSE) {
            report.checks.storage.error_message =
              error instanceof Error ? error.message : String(error);
          }
        }

        // 6) Optional audit log
        await logDebugAccess(supabase, {
          userId: auth.userId,
          method: auth.method,
          ip,
          userAgent,
          status: degraded ? "degraded" : "ok",
        });
      }
    }

    report.ok = !degraded;
    report.status = degraded ? "degraded" : "ok";

    return jsonResponse(report, 200);
  } catch (error) {
    console.error("[Debug] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        status: "error",
        error: "خطأ غير متوقع أثناء الـ debug.",
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
}

// ============================================================
// Block other methods
// ============================================================

export async function POST() {
  const res = jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405
  );

  res.headers.set("Allow", "GET");

  return res;
}

export async function PUT() {
  const res = jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405
  );

  res.headers.set("Allow", "GET");

  return res;
}

export async function DELETE() {
  const res = jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405
  );

  res.headers.set("Allow", "GET");

  return res;
}

export async function PATCH() {
  const res = jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405
  );

  res.headers.set("Allow", "GET");

  return res;
}