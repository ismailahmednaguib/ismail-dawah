import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authorize() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'notifications.manage')) return NextResponse.json({ error: 'ليس لديك صلاحية إدارة الرحلة.' }, { status: 403 });
  return null;
}

function missingTable(error: unknown): boolean {
  return /does not exist|relation|schema cache/i.test(String((error as { message?: unknown })?.message || error));
}

export async function GET(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;
  const status = request.nextUrl.searchParams.get('status') || 'active';
  const search = request.nextUrl.searchParams.get('q')?.trim().slice(0, 120) || '';
  try {
    let query = getSupabaseAdmin()
      .from('dawah_journey_subscribers')
      .select('id, email, lang, day_index, next_send_at, active, last_sent_at, completed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (status === 'active') query = query.eq('active', true);
    if (status === 'inactive') query = query.eq('active', false);
    if (search) query = query.ilike('email', `%${search.replace(/[%_]/g, '\\$&')}%`);
    const { data, error } = await query;
    if (error) {
      if (missingTable(error)) return NextResponse.json({ ok: true, subscribers: [], configured: false });
      return NextResponse.json({ ok: false, error: 'تعذر تحميل مشتركي الرحلة.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, configured: true, subscribers: data || [] });
  } catch (error) {
    console.error('[AdminDawahJourney] GET error:', error);
    return NextResponse.json({ ok: false, error: 'تعذر تحميل مشتركي الرحلة.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;
  const body = await request.json().catch(() => null) as { email?: unknown; active?: unknown; reset?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  if (!email || !email.includes('@')) return NextResponse.json({ ok: false, error: 'البريد الإلكتروني غير صالح.' }, { status: 400 });
  try {
    const reset = body?.reset === true;
    const patch = reset
      ? { active: true, day_index: 1, next_send_at: new Date().toISOString(), completed_at: null }
      : { active: body?.active === true };
    const { error } = await getSupabaseAdmin().from('dawah_journey_subscribers').update(patch).eq('email', email);
    if (error) return NextResponse.json({ ok: false, error: 'تعذر تحديث المشترك.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[AdminDawahJourney] PATCH error:', error);
    return NextResponse.json({ ok: false, error: 'تعذر تحديث المشترك.' }, { status: 500 });
  }
}
