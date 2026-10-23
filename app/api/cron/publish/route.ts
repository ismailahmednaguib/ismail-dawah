// app/api/cron/publish/route.ts
// نشر المواد المجدولة المستحقة. محمي بـ CRON_SECRET.
// يمكن استدعاؤه من مجدول خارجي كل ٥ دقائق للحصول على دقة أعلى،
// أو يدويًّا. مسار النسخ الاحتياطي اليومي يستدعيه أيضًا قبل النسخ.

import { NextRequest, NextResponse } from 'next/server';
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
    const result = await publishDueScheduledContent();

    if (result.published > 0) {
      revalidatePublicContent();
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[ScheduledPublish] cron error:', error);
    return NextResponse.json(
      { ok: false, error: 'تعذّر نشر المحتوى المجدول.' },
      { status: 500 }
    );
  }
}
