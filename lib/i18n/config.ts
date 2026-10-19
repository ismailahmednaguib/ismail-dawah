// lib/i18n/config.ts

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
  enabled: boolean;
  locale: string; // للتنسيقات (تواريخ، أرقام)
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', enabled: true, locale: 'ar-EG' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', enabled: true, locale: 'en-US' },
  // تُفعّل بعد اكتمال ترجمة الصفحات والمسارات؛ المسارات المنشورة حاليًا ar/en فقط.
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr', enabled: false, locale: 'fr-FR' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', enabled: false, locale: 'id-ID' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl', enabled: false, locale: 'ur-PK' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr', enabled: false, locale: 'tr-TR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr', enabled: false, locale: 'es-ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr', enabled: false, locale: 'de-DE' },
];

export const DEFAULT_LANGUAGE = 'ar';
export const ENABLED_LANGUAGES = LANGUAGES.filter(l => l.enabled);
export const ENABLED_LANGUAGE_CODES = ENABLED_LANGUAGES.map(l => l.code);

export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return LANGUAGES.find(l => l.code === code);
}

export function isValidLanguage(code: string): boolean {
  return ENABLED_LANGUAGE_CODES.includes(code);
}

export function getDirection(code: string): 'rtl' | 'ltr' {
  return getLanguageConfig(code)?.dir ?? 'ltr';
}

export function getLocale(code: string): string {
  return getLanguageConfig(code)?.locale ?? 'en-US';
}

/**
 * لغة الزائر من ترويسة Accept-Language، باختيار أعلى أولوية بين العربية والإنجليزية.
 * تُستخدم في توجيه الجذر فقط؛ بقية المسارات تبقى افتراضية.
 */
export function preferredLanguageFromHeader(
  header: string | null | undefined
): 'ar' | 'en' {
  if (!header) return 'ar';

  const entries = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((param) => param.trim().startsWith('q='));
      const q = qParam ? Number(qParam.split('=')[1]) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const entry of entries) {
    if (entry.tag === 'en' || entry.tag.startsWith('en-')) return 'en';
    if (entry.tag === 'ar' || entry.tag.startsWith('ar-')) return 'ar';
  }

  return 'ar';
}
