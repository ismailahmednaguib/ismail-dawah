import type { Lang } from "../i18n.ts";
import { getSurahByNumber } from "../data.ts";

export type QuranApiMatch = {
  number?: number;
  numberInSurah?: number;
  text?: string;
  surah?: {
    number?: number;
    name?: string;
    englishName?: string;
  };
};

export type QuranSearchResult = {
  id: string;
  type: "quran_ayah";
  title: string;
  summary: string;
  url: string;
};

export function normalizeQuranSearchQuery(value: string): string {
  return String(value ?? "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function mapQuranSearchResults(
  matches: QuranApiMatch[],
  lang: Lang,
  limit = 20,
): QuranSearchResult[] {
  return matches.flatMap((match) => {
    const surahNumber = Number(match.surah?.number);
    const ayahNumber = Number(match.numberInSurah);
    const summary = typeof match.text === "string" ? match.text.trim() : "";
    const surah = getSurahByNumber(surahNumber);

    if (!surah || !Number.isInteger(ayahNumber) || ayahNumber < 1 || !summary) {
      return [];
    }

    const surahName = lang === "ar" ? surah.arabicName : surah.englishName;
    const title = lang === "ar"
      ? `سورة ${surahName} — آية ${ayahNumber}`
      : `Surah ${surahName} — Ayah ${ayahNumber}`;

    return [{
      id: `quran-ayah-${surahNumber}-${ayahNumber}`,
      type: "quran_ayah" as const,
      title,
      summary,
      url: `/${lang}/quran/${surahNumber}#ayah-${ayahNumber}`,
    }];
  }).slice(0, Math.max(1, Math.min(50, Math.floor(limit))));
}
