// lib/site.ts
// إعدادات الموقع الموحدة — كل الثوابت في مكان واحد
// آمن للاستخدام في Server Components وClient Components طالما لا يحتوي أسرارًا خاصة.

import type { Lang } from "./i18n";

// ============================================================
// 🧰 Helpers
// ============================================================

function trimEnv(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSiteUrl(raw: string): string {
  const value = String(raw || "").trim();

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const pathname =
      url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");

    return `${url.origin}${pathname}`;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function ensureHttpUrl(raw: string): string {
  const value = String(raw || "").trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

// ============================================================
// 🌐 Site URL
// ============================================================

const ENV_SITE_URL = trimEnv(process.env.NEXT_PUBLIC_SITE_URL);
const VERCEL_URL_RAW = trimEnv(process.env.VERCEL_URL);

const FALLBACK_SITE_URL = "https://ismailahmednaguib.vercel.app";

/**
 * رابط الموقع الأساسي.
 *
 * الأولوية:
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. VERCEL_URL إذا كان موجودًا
 * 3. الرابط الاحتياطي
 *
 * على Vercel Production يُفضَّل ضبط:
 * NEXT_PUBLIC_SITE_URL=https://ismailahmednaguib.vercel.app
 *
 * أو إذا كان عندك دومين خاص:
 * NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 */
export const SITE_URL = normalizeSiteUrl(
  ENV_SITE_URL ||
    (VERCEL_URL_RAW ? ensureHttpUrl(VERCEL_URL_RAW) : FALLBACK_SITE_URL)
);

/**
 * دالة runtime آمنة إذا أردت استخدام رابط الموقع الحالي في المتصفح
 * أثناء التطوير المحلي بدون ضبط NEXT_PUBLIC_SITE_URL.
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined" && !ENV_SITE_URL) {
    return normalizeSiteUrl(window.location.origin);
  }

  return SITE_URL;
}

// ============================================================
// 🏷️ Names & Branding
// ============================================================

export const SITE_NAME = "إسماعيل أحمد نجيب";
export const SITE_NAME_EN = "Ismail Ahmed Naguib";

export const SITE_TAGLINE: Record<Lang, string> = {
  ar: "منصة دعوية شاملة",
  en: "Complete Dawah Platform",
};

/**
 * الاسم الكامل للعلامة التجارية:
 * إسماعيل أحمد نجيب | منصة دعوية شاملة
 */
export const SITE_BRAND: Record<Lang, string> = {
  ar: `${SITE_NAME} | ${SITE_TAGLINE.ar}`,
  en: `${SITE_NAME_EN} | ${SITE_TAGLINE.en}`,
};

export const SITE_NAME_TRANSLATED: Record<Lang, string> = {
  ar: SITE_NAME,
  en: SITE_NAME_EN,
};

// ============================================================
// 📝 Descriptions
// ============================================================

export const SITE_DESCRIPTION: Record<Lang, string> = {
  ar: "منصة إسلامية شاملة تجمع القرآن والسنة والعلوم الشرعية وأدوات الدعوة في مكان واحد، بلغتين وتصميم متجاوب.",
  en: "A comprehensive Islamic platform combining Quran, Sunnah, Islamic sciences and Dawah tools in one place, bilingual and responsive.",
};

export const SITE_SHORT_DESCRIPTION: Record<Lang, string> = {
  ar: "نور العلم بين يديك.",
  en: "The light of knowledge in your hands.",
};

// ============================================================
// 🌍 Locales
// ============================================================

export const DEFAULT_LOCALE: Lang = "ar";

export const SUPPORTED_LOCALES: readonly Lang[] = ["ar", "en"];

export const LOCALE_NAMES: Record<Lang, string> = {
  ar: "العربية",
  en: "English",
};

export const LOCALE_DIRECTIONS: Record<Lang, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

/**
 * قيم lang المناسبة لعنصر <html>
 */
export const HTML_LANG: Record<Lang, string> = {
  ar: "ar",
  en: "en",
};

/**
 * قيم locale المناسبة لـ Open Graph
 */
export const OPEN_GRAPH_LOCALE: Record<Lang, string> = {
  ar: "ar_EG",
  en: "en_US",
};

// ============================================================
// 🔍 SEO Defaults
// ============================================================

export const SEO = {
  /**
   * العنوان الافتراضي للموقع.
   */
  defaultTitle: SITE_BRAND.ar,

  /**
   * قالب عناوين الصفحات.
   * مثال:
   *فضل سورة الكهف | إسماعيل أحمد نجيب
   */
  titleTemplate: `%s | ${SITE_NAME}`,

  defaultDescription: SITE_DESCRIPTION.ar,

  siteUrl: SITE_URL,

  keywords: [
    "إسلام",
    "قرآن",
    "أذكار",
    "فتاوى",
    "مواقيت الصلاة",
    "القبلة",
    "دعوة",
    "الإسلام",
    "قصص الأنبياء",
    "الرقية الشرعية",
    "حاسبة الزكاة",
    "دليل الحج",
    "Islam",
    "Quran",
    "Adhkar",
    "Fatwa",
    "Dawah",
    "Prayer Times",
    "Qibla",
    "Islamic Platform",
  ],

  author: SITE_NAME,

  twitterHandle: "@ismailnaguib",

  twitterCard: "summary_large_image" as const,

  locale: OPEN_GRAPH_LOCALE,
};

// ============================================================
// 🔗 Social Links
// ============================================================

/**
 * روابط السوشيال ميديا.
 *
 * ⚠️ مهم جدًا:
 * استبدل القيم الافتراضية بحساباتك الفعلية، أو اضبط متغيرات البيئة:
 *
 * NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/yourrealpage
 * NEXT_PUBLIC_SOCIAL_TWITTER=https://x.com/yourrealhandle
 * NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/yourrealhandle
 * NEXT_PUBLIC_SOCIAL_YOUTUBE=https://youtube.com/@yourrealchannel
 * NEXT_PUBLIC_SOCIAL_TIKTOK=https://tiktok.com/@yourrealhandle
 * NEXT_PUBLIC_SOCIAL_TELEGRAM=https://t.me/yourrealchannel
 * NEXT_PUBLIC_WHATSAPP_NUMBER=201000000000
 * NEXT_PUBLIC_CONTACT_EMAIL=real@email.com
 */

const socialFacebook = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK);
const socialTwitter = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_TWITTER);
const socialInstagram = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM);
const socialYoutube = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE);
const socialTiktok = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK);
const socialTelegram = trimEnv(process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM);

const contactEmail =
  trimEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || "your@email.com";

const contactPhoneRaw =
  trimEnv(process.env.NEXT_PUBLIC_CONTACT_PHONE) || "+20 100 000 0000";

const whatsappNumberEnv = trimEnv(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
const whatsappDigits =
  digitsOnly(whatsappNumberEnv) || digitsOnly(contactPhoneRaw);

export const SOCIAL_LINKS = {
  facebook: socialFacebook || "https://facebook.com/yourpage",
  twitter: socialTwitter || "https://twitter.com/yourhandle",
  x: socialTwitter || "https://x.com/yourhandle",
  instagram: socialInstagram || "https://instagram.com/yourhandle",
  youtube: socialYoutube || "https://youtube.com/@yourchannel",
  tiktok: socialTiktok || "https://tiktok.com/@yourhandle",
  whatsapp: whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : "https://wa.me/201000000000",
  telegram: socialTelegram || "https://t.me/yourchannel",
  email: contactEmail ? `mailto:${contactEmail}` : "mailto:your@email.com",
};

// ============================================================
// ☎️ Contact Info
// ============================================================

export const CONTACT_INFO = {
  email: contactEmail,
  phone: contactPhoneRaw,
  whatsapp: whatsappDigits ? `+${whatsappDigits}` : contactPhoneRaw,
  whatsappLink: SOCIAL_LINKS.whatsapp,
  location: {
    ar: trimEnv(process.env.NEXT_PUBLIC_CONTACT_LOCATION_AR) || "مصر",
    en: trimEnv(process.env.NEXT_PUBLIC_CONTACT_LOCATION_EN) || "Egypt",
  },
};

// ============================================================
// 📱 PWA Config
// ============================================================

export const PWA_CONFIG = {
  name: SITE_BRAND.ar,
  shortName: "إسماعيل",
  description: SITE_DESCRIPTION.ar,

  /**
   * متوافق مع globals.css:
   * --color-primary-700: #0e7490
   */
  themeColor: "#0e7490",

  /**
   * متوافق مع خلفية الموقع الفاتحة:
   * body background-color: #f8fafc
   */
  backgroundColor: "#f8fafc",

  display: "standalone" as const,
  orientation: "portrait-primary" as const,

  startUrl: `/${DEFAULT_LOCALE}`,
  scope: "/",

  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

// ============================================================
// 🎨 Brand Colors
// ============================================================

export const BRAND_COLORS = {
  /**
   * الفيروزي الأساسي — مطابق لـ primary-700 في globals.css
   */
  primary: "#0e7490",

  /**
   * فيروزي فاتح — مطابق لـ primary-500
   */
  primaryLight: "#06b6d4",

  /**
   * فيروزي داكن — مطابق لـ primary-800
   */
  primaryDark: "#155e75",

  /**
   * الذهبي الأساسي — مطابق لـ gold-500
   */
  gold: "#d4af37",

  /**
   * ذهبي فاتح — مطابق لـ gold-400
   */
  goldLight: "#fbbf24",

  /**
   * ذهبي داكن — قريب من gold-700/800
   */
  goldDark: "#a16207",

  /**
   * الليل الداكن — مطابق لـ night-900
   */
  night: "#0a1628",

  /**
   * أزرق ليلي أفتح قليلًا
   */
  nightLight: "#1e3a5f",

  /**
   * الخلفية الفاتحة للموقع
   */
  backgroundLight: "#f8fafc",

  /**
   * النص الداكن الأساسي
   */
  textDark: "#1e293b",
};

// ============================================================
// 🧭 Path Helpers
// ============================================================

/**
 * Regex آمن للتعرف على بادئة اللغة.
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

function normalizePath(path?: string | null): string {
  if (!path) {
    return "/";
  }

  let p = String(path).trim();

  // إذا كان رابطًا مطلقًا، استخرج المسار فقط
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      p = "/";
    }
  }

  // إزالة الاستعلام والـ hash
  p = p.split(/[?#]/)[0] || "/";

  if (!p.startsWith("/")) {
    p = `/${p}`;
  }

  // منع الـ double slash
  p = p.replace(/\/{2,}/g, "/");

  // إزالة الشرطة الأخيرة إلا للجذر
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }

  return p || "/";
}

function stripLocalePrefix(path: string): string {
  const withoutLang = path.replace(LANG_PREFIX_REGEX, "");
  return withoutLang || "/";
}

/**
 * إرجاع المسار بدون بادئة اللغة.
 *
 * أمثلة:
 * /ar/quran => /quran
 * /en/about => /about
 * / => /
 */
export function getPathWithoutLocale(path: string): string {
  return stripLocalePrefix(normalizePath(path));
}

/**
 * بناء رابط مطلق على الموقع.
 *
 * أمثلة:
 * getAbsoluteUrl("/") => https://...
 * getAbsoluteUrl("/ar/quran") => https://.../ar/quran
 */
export function getAbsoluteUrl(path: string): string {
  const raw = String(path || "").trim();

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const cleanPath = normalizePath(raw);

  if (cleanPath === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${cleanPath}`;
}

/**
 * تحويل مسار إلى لغة معينة.
 *
 * أمثلة:
 * getLocaleUrl("/", "ar") => /ar
 * getLocaleUrl("/", "en") => /en
 * getLocaleUrl("/ar/quran", "en") => /en/quran
 * getLocaleUrl("/quran", "ar") => /ar/quran
 */
export function getLocaleUrl(path: string, locale: Lang): string {
  const withoutLocale = stripLocalePrefix(normalizePath(path));

  if (withoutLocale === "/") {
    return `/${locale}`;
  }

  return `/${locale}${withoutLocale}`;
}

/**
 * للتوافق مع الكود القديم.
 *
 * يرجع مصفوفة:
 * [
 *   { locale: "ar", url: "https://.../ar/..." },
 *   { locale: "en", url: "https://.../en/..." }
 * ]
 */
export function getAlternateLanguages(path: string) {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    url: getAbsoluteUrl(getLocaleUrl(path, locale)),
  }));
}

/**
 * صيغة مناسبة لـ Next.js metadata.alternates.languages
 *
 * مثال:
 * {
 *   ar: "https://.../ar/quran",
 *   en: "https://.../en/quran",
 *   "x-default": "https://.../ar/quran"
 * }
 */
export function getHreflangLanguages(
  path: string
): Record<Lang | "x-default", string> {
  const normalized = normalizePath(path);

  return {
    ar: getAbsoluteUrl(getLocaleUrl(normalized, "ar")),
    en: getAbsoluteUrl(getLocaleUrl(normalized, "en")),
    "x-default": getAbsoluteUrl(getLocaleUrl(normalized, DEFAULT_LOCALE)),
  };
}

// ============================================================
// 🧠 Content Helpers
// ============================================================

/**
 * يرجع اسم الموقع المختصر حسب اللغة.
 */
export function getSiteName(lang: Lang): string {
  return SITE_NAME_TRANSLATED[lang] || SITE_NAME_TRANSLATED.ar;
}

/**
 * يرجع الاسم الكامل للعلامة التجارية حسب اللغة.
 */
export function getSiteBrand(lang: Lang): string {
  return SITE_BRAND[lang] || SITE_BRAND.ar;
}

/**
 * يرجع وصف الموقع المختصر/الشعار حسب اللغة.
 */
export function getSiteTagline(lang: Lang): string {
  return SITE_TAGLINE[lang] || SITE_TAGLINE.ar;
}

/**
 * يرجع وصف الموقع الكامل حسب اللغة.
 */
export function getSiteDescription(lang: Lang): string {
  return SITE_DESCRIPTION[lang] || SITE_DESCRIPTION.ar;
}

/**
 * يرجع وصفًا قصيرًا مناسبًا للـ hero أو meta قصيرة.
 */
export function getSiteShortDescription(lang: Lang): string {
  return SITE_SHORT_DESCRIPTION[lang] || SITE_SHORT_DESCRIPTION.ar;
}

/**
 * يرجع اتجاه الصفحة حسب اللغة.
 */
export function getSiteDirection(lang: Lang): "rtl" | "ltr" {
  return LOCALE_DIRECTIONS[lang] || LOCALE_DIRECTIONS.ar;
}

/**
 * يرجع قيمة lang المناسبة لعنصر <html>.
 */
export function getHtmlLang(lang: Lang): string {
  return HTML_LANG[lang] || HTML_LANG.ar;
}

/**
 * يرجع locale المناسب لـ Open Graph.
 */
export function getOpenGraphLocale(lang: Lang): string {
  return OPEN_GRAPH_LOCALE[lang] || OPEN_GRAPH_LOCALE.ar;
}

/**
 * يبني عنوان الصفحة الكامل.
 *
 * إذا لم يوجد عنوان صفحة، يرجع Brand الكامل.
 */
export function getPageTitle(pageTitle: string, lang: Lang): string {
  const cleanTitle = String(pageTitle || "").trim();

  if (!cleanTitle) {
    return getSiteBrand(lang);
  }

  const siteName = getSiteName(lang);

  if (cleanTitle.includes(siteName)) {
    return cleanTitle;
  }

  return `${cleanTitle} | ${siteName}`;
}

/**
 * يرجع رابط التواصل حسب اللغة.
 */
export function getContactLocation(lang: Lang): string {
  return CONTACT_INFO.location[lang] || CONTACT_INFO.location.ar;
}

// ============================================================
// 📦 Default Export
// ============================================================

const site = {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_BRAND,
  SITE_NAME_TRANSLATED,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_SHORT_DESCRIPTION,

  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  LOCALE_DIRECTIONS,
  HTML_LANG,
  OPEN_GRAPH_LOCALE,

  SEO,
  SOCIAL_LINKS,
  CONTACT_INFO,
  PWA_CONFIG,
  BRAND_COLORS,

  getSiteUrl,
  getPathWithoutLocale,
  getAbsoluteUrl,
  getLocaleUrl,
  getAlternateLanguages,
  getHreflangLanguages,

  getSiteName,
  getSiteBrand,
  getSiteTagline,
  getSiteDescription,
  getSiteShortDescription,
  getSiteDirection,
  getHtmlLang,
  getOpenGraphLocale,
  getPageTitle,
  getContactLocation,
};

export default site;