// app/api/admin/backup/run/route.ts
// تشغيل نسخة احتياطية يدوية من اللوحة (حتى لو كان الجدول اليومي معطّلًا).

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { runBackup } from '@/lib/admin/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  if (!can(session.roles, 'settings.manage')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
  }

  try {
    const result = await runBackup({
      exportedBy: session.userId,
      force: true,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Backup] manual run error:', error);
    return NextResponse.json(
      { ok: false, error: 'تعذّر إنشاء النسخة الاحتياطية.' },
      { status: 500 }
    );
  }
}
