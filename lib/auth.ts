// lib/auth.ts
// نظام المصادقة — يتعامل مع Supabase Auth

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ===== إعدادات البيئة =====
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// التأكد من وجود المتغيرات
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// ===== أنواع المستخدم =====
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  last_login: string | null;
}

export interface AuthSession {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ===== عملاء Supabase =====

/**
 * عميل للـ Client Components (المتصفح)
 * بيستخدم الـ anon key مباشرة
 */
export function createBrowserClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * عميل للـ Server Components والـ API Routes
 * بيستخدم الـ cookies لإدارة الجلسة
 */
export async function createServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        // بنمرر الـ access token من الـ cookies لو موجود
        ...(cookieStore.get("sb-access-token")?.value && {
          Authorization: `Bearer ${cookieStore.get("sb-access-token")!.value}`,
        }),
      },
    },
  });
}

/**
 * عميل للـ Admin (بيستخدم service role key)
 * ⚠️ استخدمه فقط في الـ server — ممنوع في الـ client
 */
export function createAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ===== دوال المصادقة =====

/**
 * تسجيل الدخول بالإيميل وكلمة المرور
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // تحديث آخر تسجيل دخول
  await supabase
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", data.user.id);

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email!,
      full_name: data.user.user_metadata?.full_name || null,
      avatar_url: data.user.user_metadata?.avatar_url || null,
      role: data.user.user_metadata?.role || "user",
      created_at: data.user.created_at,
      last_login: new Date().toISOString(),
    },
  };
}

/**
 * إنشاء حساب جديد
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "user",
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // إنشاء ملف شخصي في جدول الـ profiles
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      role: "user",
      created_at: new Date().toISOString(),
    });
  }

  return { success: true };
}

/**
 * تسجيل الخروج
 */
export async function signOut(): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}

/**
 * الحصول على المستخدم الحالي من الجلسة
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: data.user.user_metadata?.full_name || null,
    avatar_url: data.user.user_metadata?.avatar_url || null,
    role: data.user.user_metadata?.role || "user",
    created_at: data.user.created_at,
    last_login: data.user.user_metadata?.last_login || null,
  };
}

/**
 * الحصول على المستخدم في الـ Server Components
 */
export async function getServerUser(): Promise<UserProfile | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: data.user.user_metadata?.full_name || null,
    avatar_url: data.user.user_metadata?.avatar_url || null,
    role: data.user.user_metadata?.role || "user",
    created_at: data.user.created_at,
    last_login: data.user.user_metadata?.last_login || null,
  };
}

/**
 * التحقق من أن المستخدم مسجل دخول
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

/**
 * التحقق من أن المستخدم أدمن
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === "admin";
}

/**
 * حماية الصفحة — يعيد التوجيه لو المستخدم مش مسجل
 * استخدمه في الـ Server Components
 */
export async function requireAuth(redirectUrl: string = "/login"): Promise<UserProfile> {
  const user = await getServerUser();

  if (!user) {
    // بنعمل throw عشان الـ middleware أو الـ page يعمل redirect
    throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  }

  return user;
}

/**
 * حماية صفحات الأدمن
 */
export async function requireAdmin(redirectUrl: string = "/admin/login"): Promise<UserProfile> {
  const user = await getServerUser();

  if (!user) {
    throw new Error(`AUTH_REQUIRED:${redirectUrl}`);
  }

  if (user.role !== "admin") {
    throw new Error(`ADMIN_REQUIRED:${redirectUrl}`);
  }

  return user;
}

/**
 * تحديث بيانات المستخدم
 */
export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, "full_name" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // تحديث جدول الـ profiles كمان
  if (data.user) {
    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", data.user.id);
  }

  return { success: true };
}

/**
 * تغيير كلمة المرور
 */
export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * إرسال رابط إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * إعادة تعيين كلمة المرور (بعد الضغط على الرابط)
 */
export async function resetPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  return changePassword(newPassword);
}

// ===== دوال مساعدة للـ Cookies =====

/**
 * تخزين الـ session في الـ cookies
 */
export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> {
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
    maxAge: 60 * 60 * 24 * 7, // 7 أيام
    path: "/",
  });
}

/**
 * مسح الـ session من الـ cookies
 */
export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");
}

/**
 * الحصول على الـ access token من الـ cookies
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("sb-access-token")?.value || null;
}

// ===== دوال للأدمن =====

/**
 * جلب كل المستخدمين (للأدمن فقط)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as UserProfile[];
}

/**
 * حذف مستخدم (للأدمن فقط)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return false;
  }

  // حذف من جدول الـ profiles
  await supabase.from("profiles").delete().eq("id", userId);

  return true;
}

/**
 * تغيير دور مستخدم (للأدمن فقط)
 */
export async function setUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });

  if (error) {
    return false;
  }

  await supabase.from("profiles").update({ role }).eq("id", userId);

  return true;
}