// app/api/upload/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// إذا كانت خطتك تسمح بمدد أطول، يمكنك فتح هذا السطر:
// export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

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

function sanitizeBucketName(value: string): string {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || "site";
}

const BUCKET = sanitizeBucketName(env("UPLOAD_BUCKET") || "site");

/**
 * إنشاء الـ bucket تلقائيًا إذا لم يوجد.
 *
 * في الإنتاج: لا يُنشأ إلا إذا فعّلته صراحةً.
 * في التطوير: مفعّل افتراضيًا للتسهيل.
 */
const AUTO_CREATE_BUCKET = isProduction
  ? env("UPLOAD_AUTO_CREATE_BUCKET") === "true"
  : env("UPLOAD_AUTO_CREATE_BUCKET") !== "false";

const GLOBAL_MAX_BYTES = positiveNumber(
  env("UPLOAD_MAX_TOTAL_BYTES"),
  50 * 1024 * 1024
);

const MULTIPART_OVERHEAD_BYTES = 2 * 1024 * 1024;
const REQUEST_MAX_BYTES = GLOBAL_MAX_BYTES + MULTIPART_OVERHEAD_BYTES;

const IMAGE_MAX_BYTES = Math.min(
  positiveNumber(env("UPLOAD_IMAGE_MAX_BYTES"), 5 * 1024 * 1024),
  GLOBAL_MAX_BYTES
);

const AUDIO_MAX_BYTES = Math.min(
  positiveNumber(env("UPLOAD_AUDIO_MAX_BYTES"), 50 * 1024 * 1024),
  GLOBAL_MAX_BYTES
);

const DOC_MAX_BYTES = Math.min(
  positiveNumber(env("UPLOAD_DOC_MAX_BYTES"), 25 * 1024 * 1024),
  GLOBAL_MAX_BYTES
);

const DB_TIMEOUT_MS = positiveNumber(
  env("UPLOAD_DB_TIMEOUT_MS"),
  8_000
);

const RATE_WINDOW_MS = positiveNumber(
  env("UPLOAD_RATE_WINDOW_MS"),
  15 * 60 * 1000
);

const MAX_UPLOADS_PER_IP = positiveNumber(
  env("UPLOAD_MAX_PER_IP"),
  20
);

const MAX_UPLOADS_PER_ADMIN = positiveNumber(
  env("UPLOAD_MAX_PER_ADMIN"),
  50
);

const MAX_RATE_STORE_SIZE = 2_000;

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة Base64/Base64URL.
 *
 * ⚠️ لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 */
const ALLOW_LEGACY_SESSIONS = env("ALLOW_LEGACY_SESSIONS") === "true";

/**
 * السماح بالطلبات بدون Origin header.
 *
 * ⚠️ في الإنتاج يُفضَّل تركه false.
 */
const ALLOW_MISSING_ORIGIN = env("UPLOAD_ALLOW_MISSING_ORIGIN") === "true";

// ============================================================
// Allowed kinds / extensions / mimes
// ============================================================

type Kind = "image" | "audio" | "doc";

const ALLOWED_KINDS = new Set<Kind>(["image", "audio", "doc"]);

const ALLOWED_EXTENSIONS: Record<Kind, Set<string>> = {
  image: new Set(["jpg", "jpeg", "png", "webp", "gif"]),
  audio: new Set(["mp3", "wav", "m4a", "ogg", "flac", "aac"]),
  doc: new Set(["pdf"]),
};

const EXT_TO_MIME: Record<Kind, Record<string, string>> = {
  image: {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  },
  audio: {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    flac: "audio/flac",
    aac: "audio/aac",
  },
  doc: {
    pdf: "application/pdf",
  },
};

const ALLOWED_MIMES: Record<Kind, Set<string>> = {
  image: new Set(Object.values(EXT_TO_MIME.image)),
  audio: new Set(Object.values(EXT_TO_MIME.audio)),
  doc: new Set(Object.values(EXT_TO_MIME.doc)),
};

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "audio/x-wav": "audio/wav",
  "audio/wave": "audio/wav",
  "audio/vnd.wave": "audio/wav",
  "audio/mp4a-latm": "audio/mp4",
  "audio/x-m4a": "audio/mp4",
  "audio/x-mpegurl": "audio/mpeg",
  "audio/mpeg3": "audio/mpeg",
};

const KIND_TO_FOLDER: Record<Kind, string> = {
  image: "images",
  audio: "audio",
  doc: "books",
};

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
      supabase: SupabaseClient;
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
  __uploadRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__uploadRateLimit ?? new Map<string, RateRecord>();

globalRef.__uploadRateLimit = rateLimitStore;

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
  key: string,
  max: number
): {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfter: 0,
      remaining: Math.max(0, max - 1),
    };
  }

  if (record.count >= max) {
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
    remaining: Math.max(0, max - record.count),
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

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): NextResponse {
  const res = NextResponse.json(body as any, { status });

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie, Origin, Authorization");
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
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getRequestHostname(req: NextRequest): string | null {
  const forwardedHost = req
    .headers.get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    return stripPort(forwardedHost).toLowerCase();
  }

  const hostHeader = req.headers.get("host");

  if (hostHeader) {
    return stripPort(hostHeader).toLowerCase();
  }

  return getHostname(req.url);
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");

  if (!origin) {
    return !isProduction || ALLOW_MISSING_ORIGIN;
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
    allowed.add(stripPort(forwardedHost).toLowerCase());
  }

  const envHosts = env("UPLOAD_ALLOWED_HOSTS");
  for (const host of envHosts.split(",")) {
    const clean = host.trim().toLowerCase();
    if (clean) {
      allowed.add(clean);
    }
  }

  if (!isProduction) {
    allowed.add("localhost");
    allowed.add("127.0.0.1");
    allowed.add("0.0.0.0");
  }

  return allowed.has(originHost);
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

function isBucketNotFoundError(error: unknown): boolean {
  const message = String((error as any)?.message || "");

  return (
    /bucket.*not.*found/i.test(message) ||
    /The resource to be accessed does not exist/i.test(message) ||
    (/not found/i.test(message) && /storage|bucket/i.test(message))
  );
}

function isBucketAlreadyExistsError(error: unknown): boolean {
  const message = String((error as any)?.message || "");

  return /already exists/i.test(message) || /duplicate/i.test(message);
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
// Admin Active Check
// ============================================================

async function ensureAdminActive(
  supabase: SupabaseClient,
  session: AdminSession
): Promise<boolean> {
  try {
    const queryId = idForQuery(session.userId);

    const first = (await withTimeout(
      supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", queryId)
        .maybeSingle() as unknown as PromiseLike<any>,
      DB_TIMEOUT_MS,
      "admin_active_check"
    )) as any;

    if (!first.error) {
      if (!first.data) {
        return false;
      }

      if (first.data.is_active === false) {
        return false;
      }

      return true;
    }

    if (isMissingColumnError(first.error, "is_active")) {
      const second = (await withTimeout(
        supabase
          .from("admin_users")
          .select("id")
          .eq("id", queryId)
          .maybeSingle() as unknown as PromiseLike<any>,
        DB_TIMEOUT_MS,
        "admin_active_check_fallback"
      )) as any;

      if (!second.error) {
        return Boolean(second.data);
      }
    }

    if (isMissingTableError(first.error)) {
      const userAttempts = ["id, role, is_active", "id, role", "id"];

      for (const select of userAttempts) {
        const users = (await withTimeout(
          supabase
            .from("users")
            .select(select)
            .eq("id", queryId)
            .maybeSingle() as unknown as PromiseLike<any>,
          DB_TIMEOUT_MS,
          "users_admin_check"
        )) as any;

        if (!users.error) {
          if (!users.data) {
            return false;
          }

          const role = String(users.data.role || "")
            .trim()
            .toLowerCase();

          if (role && role !== "admin") {
            return false;
          }

          if (users.data.is_active === false) {
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

        console.error("[Upload] users admin check error:", users.error);
        return session.signed;
      }

      return session.signed;
    }

    console.error("[Upload] admin active check error:", first.error);
    return session.signed;
  } catch (error) {
    console.error("[Upload] ensureAdminActive unexpected error:", error);
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
    return {
      ok: false,
      status: 503,
      error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
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
// File validation helpers
// ============================================================

function normalizeKind(value: unknown): Kind | null {
  const kind = sanitizeSingleLine(value, 20).toLowerCase();
  return ALLOWED_KINDS.has(kind as Kind) ? (kind as Kind) : null;
}

function extractSafeExtension(fileName: unknown, kind: Kind): string | null {
  const clean = sanitizeSingleLine(fileName, 255)
    .toLowerCase()
    .replace(/\\/g, "/")
    .split("/")
    .pop() || "";

  const dotIndex = clean.lastIndexOf(".");

  if (dotIndex < 0 || dotIndex === clean.length - 1) {
    return null;
  }

  const ext = clean
    .slice(dotIndex + 1)
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);

  if (!ext || !ALLOWED_EXTENSIONS[kind].has(ext)) {
    return null;
  }

  return ext;
}

function resolveMime(kind: Kind, ext: string, declaredType: string): string | null {
  const inferred = EXT_TO_MIME[kind][ext];

  if (!inferred) {
    return null;
  }

  const declared = declaredType.trim().toLowerCase();

  if (!declared) {
    return inferred;
  }

  // بعض المتصفحات/الأجهزة ترسل نوعًا عامًا، نعتمد على الامتداد وMagic Bytes
  if (declared === "application/octet-stream") {
    return inferred;
  }

  const normalized = MIME_ALIASES[declared] || declared;

  if (normalized === inferred) {
    return inferred;
  }

  if (ALLOWED_MIMES[kind].has(normalized)) {
    return inferred;
  }

  return null;
}

function hasPrefix(bytes: Uint8Array, prefix: number[], offset = 0): boolean {
  if (offset + prefix.length > bytes.length) {
    return false;
  }

  for (let i = 0; i < prefix.length; i += 1) {
    if (bytes[offset + i] !== prefix[i]) {
      return false;
    }
  }

  return true;
}

function isValidImageBytes(bytes: Uint8Array, ext: string): boolean {
  if (ext === "jpg" || ext === "jpeg") {
    return hasPrefix(bytes, [0xff, 0xd8, 0xff]);
  }

  if (ext === "png") {
    return hasPrefix(bytes, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  }

  if (ext === "gif") {
    return hasPrefix(bytes, [0x47, 0x49, 0x46, 0x38]);
  }

  if (ext === "webp") {
    return (
      hasPrefix(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasPrefix(bytes, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }

  return false;
}

function isValidAudioBytes(bytes: Uint8Array, ext: string): boolean {
  if (ext === "mp3") {
    const isId3 = hasPrefix(bytes, [0x49, 0x44, 0x33]);
    const isFrameSync =
      bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;

    return isId3 || isFrameSync;
  }

  if (ext === "wav") {
    return (
      hasPrefix(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasPrefix(bytes, [0x57, 0x41, 0x56, 0x45], 8)
    );
  }

  if (ext === "ogg") {
    return hasPrefix(bytes, [0x4f, 0x67, 0x67, 0x53]);
  }

  if (ext === "flac") {
    return hasPrefix(bytes, [0x66, 0x4c, 0x61, 0x43]);
  }

  if (ext === "m4a") {
    return hasPrefix(bytes, [0x66, 0x74, 0x79, 0x70], 4);
  }

  if (ext === "aac") {
    return (
      bytes.length >= 2 &&
      bytes[0] === 0xff &&
      (bytes[1] & 0xf6) === 0xf0
    );
  }

  return false;
}

function isValidDocBytes(bytes: Uint8Array, ext: string): boolean {
  if (ext === "pdf") {
    return hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46]);
  }

  return false;
}

function validateMagicBytes(
  kind: Kind,
  ext: string,
  buffer: ArrayBuffer
): boolean {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 12) {
    return false;
  }

  if (kind === "image") {
    return isValidImageBytes(bytes, ext);
  }

  if (kind === "audio") {
    return isValidAudioBytes(bytes, ext);
  }

  if (kind === "doc") {
    return isValidDocBytes(bytes, ext);
  }

  return false;
}

function maxBytesForKind(kind: Kind): number {
  if (kind === "image") return IMAGE_MAX_BYTES;
  if (kind === "audio") return AUDIO_MAX_BYTES;
  return DOC_MAX_BYTES;
}

function isFileLike(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value &&
    "name" in value
  );
}

// ============================================================
// Storage helpers
// ============================================================

async function ensureBucketExists(supabase: SupabaseClient): Promise<void> {
  if (!AUTO_CREATE_BUCKET) {
    return;
  }

  try {
    const result = (await withTimeout(
      supabase.storage.createBucket(BUCKET, {
        public: true,
      }) as unknown as PromiseLike<any>,
      DB_TIMEOUT_MS,
      "create_upload_bucket"
    )) as any;

    if (result?.error && !isBucketAlreadyExistsError(result.error)) {
      console.warn("[Upload] Failed to auto-create bucket:", result.error);
    }
  } catch (error) {
    console.warn("[Upload] Auto-create bucket error:", error);
  }
}

async function uploadToStorage(
  supabase: SupabaseClient,
  path: string,
  bytes: Uint8Array,
  contentType: string
): Promise<{ ok: boolean; error: any | null }> {
  try {
    const result = (await withTimeout(
      supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType,
        upsert: false,
        cacheControl: "3600",
      }) as unknown as PromiseLike<any>,
      DB_TIMEOUT_MS,
      "storage_upload"
    )) as any;

    if (result?.error) {
      return { ok: false, error: result.error };
    }

    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error };
  }
}

async function logUpload(
  supabase: SupabaseClient,
  params: {
    adminId: string;
    adminEmail: string | null;
    path: string;
    kind: Kind;
    originalName: string;
    mime: string;
    sizeBytes: number;
    ip: string;
    userAgent: string;
  }
): Promise<void> {
  const rows: Array<Record<string, unknown>> = [
    {
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      bucket: BUCKET,
      path: params.path,
      kind: params.kind,
      original_name: params.originalName,
      mime: params.mime,
      size_bytes: params.sizeBytes,
      ip: params.ip,
      user_agent: params.userAgent,
      created_at: new Date().toISOString(),
    },
    {
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      bucket: BUCKET,
      path: params.path,
      kind: params.kind,
      original_name: params.originalName,
      mime: params.mime,
      size_bytes: params.sizeBytes,
      ip: params.ip,
      user_agent: params.userAgent,
    },
    {
      admin_id: params.adminId,
      path: params.path,
      kind: params.kind,
      original_name: params.originalName,
      mime: params.mime,
      size_bytes: params.sizeBytes,
      created_at: new Date().toISOString(),
    },
    {
      admin_id: params.adminId,
      path: params.path,
      kind: params.kind,
      size_bytes: params.sizeBytes,
    },
    {
      path: params.path,
      kind: params.kind,
      size_bytes: params.sizeBytes,
    },
  ];

  for (const row of rows) {
    try {
      const result = (await withTimeout(
        supabase.from("admin_upload_logs").insert(row) as unknown as PromiseLike<any>,
        DB_TIMEOUT_MS,
        "upload_audit"
      )) as any;

      const error = result?.error;

      if (!error) {
        return;
      }

      if (isMissingTableError(error)) {
        return;
      }

      if (
        isMissingColumnError(error, "admin_email") ||
        isMissingColumnError(error, "bucket") ||
        isMissingColumnError(error, "original_name") ||
        isMissingColumnError(error, "mime") ||
        isMissingColumnError(error, "size_bytes") ||
        isMissingColumnError(error, "ip") ||
        isMissingColumnError(error, "user_agent") ||
        isMissingColumnError(error, "created_at")
      ) {
        continue;
      }

      console.warn("[Upload] Failed to write audit log:", error);
      return;
    } catch (error) {
      console.warn("[Upload] Unexpected audit log error:", error);
      return;
    }
  }
}

// ============================================================
// GET /api/upload
// ============================================================

export async function GET(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          error: "origin_not_allowed",
        },
        403
      );
    }

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

    return jsonResponse({
      ok: true,
      bucket: BUCKET,
      autoCreateBucket: AUTO_CREATE_BUCKET,
      limits: {
        globalMaxBytes: GLOBAL_MAX_BYTES,
        requestMaxBytes: REQUEST_MAX_BYTES,
        imageMaxBytes: IMAGE_MAX_BYTES,
        audioMaxBytes: AUDIO_MAX_BYTES,
        docMaxBytes: DOC_MAX_BYTES,
      },
      allowedKinds: Array.from(ALLOWED_KINDS),
      allowedExtensions: {
        image: Array.from(ALLOWED_EXTENSIONS.image),
        audio: Array.from(ALLOWED_EXTENSIONS.audio),
        doc: Array.from(ALLOWED_EXTENSIONS.doc),
      },
    });
  } catch (error) {
    console.error("[Upload] GET unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع.",
      },
      500
    );
  }
}

// ============================================================
// POST /api/upload
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1) IP rate limit قبل المصادقة لتقليل الضغط
    const ipRate = consumeRateLimit(`upload-ip:${ip}`, MAX_UPLOADS_PER_IP);

    if (!ipRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد محاولات الرفع كثير جدًا. حاول لاحقًا.",
          retryAfter: ipRate.retryAfter,
        },
        429,
        {
          "Retry-After": String(
            ipRate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)
          ),
          "X-RateLimit-Limit": String(MAX_UPLOADS_PER_IP),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    // 2) Origin check
    if (!isAllowedOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          error: "origin_not_allowed",
        },
        403
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

    // 4) Admin rate limit
    const adminRate = consumeRateLimit(
      `upload-admin:${auth.session.userId}`,
      MAX_UPLOADS_PER_ADMIN
    );

    if (!adminRate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "تجاوزت حد الرفع المسموح. حاول لاحقًا.",
          retryAfter: adminRate.retryAfter,
        },
        429,
        {
          "Retry-After": String(
            adminRate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)
          ),
          "X-RateLimit-Limit": String(MAX_UPLOADS_PER_ADMIN),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    // 5) Content type check
    const contentTypeHeader = (
      req.headers.get("content-type") || ""
    ).toLowerCase();

    if (!contentTypeHeader.includes("multipart/form-data")) {
      return jsonResponse(
        {
          ok: false,
          error: "يجب إرسال الملف عبر multipart/form-data.",
        },
        400
      );
    }

    // 6) Content length guard
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader || "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > REQUEST_MAX_BYTES
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "الطلب أكبر من الحد المسموح.",
        },
        413
      );
    }

    // 7) Read form data
    let form: FormData;

    try {
      form = await req.formData();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "تعذر قراءة نموذج الرفع.",
        },
        400
      );
    }

    const fileValue = form.get("file");

    if (!isFileLike(fileValue)) {
      return jsonResponse(
        {
          ok: false,
          error: "لا يوجد ملف مرفق صالح.",
        },
        400
      );
    }

    const uploadedFile = fileValue;

    const kind = normalizeKind(form.get("kind"));

    if (!kind) {
      return jsonResponse(
        {
          ok: false,
          error: "نوع الملف غير مدعوم. المسموح: image أو audio أو doc.",
        },
        400
      );
    }

    const maxBytes = maxBytesForKind(kind);

    if (uploadedFile.size === 0) {
      return jsonResponse(
        {
          ok: false,
          error: "الملف فارغ.",
        },
        400
      );
    }

    if (uploadedFile.size > maxBytes) {
      return jsonResponse(
        {
          ok: false,
          error: `حجم الملف أكبر من الحد المسموح (${Math.floor(
            maxBytes / (1024 * 1024)
          )}MB).`,
        },
        413
      );
    }

    // 8) Read buffer
    let buffer: ArrayBuffer;

    try {
      buffer = await uploadedFile.arrayBuffer();
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "تعذر قراءة الملف.",
        },
        400
      );
    }

    if (buffer.byteLength === 0) {
      return jsonResponse(
        {
          ok: false,
          error: "الملف فارغ.",
        },
        400
      );
    }

    if (buffer.byteLength > maxBytes) {
      return jsonResponse(
        {
          ok: false,
          error: "حجم الملف أكبر من الحد المسموح.",
        },
        413
      );
    }

    // 9) Extension validation
    const ext = extractSafeExtension(uploadedFile.name, kind);

    if (!ext) {
      return jsonResponse(
        {
          ok: false,
          error: "امتداد الملف غير مسموح.",
        },
        400
      );
    }

    // 10) MIME validation
    const mime = resolveMime(kind, ext, uploadedFile.type || "");

    if (!mime) {
      return jsonResponse(
        {
          ok: false,
          error: "نوع الملف غير مطابق للامتداد المسموح.",
        },
        400
      );
    }

    // 11) Magic bytes validation
    if (!validateMagicBytes(kind, ext, buffer)) {
      return jsonResponse(
        {
          ok: false,
          error: "محتوى الملف غير مطابق للنوع المطلوب.",
        },
        400
      );
    }

    // 12) Build safe storage path
    const folder = KIND_TO_FOLDER[kind];
    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const path = `${folder}/${fileName}`;

    const bytes = new Uint8Array(buffer);

    // 13) Upload
    let uploadResult = await uploadToStorage(auth.supabase, path, bytes, mime);

    if (
      !uploadResult.ok &&
      uploadResult.error &&
      isBucketNotFoundError(uploadResult.error) &&
      AUTO_CREATE_BUCKET
    ) {
      await ensureBucketExists(auth.supabase);
      uploadResult = await uploadToStorage(auth.supabase, path, bytes, mime);
    }

    if (!uploadResult.ok) {
      console.error("[Upload] storage upload error:", uploadResult.error);

      return jsonResponse(
        {
          ok: false,
          error: "فشل رفع الملف. حاول لاحقًا.",
        },
        500
      );
    }

    // 14) Public URL
    const publicUrlResult = auth.supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    const publicUrl =
      publicUrlResult?.data?.publicUrl ||
      `${env("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}/${path}`;

    // 15) Audit log
    await logUpload(auth.supabase, {
      adminId: auth.session.userId,
      adminEmail: auth.session.email,
      path,
      kind,
      originalName: sanitizeSingleLine(uploadedFile.name, 255) || "upload",
      mime,
      sizeBytes: buffer.byteLength,
      ip,
      userAgent,
    });

    return jsonResponse(
      {
        ok: true,
        url: publicUrl,
        path,
        bucket: BUCKET,
        kind,
        mime,
        ext,
        size: buffer.byteLength,
      },
      200,
      {
        "X-RateLimit-Limit": String(MAX_UPLOADS_PER_ADMIN),
        "X-RateLimit-Remaining": String(adminRate.remaining),
      }
    );
  } catch (error) {
    console.error("[Upload] Unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع أثناء الرفع.",
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