// lib/i18n.ts
// نظام الترجمة الأساسي للمنصة

import { translations } from './translations';

// ===== اللغات المدعومة =====
export const languages = ['ar', 'en'] as const;
export type Lang = (typeof languages)[number];

// ===== اللغة الافتراضية =====
export const defaultLang: Lang = 'ar';

// ===== أسماء اللغات =====
export const langNames: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
};

// ===== اتجاه اللغات =====
export const langDirection: Record<Lang, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

// ===== فحص صحة اللغة =====
export function isValidLang(lang: string): lang is Lang {
  return (languages as readonly string[]).includes(lang);
}

// ===== الحصول على الاتجاه =====
export function getDirection(lang: string): 'rtl' | 'ltr' {
  return isValidLang(lang) ? langDirection[lang] : 'rtl';
}

// ===== هل اللغة هي الافتراضية؟ =====
export function isDefaultLang(lang: string): boolean {
  return lang === defaultLang;
}

// ===== دالة الترجمة الأساسية =====
export function t(lang: Lang, key: string): string {
  // جرب اللغة المطلوبة
  const langTranslations = translations[lang];
  if (langTranslations && key in langTranslations) {
    return langTranslations[key];
  }

  // لو مش لاقي، جرب اللغة الافتراضية
  const defaultTranslations = translations[defaultLang];
  if (defaultTranslations && key in defaultTranslations) {
    return defaultTranslations[key];
  }

  // لو مش لاقي خالص، ارجع المفتاح نفسه
  return key;
}

// ===== دالة الترجمة مع متغيرات =====
// مثال: t(lang, "welcome", { name: "أحمد" })
// النص: "مرحباً {name}"
export function tWithParams(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = t(lang, key);
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    });
  }
  return text;
}

// ===== الحصول على اللغة الأخرى =====
export function getOtherLang(lang: Lang): Lang {
  return lang === 'ar' ? 'en' : 'ar';
}

// ===== بناء رابط بلغة مختلفة =====
export function switchLangPath(currentPath: string, targetLang: Lang): string {
  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLang(segments[0])) {
    segments[0] = targetLang;
  } else {
    segments.unshift(targetLang);
  }
  return '/' + segments.join('/');
}