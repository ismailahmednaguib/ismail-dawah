import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSiteSettings } from '@/lib/content';
import { QUESTIONS_SETTING_KEY, normalizeQuestionsConfig } from '@/lib/questions/config';
import { rateLimitGuard } from '@/lib/rate-limit';
import { isAllowedMutationOrigin } from '@/lib/security/origin';
import { getTurnstileToken, verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, max)
    : '';
}

export async function POST(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'الطلب مرفوض من مصدر غير موثوق.' }, { status: 403 });
  }

  const limited = await rateLimitGuard(request, 'questions');
  if (limited) return limited;

  try {
    const body = await request.json() as Record<string, unknown>;
    const question = cleanText(body.question, 2000);
    const email = cleanText(body.email, 254);
    const lang = body.lang === 'en' ? 'en' : 'ar';
    const pageSlug = cleanText(body.page_slug, 160);

    if (question.length < 10) {
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'اكتب سؤالًا من 10 أحرف على الأقل.' : 'Write at least 10 characters.' }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'البريد الإلكتروني غير صحيح.' : 'Invalid email address.' }, { status: 400 });
    }

    const settings = await getSiteSettings();
    if (!normalizeQuestionsConfig((settings as Record<string, unknown>)[QUESTIONS_SETTING_KEY]).enabled) {
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'إرسال الأسئلة غير مفعّل حاليًا.' : 'Questions are currently disabled.' }, { status: 503 });
    }

    const turnstile = await verifyTurnstile(getTurnstileToken(body));
    if (!turnstile.ok) {
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'فشل التحقق الأمني. حاول مرة أخرى.' : 'Security verification failed.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('dawah_inquiries')
      .insert({ question, email: email || null, lang, page_slug: pageSlug || null })
      .select('id, status, created_at')
      .single();

    if (error) {
      console.error('[DawahInquiry] insert error:', error);
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'تعذر حفظ السؤال حاليًا.' : 'The question could not be saved.' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, inquiry: data, message: lang === 'ar' ? 'تم استلام سؤالك. شكرًا لك.' : 'Your question has been received. Thank you.' });
  } catch (error) {
    console.error('[DawahInquiry] request error:', error);
    return NextResponse.json({ ok: false, error: 'تعذر معالجة الطلب.' }, { status: 400 });
  }
}
