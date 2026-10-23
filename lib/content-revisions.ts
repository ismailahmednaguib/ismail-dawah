// ============================================================
// سجل نسخ المحتوى — منطق نقي (بلا قاعدة بيانات أو شبكة).
// ------------------------------------------------------------
// نحفظ نسخة من الحقول القابلة للتعديل فقط، لا الصف كاملًا:
//   • بيانات المحتوى: النوع والجمهور والفئة والمستوى والمذهب
//     وعلَمَي المراجعة العلمية والحساسية.
//   • الترجمات: النصوص وبيانات SEO، مع معرّف الترجمة ولغتها.
//
// لا تُحفظ هنا حالة النشر ولا عدّادات المشاهدات ولا حقول التدقيق؛
// الاستعادة تعيد النصوص والتصنيفات فقط، وتترك حالة النشر الحالية
// كما هي، وتعيد المحتوى الحسّاس إلى المراجعة عبر الخدمة الخادمية.
// ============================================================

/** أقصى عدد نسخ محفوظة لكل مادة؛ ما زاد يُقلَّم تلقائيًّا. */
export const MAX_CONTENT_REVISIONS = 50;

/** أقصى عدد ترجمات محفوظة في النسخة الواحدة. */
export const MAX_REVISION_TRANSLATIONS = 20;

export type ContentRevisionReason = 'update' | 'restore';

export type RevisionContentState = {
  content_type: string;
  audience: string[];
  age_groups: string[];
  levels: string[];
  madhhabs: string[];
  needs_scholar_review: boolean;
  is_sensitive: boolean;
  /** للعرض في السجل فقط؛ لا يُستعاد. */
  status: string | null;
};

export type RevisionTranslationState = {
  id: string;
  lang: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  meta_title: string | null;
  meta_description: string | null;
};

export type ContentRevisionSnapshot = {
  content: RevisionContentState;
  translations: RevisionTranslationState[];
};

export type RevisionRestoreInput = {
  content: Omit<RevisionContentState, 'status'>;
  translation: {
    id: string;
    lang: string;
    title: string;
    slug: string;
    summary: string;
    body: string;
    meta_title: string;
    meta_description: string;
  } | null;
};

const DEFAULT_AUDIENCE = ['muslim_general'];
const DEFAULT_AGE_GROUPS = ['all'];
const DEFAULT_LEVELS = ['beginner'];
const DEFAULT_MADHHABS = ['general'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readBody(value: unknown): string | null {
  return typeof value === 'string' ? value.slice(0, 200_000) : null;
}

/** يقرأ مصفوفة نصوص من صف قاعدة البيانات مع قيمة احتياطية آمنة. */
function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];

  const items = [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];

  return items.length ? items : [...fallback];
}

/** يتحقق من مصفوفة نصوص قادمة من نسخة محفوظة (بلا احتياطي). */
function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    const trimmed = item.trim();
    if (!trimmed) return null;
    if (!items.includes(trimmed)) items.push(trimmed);
  }

  return items.length ? items : null;
}

/**
 * يبني نسخة قابلة للحفظ من صف المحتوى الكامل (`getContentFull`).
 * يتجاهل الحقول غير القابلة للتعديل، ويقصّ الترجمات عند الحد الآمن.
 */
export function buildContentRevisionSnapshot(
  input: Record<string, unknown>
): ContentRevisionSnapshot {
  const rawTranslations = Array.isArray(input.content_translations)
    ? input.content_translations
    : [];

  return {
    content: {
      content_type: readString(input.content_type) || 'article',
      audience: readStringArray(input.audience, DEFAULT_AUDIENCE),
      age_groups: readStringArray(input.age_groups, DEFAULT_AGE_GROUPS),
      levels: readStringArray(input.levels, DEFAULT_LEVELS),
      madhhabs: readStringArray(input.madhhabs, DEFAULT_MADHHABS),
      needs_scholar_review: input.needs_scholar_review === true,
      is_sensitive: input.is_sensitive === true,
      status: readString(input.status) || null,
    },
    translations: rawTranslations
      .filter(isRecord)
      .map((translation) => ({
        id: readString(translation.id),
        lang: readString(translation.lang),
        title: readString(translation.title),
        slug: readString(translation.slug),
        summary: readNullableString(translation.summary),
        body: readBody(translation.body),
        meta_title: readNullableString(translation.meta_title),
        meta_description: readNullableString(translation.meta_description),
      }))
      .filter((translation) =>
        Boolean(translation.id && translation.lang && translation.title && translation.slug)
      )
      .slice(0, MAX_REVISION_TRANSLATIONS),
  };
}

/**
 * يتحقق من نسخة محفوظة ويعيدها بشكل آمن، أو `null` إن كانت تالفة.
 * التحقق بنيوي فقط؛ التحقق من صحة القيم (النوع/الجمهور/المذهب) يتم
 * في خدمة المحتوى قبل الكتابة.
 */
export function parseContentRevisionSnapshot(value: unknown): ContentRevisionSnapshot | null {
  if (!isRecord(value)) return null;

  const rawContent = value.content;
  const rawTranslations = value.translations;

  if (!isRecord(rawContent) || !Array.isArray(rawTranslations) || rawTranslations.length === 0) {
    return null;
  }

  const contentType = readString(rawContent.content_type);
  const audience = parseStringArray(rawContent.audience);
  const ageGroups = parseStringArray(rawContent.age_groups);
  const levels = parseStringArray(rawContent.levels);
  const madhhabs = parseStringArray(rawContent.madhhabs);

  if (!contentType || !audience || !ageGroups || !levels || !madhhabs) return null;
  if (
    typeof rawContent.needs_scholar_review !== 'boolean' ||
    typeof rawContent.is_sensitive !== 'boolean'
  ) {
    return null;
  }

  const translations: RevisionTranslationState[] = [];
  for (const raw of rawTranslations) {
    if (!isRecord(raw)) return null;

    const id = readString(raw.id);
    const lang = readString(raw.lang);
    const title = readString(raw.title);
    const slug = readString(raw.slug);
    if (!id || !lang || !title || !slug) return null;

    translations.push({
      id,
      lang,
      title,
      slug,
      summary: readNullableString(raw.summary),
      body: readBody(raw.body),
      meta_title: readNullableString(raw.meta_title),
      meta_description: readNullableString(raw.meta_description),
    });
  }

  if (!translations.length || translations.length > MAX_REVISION_TRANSLATIONS) return null;

  return {
    content: {
      content_type: contentType,
      audience,
      age_groups: ageGroups,
      levels,
      madhhabs,
      needs_scholar_review: rawContent.needs_scholar_review,
      is_sensitive: rawContent.is_sensitive,
      status: readString(rawContent.status) || null,
    },
    translations,
  };
}

/** يختار الترجمة العربية إن وُجدت، وإلا أول ترجمة في النسخة. */
export function pickRevisionTranslation(
  snapshot: ContentRevisionSnapshot,
  preferredLang = 'ar'
): RevisionTranslationState | null {
  return (
    snapshot.translations.find((translation) => translation.lang === preferredLang) ??
    snapshot.translations[0] ??
    null
  );
}

/**
 * يحوّل نسخة محفوظة إلى مدخلات استعادة جاهزة للخدمة.
 * لا يعيد حالة النشر، ولا يعيد `status` أصلًا، حتى لا تُستعاد
 * حالة قديمة تتجاوز دورة المراجعة الحالية.
 */
export function buildRevisionRestoreInput(
  snapshot: ContentRevisionSnapshot,
  preferredLang = 'ar'
): RevisionRestoreInput {
  const translation = pickRevisionTranslation(snapshot, preferredLang);

  return {
    content: {
      content_type: snapshot.content.content_type,
      audience: [...snapshot.content.audience],
      age_groups: [...snapshot.content.age_groups],
      levels: [...snapshot.content.levels],
      madhhabs: [...snapshot.content.madhhabs],
      needs_scholar_review: snapshot.content.needs_scholar_review,
      is_sensitive: snapshot.content.is_sensitive,
    },
    translation: translation
      ? {
          id: translation.id,
          lang: translation.lang,
          title: translation.title,
          slug: translation.slug,
          summary: translation.summary ?? '',
          body: translation.body ?? '',
          meta_title: translation.meta_title ?? '',
          meta_description: translation.meta_description ?? '',
        }
      : null,
  };
}
