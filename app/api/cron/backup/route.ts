// app/api/cron/backup/route.ts
// نسخة احتياطية يومية إلى Supabase Storage (حاوية خاصة).
// محمي بـ CRON_SECRET، ويحترم إعداد backup من /admin/backup.

import { NextRequest, NextResponse } from 'next/server';
import { runBackup } from '@/lib/admin/backup';
import { publishDueScheduledContent } from '@/lib/admin/publish-scheduled';
import { isCronAuthorized } from '@/lib/cron-auth';
import { revalidatePublicContent } from '@/lib/revalidate-public';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 401 });
  }

  try {
    // المهمة اليومية تجمع النشر المجدول والنسخ الاحتياطي معًا،
    // حتى لا نتجاوز حد مهام Vercel Hobby (مهمتان).
    const scheduled = await publishDueScheduledContent();

    if (scheduled.published > 0) {
      revalidatePublicContent();
    }

    const result = await runBackup({ exportedBy: 'cron' });

    if (!result.ok) {
      return NextResponse.json(
        { ...result, publishedScheduled: scheduled.published },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ...result,
      publishedScheduled: scheduled.published,
    });
  } catch (error) {
    console.error('[Backup] cron error:', error);
    return NextResponse.json(
      { ok: false, error: 'تعذّر إنشاء النسخة الاحتياطية.' },
      { status: 500 }
    );
  }
}
