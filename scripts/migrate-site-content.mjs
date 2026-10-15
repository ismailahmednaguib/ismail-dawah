// scripts/migrate-site-content.mjs
// ============================================================================
// ترحيل محتوى site_content (مخزن JSON القديم) إلى جداول النظام الموحّد:
// content + content_translations + taxonomies + content_terms.
//
// مبادئ السلامة:
//  - غير مُتلِف: لا يحذف site_content ولا يعدّله إطلاقًا.
//  - قابل للتشغيل المتكرر (idempotent): يستخدم معرّفات UUID ثابتة + upsert.
//  - افتراضيًا "معاينة فقط" (dry-run). للتنفيذ الفعلي أضف: --commit
//
// الاستخدام:
//   node scripts/migrate-site-content.mjs            # معاينة
//   node scripts/migrate-site-content.mjs --commit   # تنفيذ
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// ---------------------------------------------------------------- env loading
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
const env = {
  ...loadEnv(path.join(root, '.env.local')),
  ...loadEnv(path.join(root, '.env')),
  ...process.env,
};

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ يجب توفر NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY في .env.local');
  process.exit(1);
}

const COMMIT = process.argv.includes('--commit');

const H = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// ---------------------------------------------------------------- helpers
/** UUID ثابت مشتق من نص (لتشغيل متكرر دون تكرار). */
function detUuid(seed) {
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** حقل نصّي مفرد أو مترجم {ar,en}. */
function pick(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (v && typeof v === 'object') {
      const s = v.ar ?? v.en;
      if (typeof s === 'string' && s.trim()) return s.trim();
    }
  }
  return '';
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function isoOrNow(value) {
  if (typeof value === 'string' && value.trim()) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

// ---------------------------------------------------------------- mapping
// كل مجموعة قديمة -> نوع المحتوى الموحّد.
const COLLECTION_MAP = {
  fatwas: { type: 'fatwa' },
  doubts: { type: 'faq' },
  lessons: { type: 'lesson' },
  articles: { type: 'article' },
  news: { type: 'article' },
  projects: { type: 'page' },
  places: { type: 'page' },
  adhkar: { type: 'duaa' },
  books: { type: 'book' },
  videos: { type: 'video' },
  audio: { type: 'audio' },
  learnSteps: { type: 'lesson' },
};

const TITLE_KEYS = ['title', 'name', 'q', 'question', 'topic', 'heading'];
const SUMMARY_KEYS = ['desc', 'description', 'excerpt', 'summary', 'subtitle'];
const BODY_KEYS = ['a', 'answer', 'body', 'text', 'content', 'details'];

// ---------------------------------------------------------------- fetch source
async function getSourceData() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=data&limit=1`, { headers: H });
  if (!res.ok) throw new Error(`site_content fetch failed: ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]?.data) throw new Error('site_content.data فارغ');
  return rows[0].data;
}

// ---------------------------------------------------------------- build plan
function buildPlan(data) {
  const taxonomies = [];
  const contents = [];
  const translations = [];
  const terms = [];

  // 1) المجالات -> taxonomies
  const fieldBySlug = new Map();
  const fieldByName = new Map();
  (data.fields ?? []).forEach((f, idx) => {
    const slug = slugify(f.slug || f.name || `field-${idx + 1}`);
    const id = detUuid(`taxonomy:field:${slug}`);
    taxonomies.push({
      id,
      kind: 'field',
      lang: 'ar',
      name: pick(f, ['name', 'title']) || slug,
      slug,
      icon: typeof f.icon === 'string' ? f.icon : null,
      color: null,
      sort_order: idx,
    });
    fieldBySlug.set(slug, id);
    fieldByName.set((pick(f, ['name', 'title']) || '').trim(), id);
  });

  // 2) مجموعات المحتوى
  for (const [collection, meta] of Object.entries(COLLECTION_MAP)) {
    const items = data[collection] ?? [];
    if (!Array.isArray(items)) continue;

    items.forEach((item, idx) => {
      const title = pick(item, TITLE_KEYS);
      if (!title) return;

      const rawId = item.id ?? idx + 1;
      const contentId = detUuid(`content:${collection}:${rawId}`);
      const slug = slugify(`${meta.type}-${collection}-${rawId}`);

      contents.push({
        id: contentId,
        content_type: meta.type,
        status: 'published',
        lang_original: 'ar',
        audience: ['muslim_general'],
        age_groups: ['all'],
        levels: ['beginner'],
        madhhabs: ['general'],
        sort_order: idx,
        published_at: isoOrNow(item.date || item.published_at || item.created_at),
        views: 0,
        needs_scholar_review: false,
      });

      translations.push({
        content_id: contentId,
        lang: 'ar',
        slug,
        title,
        summary: pick(item, SUMMARY_KEYS) || null,
        body: pick(item, BODY_KEYS) || null,
        body_plain: pick(item, BODY_KEYS) || null,
        is_machine_translated: false,
        is_reviewed: false,
      });

      // ربط بالمجال إن وُجد
      const fieldRef = typeof item.field === 'string' ? item.field.trim() : '';
      if (fieldRef) {
        const taxId = fieldBySlug.get(slugify(fieldRef)) || fieldByName.get(fieldRef);
        if (taxId) terms.push({ content_id: contentId, taxonomy_id: taxId });
      }
    });
  }

  return { taxonomies, contents, translations, terms };
}

// ---------------------------------------------------------------- upsert
async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`${table} upsert failed: ${res.status} ${await res.text()}`);
  }
  return rows.length;
}

// ---------------------------------------------------------------- main
async function main() {
  const data = await getSourceData();
  const plan = buildPlan(data);

  console.log('=== خطة الترحيل ===');
  console.log(`taxonomies           : ${plan.taxonomies.length}`);
  console.log(`content              : ${plan.contents.length}`);
  console.log(`content_translations : ${plan.translations.length}`);
  console.log(`content_terms        : ${plan.terms.length}`);

  const byType = {};
  for (const c of plan.contents) byType[c.content_type] = (byType[c.content_type] || 0) + 1;
  console.log('الأنواع:', JSON.stringify(byType));

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ أضف: --commit');
    console.log('نموذج:', JSON.stringify(plan.translations[0], null, 2));
    return;
  }

  console.log('\nجارٍ الترحيل...');
  await upsert('taxonomies', plan.taxonomies, 'kind,lang,slug');
  await upsert('content', plan.contents, 'id');
  await upsert('content_translations', plan.translations, 'content_id,lang');
  await upsert('content_terms', plan.terms, 'content_id,taxonomy_id');
  console.log('✔ تم الترحيل بنجاح (site_content لم يتغيّر).');
}

main().catch((err) => {
  console.error('✖ فشل الترحيل:', err.message);
  process.exit(1);
});
