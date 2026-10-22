// lib/learn/queries.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { mergeTermTranslations, type TermLike } from './terms';
import type {
  ContentType,
  Audience,
  AgeGroup,
  EduLevel,
  Madhhab,
} from '@/lib/types/content';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // القراءة العامة تمرّ عبر الخادم فقط، ونستخدم مفتاح الخدمة لتفادي نقص سياسات RLS
  // على الجداول الموحّدة. الأمان مضمون بفرض status='published' في كل استعلام.
  const key =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

/**
 * جلب ترجمة واحدة مع المراجع والتصنيفات.
 * يتنازل تلقائيًا عن الوسائط إذا لم يكن جدول content_media موجودًا في البيئة.
 */
async function fetchTranslation(
  supabase: ReturnType<typeof getClient>,
  lang: string,
  slug: string
) {
  const base = (withMedia: boolean) => `
      *,
      content:content_id (
        *,
        content_references (*),
        ${withMedia ? 'content_media (*),' : ''}
        content_terms (
          taxonomy_id,
          taxonomies (id, kind, name, slug, color, icon)
        )
      )
    `;

  let result = (await supabase
    .from('content_translations')
    .select(base(true))
    .eq('lang', lang)
    .eq('slug', slug)
    .maybeSingle()) as { data: any; error: any };

  if (result.error) {
    result = (await supabase
      .from('content_translations')
      .select(base(false))
      .eq('lang', lang)
      .eq('slug', slug)
      .maybeSingle()) as { data: any; error: any };
  }

  return result;
}

/** جلب كل ترجمات معرّف (slug) عبر اللغات، مع تحمّل غياب جدول الوسائط. */
async function fetchTranslationsBySlug(
  supabase: ReturnType<typeof getClient>,
  slug: string
) {
  const base = (withMedia: boolean) => `
      *,
      content:content_id (
        *,
        content_references (*),
        ${withMedia ? 'content_media (*),' : ''}
        content_terms (
          taxonomy_id,
          taxonomies (id, kind, name, slug, color, icon)
        )
      )
    `;

  let result = (await supabase
    .from('content_translations')
    .select(base(true))
    .eq('slug', slug)
    .limit(20)) as { data: any; error: any };

  if (result.error) {
    result = (await supabase
      .from('content_translations')
      .select(base(false))
      .eq('slug', slug)
      .limit(20)) as { data: any; error: any };
  }

  return result;
}

/** لا نعرض للزوار إلا المراجع التي اعتمدها مراجع علمي. */
function onlyVerifiedReferences<T extends { verified?: boolean }>(
  references: T[] | null | undefined
): T[] {
  return (references ?? []).filter((reference) => reference.verified === true);
}

/**
 * التصنيفات المرتبطة بالمحتوى تشير إلى الصف العربي دائمًا، فنستبدلها
 * بترجمتها (نفس slug + kind) قبل عرضها في صفحة المادة.
 */
async function localizeTerms(
  supabase: ReturnType<typeof getClient>,
  terms: any[],
  lang: string
): Promise<any[]> {
  if (lang === 'ar' || terms.length === 0) return terms;

  const slugs = [...new Set(terms.map((term) => term?.slug).filter(Boolean))];
  if (slugs.length === 0) return terms;

  const { data, error } = (await supabase
    .from('taxonomies')
    .select('id, kind, parent_id, name, slug, icon, color, lang')
    .eq('lang', lang)
    .in('slug', slugs)) as { data: any; error: any };

  if (error || !Array.isArray(data)) return terms;

  return mergeTermTranslations(terms as TermLike[], data as TermLike[], lang);
}

async function addReviewerName(
  supabase: ReturnType<typeof getClient>,
  content: Record<string, any>
) {
  const reviewerId = typeof content.reviewer_id === 'string' ? content.reviewer_id : '';
  if (!reviewerId) return content;

  try {
    const { data } = await supabase
      .from('user_roles')
      .select('full_name')
      .eq('user_id', reviewerId)
      .maybeSingle();
    return {
      ...content,
      reviewerName: typeof data?.full_name === 'string' && data.full_name.trim() ? data.full_name.trim() : null,
    };
  } catch {
    return { ...content, reviewerName: null };
  }
}

const MAX_PER_PAGE = 48;
const MAX_SEARCH_LENGTH = 120;

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export interface LearnFilters {
  type?: ContentType;
  audience?: Audience;
  age_group?: AgeGroup;
  level?: EduLevel;
  madhhab?: Madhhab;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface LearnItem {
  id: string;
  content_type: ContentType;
  title: string;
  slug: string;
  summary: string | null;
  audience: string[];
  age_groups: string[];
  levels: string[];
  published_at: string | null;
  views: number;
}

/**
 * جلب قائمة المحتوى المنشور مع الفلاتر
 */
export async function getPublishedContent(
  lang: string,
  filters: LearnFilters
): Promise<{ data: LearnItem[]; total: number; total_pages: number }> {
  const supabase = getClient();
  const requestedPage = Number(filters.page ?? 1);
  const requestedPerPage = Number(filters.per_page ?? 12);
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;
  const perPage = Number.isFinite(requestedPerPage)
    ? Math.min(MAX_PER_PAGE, Math.max(1, Math.floor(requestedPerPage)))
    : 12;
  const from = (page - 1) * perPage;
  const search = filters.search?.trim().slice(0, MAX_SEARCH_LENGTH);

  // نبني الاستعلام
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
    .eq('content_translations.lang', lang);

  // الفلاتر
  if (filters.type) {
    query = query.eq('content_type', filters.type);
  }

  if (filters.audience) {
    query = query.contains('audience', [filters.audience]);
  }

  if (filters.age_group) {
    query = query.contains('age_groups', [filters.age_group]);
  }

  if (filters.level) {
    query = query.contains('levels', [filters.level]);
  }

  if (filters.madhhab) {
    query = query.contains('madhhabs', [filters.madhhab]);
  }

  if (search) {
    query = query.ilike(
      'content_translations.title',
      `%${escapeLikePattern(search)}%`
    );
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    console.error('[getPublishedContent]', error);
    return { data: [], total: 0, total_pages: 0 };
  }

  // تحويل البيانات
  const items: LearnItem[] = (data ?? []).map((row: any) => {
    const t = row.content_translations?.[0];
    return {
      id: row.id,
      content_type: row.content_type,
      title: t?.title ?? '',
      slug: t?.slug ?? '',
      summary: t?.summary ?? null,
      audience: row.audience ?? [],
      age_groups: row.age_groups ?? [],
      levels: row.levels ?? [],
      published_at: row.published_at,
      views: row.views ?? 0,
    };
  });

  return {
    data: items,
    total: count ?? 0,
    total_pages: Math.ceil((count ?? 0) / perPage),
  };
}

/**
 * جلب محتوى واحد كامل مع المراجع
 */
export async function getContentBySlug(
  lang: string,
  type: string,
  slug: string
) {
  const supabase = getClient();

  const { data, error } = await fetchTranslation(supabase, lang, slug);

  if (error || !data) return null;

  const content = data.content;
  if (!content || content.status !== 'published') return null;
  if (content.content_type !== type) return null;

  const rawTerms = (content.content_terms ?? [])
    .map((ct: any) => ct.taxonomies)
    .filter(Boolean);

  return {
    ...(await addReviewerName(supabase, content)),
    translation: data,
    references: onlyVerifiedReferences(content.content_references),
    media: content.content_media ?? [],
    terms: await localizeTerms(supabase, rawTerms, lang),
  };
}
// إضافة إلى lib/learn/queries.ts

/**
 * جلب المحتوى مع الترجمة المناسبة للغة الزائر
 * إذا لم تتوفر ترجمة، يعرض اللغة الأصلية مع تنويه
 */
export async function getContentWithFallback(
  lang: string,
  type: string,
  slug: string
): Promise<any> {
  const supabase = getClient();

  // أولاً: حاول إيجاد الترجمة المطلوبة
  const { data: translated } = await fetchTranslation(supabase, lang, slug);

  if (
    translated &&
    translated.content?.status === 'published' &&
    translated.content?.content_type === type
  ) {
    const rawTerms = (translated.content.content_terms ?? [])
      .map((ct: any) => ct.taxonomies)
      .filter(Boolean);

    return {
      ...(await addReviewerName(supabase, translated.content)),
      translation: translated,
      isTranslated: true,
      translationLang: lang,
      references: onlyVerifiedReferences(translated.content.content_references),
      media: translated.content.content_media ?? [],
      terms: await localizeTerms(supabase, rawTerms, lang),
    };
  }

  // ثانياً: إذا لم تتوفر، ابحث في اللغات الأخرى
  const { data: fallbacks } = await fetchTranslationsBySlug(supabase, slug);

  const fallback = (fallbacks ?? []).find(
    (candidate: any) =>
      candidate.content?.status === 'published' &&
      candidate.content?.content_type === type
  );

  if (fallback && fallback.content?.status === 'published') {
    const rawTerms = (fallback.content.content_terms ?? [])
      .map((ct: any) => ct.taxonomies)
      .filter(Boolean);

    return {
      ...(await addReviewerName(supabase, fallback.content)),
      translation: fallback,
      isTranslated: false,
      translationLang: fallback.lang,
      originalLang: fallback.content.lang_original,
      references: onlyVerifiedReferences(fallback.content.content_references),
      media: fallback.content.content_media ?? [],
      terms: await localizeTerms(supabase, rawTerms, lang),
    };
  }

  return null;
}
