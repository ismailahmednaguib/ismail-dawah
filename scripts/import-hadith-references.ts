// scripts/import-hadith-references.ts
// ============================================================================
// استيراد المراجع الحديثية: يطابق الاقتباسات الحديثية في المحتوى المنشور
// بنصوص كتب السنة (بخاري · مسلم · أبو داود · الترمذي · النسائي · ابن ماجه · مالك).
//
// المطابقة نصّية دقيقة بعد تجريد التشكيل، ولا تُنسب إلا ما ثبت وجوده بالحرف:
//   • إن ذُكر كتاب في النص: يُنسب إليه، مع الرقم إن كان المتن فريدًا فيه،
//     وإلا يُكتفى باسم الكتاب بلا رقم (لأن المتن تكرر في أكثر من موضع).
//   • إن لم يُذكر كتاب: يُنسب فقط إذا كان المتن فريدًا في الكتب السبعة.
//   • إن طابق الاقتباس آية قرآنية ولم يُذكر كتاب: يُترك للاستيراد القرآني.
//
//   npm run import:hadith-refs                 # معاينة فقط (بلا كتابة)
//   npm run import:hadith-refs -- --commit     # الكتابة الفعلية
//
// خيارات:
//   --dir=path           مجلد ملفات الكتب (hadith-ara-<book>.json)
//   --min=20             الحد الأدنى لطول المقطع المطابَق بعد تجريد التشكيل
//   --report=path.json   مسار تقرير المعاينة
//   --unverified         إدراج المراجع بحالة «غير موثّق» بدل «موثّق»
// ============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildVerseIndex,
  classifyQuoteContext,
  extractQuotedSpans,
  matchQuranQuote,
} from '../lib/references/quran.ts';
import type { QuranVerse } from '../lib/references/quran.ts';
import {
  HADITH_BOOK_NAMES,
  buildHadithIndex,
  detectHadithBookInText,
  findHadithCandidates,
} from '../lib/references/hadith.ts';
import type { HadithBook, HadithRecord, IndexedHadith } from '../lib/references/hadith.ts';
import { argValue, createRest, getAll, insertRows, readEnv } from './lib/rest.ts';

const env = readEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('MISSING_ENV: NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبان');
  process.exit(1);
}

const rest = createRest(SUPABASE_URL, SERVICE_KEY);
const COMMIT = process.argv.includes('--commit');
const UNVERIFIED = process.argv.includes('--unverified');
const DATA_DIR = argValue('--dir') ?? os.tmpdir();
const MIN_LENGTH = Number(argValue('--min') ?? '20');
const REPORT_PATH =
  argValue('--report') ?? path.join(os.tmpdir(), 'hadith-refs-report.json');

const BOOKS: HadithBook[] = [
  'bukhari',
  'muslim',
  'abudawud',
  'tirmidhi',
  'nasai',
  'ibnmajah',
  'malik',
];

interface ContentRow {
  id: string;
  content_type: string;
  status: string;
}

interface TranslationRow {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string | null;
  body: string | null;
}

interface ReferenceRow {
  id: string;
  content_id: string;
  kind: string;
  hadith_book: string | null;
  hadith_number: number | null;
}

interface RawHadith {
  hadithnumber: number;
  arabicnumber?: number | string;
  text: string;
  grades?: Array<{ name: string; grade: string }>;
}

interface RawEdition {
  hadiths: RawHadith[];
}

type HadithGradeValue = 'sahih' | 'hasan' | 'daif' | 'mawdu';

const gradeLookup = new Map<string, { grade: HadithGradeValue; gradedBy: string | null }>();

/** الرقم المعياري (arabicnumber) هو المتعارف عليه في الطبعات؛ نسقط الكسر. */
function standardNumber(hadith: RawHadith): number {
  const raw = hadith.arabicnumber;
  const parsed = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? ''));
  if (Number.isFinite(parsed) && parsed > 0) return Math.trunc(parsed);
  return hadith.hadithnumber;
}

function pickGrade(
  book: HadithBook,
  grades: Array<{ name: string; grade: string }> | undefined
): { grade: HadithGradeValue; gradedBy: string | null } | null {
  if (book === 'bukhari' || book === 'muslim') {
    return { grade: 'sahih', gradedBy: null };
  }

  const rank: HadithGradeValue[] = ['sahih', 'hasan', 'daif', 'mawdu'];
  let best: { grade: HadithGradeValue; gradedBy: string | null } | null = null;

  for (const entry of grades ?? []) {
    const text = String(entry.grade ?? '').toLowerCase();
    let value: HadithGradeValue | null = null;
    if (text.includes('sahih') || text.includes('صحيح')) value = 'sahih';
    else if (text.includes('hasan') || text.includes('حسن')) value = 'hasan';
    else if (text.includes('da') && text.includes('if')) value = 'daif';
    else if (text.includes('dhaif') || text.includes('ضعيف')) value = 'daif';
    else if (text.includes('mawdu') || text.includes('موضوع')) value = 'mawdu';
    if (!value) continue;

    if (!best || rank.indexOf(value) < rank.indexOf(best.grade)) {
      best = { grade: value, gradedBy: entry.name ?? null };
    }
  }

  return best;
}

interface AlquranAyah {
  numberInSurah: number;
  text: string;
}

interface AlquranPayload {
  data: {
    surahs: Array<{ number: number; ayahs: AlquranAyah[] }>;
  };
}

function loadBook(book: HadithBook): HadithRecord[] {
  const file = path.join(DATA_DIR, `hadith-ara-${book}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`MISSING_DATA: ${file} — نزّل ملفات الكتب إلى ${DATA_DIR}`);
  }
  const payload = JSON.parse(
    fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  ) as RawEdition;
  return payload.hadiths
    .filter((hadith) => typeof hadith.text === 'string' && hadith.text.trim().length > 0)
    .map((hadith) => {
      const number = standardNumber(hadith);
      const grade = pickGrade(book, hadith.grades);
      if (grade) gradeLookup.set(`${book}:${number}`, grade);
      return { book, number, text: hadith.text };
    });
}

function loadQuranVerses(): QuranVerse[] {
  const cache = path.join(DATA_DIR, 'quran-simple.json');
  if (!fs.existsSync(cache)) return [];
  const payload = JSON.parse(
    fs.readFileSync(cache, 'utf8').replace(/^\uFEFF/, '')
  ) as AlquranPayload;
  return payload.data.surahs.flatMap((surah) =>
    surah.ayahs.map((ayah) => ({
      surah: surah.number,
      ayah: ayah.numberInSurah,
      text: ayah.text,
    }))
  );
}

interface FoundHadith {
  book: HadithBook;
  number: number | null;
  quote: string;
}

interface Plan {
  contentId: string;
  slug: string;
  title: string;
  hadiths: FoundHadith[];
}

interface Unmatched {
  contentId: string;
  slug: string;
  book: HadithBook | null;
  quote: string;
  reason: string;
}

const byBook = new Map<HadithBook, IndexedHadith[]>();
const combined: IndexedHadith[] = [];

for (const book of BOOKS) {
  const index = buildHadithIndex(loadBook(book));
  byBook.set(book, index);
  combined.push(...index);
}

const quranIndex = buildVerseIndex(loadQuranVerses());

const [contentRows, translationRows, referenceRows] = await Promise.all([
  getAll<ContentRow>(rest, 'content', 'id,content_type,status'),
  getAll<TranslationRow>(
    rest,
    'content_translations',
    'id,content_id,lang,slug,title,body'
  ),
  getAll<ReferenceRow>(
    rest,
    'content_references',
    'id,content_id,kind,hadith_book,hadith_number'
  ),
]);

const published = new Set(
  contentRows.filter((row) => row.status === 'published').map((row) => row.id)
);

const existing = new Set<string>();
for (const ref of referenceRows) {
  if (ref.kind === 'hadith' && ref.hadith_book) {
    existing.add(`${ref.content_id}:${ref.hadith_book}:${ref.hadith_number ?? '*'}`);
  }
}

const plans: Plan[] = [];
const unmatched: Unmatched[] = [];
const scannedContent = new Set<string>();

for (const translation of translationRows) {
  if (translation.lang !== 'ar') continue;
  if (!published.has(translation.content_id)) continue;
  if (scannedContent.has(translation.content_id)) continue;
  scannedContent.add(translation.content_id);

  const body = translation.body ?? '';
  if (!body) continue;

  const found: FoundHadith[] = [];
  const usedHadiths = new Set<string>();

  for (const span of extractQuotedSpans(body)) {
    const nearBook = detectHadithBookInText(body);
    const isHadithContext =
      classifyQuoteContext(body, span.start) === 'hadith' || nearBook !== null;
    if (!isHadithContext) continue;

    const quranMatch =
      quranIndex.length > 0 ? matchQuranQuote(span.text, quranIndex) : null;

    let resolved: { book: HadithBook; number: number | null } | null = null;

    // 1) الأقوى: متن فريد في الكتب السبعة، وليس آية قرآنية.
    if (!quranMatch) {
      const combinedCandidates = findHadithCandidates(span.text, combined, MIN_LENGTH);
      if (combinedCandidates.length === 1) {
        resolved = {
          book: combinedCandidates[0].book,
          number: combinedCandidates[0].number,
        };
      } else {
        // 2) كتاب مذكور قرب الاقتباس: يُنسب إليه بالرقم إن فريد، وبلا رقم إن تكرر.
        if (nearBook) {
          const scoped = findHadithCandidates(
            span.text,
            byBook.get(nearBook) ?? [],
            MIN_LENGTH
          );
          if (scoped.length === 1) {
            resolved = { book: nearBook, number: scoped[0].number };
          } else if (scoped.length > 1) {
            resolved = { book: nearBook, number: null };
          }
        }
      }
    }

    if (!resolved) {
      unmatched.push({
        contentId: translation.content_id,
        slug: translation.slug,
        book: nearBook,
        quote: span.text.slice(0, 160),
        reason: quranMatch ? 'QURAN_QUOTE' : 'NOT_FOUND_OR_AMBIGUOUS',
      });
      continue;
    }

    const key = `${resolved.book}:${resolved.number ?? '*'}`;
    if (usedHadiths.has(key)) continue;
    usedHadiths.add(key);
    found.push({
      book: resolved.book,
      number: resolved.number,
      quote: span.text,
    });
  }

  if (found.length > 0) {
    plans.push({
      contentId: translation.content_id,
      slug: translation.slug,
      title: translation.title ?? '',
      hadiths: found,
    });
  }
}

const rows: Array<Record<string, unknown>> = [];
let skippedExisting = 0;

for (const plan of plans) {
  let order = referenceRows.filter((ref) => ref.content_id === plan.contentId).length;
  for (const item of plan.hadiths) {
    const name = HADITH_BOOK_NAMES[item.book];
    if (existing.has(`${plan.contentId}:${name}:${item.number ?? '*'}`)) {
      skippedExisting += 1;
      continue;
    }
    const grade = item.number === null ? null : gradeLookup.get(`${item.book}:${item.number}`) ?? null;
    rows.push({
      content_id: plan.contentId,
      kind: 'hadith',
      hadith_book: name,
      hadith_number: item.number,
      hadith_grade: grade?.grade ?? null,
      graded_by: grade?.gradedBy ?? null,
      quote_text: item.quote.slice(0, 500),
      note:
        item.number === null
          ? 'نُسب الحديث إلى الكتاب المذكور في النص؛ وتعذّر تحديد رقم واحد لأن المتن تكرر فيه.'
          : 'توثيق آلي بمطابقة نصية دقيقة مع متن الحديث في الكتاب المذكور.',
      verified: !UNVERIFIED,
      sort_order: order++,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  commit: COMMIT,
  verified: !UNVERIFIED,
  minLength: MIN_LENGTH,
  books: BOOKS.length,
  hadithsIndexed: combined.length,
  contentScanned: scannedContent.size,
  contentWithMatches: plans.length,
  referencesToInsert: rows.length,
  skippedExisting,
  unmatchedQuotes: unmatched.length,
  plans: plans.map((plan) => ({
    ...plan,
    hadiths: plan.hadiths.map((item) => ({
      ...item,
      book: HADITH_BOOK_NAMES[item.book],
    })),
  })),
  unmatched,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

console.log(`books=${BOOKS.length}`);
console.log(`hadithsIndexed=${combined.length}`);
console.log(`contentScanned=${scannedContent.size}`);
console.log(`contentWithMatches=${plans.length}`);
console.log(`referencesToInsert=${rows.length}`);
console.log(`skippedExisting=${skippedExisting}`);
console.log(`unmatchedQuotes=${unmatched.length}`);
console.log(`report=${REPORT_PATH}`);

if (COMMIT && rows.length > 0) {
  for (let i = 0; i < rows.length; i += 500) {
    await insertRows(rest, 'content_references', rows.slice(i, i + 500));
  }
  console.log(`committed=${rows.length}`);
} else if (!COMMIT) {
  console.log('dry-run: أضف --commit للكتابة الفعلية');
}
