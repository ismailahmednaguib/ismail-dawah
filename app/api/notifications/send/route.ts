// app/api/notifications/send/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";
import webpush from "web-push";

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

const MAX_BODY_BYTES = positiveNumber(
  process.env.NOTIFICATION_MAX_BODY_BYTES,
  20_000
);

const RATE_WINDOW_MS = positiveNumber(
  process.env.NOTIFICATION_RATE_WINDOW_MS,
  10 * 60 * 1000
);

const MAX_REQUESTS_PER_IP = positiveNumber(
  process.env.NOTIFICATION_MAX_REQUESTS_PER_IP,
  5
);

const MAX_RATE_STORE_SIZE = 2_000;

const DB_TIMEOUT_MS = positiveNumber(
  process.env.NOTIFICATION_DB_TIMEOUT_MS,
  5_000
);

const SEND_TIMEOUT_MS = positiveNumber(
  process.env.NOTIFICATION_SEND_TIMEOUT_MS,
  6_000
);

const OVERALL_TIMEOUT_MS = positiveNumber(
  process.env.NOTIFICATION_OVERALL_TIMEOUT_MS,
  25_000
);

const MAX_RECIPIENTS_PER_REQUEST = positiveNumber(
  process.env.NOTIFICATION_MAX_RECIPIENTS_PER_REQUEST,
  200
);

const SEND_CONCURRENCY = positiveNumber(
  process.env.NOTIFICATION_CONCURRENCY,
  10
);

const MAX_TITLE_LENGTH = positiveNumber(
  process.env.NOTIFICATION_MAX_TITLE_LENGTH,
  120
);

const MAX_BODY_LENGTH = positiveNumber(
  process.env.NOTIFICATION_MAX_BODY_LENGTH,
  250
);

const MAX_URL_LENGTH = 2_048;

// Web Push payload limit is usually 4096 bytes. Keep a safe margin.
const MAX_PAYLOAD_BYTES = 3_800;

const DRY_RUN = env("NOTIFICATION_DRY_RUN") === "true";

/**
 * السماح مؤقتًا بالجلسات القديمة غير الموقّعة Base64.
 *
 * ⚠️ لا تفعّلها في الإنتاج إلا أثناء الترحيل.
 */
const ALLOW_LEGACY_SESSIONS = env("ALLOW_LEGACY_SESSIONS") === "true";

/**
 * السماح بطلبات بدون Origin header.
 *
 * ⚠️ في الإنتاج يُفضَّل تركه false.
 */
const ALLOW_MISSING_ORIGIN =
  env("NOTIFICATION_ALLOW_MISSING_ORIGIN") === "true";

// ============================================================
// VAPID Setup
// ============================================================

const VAPID_PUBLIC_KEY =
  env("VAPID_PUBLIC_KEY") ||
  env("NEXT_PUBLIC_VAPID_PUBLIC_KEY");

const VAPID_PRIVATE_KEY = env("VAPID_PRIVATE_KEY");

const VAPID_SUBJECT =
  env("VAPID_SUBJECT") ||
  env("NEXT_PUBLIC_VAPID_SUBJECT") ||
  "mailto:admin@ismail-dawah.com";

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) {
    return true;
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false;
  }

  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    vapidConfigured = true;
    return true;
  } catch (error) {
    console.error("[Notifications] Failed to configure VAPID:", error);
    return false;
  }
}

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

type PushSubscriptionRow = {
  id: string | number;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string | null;
};

type SendSummary = {
  sent: number;
  failed: number;
  deactivated: number;
  skipped: number;
};

// ============================================================
// Global in-memory Rate Limiter
// ملاحظة: في الإنتاج مع Serverless يفضَّل استخدام Redis/Upstash
// ============================================================

const globalRef = globalThis as typeof globalThis & {
  __notificationsRateLimit?: Map<string, RateRecord>;
};

const rateLimitStore =
  globalRef.__notificationsRateLimit ?? new Map<string, RateRecord>();

globalRef.__notificationsRateLimit = rateLimitStore;

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

function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
} {
  cleanupRateLimitStore();

  const now = Date.now();
  const key = `notifications:${ip}`;
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

function getSiteOrigin(): string | null {
  const raw = env("NEXT_PUBLIC_SITE_URL");

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
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

  const envHosts = env("NOTIFICATION_ALLOWED_HOSTS");
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

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("172.16.") ||
    host.startsWith("172.17.") ||
    host.startsWith("172.18.") ||
    host.startsWith("172.19.") ||
    host.startsWith("172.2") ||
    host.startsWith("172.30.") ||
    host.startsWith("172.31.")
  ) {
    return true;
  }

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }

  if (host.includes(":")) {
    return true;
  }

  return false;
}

function getAllowedExternalHosts(): string[] {
  const hosts = new Set<string>();

  const siteHost = getHostname(env("NEXT_PUBLIC_SITE_URL"));
  if (siteHost) {
    hosts.add(siteHost);
  }

  const envHosts = env("NOTIFICATION_ALLOWED_EXTERNAL_HOSTS");
  for (const host of envHosts.split(",")) {
    const clean = host.trim().toLowerCase();
    if (clean) {
      hosts.add(clean);
    }
  }

  return Array.from(hosts);
}

function normalizeNotificationUrl(value: unknown): string | null {
  const raw = sanitizeText(value, MAX_URL_LENGTH);

  if (!raw) {
    return null;
  }

  // منع الروابط الخطرة
  if (/^(javascript|data|blob|file):/i.test(raw)) {
    return null;
  }

  // منع protocol-relative مثل //evil.com
  if (raw.startsWith("//")) {
    return null;
  }

  // السماح بالروابط الداخلية وتحويلها إلى absolute إن أمكن
  if (raw.startsWith("/")) {
    const siteOrigin = getSiteOrigin();
    return siteOrigin ? `${siteOrigin}${raw}` : raw;
  }

  try {
    const url = new URL(raw);

    if (isProduction && url.protocol !== "https:") {
      return null;
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    const hostname = url.hostname.toLowerCase();

    if (isPrivateOrLocalHostname(hostname)) {
      return null;
    }

    const allowedHosts = getAllowedExternalHosts();

    const allowed = allowedHosts.some((allowedHost) => {
      return (
        hostname === allowedHost ||
        hostname.endsWith(`.${allowedHost}`)
      );
    });

    if (!allowed) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
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

function getErrorStatus(error: unknown): number {
  const e = error as any;
  return Number(e?.statusCode ?? e?.status ?? 0);
}

function getErrorMessage(error: unknown): string {
  return String((error as any)?.message || error || "");
}

function shouldDeactivateSubscription(error: unknown): boolean {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error).toLowerCase();

  return (
    status === 404 ||
    status === 410 ||
    message.includes("not found") ||
    message.includes("gone") ||
    message.includes("invalid endpoint")
  );
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
    ) as SessionPayload;

    const role = String(payload.role || payload.type || "")
      .trim()
      .toLowerCase();

    const userId = normalizeUserId(payload.userId);

    if (!userId || !expectedRoles.includes(role)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp === "number" &&
      Number.isFinite(payload.exp) &&
      payload.exp <= now
    ) {
      return null;
    }

    if (
      typeof payload.iat === "number" &&
      Number.isFinite(payload.iat) &&
      payload.iat > now + 60
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
      Buffer.from(token, "base64url").toString("utf8")
    ) as SessionPayload;

    const role = String(payload.role || payload.type || "")
      .trim()
      .toLowerCase();

    const userId = normalizeUserId(payload.userId);

    if (!userId || role !== "admin") {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp === "number" &&
      Number.isFinite(payload.exp) &&
      payload.exp <= now
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

  const legacyCandidates: Array<{
    token: string | undefined;
    source: "legacy";
  }> = [
    { token: adminToken, source: "legacy" },
    { token: userToken, source: "legacy" },
    { token: sessionToken, source: "legacy" },
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
  supabase: SupabaseClient,
  candidate: AdminCandidate
): Promise<boolean> {
  try {
    const adminAttempts = [
      "id, is_active",
      "id",
    ];

    for (const select of adminAttempts) {
      try {
        const query = supabase
          .from("admin_users")
          .select(select)
          .eq("id", candidate.userId)
          .maybeSingle() as unknown as PromiseLike<any>;

        const result = await withTimeout(
          query,
          DB_TIMEOUT_MS,
          "admin_active_check"
        );

        const error = (result as any)?.error;

        if (!error) {
          const data = (result as any)?.data;

          if (!data) {
            return false;
          }

          if (data.is_active === false) {
            return false;
          }

          return true;
        }

        if (
          isMissingColumnError(error, "is_active")
        ) {
          continue;
        }

        if (isMissingTableError(error)) {
          break;
        }

        console.error("[Notifications] admin active check error:", error);
        return candidate.signed;
      } catch (error) {
        console.error("[Notifications] admin active check exception:", error);
        return candidate.signed;
      }
    }

    // fallback إلى جدول users إذا لم يوجد admin_users
    const userAttempts = [
      "id, role, is_active",
      "id, role",
      "id",
    ];

    for (const select of userAttempts) {
      try {
        const query = supabase
          .from("users")
          .select(select)
          .eq("id", candidate.userId)
          .maybeSingle() as unknown as PromiseLike<any>;

        const result = await withTimeout(
          query,
          DB_TIMEOUT_MS,
          "users_admin_check"
        );

        const error = (result as any)?.error;

        if (!error) {
          const data = (result as any)?.data;

          if (!data) {
            return false;
          }

          const role = String(data.role || "").trim().toLowerCase();

          if (role && role !== "admin") {
            return false;
          }

          if (data.is_active === false) {
            return false;
          }

          return true;
        }

        if (
          isMissingColumnError(error, "is_active") ||
          isMissingColumnError(error, "role")
        ) {
          continue;
        }

        if (isMissingTableError(error)) {
          return candidate.signed;
        }

        console.error("[Notifications] users admin check error:", error);
        return candidate.signed;
      } catch (error) {
        console.error("[Notifications] users admin check exception:", error);
        return candidate.signed;
      }
    }

    return candidate.signed;
  } catch (error) {
    console.error("[Notifications] ensureAdminActive unexpected error:", error);
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
    // لو قاعدة البيانات غير مهيأة، نسمح فقط بالجلسات الموقّعة
    // حتى لا ننهار تمامًا أثناء الترحيل.
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
// Push Subscriptions
// ============================================================

async function fetchActiveSubscriptions(
  supabase: SupabaseClient
): Promise<{ data: PushSubscriptionRow[]; error: string | null }> {
  const attempts: Array<{
    select: string;
    filterActive: boolean;
    order: boolean;
  }> = [
    {
      select: "id, endpoint, p256dh, auth, user_id, active",
      filterActive: true,
      order: true,
    },
    {
      select: "id, endpoint, p256dh, auth, user_id",
      filterActive: false,
      order: true,
    },
    {
      select: "id, endpoint, p256dh, auth",
      filterActive: false,
      order: false,
    },
  ];

  for (const attempt of attempts) {
    try {
      let query = supabase
        .from("push_subscriptions")
        .select(attempt.select) as any;

      if (attempt.filterActive) {
        query = query.eq("active", true);
      }

      if (attempt.order) {
        query = query.order("id", { ascending: true });
      }

      query = query.limit(MAX_RECIPIENTS_PER_REQUEST);

      const result = await withTimeout(
        query as unknown as PromiseLike<any>,
        DB_TIMEOUT_MS,
        "fetch_push_subscriptions"
      );

      const error = (result as any)?.error;

      if (!error) {
        const rows = Array.isArray((result as any)?.data)
          ? (result as any).data
          : [];

        const validRows: PushSubscriptionRow[] = rows
          .filter((row: any) => {
            if (!row) return false;

            if (row.active === false) {
              return false;
            }

            return (
              typeof row.endpoint === "string" &&
              row.endpoint.trim() &&
              typeof row.p256dh === "string" &&
              row.p256dh.trim() &&
              typeof row.auth === "string" &&
              row.auth.trim()
            );
          })
          .map((row: any) => ({
            id: row.id,
            endpoint: String(row.endpoint).trim(),
            p256dh: String(row.p256dh).trim(),
            auth: String(row.auth).trim(),
            user_id: row.user_id ?? null,
          }));

        return {
          data: validRows,
          error: null,
        };
      }

      if (
        isMissingColumnError(error, "active") ||
        isMissingColumnError(error, "user_id") ||
        isMissingColumnError(error, "id")
      ) {
        continue;
      }

      if (isMissingTableError(error)) {
        return {
          data: [],
          error: "جدول اشتراكات الإشعارات غير موجود. نفّذ SQL المطلوب أولًا.",
        };
      }

      console.error("[Notifications] fetch subscriptions error:", error);

      return {
        data: [],
        error: "تعذر جلب اشتراكات الإشعارات.",
      };
    } catch (error) {
      console.error(
        "[Notifications] unexpected fetch subscriptions error:",
        error
      );

      return {
        data: [],
        error: "تعذر جلب اشتراكات الإشعارات.",
      };
    }
  }

  return {
    data: [],
    error: "تعذر جلب اشتراكات الإشعارات.",
  };
}

async function deactivateSubscription(
  supabase: SupabaseClient,
  id: string | number
): Promise<void> {
  const attempts: Array<Record<string, unknown>> = [
    {
      active: false,
      updated_at: new Date().toISOString(),
    },
    {
      active: false,
    },
  ];

  for (const payload of attempts) {
    try {
      const query = supabase
        .from("push_subscriptions")
        .update(payload)
        .eq("id", id) as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        2_000,
        "deactivate_subscription"
      );

      const error = (result as any)?.error;

      if (!error) {
        return;
      }

      if (
        isMissingColumnError(error, "updated_at") ||
        isMissingColumnError(error, "active")
      ) {
        continue;
      }

      console.warn("[Notifications] failed to deactivate subscription:", id, error);
      return;
    } catch (error) {
      console.warn(
        "[Notifications] unexpected deactivate subscription error:",
        id,
        error
      );
      return;
    }
  }
}

function buildWebPushSubscription(row: PushSubscriptionRow) {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  };
}

async function sendOneNotification(
  row: PushSubscriptionRow,
  payload: string
): Promise<"sent" | "failed" | "deactivated"> {
  if (DRY_RUN) {
    return "sent";
  }

  const sendPromise = webpush.sendNotification(
    buildWebPushSubscription(row),
    payload,
    {
      TTL: 3600,
      urgency: "high",
      topic: "ismail-dawah",
    }
  );

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("send_timeout"));
    }, SEND_TIMEOUT_MS);
  });

  try {
    await Promise.race([sendPromise, timeoutPromise]);
    return "sent";
  } catch (error) {
    if (shouldDeactivateSubscription(error)) {
      return "deactivated";
    }

    return "failed";
  }
}

async function sendBatch(
  rows: PushSubscriptionRow[],
  payload: string,
  supabase: SupabaseClient,
  startedAt: number
): Promise<SendSummary> {
  const summary: SendSummary = {
    sent: 0,
    failed: 0,
    deactivated: 0,
    skipped: 0,
  };

  for (let i = 0; i < rows.length; i += SEND_CONCURRENCY) {
    const elapsed = Date.now() - startedAt;

    // اترك هامشًا للرد النهائي وتسجيل audit
    if (elapsed > OVERALL_TIMEOUT_MS - 1_500) {
      summary.skipped += rows.length - i;
      break;
    }

    const chunk = rows.slice(i, i + SEND_CONCURRENCY);

    const results = await Promise.all(
      chunk.map(async (row) => {
        const result = await sendOneNotification(row, payload);

        if (result === "deactivated") {
          await deactivateSubscription(supabase, row.id);
        }

        return result;
      })
    );

    for (const result of results) {
      if (result === "sent") {
        summary.sent += 1;
      } else if (result === "deactivated") {
        summary.deactivated += 1;
      } else {
        summary.failed += 1;
      }
    }
  }

  return summary;
}

// ============================================================
// Payload Size Guard
// ============================================================

function buildNotificationPayload(
  title: string,
  body: string,
  url: string | null
): { payloadString: string; finalBody: string; truncated: boolean } {
  const makePayload = (b: string) =>
    JSON.stringify({
      title,
      body: b,
      ...(url ? { url } : {}),
    });

  let finalBody = body;
  let payloadString = makePayload(finalBody);

  while (
    Buffer.byteLength(payloadString, "utf8") > MAX_PAYLOAD_BYTES &&
    finalBody.length > 20
  ) {
    finalBody = finalBody.slice(0, Math.max(20, Math.floor(finalBody.length * 0.85)));
    payloadString = makePayload(finalBody);
  }

  // إذا ما زال كبيرًا، قلّص العنوان أيضًا
  if (Buffer.byteLength(payloadString, "utf8") > MAX_PAYLOAD_BYTES) {
    let shortTitle = title;

    while (
      Buffer.byteLength(
        JSON.stringify({
          title: shortTitle,
          body: finalBody,
          ...(url ? { url } : {}),
        }),
        "utf8"
      ) > MAX_PAYLOAD_BYTES &&
      shortTitle.length > 10
    ) {
      shortTitle = shortTitle.slice(0, Math.max(10, Math.floor(shortTitle.length * 0.85)));
    }

    payloadString = JSON.stringify({
      title: shortTitle,
      body: finalBody,
      ...(url ? { url } : {}),
    });
  }

  return {
    payloadString,
    finalBody,
    truncated: finalBody !== body,
  };
}

// ============================================================
// Audit Log
// ============================================================

async function logNotificationSend(
  supabase: SupabaseClient,
  params: {
    adminId: string;
    adminEmail: string | null;
    title: string;
    body: string;
    url: string | null;
    total: number;
    sent: number;
    failed: number;
    deactivated: number;
    skipped: number;
    ip: string;
    userAgent: string;
    dryRun: boolean;
  }
): Promise<void> {
  const rows: Array<Record<string, unknown>> = [
    {
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      title: params.title,
      body: params.body,
      url: params.url,
      total_recipients: params.total,
      sent: params.sent,
      failed: params.failed,
      deactivated: params.deactivated,
      skipped: params.skipped,
      ip: params.ip,
      user_agent: params.userAgent,
      dry_run: params.dryRun,
      created_at: new Date().toISOString(),
    },
    {
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      title: params.title,
      body: params.body,
      url: params.url,
      total_recipients: params.total,
      sent: params.sent,
      failed: params.failed,
      deactivated: params.deactivated,
      skipped: params.skipped,
      ip: params.ip,
      user_agent: params.userAgent,
      dry_run: params.dryRun,
    },
    {
      admin_id: params.adminId,
      title: params.title,
      body: params.body,
      url: params.url,
      total_recipients: params.total,
      sent: params.sent,
      failed: params.failed,
      deactivated: params.deactivated,
      skipped: params.skipped,
      created_at: new Date().toISOString(),
    },
    {
      admin_id: params.adminId,
      title: params.title,
      body: params.body,
      sent: params.sent,
      failed: params.failed,
    },
    {
      title: params.title,
      body: params.body,
      sent: params.sent,
      failed: params.failed,
    },
  ];

  for (const row of rows) {
    try {
      const query = supabase
        .from("admin_notification_logs")
        .insert(row) as unknown as PromiseLike<any>;

      const result = await withTimeout(
        query,
        DB_TIMEOUT_MS,
        "notification_audit"
      );

      const error = (result as any)?.error;

      if (!error) {
        return;
      }

      if (isMissingTableError(error)) {
        return;
      }

      if (
        isMissingColumnError(error, "admin_email") ||
        isMissingColumnError(error, "url") ||
        isMissingColumnError(error, "total_recipients") ||
        isMissingColumnError(error, "deactivated") ||
        isMissingColumnError(error, "skipped") ||
        isMissingColumnError(error, "ip") ||
        isMissingColumnError(error, "user_agent") ||
        isMissingColumnError(error, "dry_run") ||
        isMissingColumnError(error, "created_at")
      ) {
        continue;
      }

      console.warn("[Notifications] failed to write audit log:", error);
      return;
    } catch (error) {
      console.warn("[Notifications] unexpected audit log error:", error);
      return;
    }
  }
}

// ============================================================
// POST /api/notifications/send
// ============================================================

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);
  const startedAt = Date.now();

  try {
    // 1) Origin check
    if (!isAllowedOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          error: "origin_not_allowed",
        },
        403
      );
    }

    // 2) Rate Limiting
    const rate = checkRateLimit(ip);

    if (!rate.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: "عدد مرات الإرسال كثير جدًا. حاول لاحقًا.",
          retryAfter: rate.retryAfter,
        },
        429,
        {
          "Retry-After": String(rate.retryAfter || Math.ceil(RATE_WINDOW_MS / 1000)),
          "X-RateLimit-Limit": String(MAX_REQUESTS_PER_IP),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    // 3) Body size guard
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

    // 4) Authentication
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

    // 5) VAPID check unless dry run
    if (!DRY_RUN && !ensureVapid()) {
      console.error("[Notifications] VAPID keys are not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "إعدادات الإشعارات غير مهيأة. تواصل مع المسؤول.",
        },
        503
      );
    }

    // 6) Supabase check
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.error("[Notifications] Supabase is not configured.");

      return jsonResponse(
        {
          ok: false,
          error: "قاعدة البيانات غير مهيأة. حاول لاحقًا.",
        },
        503
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

    const payloadInput = bodyInput as Record<string, unknown>;

    const title = sanitizeText(payloadInput.title, MAX_TITLE_LENGTH);
    const body = sanitizeText(payloadInput.body, MAX_BODY_LENGTH);
    const url = normalizeNotificationUrl(payloadInput.url);

    if (!title || !body) {
      return jsonResponse(
        {
          ok: false,
          error: "عنوان الإشعار ونصه مطلوبان.",
        },
        400
      );
    }

    // 8) Fetch subscriptions
    const { data: subscriptions, error: subscriptionError } =
      await fetchActiveSubscriptions(supabase);

    if (subscriptionError) {
      return jsonResponse(
        {
          ok: false,
          error: subscriptionError,
        },
        503
      );
    }

    if (subscriptions.length === 0) {
      await logNotificationSend(supabase, {
        adminId: auth.candidate.userId,
        adminEmail: auth.candidate.email,
        title,
        body,
        url,
        total: 0,
        sent: 0,
        failed: 0,
        deactivated: 0,
        skipped: 0,
        ip,
        userAgent,
        dryRun: DRY_RUN,
      });

      return jsonResponse({
        ok: true,
        sent: 0,
        failed: 0,
        deactivated: 0,
        skipped: 0,
        total: 0,
        message: "لا يوجد مشتركون نشطون حاليًا.",
        title,
        body,
        url,
        dry_run: DRY_RUN,
      });
    }

    // 9) Build payload with size guard
    const built = buildNotificationPayload(title, body, url);

    // 10) Send
    const summary = await sendBatch(
      subscriptions,
      built.payloadString,
      supabase,
      startedAt
    );

    // 11) Audit log
    await logNotificationSend(supabase, {
      adminId: auth.candidate.userId,
      adminEmail: auth.candidate.email,
      title,
      body: built.finalBody,
      url,
      total: subscriptions.length,
      sent: summary.sent,
      failed: summary.failed,
      deactivated: summary.deactivated,
      skipped: summary.skipped,
      ip,
      userAgent,
      dryRun: DRY_RUN,
    });

    let message: string;

    if (DRY_RUN) {
      message = "وضع تجريبي: تم محاكاة الإرسال بدون إرسال فعلي.";
    } else if (summary.skipped > 0) {
      message =
        "تم إرسال الإشعار لبعض المشتركين، وتم تخطي الباقي بسبب حد الزمن. جرّب تقسيم الإرسال على دفعات.";
    } else if (summary.sent > 0 && summary.failed === 0) {
      message = "تم إرسال الإشعار بنجاح.";
    } else if (summary.sent > 0 && summary.failed > 0) {
      message = "تم إرسال الإشعار لبعض المشتركين وفشل لبعضهم الآخر.";
    } else if (summary.failed > 0) {
      message = "تعذر إرسال الإشعار للمشتركين.";
    } else {
      message = "لم يتم إرسال أي إشعار.";
    }

    return jsonResponse(
      {
        ok: true,
        sent: summary.sent,
        failed: summary.failed,
        deactivated: summary.deactivated,
        skipped: summary.skipped,
        total: subscriptions.length,
        message,
        title,
        body: built.finalBody,
        url,
        truncated: built.truncated,
        dry_run: DRY_RUN,
      },
      200,
      {
        "X-RateLimit-Limit": String(MAX_REQUESTS_PER_IP),
        "X-RateLimit-Remaining": String(rate.remaining),
      }
    );
  } catch (error) {
    console.error("[Notifications] unexpected error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "خطأ غير متوقع أثناء إرسال الإشعار.",
      },
      500
    );
  }
}

// ============================================================
// GET: Method Not Allowed
// ============================================================

export async function GET() {
  return jsonResponse(
    {
      ok: false,
      error: "Method not allowed",
    },
    405,
    {
      Allow: "POST, OPTIONS",
    }
  );
}

// ============================================================
// OPTIONS: Preflight support
// ============================================================

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  const headers: Record<string, string> = {
    Allow: "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  };

  // لا نستخدم wildcard مع cookies. إذا كانت الطلبات same-origin فهذا غير ضروري.
  // لكن إذا احتجت CORS داخلي، أضف origin المسموح عبر NOTIFICATION_ALLOWED_HOSTS.
  if (origin && isAllowedOrigin(req)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}