import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const LANGUAGE_CODES = new Set(['ar', 'en']);

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

function validKind(value: string): boolean {
  return /^[a-z][a-z0-9_-]{0,29}$/.test(value);
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.read')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') ?? 'ar';
  const kind = searchParams.get('kind') ?? '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 200), 1), 500);

  if (!LANGUAGE_CODES.has(lang)) {
    return NextResponse.json({ error: 'اللغة غير صالحة' }, { status: 400 });
  }
  if (kind && !validKind(kind)) {
    return NextResponse.json({ error: 'نوع التصنيف غير صالح' }, { status: 400 });
  }

  let query = getSupabaseAdmin()
    .from('taxonomies')
    .select('*')
    .eq('lang', lang)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);

  if (kind) query = query.eq('kind', kind);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'taxonomy.manage')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية إدارة التصنيفات' }, { status: 403 });
  }

  const body = await req.json();
  const name = cleanText(body.name, 120);
  const kind = cleanText(body.kind, 30).toLowerCase();
  const lang = cleanText(body.lang, 8).toLowerCase();
  const slug = normalizeSlug(cleanText(body.slug, 200) || name);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 });
  }
  if (!validKind(kind)) {
    return NextResponse.json({ error: 'نوع التصنيف يجب أن يبدأ بحروف إنجليزية' }, { status: 400 });
  }
  if (!LANGUAGE_CODES.has(lang)) {
    return NextResponse.json({ error: 'اللغة غير صالحة' }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: 'تعذر إنشاء الرابط المختصر للتصنيف' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('taxonomies')
    .insert({
      kind,
      lang,
      name,
      slug,
      icon: cleanText(body.icon, 20) || null,
      color: cleanText(body.color, 20) || null,
      sort_order: Number.isInteger(body.sort_order) ? body.sort_order : 0,
    })
    .select('*')
    .single();

  if (error) {
    const message = error.code === '23505'
      ? 'يوجد تصنيف بنفس النوع واللغة والرابط'
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ taxonomy: data }, { status: 201 });
}
