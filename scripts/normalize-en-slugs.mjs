// scripts/normalize-en-slugs.mjs
// ============================================================================
// يوحّد الـslug بين الترجمة العربية والإنجليزية لنفس المحتوى.
// السبب: مبدّل اللغة في الموقع يبدّل مقطع اللغة فقط ويُبقي بقية المسار،
// فلو اختلف الـslug بين اللغتين لانكسر رابط التبديل (404).
//
// التشغيل:
//   node scripts/normalize-en-slugs.mjs            (معاينة)
//   node scripts/normalize-en-slugs.mjs --commit   (تنفيذ)
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

const root = process.cwd();
const env = { ...loadEnv(path.join(root, '.env.local')), ...loadEnv(path.join(root, '.env')), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function rest(qs, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${qs}`, { headers: H, ...init });
  if (!res.ok) throw new Error(`${qs}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function main() {
  const all = await rest('content_translations?select=content_id,lang,slug&limit=2000');

  const byContent = new Map();
  for (const row of all) {
    if (!byContent.has(row.content_id)) byContent.set(row.content_id, {});
    byContent.get(row.content_id)[row.lang] = row.slug;
  }

  const fixes = [];
  for (const [contentId, langs] of byContent) {
    if (langs.ar && langs.en && langs.ar !== langs.en) {
      fixes.push({ contentId, from: langs.en, to: langs.ar });
    }
  }

  console.log('=== توحيد روابط الترجمة الإنجليزية ===');
  console.log(`أزواج بروابط مختلفة: ${fixes.length}`);
  for (const f of fixes.slice(0, 40)) {
    console.log(`  ${f.from}  →  ${f.to}`);
  }

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ: --commit');
    return;
  }

  for (const f of fixes) {
    await rest(
      `content_translations?content_id=eq.${f.contentId}&lang=eq.en`,
      { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ slug: f.to }) }
    );
  }
  console.log(`✔ صُحّح ${fixes.length} رابطًا.`);
}

main().catch((err) => {
  console.error('✖ فشل:', err.message);
  process.exit(1);
});
