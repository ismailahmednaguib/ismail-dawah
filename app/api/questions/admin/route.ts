// app/api/questions/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Configuration
// ============================================================

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MAX_BODY_BYTES = positiveNumber(
  process.env.ADMIN_QUESTIONS_MAX_BODY_BYTES,
  50_000
);

const DB_TIMEOUT_MS = positiveNumber(
  process.env.ADMIN_QUESTIONS_DB_TIMEOUT_MS,
  5_000
);

const GET_RATE_WINDOW_MS = positiveNumber(
  process.env.ADMIN_QUESTIONS_GET_RATE_WINDOW_MS,
  15 * 60 * 1000
);

const GET_MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.ADMIN_QUESTIONS_GET_MAX_REQUESTS_PER_IP,
  60
);

const POST_RATE_WINDOW_MS = positiveNumber(
  process.env.ADMIN_QUESTIONS_POST_RATE_WINDOW_MS,
  15 * 60 * 1000
);

const POST_MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.ADMIN_QUESTIONS_POST_MAX_REQUESTS_PER_IP,
  20
);

const MAX_ANSWER_LENGTH = positiveNumber(
  process.env.ADMIN_QUESTIONS_MAX_ANSWER_LENGTH,
  10_000
);

const DEFAULT_PAGE_SIZE = positiveNumber(
  process.env.ADMIN_QUESTIONS_DEFAULT_PAGE_SIZE,
  50
);

const MAX_PAGE_SIZE = positiveNumber(
  process.env.ADMIN_QUESTIONS_MAX_PAGE_SIZE,
  100
);

const MAX_ID_LENGTH = 128;

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة Base64.
 *
 * ⚠️ لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 */
const ALLOW_LEGACY_SESSIONS =
  process.env.ALLOW_LEGACY_SESSIONS === "true";

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

type QuestionStatusFilter = "all" | "pending" | "answered";

// ============================================================
// In-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
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

function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  cleanupRateLimitStore();

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;

  return { allowed: true, retryAfter: 0 };
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

function sanitizeSingleLine(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMultiline(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
      ""
    )
    .replace(/\r\n?/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
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

  if (!/^[A-Za-z0-9_.:-]+$/.test(id)) {
    return null;
  }

  return id;
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

function normalizeStatusFilter(value: unknown): QuestionStatusFilter {
  const status = sanitizeSingleLine(value, 20).toLowerCase();

  if (status === "pending" || status === "answered" || status === "all") {
    return status;
  }

  return "all";
}

function parsePositiveInt(value: unknown, fallback: number, max?: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  const int = Math.floor(parsed);

  if (max && int > max) {
    return max;
  }

  return int;
}

// ============================================================
// Session Verification
// ============================================================

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: string[]
): (SessionPayload & { userId: string; role: string }) | null {
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

    if (!userId || !expectedRoles.includes(role)) {
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
): (SessionPayload & { userId: string; role: string }) | null {
  if (!ALLOW_LEGACY_SESSIONS || !token) {
    return null;
  }

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

  const adminSigned = parseSignedSession(adminToken, adminSecret, ["admin"]);
  if (adminSigned?.userId) {
    return {
      userId: adminSigned.userId,
      email: adminSigned.email ?? null,
      source: "admin_session",
      signed: true,
    };
  }

  const userSignedAsAdmin = parseSignedSession(userToken, userSecret, ["admin"]);
  if (userSignedAsAdmin?.userId) {
    return {
      userId: userSignedAsAdmin.userId,
      email: userSignedAsAdmin.email ?? null,
      source: "user_session",
      signed: true,
    };
  }

  const sessionSignedByAdminSecret = parseSignedSession(
    sessionToken,
    adminSecret,
    ["admin"]
  );
  if (sessionSignedByAdminSecret?.userId) {
    return {
      userId: sessionSignedByAdminSecret.userId,
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
      userId: sessionSignedByUserSecret.userId,
      email: sessionSignedByUserSecret.email ?? null,
      source: "session",
      signed: true,
    };
  }

  const legacyCandidates = [
    { token: adminToken, source: "legacy" as const },
    { token: userToken, source: "legacy" as const },
    { token: sessionToken, source: "legacy" as const },
  ];

  for (const item of legacyCandidates) {
    const legacy = parseLegacySession(item.token);

    if (legacy?.userId) {
      return {
        userId: legacy.userId,
        email: legacy.email ?? null,
        source: item.source,
        signed: false,
      };
    }
  }

  return null;
}

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
          return candidate.signed;
        }
      } catch {
        return candidate.signed;
      }

      return candidate.signed;
    }

    return candidate.signed;
  } catch {
    return candidate.signed;
  }
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

  const supabase = createSupabaseClient();

  if (!supabase) {
    if (!candidate.signed) {
      return {
        ok: false,
        status: 401,
        error: "جلسة غير صالحة.",
      };
    }

    return {
      ok: true,
      candidate,
    };
  }

  const active = await ensureAdminActive(supabase, candidate);

  if (!active) {
    return {
      ok: false,
      status: 403,
      error: "هذا الحساب غير مفعّل أو لم يعد مصرحًا له.",
    };
  }

  return {
    ok: true,
    candidate,
  };
}

// ============================================================
// Questions Fetching
// ============================================================

async function fetchQuestions(
  supabase: any,
  status: QuestionStatusFilter,
  page: number,
  limit: number
): Promise<{ data: any[]; error: string | null }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const selectWithUsers =
    "id, question, answer, status, created_at, answered_at, users(name, email)";

  const selectWithoutUsers =
    "id, question, answer, status, created_at, answered_at";

  const attempts = [
    {
      label: "with_users",
      select: selectWithUsers,
      withUsers: true,
    },
    {
      label: "without_users",
      select: selectWithoutUsers,
      withUsers: false,
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      let query = supabase
        .from("user_questions")
        .select(attempt.select)
        .order("created_at", { ascending: false });

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const result = (await withTimeout(
        query.range(from, to),
        DB_TIMEOUT_MS,
        `fetch_questions_${attempt.label}`
      )) as any;

      if (!result.error) {
        return {
          data: Array.isArray(result.data) ? result.data : [],
          error: null,
        };
      }

      lastError = result.error;

      const message = String(result.error?.message || "");

      const isRelationIssue =
        /users|relationship|foreign|Could not find/i.test(message);

      const isColumnIssue =
        /column .* does not exist|schema .* does not exist|Could not find the column/i.test(
          message
        );

      if (attempt.withUsers && isRelationIssue) {
        continue;
      }

      if (isColumnIssue) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[AdminQuestions] fetch questions error:", lastError);

  return {
    data: [],
    error: "تعذر جلب الأسئلة. حاول لاحقًا.",
  };
}

// ============================================================
// Answer Update
// ============================================================

async function fetchCurrentQuestion(
  supabase: any,
  id: string
): Promise<{
  exists: boolean;
  oldAnswer: string | null;
  oldStatus: string | null;
  error: string | null;
}> {
  const attempts = [
    "id, answer, status",
    "id, answer",
    "id",
  ];

  let lastError: any = null;

  for (const select of attempts) {
    try {
      const result = (await withTimeout(
        supabase
          .from("user_questions")
          .select(select)
          .eq("id", idForQuery(id))
          .maybeSingle(),
        DB_TIMEOUT_MS,
        "fetch_current_question"
      )) as any;

      if (!result.error) {
        return {
          exists: Boolean(result.data),
          oldAnswer:
            typeof result.data?.answer === "string"
              ? result.data.answer
              : null,
          oldStatus:
            typeof result.data?.status === "string"
              ? result.data.status
              : null,
          error: null,
        };
      }

      lastError = result.error;

      const message = String(result.error?.message || "");

      if (
        /column .* does not exist|Could not find the column/i.test(message)
      ) {
        continue;
      }

      break;
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[AdminQuestions] fetch current question error:", lastError);

  return {
    exists: false,
    oldAnswer: null,
    oldStatus: null,
    error: "تعذر التحقق من السؤال.",
  };
}

async function updateQuestionAnswer(
  supabase: any,
  id: string,
  answer: string
): Promise<{ ok: boolean; error: string | null }> {
  const answeredAt = new Date().toISOString();

  const attempts = [
    {
      label: "full",
      payload: {
        answer,
        status: "answered",
        answered_at: answeredAt,
      },
    },
    {
      label: "without_answered_at",
      payload: {
        answer,
        status: "answered",
      },
    },
    {
      label: "answer_only",
      payload: {
        answer,
      },
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      const result = (await withTimeout(
        supabase
          .from("user_questions")
          .update(attempt.payload)
          .eq("id", idForQuery(id)),
        DB_TIMEOUT_MS,
        `update_question_${attempt.label}`
      )) as any;

      if (!result.error) {
        return { ok: true, error: null };
      }

      lastError = result.error;

      const message = String(result.error?.message || "");

      if (/answered_at/i.test(message)) {
        continue;
      }

      if (/status/i.test(message)) {
        continue;
      }

      break;
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[AdminQuestions] update question error:", lastError);

  return {
    ok: false,
    error: "تعذر حفظ الإجابة. حاول لاحقًا.",
  };
}

async function logQuestionAnswer(
  supabase: any,
  params: {
    adminId: string;
    adminEmail: string | null;
    questionId: string;
    oldAnswer: string | null;
    newAnswer: string;
    oldStatus: string | null;
    ip: string;
    userAgent: string;
  }
): Promise<void> {
  try {
    await withTimeout(
      supabase.from("admin_question_updates").insert({
        admin_id: params.adminId,
        admin_email: params.adminEmail,
        question_id: params.questionId,
        old_answer: params.oldAnswer,
        new_answer: params.newAnswer,
        old_status: params.oldStatus,
        ip: params.ip,
        user_agent: params.userAgent,
        created_at: new Date().toISOString(),
      }) as unknown as Promise<{ error: any }>,
      DB_TIMEOUT_MS,
      "question_audit"
    );
  } catch (error) {
    console.error("[AdminQuestions] failed to write audit log:", error);
  }
}

// ============================================================
// GET /api/questions/admin
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // 1) Rate Limiting
    const rate = consumeRateLimit(
      `admin-questions-get:${ip}`,
      GET_MAX_REQUESTS_PER_IP,
      GET_RATE_WINDOW_MS
    );

    if (!rate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد طلبات القراءة كثير جدًأ. حاول لاحقًا.",
        },
        429,
        {
          "Retry-After": String(rate.retryAfter || Math.ceil(GET_RATE_WINDOW_MS / 1000)),
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

    // 3) Supabase
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[AdminQuestions] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        503
      );
    }

    // 4) Query params
    const searchParams = req.nextUrl.searchParams;

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(
      searchParams.get("limit"),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    const status = normalizeStatusFilter(searchParams.get("status"));

    // 5) Fetch
    const { data, error } = await fetchQuestions(supabase, status, page, limit);

    if (error) {
      return jsonResponse(
        {
          ok: false,
          error,
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      questions: data,
      pagination: {
        page,
        limit,
        status,
        count: data.length,
      },
    });
  } catch (error) {
    console.error("[AdminQuestions] GET unexpected error:", error);

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
// POST /api/questions/admin
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) Rate Limiting
    const rate = consumeRateLimit(
      `admin-questions-post:${ip}`,
      POST_MAX_REQUESTS_PER_IP,
      POST_RATE_WINDOW_MS
    );

    if (!rate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد محاولات الإجابة كثير جدًأ. حاول لاحقًا.",
        },
        429,
        {
          "Retry-After": String(rate.retryAfter || Math.ceil(POST_RATE_WINDOW_MS / 1000)),
        }
      );
    }

    // 2) Body size guard
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

    // 3) Authentication
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
      console.error("[AdminQuestions] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        503
      );
    }

    // 5) Parse body
    let bodyInput: unknown;

    try {
      bodyInput = await req.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "صيغة الطلب غير صحيحة.",
        },
        400
      );
    }

    if (!bodyInput || typeof bodyInput !== "object" || Array.isArray(bodyInput)) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب يجب أن يكون كائن JSON.",
        },
        400
      );
    }

    const payload = bodyInput as Record<string, unknown>;

    const id = normalizeId(payload.id);
    const answer = sanitizeMultiline(payload.answer, MAX_ANSWER_LENGTH);

    if (!id) {
      return jsonResponse(
        {
          ok: false,
          error: "معرّف السؤال غير صالح.",
        },
        400
      );
    }

    if (!answer) {
      return jsonResponse(
        {
          ok: false,
          error: "الإجابة مطلوبة.",
        },
        400
      );
    }

    // 6) Verify question exists and capture old answer
    const current = await fetchCurrentQuestion(supabase, id);

    if (current.error) {
      return jsonResponse(
        {
          ok: false,
          error: current.error,
        },
        500
      );
    }

    if (!current.exists) {
      return jsonResponse(
        {
          ok: false,
          error: "السؤال غير موجود.",
        },
        404
      );
    }

    // 7) Update
    const update = await updateQuestionAnswer(supabase, id, answer);

    if (!update.ok) {
      return jsonResponse(
        {
          ok: false,
          error: update.error,
        },
        500
      );
    }

    // 8) Audit log
    await logQuestionAnswer(supabase, {
      adminId: auth.candidate.userId,
      adminEmail: auth.candidate.email,
      questionId: id,
      oldAnswer: current.oldAnswer,
      newAnswer: answer,
      oldStatus: current.oldStatus,
      ip,
      userAgent,
    });

    return jsonResponse({
      ok: true,
      id,
      status: "answered",
      message: "تم حفظ الإجابة بنجاح.",
    });
  } catch (error) {
    console.error("[AdminQuestions] POST unexpected error:", error);

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
// Block other methods
// ============================================================

export async function PUT() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "GET, POST",
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
      Allow: "GET, POST",
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
      Allow: "GET, POST",
    }
  );
}