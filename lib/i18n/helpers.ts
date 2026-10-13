// lib/i18n/helpers.ts
import { ENABLED_LANGUAGE_CODES, DEFAULT_LANGUAGE, isValidLanguage } from './config';

/**
 * توليد hrefs لكل اللغات المتاحة لصفحة معينة
 */
export function getAlternateLanguages(path: string): { lang: string; href: string }[] {
  const basePath = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app';
  
  return ENABLED_LANGUAGE_CODES.map(code => ({
    lang: code,
    href: `${basePath}/${code}${path}`,
  }));
}

/**
 * توليد رابط بديل للغة
 */
export function getLocalizedPath(path: string, lang: string): string {
  if (!isValidLanguage(lang)) lang = DEFAULT_LANGUAGE;
  return `/${lang}${path}`;
}

/**
 * تنسيق التاريخ حسب اللغة
 */
export function formatDate(date: string | Date, lang: string): string {
  const locales: Record<string, string> = {
    ar: 'ar-EG',
    en: 'en-US',
    fr: 'fr-FR',
    id: 'id-ID',
    ur: 'ur-PK',
    tr: 'tr-TR',
  };

  return new Date(date).toLocaleDateString(locales[lang] ?? 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق الأرقام حسب اللغة
 */
export function formatNumber(num: number, lang: string): string {
  const locales: Record<string, string> = {
    ar: 'ar-EG',
    en: 'en-US',
  };
  return new Intl.NumberFormat(locales[lang] ?? 'en-US').format(num);
}