// lib/i18n.ts
// ============================================================================
// نظام التدويل (i18n) الرسمي لمنصة إسماعيل أحمد نجيب
// يدعم: عربي (RTL) / إنجليزي (LTR)
// ============================================================================

/**
 * اللغات المدعومة في المنصة
 * ملاحظة: هذا التعريف هنا لتجنب الاعتماد الدائري مع translations.ts
 */
export const languages = ['ar', 'en'] as const;

/**
 * نوع اللغة المدعومة
 * يُستخدم في: الصفحات، المكونات، الـ layouts
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
 * أكواد اللغات بصيغة BCP-47 (للـ SEO والـ meta tags)
 */
export const localeMap: Record<Lang, string> = {
  ar: 'ar-EG',
  en: 'en-US',
} as const;

/**
 * اتجاه النص حسب اللغة
 */
export const directionMap: Record<Lang, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
} as const;

/**
 * أسماء الدول للعرض (اختياري)
 */
export const countryMap: Record<Lang, string> = {
  ar: 'مصر',
  en: 'United States',
} as const;

// ============================================================================
// 🔍 دوال التحقق
// ============================================================================

/**
 * التحقق من صحة اللغة الممررة في الـ URL
 * تُستخدم في: middleware، الصفحات، الـ layouts
 * @example isValidLang('ar') => true
 * @example isValidLang('fr') => false
 */
export function isValidLang(lang: string | undefined | null): lang is Lang {
  if (!lang) return false;
  return (languages as readonly string[]).includes(lang);
}

/**
 * التحقق من أن اللغة عربية (للتحقق السريع من RTL)
 */
export function isArabic(lang: Lang): boolean {
  return lang === 'ar';
}

/**
 * التحقق من أن اللغة إنجليزية
 */
export function isEnglish(lang: Lang): boolean {
  return lang === 'en';
}

// ============================================================================
// 🧭 دوال الاتجاه واللغة
// ============================================================================

/**
 * الحصول على اتجاه النص حسب اللغة
 * @example getDirection('ar') => 'rtl'
 * @example getDirection('en') => 'ltr'
 */
export function getDirection(lang: Lang): 'rtl' | 'ltr' {
  return directionMap[lang] || directionMap.ar;
}

/**
 * الحصول على كود الـ locale الكامل
 * @example getLocale('ar') => 'ar-EG'
 * @example getLocale('en') => 'en-US'
 */
export function getLocale(lang: Lang): string {
  return localeMap[lang] || localeMap.ar;
}

/**
 * الحصول على اسم اللغة للعرض
 * @example getLanguageName('ar') => 'العربية'
 */
export function getLanguageName(lang: Lang): string {
  return languagesMap[lang] || languagesMap.ar;
}

/**
 * الحصول على اللغة البديلة (للتبديل بين اللغات)
 * @example getAlternateLang('ar') => 'en'
 * @example getAlternateLang('en') => 'ar'
 */
export function getAlternateLang(lang: Lang): Lang {
  return lang === 'ar' ? 'en' : 'ar';
}

// ============================================================================
// 🌐 دوال الروابط والـ URLs
// ============================================================================

/**
 * توليد رابط بديل للغة الأخرى (يستخدم في LanguageSwitcher)
 * @example getLocalizedPath('/ar/quran', 'en') => '/en/quran'
 */
export function getLocalizedPath(currentPath: string, targetLang: Lang): string {
  const pathWithoutLang = currentPath.replace(/^\/(ar|en)/, '');
  return `/${targetLang}${pathWithoutLang}`;
}

/**
 * استخراج اللغة من مسار الـ URL
 * @example getLangFromPath('/ar/quran') => 'ar'
 * @example getLangFromPath('/en/about') => 'en'
 */
export function getLangFromPath(path: string): Lang | null {
  const match = path.match(/^\/(ar|en)(\/|$)/);
  if (match && isValidLang(match[1])) {
    return match[1];
  }
  return null;
}

/**
 * توليد قائمة الروابط البديلة لـ hreflang tags
 * تُستخدم في: generateMetadata، sitemap، JSON-LD
 */
export function getAlternateLanguages(path: string) {
  const pathWithoutLang = path.replace(/^\/(ar|en)/, '');
  return {
    ar: `/ar${pathWithoutLang}`,
    en: `/en${pathWithoutLang}`,
  };
}

// ============================================================================
// 📅 دوال التاريخ والوقت
// ============================================================================

/**
 * تنسيق التاريخ حسب اللغة
 * @example formatDate(new Date(), 'ar') => '١٠ أكتوبر ٢٠٢٦'
 */
export function formatDate(date: Date, lang: Lang, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(getLocale(lang), defaultOptions).format(date);
}

/**
 * تنسيق التاريخ الهجري
 * @example formatHijriDate(new Date(), 'ar') => '٢٩ ربيع الآخر ١٤٤٨'
 */
export function formatHijriDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(`${getLocale(lang)}-u-ca-islamic`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * تنسيق الوقت حسب اللغة
 * @example formatTime(new Date(), 'ar') => '١٢:٤٢ م'
 */
export function formatTime(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(getLocale(lang), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * تنسيق الأرقام حسب اللغة (أرقام عربية/إنجليزية)
 * @example formatNumber(1234, 'ar') => '١٬٢٣٤'
 */
export function formatNumber(num: number, lang: Lang): string {
  return new Intl.NumberFormat(getLocale(lang)).format(num);
}

// ============================================================================
// 🏗️ دوال Next.js Helpers
// ============================================================================

/**
 * توليد static params للصفحات ثنائية اللغة
 * تُستخدم في: generateStaticParams()
 * @example generateLangParams() => [{ lang: 'ar' }, { lang: 'en' }]
 */
export function generateLangParams(): Array<{ lang: Lang }> {
  return languages.map((lang) => ({ lang }));
}

/**
 * التحقق من الـ params في الصفحات الديناميكية
 * تُستخدم في: الصفحات التي تستقبل params
 * @example 
 * const { lang } = await params;
 * if (!isValidLangParam(lang)) notFound();
 */
export function isValidLangParam(lang: string): lang is Lang {
  return isValidLang(lang);
}

/**
 * الحصول على اللغة من الـ params مع fallback
 */
export function getSafeLang(lang: string | undefined): Lang {
  return isValidLang(lang) ? lang : defaultLang;
}

// ============================================================================
// 🎨 دوال العرض والـ UI
// ============================================================================

/**
 * اختيار النص المناسب حسب اللغة (بديل بسيط عن translations)
 * @example pickText('ar', { ar: 'مرحبا', en: 'Hello' }) => 'مرحبا'
 */
export function pickText(lang: Lang, text: { ar: string; en: string }): string {
  return lang === 'ar' ? text.ar : text.en;
}

/**
 * اختيار الأيقونة أو الرمز المناسب حسب اللغة (إن لزم)
 */
export function pickByLang<T>(lang: Lang, values: { ar: T; en: T }): T {
  return lang === 'ar' ? values.ar : values.en;
}

/**
 * الحصول على فئات CSS حسب اللغة (للـ RTL)
 * @example getLangClasses('ar') => 'text-right'
 */
export function getLangClasses(lang: Lang): {
  textAlign: string;
  flexDirection: string;
  paddingStart: string;
  paddingEnd: string;
} {
  if (lang === 'ar') {
    return {
      textAlign: 'text-right',
      flexDirection: 'flex-row',
      paddingStart: 'pr-',
      paddingEnd: 'pl-',
    };
  }
  return {
    textAlign: 'text-left',
    flexDirection: 'flex-row',
    paddingStart: 'pl-',
    paddingEnd: 'pr-',
  };
}

// ============================================================================
// 🔤 دوال النصوص المشتركة
// ============================================================================

/**
 * تحويل النص إلى صيغة slug مناسبة للروابط
 * @example slugify('مرحبا بالعالم') => 'mrhba-balaalm' (تقريبي)
 * @example slugify('Hello World') => 'hello-world'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '') // يدعم الحروف العربية
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * تقصير النص مع إضافة نقاط (للمقتطفات)
 * @example truncateText('نص طويل جداً...', 50) => 'نص طويل...'
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// ============================================================================
// 📦 تصديرات إضافية للتوافق مع الملفات القديمة
// ============================================================================

/**
 * @deprecated استخدم `languages` بدلاً منها
 */
export const supportedLanguages = languages;

/**
 * @deprecated استخدم `isValidLang` بدلاً منها
 */
export const validateLang = isValidLang;

/**
 * @deprecated استخدم `getDirection` بدلاً منها
 */
export const getTextDirection = getDirection;

// ============================================================================
// 🎯 تصدير افتراضي (اختياري - للاستخدام السريع)
// ============================================================================

const i18n = {
  languages,
  defaultLang,
  languagesMap,
  localeMap,
  directionMap,
  isValidLang,
  getDirection,
  getLocale,
  getLanguageName,
  getAlternateLang,
  getLocalizedPath,
  getLangFromPath,
  formatDate,
  formatHijriDate,
  formatTime,
  formatNumber,
  generateLangParams,
  getSafeLang,
  pickText,
  pickByLang,
};

export default i18n;