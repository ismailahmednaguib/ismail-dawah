// =====================================================
// ISMAIL ACADEMY - SUPABASE ADMIN CLIENT
// المرحلة الأولى: عميل الإدارة للعمليات الحساسة
// =====================================================
// ⚠️ تحذير: هذا العميل يستخدم مفتاح خدمة الإدارة
// لا تستخدمه أبداً في المكونات الأمامية (Client Components)
// استخدمه فقط في:
// - Server Actions
// - API Routes
// - Server Components (مع التحقق من الصلاحيات)
// =====================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  Taxonomy,
} from '@/lib/types/content';
import { sanitizeRichTextHtml } from '@/lib/content-safety';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Please check your .env.local file.'
      );
    }

    adminClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

// =====================================================
// عمليات المحتوى
// =====================================================

export interface CreateContentInput {
  content_type: ContentType;
  lang_original?: string;
  audience?: Audience[];
  age_groups?: AgeGroup[];
  levels?: EduLevel[];
  madhhabs?: Madhhab[];
  parent_id?: string | null;
  sort_order?: number;
  needs_scholar_review?: boolean;
  is_sensitive?: boolean;
  translation: {
    lang: string;
    slug: string;
    title: string;
    summary?: string;
    body?: string;
    body_plain?: string;
    meta_title?: string;
    meta_description?: string;
  };
}

const VALID_CONTENT_TYPES: ContentType[] = [
  'article', 'lesson', 'course', 'course_lesson', 'book', 'research', 'fatwa',
  'khutbah', 'audio', 'video', 'hadith', 'duaa', 'story', 'faq', 'event', 'page', 'profile',
];
const VALID_AUDIENCES: Audience[] = [
  'non_muslim', 'muslim_new', 'muslim_general', 'student', 'scholar', 'daee', 'parent', 'teacher',
];
const VALID_AGE_GROUPS: AgeGroup[] = ['kids', 'teens', 'youth', 'adults', 'seniors', 'all'];
const VALID_LEVELS: EduLevel[] = ['beginner', 'intermediate', 'advanced', 'specialized'];
const VALID_MADHHABS: Madhhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali', 'zahiri', 'jafari', 'general'];

function normalizeEnumList<T extends string>(value: unknown, allowed: readonly T[], fallback: T[]): T[] {
  if (value === undefined) return fallback;
  if (!Array.isArray(value)) throw new Error('تصنيفات المحتوى غير صالحة');
  const values = [...new Set(value)].filter((item): item is T =>
    typeof item === 'string' && allowed.includes(item as T)
  );
  if (!values.length) throw new Error('يجب اختيار تصنيف واحد على الأقل');
  return values;
}

/** المحتوى الذي لا يجوز نشره قبل اعتماد مراجع علمي. */
export function requiresScholarReview(content: {
  content_type?: ContentType;
  needs_scholar_review?: boolean | null;
  is_sensitive?: boolean | null;
}): boolean {
  return Boolean(
    content.needs_scholar_review ||
      content.is_sensitive ||
      content.content_type === 'fatwa' ||
      content.content_type === 'hadith' ||
      content.content_type === 'khutbah'
  );
}

export async function createContent(
  input: CreateContentInput,
  userId: string
): Promise<Content> {
  const supabase = getSupabaseAdmin();
  if (!input || typeof input !== 'object' || !VALID_CONTENT_TYPES.includes(input.content_type)) {
    throw new Error('نوع المحتوى غير صالح');
  }
  if (!input.translation || typeof input.translation !== 'object') {
    throw new Error('بيانات الترجمة مطلوبة');
  }
  if (
    typeof input.translation.title !== 'string' ||
    typeof input.translation.slug !== 'string' ||
    typeof input.translation.lang !== 'string'
  ) {
    throw new Error('العنوان والرابط واللغة حقول مطلوبة');
  }

  const audience = normalizeEnumList(input.audience, VALID_AUDIENCES, ['muslim_general']);
  const ageGroups = normalizeEnumList(input.age_groups, VALID_AGE_GROUPS, ['all']);
  const levels = normalizeEnumList(input.levels, VALID_LEVELS, ['beginner']);
  const madhhabs = normalizeEnumList(input.madhhabs, VALID_MADHHABS, ['general']);
  if (input.is_sensitive !== undefined && typeof input.is_sensitive !== 'boolean') {
    throw new Error('قيمة حساسية المحتوى غير صالحة');
  }
  if (input.needs_scholar_review !== undefined && typeof input.needs_scholar_review !== 'boolean') {
    throw new Error('قيمة المراجعة العلمية غير صالحة');
  }
  const title = input.translation.title.trim().slice(0, 240);
  const slug = input.translation.slug.trim().slice(0, 255);
  const language = input.translation.lang.trim().slice(0, 8);

  if (!title || !slug || !language) {
    throw new Error('العنوان والرابط واللغة حقول مطلوبة');
  }

  const safeBody = sanitizeRichTextHtml(input.translation.body || '');
  const bodyPlain = safeBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200_000);
  const needsScholarReview = Boolean(
    input.needs_scholar_review ||
      input.is_sensitive ||
      input.content_type === 'fatwa' ||
      input.content_type === 'hadith' ||
      input.content_type === 'khutbah'
  );

  // 1. إنشاء المحتوى الرئيسي
  const { data: content, error: contentError } = await supabase
    .from('content')
    .insert({
      content_type: input.content_type,
      status: 'draft',
      lang_original: input.lang_original || 'ar',
      audience,
      age_groups: ageGroups,
      levels,
      madhhabs,
      parent_id: input.parent_id || null,
      sort_order: input.sort_order || 0,
      needs_scholar_review: needsScholarReview,
      is_sensitive: input.is_sensitive ?? false,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (contentError) {
    throw new Error(`Failed to create content: ${contentError.message}`);
  }

  // 2. إنشاء الترجمة
  const { error: translationError } = await supabase
    .from('content_translations')
    .insert({
      content_id: content.id,
      lang: language,
      slug,
      title,
      summary: input.translation.summary?.trim().slice(0, 2_000) || null,
      body: safeBody || null,
      body_plain: bodyPlain || null,
      meta_title: input.translation.meta_title || null,
      meta_description: input.translation.meta_description || null,
      is_machine_translated: false,
      is_reviewed: false,
    });

  if (translationError) {
    // في حالة فشل إنشاء الترجمة، نحذف المحتوى الرئيسي
    await supabase.from('content').delete().eq('id', content.id);
    throw new Error(`Failed to create translation: ${translationError.message}`);
  }

  // 3. تسجيل في سجل التدقيق
  await logAudit(userId, 'create', 'content', content.id, content as unknown as Record<string, unknown>);

  return content as Content;
}

export async function getContentBySlug(
  lang: string,
  slug: string
): Promise<Content | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('content_translations')
    .select(`
      *,
      content:content_id (*)
    `)
    .eq('lang', lang)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as any).content as Content;
}

export async function getPublishedContent(
  filters: ContentFilters
): Promise<PaginatedResult<Content>> {
  const supabase = getSupabaseAdmin();
  const page = filters.page || 1;
  const perPage = filters.per_page || 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('content')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

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

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  return {
    data: (data || []) as Content[],
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  };
}

export async function updateContentStatus(
  contentId: string,
  status: ContentStatus,
  userId: string
): Promise<Content> {
  const supabase = getSupabaseAdmin();

  const updateData: Record<string, unknown> = {
    status,
    updated_by: userId,
  };

  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  } else {
    updateData.published_at = null;
  }

  const { data, error } = await supabase
    .from('content')
    .update(updateData)
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update content status: ${error.message}`);
  }

  await logAudit(userId, 'update_status', 'content', contentId, updateData);

  return data as Content;
}

export async function deleteContent(
  contentId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', contentId);

  if (error) {
    throw new Error(`Failed to delete content: ${error.message}`);
  }

  await logAudit(userId, 'delete', 'content', contentId);
}

// =====================================================
// عمليات المراجعة العلمية
// =====================================================

export async function submitForReview(
  contentId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  // تحديث حالة المحتوى
  await supabase
    .from('content')
    .update({ status: 'in_review', updated_by: userId })
    .eq('id', contentId);

  // إضافة إلى طابور المراجعة
  const { error } = await supabase.from('review_queue').insert({
    content_id: contentId,
    submitted_by: userId,
    status: 'pending',
  });

  if (error) {
    throw new Error(`Failed to submit for review: ${error.message}`);
  }

  await logAudit(userId, 'submit_review', 'content', contentId);
}

export async function approveContent(
  contentId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase
    .from('content')
    .update({
      status: 'published',
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      updated_by: reviewerId,
    })
    .eq('id', contentId);

  await supabase
    .from('review_queue')
    .update({
      status: 'approved',
      scholar_notes: notes || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('content_id', contentId)
    .eq('status', 'pending');

  await logAudit(reviewerId, 'approve', 'content', contentId);
}

export async function rejectContent(
  contentId: string,
  reviewerId: string,
  notes: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase
    .from('content')
    .update({
      status: 'rejected',
      reviewer_id: reviewerId,
      reviewed_at: null,
      updated_by: reviewerId,
    })
    .eq('id', contentId);

  await supabase
    .from('review_queue')
    .update({
      status: 'changes_requested',
      scholar_notes: notes,
      resolved_at: new Date().toISOString(),
    })
    .eq('content_id', contentId)
    .eq('status', 'pending');

  await logAudit(reviewerId, 'reject', 'content', contentId);
}

// =====================================================
// عمليات التصنيف
// =====================================================

export async function getTaxonomies(
  kind: string,
  lang: string = 'ar'
): Promise<Taxonomy[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('taxonomies')
    .select('*')
    .eq('kind', kind)
    .eq('lang', lang)
    .order('sort_order');

  if (error) {
    throw new Error(`Failed to fetch taxonomies: ${error.message}`);
  }

  return (data || []) as Taxonomy[];
}

// =====================================================
// سجل التدقيق
// =====================================================

export async function logAudit(
  userId: string,
  action: string,
  tableName: string,
  recordId: string,
  newData?: Record<string, unknown>,
  oldData?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('audit_log').insert({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      new_data: newData || null,
      old_data: oldData || null,
    });

    if (error) {
      console.error('Failed to log audit:', error.message);
    }
  } catch (err) {
    // لا نوقف العملية في حالة فشل تسجيل التدقيق
    console.error('Audit log error:', err);
  }
}
