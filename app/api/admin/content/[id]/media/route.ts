import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasAnyRole } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin, logAudit } from '@/lib/supabase/admin';
import type { ContentMedia } from '@/lib/types/content';

type Params = { params: Promise<{ id: string }> };
type MediaType = ContentMedia['type'];

const MEDIA_TYPES: MediaType[] = ['image', 'pdf', 'audio', 'video'];

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
  return text || null;
}

function parseNonNegativeInt(value: unknown, max: number): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > max) return null;
  return parsed;
}

function isValidMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2_048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!hasAnyRole(session, ['super_admin', 'admin', 'editor', 'scholar_reviewer', 'translator'])) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { id } = await params;
  const { data, error } = await getSupabaseAdmin()
    .from('content_media')
    .select('*')
    .eq('content_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'بيانات الوسيط غير صالحة' }, { status: 400 });
  }

  const type = body.type as MediaType;
  if (!MEDIA_TYPES.includes(type) || !isValidMediaUrl(body.url)) {
    return NextResponse.json({ error: 'نوع الوسيط أو الرابط غير صالح' }, { status: 400 });
  }

  const title = cleanText(body.title, 240);
  const altText = cleanText(body.alt_text, 240);
  const storagePath = cleanText(body.storage_path, 512);
  const mimeType = cleanText(body.mime_type, 120);
  const sizeBytes = parseNonNegativeInt(body.size_bytes, 10_000_000_000);
  const durationSeconds = parseNonNegativeInt(body.duration_seconds, 86_400);
  const sortOrder = parseNonNegativeInt(body.sort_order, 100_000) ?? 0;
  const supabase = getSupabaseAdmin();

  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 500 });
  if (!content) return NextResponse.json({ error: 'المحتوى غير موجود' }, { status: 404 });

  const { data, error } = await supabase
    .from('content_media')
    .insert({
      content_id: id,
      type,
      url: body.url.trim(),
      storage_path: storagePath,
      title,
      alt_text: altText,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      duration_seconds: durationSeconds,
      sort_order: sortOrder,
      created_by: session.userId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAudit(session.userId, 'create', 'content_media', data.id, { content_id: id, type });
  return NextResponse.json({ success: true, media: data }, { status: 201 });
}
