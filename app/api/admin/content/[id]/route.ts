// =====================================================
// /api/admin/content/[id]
// GET    → قراءة محتوى واحد
// PUT    → تعديل
// DELETE → حذف (للمدير فقط)
// =====================================================
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasAnyRole } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getContentFull, setStatus, deleteContent } from '@/lib/admin/content-service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!hasAnyRole(session, ['super_admin', 'admin', 'editor', 'scholar_reviewer', 'translator'])) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const data = await getContentFull(id);
    if (!data) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  try {
    // تغيير الحالة فقط (النشر/الأرشفة)
    if (body.status) {
      await setStatus(id, body.status, session.userId);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.delete')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await deleteContent(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}