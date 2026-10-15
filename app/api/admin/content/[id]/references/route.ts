import { NextRequest, NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { HadithGrade, RefKind } from '@/lib/types/content';

type Params = { params: Promise<{ id: string }> };

const REF_KINDS: RefKind[] = [
  'quran',
  'hadith',
  'athar',
  'scholar_quote',
  'fiqh_rule',
  'book',
  'fatwa_source',
  'other',
];

const HADITH_GRADES: HadithGrade[] = ['sahih', 'hasan', 'daif', 'mawdu', 'unknown'];

function nullableText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 5000) : null;
}

function nullableInt(value: unknown, min = 0, max = 2_147_483_647): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

async function canReadContent() {
  const session = await getAdminSession();
  return session && can(session.roles, 'content.read') ? session : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await canReadContent();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { id } = await params;
  const { data, error } = await getSupabaseAdmin()
    .from('content_references')
    .select('*')
    .eq('content_id', id)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية تعديل المراجع' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const kind = body.kind as RefKind;

  if (!REF_KINDS.includes(kind)) {
    return NextResponse.json({ error: 'نوع المرجع غير صالح' }, { status: 400 });
  }

  const surah = nullableInt(body.surah, 1, 114);
  const ayahFrom = nullableInt(body.ayah_from, 1, 1000);
  const ayahTo = nullableInt(body.ayah_to, 1, 1000);
  const hadithGrade = body.hadith_grade as HadithGrade | undefined;

  if (kind === 'quran' && (surah === null || ayahFrom === null)) {
    return NextResponse.json(
      { error: 'مرجع القرآن يحتاج رقم السورة ورقم الآية' },
      { status: 400 }
    );
  }

  if (ayahTo !== null && ayahFrom !== null && ayahTo < ayahFrom) {
    return NextResponse.json({ error: 'نهاية نطاق الآيات أصغر من بدايته' }, { status: 400 });
  }

  if (hadithGrade && !HADITH_GRADES.includes(hadithGrade)) {
    return NextResponse.json({ error: 'درجة الحديث غير صالحة' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('content_references')
    .insert({
      content_id: id,
      kind,
      surah,
      ayah_from: ayahFrom,
      ayah_to: ayahTo,
      hadith_text: nullableText(body.hadith_text),
      narrator: nullableText(body.narrator),
      hadith_book: nullableText(body.hadith_book),
      hadith_number: nullableInt(body.hadith_number, 1),
      hadith_grade: hadithGrade && HADITH_GRADES.includes(hadithGrade) ? hadithGrade : null,
      graded_by: nullableText(body.graded_by),
      scholar_name: nullableText(body.scholar_name),
      scholar_death: nullableText(body.scholar_death),
      book_title: nullableText(body.book_title),
      volume_page: nullableText(body.volume_page),
      quote_text: nullableText(body.quote_text),
      note: nullableText(body.note),
      verified: false,
      verified_by: null,
      sort_order: nullableInt(body.sort_order, 0) ?? 0,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reference: data }, { status: 201 });
}
