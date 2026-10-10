// app/api/stats/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getContent } from "@/lib/content";
import { createHmac, timingSafeEqual } from "node:crypto";

// ============================================================
// Configuration
// ============================================================

const isProduction = process.env.NODE_ENV === "production";

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const DB_TIMEOUT_MS = positiveNumber(
  env("STATS_DB_TIMEOUT_MS"),
  5_000
);

const RATE_WINDOW_MS = positiveNumber(
  env("STATS_RATE_WINDOW_MS"),
  15 * 60 * 1000
);

const MAX_REQUESTS_PER_IP = positiveNumber(
  env("STATS_MAX_REQUESTS_PER_IP"),
  30
);

const MAX_RATE_STORE_SIZE = 2_000;

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة Base64/Base64URL.
 *
 * ⚠️ لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 */
const ALLOW_LEGACY_SESSIONS = env("ALLOW_LEGACY_SESSIONS") === "true";

// ============================================================
// Types
// ============================================================

type RateRecord = {
  count: number;
  resetAt: number;
};

type SessionPayload = {
  userId?: string | number;
  email?: string | null;
  role?: string;
  type?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  v?: number;
  tv?: number | null;
};

type AdminSession = {
  userId: string;
  email: string | null;
  signed: boolean;
  source: string;
};

type AuthResult =
  | {
      ok: true;
      session: AdminSession;
      supabase: SupabaseClient | null;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

type QuestionCounts = {
  total: number;
  pending: number;
  answered: number;
};

// ============================================================
// Global in-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __statsRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__statsRateLimit ?? new Map<string, RateRecord>();

globalRef.__statsRateLimit = rateLimitStore;

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

function consumeRateLimit(ip: string): {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `stats:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfter: 0,
      remaining: Math.max(0, MAX_REQUESTS_PER_IP - 1),
    };
  }

  if (record.count >= MAX_REQUESTS_PER_IP) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  record.count += 1;

  return {
    allowed: true,
    retryAfter: 0,
    remaining: Math.max(0, MAX_REQUESTS_PER_IP - record.count),
  };
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

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): NextResponse {
  const res = NextResponse.json(body as any, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Authorization");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (isProduction) {
    res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  }

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      res.headers.set(key, value);
    }
  }

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

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);

    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsed));
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

function decodeBase64Json(value: string): unknown {
  const encodings = ["base64url", "base64"] as const;

  for (const encoding of encodings) {
    try {
      const decoded = Buffer.from(value, encoding).toString("utf8");
      return JSON.parse(decoded);
    } catch {
      // جرّب الترميز التالي
    }
  }

  return null;
}

function collectionLength(content: any, key: string): number {
  const value = content?.[key];
  return Array.isArray(value) ? value.length : 0;
}

// ============================================================
// Session Verification
// ============================================================

function buildAdminSession(
  payload: SessionPayload,
  signed: boolean,
  source: string
): AdminSession | null {
  const userId = normalizeUserId(payload.userId);
  const role = String(payload.role || payload.type || "")
    .trim()
    .toLowerCase();

  if (!userId || role !== "admin") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = Number(payload.exp);

  if (signed) {
    if (!Number.isFinite(exp) || exp <= now) {
      return null;
    }
  } else if (Number.isFinite(exp) && exp <= now) {
    return null;
  }

  const iat = Number(payload.iat);

  if (Number.isFinite(iat) && iat > now + 60) {
    return null;
  }

  return {
    userId,
    email: typeof payload.email === "string" ? payload.email : null,
    signed,
    source,
  };
}

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  source: string
): AdminSession | null {
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

    const headerJson = decodeBase64Json(header) as
      | Record<string, unknown>
      | null;

    if (!headerJson || headerJson.alg !== "HS256") {
      return null;
    }

    if (headerJson.typ && headerJson.typ !== "session") {
      return null;
    }

    const payload = decodeBase64Json(body) as SessionPayload | null;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    return buildAdminSession(payload, true, source);
  } catch {
    return null;
  }
}

function parseLegacySession(
  token: string | undefined | null,
  source: string
): AdminSession | null {
  if (!ALLOW_LEGACY_SESSIONS || !token) {
    return null;
  }

  if (token.includes(".")) {
    return null;
  }

  try {
    const payload = decodeBase64Json(token) as SessionPayload | null;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    return buildAdminSession(payload, false, source);
  } catch {
    return null;
  }
}

function findAdminSession(req: NextRequest): AdminSession | null {
  const adminToken = req.cookies.get("admin_session")?.value;
  const userToken = req.cookies.get("user_session")?.value;
  const sessionToken = req.cookies.get("session")?.value;

  const adminSecret = getAdminSecret();
  const userSecret = getUserSecret();

  const signedCandidates = [
    parseSignedSession(adminToken, adminSecret, "admin_session"),
    parseSignedSession(userToken, userSecret, "user_session"),
    parseSignedSession(sessionToken, adminSecret, "session"),
    parseSignedSession(sessionToken, userSecret, "session"),
  ];

  for (const candidate of signedCandidates) {
    if (candidate) {
      return candidate;
    }
  }

  const legacyCandidates = [
    parseLegacySession(adminToken, "legacy_admin_session"),
    parseLegacySession(userToken, "legacy_user_session"),
    parseLegacySession(sessionToken, "legacy_session"),
  ];

  for (const candidate of legacyCandidates) {
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

// ============================================================
// Query Helpers
// ============================================================

async function runQuery(
  builder: any,
  label: string
): Promise<{
  data: any | null;
  error: any | null;
  count: number | null;
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
      count:
        typeof result?.count === "number" && Number.isFinite(result.count)
          ? result.count
          : null,
    };
  } catch (error) {
    return {
      data: null,
      error,
      count: null,
    };
  }
}

// ============================================================
// Admin Active Check
// ============================================================

async function ensureAdminActive(
  supabase: SupabaseClient,
  session: AdminSession
): Promise<boolean> {
  try {
    const queryId = idForQuery(session.userId);

    const first = await runQuery(
      supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", queryId)
        .maybeSingle(),
      "admin_active_check"
    );

    if (!first.error) {
      if (!first.data) {
        return false;
      }

      if ((first.data as any).is_active === false) {
        return false;
      }

      return true;
    }

    if (isMissingColumnError(first.error, "is_active")) {
      const second = await runQuery(
        supabase
          .from("admin_users")
          .select("id")
          .eq("id", queryId)
          .maybeSingle(),
        "admin_active_check_fallback"
      );

      if (!second.error) {
        return Boolean(second.data);
      }
    }

    if (isMissingTableError(first.error)) {
      const userAttempts = ["id, role, is_active", "id, role", "id"];

      for (const select of userAttempts) {
        const users = await runQuery(
          supabase
            .from("users")
            .select(select)
            .eq("id", queryId)
            .maybeSingle(),
          "users_admin_check"
        );

        if (!users.error) {
          if (!users.data) {
            return false;
          }

          const role = String((users.data as any).role || "")
            .trim()
            .toLowerCase();

          if (role && role !== "admin") {
            return false;
          }

          if ((users.data as any).is_active === false) {
            return false;
          }

          return true;
        }

        if (
          isMissingColumnError(users.error, "is_active") ||
          isMissingColumnError(users.error, "role")
        ) {
          continue;
        }

        if (isMissingTableError(users.error)) {
          return session.signed;
        }

        console.error("[Stats] users admin check error:", users.error);
        return session.signed;
      }

      return session.signed;
    }

    console.error("[Stats] admin active check error:", first.error);
    return session.signed;
  } catch (error) {
    console.error("[Stats] ensureAdminActive unexpected error:", error);
    return session.signed;
  }
}

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const session = findAdminSession(req);

  if (!session) {
    return {
      ok: false,
      status: 401,
      error: "غير مصرح لك. سجّل دخول الآدمن أولًا.",
    };
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    if (!session.signed) {
      return {
        ok: false,
        status: 401,
        error: "جلسة غير صالحة.",
      };
    }

    return {
      ok: true,
      session,
      supabase: null,
    };
  }

  const active = await ensureAdminActive(supabase, session);

  if (!active) {
    return {
      ok: false,
      status: 403,
      error: "هذا الحساب غير مفعّل أو لم يعد مصرحًا له.",
    };
  }

  return {
    ok: true,
    session,
    supabase,
  };
}

// ============================================================
// Content Loader
// ============================================================

async function loadContent(): Promise<{
  content: any;
  warning: string | null;
}> {
  try {
    const content = await withTimeout(
      Promise.resolve(getContent()) as PromiseLike<any>,
      DB_TIMEOUT_MS,
      "get_content"
    );

    return {
      content,
      warning: null,
    };
  } catch (error) {
    console.error("[Stats] getContent error:", error);

    return {
      content: null,
      warning: "content_load_failed",
    };
  }
}

// ============================================================
// DB Count Helpers
// ============================================================

async function fetchUsersCount(
  supabase: SupabaseClient,
  warnings: string[]
): Promise<number> {
  const result = await runQuery(
    supabase
      .from("users")
      .select("*", { count: "exact", head: true }),
    "users_count"
  );

  if (result.error) {
    if (isMissingTableError(result.error)) {
      warnings.push("users_table_missing");
    } else {
      warnings.push("users_count_failed");
    }

    return 0;
  }

  return toNumber(result.count ?? 0);
}

async function fetchQuestionCounts(
  supabase: SupabaseClient,
  warnings: string[]
): Promise<QuestionCounts> {
  const totalResult = await runQuery(
    supabase
      .from("user_questions")
      .select("*", { count: "exact", head: true }),
    "questions_total"
  );

  if (totalResult.error) {
    if (isMissingTableError(totalResult.error)) {
      warnings.push("user_questions_table_missing");
    } else {
      warnings.push("questions_total_failed");
    }

    return {
      total: 0,
      pending: 0,
      answered: 0,
    };
  }

  const total = toNumber(totalResult.count ?? 0);

  let pending = 0;

  const pendingResult = await runQuery(
    supabase
      .from("user_questions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    "questions_pending"
  );

  if (!pendingResult.error) {
    pending = toNumber(pendingResult.count ?? 0);
  } else if (isMissingColumnError(pendingResult.error, "status")) {
    warnings.push("questions_status_column_missing");
  } else if (isMissingTableError(pendingResult.error)) {
    warnings.push("user_questions_table_missing");
  } else {
    warnings.push("questions_pending_failed");
  }

  let answered = 0;

  const answeredResult = await runQuery(
    supabase
      .from("user_questions")
      .select("*", { count: "exact", head: true })
      .eq("status", "answered"),
    "questions_answered"
  );

  if (!answeredResult.error) {
    answered = toNumber(answeredResult.count ?? 0);
  } else if (isMissingColumnError(answeredResult.error, "status")) {
    answered = Math.max(0, total - pending);
  } else if (isMissingTableError(answeredResult.error)) {
    warnings.push("user_questions_table_missing");
  } else {
    warnings.push("questions_answered_failed");
    answered = Math.max(0, total - pending);
  }

  // حماية من تجاوز المجموع بسبب تزامن أو بيانات غير متسقة
  pending = Math.min(pending, total);
  answered = Math.min(answered, total);

  if (answered + pending > total) {
    answered = Math.max(0, total - pending);
  }

  return {
    total,
    pending,
    answered,
  };
}

// ============================================================
// GET /api/stats
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) Rate Limiting
    const rate = consumeRateLimit(ip);

    if (!rate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد طلبات الإحصائيات كثير جدًا. حاول لاحقًا.",
          retryAfter: rate.retryAfter,
        },
        429,
        {
          "Retry-After": String(
            rate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)
          ),
          "X-RateLimit-Limit": String(MAX_REQUESTS_PER_IP),
          "X-RateLimit-Remaining": "0",
        }
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

    const warnings: string[] = [];

    if (!auth.supabase) {
      warnings.push("db_not_configured");
    }

    // 3) Load content and DB counts safely
    const [contentResult, usersCount, questionCounts] = await Promise.all([
      loadContent(),
      auth.supabase
        ? fetchUsersCount(auth.supabase, warnings)
        : Promise.resolve(0),
      auth.supabase
        ? fetchQuestionCounts(auth.supabase, warnings)
        : Promise.resolve<QuestionCounts>({
            total: 0,
            pending: 0,
            answered: 0,
          }),
    ]);

    if (contentResult.warning) {
      warnings.push(contentResult.warning);
    }

    const content = contentResult.content;

    const stats = {
      ok: true,
      content: {
        fields: collectionLength(content, "fields"),
        lessons: collectionLength(content, "lessons"),
        videos: collectionLength(content, "videos"),
        articles: collectionLength(content, "articles"),
        books: collectionLength(content, "books"),
        audio: collectionLength(content, "audio"),
        photos: collectionLength(content, "photos"),
        fatwas: collectionLength(content, "fatwas"),
        doubts: collectionLength(content, "doubts"),
        projects: collectionLength(content, "projects"),
        news: collectionLength(content, "news"),
        places: collectionLength(content, "places"),
        adhkar: collectionLength(content, "adhkar"),
      },
      users: {
        total: usersCount,
      },
      questions: questionCounts,
      languages: Array.isArray(content?.languages)
        ? content.languages.length
        : 2,
      meta: {
        generatedAt: new Date().toISOString(),
        dbConfigured: Boolean(auth.supabase),
        warnings: Array.from(new Set(warnings)),
        auth: {
          source: auth.session.source,
          signed: auth.session.signed,
        },
      },
    };

    return jsonResponse(
      stats,
      200,
      {
        "X-RateLimit-Limit": String(MAX_REQUESTS_PER_IP),
        "X-RateLimit-Remaining": String(rate.remaining),
      }
    );
  } catch (error) {
    console.error("[Stats] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع أثناء جلب الإحصائيات.",
      },
      500
    );
  }
}

// ============================================================
// Block other methods
// ============================================================

export async function POST() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET",
    }
  );
}

export async function PUT() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET",
    }
  );
}

export async function DELETE() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET",
    }
  );
}

export async function PATCH() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET",
    }
  );
}