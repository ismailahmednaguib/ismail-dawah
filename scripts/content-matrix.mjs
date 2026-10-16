// scripts/content-matrix.mjs
// ============================================================================
// مصفوفة المحتوى — كم نوعًا من المحتوى يغطّي كل باب/مجال/فرع/تصنيف؟
//
// يكشف: الأبواب التي تعتمد على نوع واحد (مثلًا دروس فقط بلا فتوى ولا مقال)،
// والأبواب التي لم تبلغ الحدّ الأدنى من العناصر.
//
// التشغيل: node scripts/content-matrix.mjs
//          node scripts/content-matrix.mjs --min=5
//          node scripts/content-matrix.mjs --strict     (يفشل إن نقص أي مفهوم)
//          node scripts/content-matrix.mjs --json
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
const minArg = process.argv.find((a) => a.startsWith('--min='));
const MIN_ITEMS = minArg ? Number(minArg.split('=')[1]) || 3 : 3;

const KIND_LABELS = {
  branch: 'باب',
  field: 'مجال',
  subbranch: 'فرع',
  category: 'تصنيف',
};

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

const content = await getAll('content', 'id,content_type,status');
const published = new Set(content.filter((row) => row.status === 'published').map((row) => row.id));
const typeOf = new Map(content.map((row) => [row.id, row.content_type]));

const taxonomies = await getAll('taxonomies', 'id,kind,lang,name,slug,parent_id');
const terms = await getAll('content_terms', 'content_id,taxonomy_id');

// شجرة الأبناء لحساب التجميع بالوراثة (نفس منطق includeDescendants)
const childrenOf = new Map();
for (const tax of taxonomies) {
  if (!tax.parent_id) continue;
  const list = childrenOf.get(tax.parent_id) ?? [];
  list.push(tax.id);
  childrenOf.set(tax.parent_id, list);
}

function subtreeIds(rootId, lang) {
  const allowed = new Set(
    taxonomies.filter((t) => t.lang === lang).map((t) => t.id)
  );
  const out = new Set([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    for (const child of childrenOf.get(current) ?? []) {
      if (!allowed.has(child) || out.has(child)) continue;
      out.add(child);
      stack.push(child);
    }
  }
  return out;
}

const termIdsByContent = new Map();
for (const term of terms) {
  if (!published.has(term.content_id)) continue;
  const list = termIdsByContent.get(term.content_id) ?? [];
  list.push(term.taxonomy_id);
  termIdsByContent.set(term.content_id, list);
}

const concepts = taxonomies.filter((t) => t.lang === 'ar');
const report = [];

for (const concept of concepts) {
  const ids = subtreeIds(concept.id, 'ar');
  const counts = {};
  let total = 0;

  for (const [contentId, termIds] of termIdsByContent.entries()) {
    if (!termIds.some((id) => ids.has(id))) continue;
    const type = typeOf.get(contentId) ?? 'unknown';
    counts[type] = (counts[type] ?? 0) + 1;
    total += 1;
  }

  report.push({
    kind: concept.kind,
    slug: concept.slug,
    name: concept.name,
    total,
    types: counts,
    distinctTypes: Object.keys(counts).length,
    belowMin: total < MIN_ITEMS,
  });
}

const sorted = report.sort(
  (a, b) => a.kind.localeCompare(b.kind) || b.total - a.total
);
const below = sorted.filter((row) => row.belowMin);
const thin = sorted.filter((row) => !row.belowMin && row.distinctTypes <= 1);
const allTypes = [...new Set(content.map((row) => row.content_type))].sort();

if (AS_JSON) {
  console.log(
    JSON.stringify({ minItems: MIN_ITEMS, concepts: sorted.length, below, thin, report }, null, 2)
  );
  process.exit(STRICT && below.length ? 1 : 0);
}

console.log('==================================================');
console.log('  مصفوفة المحتوى');
console.log('==================================================');
console.log(`  المفاهيم (ar):      ${sorted.length}`);
console.log(`  الحدّ الأدنى للعناصر: ${MIN_ITEMS}`);
console.log(`  تحت الحدّ:           ${below.length}`);
console.log(`  بنوع واحد فقط:       ${thin.length}`);
console.log(`  أنواع المحتوى:       ${allTypes.join(' · ')}`);
console.log('');

for (const kind of ['branch', 'field', 'subbranch', 'category']) {
  const rows = sorted.filter((row) => row.kind === kind);
  if (!rows.length) continue;
  console.log(`── ${KIND_LABELS[kind]} (${rows.length}) ──`);
  for (const row of rows) {
    const flags = [
      row.belowMin ? '⟵ تحت الحدّ' : '',
      !row.belowMin && row.distinctTypes <= 1 ? '⟵ نوع واحد' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const detail = Object.entries(row.types)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}:${count}`)
      .join(' · ');
    console.log(
      `  ${String(row.total).padStart(3)}  ${row.name}  (${row.slug})  ${flags}`
    );
    if (detail) console.log(`       ${detail}`);
  }
  console.log('');
}

console.log(
  below.length || thin.length
    ? STRICT
      ? '❌ المصفوفة غير مكتملة.'
      : 'ℹ️ تقرير فقط — شغّل مع --strict لجعله إلزاميًّا.'
    : '✅ كل مفهوم يستوفي الحدّ الأدنى وله أكثر من نوع.'
);
process.exit(STRICT && below.length ? 1 : 0);
