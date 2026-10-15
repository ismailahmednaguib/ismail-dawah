import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string; referenceId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'review.approve')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية توثيق المراجع' }, { status: 403 });
  }

  const { id, referenceId } = await params;
  const body = await req.json().catch(() => ({}));
  const verified = body.verified !== false;

  const { data, error } = await getSupabaseAdmin()
    .from('content_references')
    .update({
      verified,
      verified_by: verified ? session.userId : null,
    })
    .eq('id', referenceId)
    .eq('content_id', id)
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'المرجع غير موجود' }, { status: 404 });
  return NextResponse.json({ reference: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية حذف المراجع' }, { status: 403 });
  }

  const { id, referenceId } = await params;
  const { error, count } = await getSupabaseAdmin()
    .from('content_references')
    .delete({ count: 'exact' })
    .eq('id', referenceId)
    .eq('content_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!count) return NextResponse.json({ error: 'المرجع غير موجود' }, { status: 404 });
  return NextResponse.json({ success: true });
}
