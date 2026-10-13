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