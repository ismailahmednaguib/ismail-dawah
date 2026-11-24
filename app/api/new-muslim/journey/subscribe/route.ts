import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { emailProviderConfigured } from '@/lib/email-verification-config';
import { normalizeNewMuslimJourneyConfig } from '@/lib/new-muslim-journey';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isAllowedMutationOrigin } from '@/lib/security/origin';
import { rateLimitGuard } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export async function POST(request: NextRequest) {
  if (!isAllowedMutationOrigin(request)) return NextResponse.json({ ok: false, error: 'الطلب غير مسموح.' }, { status: 403 });
  const limited = await rateLimitGuard(request, 'newsletter', { message: 'حاول مرة أخرى لاحقًا.' });
  if (limited) return limited;

  let body: { email?: unknown; lang?: unknown; consent?: unknown; website?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: 'بيانات غير صالحة.' }, { status: 400 }); }
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const lang = body.lang === 'en' ? 'en' : 'ar';
  if (!validEmail(email) || body.consent !== true) return NextResponse.json({ ok: false, error: 'أدخل بريدًا صحيحًا ووافق على استقبال الرسائل.' }, { status: 400 });

  const settings = await getSiteSettings();
  const config = normalizeNewMuslimJourneyConfig(settings.newMuslimJourney);
  if (!config.enabled) return NextResponse.json({ ok: false, error: 'الرحلة غير مفعلة حاليًا.' }, { status: 404 });
  if (!emailProviderConfigured(process.env)) return NextResponse.json({ ok: false, error: 'خدمة البريد غير مهيأة حاليًا.' }, { status: 503 });

  const { error } = await getSupabaseAdmin().from('new_muslim_journey_subscribers').upsert({
    email, lang, day_index: 1, next_send_at: new Date().toISOString(), active: true,
    consent_at: new Date().toISOString(), completed_at: null, unsubscribe_token: crypto.randomUUID(),
  }, { onConflict: 'email' });
  if (error) {
    console.error('[NewMuslimJourney] subscribe error:', error.message);
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل الاشتراك. تأكد من تطبيق ترحيل قاعدة البيانات.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
