// scripts/check-review-coverage.mjs
// ============================================================================
// تغطية المراجعة العلمية للفتاوى المنشورة.
//
// يقيس ثلاثة أمور لكل فتوى منشورة:
//   1) وجود مراجع علمي معتمد  (content.reviewer_id)
//   2) وجود مرجع موثّق        (content_references)
//   3) اعتماد المرجع          (content_references.verified)
//
// التشغيل:
//   node scripts/check-review-coverage.mjs
//   node scripts/check-review-coverage.mjs --strict   (يفشل عند أي نقص)
//   node scripts/check-review-coverage.mjs --json
// ============================================================================

import fs from 'node:fs';

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...loadEnv('.env.local'), ...loadEnv('.env'), ...process.env };
const KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const AS_JSON = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');

if (!KEY || !URL) {
  console.error('تعذّر القراءة: مفاتيح Supabase غير مضبوطة في .env.local');
  process.exit(1);
}

async function getAll(table, select) {
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=${select}&limit=1000&offset=${offset}`,
      { headers: H }
    );
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const fatwas = await getAll(
  'content',
  'id,reviewer_id,status,content_type,content_translations(lang,title,slug)'
).then((rows) =>
  rows.filter((row) => row.content_type === 'fatwa' && row.status === 'published')
);

const fatwaIds = fatwas.map((row) => row.id);
const fatwaIdSet = new Set(fatwaIds);
const references = fatwaIds.length
  ? await getAll('content_references', 'content_id,verified').then((rows) =>
      rows.filter((row) => fatwaIdSet.has(row.content_id))
    )
  : [];

const refsByContent = new Map();
for (const ref of references) {
  const current = refsByContent.get(ref.content_id) ?? { total: 0, verified: 0 };
  current.total += 1;
  if (ref.verified) current.verified += 1;
  refsByContent.set(ref.content_id, current);
}

const rows = fatwas.map((row) => {
  const translation =
    (row.content_translations ?? []).find((t) => t.lang === 'ar') ??
    (row.content_translations ?? [])[0] ??
    {};
  const refs = refsByContent.get(row.id) ?? { total: 0, verified: 0 };
  return {
    id: row.id,
    title: translation.title ?? '(بلا عنوان)',
    slug: translation.slug ?? '',
    hasReviewer: Boolean(row.reviewer_id),
    references: refs.total,
    verifiedReferences: refs.verified,
  };
});

const summary = {
  total: rows.length,
  withReviewer: rows.filter((row) => row.hasReviewer).length,
  withoutReviewer: rows.filter((row) => !row.hasReviewer).length,
  withReferences: rows.filter((row) => row.references > 0).length,
  withVerifiedReferences: rows.filter((row) => row.verifiedReferences > 0).length,
  unreviewed: rows.filter((row) => !row.hasReviewer),
};

if (AS_JSON) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
} else {
  console.log('تغطية المراجعة العلمية للفتاوى المنشورة');
  console.log('----------------------------------------');
  console.log(`الفتاوى المنشورة:        ${summary.total}`);
  console.log(`بمراجع معتمد:            ${summary.withReviewer}`);
  console.log(`بلا مراجع معتمد:         ${summary.withoutReviewer}`);
  console.log(`بمرجع موثّق (أي مرجع):   ${summary.withReferences}`);
  console.log(`بمرجع معتمد:             ${summary.withVerifiedReferences}`);

  if (summary.unreviewed.length > 0) {
    console.log('\nفتاوى تحتاج مراجعة:');
    for (const row of summary.unreviewed) {
      console.log(`  - ${row.title}  (${row.slug})`);
    }
  }

  console.log('\nللمعالجة: لوحة التحكم ← الجودة ← المراجعة العلمية للفتاوى.');
}

if (STRICT && (summary.withoutReviewer > 0 || summary.withVerifiedReferences < summary.total)) {
  console.error('\nفشل الفحص الصارم: توجد فتاوى منشورة بلا مراجع معتمد أو بلا مرجع موثّق معتمد.');
  process.exit(1);
}
