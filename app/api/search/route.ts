// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidLang, type Lang } from '@/lib/i18n';
import type { Madhhab } from '@/lib/types/content';

const MADHHABS: Madhhab[] = [
  'general',
  'hanafi',
  'maliki',
  'shafii',
  'hanbali',
  'zahiri',
  'jafari',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get('q')?.trim() ?? '';
  const q = rawQuery
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
    .trim();
  const requestedLang = searchParams.get('lang') ?? 'ar';
  const type = searchParams.get('type');
  const audience = searchParams.get('audience');
  const age = searchParams.get('age');
  const level = searchParams.get('level');
  const requestedMadhhab = searchParams.get('madhhab');
  const madhhab = MADHHABS.includes(requestedMadhhab as Madhhab)
    ? (requestedMadhhab as Madhhab)
    : undefined;
  const pageValue = Number(searchParams.get('page'));
  const perPageValue = Number(searchParams.get('per_page'));
  const page = Number.isFinite(pageValue) ? Math.max(1, Math.floor(pageValue)) : 1;
  const perPage = Number.isFinite(perPageValue)
    ? Math.min(50, Math.max(1, Math.floor(perPageValue)))
    : 20;

  if (!isValidLang(requestedLang)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  const lang: Lang = requestedLang;

  if (!q || q.length < 2) {
    return NextResponse.json({
      data: [],
      total: 0,
      page,
      total_pages: 0,
      suggestions: [],
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const from = (page - 1) * perPage;

  // البحث في المحتوى، مع عزل بحث القرآن عن المحتوى الموحد.
  let data: any[] = [];
  let count = 0;

  if (type !== 'quran') {
    let query = supabase
      .from('content')
      .select(`
        id,
        content_type,
        audience,
        age_groups,
        levels,
        published_at,
        views,
        content_translations!inner (
          title,
          slug,
          summary,
          lang
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('content_translations.lang', lang)
      .or(`content_translations.title.ilike.%${q}%,content_translations.body_plain.ilike.%${q}%`);

    if (type) query = query.eq('content_type', type);
    if (audience) query = query.contains('audience', [audience]);
    if (age) query = query.contains('age_groups', [age]);
    if (level) query = query.contains('levels', [level]);
    if (madhhab) query = query.contains('madhhabs', [madhhab]);

    const result = await query
      .order('views', { ascending: false })
      .range(from, from + perPage - 1);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    data = result.data ?? [];
    count = result.count ?? 0;
  }

  // البحث في القرآن (اختياري - لو عندك جدول آيات)
  let quranResults: any[] = [];
  if (!type || type === 'quran') {
    const { data: quranData } = await supabase
      .from('quran_verses')
      .select('id, surah, ayah_from, text, translation')
      .ilike('text', `%${q}%`)
      .limit(5);
    
    quranResults = (quranData ?? []).map((v: any) => ({
      id: v.id,
      type: 'quran_verse',
      title: lang === 'ar' ? `سورة ${v.surah} - آية ${v.ayah_from}` : `Surah ${v.surah} - Ayah ${v.ayah_from}`,
      excerpt: v.text?.slice(0, 150),
      url: `/${lang}/quran?surah=${v.surah}`,
    }));
  }

  const results = (data ?? []).map((item: any) => {
    const t = item.content_translations?.[0];
    return {
      id: item.id,
      type: item.content_type,
      title: t?.title,
      slug: t?.slug,
      summary: t?.summary?.slice(0, 200),
      url: `/${lang}/learn/${item.content_type}/${t?.slug}`,
      published_at: item.published_at,
      views: item.views,
    };
  });

  return NextResponse.json({
    data: [...quranResults, ...results],
    total: (count ?? 0) + quranResults.length,
    page,
    total_pages: Math.ceil((count ?? 0) / perPage),
    query: q,
  });
}
