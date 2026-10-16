// scripts/missing-translations.mjs
// ============================================================================
// تقرير (قراءة فقط) بالمحتوى المنشور الذي لا يملك ترجمة إنجليزية بعد.
// يساعد على متابعة تغطية الترجمة.
//
// التشغيل: node scripts/missing-translations.mjs
// ============================================================================

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
if (!url || !key) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY في .env.local');
  process.exit(1);
}
const H = { apikey: key, Authorization: `Bearer ${key}` };

async function get(qs) {
  const res = await fetch(`${url}/rest/v1/${qs}`, { headers: H });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const ar = await get(
  'content_translations?select=slug,content_id,content:content_id(content_type,status)&lang=eq.ar&limit=1000'
);
const en = await get('content_translations?select=content_id&lang=eq.en&limit=1000');
const translated = new Set(en.map((r) => r.content_id));

const published = ar.filter((r) => r.content?.status === 'published');
const missing = published.filter((r) => !translated.has(r.content_id));

const byType = missing.reduce((acc, r) => {
  const t = r.content.content_type;
  acc[t] = (acc[t] || 0) + 1;
  return acc;
}, {});

console.log('=== تغطية الترجمة الإنجليزية ===');
console.log(`منشور بالعربية : ${published.length}`);
console.log(`مترجم للإنجليزية: ${published.length - missing.length}`);
console.log(`بلا ترجمة      : ${missing.length}`);
console.log('\nالتوزيع حسب النوع:');
for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  - ${type}: ${count}`);
}
console.log('\nأول 10 عناصر بلا ترجمة:');
for (const r of missing.slice(0, 10)) {
  console.log(`  - /${r.content.content_type}/${r.slug}`);
}
