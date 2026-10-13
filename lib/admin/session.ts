// =====================================================
// طبقة جلسة المدير + الأدوار
// =====================================================
// ⚠️ ملاحظة تكامل: المشروع الحالي لديه `lib/auth.ts` و `/api/admin/login`.
// هذه الطبقة تقرأ ملف تعريف الارتباط الذي ينشئه نظامك الحالي.
// إذا كان اسم جدول الجلسات لديك مختلفًا، عدّل `SESSION_TABLE` فقط.
// =====================================================

import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AppRole } from '@/lib/types/content';

// عدّل هذين السطرين ليتطابقا مع نظامك الحالي في `lib/auth.ts`
const SESSION_COOKIE = 'admin_session';
const SESSION_TABLE = 'admin_sessions';

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string | null;
  roles: AppRole[];
}

/**
 * جلب جلسة المدير الحالية + أدواره من جدول `user_roles`
 * ترجع `null` إذا لم يكن مسجلًا أو انتهت الجلسة
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionToken) return null;

    const supabase = getSupabaseAdmin();

    // 1. التحقق من صلاحية الجلسة
    const { data: session } = await supabase
      .from(SESSION_TABLE)
      .select('admin_id, expires_at')
      .eq('id', sessionToken)
      .maybeSingle();

    if (!session) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return null;
    }

    // 2. جلب بيانات المدير
    const { data: admin } = await supabase
      .from('admins')
      .select('id, email, full_name')
      .eq('id', session.admin_id)
      .maybeSingle();

    if (!admin) return null;

    // 3. جلب الأدوار من جدول `user_roles` (المرحلة الأولى)
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('roles, is_active')
      .eq('user_id', admin.id)
      .maybeSingle();

    // إذا لا يوجد صف أدوار، نعتبره مساهم فقط (أدنى صلاحية)
    const roles: AppRole[] = roleRow?.is_active
      ? (roleRow.roles as AppRole[])
      : ['contributor'];

    return {
      userId: admin.id,
      email: admin.email,
      fullName: admin.full_name ?? null,
      roles,
    };
  } catch (err) {
    console.error('[getAdminSession]', err);
    return null;
  }
}

/** هل يمتلك الجلسة أحد الأدوار المطلوبة؟ */
export function hasAnyRole(
  session: AdminSession | null,
  required: AppRole[]
): boolean {
  if (!session) return false;
  return session.roles.some((r) => required.includes(r));
}

/** هل هو مدير عام؟ */
export function isSuperAdmin(session: AdminSession | null): boolean {
  return hasAnyRole(session, ['super_admin']);
}