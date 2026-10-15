import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function missingColumn(error: unknown): boolean {
  return /column .* does not exist|Could not find the column|schema cache/i.test(
    String((error as { message?: unknown })?.message || '')
  );
}

function missingTable(error: unknown): boolean {
  return /does not exist|Could not find the table|relation/i.test(
    String((error as { message?: unknown })?.message || '')
  );
}

async function authorize() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'notifications.manage')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية إدارة المشتركين.' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  try {
    const supabase = getSupabaseAdmin();
    const status = request.nextUrl.searchParams.get('status') || 'active';
    const search = request.nextUrl.searchParams.get('q')?.trim().slice(0, 120) || '';
    const selects = [
      'id, email, name, lang, active, subscribed_at, updated_at, unsubscribed_at',
      'id, email, name, lang, active, subscribed_at',
      'id, email, lang, active, subscribed_at',
      'email, lang, active, subscribed_at',
      'email, lang',
    ];

    let lastError: unknown = null;

    for (const select of selects) {
      const hasActive = /(^|, )active(,|$)/.test(select);
      const hasSubscribedAt = /(^|, )subscribed_at(,|$)/.test(select);
      let query = supabase
        .from('newsletter_subscribers')
        .select(select)
        .limit(500);

      if (hasSubscribedAt) query = query.order('subscribed_at', { ascending: false });
      if (hasActive && status === 'active') query = query.eq('active', true);
      if (hasActive && status === 'inactive') query = query.eq('active', false);
      if (search) query = query.ilike('email', `%${search.replace(/[%_]/g, '\\$&')}%`);

      const result = await query;
      if (!result.error) {
        return NextResponse.json({ ok: true, subscribers: result.data || [] });
      }

      lastError = result.error;
      if (missingColumn(result.error)) continue;
      if (missingTable(result.error)) {
        return NextResponse.json({ ok: false, error: 'جدول النشرة البريدية غير موجود. نفّذ إعدادات Supabase أولًا.' }, { status: 503 });
      }
      break;
    }

    console.error('[AdminNewsletter] GET error:', lastError);
    return NextResponse.json({ ok: false, error: 'تعذر تحميل المشتركين.' }, { status: 500 });
  } catch (error) {
    console.error('[AdminNewsletter] GET exception:', error);
    return NextResponse.json({ ok: false, error: 'تعذر تحميل المشتركين.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as { email?: unknown; active?: unknown } | null;
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 320) : '';
    const active = body?.active === true;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'البريد الإلكتروني غير صالح.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const attempts = [
      { active, updated_at: now, unsubscribed_at: active ? null : now },
      { active, updated_at: now },
      { active },
    ];

    let lastError: unknown = null;
    for (const payload of attempts) {
      const result = await supabase.from('newsletter_subscribers').update(payload).eq('email', email);
      if (!result.error) return NextResponse.json({ ok: true, active });
      lastError = result.error;
      if (!missingColumn(result.error)) break;
    }

    console.error('[AdminNewsletter] PATCH error:', lastError);
    return NextResponse.json({ ok: false, error: 'تعذر تحديث حالة المشترك.' }, { status: 500 });
  } catch (error) {
    console.error('[AdminNewsletter] PATCH exception:', error);
    return NextResponse.json({ ok: false, error: 'تعذر تحديث حالة المشترك.' }, { status: 500 });
  }
}
