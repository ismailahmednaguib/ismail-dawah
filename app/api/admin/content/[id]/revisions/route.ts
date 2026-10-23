// =====================================================
// /api/admin/content/[id]/revisions
// GET → قائمة نسخ المحتوى (بلا النسخة الكاملة)
// =====================================================
import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { listContentRevisions } from '@/lib/admin/content-service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.read')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await listContentRevisions(id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تحميل سجل النسخ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
