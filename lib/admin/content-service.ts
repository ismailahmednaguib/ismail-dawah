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
import { normalizeScheduledAt } from '@/lib/scheduled-publishing';
import { isMissingTableError } from '@/lib/supabase-errors';
import {
  MAX_CONTENT_REVISIONS,
  buildContentRevisionSnapshot,
  buildRevisionRestoreInput,
  parseContentRevisionSnapshot,
  pickRevisionTranslation,
  type ContentRevisionReason,
  type ContentRevisionSnapshot,
} from '@/lib/content-revisions';

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

// =====================================================
// سجل نسخ المحتوى (revisions)
// =====================================================

export class ContentRevisionUnavailableError extends Error {
  constructor() {
    super('سجل النسخ غير مفعّل بعد. نفّذ migration جدول content_revisions أولًا.');
    this.name = 'ContentRevisionUnavailableError';
  }
}

export interface ContentRevisionListItem {
  id: string;
  reason: string;
  created_at: string;
  created_by: string | null;
  title: string | null;
  content_type: string | null;
  status: string | null;
}

/**
 * يحفظ نسخة قبل التعديل. فشل السجل لا يمنع حفظ المحتوى نفسه:
 * إن لم يُنفَّذ الجدول بعد يعود false وتُكمل العملية.
 */
export async function saveContentRevision(
  contentId: string,
  snapshot: ContentRevisionSnapshot,
  userId: string,
  reason: ContentRevisionReason = 'update'
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('content_revisions').insert({
      content_id: contentId,
      snapshot,
      created_by: userId,
      reason,
    });

    if (error) {
      if (!isMissingTableError(error)) {
        console.error('Failed to save content revision:', error.message);
      }
      return false;
    }

    await pruneContentRevisions(contentId);
    return true;
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.error('Content revision error:', error);
    }
    return false;
  }
}

/** يبقي أحدث `MAX_CONTENT_REVISIONS` نسخة لكل مادة. */
async function pruneContentRevisions(contentId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('content_revisions')
      .select('id')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(MAX_CONTENT_REVISIONS, MAX_CONTENT_REVISIONS + 99);

    if (error) {
      if (!isMissingTableError(error)) {
        console.error('Failed to inspect old content revisions:', error.message);
      }
      return;
    }

    const staleIds = (data ?? []).map((row: { id: string }) => row.id);
    if (!staleIds.length) return;

    const { error: deleteError } = await supabase
      .from('content_revisions')
      .delete()
      .in('id', staleIds);

    if (deleteError && !isMissingTableError(deleteError)) {
      console.error('Failed to prune content revisions:', deleteError.message);
    }
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.error('Failed to prune content revisions:', error);
    }
  }
}

type RevisionRow = {
  id: string;
  reason?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  snapshot?: unknown;
};

type TranslationRow = {
  id?: string;
  lang?: string | null;
};

/** قائمة نسخ مادة (بلا النسخة الكاملة، حفاظًا على حجم الاستجابة). */
export async function listContentRevisions(
  contentId: string
): Promise<{ enabled: boolean; data: ContentRevisionListItem[] }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('content_revisions')
    .select('id, reason, created_at, created_by, snapshot')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(MAX_CONTENT_REVISIONS);

  if (error) {
    if (isMissingTableError(error)) return { enabled: false, data: [] };
    throw new Error(error.message);
  }

  return {
    enabled: true,
    data: (data ?? []).map((row: RevisionRow) => {
      const snapshot = parseContentRevisionSnapshot(row.snapshot);
      const translation = snapshot ? pickRevisionTranslation(snapshot) : null;
      return {
        id: String(row.id),
        reason: typeof row.reason === 'string' ? row.reason : 'update',
        created_at: String(row.created_at ?? ''),
        created_by: typeof row.created_by === 'string' ? row.created_by : null,
        title: translation?.title ?? null,
        content_type: snapshot?.content.content_type ?? null,
        status: snapshot?.content.status ?? null,
      };
    }),
  };
}

/**
 * استعادة نسخة: تحفظ الوضع الحالي أولًا (reason=restore)، ثم تعيد
 * بيانات المحتوى والترجمة الأساسية عبر `updateContentDetails` حتى
 * تمرّ على التحقق والتنقية وإعادة المحتوى الحسّاس للمراجعة.
 */
export async function restoreContentRevision(
  contentId: string,
  revisionId: string,
  userId: string
): Promise<{ success: true; revision_id: string; translation_id: string }> {
  const supabase = getSupabaseAdmin();
  const { data: revision, error } = await supabase
    .from('content_revisions')
    .select('id, snapshot, created_at')
    .eq('id', revisionId)
    .eq('content_id', contentId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) throw new ContentRevisionUnavailableError();
    throw new Error(error.message);
  }
  if (!revision) throw new Error('النسخة المطلوبة غير موجودة');

  const snapshot = parseContentRevisionSnapshot(revision.snapshot);
  if (!snapshot) throw new Error('بيانات النسخة المحفوظة غير صالحة');

  const current = await getContentFull(contentId);
  if (!current) throw new Error('المحتوى غير موجود');

  const plan = buildRevisionRestoreInput(snapshot);
  if (!plan.translation) throw new Error('النسخة لا تحتوي ترجمة قابلة للاستعادة');

  const translations: TranslationRow[] = Array.isArray(current.content_translations)
    ? current.content_translations
    : [];
  const currentTranslation =
    translations.find(
      (item) =>
        item.id === plan.translation?.id && item.lang === plan.translation?.lang
    ) ?? translations.find((item) => item.lang === plan.translation?.lang);

  if (!currentTranslation?.id) {
    throw new Error('الترجمة المرتبطة بهذه النسخة لم تعد موجودة');
  }

  // فحص تعارض الرابط قبل أي كتابة، حتى لا يتغيّر صف المحتوى ثم تفشل الترجمة.
  const { data: slugConflict, error: slugError } = await supabase
    .from('content_translations')
    .select('id')
    .eq('lang', plan.translation.lang)
    .eq('slug', plan.translation.slug)
    .neq('id', currentTranslation.id)
    .maybeSingle();

  if (slugError) throw new Error(slugError.message);
  if (slugConflict) {
    throw new Error('لا يمكن استعادة الرابط القديم لأنه مستخدم حاليًا في ترجمة أخرى');
  }

  const input: UpdateContentInput = {
    content_type: plan.content.content_type as ContentType,
    audience: plan.content.audience as Audience[],
    age_groups: plan.content.age_groups as AgeGroup[],
    levels: plan.content.levels as EduLevel[],
    madhhabs: plan.content.madhhabs as Madhhab[],
    needs_scholar_review: plan.content.needs_scholar_review,
    is_sensitive: plan.content.is_sensitive,
    translation: {
      id: currentTranslation.id,
      title: plan.translation.title,
      slug: plan.translation.slug,
      summary: plan.translation.summary,
      body: plan.translation.body,
      meta_title: plan.translation.meta_title,
      meta_description: plan.translation.meta_description,
    },
  };

  await updateContentDetails(contentId, input, userId, { revisionReason: 'restore' });

  await logAudit(userId, 'restore_revision', 'content', contentId, {
    revision_id: revisionId,
    revision_created_at: revision.created_at,
    translation_id: currentTranslation.id,
    translation_lang: currentTranslation.lang,
  });

  return {
    success: true,
    revision_id: revisionId,
    translation_id: currentTranslation.id,
  };
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

function isMissingColumnError(error: unknown, column: string): boolean {
  const code = String((error as { code?: unknown })?.code || '');
  const message = String((error as { message?: unknown })?.message || '');
  return (
    code === '42703' ||
    new RegExp(`column .*${column}.*does not exist`, 'i').test(message) ||
    new RegExp(`Could not find the '${column}' column`, 'i').test(message)
  );
}

/**
 * تحديث صف الترجمة. إذا لم يكن عمود `reviewed_at` منفَّذًا بعد
 * (migration قديمة) نعيد المحاولة بدونه بدل إفشال الحفظ.
 */
async function updateTranslationRecord(
  translationId: string,
  contentId: string,
  update: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  let { error } = await supabase
    .from('content_translations')
    .update(update)
    .eq('id', translationId)
    .eq('content_id', contentId);

  if (error && 'reviewed_at' in update && isMissingColumnError(error, 'reviewed_at')) {
    const fallback = { ...update };
    delete fallback.reviewed_at;
    ({ error } = await supabase
      .from('content_translations')
      .update(fallback)
      .eq('id', translationId)
      .eq('content_id', contentId));
  }

  if (error) throw new Error(error.message);
}

/** تعديل بيانات المحتوى والترجمة مع إعادة المحتوى الحساس للمراجعة عند الحاجة. */
export async function updateContentDetails(
  contentId: string,
  input: UpdateContentInput,
  userId: string,
  options: { revisionReason?: ContentRevisionReason } = {}
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

    // أي تعديل على نص الترجمة أو بياناتها يلغي اعتمادها السابق؛
    // لا يجوز أن يبقى نص معدّل موسومًا كمراجَع.
    if (Object.keys(translationUpdate).length) {
      translationUpdate.is_reviewed = false;
      translationUpdate.reviewed_by = null;
      translationUpdate.reviewed_at = null;
    } else {
      translationUpdate = null;
    }
  }

  const nextContentType = (contentUpdate.content_type ?? current.content_type) as ContentType;
  const nextNeedsReview = input.needs_scholar_review ?? Boolean(current.needs_scholar_review);
  const nextSensitive = input.is_sensitive ?? Boolean(current.is_sensitive);
  const requiresReview = Boolean(
    nextNeedsReview || nextSensitive || nextContentType === 'fatwa'
  );

  // نسخة ما قبل التعديل — تُحفظ قبل أي كتابة على المحتوى.
  await saveContentRevision(
    contentId,
    buildContentRevisionSnapshot(current),
    userId,
    options.revisionReason ?? 'update'
  );

  const { data: updatedContent, error: contentError } = await supabase
    .from('content')
    .update(contentUpdate)
    .eq('id', contentId)
    .select()
    .single();
  if (contentError) throw new Error(contentError.message);

  if (translationId && translationUpdate) {
    await updateTranslationRecord(translationId, contentId, translationUpdate);
  }

  await logAudit(
    userId,
    'update',
    'content',
    contentId,
    { content: contentUpdate, translation: translationUpdate ? { id: translationId, ...translationUpdate } : null },
    { status: current.status, content_type: current.content_type }
  );

  if (
    (current.status === 'published' || current.status === 'scheduled') &&
    requiresReview
  ) {
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

/** تغيير حالة النشر (أو جدولته) */
export async function setStatus(
  contentId: string,
  status: ContentStatus,
  userId: string,
  scheduledAt?: string | null
) {
  const supabase = getSupabaseAdmin();

  const { data: content, error: contentLookupError } = await supabase
    .from('content')
    .select('id, content_type, status, needs_scholar_review, is_sensitive')
    .eq('id', contentId)
    .maybeSingle();

  if (contentLookupError) throw new Error(contentLookupError.message);
  if (!content) throw new Error('المحتوى غير موجود');

  const isPublishing = status === 'published' || status === 'scheduled';

  if (isPublishing && requiresScholarReview(content)) {
    throw new Error(
      'هذا المحتوى يحتاج اعتماد مراجع علمي أولاً. أرسله إلى المراجعة العلمية قبل النشر أو الجدولة.'
    );
  }

  if (isPublishing) {
    await assertVerifiedReferenceForPublish(contentId, content);
  }

  const scheduledAtIso =
    status === 'scheduled' ? normalizeScheduledAt(scheduledAt) : null;

  const update: Record<string, unknown> = {
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    scheduled_at: status === 'scheduled' ? scheduledAtIso : null,
    updated_by: userId,
  };

  let { error } = await supabase
    .from('content')
    .update(update)
    .eq('id', contentId);

  if (error && isMissingColumnError(error, 'scheduled_at')) {
    if (status === 'scheduled') {
      throw new Error(
        'جدولة النشر تحتاج تنفيذ migration 20261026_scheduled_publishing.sql أولاً.'
      );
    }

    const fallback = { ...update };
    delete fallback.scheduled_at;
    ({ error } = await supabase
      .from('content')
      .update(fallback)
      .eq('id', contentId));
  }

  if (error) {
    if (/invalid input value for enum|content_status/i.test(error.message)) {
      throw new Error(
        'جدولة النشر تحتاج تنفيذ migration 20261026_scheduled_publishing.sql أولاً.'
      );
    }
    throw new Error(error.message);
  }

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
