// scripts/seed-topics-content.mjs
// ============================================================================
// تعبئة المواضيع الفرعية الجديدة بمحتوى عربي موثّق + ترجمة إنجليزية.
// غير مُتلِف: upsert بمعرّفات ثابتة (يمكن تشغيله أكثر من مرة).
//
// التشغيل:
//   node scripts/seed-topics-content.mjs            (معاينة)
//   node scripts/seed-topics-content.mjs --commit   (تنفيذ)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { TOPICS as BATCH_1 } from './topics-data.mjs';
import { TOPICS as BATCH_2 } from './topics-data-2.mjs';
import { TOPICS as BATCH_3 } from './topics-data-3.mjs';
import { TOPICS as BATCH_4 } from './topics-data-4.mjs';
import { TOPICS as BATCH_5 } from './topics-data-5.mjs';
import { TOPICS as BATCH_6 } from './topics-data-6.mjs';

/** كل دفعات المحتوى مجمّعة. */
const TOPICS = [...BATCH_1, ...BATCH_2, ...BATCH_3, ...BATCH_4, ...BATCH_5, ...BATCH_6];

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

const root = path.resolve(process.cwd());
const env = { ...loadEnv(path.join(root, '.env.local')), ...loadEnv(path.join(root, '.env')), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

function detUuid(seed) {
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function rest(pathname, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, { headers: H, ...init });
  if (!res.ok) throw new Error(`${pathname}: ${res.status} ${await res.text()}`);
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
  const taxonomies = await rest('taxonomies?select=id,kind,lang,slug');
  const byKey = new Map(taxonomies.map((t) => [`${t.kind}|${t.lang}|${t.slug}`, t.id]));

  const contents = [];
  const translations = [];
  const terms = [];
  const missing = [];

  TOPICS.forEach((topic, i) => {
    const kind = topic.kind ?? 'subbranch';
    const taxonomyId = byKey.get(`${kind}|ar|${topic.sub}`);
    if (!taxonomyId) missing.push(`${kind}:${topic.sub}`);

    const id = detUuid(`content:topic:${topic.slug}`);
    contents.push({
      id,
      content_type: topic.type,
      status: 'published',
      lang_original: 'ar',
      audience: topic.audience ?? ['muslim_general', 'non_muslim'],
      age_groups: ['all'],
      levels: topic.levels ?? ['beginner', 'intermediate'],
      madhhabs: ['general'],
      sort_order: i,
      published_at: new Date().toISOString(),
      views: 0,
      needs_scholar_review: false,
    });

    for (const lang of ['ar', 'en']) {
      const t = topic[lang];
      // نفس الـslug في اللغتين: مبدّل اللغة يبدّل مقطع اللغة فقط ويُبقي بقية المسار،
      // فاختلاف الـslug بين اللغتين يكسر رابط التبديل.
      translations.push({
        content_id: id,
        lang,
        slug: topic.slug,
        title: t.title,
        summary: t.summary,
        body: t.body,
        body_plain: t.body,
        // الترجمة الإنجليزية آلية (بمساعدة الذكاء الاصطناعي) وتحتاج مراجعة بشرية.
        is_machine_translated: lang !== 'ar',
        is_reviewed: false,
      });
    }

    if (taxonomyId) terms.push({ content_id: id, taxonomy_id: taxonomyId });
  });

  console.log('=== خطة زرع مواضيع العلوم ===');
  console.log(`عناصر: ${contents.length} · ترجمات: ${translations.length} · ربط: ${terms.length}`);
  if (missing.length) console.warn(`⚠ تصنيفات غير موجودة (${missing.length}): ${missing.join(', ')}`);

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ: --commit');
    return;
  }

  await upsert('content', contents, 'id');
  await upsert('content_translations', translations, 'content_id,lang');
  await upsert('content_terms', terms, 'content_id,taxonomy_id');
  console.log('✔ تم الزرع بنجاح.');
}

main().catch((err) => {
  console.error('✖ فشل:', err.message);
  process.exit(1);
});
