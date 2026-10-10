// lib/i18n.ts
// ============================================================================
// نظام التدويل (i18n) الرسمي لمنصة إسماعيل أحمد نجيب
// يدعم: عربي (RTL) / إنجليزي (LTR)
// ============================================================================

/**
 * اللغات المدعومة في المنصة
 */
export const languages = ['ar', 'en'] as const;

/**
 * نوع اللغة المدعومة
 */
export type Lang = (typeof languages)[number];

/**
 * اللغة الافتراضية للمنصة
 */
export const defaultLang: Lang = 'ar';

/**
 * أسماء اللغات للعرض في الواجهة
 */
export const languagesMap: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
} as const;

/**
 * أكواد اللغات بصيغة BCP-47 (للـ Intl والـ meta tags)
 */
export const localeMap: Record<Lang, string> = {
  ar: 'ar-EG',
  en: 'en-US',
} as const;

/**
 * قيمة lang المناسبة لعنصر <html>
 */
export const htmlLangMap: Record<Lang, string> = {
  ar: 'ar',
  en: 'en',
} as const;

/**
 * اتجاه النص حسب اللغة
 */
export const directionMap: Record<Lang, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
} as const;

/**
 * Regex آمن للتعرف على بادئة اللغة في المسار.
 *
 * يقبل:
 * - /ar
 * - /ar/...
 * - /en
 * - /en/...
 *
 * ولا يخطئ مع:
 * - /archive
 * - /english
 */
const LANG_PREFIX_REGEX = /^\/(ar|en)(?=\/|$)/;

// ============================================================================
// 🔍 دوال التحقق
// ============================================================================

/**
 * التحقق من صحة اللغة الممررة في الـ URL
 */
export function isValidLang(lang: string | undefined | null): lang is Lang {
  if (!lang) return false;
  return (languages as readonly string[]).includes(lang);
}

export function isArabic(lang: Lang): boolean {
  return lang === 'ar';
}

export function isEnglish(lang: Lang): boolean {
  return lang === 'en';
}

// ============================================================================
// 🧭 دوال الاتجاه واللغة
// ============================================================================

export function getDirection(lang: Lang): 'rtl' | 'ltr' {
  return directionMap[lang] || directionMap.ar;
}

export function getLocale(lang: Lang): string {
  return localeMap[lang] || localeMap.ar;
}

export function getHtmlLang(lang: Lang): string {
  return htmlLangMap[lang] || htmlLangMap.ar;
}

export function getLanguageName(lang: Lang): string {
  return languagesMap[lang] || languagesMap.ar;
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === 'ar' ? 'en' : 'ar';
}

// ============================================================================
// 🧰 Internal helpers
// ============================================================================

function normalizePath(path: string): string {
  let normalized = String(path ?? '/').trim();

  if (!normalized) {
    return '/';
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  // منع الـ double slash
  normalized = normalized.replace(/\/{2,}/g, '/');

  // إزالة الشرطة الأخيرة إلا إذا كان المسار جذرًا
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || '/';
}

function removeLangPrefix(path: string): string {
  const normalized = normalizePath(path);
  const withoutLang = normalized.replace(LANG_PREFIX_REGEX, '');

  return withoutLang || '/';
}

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ============================================================================
// 🌐 دوال الروابط والـ URLs
// ============================================================================

/**
 * إرجاع المسار بدون بادئة اللغة.
 *
 * مثال:
 * /ar/quran -> /quran
 * /en/about -> /about
 * / -> /
 */
export function getPathWithoutLang(path: string): string {
  return removeLangPrefix(path);
}

/**
 * التحقق هل المسار يحتوي بادئة لغة؟
 */
export function hasLangPrefix(path: string): boolean {
  return LANG_PREFIX_REGEX.test(normalizePath(path));
}

/**
 * تحويل المسار الحالي إلى لغة مستهدفة.
 *
 * أمثلة:
 * getLocalizedPath('/', 'ar') => '/ar'
 * getLocalizedPath('/', 'en') => '/en'
 * getLocalizedPath('/ar/quran', 'en') => '/en/quran'
 * getLocalizedPath('/quran', 'ar') => '/ar/quran'
 */
export function getLocalizedPath(currentPath: string, targetLang: Lang): string {
  const withoutLang = removeLangPrefix(currentPath);

  if (withoutLang === '/') {
    return `/${targetLang}`;
  }

  return `/${targetLang}${withoutLang}`;
}

/**
 * استخراج اللغة من المسار.
 *
 * أمثلة:
 * /ar/quran => ar
 * /en/about => en
 * / => null
 */
export function getLangFromPath(path: string): Lang | null {
  const normalized = normalizePath(path);
  const match = normalized.match(LANG_PREFIX_REGEX);

  if (match && isValidLang(match[1])) {
    return match[1];
  }

  return null;
}

/**
 * إرجاع روابط اللغات البديلة لمسار معين.
 *
 * يشمل:
 * - ar
 * - en
 * - x-default
 *
 * مهم جدًا لـ SEO في المواقع متعددة اللغة.
 */
export function getAlternateLanguages(
  path: string
): Record<Lang | 'x-default', string> {
  const withoutLang = removeLangPrefix(path);

  const arPath = withoutLang === '/' ? '/ar' : `/ar${withoutLang}`;
  const enPath = withoutLang === '/' ? '/en' : `/en${withoutLang}`;

  return {
    ar: arPath,
    en: enPath,
    'x-default': arPath,
  };
}

// ============================================================================
// 📅 دوال التاريخ والوقت
// ============================================================================

/**
 * تنسيق تاريخ ميلادي آمن.
 */
export function formatDate(
  date: Date | string | number,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = toDate(date);

  if (!parsed) {
    return '';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const finalOptions = options ?? defaultOptions;

  try {
    return new Intl.DateTimeFormat(getLocale(lang), finalOptions).format(parsed);
  } catch {
    try {
      return parsed.toLocaleDateString();
    } catch {
      return parsed.toISOString().slice(0, 10);
    }
  }
}

/**
 * locales هجرية محتملة حسب الترتيب.
 *
 * نحاول أولًا Umm al-Qura لأنه الأدق للمناسبات السعودية/الإسلامية الشائعة،
 * ثم fallback إلى islamic عام.
 */
const HIJRI_LOCALES: Record<Lang, string[]> = {
  ar: [
    'ar-SA-u-ca-islamic-umalqura',
    'ar-EG-u-ca-islamic',
    'ar-u-ca-islamic',
    'ar',
  ],
  en: [
    'en-US-u-ca-islamic-umalqura',
    'en-US-u-ca-islamic',
    'en-u-ca-islamic',
    'en',
  ],
};

/**
 * تنسيق تاريخ هجري مع fallback آمن.
 *
 * إذا لم يدعم البيئة التقويم الهجري، يرجع تاريخًا ميلاديًا بدل الانهيار.
 */
export function formatHijriDate(
  date: Date | string | number,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = toDate(date);

  if (!parsed) {
    return '';
  }

  const defaultHijriOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    era: 'short',
  };

  const finalOptions = options ?? defaultHijriOptions;
  const locales = HIJRI_LOCALES[lang] || HIJRI_LOCALES.ar;

  for (const locale of locales) {
    try {
      return new Intl.DateTimeFormat(locale, finalOptions).format(parsed);
    } catch {
      // جرّب التالي
    }
  }

  // fallback نهائي: تاريخ ميلادي
  return formatDate(parsed, lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق وقت آمن.
 */
export function formatTime(
  date: Date | string | number,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = toDate(date);

  if (!parsed) {
    return '';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const finalOptions = options ?? defaultOptions;

  try {
    return new Intl.DateTimeFormat(getLocale(lang), finalOptions).format(parsed);
  } catch {
    try {
      return parsed.toLocaleTimeString();
    } catch {
      return parsed.toISOString().slice(11, 16);
    }
  }
}

/**
 * تنسيق رقم حسب اللغة.
 */
export function formatNumber(
  num: number,
  lang: Lang,
  options?: Intl.NumberFormatOptions
): string {
  if (!Number.isFinite(num)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(getLocale(lang), options).format(num);
  } catch {
    return String(num);
  }
}

// ============================================================================
// 🏗️ دوال Next.js Helpers
// ============================================================================

/**
 * لتوليد params في generateStaticParams.
 */
export function generateLangParams(): Array<{ lang: Lang }> {
  return languages.map((lang) => ({ lang }));
}

export function isValidLangParam(lang: string): lang is Lang {
  return isValidLang(lang);
}

/**
 * إرجاع لغة آمنة دائمًا.
 */
export function getSafeLang(lang: string | undefined | null): Lang {
  return isValidLang(lang) ? lang : defaultLang;
}

// ============================================================================
// 🎨 دوال العرض والـ UI
// ============================================================================

/**
 * اختيار نص حسب اللغة مع fallback آمن.
 *
 * يقبل:
 * { ar: '...', en: '...' }
 * { ar: '...' }
 * { en: '...' }
 * { default: '...' }
 */
export function pickText(
  lang: Lang,
  text: {
    ar?: string;
    en?: string;
    default?: string;
  }
): string {
  const value =
    text?.[lang] ??
    text?.ar ??
    text?.en ??
    text?.default ??
    '';

  return String(value);
}

/**
 * اختيار قيمة حسب اللغة مع fallback آمن.
 */
export function pickByLang<T>(
  lang: Lang,
  values: {
    ar?: T;
    en?: T;
    default?: T;
  }
): T {
  const value =
    values?.[lang] ??
    values?.ar ??
    values?.en ??
    values?.default;

  return value as T;
}

/**
 * كلاسات Tailwind حسب الاتجاه.
 *
 * ملاحظة مهمة للتوافق مع الكود القديم:
 * paddingStart و paddingEnd و marginStart و marginEnd هي prefixes وليس كلاسات كاملة.
 *
 * مثال:
 * `${paddingStart}4` => `pr-4` للعربية
 * `${paddingEnd}4` => `pl-4` للعربية
 *
 * إذا كنت تستخدم Tailwind logical properties حديثًا،
 * فقد تفضل ps-/pe-/ms-/me- بدل pr-/pl-/mr-/ml-.
 */
export interface LangClasses {
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  textAlign: 'text-right' | 'text-left';
  flexDirection: 'flex-row';
  paddingStart: 'pr-' | 'pl-';
  paddingEnd: 'pl-' | 'pr-';
  marginStart: 'mr-' | 'ml-';
  marginEnd: 'ml-' | 'mr-';
  start: 'right' | 'left';
  end: 'left' | 'right';
}

export function getLangClasses(lang: Lang): LangClasses {
  if (lang === 'ar') {
    return {
      dir: 'rtl',
      isRtl: true,
      textAlign: 'text-right',
      flexDirection: 'flex-row',
      paddingStart: 'pr-',
      paddingEnd: 'pl-',
      marginStart: 'mr-',
      marginEnd: 'ml-',
      start: 'right',
      end: 'left',
    };
  }

  return {
    dir: 'ltr',
    isRtl: false,
    textAlign: 'text-left',
    flexDirection: 'flex-row',
    paddingStart: 'pl-',
    paddingEnd: 'pr-',
    marginStart: 'ml-',
    marginEnd: 'mr-',
    start: 'left',
    end: 'right',
  };
}

// ============================================================================
// 🔤 دوال النصوص المشتركة
// ============================================================================

/**
 * تنظيف النص العربي قبل توليد الـ slug.
 */
function normalizeArabicForSlug(input: string): string {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // إزالة التشكيل والعلامات المركبة
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0711]/g, '') // احتياط إضافي
    .replace(/\u0640/g, '') // إزالة التطويل
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}

/**
 * توليد slug آمن للعناوين العربية والإنجليزية.
 *
 * أمثلة:
 * "فضل سورة الكهف" => "فضل-سورة-الكهف"
 * "The Power of Surah Al-Kahf" => "the-power-of-surah-al-kahf"
 */
export function slugify(text: string): string {
  const normalized = normalizeArabicForSlug(text);

  const slug = normalized
    .trim()
    .replace(/['’`"]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'content';
}

/**
 * قص النص بأمان مع دعم الحروف المركبة والإيموجي.
 */
export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }

  const chars = Array.from(String(text ?? ''));

  if (chars.length <= maxLength) {
    return chars.join('');
  }

  // نحتفظ بمكان للحذف
  const sliced = chars.slice(0, Math.max(0, maxLength - 1)).join('').trimEnd();

  return `${sliced}…`;
}

// ============================================================================
// 📦 تصديرات إضافية للتوافق مع الملفات القديمة
// ============================================================================

export const supportedLanguages = languages;
export const validateLang = isValidLang;
export const getTextDirection = getDirection;

// ============================================================================
// 🔤 إعادة تصدير دوال الترجمة من translations.ts
// للتوافق مع جميع الملفات التي تستورد t من @/lib/i18n
//
// ⚠️ تحذير مهم:
// إذا كان ملف translations.ts يستورد شيئًا من i18n.ts،
// فقد يحدث circular dependency.
//
// في هذه الحالة، الأفضل حذف هذا البلوك واستيراد t مباشرة من:
// import { t } from "@/lib/translations";
// ============================================================================

export {
  t,
  tWithParams,
  tProxy,
  getTranslations,
  getFieldTranslation,
  defaultFieldTranslations,
  type TranslationKey,
  type TranslationLang,
} from "./translations";

// ============================================================================
// 🎯 تصدير افتراضي
// ============================================================================

const i18n = {
  languages,
  defaultLang,
  languagesMap,
  localeMap,
  htmlLangMap,
  directionMap,

  isValidLang,
  isArabic,
  isEnglish,

  getDirection,
  getLocale,
  getHtmlLang,
  getLanguageName,
  getAlternateLang,

  getPathWithoutLang,
  hasLangPrefix,
  getLocalizedPath,
  getLangFromPath,
  getAlternateLanguages,

  formatDate,
  formatHijriDate,
  formatTime,
  formatNumber,

  generateLangParams,
  isValidLangParam,
  getSafeLang,

  pickText,
  pickByLang,
  getLangClasses,

  slugify,
  truncateText,

  supportedLanguages,
  validateLang,
  getTextDirection,
};

export default i18n;