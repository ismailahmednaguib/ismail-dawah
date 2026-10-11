// lib/verse.ts
// آية اليوم: قائمة مراجع منتقاة، والنص بيتجاب من alquran.cloud ويتخزن 24 ساعة.
// لو الـ API وقع، بنرجع آية ثابتة بدل ما الصفحة تتكسر.
import type { Lang } from "@/lib/i18n";

export type DailyVerse = { text: string; source: string };

// مراجع (سورة:آية) — أضف أو احذف براحتك. تجنّب x:1 عشان البسملة.
const VERSE_REFS = [
  "2:255",
  "13:28",
  "94:6",
  "20:114",
  "39:53",
  "3:139",
  "2:152",
  "65:3",
  "93:3",
  "29:69",
  "2:286",
  "94:5",
] as const;

const FALLBACK: Record<Lang, DailyVerse> = {
  ar: {
    text: "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
    source: "سورة طه — الآية 114",
  },
  en: {
    text: "\u201CMy Lord, increase me in knowledge.\u201D",
    source: "Surah Taha — Verse 114",
  },
};

type AyahEdition = {
  text: string;
  numberInSurah: number;
  surah: { name: string; englishName: string };
};

export function getTodayVerseRef(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return VERSE_REFS[dayIndex % VERSE_REFS.length];
}

export async function getVerseOfTheDay(lang: Lang): Promise<DailyVerse> {
  const ref = getTodayVerseRef();

  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.sahih`,
      {
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!res.ok) return FALLBACK[lang];

    const json = (await res.json()) as { data?: AyahEdition[] };
    const [ar, en] = json.data ?? [];

    if (!ar?.text || !en?.text) return FALLBACK[lang];

    return lang === "ar"
      ? {
          text: `﴿ ${ar.text} ﴾`,
          source: `${ar.surah.name} — الآية ${ar.numberInSurah}`,
        }
      : {
          text: `\u201C${en.text}\u201D`,
          source: `Surah ${en.surah.englishName} — Verse ${en.numberInSurah}`,
        };
  } catch {
    return FALLBACK[lang];
  }
}