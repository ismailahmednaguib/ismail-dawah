// =====================================================
// خدمة المحتوى — تُستخدم من واجهات الـ API وصفحات الخادم
// =====================================================
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  Content,
  ContentStatus,
  ContentType,
  ContentFilters,
  PaginatedResult,
} from '@/lib/types/content';

export interface ContentListItem extends Content {
  title: string | null;
  slug: string | null;
  lang: string | null;
}

/** جلب قائمة محتوى مع الترجمة العربية (أو أول ترجمة) */
export async function listContent(
  filters: ContentFilters
): Promise<PaginatedResult<ContentListItem>> {
  const supabase = getSupabaseAdmin();
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  const from = (page - 1) * perPage;

  let query = supabase
    .from('content')
    .select(
      `
      *,
      content_translations ( title, slug, lang )
      `,
      { count: 'exact' }
    );

  if (filters.type) query = query.eq('content_type', filters.type);
  if (filters.lang) {
    query = query.eq('content_translations.lang', filters.lang);
  }
  if (filters.search) {
    query = query.ilike('content_translations.title', `%${filters.search}%`);
  }

  query = query
    .order('updated_at', { ascending: false })
    .range(from, from + perPage - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const rows: ContentListItem[] = (data ?? []).map((row: any) => {
    const translations = row.content_translations ?? [];
    const t =
      translations.find((x: any) => x.lang === 'ar') ?? translations[0] ?? null;
    return {
      ...row,
      content_translations: undefined,
      title: t?.title ?? null,
      slug: t?.slug ?? null,
      lang: t?.lang ?? null,
    };
  });

  return {
    data: rows,
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  };
}

/** جلب محتوى واحد مع كل ترجماتة ومراجعه */
export async function getContentFull(contentId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('content')
    .select(
      `
      *,
      content_translations (*),
      content_references (*),
      content_terms ( taxonomy_id, taxonomies ( id, kind, name, slug, color ) )
      `
    )
    .eq('id', contentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** تغيير حالة النشر */
export async function setStatus(
  contentId: string,
  status: ContentStatus,
  userId: string
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('content')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_by: userId,
    })
    .eq('id', contentId);
  if (error) throw new Error(error.message);
}

/** حذف نهائي (للمدير فقط) */
export async function deleteContent(contentId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('content').delete().eq('id', contentId);
  if (error) throw new Error(error.message);
}