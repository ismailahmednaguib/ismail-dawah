// scripts/apply-citation-fixes.ts
// ============================================================================
// تطبيق التصحيحات والمراجع المحسومة يدويًّا من scripts/data/citation-fixes.json.
//
// هذه المراجع لا تُشتقّ آليًّا: كل نسبة فيها قرار مراجعة مُسجَّل (بلفظ الحديث أو
// بمعناه مع التصريح باللفظ الأصلي)، التزامًا بقاعدة «لا يُنشر محتوى شرعي بلا
// مصدر ومراجعة».
//
//   npm run fix:citations                 # معاينة فقط (بلا كتابة)
//   npm run fix:citations -- --commit     # الكتابة الفعلية
//
// خيارات:
//   --file=path.json     ملف التصحيحات (افتراضيًا scripts/data/citation-fixes.json)
//   --report=path.json   مسار تقرير المعاينة (افتراضيًا في مجلد النظام المؤقت)
// ============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractQuotedSpans, normalizeArabicText } from '../lib/references/quran.ts';
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
const FILE_PATH = argValue('--file') ?? path.join('scripts', 'data', 'citation-fixes.json');
const REPORT_PATH =
  argValue('--report') ?? path.join(os.tmpdir(), 'citation-fixes-report.json');

interface BodyFix {
  slug: string;
  from: string;
  to: string;
  reason?: string;
}

interface Entry {
  slug: string;
  kind: 'quran' | 'hadith';
  quote?: string;
  quoteContains?: string;
  surah?: number;
  ayah?: number;
  book?: string;
  number?: number | null;
  grade?: string | null;
  gradedBy?: string | null;
  note?: string;
}

interface Fixes {
  bodyFixes?: BodyFix[];
  entries?: Entry[];
}

interface ContentRow {
  id: string;
  status: string;
}

interface TranslationRow {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  body: string | null;
}

interface ReferenceRow {
  content_id: string;
  kind: string;
  surah: number | null;
  ayah_from: number | null;
  hadith_book: string | null;
  hadith_number: number | null;
}

if (!fs.existsSync(FILE_PATH)) {
  console.error(`MISSING_FILE: ${FILE_PATH}`);
  process.exit(1);
}

const fixes = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')) as Fixes;

const [contentRows, translationRows, referenceRows] = await Promise.all([
  getAll<ContentRow>(rest, 'content', 'id,status'),
  getAll<TranslationRow>(rest, 'content_translations', 'id,content_id,lang,slug,body'),
  getAll<ReferenceRow>(
    rest,
    'content_references',
    'content_id,kind,surah,ayah_from,hadith_book,hadith_number'
  ),
]);

const published = new Set(
  contentRows.filter((row) => row.status === 'published').map((row) => row.id)
);

const bySlug = new Map<string, TranslationRow>();
for (const row of translationRows) {
  if (row.lang !== 'ar') continue;
  if (!published.has(row.content_id)) continue;
  if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
}

/** نصّ الجسم بعد تطبيق تصحيحات النصوص (حتى تُبنى المراجع على النصّ المصحَّح). */
const bodies = new Map<string, string>();
function bodyOf(slug: string): string {
  if (!bodies.has(slug)) bodies.set(slug, bySlug.get(slug)?.body ?? '');
  return bodies.get(slug) ?? '';
}

const existing = new Set<string>();
const orderCursor = new Map<string, number>();
for (const ref of referenceRows) {
  orderCursor.set(ref.content_id, (orderCursor.get(ref.content_id) ?? 0) + 1);
  if (ref.kind === 'quran' && ref.surah && ref.ayah_from) {
    existing.add(`${ref.content_id}:quran:${ref.surah}:${ref.ayah_from}`);
  }
  if (ref.kind === 'hadith' && ref.hadith_book) {
    existing.add(
      `${ref.content_id}:hadith:${ref.hadith_book}:${ref.hadith_number ?? '*'}`
    );
  }
}

// 1) تصحيحات النصوص
const fixResults: Array<Record<string, unknown>> = [];
for (const fix of fixes.bodyFixes ?? []) {
  const row = bySlug.get(fix.slug);
  if (!row) {
    fixResults.push({ slug: fix.slug, status: 'SLUG_NOT_FOUND' });
    continue;
  }
  const body = bodyOf(fix.slug);
  if (!body.includes(fix.from)) {
    fixResults.push({
      slug: fix.slug,
      status: body.includes(fix.to) ? 'ALREADY_APPLIED' : 'FROM_NOT_FOUND',
    });
    continue;
  }
  const next = body.split(fix.from).join(fix.to);
  bodies.set(fix.slug, next);

  if (COMMIT) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/content_translations?id=eq.${encodeURIComponent(row.id)}`,
      {
        method: 'PATCH',
        headers: { ...rest.headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ body: next }),
      }
    );
    if (!res.ok) throw new Error(`patch content_translations: ${res.status} ${await res.text()}`);
  }
  fixResults.push({ slug: fix.slug, status: COMMIT ? 'APPLIED' : 'DRY_RUN' });
}

// 2) المراجع المحسومة
const rows: Array<Record<string, unknown>> = [];
const entryResults: Array<Record<string, unknown>> = [];

for (const entry of fixes.entries ?? []) {
  const row = bySlug.get(entry.slug);
  if (!row) {
    entryResults.push({ slug: entry.slug, status: 'SLUG_NOT_FOUND' });
    continue;
  }

  const body = bodyOf(entry.slug);
  const normalizedBody = normalizeArabicText(body);

  let quote = entry.quote ?? '';
  if (!entry.quote && entry.quoteContains) {
    const needle = normalizeArabicText(entry.quoteContains);
    const span = extractQuotedSpans(body).find((candidate) =>
      normalizeArabicText(candidate.text).includes(needle)
    );
    if (span) quote = span.text;
  }

  if (!quote || !normalizedBody.includes(normalizeArabicText(quote))) {
    entryResults.push({ slug: entry.slug, quoteContains: entry.quoteContains, status: 'QUOTE_NOT_FOUND' });
    continue;
  }

  const key =
    entry.kind === 'quran'
      ? `${row.content_id}:quran:${entry.surah}:${entry.ayah}`
      : `${row.content_id}:hadith:${entry.book}:${entry.number ?? '*'}`;

  if (existing.has(key)) {
    entryResults.push({ slug: entry.slug, status: 'ALREADY_PRESENT' });
    continue;
  }

  const order = orderCursor.get(row.content_id) ?? 0;
  orderCursor.set(row.content_id, order + 1);

  const base: Record<string, unknown> = {
    content_id: row.content_id,
    kind: entry.kind,
    quote_text: quote.slice(0, 500),
    note: entry.note ?? null,
    verified: true,
    sort_order: order,
  };

  if (entry.kind === 'quran') {
    rows.push({
      ...base,
      surah: entry.surah ?? null,
      ayah_from: entry.ayah ?? null,
      ayah_to: null,
    });
  } else {
    rows.push({
      ...base,
      hadith_book: entry.book ?? null,
      hadith_number: entry.number ?? null,
      hadith_grade: entry.grade ?? null,
      graded_by: entry.gradedBy ?? null,
    });
  }

  existing.add(key);
  entryResults.push({ slug: entry.slug, status: 'TO_INSERT', quote });
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      commit: COMMIT,
      file: FILE_PATH,
      bodyFixes: fixResults,
      entries: entryResults,
      referencesToInsert: rows.length,
    },
    null,
    2
  ),
  'utf8'
);

const counts = entryResults.reduce<Record<string, number>>((acc, item) => {
  const status = String(item.status);
  acc[status] = (acc[status] ?? 0) + 1;
  return acc;
}, {});

console.log(`bodyFixes=${fixResults.length}`);
console.log(`entries=${entryResults.length}`);
console.log(`referencesToInsert=${rows.length}`);
console.log(`entryStatus=${JSON.stringify(counts)}`);
console.log(`report=${REPORT_PATH}`);

if (COMMIT && rows.length > 0) {
  // PostgREST يرفض الدفعة الواحدة إذا اختلفت مفاتيح صفوفها (قرآن مقابل حديث)،
  // لذلك نجمع الصفوف المتشابهة في البنية وندرِج كل مجموعة على حدة.
  const groups = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const signature = Object.keys(row).sort().join(',');
    const group = groups.get(signature) ?? [];
    group.push(row);
    groups.set(signature, group);
  }

  let committed = 0;
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i += 500) {
      const batch = group.slice(i, i + 500);
      await insertRows(rest, 'content_references', batch);
      committed += batch.length;
    }
  }
  console.log(`committed=${committed}`);
} else if (!COMMIT) {
  console.log('dry-run: أضف --commit للكتابة الفعلية');
}
