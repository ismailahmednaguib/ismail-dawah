// lib/learn/queries.ts
import { createClient } from '@supabase/supabase-js';
import type {
  ContentType,
  Audience,
  AgeGroup,
  EduLevel,
} from '@/lib/types/content';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export interface LearnFilters {
  type?: ContentType;
  audience?: Audience;
  age_group?: AgeGroup;
  level?: EduLevel;
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
  published_at: string;
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
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 12;
  const from = (page - 1) * perPage;

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

  if (filters.search) {
    query = query.ilike('content_translations.title', `%${filters.search}%`);
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

  const { data, error } = await supabase
    .from('content_translations')
    .select(`
      *,
      content:content_id (
        *,
        content_references (*),
        content_terms (
          taxonomy_id,
          taxonomies (id, kind, name, slug, color, icon)
        )
      )
    `)
    .eq('lang', lang)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  const content = data.content;
  if (!content || content.status !== 'published') return null;
  if (content.content_type !== type) return null;

  return {
    ...content,
    translation: data,
    references: content.content_references ?? [],
    terms: (content.content_terms ?? []).map((ct: any) => ct.taxonomies),
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
) {
  const supabase = getClient();

  // أولاً: حاول إيجاد الترجمة المطلوبة
  const { data: translated } = await supabase
    .from('content_translations')
    .select(`
      *,
      content:content_id (
        *,
        content_references (*),
        content_terms (
          taxonomy_id,
          taxonomies (id, kind, name, slug, color, icon)
        )
      )
    `)
    .eq('lang', lang)
    .eq('slug', slug)
    .single();

  if (translated && translated.content?.status === 'published') {
    return {
      ...translated.content,
      translation: translated,
      isTranslated: true,
      translationLang: lang,
      references: translated.content.content_references ?? [],
      terms: (translated.content.content_terms ?? []).map((ct: any) => ct.taxonomies),
    };
  }

  // ثانياً: إذا لم تتوفر، ابحث في اللغات الأخرى
  const { data: fallback } = await supabase
    .from('content_translations')
    .select(`
      *,
      content:content_id (
        *,
        content_references (*),
        content_terms (
          taxonomy_id,
          taxonomies (id, kind, name, slug, color, icon)
        )
      )
    `)
    .eq('slug', slug)
    .limit(1)
    .single();

  if (fallback && fallback.content?.status === 'published') {
    return {
      ...fallback.content,
      translation: fallback,
      isTranslated: false,
      translationLang: fallback.lang,
      originalLang: fallback.content.lang_original,
      references: fallback.content.content_references ?? [],
      terms: (fallback.content.content_terms ?? []).map((ct: any) => ct.taxonomies),
    };
  }

  return null;
}