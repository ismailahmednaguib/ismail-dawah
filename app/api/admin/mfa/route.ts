// إدارة التحقق الثنائي للأدمن من مركز الأمان.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import {
  beginAdminMfaEnrollment,
  getAdminMfaStatus,
  loadAdminMfa,
  setAdminMfaEnabled,
  verifyAdminMfaCode,
} from '@/lib/admin/mfa';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return errorResponse('غير مصرح', 401);
  if (!can(session.roles, 'audit.read')) return errorResponse('ليس لديك صلاحية العرض', 403);

  try {
    const status = await getAdminMfaStatus(session.userId);
    return NextResponse.json({
      ok: true,
      ...status,
      canManage: can(session.roles, 'settings.manage'),
      encryptionKeyConfigured: Boolean(process.env.ADMIN_MFA_ENCRYPTION_KEY?.trim()),
    });
  } catch (error) {
    console.error('[Admin MFA] status error:', error);
    return errorResponse('تعذر قراءة إعدادات التحقق الثنائي', 500);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return errorResponse('غير مصرح', 401);
  if (!can(session.roles, 'settings.manage')) return errorResponse('ليس لديك صلاحية التعديل', 403);

  let body: { action?: unknown; code?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; code?: unknown };
  } catch {
    return errorResponse('جسم الطلب غير صالح');
  }

  const action = typeof body.action === 'string' ? body.action : '';

  try {
    if (action === 'begin') {
      const enrollment = await beginAdminMfaEnrollment(session.userId, session.email);
      return NextResponse.json({ ok: true, ...enrollment });
    }

    const code = typeof body.code === 'string' ? body.code : '';
    const mfa = await loadAdminMfa(session.userId);
    if (!mfa.status.configured || !verifyAdminMfaCode(mfa.secret, code)) {
      return errorResponse('رمز التحقق غير صحيح أو لم يبدأ الإعداد', 401);
    }

    if (action === 'enable') {
      await setAdminMfaEnabled(session.userId, true);
    } else if (action === 'disable') {
      await setAdminMfaEnabled(session.userId, false);
    } else {
      return errorResponse('إجراء غير معروف');
    }

    try {
      await getSupabaseAdmin().from('audit_log').insert({
        user_id: session.userId,
        action: action === 'enable' ? 'mfa_enable' : 'mfa_disable',
        table_name: 'admin_mfa',
        new_data: { enabled: action === 'enable' },
      });
    } catch {
      // لا نفشل تغيير حالة MFA إذا كان سجل التدقيق قديمًا أو غير متاح.
    }

    return NextResponse.json({ ok: true, enabled: action === 'enable' });
  } catch (error) {
    console.error('[Admin MFA] update error:', error);
    return errorResponse('تعذر تحديث التحقق الثنائي. تأكد من تطبيق migration.', 500);
  }
}
