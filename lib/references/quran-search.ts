// lib/references/quran-search.ts
// بحث محلي في أسماء السور وأرقامها ومعانيها الإنجليزية — منطق نقي بلا قاعدة بيانات أو شبكة.
// لا يبحث في نص الآيات؛ نص المصحف يأتي من مصدره في صفحة القرآن. الهدف هنا
// أن يعمل مرشّح «القرآن» في البحث العام بدل الاعتماد على جدول quran_verses
// غير الموجود، وأن يعيد رابطًا صحيحًا لصفحة السورة.
import type { Lang } from '../i18n';
import { SURAHS, type SurahInfo } from './display.ts';
import { SURAH_MEANINGS_EN } from './surah-meanings.ts';
import { normalizeArabicText } from './quran.ts';

export type SurahSearchMatch = {
  number: number;
  title: string;
  summary: string;
};

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toArabicDigits(value: number): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)] ?? digit);
}

/** صيغة عدد الآيات بالعربية: ١ آية · ٢ آيتان · ٣–١٠ آيات · ١١+ آية. */
function arabicAyahLabel(count: number): string {
  if (count === 1) return 'آية واحدة';
  if (count === 2) return 'آيتان';
  if (count >= 3 && count <= 10) return `${toArabicDigits(count)} آيات`;
  return `${toArabicDigits(count)} آية`;
}

/** يحوّل الأرقام العربية/الفارسية إلى أرقام لاتينية قبل مطابقة رقم السورة. */
function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

/** توحيد الاسم الإنجليزي: حروف صغيرة، بلا تشكيل، والشرطات فواصل. */
function normalizeLatin(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compact(value: string): string {
  return value.replace(/\s+/g, '');
}

// كلمات وظيفية لا تصلح وحدها للبحث في معاني السور؛ حذفها يجعل «The Cave»
// و«cave» متطابقين، ويمنع أن يعيد البحث عن «the» أو «of» معظم السور.
const MEANING_STOP_WORDS = new Set(['a', 'an', 'and', 'in', 'of', 'the']);

function stripMeaningStopWords(input: string): string {
  return input
    .split(' ')
    .filter((word) => word && !MEANING_STOP_WORDS.has(word))
    .join(' ');
}

function matchScore(
  surah: SurahInfo,
  arabicQuery: string,
  latinQuery: string,
  numberQuery: number | null
): number | null {
  if (numberQuery !== null && surah.n === numberQuery) return 0;

  const arabicName = normalizeArabicText(surah.ar);
  const latinName = normalizeLatin(surah.en);
  const latinMeaning = stripMeaningStopWords(
    normalizeLatin(SURAH_MEANINGS_EN[surah.n] ?? '')
  );
  const meaningQuery = stripMeaningStopWords(latinQuery);

  if (
    arabicQuery &&
    (arabicName === arabicQuery || compact(arabicName) === compact(arabicQuery))
  ) {
    return 1;
  }
  if (
    latinQuery &&
    (latinName === latinQuery || compact(latinName) === compact(latinQuery))
  ) {
    return 1;
  }

  if (arabicQuery && arabicName.startsWith(arabicQuery)) return 2;
  if (latinQuery && latinName.startsWith(latinQuery)) return 2;

  if (arabicQuery && arabicName.includes(arabicQuery)) return 3;
  if (
    latinQuery &&
    (latinName.includes(latinQuery) ||
      compact(latinName).includes(compact(latinQuery)))
  ) {
    return 3;
  }

  // معاني الأسماء الإنجليزية بعد مطابقات الاسم نفسها، فلا يسبق المعنى
  // الاسمَ المطابق عند البحث باسم سورة أو بجزء منه.
  if (
    meaningQuery &&
    latinMeaning &&
    (latinMeaning === meaningQuery ||
      compact(latinMeaning) === compact(meaningQuery))
  ) {
    return 4;
  }
  if (meaningQuery && latinMeaning.startsWith(meaningQuery)) return 5;
  if (
    meaningQuery &&
    latinMeaning &&
    (latinMeaning.includes(meaningQuery) ||
      compact(latinMeaning).includes(compact(meaningQuery)))
  ) {
    return 6;
  }

  return null;
}

/**
 * يعيد كل السور المطابقة مرتبة: تطابق الرقم/الاسم التام أولًا، ثم البداية،
 * ثم الاحتواء. العربية تطابق الأسماء العربية، والإنجليزية تطابق الأسماء
 * الإنجليزية ومعانيها الشائعة (The Cave ← الكهف)، والرقم يعمل في اللغتين.
 * النتائج تحمل عنوانًا وملخصًا باللغة المطلوبة فقط، فلا تتسرب أسماء عربية
 * إلى الواجهة الإنجليزية.
 */
export function searchSurahs(query: string, lang: Lang): SurahSearchMatch[] {
  const trimmed = String(query ?? '').trim();
  if (!trimmed) return [];

  const arabicQuery = normalizeArabicText(trimmed);
  const latinQuery = normalizeLatin(trimmed);
  const digits = normalizeDigits(trimmed);
  const numberQuery = /^\d+$/.test(digits) ? Number(digits) : null;

  return SURAHS.map((surah) => {
    const score = matchScore(surah, arabicQuery, latinQuery, numberQuery);
    return score === null ? null : { surah, score };
  })
    .filter((item): item is { surah: SurahInfo; score: number } => item !== null)
    .sort((a, b) => a.score - b.score || a.surah.n - b.surah.n)
    .map(({ surah }) => ({
      number: surah.n,
      title: lang === 'ar' ? `سورة ${surah.ar}` : `Surah ${surah.en}`,
      summary:
        lang === 'ar'
          ? arabicAyahLabel(surah.a)
          : `${surah.a} ${surah.a === 1 ? 'verse' : 'verses'}`,
    }));
}
