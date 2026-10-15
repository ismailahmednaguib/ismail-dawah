import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin, logAudit } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string; mediaId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id, mediaId } = await params;
  const supabase = getSupabaseAdmin();
  const { data: media, error: lookupError } = await supabase
    .from('content_media')
    .select('id, content_id, type, storage_path')
    .eq('id', mediaId)
    .eq('content_id', id)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!media) return NextResponse.json({ error: 'الوسيط غير موجود' }, { status: 404 });

  const { error } = await supabase
    .from('content_media')
    .delete()
    .eq('id', mediaId)
    .eq('content_id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(session.userId, 'delete', 'content_media', mediaId, undefined, media);
  return NextResponse.json({ success: true });
}
