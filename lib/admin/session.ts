// =====================================================
// طبقة جلسة المدير + الأدوار
// =====================================================
// نظام المصادقة الحالي يستخدم admin_session موقّعًا وadmin_users.
// لا نعتمد على جداول جلسات إضافية غير موجودة في المشروع.
// =====================================================

import 'server-only';
import { getAdminFromCookie } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AppRole } from '@/lib/types/content';
import { isOwnerEmail } from '@/lib/admin/owner';

const VALID_ROLES = new Set<AppRole>([
  'super_admin',
  'admin',
  'editor',
  'scholar_reviewer',
  'translator',
  'contributor',
]);

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
    const admin = await getAdminFromCookie();
    if (!admin || admin.role !== 'admin') return null;

    // الدور العام الحالي يأتي من admin_users. إن وُجدت user_roles نستخدمها
    // لتطبيق صلاحيات المرحلة الأولى، مع fallback آمن حتى لا تتعطل اللوحة
    // قبل تطبيق migration الخاصة بالأدوار.
    const owner = isOwnerEmail(admin.email);
    let roles: AppRole[] = owner ? ['super_admin'] : ['admin'];
    let fullName = admin.full_name;

    try {
      const supabase = getSupabaseAdmin();
      const { data: roleRow, error } = await supabase
        .from('user_roles')
        .select('roles, is_active, full_name')
        .eq('user_id', admin.id)
        .maybeSingle();

      if (!owner && !error && roleRow?.is_active === false) return null;

      if (!owner && !error && Array.isArray(roleRow?.roles)) {
        const configuredRoles = roleRow.roles.filter((role): role is AppRole =>
          typeof role === 'string' && VALID_ROLES.has(role as AppRole)
        );

        if (configuredRoles.length > 0) roles = configuredRoles;
      }

      if (!error && typeof roleRow?.full_name === 'string') {
        fullName = roleRow.full_name;
      }
    } catch (error) {
      // عدم وجود جدول user_roles لا يلغي صلاحية المدير الأساسي.
      console.warn('[getAdminSession] Could not load role metadata:', error);
    }

    return {
      userId: admin.id,
      email: admin.email,
      fullName: fullName ?? null,
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
