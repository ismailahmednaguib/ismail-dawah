import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { normalizeDawahJourneyConfig } from '@/lib/dawah-journey';
import { emailProviderConfigured } from '@/lib/email-verification-config';
import { rateLimitGuard } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function allowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  try {
    const originUrl = new URL(origin);
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const host = request.headers.get('host');
    return Boolean(
      (configured && originUrl.origin === configured.replace(/\/+$/, '')) ||
      (host && originUrl.host === host)
    );
  } catch {
    return false;
  }
}

function validEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function language(value: unknown): 'ar' | 'en' {
  return value === 'en' ? 'en' : 'ar';
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'طلب غير مصرح به.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'الطلب غير صالح.' }, { status: 400 });

  // حقل مخفي للروبوتات: نعيد نجاحًا وهميًا دون تخزين أي بريد.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true, message: 'تم استلام الطلب.' });
  }

  const email = validEmail(body.email);
  const lang = language(body.lang);
  if (!email) return NextResponse.json({ ok: false, error: lang === 'ar' ? 'البريد الإلكتروني غير صحيح.' : 'Invalid email address.' }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ ok: false, error: lang === 'ar' ? 'يجب الموافقة على استلام الرحلة.' : 'Please consent to receive the journey.' }, { status: 400 });

  const limited = await rateLimitGuard(request, 'newsletter', {
    identities: [email],
    message: lang === 'ar' ? 'عدد المحاولات كثير جدًا. حاول لاحقًا.' : 'Too many attempts. Please try again later.',
  });
  if (limited) return limited;

  const config = normalizeDawahJourneyConfig((await getSiteSettings()).dawahJourney);
  if (!config.enabled || !emailProviderConfigured(process.env)) {
    return NextResponse.json({ ok: false, error: lang === 'ar' ? 'الرحلة غير متاحة حاليًا.' : 'The journey is not available right now.' }, { status: 503 });
  }

  try {
    const now = new Date().toISOString();
    const { error } = await getSupabaseAdmin().from('dawah_journey_subscribers').upsert(
      {
        email,
        lang,
        day_index: 1,
        next_send_at: now,
        active: true,
        consent_at: now,
        last_sent_at: null,
        completed_at: null,
        unsubscribe_token: crypto.randomUUID(),
      },
      { onConflict: 'email' }
    );

    if (error) {
      if (/does not exist|relation|schema cache/i.test(error.message)) {
        return NextResponse.json({ ok: false, error: lang === 'ar' ? 'لم تُجهّز خدمة الرحلة بعد.' : 'The journey service is not configured yet.' }, { status: 503 });
      }
      console.error('[DawahJourney] subscribe error:', error.message);
      return NextResponse.json({ ok: false, error: lang === 'ar' ? 'تعذر الاشتراك حاليًا.' : 'Subscription failed temporarily.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: lang === 'ar' ? 'تم الاشتراك. ستصلك أول رسالة قريبًا.' : 'You are subscribed. Your first email will arrive soon.' });
  } catch (error) {
    console.error('[DawahJourney] subscribe exception:', error);
    return NextResponse.json({ ok: false, error: lang === 'ar' ? 'تعذر الاشتراك حاليًا.' : 'Subscription failed temporarily.' }, { status: 500 });
  }
}
