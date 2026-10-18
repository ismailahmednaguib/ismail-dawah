import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['unassigned', 'assigned', 'in_progress', 'waiting', 'resolved'] as const;
type AssignmentStatus = (typeof STATUSES)[number];
type ResponderRow = { user_id?: unknown; full_name?: unknown; roles?: unknown };

function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function authorize() {
  const session = await getAdminSession();
  if (!session) return { session: null, response: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) };
  if (!can(session.roles, 'questions.manage')) {
    return { session: null, response: NextResponse.json({ error: 'لا تملك صلاحية إدارة طلبات الحوار.' }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function GET(request: NextRequest) {
  const auth = await authorize();
  if (auth.response) return auth.response;

  try {
    const supabase = getSupabaseAdmin();
    const requestId = cleanText(request.nextUrl.searchParams.get('requestId'), 128);
    let query = supabase
      .from('dawah_request_assignments')
      .select('id, request_id, language, status, assigned_to, assigned_name, notes, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(300);

    if (requestId) query = query.eq('request_id', requestId);
    const assignmentsResult = await query;
    if (assignmentsResult.error) {
      return NextResponse.json({ error: 'تعذر تحميل توزيع الطلبات. نفّذ migration الخاصة بطلبات الحوار أولًا.' }, { status: 503 });
    }

    const respondersResult = await supabase
      .from('user_roles')
      .select('user_id, full_name, roles, is_active')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .limit(200);

    const responders = (respondersResult.data ?? []) as unknown as ResponderRow[];
    const normalizedResponders = responders
      .filter((row): row is ResponderRow & { user_id: string } => typeof row.user_id === 'string' && isUuid(row.user_id))
      .map((row) => ({
        userId: row.user_id,
        name: cleanText(row.full_name, 160) || row.user_id,
        roles: Array.isArray(row.roles) ? row.roles.filter((role: unknown) => typeof role === 'string').slice(0, 10) : [],
      }));

    return NextResponse.json({ ok: true, assignments: assignmentsResult.data ?? [], responders: normalizedResponders });
  } catch (error) {
    console.error('[DawahAssignments] GET error:', error);
    return NextResponse.json({ error: 'تعذر تحميل توزيع الطلبات.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (auth.response || !auth.session) return auth.response;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const requestId = cleanText(body?.requestId, 128);
  const language = body?.language === 'en' ? 'en' : 'ar';
  const status = STATUSES.includes(body?.status as AssignmentStatus)
    ? body?.status as AssignmentStatus
    : 'unassigned';
  const assignedTo = typeof body?.assignedTo === 'string' && isUuid(body.assignedTo) ? body.assignedTo : null;
  const notes = cleanText(body?.notes, 3_000) || null;

  if (!requestId) return NextResponse.json({ error: 'معرّف الطلب مطلوب.' }, { status: 400 });

  try {
    const supabase = getSupabaseAdmin();
    let assignedName: string | null = null;
    if (assignedTo) {
      const responder = await supabase
        .from('user_roles')
        .select('full_name, is_active')
        .eq('user_id', assignedTo)
        .maybeSingle();
      if (responder.error || responder.data?.is_active === false) {
        return NextResponse.json({ error: 'عضو الفريق المحدد غير متاح.' }, { status: 400 });
      }
      assignedName = cleanText(responder.data?.full_name, 160) || null;
    }

    const { data, error } = await supabase
      .from('dawah_request_assignments')
      .upsert({
        request_id: requestId,
        language,
        status,
        assigned_to: assignedTo,
        assigned_name: assignedName,
        notes,
        created_by: auth.session.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'request_id' })
      .select('id, request_id, language, status, assigned_to, assigned_name, notes, created_at, updated_at')
      .single();

    if (error) {
      console.error('[DawahAssignments] POST error:', error);
      return NextResponse.json({ error: 'تعذر حفظ توزيع الطلب. تأكد من تنفيذ migration.' }, { status: 503 });
    }

    await supabase.from('audit_log').insert({
      user_id: auth.session.userId,
      action: 'update',
      table_name: 'dawah_request_assignments',
      record_id: data.id,
      new_data: data,
    }).then(() => undefined, () => undefined);

    return NextResponse.json({ ok: true, assignment: data });
  } catch (error) {
    console.error('[DawahAssignments] POST unexpected error:', error);
    return NextResponse.json({ error: 'تعذر حفظ توزيع الطلب.' }, { status: 500 });
  }
}
