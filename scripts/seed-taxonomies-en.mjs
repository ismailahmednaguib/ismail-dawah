// scripts/seed-taxonomies-en.mjs
// ============================================================================
// يُنشئ صفوف التصنيفات الإنجليزية الناقصة (أبواب وفروع فرعية).
//
// لماذا؟ كانت التصنيفات في قاعدة البيانات عربية فقط (10 أبواب + 69 فرعًا فرعيًا)،
// فكانت صفحات /en/fields/* تعرض أسماءً عربية. هذه الدفعة تُكمل الثنائية.
//
// تُنسخ أيقونة/لون/ترتيب الأصل العربي، ويُربط الأب بالأب الإنجليزي المقابل.
// غير مُتلِف: upsert على (kind, lang, slug) — يمكن تشغيله أكثر من مرة.
//
// التشغيل:
//   node scripts/seed-taxonomies-en.mjs            (معاينة)
//   node scripts/seed-taxonomies-en.mjs --commit   (تنفيذ)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { EN_TAXONOMY_NAMES } from './tax-en-names.mjs';

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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function rest(pathname, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, { headers: H, ...init });
  if (!res.ok) throw new Error(`${pathname}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function upsert(rows) {
  if (!COMMIT || rows.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/taxonomies?on_conflict=kind,lang,slug`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`taxonomies failed: ${res.status} ${await res.text()}`);
  return rows.length;
}

async function main() {
  const ar = await rest('taxonomies?select=id,kind,slug,name,icon,color,sort_order,parent_id&lang=eq.ar&limit=500');
  const en = await rest('taxonomies?select=id,kind,slug&lang=eq.en&limit=500');

  const enByKey = new Map(en.map((t) => [`${t.kind}|${t.slug}`, t.id]));
  const arById = new Map(ar.map((t) => [t.id, t]));

  const candidates = [];
  const unknown = [];

  for (const row of ar) {
    const key = `${row.kind}|${row.slug}`;
    if (enByKey.has(key)) continue; // موجودة أصلًا

    const name = EN_TAXONOMY_NAMES[key];
    if (!name) {
      unknown.push(key);
      continue;
    }

    candidates.push({
      kind: row.kind,
      slug: row.slug,
      name,
      lang: 'en',
      icon: row.icon ?? null,
      color: row.color ?? null,
      sort_order: row.sort_order ?? 0,
      // يُحسب لاحقًا: الأب الإنجليزي المقابل
      _arParentId: row.parent_id ?? null,
    });
  }

  // 1) الأبواب أولًا (بلا أب) ثم الفروع
  const order = { branch: 0, field: 1, subbranch: 2, category: 3 };
  candidates.sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9));

  // 2) ربط الأب بالمقابل الإنجليزي (بعد إدخال الأبواب)
  const parentKeyOf = new Map();
  for (const row of ar) {
    const parent = row.parent_id ? arById.get(row.parent_id) : null;
    if (parent) parentKeyOf.set(`${row.kind}|${row.slug}`, `${parent.kind}|${parent.slug}`);
  }

  console.log('=== زرع التصنيفات الإنجليزية ===');
  console.log(`ناقصة ولها اسم إنجليزي : ${candidates.length}`);
  console.log(`ناقصة بلا اسم إنجليزي   : ${unknown.length}`);
  if (unknown.length) console.log('   ' + unknown.join(' · '));

  const rows = [];

  // الأبواب (بلا أب) — تُزرع أولًا لتُصبح معرّفاتها معروفة
  for (const c of candidates.filter((x) => !x._arParentId)) {
    rows.push({
      kind: c.kind,
      slug: c.slug,
      name: c.name,
      lang: 'en',
      icon: c.icon,
      color: c.color,
      sort_order: c.sort_order,
      parent_id: null,
    });
  }

  if (COMMIT) await upsert(rows);
  console.log(`  · بلا أب: ${rows.length}`);

  // نقرأ معرّفات الإنجليزي بعد الزرع (الأبواب) لربط الفروع بها
  const enNow = COMMIT
    ? await rest('taxonomies?select=id,kind,slug&lang=eq.en&limit=500')
    : en;
  const enKeyToId = new Map(enNow.map((t) => [`${t.kind}|${t.slug}`, t.id]));

  const children = [];
  for (const c of candidates.filter((x) => x._arParentId)) {
    const parentKey = parentKeyOf.get(`${c.kind}|${c.slug}`);
    children.push({
      kind: c.kind,
      slug: c.slug,
      name: c.name,
      lang: 'en',
      icon: c.icon,
      color: c.color,
      sort_order: c.sort_order,
      parent_id: parentKey ? enKeyToId.get(parentKey) ?? null : null,
    });
  }

  if (COMMIT) await upsert(children);
  console.log(`  · بلا أب مرتبط: ${children.filter((c) => !c.parent_id).length}`);

  const linked = children.filter((c) => c.parent_id).length;
  console.log(`  · مرتبطة بأب إنجليزي: ${linked}`);

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ: --commit');
    return;
  }

  console.log('✔ تم الزرع بنجاح.');
}

main().catch((err) => {
  console.error('✖ فشل:', err.message);
  process.exit(1);
});
