import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim().slice(0, 100) || '';
  const fallback = new URL('/ar/dawah/path?journey=unsubscribed', request.url);
  if (!token) return NextResponse.redirect(fallback);

  try {
    const supabase = getSupabaseAdmin();
    const found = await supabase.from('dawah_journey_subscribers').select('lang').eq('unsubscribe_token', token).maybeSingle();
    const lang = found.data?.lang === 'en' ? 'en' : 'ar';
    const destination = new URL(`/${lang}/dawah/path?journey=unsubscribed`, request.url);
    if (!found.error && found.data) {
      await supabase.from('dawah_journey_subscribers').update({ active: false, completed_at: new Date().toISOString() }).eq('unsubscribe_token', token);
      return NextResponse.redirect(destination);
    }
    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(fallback);
  }
}
