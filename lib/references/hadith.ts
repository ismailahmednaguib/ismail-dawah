// lib/references/hadith.ts
// مطابقة الاقتباسات الحديثية بنصوص كتب السنة — منطق نقي بلا شبكة أو قاعدة بيانات.
import { normalizeArabicText, splitQuoteFragments } from './quran.ts';

export type HadithBook =
  | 'bukhari'
  | 'muslim'
  | 'abudawud'
  | 'tirmidhi'
  | 'nasai'
  | 'ibnmajah'
  | 'malik';

export const HADITH_BOOK_NAMES: Record<HadithBook, string> = {
  bukhari: 'صحيح البخاري',
  muslim: 'صحيح مسلم',
  abudawud: 'سنن أبي داود',
  tirmidhi: 'سنن الترمذي',
  nasai: 'سنن النسائي',
  ibnmajah: 'سنن ابن ماجه',
  malik: 'موطأ مالك',
};

const HADITH_BOOK_ALIASES: Array<{ book: HadithBook; aliases: string[] }> = [
  { book: 'bukhari', aliases: ['صحيح البخاري', 'البخاري'] },
  {
    book: 'muslim',
    aliases: ['صحيح مسلم', 'رواه مسلم', 'أخرجه مسلم', 'الإمام مسلم', 'عند مسلم'],
  },
  { book: 'abudawud', aliases: ['سنن أبي داود', 'أبي داود', 'أبو داود', 'ابو داود'] },
  { book: 'tirmidhi', aliases: ['سنن الترمذي', 'الترمذي'] },
  { book: 'nasai', aliases: ['سنن النسائي', 'النسائي'] },
  { book: 'ibnmajah', aliases: ['سنن ابن ماجه', 'سنن ابن ماجة', 'ابن ماجه', 'ابن ماجة'] },
  { book: 'malik', aliases: ['موطأ مالك', 'الإمام مالك', 'مالك بن أنس'] },
];

export type HadithRecord = {
  book: HadithBook;
  number: number;
  text: string;
};

export type IndexedHadith = HadithRecord & { norm: string };

export type HadithMatch = {
  hadith: HadithRecord;
  /** المقطع الطويل الذي طُوبق فعلًا. */
  fragment: string;
};

export function buildHadithIndex(records: HadithRecord[]): IndexedHadith[] {
  return records.map((record) => ({
    ...record,
    norm: normalizeArabicText(record.text),
  }));
}

/**
 * أقرب كتاب حديث مذكور قبل الاقتباس داخل نافذة محددة.
 * «مسلم» مستثنى عمدًا لأن «المسلمين» ترد في سياق قرآني.
 */
export function detectHadithBook(
  body: string,
  quoteStart: number,
  windowSize = 160
): HadithBook | null {
  const before = body.slice(Math.max(0, quoteStart - windowSize), quoteStart);
  return detectHadithBookInText(before);
}

/** أقرب كتاب حديث مذكور في النص كله (يقصّ آخِر ذكر). */
export function detectHadithBookInText(text: string): HadithBook | null {
  let bestBook: HadithBook | null = null;
  let bestIndex = -1;

  for (const { book, aliases } of HADITH_BOOK_ALIASES) {
    for (const alias of aliases) {
      const idx = text.lastIndexOf(alias);
      if (idx > bestIndex) {
        bestIndex = idx;
        bestBook = book;
      }
    }
  }

  return bestBook;
}

/**
 * يطابق الاقتباس مع متن حديث موجود نصًّا في الفهرس.
 * يشترط مقطعًا لا يقل عن `minLength` حرفًا بعد التجريد، ومطابقة فريدة فقط.
 */
export function matchHadithQuote(
  quote: string,
  index: IndexedHadith[],
  minLength = 20
): HadithMatch | null {
  const candidates = findHadithCandidates(quote, index, minLength);
  if (candidates.length !== 1) return null;

  const hit = candidates[0];
  return {
    hadith: { book: hit.book, number: hit.number, text: hit.text },
    fragment: splitQuoteFragments(quote).find((fragment) => fragment.length >= minLength) ?? '',
  };
}

/** كل الأحاديث التي يرد متنها نصًّا في الاقتباس (قد تكون أكثر من واحد). */
export function findHadithCandidates(
  quote: string,
  index: IndexedHadith[],
  minLength = 20
): IndexedHadith[] {
  const fragments = splitQuoteFragments(quote).filter(
    (fragment) => fragment.length >= minLength
  );
  if (fragments.length === 0) return [];

  let candidates = index.filter((hadith) => hadith.norm.includes(fragments[0]));

  for (const fragment of fragments.slice(1)) {
    const narrowed = candidates.filter((hadith) => hadith.norm.includes(fragment));
    if (narrowed.length > 0) candidates = narrowed;
  }

  return candidates;
}
