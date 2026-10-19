// scripts/check-citations.mjs
// ============================================================================
// فحص المصادر الشرعية — كل نصّ فيه آية أو حديث يجب أن يقابله مرجع موثّق.
//
// يفحص: كل ترجمة منشورة (ar/en) فيها إشارة إلى «قال تعالى» أو «قال ﷺ» ونحوه،
// ثم يتحقق هل للعنصر صفّ في `content_references`.
//
// التشغيل: node scripts/check-citations.mjs
//          node scripts/check-citations.mjs --strict   (يُفشل عند وجود نقص)
//          node scripts/check-citations.mjs --json
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

const STRICT = process.argv.includes('--strict');
const AS_JSON = process.argv.includes('--json');

const MARKERS = [
  'قال تعالى',
  'قال الله',
  'قال رسول الله',
  'قال النبي',
  'قال ﷺ',
  'صلى الله عليه وسلم',
  'رواه البخاري',
  'رواه مسلم',
  'أخرجه',
  'في الصحيحين',
];

// ذكر «صلى الله عليه وسلم» وحده ليس اقتباسًا شرعيًّا: قد يرد في سياق سردي
// («وُلد النبي صلى الله عليه وسلم في مكة»). فلا يُعدّ إشارة إلا إذا اقترن
// بعلامة تنصيص قريبة تدلّ على نصّ مقتبس يحتاج مصدرًا.
const HONORIFIC = 'صلى الله عليه وسلم';
const QUOTE_MARK = /[«"“]/;

function hasNearbyQuote(text, index, length) {
  const before = text.slice(Math.max(0, index - 80), index);
  const after = text.slice(index + length, index + length + 60);
  return QUOTE_MARK.test(after) || QUOTE_MARK.test(before);
}

function matchedMarkers(text) {
  const hits = [];
  for (const marker of MARKERS) {
    let from = 0;
    while (true) {
      const index = text.indexOf(marker, from);
      if (index < 0) break;
      if (marker === HONORIFIC && !hasNearbyQuote(text, index, marker.length)) {
        from = index + marker.length;
        continue;
      }
      hits.push(marker);
      break;
    }
  }
  return hits;
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

const content = await getAll('content', 'id,content_type,status');
const published = new Map(
  content.filter((row) => row.status === 'published').map((row) => [row.id, row.content_type])
);

const translations = await getAll(
  'content_translations',
  'id,content_id,lang,slug,title,summary,body'
);

const references = await getAll('content_references', 'id,content_id,kind,verified');

const refsByContent = new Map();
for (const ref of references) {
  const entry = refsByContent.get(ref.content_id) ?? { total: 0, verified: 0 };
  entry.total += 1;
  if (ref.verified) entry.verified += 1;
  refsByContent.set(ref.content_id, entry);
}

const results = [];

for (const row of translations) {
  if (!published.has(row.content_id)) continue;
  if (row.lang !== 'ar' && row.lang !== 'en') continue;

  const haystack = `${row.title ?? ''}\n${row.summary ?? ''}\n${row.body ?? ''}`;
  const hits = matchedMarkers(haystack);
  if (hits.length === 0) continue;

  const refs = refsByContent.get(row.content_id) ?? { total: 0, verified: 0 };

  results.push({
    lang: row.lang,
    slug: row.slug,
    title: row.title,
    contentType: published.get(row.content_id),
    markers: hits,
    references: refs.total,
    verifiedReferences: refs.verified,
    missing: refs.total === 0,
    unverified: refs.total > 0 && refs.verified === 0,
  });
}

const missing = results.filter((row) => row.missing);
const unverified = results.filter((row) => row.unverified);

if (AS_JSON) {
  console.log(JSON.stringify({ scanned: results.length, missing, unverified }, null, 2));
  process.exit(STRICT && (missing.length || unverified.length) ? 1 : 0);
}

console.log('==================================================');
console.log('  فحص المصادر الشرعية');
console.log('==================================================');
console.log(`  نصوص فيها إشارة شرعية: ${results.length}`);
console.log(`  بلا أي مرجع:            ${missing.length}`);
console.log(`  بمرجع غير موثَّق:        ${unverified.length}`);
console.log('');

if (missing.length) {
  console.log('— بلا مرجع (يحتاج إضافة مصدر):');
  for (const row of missing.slice(0, 40)) {
    console.log(`  [${row.lang}] ${row.title}  ← ${row.markers.join(' · ')}`);
  }
  if (missing.length > 40) console.log(`  … و${missing.length - 40} أخرى`);
  console.log('');
}

if (unverified.length) {
  console.log('— بمرجع غير موثَّق (يحتاج تحقّقًا):');
  for (const row of unverified.slice(0, 20)) {
    console.log(`  [${row.lang}] ${row.title}`);
  }
  if (unverified.length > 20) console.log(`  … و${unverified.length - 20} أخرى`);
  console.log('');
}

if (!missing.length && !unverified.length) {
  console.log('✅ كل نصّ شرعي له مرجع موثَّق.');
  process.exit(0);
}

console.log(
  STRICT ? '❌ يوجد نقص في المصادر.' : 'ℹ️ تقرير فقط — شغّل مع --strict لجعل الفحص إلزاميًّا.'
);
process.exit(STRICT ? 1 : 0);
