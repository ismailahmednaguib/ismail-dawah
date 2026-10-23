// app/api/cron/backup/route.ts
// نسخة احتياطية يومية إلى Supabase Storage (حاوية خاصة).
// محمي بـ CRON_SECRET، ويحترم إعداد backup من /admin/backup.

import { NextRequest, NextResponse } from 'next/server';
import { runBackup } from '@/lib/admin/backup';
import { isCronAuthorized } from '@/lib/cron-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const result = await runBackup({ exportedBy: 'cron' });

    if (!result.ok) {
      return NextResponse.json(result, { status: 503 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Backup] cron error:', error);
    return NextResponse.json(
      { ok: false, error: 'تعذّر إنشاء النسخة الاحتياطية.' },
      { status: 500 }
    );
  }
}
