// app/api/admin/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'review.approve')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('review_queue')
    .select(`
      *,
      content:content_id (
        content_type,
        is_sensitive,
        needs_scholar_review,
        content_translations ( title, lang )
      )
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((row: any) => {
    const translation = row.content?.content_translations?.find((t: any) => t.lang === 'ar')
      ?? row.content?.content_translations?.[0];
    return {
      ...row,
      content_title: translation?.title ?? null,
      content_type: row.content?.content_type ?? null,
      is_sensitive: row.content?.is_sensitive ?? false,
      needs_scholar_review: row.content?.needs_scholar_review ?? false,
    };
  });

  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'review.approve')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });
  }

  const body = await req.json();
  const { item_id, content_id, action, notes } = body;
  const supabase = getSupabaseAdmin();

  try {
    if (
      typeof item_id !== 'string' ||
      typeof content_id !== 'string' ||
      !['approve', 'reject'].includes(action)
    ) {
      return NextResponse.json({ error: 'بيانات المراجعة غير مكتملة' }, { status: 400 });
    }

    const { data: reviewItem, error: reviewItemError } = await supabase
      .from('review_queue')
      .select('id, content_id, status')
      .eq('id', item_id)
      .eq('content_id', content_id)
      .maybeSingle();

    if (reviewItemError) throw new Error(reviewItemError.message);
    if (!reviewItem) {
      return NextResponse.json({ error: 'عنصر المراجعة غير موجود' }, { status: 404 });
    }
    if (reviewItem.status !== 'pending') {
      return NextResponse.json({ error: 'تم التعامل مع عنصر المراجعة مسبقًا' }, { status: 409 });
    }

    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id')
      .eq('id', content_id)
      .maybeSingle();

    if (contentError) throw new Error(contentError.message);
    if (!content) return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });

    if (action === 'approve') {
      const { error: publishError } = await supabase
        .from('content')
        .update({
          status: 'published',
          reviewer_id: session.userId,
          published_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .eq('id', content_id);

      if (publishError) throw new Error(publishError.message);

      const { data: resolvedItem, error: resolveError } = await supabase
        .from('review_queue')
        .update({
          status: 'approved',
          scholar_notes: notes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', item_id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (resolveError) throw new Error(resolveError.message);
      if (!resolvedItem) {
        return NextResponse.json({ error: 'تم التعامل مع عنصر المراجعة مسبقًا' }, { status: 409 });
      }

      const { error: auditError } = await supabase.from('audit_log').insert({
        user_id: session.userId,
        action: 'approve',
        table_name: 'content',
        record_id: content_id,
        new_data: { notes },
      });

      if (auditError) throw new Error(auditError.message);
    } else {
      const { error: rejectError } = await supabase
        .from('content')
        .update({
          status: 'draft',
          reviewer_id: session.userId,
          updated_by: session.userId,
        })
        .eq('id', content_id);

      if (rejectError) throw new Error(rejectError.message);

      const { data: resolvedItem, error: resolveError } = await supabase
        .from('review_queue')
        .update({
          status: 'changes_requested',
          scholar_notes: notes || '',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', item_id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (resolveError) throw new Error(resolveError.message);
      if (!resolvedItem) {
        return NextResponse.json({ error: 'تم التعامل مع عنصر المراجعة مسبقًا' }, { status: 409 });
      }

      const { error: auditError } = await supabase.from('audit_log').insert({
        user_id: session.userId,
        action: 'reject',
        table_name: 'content',
        record_id: content_id,
        new_data: { notes },
      });

      if (auditError) throw new Error(auditError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تنفيذ المراجعة';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
