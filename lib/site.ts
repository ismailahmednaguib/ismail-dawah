// lib/site.ts
// إعدادات الموقع الموحدة — كل الثوابت في مكان واحد

import type { Lang } from "./i18n";

// ===== معلومات الموقع الأساسية =====
export const SITE_NAME = "إسماعيل أحمد نجيب";
export const SITE_NAME_EN = "Ismail Ahmed Naguib";
export const SITE_NAME_TRANSLATED: Record<Lang, string> = {
  ar: SITE_NAME,
  en: SITE_NAME_EN,
};

export const SITE_TAGLINE: Record<Lang, string> = {
  ar: "منصة دعوية شاملة",
  en: "Complete Dawah Platform",
};

export const SITE_DESCRIPTION: Record<Lang, string> = {
  ar: "منصة إسلامية شاملة تجمع القرآن والسنة والعلوم الشرعية وأدوات الدعوة في مكان واحد، بلغات متعددة.",
  en: "A comprehensive Islamic platform combining Quran, Sunnah, Islamic sciences and Dawah tools in one place, in multiple languages.",
};

// ===== الروابط الأساسية =====
export const SITE_URL = "https://ismailahmednaguib.vercel.app";
export const DEFAULT_LOCALE: Lang = "ar";
export const SUPPORTED_LOCALES: Lang[] = ["ar", "en"];

// ===== إعدادات الـ SEO =====
export const SEO = {
  defaultTitle: SITE_NAME,
  titleTemplate: "%s | " + SITE_NAME,
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
    "Islam",
    "Quran",
    "Adhkar",
    "Fatwa",
    "Dawah",
    "Prayer Times",
  ],
  author: SITE_NAME,
  twitterHandle: "@ismailnaguib",
};

// ===== روابط السوشيال ميديا =====
// غيّرها حسب حساباتك الفعلية
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/yourpage",
  twitter: "https://twitter.com/yourhandle",
  instagram: "https://instagram.com/yourhandle",
  youtube: "https://youtube.com/@yourchannel",
  tiktok: "https://tiktok.com/@yourhandle",
  whatsapp: "https://wa.me/201000000000", // رقم الواتساب بصيغة دولية
  telegram: "https://t.me/yourchannel",
  email: "mailto:your@email.com",
};

// ===== معلومات الاتصال =====
export const CONTACT_INFO = {
  email: "your@email.com",
  phone: "+20 100 000 0000",
  whatsapp: "+20 100 000 0000",
  location: {
    ar: "مصر",
    en: "Egypt",
  },
};

// ===== إعدادات الـ PWA =====
export const PWA_CONFIG = {
  name: SITE_NAME,
  shortName: "إسماعيل",
  description: SITE_DESCRIPTION.ar,
  themeColor: "#0e7490",
  backgroundColor: "#0a1628",
  display: "standalone",
  orientation: "portrait",
  startUrl: "/ar",
  scope: "/",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

// ===== إعدادات الهوية البصرية =====
export const BRAND_COLORS = {
  primary: "#0e7490", // الفيروزي الأساسي
  primaryLight: "#06b6d4",
  primaryDark: "#155e75",
  gold: "#d4af37", // الذهبي
  goldLight: "#fbbf24",
  goldDark: "#a16207",
  night: "#0a1628", // الليل
  nightLight: "#1e3a5f",
};

// ===== دوال مساعدة =====

/**
 * يرجع اسم الموقع حسب اللغة
 */
export function getSiteName(lang: Lang): string {
  return SITE_NAME_TRANSLATED[lang] || SITE_NAME_TRANSLATED.ar;
}

/**
 * يرجع وصف الموقع حسب اللغة
 */
export function getSiteDescription(lang: Lang): string {
  return SITE_DESCRIPTION[lang] || SITE_DESCRIPTION.ar;
}

/**
 * يرجع عنوان الصفحة الكامل مع اسم الموقع
 */
export function getPageTitle(pageTitle: string, lang: Lang): string {
  const siteName = getSiteName(lang);
  return pageTitle ? `${pageTitle} | ${siteName}` : siteName;
}

/**
 * يبني رابط كامل بالموقع
 */
export function getAbsoluteUrl(path: string): string {
  // بشيل الـ "/" الزيادة لو موجودة في أول الـ path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * يرجع رابط اللغة المقابلة
 */
export function getLocaleUrl(path: string, locale: Lang): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // بشيل اللغة القديمة من أول الرابط لو موجودة
  const pathWithoutLocale = cleanPath.replace(/^\/(ar|en)/, "");
  return `/${locale}${pathWithoutLocale || "/"}`;
}

/**
 * يرجع قائمة لغات الموقع لـ hreflang
 */
export function getAlternateLanguages(path: string) {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    url: getAbsoluteUrl(getLocaleUrl(path, locale)),
  }));
}