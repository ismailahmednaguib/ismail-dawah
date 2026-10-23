// =====================================================
// /api/admin/content/[id]/revisions/[revisionId]
// POST → استعادة نسخة سابقة
// =====================================================
import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import {
  ContentRevisionUnavailableError,
  restoreContentRevision,
} from '@/lib/admin/content-service';
import { revalidatePublicContent } from '@/lib/revalidate-public';

type Params = { params: Promise<{ id: string; revisionId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية استعادة النسخ' }, { status: 403 });
  }

  const { id, revisionId } = await params;

  try {
    const result = await restoreContentRevision(id, revisionId, session.userId);
    revalidatePublicContent();
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof ContentRevisionUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }

    const message = err instanceof Error ? err.message : 'فشل استعادة النسخة';
    const status = /غير موجودة|غير موجود/.test(message) ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
