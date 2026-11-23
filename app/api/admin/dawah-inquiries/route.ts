import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function getManager() {
  const session = await getAdminSession();
  return session && can(session.roles, 'questions.manage') ? session : null;
}

export async function GET(request: NextRequest) {
  const session = await getManager();
  if (!session) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 });

  const status = request.nextUrl.searchParams.get('status');
  let query = getSupabaseAdmin()
    .from('dawah_inquiries')
    .select('id, question, email, lang, page_slug, status, answer, created_at, answered_at, answered_by')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status === 'pending' || status === 'answered' || status === 'closed') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  return NextResponse.json({ ok: true, inquiries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getManager();
  if (!session) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 403 });

  const body = await request.json().catch(() => null) as { id?: string; answer?: string; status?: string } | null;
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim().slice(0, 10000) : '';
  const status = body?.status === 'closed' ? 'closed' : answer ? 'answered' : 'pending';
  if (!id || (status === 'answered' && !answer)) {
    return NextResponse.json({ ok: false, error: 'اكتب الإجابة أولًا.' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('dawah_inquiries')
    .update({ answer: answer || null, status, answered_at: status === 'answered' ? new Date().toISOString() : null, answered_by: status === 'answered' ? session.userId : null })
    .eq('id', id)
    .select('id, question, email, lang, page_slug, status, answer, created_at, answered_at, answered_by')
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, inquiry: data });
}
