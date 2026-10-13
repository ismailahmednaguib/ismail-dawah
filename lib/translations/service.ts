// lib/translations/service.ts
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  LanguageCode,
  TranslationRow,
  ContentTranslationMatrix,
  TranslationStats,
} from './types';
import { LANGUAGES } from './types';

/**
 * جلب مصفوفة الترجمات لكل المحتوى
 */
export async function getTranslationMatrix(
  page: number = 1,
  perPage: number = 20,
  search?: string
): Promise<{ data: ContentTranslationMatrix[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const from = (page - 1) * perPage;

  // جلب المحتوى مع الترجمات
  let query = supabase
    .from('content')
    .select(`
      id,
      content_type,
      lang_original,
      status,
      content_translations (
        id,
        lang,
        slug,
        title,
        is_machine_translated,
        is_reviewed,
        updated_at
      )
    `, { count: 'exact' })
.in('status', ['published', 'draft', 'in_review']);
  if (search) {
    query = query.ilike('content_translations.title', `%${search}%`);
  }

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) throw new Error(error.message);

  const enabledLangs = LANGUAGES.filter(l => l.enabled).map(l => l.code);

  const matrix: ContentTranslationMatrix[] = (data ?? []).map((row: any) => {
    const translations: ContentTranslationMatrix['translations'] = {};

    for (const lang of enabledLangs) {
      const t = row.content_translations?.find((x: any) => x.lang === lang);
      if (t) {
        translations[lang] = {
          exists: true,
          status: t.is_reviewed ? 'reviewed' : t.is_machine_translated ? 'machine_translated' : 'in_progress',
          title: t.title,
          slug: t.slug,
          updated_at: t.updated_at,
        };
      } else {
        translations[lang] = { exists: false, status: 'not_started' };
      }
    }

    const originalTranslation = row.content_translations?.find(
      (x: any) => x.lang === row.lang_original
    );

    return {
      content_id: row.id,
      content_type: row.content_type,
      original_lang: row.lang_original,
      original_title: originalTranslation?.title ?? '(بدون عنوان)',
      translations,
    };
  });

  return { data: matrix, total: count ?? 0 };
}

/**
 * جلب ترجمة واحدة
 */
export async function getTranslation(
  contentId: string,
  lang: LanguageCode
): Promise<TranslationRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('content_translations')
    .select('*')
    .eq('content_id', contentId)
    .eq('lang', lang)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as TranslationRow | null;
}

/**
 * إنشاء أو تحديث ترجمة
 */
export async function upsertTranslation(
  contentId: string,
  lang: LanguageCode,
  translation: Partial<TranslationRow>,
  userId: string
): Promise<TranslationRow> {
  const supabase = getSupabaseAdmin();

  const payload = {
    content_id: contentId,
    lang,
    slug: translation.slug,
    title: translation.title,
    summary: translation.summary ?? null,
    body: translation.body ?? null,
    body_plain: translation.body_plain ?? null,
    meta_title: translation.meta_title ?? null,
    meta_description: translation.meta_description ?? null,
    is_machine_translated: translation.is_machine_translated ?? false,
    is_reviewed: translation.is_reviewed ?? false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('content_translations')
    .upsert(payload, {
      onConflict: 'content_id,lang',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // تسجيل في سجل التدقيق
  await supabase.from('audit_log').insert({
    user_id: userId,
    action: 'translate',
    table_name: 'content_translations',
    record_id: data.id,
    new_data: { content_id: contentId, lang },
  });

  return data as TranslationRow;
}

/**
 * وضع علامة "تمت المراجعة" على ترجمة
 */
export async function markTranslationReviewed(
  contentId: string,
  lang: LanguageCode,
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('content_translations')
    .update({
      is_reviewed: true,
      reviewed_by: userId,
    })
    .eq('content_id', contentId)
    .eq('lang', lang);

  if (error) throw new Error(error.message);
}

/**
 * إحصائيات الترجمات
 */
export async function getTranslationStats(): Promise<TranslationStats> {
  const supabase = getSupabaseAdmin();
  const enabledLangs = LANGUAGES.filter(l => l.enabled).map(l => l.code);

  // إجمالي المحتوى المنشور
  const { count: totalContent } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // الترجمات حسب اللغة
  const { data: translations } = await supabase
    .from('content_translations')
    .select(`
      lang,
      is_machine_translated,
      is_reviewed,
      content_id
    `);

  const byLanguage: TranslationStats['by_language'] = {};

  for (const lang of enabledLangs) {
    const langTranslations = (translations ?? []).filter(t => t.lang === lang);
    const translated = langTranslations.length;
    const machineTranslated = langTranslations.filter(t => t.is_machine_translated).length;
    const reviewed = langTranslations.filter(t => t.is_reviewed).length;

    byLanguage[lang] = {
      translated,
      machine_translated: machineTranslated,
      reviewed,
      not_started: (totalContent ?? 0) - translated,
      coverage_percent: totalContent ? Math.round((translated / totalContent) * 100) : 0,
    };
  }

  return {
    total_content: totalContent ?? 0,
    by_language: byLanguage,
  };
}

/**
 * نسخ الترجمة الأصلية كنقطة بداية
 */
export async function copyOriginalAsDraft(
  contentId: string,
  targetLang: LanguageCode,
  userId: string
): Promise<TranslationRow> {
  const supabase = getSupabaseAdmin();

  // جلب اللغة الأصلية للمحتوى
  const { data: content } = await supabase
    .from('content')
    .select('lang_original')
    .eq('id', contentId)
    .single();

  if (!content) throw new Error('Content not found');

  // جلب الترجمة الأصلية
  const { data: original } = await supabase
    .from('content_translations')
    .select('*')
    .eq('content_id', contentId)
    .eq('lang', content.lang_original)
    .single();

  if (!original) throw new Error('Original translation not found');

  // إنشاء نسخة كنقطة بداية
  return upsertTranslation(contentId, targetLang, {
    slug: `${original.slug}-${targetLang}`,
    title: `[${targetLang.toUpperCase()}] ${original.title}`,
    summary: original.summary,
    body: original.body,
    body_plain: original.body_plain,
    meta_title: original.meta_title,
    meta_description: original.meta_description,
    is_machine_translated: false,
    is_reviewed: false,
  }, userId);
}