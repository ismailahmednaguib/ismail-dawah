import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeContentReportStatus } from '@/lib/content-report';

async function getManager() {
  const session = await getAdminSession();
  return session && can(session.roles, 'questions.manage') ? session : null;
}

export async function GET(request: NextRequest) {
  const session = await getManager();
  if (!session) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 });

  const statusParam = request.nextUrl.searchParams.get('status');
  let query = getSupabaseAdmin()
    .from('content_reports')
    .select('id, page_url, page_title, description, email, lang, status, resolution_note, created_at, updated_at, resolved_at, resolved_by')
    .order('created_at', { ascending: false })
    .limit(100);
  if (statusParam && ['new', 'triaged', 'resolved', 'ignored'].includes(statusParam)) query = query.eq('status', statusParam);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true, reports: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const session = await getManager();
  if (!session) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 });

  const body = await request.json().catch(() => null) as { id?: string; status?: unknown; resolution_note?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const status = normalizeContentReportStatus(body?.status);
  const resolutionNote = typeof body?.resolution_note === 'string' ? body.resolution_note.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, 2_000) : '';
  if (!id) return NextResponse.json({ ok: false, error: 'معرّف البلاغ مطلوب.' }, { status: 400 });

  const resolved = status === 'resolved' || status === 'ignored';
  const { data, error } = await getSupabaseAdmin()
    .from('content_reports')
    .update({
      status,
      resolution_note: resolutionNote || null,
      resolved_at: resolved ? new Date().toISOString() : null,
      resolved_by: resolved ? session.userId : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, status, resolution_note, resolved_at, resolved_by, updated_at')
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, report: data });
}
