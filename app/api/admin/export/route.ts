// ============================================================================
// /api/admin/export
// تصدير المحتوى والإعدادات (JSON) — نفس جامع النسخ الاحتياطي المشترك.
//
// GET → تنزيل ملف JSON.
//       ?scope=content   المحتوى والتصنيفات فقط
//       ?scope=settings  الإعدادات فقط
//       (بلا معامل = الكل)
//
// الصلاحية: settings.manage (المالك/المدير الأعلى).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { collectBackup, type BackupScope } from '@/lib/admin/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseScope(value: string | null): BackupScope | 'all' | null {
  if (!value || value === 'all') return 'all';
  if (value === 'content' || value === 'settings') return value;
  return null;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();

  if (!session || !can(session.roles, 'settings.manage')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const scope = parseScope(new URL(req.url).searchParams.get('scope'));

  if (!scope) {
    return NextResponse.json({ error: 'نطاق غير معروف' }, { status: 400 });
  }

  try {
    const payload = await collectBackup(scope, session.userId);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `ismail-dawah-${scope}-${stamp}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
