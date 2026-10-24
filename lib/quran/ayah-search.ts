// البحث داخل آيات السورة المحمّلة بالفعل — منطق نقي بلا شبكة.
import { normalizeArabicText } from "../references/quran.ts";
import type { Lang } from "../i18n.ts";

export type SearchableAyah = {
  numberInSurah: number;
  text: string;
  translation?: string;
};

export type AyahSearchMatch = SearchableAyah & {
  score: number;
};

function normalizeLatinText(value: string): string {
  return String(value ?? "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAyahSearchQuery(value: string, lang: Lang): string {
  return lang === "ar" ? normalizeArabicText(value) : normalizeLatinText(value);
}

/**
 * يختار الآيات المطابقة من السورة الموجودة في الصفحة.
 * لا يطلب مصدرًا خارجيًا ولا يخلط ترجمة أخرى باللغة الحالية.
 */
export function searchAyahs(
  ayahs: SearchableAyah[],
  query: string,
  lang: Lang,
  limit = 20,
): AyahSearchMatch[] {
  const normalizedQuery = normalizeAyahSearchQuery(query, lang);
  if (normalizedQuery.length < 2) return [];

  const matches = ayahs.flatMap((ayah) => {
    const source = lang === "ar" ? ayah.text : ayah.translation ?? "";
    const normalizedSource = normalizeAyahSearchQuery(source, lang);
    if (!normalizedSource.includes(normalizedQuery)) return [];

    const score = normalizedSource === normalizedQuery
      ? 0
      : normalizedSource.startsWith(normalizedQuery)
        ? 1
        : 2;

    return [{ ...ayah, score }];
  });

  return matches
    .sort((a, b) => a.score - b.score || a.numberInSurah - b.numberInSurah)
    .slice(0, Math.max(1, Math.min(50, Math.floor(limit))));
}
