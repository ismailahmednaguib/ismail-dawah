import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/content';
import { journeyText, normalizeDawahJourneyConfig } from '@/lib/dawah-journey';
import { sendNewsletterEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Subscriber = { email: string; lang: 'ar' | 'en'; day_index: number; unsubscribe_token: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  return bearer === secret || request.headers.get('x-cron-secret') === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 401 });

  const config = normalizeDawahJourneyConfig((await getSiteSettings()).dawahJourney);
  if (!config.enabled) return NextResponse.json({ ok: true, skipped: true, reason: 'journey_disabled' });

  const now = new Date();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('dawah_journey_subscribers')
    .select('email, lang, day_index, unsubscribe_token')
    .eq('active', true)
    .gte('day_index', 1)
    .lte('day_index', 7)
    .lte('next_send_at', now.toISOString())
    .order('next_send_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[DawahJourney] cron read error:', error.message);
    return NextResponse.json({ ok: false, error: 'تعذر تحميل قائمة الرحلة.' }, { status: 500 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ismailahmednaguib.vercel.app').replace(/\/+$/, '');
  let sent = 0;
  let failed = 0;

  for (const row of (data || []) as Subscriber[]) {
    const day = config.days[row.day_index - 1];
    if (!day) continue;
    const lang = row.lang === 'en' ? 'en' : 'ar';
    const subject = journeyText(day.subject, lang);
    const body = journeyText(day.body, lang).split(/\r?\n/).map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    const href = day.href.startsWith('/') ? day.href : '/dawah/path';
    const html = `${body}<p style="margin-top:24px;"><a href="${escapeHtml(`${siteUrl}${href}`)}">${lang === 'ar' ? 'فتح المادة' : 'Open the material'}</a></p>`;
    const unsubscribeUrl = `${siteUrl}/api/dawah/journey/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`;
    const result = await sendNewsletterEmail(row.email, subject, html, lang, unsubscribeUrl);
    if (!result.ok) {
      failed += 1;
      continue;
    }

    const completed = row.day_index >= 7;
    const nextSend = new Date(now.getTime() + config.intervalHours * 60 * 60 * 1000).toISOString();
    await supabase.from('dawah_journey_subscribers').update({
      active: !completed,
      day_index: completed ? 8 : row.day_index + 1,
      next_send_at: nextSend,
      last_sent_at: now.toISOString(),
      completed_at: completed ? now.toISOString() : null,
    }).eq('email', row.email);
    sent += 1;
  }

  return NextResponse.json({ ok: true, selected: data?.length || 0, sent, failed });
}
