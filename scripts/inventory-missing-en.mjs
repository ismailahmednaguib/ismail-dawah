// scripts/inventory-missing-en.mjs
// يُصدّر للمراجعة (قراءة فقط) كل المحتوى المنشور بلا ترجمة إنجليزية
// إلى ملف JSON مع نصوصه، لتسهيل الترجمة على دفعات.
//
// التشغيل: node scripts/inventory-missing-en.mjs
// الناتج : scripts/.missing-en.json

import fs from 'node:fs';
import path from 'node:path';

const env = {};
for (const file of ['.env.local', '.env']) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}` };

async function get(qs) {
  const res = await fetch(`${url}/rest/v1/${qs}`, { headers: H });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

// 1) اصطلاح الروابط: هل تشترك الترجمة الإنجليزية مع العربية في نفس الـslug؟
const all = await get(
  'content_translations?select=lang,slug,content_id,title&limit=1000'
);
const byContent = new Map();
for (const r of all) {
  if (!byContent.has(r.content_id)) byContent.set(r.content_id, {});
  byContent.get(r.content_id)[r.lang] = r;
}
const pairs = [...byContent.values()].filter((p) => p.ar && p.en);
const sameSlug = pairs.filter((p) => p.ar.slug === p.en.slug).length;
const diffSlug = pairs.filter((p) => p.ar.slug !== p.en.slug);
console.log(`أزواج مترجمة: ${pairs.length}`);
console.log(`  بنفس الـslug : ${sameSlug}`);
console.log(`  بslug مختلف  : ${diffSlug.length}`);
for (const p of diffSlug.slice(0, 5)) {
  console.log(`   - ar=${p.ar.slug} | en=${p.en.slug}`);
}

// 2) تصدير الناقص
const translated = new Set(all.filter((r) => r.lang === 'en').map((r) => r.content_id));
const missing = all
  .filter((r) => r.lang === 'ar' && !translated.has(r.content_id))
  .map((r) => r.content_id);

const ids = `(${missing.join(',')})`;
const rows = await get(
  `content_translations?select=slug,title,summary,body,content:content_id(id,content_type,status,audience,levels)&lang=eq.ar&content_id=in.${ids}&limit=1000`
);

const out = rows
  .filter((r) => r.content?.status === 'published')
  .map((r) => ({
    contentId: r.content.id,
    type: r.content.content_type,
    slug: r.slug,
    length: (r.body || '').length,
    ar: { title: r.title, summary: r.summary, body: r.body },
  }));

fs.writeFileSync(
  path.join(process.cwd(), 'scripts', '.missing-en.json'),
  JSON.stringify(out, null, 2),
  'utf8'
);

const totalChars = out.reduce((n, r) => n + r.length, 0);
console.log(`\nعناصر مُصدَّرة: ${out.length}`);
console.log(`إجمالي أحرف النصوص العربية: ${totalChars.toLocaleString('en-US')}`);
console.log('أطول 10 عناصر:');
for (const r of [...out].sort((a, b) => b.length - a.length).slice(0, 10)) {
  console.log(`  ${String(r.length).padStart(6)}  ${r.type.padEnd(9)} ${r.slug}`);
}
const buckets = { '0-500': 0, '501-2000': 0, '2001-6000': 0, '>6000': 0 };
for (const r of out) {
  if (r.length <= 500) buckets['0-500']++;
  else if (r.length <= 2000) buckets['501-2000']++;
  else if (r.length <= 6000) buckets['2001-6000']++;
  else buckets['>6000']++;
}
console.log('\nالتوزيع:', JSON.stringify(buckets));
