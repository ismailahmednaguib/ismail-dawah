// app/api/questions/route.ts
// إذا كان مسارك /api/questions/user، ضع نفس الكود في:
// app/api/questions/user/route.ts

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
  process.env.USER_QUESTIONS_MAX_BODY_BYTES,
  20_000
);

const DB_TIMEOUT_MS = positiveNumber(
  process.env.USER_QUESTIONS_DB_TIMEOUT_MS,
  5_000
);

const MAX_QUESTION_LENGTH = positiveNumber(
  process.env.USER_QUESTIONS_MAX_QUESTION_LENGTH,
  2_000
);

const DEFAULT_PAGE_SIZE = positiveNumber(
  process.env.USER_QUESTIONS_DEFAULT_PAGE_SIZE,
  30
);

const MAX_PAGE_SIZE = positiveNumber(
  process.env.USER_QUESTIONS_MAX_PAGE_SIZE,
  100
);

const GET_RATE_WINDOW_MS = positiveNumber(
  process.env.USER_QUESTIONS_GET_RATE_WINDOW_MS,
  15 * 60 * 1000
);

const GET_MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.USER_QUESTIONS_GET_MAX_REQUESTS_PER_IP,
  60
);

const GET_MAX_REQUESTS_PER_USER = positiveNumber(
  process.env.USER_QUESTIONS_GET_MAX_REQUESTS_PER_USER,
  120
);

const POST_RATE_WINDOW_MS = positiveNumber(
  process.env.USER_QUESTIONS_POST_RATE_WINDOW_MS,
  15 * 60 * 1000
);

const POST_MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.USER_QUESTIONS_POST_MAX_REQUESTS_PER_IP,
  10
);

const POST_MAX_REQUESTS_PER_USER = positiveNumber(
  process.env.USER_QUESTIONS_POST_MAX_REQUESTS_PER_USER,
  5
);

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

type UserCandidate = {
  userId: string;
  email: string | null;
  source: "user_session" | "session" | "legacy";
  signed: boolean;
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

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);
    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
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

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
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

function normalizeStatusFilter(value: unknown): QuestionStatusFilter {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  if (status === "pending" || status === "answered" || status === "all") {
    return status;
  }

  return "all";
}

// ============================================================
// Session Verification
// ============================================================

function parseSignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: string[]
): UserCandidate | null {
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
      userId,
      email: payload.email ?? null,
      source: token === undefined ? "legacy" : "user_session",
      signed: true,
    };
  } catch {
    return null;
  }
}

function parseLegacySession(
  token: string | undefined | null
): UserCandidate | null {
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

    if (!userId || role !== "user") {
      return null;
    }

    return {
      userId,
      email: payload.email ?? null,
      source: "legacy",
      signed: false,
    };
  } catch {
    return null;
  }
}

function findUserSession(req: NextRequest): UserCandidate | null {
  const userToken = req.cookies.get("user_session")?.value;
  const sessionToken = req.cookies.get("session")?.value;

  const userSecret = getUserSecret();

  // 1) user_session موقّع
  const userSigned = parseSignedSession(userToken, userSecret, ["user"]);
  if (userSigned?.userId) {
    return {
      ...userSigned,
      source: "user_session",
    };
  }

  // 2) session موقّع، للتوافق مع register/login القديم
  const sessionSigned = parseSignedSession(sessionToken, userSecret, ["user"]);
  if (sessionSigned?.userId) {
    return {
      ...sessionSigned,
      source: "session",
    };
  }

  // 3) fallback للجلسات القديمة غير الموقّعة
  const legacyUser = parseLegacySession(userToken);
  if (legacyUser?.userId) {
    return {
      ...legacyUser,
      source: "legacy",
    };
  }

  const legacySession = parseLegacySession(sessionToken);
  if (legacySession?.userId) {
    return {
      ...legacySession,
      source: "legacy",
    };
  }

  return null;
}

// ============================================================
// User Active Check
// ============================================================

async function ensureUserActive(
  supabase: any,
  candidate: UserCandidate
): Promise<boolean> {
  try {
    const first = await withTimeout(
      supabase
        .from("users")
        .select("id, is_active")
        .eq("id", idForQuery(candidate.userId))
        .maybeSingle() as unknown as Promise<{
        data: any;
        error: any;
      }>,
      DB_TIMEOUT_MS,
      "user_active_check"
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
          .from("users")
          .select("id")
          .eq("id", idForQuery(candidate.userId))
          .maybeSingle() as unknown as Promise<{
          data: any;
          error: any;
        }>,
        DB_TIMEOUT_MS,
        "user_active_check_fallback"
      );

      if (!second.error) {
        return Boolean(second.data);
      }
    }

    // لو جدول users غير موجود
    if (
      /does not exist/i.test(message) ||
      /Could not find the table/i.test(message) ||
      /relation/i.test(message)
    ) {
      // نسمح بالجلسات الموقّعة فقط لتجنب قفل النظام أثناء الترحيل
      return candidate.signed;
    }

    // خطأ قاعدة بيانات آخر: نسمح بالموقّع ونرفض القديم
    return candidate.signed;
  } catch {
    return candidate.signed;
  }
}

// ============================================================
// Fetch Questions
// ============================================================

async function fetchQuestions(
  supabase: any,
  userId: string,
  status: QuestionStatusFilter,
  page: number,
  limit: number
): Promise<{ data: any[]; error: string | null }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const attempts = [
    {
      label: "full",
      select: "id, question, answer, status, created_at, answered_at",
      supportsStatus: true,
      supportsCreatedAt: true,
    },
    {
      label: "without_answered_at",
      select: "id, question, answer, status, created_at",
      supportsStatus: true,
      supportsCreatedAt: true,
    },
    {
      label: "without_status",
      select: "id, question, answer, created_at",
      supportsStatus: false,
      supportsCreatedAt: true,
    },
    {
      label: "minimal",
      select: "id, question, answer",
      supportsStatus: false,
      supportsCreatedAt: false,
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      let query = supabase
        .from("user_questions")
        .select(attempt.select)
        .eq("user_id", idForQuery(userId));

      if (attempt.supportsCreatedAt) {
        query = query.order("created_at", { ascending: false });
      }

      if (status !== "all" && attempt.supportsStatus) {
        query = query.eq("status", status);
      }

      const result = (await withTimeout(
        query.range(from, to) as unknown as Promise<{
          data: any;
          error: any;
        }>,
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

      if (/status/i.test(message)) {
        continue;
      }

      if (/answered_at/i.test(message)) {
        continue;
      }

      if (/created_at/i.test(message)) {
        continue;
      }

      break;
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[UserQuestions] fetch questions error:", lastError);

  return {
    data: [],
    error: "تعذر جلب الأسئلة. حاول لاحقًا.",
  };
}

// ============================================================
// Insert Question
// ============================================================

async function insertQuestion(
  supabase: any,
  userId: string,
  question: string
): Promise<{ data: any | null; error: string | null }> {
  const createdAt = new Date().toISOString();

  const attempts = [
    {
      label: "full",
      payload: {
        user_id: idForQuery(userId),
        question,
        status: "pending",
        created_at: createdAt,
      },
    },
    {
      label: "without_created_at",
      payload: {
        user_id: idForQuery(userId),
        question,
        status: "pending",
      },
    },
    {
      label: "without_status",
      payload: {
        user_id: idForQuery(userId),
        question,
        created_at: createdAt,
      },
    },
    {
      label: "minimal",
      payload: {
        user_id: idForQuery(userId),
        question,
      },
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      const result = (await withTimeout(
        supabase
          .from("user_questions")
          .insert(attempt.payload)
          .select("id, question, answer, status, created_at, answered_at")
          .single() as unknown as Promise<{
          data: any;
          error: any;
        }>,
        DB_TIMEOUT_MS,
        `insert_question_${attempt.label}`
      )) as any;

      if (!result.error) {
        return { data: result.data, error: null };
      }

      lastError = result.error;

      const message = String(result.error?.message || "");

      if (/created_at/i.test(message)) {
        continue;
      }

      if (/status/i.test(message)) {
        continue;
      }

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

  // محاولة أخيرة بدون select حقول قد لا توجد
  try {
    const fallback = (await withTimeout(
      supabase
        .from("user_questions")
        .insert({
          user_id: idForQuery(userId),
          question,
        })
        .select("id")
        .single() as unknown as Promise<{
        data: any;
        error: any;
      }>,
      DB_TIMEOUT_MS,
      "insert_question_fallback"
    )) as any;

    if (!fallback.error) {
      return {
        data: {
          id: fallback.data?.id,
          question,
          status: "pending",
        },
        error: null,
      };
    }

    lastError = fallback.error;
  } catch (error) {
    lastError = error;
  }

  console.error("[UserQuestions] insert question error:", lastError);

  return {
    data: null,
    error: "تعذر إرسال السؤال. حاول لاحقًا.",
  };
}

// ============================================================
// GET /api/questions
// ============================================================

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const candidate = findUserSession(req);

    // 1) Rate limit حسب IP
    const ipRate = consumeRateLimit(
      `questions-get-ip:${ip}`,
      GET_MAX_REQUESTS_PER_IP,
      GET_RATE_WINDOW_MS
    );

    if (!ipRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد طلبات القراءة كثير جدًا. حاول لاحقًا.",
        },
        429,
        {
          "Retry-After": String(
            ipRate.retryAfter || Math.ceil(GET_RATE_WINDOW_MS / 1000)
          ),
        }
      );
    }

    // 2) Rate limit حسب المستخدم إذا كان مسجل دخول
    if (candidate) {
      const userRate = consumeRateLimit(
        `questions-get-user:${candidate.userId}`,
        GET_MAX_REQUESTS_PER_USER,
        GET_RATE_WINDOW_MS
      );

      if (!userRate.allowed) {
        return jsonResponse(
          {
            ok: false,
            error: "عدد طلبات القراءة كثير جدًا. حاول لاحقًا.",
          },
          429,
          {
            "Retry-After": String(
              userRate.retryAfter || Math.ceil(GET_RATE_WINDOW_MS / 1000)
            ),
          }
        );
      }
    }

    // 3) Authentication
    if (!candidate) {
      return jsonResponse(
        {
          ok: false,
          error: "غير مصرح لك. سجّل الدخول أولًا.",
        },
        401
      );
    }

    // 4) Supabase
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[UserQuestions] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        503
      );
    }

    // 5) تحقق من أن المستخدم موجود ونشط
    const active = await ensureUserActive(supabase, candidate);

    if (!active) {
      return jsonResponse(
        {
          ok: false,
          error: "هذا الحساب غير مفعّل أو لم يعد مصرحًا له.",
        },
        403
      );
    }

    // 6) Query params
    const searchParams = req.nextUrl.searchParams;

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(
      searchParams.get("limit"),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    const status = normalizeStatusFilter(searchParams.get("status"));

    // 7) Fetch
    const { data, error } = await fetchQuestions(
      supabase,
      candidate.userId,
      status,
      page,
      limit
    );

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
    console.error("[UserQuestions] GET unexpected error:", error);

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
// POST /api/questions
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const candidate = findUserSession(req);

    // 1) Rate limit حسب IP
    const ipRate = consumeRateLimit(
      `questions-post-ip:${ip}`,
      POST_MAX_REQUESTS_PER_IP,
      POST_RATE_WINDOW_MS
    );

    if (!ipRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد محاولات إرسال الأسئلة كثير جدًا. حاول لاحقًا.",
        },
        429,
        {
          "Retry-After": String(
            ipRate.retryAfter || Math.ceil(POST_RATE_WINDOW_MS / 1000)
          ),
        }
      );
    }

    // 2) Rate limit حسب المستخدم
    if (candidate) {
      const userRate = consumeRateLimit(
        `questions-post-user:${candidate.userId}`,
        POST_MAX_REQUESTS_PER_USER,
        POST_RATE_WINDOW_MS
      );

      if (!userRate.allowed) {
        return jsonResponse(
          {
            ok: false,
            error: "عدد محاولات إرسال الأسئلة كثير جدًا. حاول لاحقًا.",
          },
          429,
          {
            "Retry-After": String(
              userRate.retryAfter || Math.ceil(POST_RATE_WINDOW_MS / 1000)
            ),
          }
        );
      }
    }

    // 3) Authentication
    if (!candidate) {
      return jsonResponse(
        {
          ok: false,
          error: "غير مصرح لك. سجّل الدخول أولًا.",
        },
        401
      );
    }

    // 4) Body size guard
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب كبير جدًا.",
        },
        413
      );
    }

    // 5) Supabase
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[UserQuestions] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        503
      );
    }

    // 6) تحقق من أن المستخدم موجود ونشط
    const active = await ensureUserActive(supabase, candidate);

    if (!active) {
      return jsonResponse(
        {
          ok: false,
          error: "هذا الحساب غير مفعّل أو لم يعد مصرحًا له.",
        },
        403
      );
    }

    // 7) Parse body
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

    const question = sanitizeMultiline(
      payload.question,
      MAX_QUESTION_LENGTH
    );

    if (!question) {
      return jsonResponse(
        {
          ok: false,
          error: "اكتب سؤالك أولًا.",
        },
        400
      );
    }

    // 8) Insert
    const { data, error } = await insertQuestion(
      supabase,
      candidate.userId,
      question
    );

    if (error || !data) {
      return jsonResponse(
        {
          ok: false,
          error: error || "تعذر إرسال السؤال. حاول لاحقًا.",
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      message: "تم إرسال سؤالك بنجاح.",
      question: data,
    });
  } catch (error) {
    console.error("[UserQuestions] POST unexpected error:", error);

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