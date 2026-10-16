// app/api/admin/quality/route.ts
// جودة المحتوى: ملخّص آلي + طابور مراجعة الترجمات (اعتماد/إلغاء) من اللوحة.
import { NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CITATION_PATTERNS = ['قال تعالى', 'قال الله', 'قال رسول', 'قال ﷺ', 'صلى الله عليه وسلم'];
const SHORT_BODY = 220;
const MAX_ROWS = 60;

type Row = {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  body: string | null;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_at: string | null;
  updated_at: string | null;
};

function countMatches(text: string | null, needles: string[]): number {
  if (!text) return 0;
  let total = 0;
  for (const needle of needles) {
    let index = text.indexOf(needle);
    while (index !== -1) {
      total += 1;
      index = text.indexOf(needle, index + needle.length);
    }
  }
  return total;
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'content.read')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية العرض' }, { status: 403 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get('filter') ?? 'pending';

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('content_translations')
    .select(
      'id, content_id, lang, slug, title, body, is_machine_translated, is_reviewed, reviewed_at, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(MAX_ROWS);

  if (filter === 'pending') {
    query = query.eq('is_machine_translated', true).eq('is_reviewed', false);
  } else if (filter === 'reviewed') {
    query = query.eq('is_reviewed', true);
  } else if (filter === 'machine') {
    query = query.eq('is_machine_translated', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'تعذّر قراءة الترجمات', details: error.message },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as Row[];

  const counts = {
    returned: rows.length,
    missingBody: rows.filter((r) => !r.body || !r.body.trim()).length,
    shortBody: rows.filter((r) => r.body && r.body.trim().length > 0 && r.body.trim().length < SHORT_BODY)
      .length,
  };

  // إحصاء عام على كل الترجمات (لعرض شريط التقدّم)
  const [pendingCount, machineCount, reviewedCount, totalCount] = await Promise.all([
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_machine_translated', true)
      .eq('is_reviewed', false),
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_machine_translated', true),
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_reviewed', true),
    supabase.from('content_translations').select('id', { head: true, count: 'exact' }),
  ]);

  const citations = rows
    .map((row) => ({
      id: row.id,
      lang: row.lang,
      slug: row.slug,
      title: row.title,
      mentions: countMatches(`${row.title ?? ''}\n${row.body ?? ''}`, CITATION_PATTERNS),
    }))
    .filter((row) => row.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15);

  const stats = {
    pending: pendingCount.count ?? 0,
    machine: machineCount.count ?? 0,
    reviewed: reviewedCount.count ?? 0,
    total: totalCount.count ?? 0,
  };

  return NextResponse.json({
    ok: true,
    filter,
    counts,
    stats,
    citations,
    rows,
    canReview: can(session.roles, 'content.update'),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });
  }

  let payload: { id?: unknown; action?: unknown; note?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'جسم الطلب غير صالح' }, { status: 400 });
  }

  const id = typeof payload.id === 'string' ? payload.id : '';
  const action = payload.action === 'approve' ? 'approve' : payload.action === 'unapprove' ? 'unapprove' : '';

  if (!id || !action) {
    return NextResponse.json({ error: 'طلب غير مكتمل' }, { status: 400 });
  }

  const approve = action === 'approve';
  const supabase = getSupabaseAdmin();

  const base = {
    is_reviewed: approve,
    reviewed_by: approve ? session.userId : null,
  };

  let { error } = await supabase
    .from('content_translations')
    .update({ ...base, reviewed_at: approve ? new Date().toISOString() : null })
    .eq('id', id);

  // إن لم يُنفَّذ عمود reviewed_at بعد، نكتفي بالحقول الأساسية
  if (error && /reviewed_at/i.test(error.message)) {
    ({ error } = await supabase.from('content_translations').update(base).eq('id', id));
  }

  if (error) {
    return NextResponse.json(
      { error: 'تعذّر تحديث حالة المراجعة', details: error.message },
      { status: 500 }
    );
  }

  await supabase
    .from('audit_log')
    .insert({
      user_id: session.userId,
      action: approve ? 'approve' : 'update',
      table_name: 'content_translations',
      record_id: id,
      new_data: { is_reviewed: approve, note: typeof payload.note === 'string' ? payload.note : null },
    })
    .then(
      () => undefined,
      () => undefined
    );

  return NextResponse.json({ ok: true, id, isReviewed: approve });
}
