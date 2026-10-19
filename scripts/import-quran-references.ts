// scripts/import-quran-references.ts
// ============================================================================
// استيراد المراجع القرآنية: يطابق كل اقتباس قرآني في المحتوى المنشور بنص
// المصحف (رواية حفص عن عاصم، الرسم الإملائي) ثم يُدرج صفًّا في content_references.
//
//   npm run import:quran-refs                  # معاينة فقط (بلا كتابة)
//   npm run import:quran-refs -- --commit      # الكتابة الفعلية
//
// خيارات:
//   --source=path.json   استخدام ملف مصحف محلي بدل التنزيل
//   --quran-url=URL      رابط بديل لنص المصحف
//   --report=path.json   مسار تقرير المعاينة (افتراضيًا في مجلد النظام المؤقت)
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
const SOURCE_PATH = argValue('--source');
const QURAN_URL =
  argValue('--quran-url') ?? 'https://api.alquran.cloud/v1/quran/quran-simple';
const REPORT_PATH =
  argValue('--report') ?? path.join(os.tmpdir(), 'quran-refs-report.json');

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
  surah: number | null;
  ayah_from: number | null;
}

interface AlquranAyah {
  numberInSurah: number;
  text: string;
}

interface AlquranSurah {
  number: number;
  ayahs: AlquranAyah[];
}

interface AlquranPayload {
  data: { surahs: AlquranSurah[] };
}

async function loadQuranVerses(): Promise<QuranVerse[]> {
  let raw: string;
  if (SOURCE_PATH) {
    raw = fs.readFileSync(SOURCE_PATH, 'utf8');
  } else {
    const cache = path.join(os.tmpdir(), 'quran-simple.json');
    if (fs.existsSync(cache)) {
      raw = fs.readFileSync(cache, 'utf8');
    } else {
      const res = await fetch(QURAN_URL);
      if (!res.ok) throw new Error(`quran fetch: ${res.status}`);
      raw = await res.text();
      fs.writeFileSync(cache, raw);
    }
  }

  const payload = JSON.parse(raw.replace(/^\uFEFF/, '')) as AlquranPayload;
  return payload.data.surahs.flatMap((surah) =>
    surah.ayahs.map((ayah) => ({
      surah: surah.number,
      ayah: ayah.numberInSurah,
      text: ayah.text,
    }))
  );
}

interface FoundVerse {
  surah: number;
  ayah: number;
  quote: string;
}

interface Plan {
  contentId: string;
  slug: string;
  title: string;
  verses: FoundVerse[];
}

interface Unmatched {
  contentId: string;
  slug: string;
  quote: string;
  reason: string;
}

const [contentRows, translationRows, referenceRows, verses] = await Promise.all([
  getAll<ContentRow>(rest, 'content', 'id,content_type,status'),
  getAll<TranslationRow>(
    rest,
    'content_translations',
    'id,content_id,lang,slug,title,body'
  ),
  getAll<ReferenceRow>(rest, 'content_references', 'id,content_id,kind,surah,ayah_from'),
  loadQuranVerses(),
]);

const published = new Set(
  contentRows.filter((row) => row.status === 'published').map((row) => row.id)
);
const index = buildVerseIndex(verses);

const existing = new Set<string>();
for (const ref of referenceRows) {
  if (ref.kind === 'quran' && ref.surah && ref.ayah_from) {
    existing.add(`${ref.content_id}:${ref.surah}:${ref.ayah_from}`);
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

  const found: FoundVerse[] = [];
  const usedVerses = new Set<string>();

  for (const span of extractQuotedSpans(body)) {
    if (classifyQuoteContext(body, span.start) !== 'quran') continue;

    const match = matchQuranQuote(span.text, index);
    if (!match) {
      unmatched.push({
        contentId: translation.content_id,
        slug: translation.slug,
        quote: span.text.slice(0, 140),
        reason: 'AMBIGUOUS_OR_NOT_FOUND',
      });
      continue;
    }

    const key = `${match.verse.surah}:${match.verse.ayah}`;
    if (usedVerses.has(key)) continue;
    usedVerses.add(key);
    found.push({ surah: match.verse.surah, ayah: match.verse.ayah, quote: span.text });
  }

  if (found.length > 0) {
    plans.push({
      contentId: translation.content_id,
      slug: translation.slug,
      title: translation.title ?? '',
      verses: found,
    });
  }
}

const rows: Array<Record<string, unknown>> = [];
let skippedExisting = 0;

for (const plan of plans) {
  let order = referenceRows.filter((ref) => ref.content_id === plan.contentId).length;
  for (const verse of plan.verses) {
    if (existing.has(`${plan.contentId}:${verse.surah}:${verse.ayah}`)) {
      skippedExisting += 1;
      continue;
    }
    rows.push({
      content_id: plan.contentId,
      kind: 'quran',
      surah: verse.surah,
      ayah_from: verse.ayah,
      ayah_to: null,
      quote_text: verse.quote.slice(0, 500),
      note: 'توثيق آلي بمطابقة نصية دقيقة مع نص المصحف (رواية حفص عن عاصم).',
      verified: !UNVERIFIED,
      sort_order: order++,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  commit: COMMIT,
  verified: !UNVERIFIED,
  versesInQuran: verses.length,
  contentScanned: scannedContent.size,
  contentWithMatches: plans.length,
  referencesToInsert: rows.length,
  skippedExisting,
  unmatchedQuotes: unmatched.length,
  plans,
  unmatched,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

console.log(`quranVerses=${verses.length}`);
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
