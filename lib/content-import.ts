import { sanitizeRichTextHtml } from './content-safety.ts';
import type {
  AgeGroup,
  Audience,
  ContentType,
  EduLevel,
  Madhhab,
} from './types/content.ts';

export const CONTENT_IMPORT_FORMAT = 'ismail-dawah-content-import';
export const CONTENT_IMPORT_VERSION = 1 as const;
export const MAX_CONTENT_IMPORT_ITEMS = 100;

const CONTENT_TYPES: readonly ContentType[] = [
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

const LANGUAGES = ['ar', 'en'] as const;
const AUDIENCES: readonly Audience[] = [
  'non_muslim',
  'muslim_new',
  'muslim_general',
  'student',
  'scholar',
  'daee',
  'parent',
  'teacher',
];
const AGE_GROUPS: readonly AgeGroup[] = [
  'kids',
  'teens',
  'youth',
  'adults',
  'seniors',
  'all',
];
const LEVELS: readonly EduLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'specialized',
];
const MADHHABS: readonly Madhhab[] = [
  'hanafi',
  'maliki',
  'shafii',
  'hanbali',
  'zahiri',
  'jafari',
  'general',
];

export type ContentImportTranslation = {
  lang: 'ar' | 'en';
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  meta_title?: string;
  meta_description?: string;
};

export type ContentImportItem = {
  content_type: ContentType;
  lang_original?: 'ar' | 'en';
  audience?: Audience[];
  age_groups?: AgeGroup[];
  levels?: EduLevel[];
  madhhabs?: Madhhab[];
  parent_id?: string | null;
  sort_order?: number;
  needs_scholar_review?: boolean;
  is_sensitive?: boolean;
  translations: ContentImportTranslation[];
};

export type ContentImportIssue = {
  index: number;
  path: string;
  message: string;
};

export type ContentImportReport = {
  ok: boolean;
  format: string | null;
  version: number | null;
  total: number;
  valid: number;
  items: ContentImportItem[];
  errors: ContentImportIssue[];
  warnings: ContentImportIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(
  value: unknown,
  path: string,
  index: number,
  maxLength: number,
  required: boolean,
  errors: ContentImportIssue[]
): string | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string') {
    errors.push({ index, path, message: 'يجب أن تكون القيمة نصًا.' });
    return undefined;
  }

  const result = value.trim().slice(0, maxLength);
  if (required && !result) {
    errors.push({ index, path, message: 'القيمة مطلوبة.' });
    return undefined;
  }

  return result || undefined;
}

function enumList<T extends string>(
  value: unknown,
  path: string,
  index: number,
  allowed: readonly T[],
  errors: ContentImportIssue[]
): T[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) {
    errors.push({ index, path, message: 'يجب أن تكون قائمة غير فارغة.' });
    return undefined;
  }

  const values = [...new Set(value)].filter(
    (item): item is T => typeof item === 'string' && allowed.includes(item as T)
  );

  if (values.length !== value.length) {
    errors.push({ index, path, message: 'تحتوي القائمة على قيمة غير مدعومة.' });
    return undefined;
  }

  return values;
}

function booleanValue(
  value: unknown,
  path: string,
  index: number,
  errors: ContentImportIssue[]
): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    errors.push({ index, path, message: 'يجب أن تكون القيمة منطقية.' });
    return undefined;
  }
  return value;
}

function normalizeTranslation(
  value: unknown,
  itemIndex: number,
  translationIndex: number,
  errors: ContentImportIssue[]
): ContentImportTranslation | null {
  const path = `items[${itemIndex}].translations[${translationIndex}]`;
  if (!isRecord(value)) {
    errors.push({ index: itemIndex, path, message: 'بيانات الترجمة غير صالحة.' });
    return null;
  }

  const lang = text(value.lang, `${path}.lang`, itemIndex, 8, true, errors);
  const slug = text(value.slug, `${path}.slug`, itemIndex, 255, true, errors);
  const title = text(value.title, `${path}.title`, itemIndex, 240, true, errors);
  const summary = text(value.summary, `${path}.summary`, itemIndex, 2_000, false, errors);
  const body = text(value.body, `${path}.body`, itemIndex, 200_000, false, errors);
  const metaTitle = text(
    value.meta_title,
    `${path}.meta_title`,
    itemIndex,
    240,
    false,
    errors
  );
  const metaDescription = text(
    value.meta_description,
    `${path}.meta_description`,
    itemIndex,
    320,
    false,
    errors
  );

  if (!lang || !LANGUAGES.includes(lang as (typeof LANGUAGES)[number])) {
    errors.push({ index: itemIndex, path: `${path}.lang`, message: 'اللغة يجب أن تكون ar أو en.' });
  }

  if (!slug || !title || !lang) return null;

  return {
    lang: lang as ContentImportTranslation['lang'],
    slug,
    title,
    ...(summary !== undefined ? { summary } : {}),
    ...(body !== undefined ? { body } : {}),
    ...(metaTitle !== undefined ? { meta_title: metaTitle } : {}),
    ...(metaDescription !== undefined ? { meta_description: metaDescription } : {}),
  };
}

function normalizeItem(
  value: unknown,
  index: number,
  errors: ContentImportIssue[],
  warnings: ContentImportIssue[]
): ContentImportItem | null {
  if (!isRecord(value)) {
    errors.push({ index, path: `items[${index}]`, message: 'العنصر غير صالح.' });
    return null;
  }

  const contentType = text(value.content_type, `items[${index}].content_type`, index, 32, true, errors);
  if (!contentType || !CONTENT_TYPES.includes(contentType as ContentType)) {
    errors.push({ index, path: `items[${index}].content_type`, message: 'نوع المحتوى غير مدعوم.' });
  }

  const rawTranslations = value.translations;
  if (!Array.isArray(rawTranslations) || rawTranslations.length < 1 || rawTranslations.length > 2) {
    errors.push({
      index,
      path: `items[${index}].translations`,
      message: 'يجب إدخال ترجمة واحدة أو ترجمتين فقط.',
    });
  }

  const translations = Array.isArray(rawTranslations)
    ? rawTranslations
        .map((translation, translationIndex) =>
          normalizeTranslation(translation, index, translationIndex, errors)
        )
        .filter((translation): translation is ContentImportTranslation => Boolean(translation))
    : [];

  const seenLanguages = new Set<string>();
  for (const translation of translations) {
    if (seenLanguages.has(translation.lang)) {
      errors.push({
        index,
        path: `items[${index}].translations`,
        message: `اللغة ${translation.lang} مكررة داخل المادة.`,
      });
    }
    seenLanguages.add(translation.lang);
  }

  const langOriginal = value.lang_original === undefined
    ? undefined
    : text(value.lang_original, `items[${index}].lang_original`, index, 8, true, errors);
  if (langOriginal && !LANGUAGES.includes(langOriginal as (typeof LANGUAGES)[number])) {
    errors.push({ index, path: `items[${index}].lang_original`, message: 'اللغة الأصلية يجب أن تكون ar أو en.' });
  }

  const sortOrder = value.sort_order === undefined ? undefined : value.sort_order;
  if (
    sortOrder !== undefined &&
    (typeof sortOrder !== 'number' || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1_000_000)
  ) {
    errors.push({ index, path: `items[${index}].sort_order`, message: 'الترتيب يجب أن يكون عددًا صحيحًا من 0 إلى 1000000.' });
  }

  const parentId = value.parent_id;
  if (parentId !== undefined && parentId !== null && typeof parentId !== 'string') {
    errors.push({ index, path: `items[${index}].parent_id`, message: 'المعرّف الأب غير صالح.' });
  }

  const audience = enumList(value.audience, `items[${index}].audience`, index, AUDIENCES, errors);
  const ageGroups = enumList(value.age_groups, `items[${index}].age_groups`, index, AGE_GROUPS, errors);
  const levels = enumList(value.levels, `items[${index}].levels`, index, LEVELS, errors);
  const madhhabs = enumList(value.madhhabs, `items[${index}].madhhabs`, index, MADHHABS, errors);
  const needsScholarReview = booleanValue(
    value.needs_scholar_review,
    `items[${index}].needs_scholar_review`,
    index,
    errors
  );
  const isSensitive = booleanValue(value.is_sensitive, `items[${index}].is_sensitive`, index, errors);

  const item: ContentImportItem = {
    content_type: contentType as ContentType,
    ...(langOriginal && LANGUAGES.includes(langOriginal as (typeof LANGUAGES)[number])
      ? { lang_original: langOriginal as ContentImportItem['lang_original'] }
      : {}),
    ...(audience ? { audience } : {}),
    ...(ageGroups ? { age_groups: ageGroups } : {}),
    ...(levels ? { levels } : {}),
    ...(madhhabs ? { madhhabs } : {}),
    ...(parentId === null || typeof parentId === 'string' ? { parent_id: parentId } : {}),
    ...(typeof sortOrder === 'number' && Number.isInteger(sortOrder) && sortOrder >= 0
      ? { sort_order: sortOrder }
      : {}),
    ...(needsScholarReview !== undefined ? { needs_scholar_review: needsScholarReview } : {}),
    ...(isSensitive !== undefined ? { is_sensitive: isSensitive } : {}),
    translations,
  };

  if (
    item.content_type === 'fatwa' ||
    item.content_type === 'hadith' ||
    item.content_type === 'khutbah' ||
    item.needs_scholar_review ||
    item.is_sensitive
  ) {
    warnings.push({
      index,
      path: `items[${index}]`,
      message: 'ستُستورد المادة كمسودة وتحتاج مراجعة/مرجعًا قبل النشر.',
    });
  }

  return item;
}

/** يتحقق من ملف الاستيراد وينظفه دون أي اتصال بقاعدة البيانات أو كتابة. */
export function validateContentImport(value: unknown): ContentImportReport {
  const errors: ContentImportIssue[] = [];
  const warnings: ContentImportIssue[] = [];
  const format = isRecord(value) && typeof value.format === 'string' ? value.format : null;
  const version = isRecord(value) && typeof value.version === 'number' ? value.version : null;
  const rawItems = isRecord(value) && Array.isArray(value.items) ? value.items : [];

  if (format !== CONTENT_IMPORT_FORMAT) {
    errors.push({ index: -1, path: 'format', message: 'صيغة الملف غير معروفة.' });
  }
  if (version !== CONTENT_IMPORT_VERSION) {
    errors.push({ index: -1, path: 'version', message: 'إصدار ملف الاستيراد غير مدعوم.' });
  }
  if (!isRecord(value) || !Array.isArray(value.items)) {
    errors.push({ index: -1, path: 'items', message: 'يجب أن يحتوي الملف على قائمة items.' });
  }
  if (rawItems.length > MAX_CONTENT_IMPORT_ITEMS) {
    errors.push({
      index: -1,
      path: 'items',
      message: `الحد الأقصى للاستيراد دفعة واحدة هو ${MAX_CONTENT_IMPORT_ITEMS} مادة.`,
    });
  }

  const items = rawItems.map((item, index) => normalizeItem(item, index, errors, warnings));
  const keys = new Map<string, number>();
  for (const [index, item] of items.entries()) {
    if (!item) continue;
    for (const translation of item.translations) {
      const key = `${translation.lang}:${translation.slug}`;
      const previous = keys.get(key);
      if (previous !== undefined) {
        errors.push({
          index,
          path: `items[${index}].translations`,
          message: `الرابط ${translation.slug} مكرر مع المادة ${previous + 1}.`,
        });
      } else {
        keys.set(key, index);
      }
    }
  }

  const validItems = items.filter((item): item is ContentImportItem => Boolean(item));
  return {
    ok: errors.length === 0 && validItems.length === rawItems.length,
    format,
    version,
    total: rawItems.length,
    valid: errors.length === 0 ? validItems.length : 0,
    items: validItems,
    errors,
    warnings,
  };
}

/** الشكل الذي يظهر في زر تنزيل القالب داخل لوحة التحكم. */
export function buildContentImportTemplate(): Record<string, unknown> {
  return {
    format: CONTENT_IMPORT_FORMAT,
    version: CONTENT_IMPORT_VERSION,
    items: [
      {
        content_type: 'article',
        lang_original: 'ar',
        audience: ['muslim_general'],
        age_groups: ['all'],
        levels: ['beginner'],
        madhhabs: ['general'],
        needs_scholar_review: false,
        is_sensitive: false,
        translations: [
          {
            lang: 'ar',
            slug: 'example-article',
            title: 'عنوان المادة',
            summary: 'ملخص اختياري',
            body: '<p>المتن المسموح بتنسيقه.</p>',
            meta_title: 'عنوان SEO اختياري',
            meta_description: 'وصف SEO اختياري',
          },
          {
            lang: 'en',
            slug: 'example-article-en',
            title: 'Article title',
            summary: 'Optional summary',
            body: '<p>Optional body.</p>',
          },
        ],
      },
    ],
  };
}

export function sanitizeImportedBody(value: string | undefined): string {
  return sanitizeRichTextHtml(value ?? '');
}
