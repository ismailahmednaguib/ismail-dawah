import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeContentReportInput } from '@/lib/content-report';
import { rateLimitGuard } from '@/lib/rate-limit';
import { isAllowedMutationOrigin } from '@/lib/security/origin';
import { getTurnstileToken, verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'الطلب مرفوض من مصدر غير موثوق.' }, { status: 403 });
  }

  const limited = await rateLimitGuard(request, 'reports');
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    const normalized = normalizeContentReportInput(body);
    if (!normalized.ok) return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 });

    const turnstile = await verifyTurnstile(getTurnstileToken(body as Record<string, unknown> | null));
    if (!turnstile.ok) {
      return NextResponse.json({ ok: false, error: normalized.value.lang === 'ar' ? 'فشل التحقق الأمني. حاول مرة أخرى.' : 'Security verification failed.' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from('content_reports').insert({
      page_url: normalized.value.pageUrl,
      page_title: normalized.value.pageTitle,
      description: normalized.value.description,
      email: normalized.value.email,
      lang: normalized.value.lang,
      status: 'new',
    });

    if (error) {
      console.error('[ContentReport] insert error:', error);
      return NextResponse.json({ ok: false, error: normalized.value.lang === 'ar' ? 'تعذر حفظ البلاغ حاليًا.' : 'The report could not be saved.' }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      message: normalized.value.lang === 'ar' ? 'تم استلام البلاغ، شكرًا لمساعدتنا على التصحيح.' : 'The report was received. Thank you for helping us correct the page.',
    });
  } catch (error) {
    console.error('[ContentReport] request error:', error);
    return NextResponse.json({ ok: false, error: 'تعذر معالجة الطلب.' }, { status: 400 });
  }
}
