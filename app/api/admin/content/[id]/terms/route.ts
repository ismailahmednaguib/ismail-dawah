import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.read')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await getSupabaseAdmin()
    .from('content_terms')
    .select('taxonomy_id, taxonomies (*)')
    .eq('content_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: (data ?? []).map((row: { taxonomy_id: string; taxonomies: unknown }) => row.taxonomies),
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية تعديل التصنيفات' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const taxonomyIds = Array.isArray(body.taxonomy_ids)
    ? [...new Set(body.taxonomy_ids.filter((value: unknown): value is string => typeof value === 'string'))]
    : [];

  if (taxonomyIds.length > 50) {
    return NextResponse.json({ error: 'لا يمكن ربط أكثر من 50 تصنيفًا' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 500 });
  if (!content) return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });

  if (taxonomyIds.length > 0) {
    const { data: taxonomies, error: taxonomyError } = await supabase
      .from('taxonomies')
      .select('id')
      .in('id', taxonomyIds);

    if (taxonomyError) return NextResponse.json({ error: taxonomyError.message }, { status: 500 });
    if ((taxonomies ?? []).length !== taxonomyIds.length) {
      return NextResponse.json({ error: 'يوجد تصنيف غير موجود' }, { status: 400 });
    }
  }

  const { error: deleteError } = await supabase
    .from('content_terms')
    .delete()
    .eq('content_id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  if (taxonomyIds.length > 0) {
    const { error: insertError } = await supabase.from('content_terms').insert(
      taxonomyIds.map((taxonomy_id) => ({ content_id: id, taxonomy_id }))
    );
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, taxonomy_ids: taxonomyIds });
}
