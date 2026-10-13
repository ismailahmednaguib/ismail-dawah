// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const lang = searchParams.get('lang') ?? 'ar';
  const type = searchParams.get('type');
  const audience = searchParams.get('audience');
  const age = searchParams.get('age');
  const level = searchParams.get('level');
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || 20;

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

  // البحث في المحتوى
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

  const { data, error, count } = await query
    .order('views', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      title: `سورة ${v.surah} - آية ${v.ayah_from}`,
      excerpt: v.text?.slice(0, 150),
      url: `/quran/${v.surah}`,
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