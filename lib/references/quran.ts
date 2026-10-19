// lib/references/quran.ts
// مطابقة الاقتباسات القرآنية بنص المصحف — منطق نقي بلا قاعدة بيانات أو شبكة.
// الفكرة: تجريد التشكيل وعلامات الوقف، ثم البحث عن الاقتباس داخل آيات المصحف.

export type QuranVerse = {
  surah: number;
  ayah: number;
  text: string;
};

export type IndexedVerse = QuranVerse & { norm: string };

export type QuranMatch = {
  verse: QuranVerse;
  /** المقاطع التي طُوبقت فعلًا (بعد التجريد). */
  fragments: string[];
  /** عدد الآيات المرشّحة قبل الحسم؛ ١ يعني مطابقة قاطعة. */
  candidates: number;
};

export type QuotedSpan = {
  text: string;
  start: number;
  end: number;
};

export type QuoteContext = 'quran' | 'hadith' | 'unknown';

const QURAN_MARKERS = [
  'قال تعالى',
  'قال الله',
  'قوله تعالى',
  'تبارك وتعالى',
  'عز وجل',
  'في كتابه',
  'القرآن الكريم',
  'تعالى',
];

const HADITH_MARKERS = [
  'صلى الله عليه وسلم',
  'رسول الله',
  'النبي',
  'رواه',
  'أخرجه',
  'الترمذي',
  'الحديث',
  'ﷺ',
];

/** تجريد التشكيل وعلامات الوقف وتوحيد الحروف لأجل المطابقة. */
export function normalizeArabicText(input: string): string {
  return String(input ?? '')
    .replace(/[\uFEFF\u200B-\u200F\u202A-\u202E\u2060]/g, '')
    // الألف الخنجرية لا تُكتب في الإملاء الحديث: إِلَٰهَ ← إله · هَٰذَا ← هذا
    .replace(/\u0670/g, '')
    // تشكيل وعلامات قرآنية ومدة وصل
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g, '')
    .replace(/[﴿﴾«»"'“”‘’()[\]{}]/g, ' ')
    .replace(/[آأإٱا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** كل الاقتباسات المحصورة بعلامات تنصيص عربية أو إنجليزية. */
export function extractQuotedSpans(body: string): QuotedSpan[] {
  const spans: QuotedSpan[] = [];
  const regex = /[«"“]([^»"”]{4,600})[»"”]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    const inner = match[1];
    const offset = match.index + 1;
    spans.push({
      text: inner.trim(),
      start: offset,
      end: offset + inner.length,
    });
  }

  return spans;
}

/**
 * تصنيف الاقتباس من أقرب إشارة تسبقه (قرآن أو حديث).
 * يتجاهل الإشارات البعيدة أكثر من النافذة المحددة.
 */
export function classifyQuoteContext(
  body: string,
  quoteStart: number,
  windowSize = 140
): QuoteContext {
  const from = Math.max(0, quoteStart - windowSize);
  const before = body.slice(from, quoteStart);

  let lastQuran = -1;
  let lastHadith = -1;

  for (const marker of QURAN_MARKERS) {
    const idx = before.lastIndexOf(marker);
    if (idx > lastQuran) lastQuran = idx;
  }

  for (const marker of HADITH_MARKERS) {
    const idx = before.lastIndexOf(marker);
    if (idx > lastHadith) lastHadith = idx;
  }

  if (lastQuran < 0 && lastHadith < 0) return 'unknown';
  if (lastHadith > lastQuran) return 'hadith';
  return 'quran';
}

/** تقسيم الاقتباس عند مواضع الحذف (...) إلى مقاطع قابلة للبحث. */
export function splitQuoteFragments(quote: string): string[] {
  return quote
    .split(/\.{2,}|…|\[\.\.\.\]|\(\.\.\.\)|﴿|﴾/g)
    .map((part) => normalizeArabicText(part))
    .filter((part) => part.length >= 8);
}

export function buildVerseIndex(verses: QuranVerse[]): IndexedVerse[] {
  return verses.map((verse) => ({ ...verse, norm: normalizeArabicText(verse.text) }));
}

/**
 * يبحث عن الآية التي يطابق نصّها كل مقاطع الاقتباس.
 * يعيد null عند الغموض أو عدم وجود مطابقة، ولا يخمّن أبدًا.
 */
export function matchQuranQuote(
  quote: string,
  index: IndexedVerse[]
): QuranMatch | null {
  const fragments = splitQuoteFragments(quote);
  if (fragments.length === 0) return null;

  let candidates = index.filter((verse) => verse.norm.includes(fragments[0]));
  const used = [fragments[0]];

  for (const fragment of fragments.slice(1)) {
    const narrowed = candidates.filter((verse) => verse.norm.includes(fragment));
    if (narrowed.length > 0) {
      candidates = narrowed;
      used.push(fragment);
    }
  }

  if (candidates.length === 1) {
    return { verse: stripNorm(candidates[0]), fragments: used, candidates: 1 };
  }

  // احتياط: أطول مقطع وحده، بشرط طول كافٍ يمنع المطابقات الشائعة.
  const longest = [...fragments].sort((a, b) => b.length - a.length)[0];
  if (longest && longest.length >= 20) {
    const byLongest = index.filter((verse) => verse.norm.includes(longest));
    if (byLongest.length === 1) {
      return {
        verse: stripNorm(byLongest[0]),
        fragments: [longest],
        candidates: 1,
      };
    }
    if (byLongest.length > 1) return null;
  }

  if (candidates.length > 1) return null;
  return null;
}

function stripNorm(verse: IndexedVerse): QuranVerse {
  return { surah: verse.surah, ayah: verse.ayah, text: verse.text };
}
