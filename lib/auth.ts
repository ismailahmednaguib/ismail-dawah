// lib/auth.ts
// نظام المصادقة — آمن للبناء (Lazy Clients)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

// ===== الأنواع =====
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  last_login: string | null;
}

// ===== ثوابت =====
export const ADMIN_SESSION_COOKIE = "admin_session";

// ===== بيئة Supabase بشكل Lazy =====
function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return { url, anonKey };
}

function getServiceEnv() {
  const { url } = getPublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return { url, serviceKey };
}

// ===== العملاء (Lazy) =====
let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { url, anonKey } = getPublicEnv();
  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

export async function createServerClient(): Promise<SupabaseClient> {
  const { url, anonKey } = getPublicEnv();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

export function createAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const { url, serviceKey } = getServiceEnv();
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

// ===== تحويل مستخدم Supabase =====
function mapUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
} | null): UserProfile | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
    avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    role: metadata.role === "admin" ? "admin" : "user",
    created_at: user.created_at || new Date().toISOString(),
    last_login: typeof metadata.last_login === "string" ? metadata.last_login : null,
  };
}

// ===== دوال المصادقة =====
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    const mapped = mapUser(data.user);
    if (mapped) {
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", mapped.id)
        .catch(() => null);
    }
    return { success: true, user: mapped || undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Sign in failed" };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "user" } },
    });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: "user",
          created_at: new Date().toISOString(),
        })
        .catch(() => null);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Sign up failed" };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  } catch {
    // تجاهل
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getUser();
    return mapUser(data.user);
  } catch {
    return null;
  }
}

export async function getServerUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    return mapUser(data.user);
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getServerUser()) !== null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getServerUser())?.role === "admin";
}

export async function requireAuth(redirectUrl = "/login"): Promise<UserProfile> {
  const user = await getServerUser();
  if (!user) throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  return user;
}

export async function requireAdmin(redirectUrl = "/admin/login"): Promise<UserProfile> {
  const user = await getServerUser();
  if (!user) throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  if (user.role !== "admin") throw new Error(`ADMIN_REQUIRED:${redirectUrl}`);
  return user;
}

export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, "full_name" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      await supabase.from("profiles").update(updates).eq("id", data.user.id).catch(() => null);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Password change failed" };
  }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Reset email failed" };
  }
}

export async function resetPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  return changePassword(newPassword);
}

// ===== Cookies =====
export async function setSessionCookies(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt * 1000),
    path: "/",
  });
  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("sb-access-token")?.value || null;
}

// ===== دوال الأدمن =====
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as UserProfile[];
  } catch {
    return [];
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) return false;
    await supabase.from("profiles").delete().eq("id", userId).catch(() => null);
    return true;
  } catch {
    return false;
  }
}

export async function setUserRole(userId: string, role: "user" | "admin"): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, { user_metadata: { role } });
    if (error) return false;
    await supabase.from("profiles").update({ role }).eq("id", userId).catch(() => null);
    return true;
  } catch {
    return false;
  }
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

// ===== طبقة توافق للـ API routes القديمة =====
const adminSessions = new Map<string, { userId: string; expires: number }>();

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = pbkdf2Sync(password, salt, 100000, 64, "sha512");
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  adminSessions.set(token, { userId, expires: Date.now() + 1000 * 60 * 60 * 24 });
  return token;
}

export function destroySession(token: string): void {
  adminSessions.delete(token);
}

export function getSessionUserId(token: string): string | null {
  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    adminSessions.delete(token);
    return null;
  }
  return session.userId;
}

export async function getAdminFromCookie(cookieValue?: string | null): Promise<UserProfile | null> {
  try {
    if (!cookieValue) return null;
    const userId = getSessionUserId(cookieValue);
    if (!userId) return null;
    const user = await getUserById(userId);
    if (!user || user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}