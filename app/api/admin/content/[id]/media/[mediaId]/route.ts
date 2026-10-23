import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin, logAudit } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string; mediaId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'media.manage')) {
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

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'media.manage')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id, mediaId } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'بيانات الوسيط غير صالحة' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: Record<string, string | null> = {};
  if ('title' in input) updates.title = cleanMediaText(input.title, 240);
  if ('alt_text' in input) updates.alt_text = cleanMediaText(input.alt_text, 240);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'لا توجد حقول قابلة للتعديل.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: before, error: lookupError } = await supabase
    .from('content_media')
    .select('id, content_id, type, title, alt_text')
    .eq('id', mediaId)
    .eq('content_id', id)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: 'الوسيط غير موجود' }, { status: 404 });

  const { data, error } = await supabase
    .from('content_media')
    .update(updates)
    .eq('id', mediaId)
    .eq('content_id', id)
    .select('id, content_id, type, url, storage_path, title, alt_text, mime_type, size_bytes, duration_seconds, sort_order, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAudit(session.userId, 'update', 'content_media', mediaId, before, data);
  return NextResponse.json({ success: true, media: data });
}

function cleanMediaText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
  return text || null;
}
