// lib/translations/types.ts

export type LanguageCode = 'ar' | 'en' | 'fr' | 'id' | 'ur' | 'tr' | 'es' | 'de';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
  enabled: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', enabled: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr', enabled: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', enabled: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl', enabled: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr', enabled: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr', enabled: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr', enabled: false },
];

export type TranslationStatus = 'not_started' | 'machine_translated' | 'in_progress' | 'reviewed' | 'published';

export interface TranslationMeta {
  content_id: string;
  lang: LanguageCode;
  status: TranslationStatus;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  updated_at: string;
}

export interface TranslationRow {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  body_plain: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentTranslationMatrix {
  content_id: string;
  content_type: string;
  original_lang: string;
  original_title: string;
  translations: Record<string, {
    exists: boolean;
    status: TranslationStatus;
    title?: string;
    slug?: string;
    updated_at?: string;
  }>;
}

export interface TranslationStats {
  total_content: number;
  by_language: Record<string, {
    translated: number;
    machine_translated: number;
    reviewed: number;
    not_started: number;
    coverage_percent: number;
  }>;
}