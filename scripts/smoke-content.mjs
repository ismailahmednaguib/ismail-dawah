// scripts/smoke-content.mjs
// ============================================================================
// فحص دخان شامل: كل مادة منشورة يجب أن تُفتح في صفحتها بالعربية والإنجليزية.
// يُشغَّل بعد `npm run build && npm start` (يحتاج الخادم على المنفذ 3000).
//
// التشغيل: node scripts/smoke-content.mjs
//
// ملاحظة: يرمّز المعرّف بـ encodeURIComponent قبل الطلب، وهو ما يكشف أخطاء
// عدم فكّ ترميز بارامترات المسار (معرّفات عربية) التي تُسبّب 404.
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
const H = {
  apikey: env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY}`,
};

const rows = await (
  await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/content_translations?select=slug,lang,content:content_id(content_type,status)&limit=2000`,
    { headers: H }
  )
).json();

const published = rows.filter((r) => r.content?.status === 'published');
const items = published.map((r) => ({ lang: r.lang, type: r.content.content_type, slug: r.slug }));

const BASE = 'http://localhost:3000';
const results = [];

async function probe(it) {
  const url = `${BASE}/${it.lang}/learn/${it.type}/${encodeURIComponent(it.slug)}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    return { url, status: res.status };
  } catch (err) {
    return { url, status: 'ERR ' + err.message };
  }
}

const CONCURRENCY = 8;
for (let i = 0; i < items.length; i += CONCURRENCY) {
  const batch = items.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(probe))));
}

const bad = results.filter((r) => r.status !== 200);
console.log(`مفحوص: ${results.length} رابطًا (كل المحتوى المنشور بالعربية والإنجليزية)`);
if (bad.length === 0) {
  console.log('ALL 200 ✔');
} else {
  console.log(`فشل ${bad.length}:`);
  for (const b of bad.slice(0, 25)) console.log(`  ${b.status}  ${decodeURIComponent(b.url)}`);
}
