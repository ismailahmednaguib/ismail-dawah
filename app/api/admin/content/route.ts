// =====================================================
// /api/admin/content
// GET  → قائمة المحتوى (مع فلاتر)
// POST → إنشاء محتوى جديد
// =====================================================
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasAnyRole } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { listContent } from '@/lib/admin/content-service';
import { createContent } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!hasAnyRole(session, ['super_admin', 'admin', 'editor', 'scholar_reviewer', 'translator'])) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    type: searchParams.get('type') as any,
    lang: searchParams.get('lang') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    per_page: Number(searchParams.get('per_page') ?? 20),
  };

  try {
    const result = await listContent(filters);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.create')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json();

  try {
    const content = await createContent(body, session.userId);
    return NextResponse.json({ content }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}