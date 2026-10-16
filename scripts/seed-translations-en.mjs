// scripts/seed-translations-en.mjs
// ============================================================================
// يُضيف الترجمات الإنجليزية للمحتوى المنشور الذي لا ترجمة له.
// يُستخدم نفس الـslug العربي في الترجمة الإنجليزية (الاصطلاح السائد في الموقع)،
// لأن مبدّل اللغة يبدّل مقطع اللغة فقط ويُبقي بقية المسار كما هو.
//
// الترجمة آلية بمساعدة الذكاء الاصطناعي، فتُوسم في قاعدة البيانات:
// is_machine_translated = true · is_reviewed = false (حتى تُراجَع بشريًا).
//
// التشغيل:
//   node scripts/seed-translations-en.mjs            (معاينة)
//   node scripts/seed-translations-en.mjs --commit   (تنفيذ)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { TRANSLATIONS as PART_1 } from './translations-en-1.mjs';
import { TRANSLATIONS as PART_2 } from './translations-en-2.mjs';

const DATA = { ...PART_1, ...PART_2 };

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

async function upsert(table, rows, onConflict) {
  if (!COMMIT || rows.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} failed: ${res.status} ${await res.text()}`);
  return rows.length;
}

async function main() {
  const all = await rest(
    'content_translations?select=slug,lang,content_id,content:content_id(content_type,status)&limit=2000'
  );

  const arBySlug = new Map();
  const enContentIds = new Set();
  for (const row of all) {
    if (row.lang === 'ar') arBySlug.set(row.slug, row);
    if (row.lang === 'en') enContentIds.add(row.content_id);
  }

  const rows = [];
  const notFound = [];
  const skippedTranslated = [];

  for (const [slug, t] of Object.entries(DATA)) {
    const ar = arBySlug.get(slug);
    if (!ar) {
      notFound.push(slug);
      continue;
    }
    if (ar.content?.status !== 'published') continue;
    if (enContentIds.has(ar.content_id)) {
      skippedTranslated.push(slug);
      continue;
    }
    rows.push({
      content_id: ar.content_id,
      lang: 'en',
      slug: ar.slug,
      title: t.title,
      summary: t.summary ?? null,
      body: t.body ?? null,
      body_plain: t.body ?? null,
      is_machine_translated: true,
      is_reviewed: false,
    });
  }

  // ما تبقّى بلا ترجمة بعد هذه الدفعة
  const stillMissing = [...arBySlug.values()].filter(
    (r) => r.content?.status === 'published' && !enContentIds.has(r.content_id) && !(r.slug in DATA)
  );

  console.log('=== زرع الترجمات الإنجليزية ===');
  console.log(`مدخلات في ملفات البيانات : ${Object.keys(DATA).length}`);
  console.log(`ترجمات جاهزة للزرع       : ${rows.length}`);
  console.log(`مترجمة مسبقًا (تُتخطى)    : ${skippedTranslated.length}`);
  console.log(`ما زال بلا ترجمة بعدها   : ${stillMissing.length}`);
  if (notFound.length) {
    console.warn(`⚠ معرّفات في ملفات البيانات غير موجودة (${notFound.length}):`);
    for (const s of notFound) console.warn(`   - ${s}`);
  }

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ: --commit');
    return;
  }

  let written = 0;
  for (let i = 0; i < rows.length; i += 40) {
    written += await upsert('content_translations', rows.slice(i, i + 40), 'content_id,lang');
  }
  console.log(`✔ كُتب ${written} صفًا.`);
  if (stillMissing.length) {
    console.log('عناصر متبقّية بلا ترجمة:');
    for (const r of stillMissing.slice(0, 15)) console.log(`   - [${r.content.content_type}] ${r.slug}`);
  }
}

main().catch((err) => {
  console.error('✖ فشل:', err.message);
  process.exit(1);
});
