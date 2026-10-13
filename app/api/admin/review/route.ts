// app/api/admin/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('review_queue')
    .select(`
      *,
      content:content_id (
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
    };
  });

  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const canReview = session.roles.some(r => ['super_admin', 'admin', 'scholar_reviewer'].includes(r));
  if (!canReview) return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });

  const body = await req.json();
  const { item_id, content_id, action, notes } = body;
  const supabase = getSupabaseAdmin();

  try {
    if (action === 'approve') {
      // نشر المحتوى
      await supabase
        .from('content')
        .update({
          status: 'published',
          reviewer_id: session.userId,
          published_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .eq('id', content_id);

      // تحديث طابور المراجعة
      await supabase
        .from('review_queue')
        .update({
          status: 'approved',
          scholar_notes: notes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', item_id);

      // تسجيل في سجل التدقيق
      await supabase.from('audit_log').insert({
        user_id: session.userId,
        action: 'approve',
        table_name: 'content',
        record_id: content_id,
        new_data: { notes },
      });
    } else if (action === 'reject') {
      // إعادة المحتوى للمراجعة مع طلب تعديلات
      await supabase
        .from('content')
        .update({
          status: 'draft',
          reviewer_id: session.userId,
          updated_by: session.userId,
        })
        .eq('id', content_id);

      await supabase
        .from('review_queue')
        .update({
          status: 'changes_requested',
          scholar_notes: notes || '',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', item_id);

      await supabase.from('audit_log').insert({
        user_id: session.userId,
        action: 'reject',
        table_name: 'content',
        record_id: content_id,
        new_data: { notes },
      });
    } else {
      return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}