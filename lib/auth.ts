// lib/auth.ts
// ⚠️ Server-only + Node.js runtime.
// لا تستورده داخل Client Components أو Edge Middleware.
// إذا تحتاج Supabase Auth في المتصفح، استخدم lib/auth-client.ts.

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createHash,
  createHmac,
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2) as (
  password: string,
  salt: string,
  iterations: number,
  keylen: number,
  digest: string
) => Promise<Buffer>;

// ============================================================
// Types
// ============================================================

export type Role = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  last_login: string | null;
  token_version?: number | null;
}

type SessionPayload = {
  userId: string;
  role: Role;
  email?: string | null;
  iat: number;
  exp: number;
  jti: string;
  v?: number;
  tv?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
};

type AuthState = {
  profile: UserProfile;
  tokenVersion: number | null;
};

type CookieSource = string | Request | null | undefined;

export type AuthRouteResult =
  | { ok: true; user: UserProfile }
  | { ok: false; response: NextResponse };

// ============================================================
// Cookie names
// ============================================================

export const ADMIN_SESSION_COOKIE = "admin_session";
export const USER_SESSION_COOKIE = "user_session";
export const LEGACY_SESSION_COOKIE = "session";

// ============================================================
// Configuration
// ============================================================

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const ADMIN_SESSION_MAX_AGE = positiveNumber(
  process.env.ADMIN_SESSION_MAX_AGE,
  8 * 60 * 60
);

export const USER_SESSION_MAX_AGE = positiveNumber(
  process.env.USER_SESSION_MAX_AGE,
  30 * 24 * 60 * 60
);

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

const SESSION_VERSION = 1;
const MIN_SECRET_LENGTH = 32;
const MAX_TOKEN_LENGTH = 8192;
const MAX_USER_ID_LENGTH = 255;
const CLOCK_SKEW_SECONDS = 30;

const SESSION_HEADER = {
  alg: "HS256",
  typ: "session",
} as const;

// ============================================================
// Env helpers
// ============================================================

const warnedSecrets = new Set<string>();

function getTrimmedEnv(name: string): string {
  return process.env[name]?.trim() || "";
}

function warnIfWeakSecret(name: string, secret: string): void {
  if (!secret || secret.length >= MIN_SECRET_LENGTH) {
    return;
  }

  const key = `${name}:${secret.length}`;

  if (warnedSecrets.has(key)) {
    return;
  }

  warnedSecrets.add(key);

  console.warn(
    `[Auth] Weak session secret detected for ${name}. ` +
      `Use a random secret with at least ${MIN_SECRET_LENGTH} characters.`
  );
}

function getSupabaseUrl(): string {
  return (
    getTrimmedEnv("SUPABASE_URL") ||
    getTrimmedEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
}

function getServiceKey(): string {
  return (
    getTrimmedEnv("SUPABASE_SERVICE_KEY") ||
    getTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function getAnonKey(): string {
  return getTrimmedEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

function getSecretForRole(role: Role): string {
  const appSecret = getTrimmedEnv("APP_SESSION_SECRET");
  const jwtSecret = getTrimmedEnv("JWT_SECRET");

  let secret = "";
  let secretName = "";

  if (role === "admin") {
    secret =
      getTrimmedEnv("ADMIN_SESSION_SECRET") || appSecret || jwtSecret || "";
    secretName = getTrimmedEnv("ADMIN_SESSION_SECRET")
      ? "ADMIN_SESSION_SECRET"
      : appSecret
      ? "APP_SESSION_SECRET"
      : "JWT_SECRET";
  } else {
    secret =
      getTrimmedEnv("USER_SESSION_SECRET") || appSecret || jwtSecret || "";
    secretName = getTrimmedEnv("USER_SESSION_SECRET")
      ? "USER_SESSION_SECRET"
      : appSecret
      ? "APP_SESSION_SECRET"
      : "JWT_SECRET";
  }

  if (secret) {
    warnIfWeakSecret(secretName, secret);
  }

  return secret;
}

function getCookieDomain(): string | undefined {
  return getTrimmedEnv("AUTH_COOKIE_DOMAIN") || undefined;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// ============================================================
// Supabase clients
// ============================================================

let adminClientInstance: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (adminClientInstance) {
    return adminClientInstance;
  }

  const url = getSupabaseUrl();
  const key = getServiceKey();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server env: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  adminClientInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClientInstance;
}

export async function createServerClient(): Promise<SupabaseClient> {
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  let accessToken: string | null = null;

  try {
    const cookieStore = (await cookies()) as any;
    accessToken = cookieStore.get?.("sb-access-token")?.value ?? null;
  } catch {
    accessToken = null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

/**
 * ⚠️ لا تستخدم هذا في السيرفر.
 * إذا كنت تحتاج Supabase Auth في المتصفح، أنشئ lib/auth-client.ts.
 */
export function createBrowserClient(): SupabaseClient {
  throw new Error(
    "createBrowserClient() is not available in server-only lib/auth.ts. Use lib/auth-client.ts in the browser."
  );
}

// ============================================================
// Base64URL helpers
// ============================================================

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
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

// ============================================================
// Signed session helpers
// ============================================================

export function signSession(
  payload: Record<string, unknown>,
  secret: string
): string {
  if (!secret) {
    throw new Error("Missing session secret");
  }

  const header = toBase64Url(JSON.stringify(SESSION_HEADER));
  const body = toBase64Url(JSON.stringify(payload));

  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function normalizeRole(value: unknown): Role | null {
  const role = String(value || "").trim().toLowerCase();

  if (role === "admin" || role === "user") {
    return role;
  }

  return null;
}

export function verifySignedSession(
  token: string | undefined | null,
  secret: string,
  expectedRoles: Role[] = []
): SessionPayload | null {
  if (!token || !secret) {
    return null;
  }

  if (token.length > MAX_TOKEN_LENGTH) {
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

    const headerJson = JSON.parse(fromBase64Url(header)) as Record<
      string,
      unknown
    >;

    if (
      headerJson?.alg !== SESSION_HEADER.alg ||
      headerJson?.typ !== SESSION_HEADER.typ
    ) {
      return null;
    }

    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const role = normalizeRole(payload.role);

    if (!role) {
      return null;
    }

    if (expectedRoles.length > 0 && !expectedRoles.includes(role)) {
      return null;
    }

    const userId =
      typeof payload.userId === "string" ? payload.userId.trim() : "";

    if (!userId || userId.length > MAX_USER_ID_LENGTH) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    if (
      typeof payload.iat === "number" &&
      Number.isFinite(payload.iat) &&
      payload.iat > now + CLOCK_SKEW_SECONDS
    ) {
      return null;
    }

    const configuredIssuer = getTrimmedEnv("SESSION_ISSUER");
    if (configuredIssuer && payload.iss !== configuredIssuer) {
      return null;
    }

    const configuredAudience = getTrimmedEnv("SESSION_AUDIENCE");
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

function createSignedToken(
  userId: string,
  role: Role,
  secret: string,
  maxAge: number,
  extra: Record<string, unknown> = {}
): string {
  const now = Math.floor(Date.now() / 1000);

  const payload: SessionPayload = {
    userId: String(userId),
    role,
    iat: now,
    exp: now + maxAge,
    jti: randomBytes(16).toString("hex"),
    v: SESSION_VERSION,
    ...extra,
  };

  const issuer = getTrimmedEnv("SESSION_ISSUER");
  if (issuer) {
    payload.iss = issuer;
  }

  const audience = getTrimmedEnv("SESSION_AUDIENCE");
  if (audience) {
    payload.aud = audience;
  }

  return signSession(payload, secret);
}

export function createSession(
  userId: string,
  role: Role = "user",
  extra: Record<string, unknown> = {}
): string {
  const secret = getSecretForRole(role);

  if (!secret) {
    throw new Error(
      `Missing session secret for role: ${role}. Set USER_SESSION_SECRET or ADMIN_SESSION_SECRET or APP_SESSION_SECRET.`
    );
  }

  const maxAge =
    role === "admin" ? ADMIN_SESSION_MAX_AGE : USER_SESSION_MAX_AGE;

  return createSignedToken(String(userId), role, secret, maxAge, extra);
}

/**
 * الجلسات هنا stateless موقّعة، لذلك logout الحقيقي هو مسح الكوكيز.
 * هذه الدالة موجودة للتوافق فقط.
 */
export function destroySession(_token: string): void {
  // no-op
}

export function getSessionUserId(token?: string | null): string | null {
  if (!token) {
    return null;
  }

  const userSecret = getSecretForRole("user");
  const adminSecret = getSecretForRole("admin");

  const userPayload = verifySignedSession(token, userSecret, [
    "user",
    "admin",
  ]);

  if (userPayload?.userId) {
    return userPayload.userId;
  }

  const adminPayload = verifySignedSession(token, adminSecret, [
    "user",
    "admin",
  ]);

  if (adminPayload?.userId) {
    return adminPayload.userId;
  }

  return null;
}

export function sessionExtrasFromProfile(
  profile: UserProfile
): Record<string, unknown> {
  const extra: Record<string, unknown> = {};

  if (profile.email) {
    extra.email = profile.email;
  }

  if (typeof profile.token_version === "number") {
    extra.tv = profile.token_version;
  }

  return extra;
}

// ============================================================
// Cookie parsing
// ============================================================

function isRequestLike(value: unknown): value is Request {
  return typeof value === "object" && value !== null && "headers" in value;
}

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};

  for (const part of header.split(";")) {
    const eq = part.indexOf("=");

    if (eq === -1) {
      continue;
    }

    const key = part.slice(0, eq).trim();
    const rawValue = part.slice(eq + 1).trim();

    if (!key) {
      continue;
    }

    try {
      out[key] = decodeURIComponent(rawValue);
    } catch {
      out[key] = rawValue;
    }
  }

  return out;
}

async function getCookieCandidates(
  source?: CookieSource
): Promise<Record<string, string | null>> {
  const empty: Record<string, string | null> = {
    [ADMIN_SESSION_COOKIE]: null,
    [USER_SESSION_COOKIE]: null,
    [LEGACY_SESSION_COOKIE]: null,
  };

  if (typeof source === "string") {
    if (source.includes("=")) {
      const parsed = parseCookieHeader(source);

      return {
        [ADMIN_SESSION_COOKIE]: parsed[ADMIN_SESSION_COOKIE] ?? null,
        [USER_SESSION_COOKIE]: parsed[USER_SESSION_COOKIE] ?? null,
        [LEGACY_SESSION_COOKIE]: parsed[LEGACY_SESSION_COOKIE] ?? null,
      };
    }

    // لو تم تمرير token مباشر بدل cookie header
    return {
      [ADMIN_SESSION_COOKIE]: source,
      [USER_SESSION_COOKIE]: source,
      [LEGACY_SESSION_COOKIE]: source,
    };
  }

  if (isRequestLike(source)) {
    const cookieHeader = source.headers.get("cookie");

    if (cookieHeader) {
      const parsed = parseCookieHeader(cookieHeader);

      return {
        [ADMIN_SESSION_COOKIE]: parsed[ADMIN_SESSION_COOKIE] ?? null,
        [USER_SESSION_COOKIE]: parsed[USER_SESSION_COOKIE] ?? null,
        [LEGACY_SESSION_COOKIE]: parsed[LEGACY_SESSION_COOKIE] ?? null,
      };
    }

    return empty;
  }

  try {
    const cookieStore = (await cookies()) as any;

    return {
      [ADMIN_SESSION_COOKIE]:
        cookieStore.get?.(ADMIN_SESSION_COOKIE)?.value ?? null,
      [USER_SESSION_COOKIE]:
        cookieStore.get?.(USER_SESSION_COOKIE)?.value ?? null,
      [LEGACY_SESSION_COOKIE]:
        cookieStore.get?.(LEGACY_SESSION_COOKIE)?.value ?? null,
    };
  } catch {
    return empty;
  }
}

// ============================================================
// DB helpers
// ============================================================

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);

    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

function getTokenVersion(row: any): number | null {
  const raw =
    row?.token_version ?? row?.auth_version ?? row?.password_version ?? null;

  const num = Number(raw);

  return Number.isFinite(num) ? num : null;
}

function mapCustomUser(row: any, role: Role): UserProfile {
  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    full_name:
      typeof row.name === "string"
        ? row.name
        : typeof row.full_name === "string"
        ? row.full_name
        : null,
    avatar_url:
      typeof row.avatar_url === "string" ? row.avatar_url : null,
    role,
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString(),
    last_login:
      typeof row.last_login === "string" ? row.last_login : null,
    token_version: getTokenVersion(row),
  };
}

function mapProfileRow(row: any): UserProfile {
  const role = normalizeRole(row.role) ?? "user";

  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    full_name:
      typeof row.full_name === "string"
        ? row.full_name
        : typeof row.name === "string"
        ? row.name
        : null,
    avatar_url:
      typeof row.avatar_url === "string" ? row.avatar_url : null,
    role,
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString(),
    last_login:
      typeof row.last_login === "string" ? row.last_login : null,
    token_version: getTokenVersion(row),
  };
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

async function maybeSingle(
  client: SupabaseClient,
  table: string,
  columns: string,
  id: string | number
): Promise<{ data: any; error: any }> {
  return (await (client
    .from(table)
    .select(columns)
    .eq("id", id)
    .maybeSingle() as unknown as Promise<any>)) as {
    data: any;
    error: any;
  };
}

function isTokenVersionAccepted(
  payload: SessionPayload,
  dbTokenVersion: number | null
): boolean {
  if (dbTokenVersion == null) {
    return true;
  }

  const payloadVersion =
    typeof payload.tv === "number" && Number.isFinite(payload.tv)
      ? payload.tv
      : null;

  // للتوافق الرجعي: الجلسات القديمة التي لا تحمل tv تظل مقبولة.
  // الجلسات الجديدة التي تحمل tv يجب أن تطابق قاعدة البيانات.
  if (payloadVersion == null) {
    return true;
  }

  return payloadVersion === dbTokenVersion;
}

async function fetchAdminAuthState(
  userId: string
): Promise<AuthState | null> {
  let client: SupabaseClient;

  try {
    client = createAdminClient();
  } catch {
    return null;
  }

  const queryId = idForQuery(userId);

  const adminAttempts = [
    "id,email,name,is_active,created_at,token_version",
    "id,email,name,is_active,created_at",
    "id,email,name,created_at,token_version",
    "id,email,name,created_at",
  ];

  for (const columns of adminAttempts) {
    const res = await maybeSingle(client, "admin_users", columns, queryId);

    if (!res.error) {
      if (!res.data) {
        return null;
      }

      if (res.data.is_active === false) {
        return null;
      }

      return {
        profile: mapCustomUser(res.data, "admin"),
        tokenVersion: getTokenVersion(res.data),
      };
    }

    if (isMissingTableError(res.error)) {
      break;
    }

    if (
      isMissingColumnError(res.error, "token_version") ||
      isMissingColumnError(res.error, "is_active")
    ) {
      continue;
    }

    console.error("[Auth] fetchAdminAuthState admin_users error:", res.error);
    return null;
  }

  const userAttempts = [
    "id,email,name,role,is_active,created_at,token_version",
    "id,email,name,role,is_active,created_at",
    "id,email,name,role,created_at,token_version",
    "id,email,name,role,created_at",
    "id,email,name,created_at,token_version",
    "id,email,name,created_at",
  ];

  for (const columns of userAttempts) {
    const res = await maybeSingle(client, "users", columns, queryId);

    if (!res.error) {
      if (!res.data) {
        return null;
      }

      const role = normalizeRole(res.data.role);

      if (role && role !== "admin") {
        return null;
      }

      if (res.data.is_active === false) {
        return null;
      }

      return {
        profile: mapCustomUser(res.data, "admin"),
        tokenVersion: getTokenVersion(res.data),
      };
    }

    if (isMissingTableError(res.error)) {
      return null;
    }

    if (
      isMissingColumnError(res.error, "role") ||
      isMissingColumnError(res.error, "is_active") ||
      isMissingColumnError(res.error, "token_version")
    ) {
      continue;
    }

    console.error("[Auth] fetchAdminAuthState users error:", res.error);
    return null;
  }

  return null;
}

async function fetchUserAuthState(
  userId: string
): Promise<AuthState | null> {
  let client: SupabaseClient;

  try {
    client = createAdminClient();
  } catch {
    return null;
  }

  const queryId = idForQuery(userId);

  const userAttempts = [
    "id,email,name,role,is_active,created_at,token_version",
    "id,email,name,role,is_active,created_at",
    "id,email,name,role,created_at,token_version",
    "id,email,name,role,created_at",
    "id,email,name,created_at,token_version",
    "id,email,name,created_at",
  ];

  for (const columns of userAttempts) {
    const res = await maybeSingle(client, "users", columns, queryId);

    if (!res.error) {
      if (!res.data) {
        return null;
      }

      if (res.data.is_active === false) {
        return null;
      }

      const role = normalizeRole(res.data.role) ?? "user";

      if (role === "admin") {
        return null;
      }

      return {
        profile: mapCustomUser(res.data, "user"),
        tokenVersion: getTokenVersion(res.data),
      };
    }

    if (isMissingTableError(res.error)) {
      break;
    }

    if (
      isMissingColumnError(res.error, "role") ||
      isMissingColumnError(res.error, "is_active") ||
      isMissingColumnError(res.error, "token_version")
    ) {
      continue;
    }

    console.error("[Auth] fetchUserAuthState users error:", res.error);
    return null;
  }

  const profileAttempts = [
    "id,email,full_name,avatar_url,role,created_at,last_login,token_version",
    "id,email,full_name,avatar_url,role,created_at,last_login",
    "id,email,full_name,avatar_url,role,created_at",
    "id,email,full_name,avatar_url,created_at",
  ];

  for (const columns of profileAttempts) {
    const res = await maybeSingle(client, "profiles", columns, queryId);

    if (!res.error) {
      if (!res.data) {
        return null;
      }

      const role = normalizeRole(res.data.role) ?? "user";

      if (role === "admin") {
        return null;
      }

      return {
        profile: mapProfileRow(res.data),
        tokenVersion: getTokenVersion(res.data),
      };
    }

    if (isMissingTableError(res.error)) {
      return null;
    }

    if (
      isMissingColumnError(res.error, "role") ||
      isMissingColumnError(res.error, "token_version") ||
      isMissingColumnError(res.error, "last_login") ||
      isMissingColumnError(res.error, "avatar_url")
    ) {
      continue;
    }

    console.error("[Auth] fetchUserAuthState profiles error:", res.error);
    return null;
  }

  return null;
}

async function getProfileForPayload(
  payload: SessionPayload
): Promise<UserProfile | null> {
  const state =
    payload.role === "admin"
      ? await fetchAdminAuthState(payload.userId)
      : await fetchUserAuthState(payload.userId);

  if (!state) {
    return null;
  }

  if (state.profile.role !== payload.role) {
    return null;
  }

  if (!isTokenVersionAccepted(payload, state.tokenVersion)) {
    return null;
  }

  return state.profile;
}

// ============================================================
// Session extraction
// ============================================================

function getValidAdminPayload(
  candidates: Record<string, string | null>
): SessionPayload | null {
  const adminSecret = getSecretForRole("admin");
  const userSecret = getSecretForRole("user");

  const checks: Array<() => SessionPayload | null> = [
    () =>
      adminSecret && candidates[ADMIN_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[ADMIN_SESSION_COOKIE],
            adminSecret,
            ["admin"]
          )
        : null,

    () =>
      userSecret && candidates[USER_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[USER_SESSION_COOKIE],
            userSecret,
            ["admin"]
          )
        : null,

    () =>
      adminSecret && candidates[LEGACY_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[LEGACY_SESSION_COOKIE],
            adminSecret,
            ["admin"]
          )
        : null,

    () =>
      userSecret && candidates[LEGACY_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[LEGACY_SESSION_COOKIE],
            userSecret,
            ["admin"]
          )
        : null,
  ];

  for (const check of checks) {
    const payload = check();

    if (payload?.userId) {
      return payload;
    }
  }

  return null;
}

function getValidAuthenticatedPayload(
  candidates: Record<string, string | null>
): SessionPayload | null {
  const adminSecret = getSecretForRole("admin");
  const userSecret = getSecretForRole("user");

  const checks: Array<() => SessionPayload | null> = [
    () =>
      adminSecret && candidates[ADMIN_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[ADMIN_SESSION_COOKIE],
            adminSecret,
            ["admin"]
          )
        : null,

    () =>
      userSecret && candidates[USER_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[USER_SESSION_COOKIE],
            userSecret,
            ["user", "admin"]
          )
        : null,

    () =>
      userSecret && candidates[LEGACY_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[LEGACY_SESSION_COOKIE],
            userSecret,
            ["user", "admin"]
          )
        : null,

    () =>
      adminSecret && candidates[LEGACY_SESSION_COOKIE]
        ? verifySignedSession(
            candidates[LEGACY_SESSION_COOKIE],
            adminSecret,
            ["user", "admin"]
          )
        : null,
  ];

  for (const check of checks) {
    const payload = check();

    if (payload?.userId) {
      return payload;
    }
  }

  return null;
}

// ============================================================
// Public auth getters
// ============================================================

export async function getAdminFromCookie(
  source?: CookieSource
): Promise<UserProfile | null> {
  try {
    const candidates = await getCookieCandidates(source);
    const payload = getValidAdminPayload(candidates);

    if (!payload?.userId) {
      return null;
    }

    return await getProfileForPayload(payload);
  } catch (error) {
    console.error("[Auth] getAdminFromCookie error:", error);
    return null;
  }
}

/**
 * يرجع المستخدم المصادَق، ويشمل الأدمن أيضًا.
 * إذا أردت مستخدمًا عاديًا فقط، تحقق من user.role !== "admin".
 */
export async function getUserFromCookie(
  source?: CookieSource
): Promise<UserProfile | null> {
  try {
    const candidates = await getCookieCandidates(source);
    const payload = getValidAuthenticatedPayload(candidates);

    if (!payload?.userId) {
      return null;
    }

    return await getProfileForPayload(payload);
  } catch (error) {
    console.error("[Auth] getUserFromCookie error:", error);
    return null;
  }
}

export async function getServerUser(
  source?: CookieSource
): Promise<UserProfile | null> {
  const admin = await getAdminFromCookie(source);

  if (admin) {
    return admin;
  }

  return await getUserFromCookie(source);
}

export async function isAuthenticated(
  source?: CookieSource
): Promise<boolean> {
  return (await getServerUser(source)) !== null;
}

export async function isAdmin(source?: CookieSource): Promise<boolean> {
  const user = await getServerUser(source);
  return user?.role === "admin";
}

export async function requireAuth(
  source?: CookieSource,
  redirectUrl = "/login"
): Promise<UserProfile> {
  const user = await getServerUser(source);

  if (!user) {
    throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  }

  return user;
}

export async function requireAdmin(
  source?: CookieSource,
  redirectUrl = "/admin/login"
): Promise<UserProfile> {
  const user = await getServerUser(source);

  if (!user) {
    throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  }

  if (user.role !== "admin") {
    throw new Error(`ADMIN_REQUIRED:${redirectUrl}`);
  }

  return user;
}

// ============================================================
// Route handler helpers
// ============================================================

export function unauthorizedResponse(redirectUrl?: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: "unauthorized",
      ...(redirectUrl ? { redirectUrl } : {}),
    },
    { status: 401 }
  );
}

export function forbiddenResponse(redirectUrl?: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: "forbidden",
      ...(redirectUrl ? { redirectUrl } : {}),
    },
    { status: 403 }
  );
}

export function authErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message;

  if (message.startsWith("AUTH_REQUIRED:")) {
    return unauthorizedResponse(message.slice("AUTH_REQUIRED:".length));
  }

  if (message.startsWith("ADMIN_REQUIRED:")) {
    return forbiddenResponse(message.slice("ADMIN_REQUIRED:".length));
  }

  return null;
}

export async function requireAuthResponse(
  source?: CookieSource,
  redirectUrl = "/login"
): Promise<AuthRouteResult> {
  try {
    const user = await requireAuth(source, redirectUrl);
    return { ok: true, user };
  } catch (error) {
    const response = authErrorResponse(error);

    if (response) {
      return { ok: false, response };
    }

    throw error;
  }
}

export async function requireAdminResponse(
  source?: CookieSource,
  redirectUrl = "/admin/login"
): Promise<AuthRouteResult> {
  try {
    const user = await requireAdmin(source, redirectUrl);
    return { ok: true, user };
  } catch (error) {
    const response = authErrorResponse(error);

    if (response) {
      return { ok: false, response };
    }

    throw error;
  }
}

// ============================================================
// Email/password helpers
// ============================================================

export function normalizeAuthEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isValidAuthEmail(value: unknown): boolean {
  const email = normalizeAuthEmail(value);

  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePasswordStrength(
  password: string
): { ok: boolean; error?: string } {
  if (typeof password !== "string" || password.length < 8) {
    return { ok: false, error: "password_too_short" };
  }

  if (password.length > 200) {
    return { ok: false, error: "password_too_long" };
  }

  if (!/[\p{L}\p{N}]/u.test(password)) {
    return { ok: false, error: "password_invalid_characters" };
  }

  return { ok: true };
}

// ============================================================
// Password hashing / verification
// ============================================================

function safeEqualBuffers(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): {
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

export function hashPasswordCombined(password: string): string {
  const { hash, salt } = hashPassword(password);
  return `${salt}:${hash}`;
}

let bcryptPromise: Promise<any | null> | null = null;

async function loadBcrypt(): Promise<any | null> {
  if (!bcryptPromise) {
    bcryptPromise = (async () => {
      try {
        // eslint-disable-next-line no-new-func
        const dynamicImport = new Function(
          "specifier",
          "return import(specifier)"
        ) as (specifier: string) => Promise<any>;

        const mod = await dynamicImport("bcryptjs");
        return mod?.default ?? mod ?? null;
      } catch {
        return null;
      }
    })();
  }

  return bcryptPromise;
}

export async function hashPasswordAsync(password: string): Promise<{
  hash: string;
  salt: string;
}> {
  const bcrypt = await loadBcrypt();

  if (bcrypt?.hash) {
    const hash = await bcrypt.hash(password, 12);
    return { hash, salt: "" };
  }

  const salt = randomBytes(16).toString("hex");
  const hashBuffer = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  );

  return { hash: hashBuffer.toString("hex"), salt };
}

export async function hashPasswordCombinedAsync(
  password: string
): Promise<string> {
  const { hash, salt } = await hashPasswordAsync(password);

  if (!salt) {
    return hash;
  }

  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  salt?: string
): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  const hash = storedHash.trim();

  // bcrypt
  if (hash.startsWith("$2")) {
    const bcrypt = await loadBcrypt();

    if (typeof bcrypt?.compare !== "function") {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
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
      .digest();

    const expected = Buffer.from(effectiveHash, "hex");

    return safeEqualBuffers(candidate, expected);
  }

  // PBKDF2 + salt
  if (effectiveHash.length === 128) {
    const candidate = pbkdf2Sync(
      password,
      effectiveSalt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    );

    const expected = Buffer.from(effectiveHash, "hex");

    return safeEqualBuffers(candidate, expected);
  }

  return false;
}

// ============================================================
// Token version / session invalidation
// ============================================================

export async function bumpAuthVersion(
  userId: string,
  role: Role
): Promise<boolean> {
  try {
    const client = createAdminClient();
    const id = idForQuery(userId);

    const tables =
      role === "admin"
        ? ["admin_users", "users", "profiles"]
        : ["users", "profiles"];

    const columns = ["token_version", "auth_version"];

    for (const table of tables) {
      let tableMissing = false;

      for (const column of columns) {
        const current = await maybeSingle(client, table, column, id);

        if (current.error) {
          if (isMissingTableError(current.error)) {
            tableMissing = true;
            break;
          }

          if (isMissingColumnError(current.error, column)) {
            continue;
          }

          continue;
        }

        if (!current.data) {
          continue;
        }

        const next = Number((current.data as any)?.[column] ?? 0) + 1;

        const update = (await (client
          .from(table)
          .update({ [column]: next } as any)
          .eq("id", id) as unknown as Promise<any>)) as { error?: any };

        if (!update.error) {
          return true;
        }

        if (isMissingTableError(update.error)) {
          tableMissing = true;
          break;
        }

        if (isMissingColumnError(update.error, column)) {
          continue;
        }
      }

      if (tableMissing) {
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function invalidateUserSessions(
  userId: string,
  role: Role
): Promise<boolean> {
  return await bumpAuthVersion(userId, role);
}

async function updateLastLogin(
  userId: string,
  role: Role
): Promise<boolean> {
  try {
    const client = createAdminClient();
    const id = idForQuery(userId);
    const now = new Date().toISOString();

    const tables =
      role === "admin"
        ? ["admin_users", "users", "profiles"]
        : ["users", "profiles"];

    for (const table of tables) {
      const res = (await (client
        .from(table)
        .update({ last_login: now } as any)
        .eq("id", id) as unknown as Promise<any>)) as { error?: any };

      if (!res.error) {
        return true;
      }

      if (isMissingTableError(res.error)) {
        continue;
      }

      if (isMissingColumnError(res.error, "last_login")) {
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// ============================================================
// Cookie response helpers for Route Handlers
// ============================================================

function baseCookieOptions(
  maxAge: number,
  sameSite: "lax" | "strict" = "lax"
): any {
  const domain = getCookieDomain();

  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite,
    maxAge,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setAdminSessionCookies(
  res: NextResponse,
  userId: string,
  extra: Record<string, unknown> = {}
): void {
  const adminSecret = getSecretForRole("admin");

  if (!adminSecret) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET or APP_SESSION_SECRET/JWT_SECRET"
    );
  }

  const adminToken = createSignedToken(
    userId,
    "admin",
    adminSecret,
    ADMIN_SESSION_MAX_AGE,
    extra
  );

  res.cookies.set(
    ADMIN_SESSION_COOKIE,
    adminToken,
    baseCookieOptions(ADMIN_SESSION_MAX_AGE, "strict")
  );

  const userSecret = getSecretForRole("user");

  if (userSecret) {
    const userTokenForAdmin = createSignedToken(
      userId,
      "admin",
      userSecret,
      ADMIN_SESSION_MAX_AGE,
      extra
    );

    res.cookies.set(
      USER_SESSION_COOKIE,
      userTokenForAdmin,
      baseCookieOptions(ADMIN_SESSION_MAX_AGE, "lax")
    );
  }
}

export function setUserSessionCookies(
  res: NextResponse,
  userId: string,
  extra: Record<string, unknown> = {}
): void {
  const userSecret = getSecretForRole("user");

  if (!userSecret) {
    throw new Error(
      "Missing USER_SESSION_SECRET or APP_SESSION_SECRET/JWT_SECRET"
    );
  }

  const token = createSignedToken(
    userId,
    "user",
    userSecret,
    USER_SESSION_MAX_AGE,
    extra
  );

  res.cookies.set(
    USER_SESSION_COOKIE,
    token,
    baseCookieOptions(USER_SESSION_MAX_AGE, "lax")
  );

  // للتوافق مع الأنظمة القديمة
  res.cookies.set(
    LEGACY_SESSION_COOKIE,
    token,
    baseCookieOptions(USER_SESSION_MAX_AGE, "lax")
  );
}

export function clearAuthCookies(res: NextResponse): void {
  const names = [
    ADMIN_SESSION_COOKIE,
    USER_SESSION_COOKIE,
    LEGACY_SESSION_COOKIE,
    "sb-access-token",
    "sb-refresh-token",
  ];

  const domain = getCookieDomain();

  for (const name of names) {
    res.cookies.set(
      name,
      "",
      {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        maxAge: 0,
        path: "/",
        ...(domain ? { domain } : {}),
      } as any
    );
  }
}

// ============================================================
// Legacy Supabase Auth cookie helpers
// هذه الدوال فقط إذا كنت تستخدم Supabase Auth فعليًا.
// ============================================================

export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> {
  try {
    const store = (await cookies()) as any;

    const fallbackExp = Math.floor(Date.now() / 1000) + 3600;
    const parsedExp = Number(expiresAt);
    const safeExpiresAt =
      Number.isFinite(parsedExp) && parsedExp > 0 ? parsedExp : fallbackExp;

    const domain = getCookieDomain();

    store.set?.(
      "sb-access-token",
      accessToken,
      {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        expires: new Date(safeExpiresAt * 1000),
        path: "/",
        ...(domain ? { domain } : {}),
      } as any
    );

    store.set?.(
      "sb-refresh-token",
      refreshToken,
      {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        ...(domain ? { domain } : {}),
      } as any
    );
  } catch (error) {
    console.warn("[Auth] Failed to set Supabase Auth cookies:", error);
  }
}

export async function clearSessionCookies(): Promise<void> {
  try {
    const store = (await cookies()) as any;

    store.delete?.("sb-access-token");
    store.delete?.("sb-refresh-token");
  } catch (error) {
    console.warn("[Auth] Failed to clear Supabase Auth cookies:", error);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const store = (await cookies()) as any;
    return store.get?.("sb-access-token")?.value ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// Supabase Auth mapping helpers
// ============================================================

function mapSupabaseUser(user: any): UserProfile | null {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata || {};
  const role = normalizeRole(metadata.role) ?? "user";

  return {
    id: String(user.id),
    email: String(user.email ?? ""),
    full_name:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
        ? metadata.name
        : null,
    avatar_url:
      typeof metadata.avatar_url === "string"
        ? metadata.avatar_url
        : null,
    role,
    created_at:
      typeof user.created_at === "string"
        ? user.created_at
        : new Date().toISOString(),
    last_login:
      typeof metadata.last_login === "string"
        ? metadata.last_login
        : null,
    token_version: null,
  };
}

// ============================================================
// Supabase Auth server helpers
// ملاحظة: هذه الدوال تعتمد على Supabase Auth وليس الجداول المخصصة.
// إذا كان موقعك يستخدم users/admin_users فقط، لا تعتمد عليها.
// ============================================================

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  try {
    const cleanEmail = normalizeAuthEmail(email);

    if (!isValidAuthEmail(cleanEmail)) {
      return { success: false, error: "invalid_email" };
    }

    if (!password) {
      return { success: false, error: "password_required" };
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      const accessToken = String(data.session.access_token ?? "");
      const refreshToken = String(data.session.refresh_token ?? "");

      const fallbackExp = Math.floor(Date.now() / 1000) + 3600;
      const parsedExp = Number(data.session.expires_at ?? fallbackExp);
      const safeExpiresAt =
        Number.isFinite(parsedExp) && parsedExp > 0 ? parsedExp : fallbackExp;

      if (accessToken && refreshToken) {
        await setSessionCookies(
          accessToken,
          refreshToken,
          safeExpiresAt
        );
      }
    }

    const profile = mapSupabaseUser(data.user);

    if (profile) {
      await updateLastLogin(profile.id, profile.role);
    }

    return {
      success: true,
      user: profile ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = normalizeAuthEmail(email);

    if (!isValidAuthEmail(cleanEmail)) {
      return { success: false, error: "invalid_email" };
    }

    const passwordCheck = validatePasswordStrength(password);

    if (!passwordCheck.ok) {
      return { success: false, error: passwordCheck.error };
    }

    const cleanFullName = String(fullName ?? "").trim().slice(0, 120);

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanFullName,
          role: "user",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const profilePayload = {
        id: String(data.user.id),
        email: String(data.user.email ?? cleanEmail),
        full_name: cleanFullName,
        role: "user",
        created_at: new Date().toISOString(),
      } as any;

      let inserted = false;

      try {
        const admin = createAdminClient();

        const adminResult = (await (admin
          .from("profiles")
          .upsert(profilePayload, { onConflict: "id" }) as unknown as Promise<any>)) as {
          error?: any;
        };

        inserted = !adminResult.error;
      } catch {
        inserted = false;
      }

      if (!inserted) {
        try {
          const clientResult = (await (supabase
            .from("profiles")
            .upsert(profilePayload, { onConflict: "id" }) as unknown as Promise<any>)) as {
            error?: any;
          };

          inserted = !clientResult.error;
        } catch {
          inserted = false;
        }
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await (supabase.auth.signOut() as unknown as Promise<any>);
  } catch {
    // ignore
  }

  await clearSessionCookies();
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    return mapSupabaseUser(data.user);
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, "full_name" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.updateUser({
      data: updates as any,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      try {
        await (supabase
          .from("profiles")
          .update(updates as any)
          .eq("id", data.user.id) as unknown as Promise<any>);
      } catch {
        // ignore table update failure
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordCheck = validatePasswordStrength(newPassword);

    if (!passwordCheck.ok) {
      return { success: false, error: passwordCheck.error };
    }

    const supabase = await createServerClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data } = await supabase.auth.getUser();

    if (data.user) {
      // best-effort: إبطال الجلسات التي تحمل token version
      await bumpAuthVersion(data.user.id, "user");
      await bumpAuthVersion(data.user.id, "admin");
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Password change failed",
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  lang?: "ar" | "en"
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = normalizeAuthEmail(email);

    if (!isValidAuthEmail(cleanEmail)) {
      return { success: false, error: "invalid_email" };
    }

    const supabase = await createServerClient();

    const siteUrl =
      getTrimmedEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";

    const safeLang = lang === "en" ? "en" : "ar";
    const baseUrl = siteUrl.replace(/\/+$/, "");

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${baseUrl}/${safeLang}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Reset email failed",
    };
  }
}

export async function resetPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  return changePassword(newPassword);
}

// ============================================================
// Admin management helpers
// ============================================================

export async function getAllUsers(options: {
  limit?: number;
  offset?: number;
} = {}): Promise<UserProfile[]> {
  try {
    const client = createAdminClient();

    const limit = Math.min(
      Math.max(Number(options.limit || 1000), 1),
      5000
    );

    const offset = Math.max(Number(options.offset || 0), 0);

    const profiles = (await (client
      .from("profiles")
      .select(
        "id, email, full_name, avatar_url, role, created_at, last_login, token_version"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1) as unknown as Promise<any>)) as {
      data: any;
      error: any;
    };

    if (!profiles.error && Array.isArray(profiles.data)) {
      return profiles.data.map(mapProfileRow);
    }

    if (profiles.error && isMissingTableError(profiles.error)) {
      const users = (await (client
        .from("users")
        .select(
          "id, email, name, role, created_at, last_login, token_version"
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1) as unknown as Promise<any>)) as {
        data: any;
        error: any;
      };

      if (!users.error && Array.isArray(users.data)) {
        return users.data.map((row: any) =>
          mapCustomUser(row, normalizeRole(row.role) ?? "user")
        );
      }
    }

    return [];
  } catch (error) {
    console.error("[Auth] getAllUsers error:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  try {
    const client = createAdminClient();
    const queryId = idForQuery(id);

    const profile = (await (client
      .from("profiles")
      .select(
        "id, email, full_name, avatar_url, role, created_at, last_login, token_version"
      )
      .eq("id", queryId)
      .maybeSingle() as unknown as Promise<any>)) as {
      data: any;
      error: any;
    };

    if (!profile.error && profile.data) {
      return mapProfileRow(profile.data);
    }

    if (profile.error && isMissingTableError(profile.error)) {
      const user = (await (client
        .from("users")
        .select(
          "id, email, name, role, created_at, last_login, token_version"
        )
        .eq("id", queryId)
        .maybeSingle() as unknown as Promise<any>)) as {
        data: any;
        error: any;
      };

      if (!user.error && user.data) {
        return mapCustomUser(
          user.data,
          normalizeRole(user.data.role) ?? "user"
        );
      }
    }

    return null;
  } catch (error) {
    console.error("[Auth] getUserById error:", error);
    return null;
  }
}

export async function deleteUser(
  userId: string,
  actorId?: string
): Promise<boolean> {
  if (actorId && actorId === userId) {
    console.warn("[Auth] Blocked attempt to delete own account.");
    return false;
  }

  try {
    const client = createAdminClient();

    try {
      const authResult = (await (client.auth.admin.deleteUser(
        userId
      ) as unknown as Promise<any>)) as { error?: any };

      if (authResult.error) {
        console.error("[Auth] deleteUser auth error:", authResult.error);
      }
    } catch (error) {
      console.error("[Auth] deleteUser auth exception:", error);
    }

    try {
      await (client
        .from("profiles")
        .delete()
        .eq("id", userId) as unknown as Promise<any>);
    } catch {
      // ignore
    }

    try {
      await (client
        .from("users")
        .delete()
        .eq("id", userId) as unknown as Promise<any>);
    } catch {
      // ignore
    }

    return true;
  } catch (error) {
    console.error("[Auth] deleteUser error:", error);
    return false;
  }
}

export async function setUserRole(
  userId: string,
  role: Role,
  actorId?: string
): Promise<boolean> {
  if (actorId && actorId === userId && role !== "admin") {
    console.warn("[Auth] Blocked attempt to remove own admin role.");
    return false;
  }

  try {
    const client = createAdminClient();

    let authUpdated = false;

    try {
      const { error } = await client.auth.admin.updateUserById(userId, {
        user_metadata: {
          role,
        },
      });

      if (!error) {
        authUpdated = true;
      } else {
        console.warn("[Auth] setUserRole auth metadata error:", error);
      }
    } catch (error) {
      console.warn("[Auth] setUserRole auth metadata exception:", error);
    }

    let tableUpdated = false;

    const attempts: Array<() => Promise<{ error?: any }>> = [
      async () =>
        (await (client
          .from("profiles")
          .update({ role } as any)
          .eq("id", userId) as unknown as Promise<any>)) as { error?: any },

      async () =>
        (await (client
          .from("users")
          .update({ role } as any)
          .eq("id", userId) as unknown as Promise<any>)) as { error?: any },
    ];

    if (role === "admin") {
      attempts.push(
        async () =>
          (await (client
            .from("admin_users")
            .update({ is_active: true } as any)
            .eq("id", userId) as unknown as Promise<any>)) as { error?: any }
      );
    }

    for (const attempt of attempts) {
      try {
        const result = await attempt();

        if (!result.error) {
          tableUpdated = true;
        }
      } catch {
        // ignore and try next table
      }
    }

    return authUpdated || tableUpdated;
  } catch (error) {
    console.error("[Auth] setUserRole error:", error);
    return false;
  }
}

// ============================================================
// Default export
// ============================================================

const auth = {
  ADMIN_SESSION_COOKIE,
  USER_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,

  ADMIN_SESSION_MAX_AGE,
  USER_SESSION_MAX_AGE,

  createAdminClient,
  createServerClient,
  createBrowserClient,

  signSession,
  verifySignedSession,
  createSession,
  destroySession,
  getSessionUserId,
  sessionExtrasFromProfile,

  getAdminFromCookie,
  getUserFromCookie,
  getServerUser,
  isAuthenticated,
  isAdmin,
  requireAuth,
  requireAdmin,

  unauthorizedResponse,
  forbiddenResponse,
  authErrorResponse,
  requireAuthResponse,
  requireAdminResponse,

  normalizeAuthEmail,
  isValidAuthEmail,
  validatePasswordStrength,

  hashPassword,
  hashPasswordCombined,
  hashPasswordAsync,
  hashPasswordCombinedAsync,
  verifyPassword,

  bumpAuthVersion,
  invalidateUserSessions,

  setAdminSessionCookies,
  setUserSessionCookies,
  clearAuthCookies,

  setSessionCookies,
  clearSessionCookies,
  getAccessToken,

  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  sendPasswordResetEmail,
  resetPassword,

  getAllUsers,
  getUserById,
  deleteUser,
  setUserRole,
};

export default auth;