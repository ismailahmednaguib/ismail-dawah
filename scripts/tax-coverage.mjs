// scripts/tax-coverage.mjs
// ============================================================================
// تغطية التصنيفات بالمحتوى — بالمعنى الذي يراه الزائر فعلًا.
//
// يجمع لكل «مفهوم» (slug) كل سطور التصنيف المطابقة + كل أحفادها، ثم يحسب عدد
// المواد المنشورة المرتبطة بأي منها. هذا هو نفس ما تفعله صفحة /fields/[slug]
// بعد تفعيل includeDescendants.
//
// التشغيل: node scripts/tax-coverage.mjs
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';

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

async function getAll(table, select, extra = '') {
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=${select}&limit=1000&offset=${offset}${extra}`,
      { headers: H }
    );
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const taxonomies = await getAll('taxonomies', 'id,kind,lang,slug,parent_id,name');
const terms = await getAll('content_terms', 'content_id,taxonomy_id');
const content = await getAll('content', 'id,status,content_type');

// نفس أنواع المحتوى التي تعرضها صفحة /fields/[slug] — وإلّا بدا الباب ممتلئًا
// في التقرير وفارغًا للزائر.
const FIELD_CONTENT_TYPES = new Set([
  'lesson',
  'article',
  'fatwa',
  'faq',
  'hadith',
  'khutbah',
  'story',
  'video',
  'page',
]);

const published = new Set(
  content
    .filter((c) => c.status === 'published' && FIELD_CONTENT_TYPES.has(c.content_type))
    .map((c) => c.id)
);

// محتوى كل تصنيف
const contentByTax = new Map();
for (const t of terms) {
  if (!published.has(t.content_id)) continue;
  if (!contentByTax.has(t.taxonomy_id)) contentByTax.set(t.taxonomy_id, new Set());
  contentByTax.get(t.taxonomy_id).add(t.content_id);
}

const childrenByParent = new Map();
for (const t of taxonomies) {
  if (!t.parent_id) continue;
  if (!childrenByParent.has(t.parent_id)) childrenByParent.set(t.parent_id, []);
  childrenByParent.get(t.parent_id).push(t.id);
}

function groupIds(slug) {
  const roots = taxonomies.filter((t) => t.slug === slug).map((t) => t.id);
  const collected = new Set(roots);
  let frontier = [...roots];
  for (let d = 0; d < 5 && frontier.length; d += 1) {
    const next = frontier.flatMap((id) => childrenByParent.get(id) ?? []).filter((id) => !collected.has(id));
    if (!next.length) break;
    for (const id of next) collected.add(id);
    frontier = next;
  }
  return collected;
}

function countFor(slug) {
  const ids = groupIds(slug);
  const found = new Set();
  for (const id of ids) for (const c of contentByTax.get(id) ?? []) found.add(c);
  return { count: found.size, ids: ids.size };
}

// الروابط التي يستخدمها الموقع فعلًا: /fields/<slug>
const navSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'navigation.ts'), 'utf8');
const navSlugs = new Set(
  [...navSource.matchAll(/\/fields\/([A-Za-z0-9-]+)/g)].map((m) => m[1])
);

const slugs = [...new Set(taxonomies.map((t) => t.slug))].sort();

const all = slugs.map((slug) => {
  const { count, ids } = countFor(slug);
  const kinds = [...new Set(taxonomies.filter((t) => t.slug === slug).map((t) => t.kind))];
  return { slug, count, ids, kinds, nav: navSlugs.has(slug) };
});

const emptyAll = all.filter((r) => r.count === 0);
const emptyNav = emptyAll.filter((r) => r.nav);
const weakNav = all.filter((r) => r.nav && r.count > 0 && r.count < 3);

console.log('============================================================');
console.log('تغطية التصنيفات بالمحتوى (المفهوم + أحفاده)');
console.log('============================================================');
console.log(`مفاهيم إجمالًا      : ${all.length}`);
console.log(`روابط /fields/ في الشجرة: ${navSlugs.size}`);
console.log(`مفاهيم فارغة تمامًا : ${emptyAll.length}`);
console.log(`  ومنها مربوطة بالشجرة: ${emptyNav.length}`);
console.log(`مربوطة بالشجرة وبها < 3 عناصر: ${weakNav.length}`);
console.log('------------------------------------------------------------');

if (emptyNav.length) {
  console.log('\n⚠ مفاهيم مربوطة من الشجرة وصفحتها فارغة (يجب تعميرها):');
  for (const r of emptyNav) console.log(`   - ${r.slug.padEnd(28)} [${r.kinds.join(', ')}]`);
}

if (weakNav.length) {
  console.log('\n◐ مفاهيم مربوطة وبها عنصر أو عنصران:');
  for (const r of weakNav.sort((a, b) => a.count - b.count)) {
    console.log(`   - ${r.slug.padEnd(28)} ${r.count}`);
  }
}

const emptyNotNav = emptyAll.filter((r) => !r.nav).map((r) => r.slug);
if (emptyNotNav.length) {
  console.log('\n(فارغة وغير مربوطة بالشجرة — غير ظاهرة للزائر):');
  console.log('   ' + emptyNotNav.join(' · '));
}
