import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();
  if (!token || token.length > 120) return NextResponse.json({ ok: false, error: 'رابط غير صالح.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('new_muslim_journey_subscribers').select('lang').eq('unsubscribe_token', token).maybeSingle();
  if (data) await supabase.from('new_muslim_journey_subscribers').update({ active: false, completed_at: new Date().toISOString() }).eq('unsubscribe_token', token);
  const lang = data?.lang === 'en' ? 'en' : 'ar';
  return NextResponse.redirect(new URL(`/${lang}/embrace-islam?journey=unsubscribed`, request.url));
}
