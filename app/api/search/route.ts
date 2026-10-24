// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isValidLang, type Lang } from '@/lib/i18n';
import { searchSurahs } from '@/lib/references/quran-search';
import { rateLimitGuard } from '@/lib/rate-limit';
import { getPublicReadClient } from '@/lib/supabase/public-read';
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

/**
 * قراءة عدد صحيح موجب من معامل الرابط.
 * تعود إلى القيمة الافتراضية إذا كان المعامل غائبًا أو غير صالح
 * (Number(null) تساوي 0، فنعالج الغياب صراحةً).
 */
function positiveInt(raw: string | null, fallback: number, max: number): number {
  if (raw === null || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(n)));
}

export async function GET(req: NextRequest) {
  const limited = await rateLimitGuard(req, 'search');
  if (limited) return limited;

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
  const page = positiveInt(searchParams.get('page'), 1, 10_000);
  const perPage = positiveInt(searchParams.get('per_page'), 20, 50);

  if (!isValidLang(requestedLang)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  const lang: Lang = requestedLang;

  if (!q || q.length < 2) {
    return NextResponse.json({
      data: [],
      total: 0,
      page,
      per_page: perPage,
      total_pages: 0,
      facets: {},
      suggestions: [],
    });
  }

  // قراءة خادمية بمفتاح الخدمة (أو anon كبديل): تُفرض `status='published'`
  // في كل استعلام، فلا تصل مسودات إلى الجمهور.
  const supabase = getPublicReadClient();

  const from = (page - 1) * perPage;

  // 1) مطابقة النص في جدول الترجمات أولًا (يتفادى قيود الفلترة على الموارد المدمجة في PostgREST).
  let matchedIds: string[] = [];

  if (type !== 'quran') {
    const { data: matchRows, error: matchError } = await supabase
      .from('content_translations')
      .select('content_id')
      .eq('lang', lang)
      .or(`title.ilike.%${q}%,body_plain.ilike.%${q}%`)
      .limit(500);

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    matchedIds = Array.from(
      new Set(((matchRows ?? []) as Array<{ content_id: string }>).map((r) => r.content_id))
    );
  }

  // 2) البحث في المحتوى بالاعتماد على المعرّفات المطابقة، مع بقية الفلاتر والترقيم.
  let data: any[] = [];
  let count = 0;

  if (type !== 'quran' && matchedIds.length > 0) {
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
        content_translations (
          title,
          slug,
          summary,
          lang
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .in('id', matchedIds);

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

  // البحث في القرآن: أسماء السور وأرقامها ومعانيها الإنجليزية من بيانات محلية موثوقة.
  // لا نعتمد على جدول quran_verses غير الموجود، ولا نبحث في نص الآيات هنا.
  // نعرض أفضل ٥ سور؛ صفحة القرآن تتكفل بالتصفح الكامل. نحسب المطابقات دائمًا
  // ليعرض مرشّح «السور» عدده حتى أثناء فلتر نوع آخر.
  const quranMatches = searchSurahs(q, lang).slice(0, 5);
  const quranResults = (!type || type === 'quran')
    ? quranMatches.map((match) => ({
        id: `quran-surah-${match.number}`,
        type: 'quran',
        title: match.title,
        summary: match.summary,
        url: `/${lang}/quran/${match.number}`,
      }))
    : [];

  // لا نرجع لترجمة لغة أخرى عند غياب ترجمة اللغة المطلوبة؛ هذا كان يسرّب
  // العنوان العربي إلى نتائج البحث الإنجليزية. النتيجة بلا ترجمة تُسقَط.
  const results = (data ?? []).flatMap((item: any) => {
    const t = (item.content_translations ?? []).find(
      (translation: any) => translation.lang === lang
    );
    if (!t?.slug || !t?.title) return [];

    return [{
      id: item.id,
      type: item.content_type,
      title: t.title,
      slug: encodeURIComponent(t.slug),
      summary: typeof t.summary === 'string' ? t.summary.slice(0, 200) : undefined,
      url: `/${lang}/learn/${item.content_type}/${encodeURIComponent(t.slug)}`,
      published_at: item.published_at,
      views: item.views,
    }];
  });

  // إحصاءات الأنواع (facets): عدد النتائج لكل نوع مع تطبيق بقية الفلاتر.
  const facets: Record<string, number> = {};
  if (type !== 'quran' && matchedIds.length > 0) {
    let facetQuery = supabase
      .from('content')
      .select('content_type')
      .eq('status', 'published')
      .in('id', matchedIds);

    if (audience) facetQuery = facetQuery.contains('audience', [audience]);
    if (age) facetQuery = facetQuery.contains('age_groups', [age]);
    if (level) facetQuery = facetQuery.contains('levels', [level]);
    if (madhhab) facetQuery = facetQuery.contains('madhhabs', [madhhab]);

    const { data: facetRows } = await facetQuery.limit(1000);
    for (const row of (facetRows ?? []) as Array<{ content_type: string }>) {
      facets[row.content_type] = (facets[row.content_type] ?? 0) + 1;
    }
  }
  if (quranMatches.length > 0) {
    facets.quran = quranMatches.length;
  }

  return NextResponse.json({
    data: [...quranResults, ...results],
    total: (count ?? 0) + quranResults.length,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
    facets,
    query: q,
  });
}
