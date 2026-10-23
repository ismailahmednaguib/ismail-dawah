import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MEDIA_TYPES = new Set(['image', 'pdf', 'audio', 'video']);

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'media.manage')) {
    return NextResponse.json({ error: 'لا تملك صلاحية إدارة الوسائط.' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const type = params.get('type')?.trim() || '';
  const limitValue = Number(params.get('limit') || 100);
  const limit = Number.isFinite(limitValue) ? Math.max(1, Math.min(200, Math.floor(limitValue))) : 100;

  if (type && !MEDIA_TYPES.has(type)) {
    return NextResponse.json({ error: 'نوع الوسيط غير صالح.' }, { status: 400 });
  }

  let query = getSupabaseAdmin()
    .from('content_media')
    .select('id, content_id, type, url, storage_path, title, alt_text, mime_type, size_bytes, duration_seconds, sort_order, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'تعذر تحميل مكتبة الوسائط.' }, { status: 500 });

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 });
}

