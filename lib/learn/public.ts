// lib/learn/public.ts
// ============================================================
// طبقة قراءة عامة موحّدة للمحتوى المنشور (CMS)
// ------------------------------------------------------------
// كل الصفحات العامة تقرأ من هنا بدل المصفوفات المضمّنة في الكود.
// القراءة تمرّ عبر الخادم بمفتاح الخدمة (مع توفّر مفتاح anon كبديل)،
// ويفرض دائمًا status = 'published'.
// ============================================================

import 'server-only';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ============================================================
// الأنواع
// ============================================================

export interface PublicTerm {
  id: string;
  kind: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  parent_id?: string | null;
  lang?: string | null;
}

export interface PublicItem {
  id: string;
  content_type: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  published_at: string | null;
  views: number;
  audience: string[];
  levels: string[];
  terms: PublicTerm[];
  /** معرّف المراجع العلمي إن اعتمد المحتوى. */
  reviewer_id: string | null;
  /** true عندما نعرض النص الأصلي لأن الترجمة المطلوبة غير متوفرة. */
  isFallback: boolean;
}

export interface PublicListOptions {
  limit?: number;
  order?: 'newest' | 'manual';
  /** slug تصنيف للتصفية (يكفي مطابقة taxonomy واحد). */
  taxonomySlug?: string;
  /** نوع التصنيف المطلوب عند التصفية. */
  taxonomyKind?: string;
  /**
   * تضمين محتوى التصنيفات الأبناء والأحفاد (فرع/فرع فرعي/تصنيف).
   * بدونه تُعرض العناصر المرتبطة بالتصنيف نفسه فقط، وقد تظهر صفحة المجال
   * فارغة رغم أن تحته فروعًا ممتلئة.
   */
  includeDescendants?: boolean;
  audience?: string;
  level?: string;
  search?: string;
  /** استثناء معرّفات. */
  excludeIds?: string[];
  /** اللغة البديلة عند عدم توفر الترجمة (افتراضيًا ar). */
  fallbackLang?: string;
}

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 200;
const MAX_SEARCH = 120;

const TERM_SELECT = `
  content_terms (
    taxonomies ( id, kind, parent_id, name, slug, icon, color, lang )
  )
`;

const BASE_SELECT = (withTerms: boolean) => `
  id,
  content_type,
  audience,
  levels,
  published_at,
  views,
  sort_order,
  status,
  reviewer_id,
  content_translations!inner ( slug, title, summary, body, lang, is_machine_translated )
  ${withTerms ? ',' + TERM_SELECT : ''}
`;

function clampLimit(value?: number): number {
  const n = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(n)));
}

/**
 * يجمع معرّفات كل التصنيفات التي تنتمي إلى *المفهوم* نفسه ثم كل أبنائها.
 *
 * لماذا؟ هرم التصنيفات في قاعدة البيانات غير مترابط تمامًا:
 *   • سطور «المجال» (field) بلا أب وبلا أبناء.
 *   • سطور «الفرع الفرعي» معلّقة على «الباب» (branch) لا على المجال.
 *   • المعرّف نفسه قد يوجد في أكثر من نوع (مثل tajweed مجالًا وفرعًا فرعيًا).
 * لذلك نجمع بمعرّف (slug) واحد كل السطور المطابقة + كل أحفادها، فيظهر في صفحة
 * المجال محتوى فروعه بدل صفحة فارغة.
 */
async function collectTaxonomyGroupIds(
  supabase: ReturnType<typeof getClient>,
  slug: string,
  rootId: string
): Promise<string[]> {
  const { data: sameSlug } = await supabase
    .from('taxonomies')
    .select('id')
    .eq('slug', slug)
    .limit(50);

  const collected = new Set<string>([rootId]);
  for (const row of (sameSlug ?? []) as Array<{ id: string }>) {
    collected.add(row.id);
  }

  let frontier = [...collected];

  for (let depth = 0; depth < 5 && frontier.length > 0; depth += 1) {
    const { data } = await supabase
      .from('taxonomies')
      .select('id')
      .in('parent_id', frontier);

    const next = ((data ?? []) as Array<{ id: string }>)
      .map((row) => row.id)
      .filter((id) => !collected.has(id));

    if (next.length === 0) break;
    for (const id of next) collected.add(id);
    frontier = next;
  }

  return [...collected];
}

function mapItem(row: any, isFallback: boolean): PublicItem {
  const t = Array.isArray(row.content_translations)
    ? row.content_translations[0]
    : row.content_translations;
  const terms: PublicTerm[] = (row.content_terms ?? [])
    .map((ct: any) => ct.taxonomies)
    .filter(Boolean);
  return {
    id: row.id,
    content_type: row.content_type,
    slug: t?.slug ?? '',
    title: t?.title ?? '',
    summary: t?.summary ?? null,
    body: t?.body ?? null,
    published_at: row.published_at ?? null,
    views: row.views ?? 0,
    audience: row.audience ?? [],
    levels: row.levels ?? [],
    terms,
    reviewer_id: row.reviewer_id ?? null,
    isFallback,
  };
}

/**
 * يترجم أسماء التصنيفات إلى لغة الواجهة.
 *
 * كل التصنيفات مخزّنة صفًّا لكل لغة (`lang = 'ar' | 'en'`)، لكن صفوف
 * `content_terms` تشير دائمًا إلى الصف العربي. لذلك نستبدل كل تصنيف بالصف
 * المطابق له في `slug` و`kind` باللغة المطلوبة، بدل عرض الاسم العربي في
 * الواجهة الإنجليزية.
 */
async function localizeTermList(
  supabase: ReturnType<typeof getClient>,
  terms: PublicTerm[],
  lang: string
): Promise<PublicTerm[]> {
  if (lang === 'ar' || terms.length === 0) return terms;

  const slugs = [...new Set(terms.map((term) => term.slug).filter(Boolean))];
  if (slugs.length === 0) return terms;

  const { data, error } = (await supabase
    .from('taxonomies')
    .select('id, kind, parent_id, name, slug, icon, color, lang')
    .eq('lang', lang)
    .in('slug', slugs)) as { data: any; error: any };

  if (error || !Array.isArray(data)) return terms;

  const byKey = new Map<string, PublicTerm>();
  for (const row of data as PublicTerm[]) {
    byKey.set(`${row.slug}\u0000${row.kind}`, row);
  }

  return terms.map((term) => {
    const translation = byKey.get(`${term.slug}\u0000${term.kind}`);
    if (!translation) return term;
    return {
      ...term,
      id: translation.id,
      name: translation.name,
      lang: translation.lang ?? lang,
      icon: translation.icon ?? term.icon,
      color: translation.color ?? term.color,
    };
  });
}

/** يطبّق ترجمة التصنيفات على قائمة عناصر، مع الحفاظ على ترتيب كل عنصر. */
async function localizeItemTerms(
  supabase: ReturnType<typeof getClient>,
  items: PublicItem[],
  lang: string
): Promise<PublicItem[]> {
  if (lang === 'ar' || items.length === 0) return items;

  const allTerms = items.flatMap((item) => item.terms);
  if (allTerms.length === 0) return items;

  const localized = await localizeTermList(supabase, allTerms, lang);
  let cursor = 0;

  return items.map((item) => {
    const terms = localized.slice(cursor, cursor + item.terms.length);
    cursor += item.terms.length;
    return { ...item, terms };
  });
}

// ============================================================
// قائمة محتوى منشور بنوع معيّن
// ============================================================

export async function getPublicList(
  lang: string,
  type: string,
  options: PublicListOptions = {}
): Promise<PublicItem[]> {
  const supabase = getClient();
  const limit = clampLimit(options.limit);

  if (options.taxonomySlug) {
    const tax = await getPublicTaxonomyBySlug(options.taxonomySlug, options.taxonomyKind, lang);
    if (!tax) return [];

    const taxonomyIds = options.includeDescendants
      ? await collectTaxonomyGroupIds(supabase, tax.slug, tax.id)
      : [tax.id];

    const { data: links } = await supabase
      .from('content_terms')
      .select('content_id')
      .in('taxonomy_id', taxonomyIds)
      .limit(MAX_LIMIT * 5);
    const ids = [...new Set((links ?? []).map((l: any) => l.content_id))];
    if (ids.length === 0) return [];

    const filtered = await runListQuery(supabase, lang, type, options, limit, ids);
    if (filtered.length > 0 || lang === 'ar') return filtered;
    const fallbackLang = options.fallbackLang ?? 'ar';
    if (fallbackLang === lang) return filtered;
    return runListQuery(supabase, fallbackLang, type, options, limit, ids, true);
  }

  const result = await runListQuery(supabase, lang, type, options, limit, undefined);
  if (result.length > 0 || lang === 'ar') return result;

  // لا ترجمة بهذه اللغة → اعرض النص الأصلي (عربي) مع وسم الترجمة.
  const fallbackLang = options.fallbackLang ?? 'ar';
  if (fallbackLang === lang) return result;
  return runListQuery(supabase, fallbackLang, type, options, limit, undefined, true);
}

async function runListQuery(
  supabase: ReturnType<typeof getClient>,
  lang: string,
  type: string,
  options: PublicListOptions,
  limit: number,
  contentIds?: string[],
  isFallback = false
): Promise<PublicItem[]> {
  const build = (withTerms: boolean) => {
    let q = supabase
      .from('content')
      .select(BASE_SELECT(withTerms))
      .eq('status', 'published')
      .eq('content_type', type)
      .eq('content_translations.lang', lang);

    if (contentIds && contentIds.length > 0) q = q.in('id', contentIds);
    if (options.audience) q = q.contains('audience', [options.audience]);
    if (options.level) q = q.contains('levels', [options.level]);
    if (options.excludeIds && options.excludeIds.length > 0) {
      q = q.not('id', 'in', `(${options.excludeIds.join(',')})`);
    }
    if (options.search) {
      const s = options.search.trim().slice(0, MAX_SEARCH).replace(/[%,]/g, '');
      if (s) q = q.ilike('content_translations.title', `%${s}%`);
    }

    if (options.order === 'manual') {
      q = q.order('sort_order', { ascending: true });
    } else {
      q = q.order('published_at', { ascending: false, nullsFirst: false });
    }
    return q.order('created_at', { ascending: false }).limit(limit);
  };

  let { data, error } = (await build(true)) as { data: any; error: any };
  if (error) {
    // احتمال غياب جدول/علاقة — أعد المحاولة بلا تصنيفات.
    ({ data, error } = (await build(false)) as { data: any; error: any });
  }
  if (error) {
    console.error('[getPublicList]', type, error.message ?? error);
    return [];
  }
  const items = (data ?? []).map((row: any) => mapItem(row, isFallback));
  return localizeItemTerms(supabase, items, lang);
}

// ============================================================
// عنصر واحد بمعرّفه (slug)
// ============================================================

export async function getPublicBySlug(
  lang: string,
  type: string,
  slug: string
): Promise<PublicItem | null> {
  const supabase = getClient();

  const fetch = async (l: string) => {
    const { data, error } = (await supabase
      .from('content_translations')
      .select(
        `
        id, lang, slug, title, summary, body, is_machine_translated,
        content:content_id (
          id, content_type, audience, levels, published_at, views, status, reviewer_id,
          ${TERM_SELECT}
        )
      `
      )
      .eq('lang', l)
      .eq('slug', slug)
      .limit(5)) as { data: any; error: any };
    if (error) return null;
    const row = (data ?? []).find(
      (r: any) => r.content && r.content.content_type === type && r.content.status === 'published'
    );
    return row ?? null;
  };

  let row = await fetch(lang);
  let isFallback = false;
  if (!row) {
    const fallbackLang = lang === 'ar' ? null : 'ar';
    if (fallbackLang) {
      row = await fetch(fallbackLang);
      isFallback = Boolean(row);
    }
  }
  if (!row) return null;

  const c = row.content;
  const rawTerms: PublicTerm[] = (c.content_terms ?? [])
    .map((ct: any) => ct.taxonomies)
    .filter(Boolean);

  return {
    id: c.id,
    content_type: c.content_type,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    published_at: c.published_at,
    views: c.views ?? 0,
    audience: c.audience ?? [],
    levels: c.levels ?? [],
    terms: await localizeTermList(supabase, rawTerms, lang),
    reviewer_id: c.reviewer_id ?? null,
    isFallback,
  };
}

// ============================================================
// التصنيفات
// ============================================================

export async function getPublicTaxonomies(
  lang: string,
  kind: string
): Promise<PublicTerm[]> {
  const supabase = getClient();
  const fetch = async (l: string) => {
    const { data, error } = (await supabase
      .from('taxonomies')
      .select('id, kind, parent_id, name, slug, icon, color, sort_order')
      .eq('kind', kind)
      .eq('lang', l)
      .order('sort_order', { ascending: true })) as { data: any; error: any };
    if (error) return [];
    return (data ?? []) as PublicTerm[];
  };

  let rows = await fetch(lang);
  if (rows.length === 0 && lang !== 'ar') rows = await fetch('ar');
  return rows;
}

export async function getPublicTaxonomyBySlug(
  slug: string,
  kind?: string,
  lang: string = 'ar'
): Promise<PublicTerm | null> {
  const supabase = getClient();
  let q = supabase
    .from('taxonomies')
    .select('id, kind, parent_id, lang, name, slug, icon, color')
    .eq('slug', slug)
    .limit(10);
  if (kind) q = q.eq('kind', kind);
  const { data, error } = (await q) as { data: any; error: any };
  if (error || !data || data.length === 0) return null;
  const rows = data as PublicTerm[];
  // التصنيفات مخزّنة صفًّا لكل لغة؛ نفضّل لغة الواجهة ثم العربية (المرتبط بها المحتوى).
  const pickByLang = (list: PublicTerm[]) =>
    list.find((r) => r.lang === lang) ?? list.find((r) => r.lang === 'ar') ?? list[0];

  if (kind) return pickByLang(rows);

  // قد يتكرّر نفس الـslug بين الأنواع (field/subbranch)؛ نحسم الترتيب
  // بنفس أولوية صفحة /fields/[slug] لضمان نتائج ثابتة.
  for (const k of ['field', 'branch', 'subbranch', 'category']) {
    const matched = rows.filter((r) => r.kind === k);
    if (matched.length > 0) return pickByLang(matched);
  }
  return pickByLang(rows);
}

// ============================================================
// عدد عناصر المحتوى لكل تصنيف (مفتاح = slug)
// ============================================================

export async function getPublicTaxonomyCounts(): Promise<Record<string, number>> {
  const supabase = getClient();
  const [taxRes, termRes] = await Promise.all([
    supabase.from('taxonomies').select('id, slug'),
    supabase
      .from('content_terms')
      .select('taxonomy_id, content:content_id!inner(status)')
      .eq('content.status', 'published'),
  ]);
  if (taxRes.error || termRes.error) return {};

  const slugById = new Map<string, string>(
    (taxRes.data ?? []).map((t: any) => [t.id as string, t.slug as string])
  );
  const counts: Record<string, number> = {};
  for (const row of termRes.data ?? []) {
    const slug = slugById.get((row as any).taxonomy_id);
    if (!slug) continue;
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

// ============================================================
// إحصاءات (للواجهة الرئيسية)
// ============================================================
export async function getPublicCounts(
  lang: string
): Promise<Record<string, number>> {
  const supabase = getClient();
  const countType = async (type: string) => {
    const { count, error } = await supabase
      .from('content')
      .select('id, content_translations!inner(lang)', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('content_type', type)
      .eq('content_translations.lang', lang);
    if (error) return 0;
    return count ?? 0;
  };

  const types = ['lesson', 'fatwa', 'article', 'hadith', 'faq', 'khutbah', 'story'];
  const results = await Promise.all(types.map((t) => countType(t)));
  const out: Record<string, number> = {};
  types.forEach((t, i) => {
    out[t] = results[i];
  });
  out.total = results.reduce((sum, n) => sum + n, 0);
  return out;
}
