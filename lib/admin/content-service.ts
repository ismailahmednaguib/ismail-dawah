// =====================================================
// خدمة المحتوى — تُستخدم من واجهات الـ API وصفحات الخادم
// =====================================================
import {
  getSupabaseAdmin,
  logAudit,
  requiresScholarReview,
} from '@/lib/supabase/admin';
import type {
  Content,
  ContentStatus,
  ContentType,
  Audience,
  AgeGroup,
  EduLevel,
  Madhhab,
  ContentFilters,
  PaginatedResult,
} from '@/lib/types/content';
import { sanitizeRichTextHtml } from '@/lib/content-safety';

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
      content_media (*),
      content_terms ( taxonomy_id, taxonomies ( id, kind, name, slug, color ) )
      `
    )
    .eq('id', contentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export interface UpdateContentInput {
  content_type?: ContentType;
  audience?: Audience[];
  age_groups?: AgeGroup[];
  levels?: EduLevel[];
  madhhabs?: Madhhab[];
  needs_scholar_review?: boolean;
  is_sensitive?: boolean;
  translation?: {
    id?: string;
    lang?: string;
    slug?: string;
    title?: string;
    summary?: string;
    body?: string;
    meta_title?: string;
    meta_description?: string;
  };
}

const CONTENT_TYPES: ContentType[] = [
  'article',
  'lesson',
  'course',
  'course_lesson',
  'book',
  'research',
  'fatwa',
  'khutbah',
  'audio',
  'video',
  'hadith',
  'duaa',
  'story',
  'faq',
  'event',
  'page',
  'profile',
];

const AUDIENCES: Audience[] = [
  'non_muslim',
  'muslim_new',
  'muslim_general',
  'student',
  'scholar',
  'daee',
  'parent',
  'teacher',
];

const AGE_GROUPS: AgeGroup[] = ['kids', 'teens', 'youth', 'adults', 'seniors', 'all'];
const LEVELS: EduLevel[] = ['beginner', 'intermediate', 'advanced', 'specialized'];
const MADHHABS: Madhhab[] = [
  'hanafi',
  'maliki',
  'shafii',
  'hanbali',
  'zahiri',
  'jafari',
  'general',
];

function normalizeEnumArray<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string
): T[] {
  if (!Array.isArray(value)) throw new Error(`قيمة ${fieldName} غير صالحة`);
  const unique = [...new Set(value)].filter((item): item is T =>
    typeof item === 'string' && allowed.includes(item as T)
  );
  if (!unique.length) throw new Error(`يجب اختيار ${fieldName}`);
  return unique;
}

function normalizeText(value: unknown, maxLength: number, fieldName: string) {
  if (typeof value !== 'string') throw new Error(`قيمة ${fieldName} غير صالحة`);
  return value.trim().slice(0, maxLength);
}

/** تعديل بيانات المحتوى والترجمة مع إعادة المحتوى الحساس للمراجعة عند الحاجة. */
export async function updateContentDetails(
  contentId: string,
  input: UpdateContentInput,
  userId: string
) {
  const supabase = getSupabaseAdmin();
  const current = await getContentFull(contentId);
  if (!current) throw new Error('المحتوى غير موجود');

  const contentUpdate: Record<string, unknown> = { updated_by: userId };
  if (input.content_type !== undefined) {
    if (!CONTENT_TYPES.includes(input.content_type)) throw new Error('نوع محتوى غير صالح');
    contentUpdate.content_type = input.content_type;
  }
  if (input.audience !== undefined) {
    contentUpdate.audience = normalizeEnumArray(input.audience, AUDIENCES, 'الجمهور');
  }
  if (input.age_groups !== undefined) {
    contentUpdate.age_groups = normalizeEnumArray(input.age_groups, AGE_GROUPS, 'الفئة العمرية');
  }
  if (input.levels !== undefined) {
    contentUpdate.levels = normalizeEnumArray(input.levels, LEVELS, 'المستوى');
  }
  if (input.madhhabs !== undefined) {
    contentUpdate.madhhabs = normalizeEnumArray(input.madhhabs, MADHHABS, 'المذهب');
  }
  if (input.needs_scholar_review !== undefined) {
    if (typeof input.needs_scholar_review !== 'boolean') {
      throw new Error('قيمة المراجعة العلمية غير صالحة');
    }
    contentUpdate.needs_scholar_review = input.needs_scholar_review;
  }
  if (input.is_sensitive !== undefined) {
    if (typeof input.is_sensitive !== 'boolean') {
      throw new Error('قيمة حساسية المحتوى غير صالحة');
    }
    contentUpdate.is_sensitive = input.is_sensitive;
  }

  const translationInput = input.translation;
  let translationUpdate: Record<string, unknown> | null = null;
  let translationId: string | null = null;
  if (translationInput) {
    const translations = Array.isArray(current.content_translations)
      ? current.content_translations
      : [];
    const selectedTranslation =
      (translationInput.id && translations.find((item: any) => item.id === translationInput.id)) ||
      translations.find((item: any) => item.lang === (translationInput.lang || 'ar'));
    if (!selectedTranslation?.id) throw new Error('الترجمة المطلوبة غير موجودة');

    translationId = selectedTranslation.id;
    translationUpdate = {};
    if (translationInput.lang !== undefined) {
      const lang = normalizeText(translationInput.lang, 8, 'اللغة');
      if (!lang) throw new Error('اللغة مطلوبة');
      translationUpdate.lang = lang;
    }
    if (translationInput.title !== undefined) {
      const title = normalizeText(translationInput.title, 240, 'العنوان');
      if (!title) throw new Error('العنوان مطلوب');
      translationUpdate.title = title;
    }
    if (translationInput.slug !== undefined) {
      const slug = normalizeText(translationInput.slug, 255, 'الرابط');
      if (!slug) throw new Error('الرابط مطلوب');
      translationUpdate.slug = slug;
    }
    if (translationInput.summary !== undefined) {
      translationUpdate.summary = normalizeText(translationInput.summary, 2_000, 'الملخص') || null;
    }
    if (translationInput.body !== undefined) {
      const safeBody = sanitizeRichTextHtml(translationInput.body);
      translationUpdate.body = safeBody || null;
      translationUpdate.body_plain =
        safeBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200_000) || null;
    }
    if (translationInput.meta_title !== undefined) {
      translationUpdate.meta_title = normalizeText(translationInput.meta_title, 240, 'عنوان SEO') || null;
    }
    if (translationInput.meta_description !== undefined) {
      translationUpdate.meta_description =
        normalizeText(translationInput.meta_description, 320, 'وصف SEO') || null;
    }
    if (!Object.keys(translationUpdate).length) translationUpdate = null;
  }

  const nextContentType = (contentUpdate.content_type ?? current.content_type) as ContentType;
  const nextNeedsReview = input.needs_scholar_review ?? Boolean(current.needs_scholar_review);
  const nextSensitive = input.is_sensitive ?? Boolean(current.is_sensitive);
  const requiresReview = Boolean(
    nextNeedsReview || nextSensitive || nextContentType === 'fatwa'
  );

  const { data: updatedContent, error: contentError } = await supabase
    .from('content')
    .update(contentUpdate)
    .eq('id', contentId)
    .select()
    .single();
  if (contentError) throw new Error(contentError.message);

  if (translationId && translationUpdate) {
    const { error: translationError } = await supabase
      .from('content_translations')
      .update(translationUpdate)
      .eq('id', translationId)
      .eq('content_id', contentId);
    if (translationError) throw new Error(translationError.message);
  }

  await logAudit(
    userId,
    'update',
    'content',
    contentId,
    { content: contentUpdate, translation: translationUpdate ? { id: translationId, ...translationUpdate } : null },
    { status: current.status, content_type: current.content_type }
  );

  if (current.status === 'published' && requiresReview) {
    await setStatus(contentId, 'in_review', userId);
  }

  return updatedContent;
}

/** التحقق من وجود مرجع معتمد قبل نشر الفتوى أو المحتوى الحساس. */
export async function assertVerifiedReferenceForPublish(contentId: string, content: {
  content_type?: ContentType;
  is_sensitive?: boolean | null;
}) {
  const requiresReference =
    content.is_sensitive ||
    content.content_type === 'fatwa' ||
    content.content_type === 'hadith' ||
    content.content_type === 'khutbah';

  if (!requiresReference) return;

  const { data, error } = await getSupabaseAdmin()
    .from('content_references')
    .select('id')
    .eq('content_id', contentId)
    .eq('verified', true)
    .limit(1);

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error('لا يمكن نشر هذا المحتوى قبل إضافة مرجع شرعي موثق واحد على الأقل.');
  }
}

/** تغيير حالة النشر */
export async function setStatus(
  contentId: string,
  status: ContentStatus,
  userId: string
) {
  const supabase = getSupabaseAdmin();

  const { data: content, error: contentLookupError } = await supabase
    .from('content')
    .select('id, content_type, status, needs_scholar_review, is_sensitive')
    .eq('id', contentId)
    .maybeSingle();

  if (contentLookupError) throw new Error(contentLookupError.message);
  if (!content) throw new Error('المحتوى غير موجود');

  if (status === 'published' && requiresScholarReview(content)) {
    throw new Error(
      'هذا المحتوى يحتاج اعتماد مراجع علمي أولاً. أرسله إلى المراجعة العلمية قبل النشر.'
    );
  }

  if (status === 'published') {
    await assertVerifiedReferenceForPublish(contentId, content);
  }

  const { error } = await supabase
    .from('content')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_by: userId,
    })
    .eq('id', contentId);
  if (error) throw new Error(error.message);

  if (status === 'in_review') {
    const { data: pendingItems, error: pendingError } = await supabase
      .from('review_queue')
      .select('id')
      .eq('content_id', contentId)
      .eq('status', 'pending')
      .limit(1);

    if (pendingError) {
      await supabase
        .from('content')
        .update({ status: 'draft', updated_by: userId })
        .eq('id', contentId);
      throw new Error(pendingError.message);
    }

    if (!pendingItems?.length) {
      const { error: queueError } = await supabase.from('review_queue').insert({
        content_id: contentId,
        submitted_by: userId,
        status: 'pending',
      });

      if (queueError) {
        await supabase
          .from('content')
          .update({ status: 'draft', updated_by: userId })
          .eq('id', contentId);
        throw new Error(queueError.message);
      }
    }
  }
}

/** حذف نهائي (للمدير فقط) */
export async function deleteContent(contentId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('content').delete().eq('id', contentId);
  if (error) throw new Error(error.message);
}
