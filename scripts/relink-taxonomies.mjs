// scripts/relink-taxonomies.mjs
// ============================================================================
// إعادة ربط هرم التصنيفات ليصبح متماسكًا: باب ← مجال ← فرع ← تصنيف.
//
// المشكلة: كانت المجالات (field) كلها بلا أب، و34 فرعًا (subbranch) بلا أب،
// وبعض الفروع معلّقة بأبواب لا بمجالاتها، فظهر الهرم في لوحة التحكم مبعثرًا.
//
// الحل: مصفوفة ربط صريحة (kind:slug ← kind:slug) مبنية على المنطق العلمي،
// المفتاح واحد للغتين لأنّ المعرّفات متطابقة في العربية والإنجليزية.
//
// التشغيل:
//   node scripts/relink-taxonomies.mjs            (معاينة + شجرة)
//   node scripts/relink-taxonomies.mjs --commit   (تنفيذ)
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
const COMMIT = process.argv.includes('--commit');
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

/**
 * الأب المطلوب لكل عقدة، بصيغة `kind:slug`.
 * القيمة null تعني «يبقى في الجذر».
 */
const PARENTS = {
  // ---- المجالات تحت الأبواب ----
  'field:aqeedah': 'branch:aqeedah',
  'field:fiqh': 'branch:fiqh',
  'field:usul': 'branch:fiqh',
  'field:hadith': 'branch:hadith',
  'field:quran-sciences': 'branch:quran',
  'field:tafsir': 'branch:quran',
  'field:tajweed': 'branch:quran',
  'field:seerah': 'branch:seerah',
  'field:history': 'branch:seerah',
  'field:comparative': 'branch:responses',
  'field:akhlaq': 'branch:tazkiyah',
  'field:dawah': 'branch:dawah',
  'field:economics': 'branch:fiqh',
  'field:family': 'branch:fiqh',
  'field:faraaid': 'branch:fiqh',
  'field:arabic': null,
  'field:contemporary': null,
  'field:youth': null,

  // ---- فروع العقيدة ----
  'subbranch:tawhid': 'field:aqeedah',
  'subbranch:names-attributes': 'field:aqeedah',
  'subbranch:qadar': 'field:aqeedah',
  'subbranch:sects': 'field:aqeedah',
  'subbranch:nubuwwah': 'field:aqeedah',

  // ---- فروع القرآن وعلومه ----
  'subbranch:asbab-nuzul': 'field:quran-sciences',
  'subbranch:hifz': 'field:quran-sciences',
  'subbranch:ijaz-quran': 'field:quran-sciences',
  'subbranch:nasikh': 'field:quran-sciences',
  'subbranch:wujuh-nazair': 'field:quran-sciences',
  'subbranch:qiraat': 'field:tajweed',
  'subbranch:tafsir': 'field:tafsir',
  'subbranch:tajweed': 'field:tajweed',

  // ---- فروع الحديث ----
  'subbranch:mustalah': 'field:hadith',
  'subbranch:six-books': 'field:hadith',
  'subbranch:ilal': 'field:hadith',
  'subbranch:takhrij': 'field:hadith',
  'subbranch:mawduat': 'field:hadith',
  'subbranch:tarajim': 'field:hadith',
  'subbranch:ahkam': 'field:hadith',

  // ---- فروع الفقه ----
  'subbranch:ibadat': 'field:fiqh',
  'subbranch:muamalat': 'field:fiqh',
  'subbranch:comparative-fiqh': 'field:fiqh',
  'subbranch:qawaid-fiqhiyyah': 'field:fiqh',
  'subbranch:jinayat': 'field:fiqh',
  'subbranch:siyasah-shariah': 'field:fiqh',

  // ---- فروع أصول الفقه ----
  'subbranch:aam-khas': 'field:usul',
  'subbranch:maqasid': 'field:usul',
  'subbranch:usul-fiqh': 'field:usul',

  // ---- فروع السيرة والتاريخ ----
  'subbranch:seerah-nabawiyah': 'field:seerah',
  'subbranch:khulafa': 'field:seerah',
  'subbranch:ahl-bayt': 'field:seerah',
  'subbranch:islamic-history': 'field:history',
  'subbranch:ansab': 'field:history',
  'subbranch:buldan': 'field:history',

  // ---- فروع التزكية والأخلاق ----
  'subbranch:tazkiyah-nafs': 'field:akhlaq',
  'subbranch:akhlaq': 'field:akhlaq',
  'subbranch:amal-qulub': 'field:akhlaq',
  'subbranch:adab-shariah': 'field:akhlaq',
  'subbranch:raqaiq': 'field:akhlaq',
  'subbranch:adhkar-duaa': 'branch:tazkiyah',

  // ---- فروع الدعوة ----
  'subbranch:dawah-manhaj': 'field:dawah',
  'subbranch:khutab': 'field:dawah',
  'subbranch:majalis': 'field:dawah',

  // ---- فروع اللغة العربية ----
  'subbranch:nahw': 'field:arabic',
  'subbranch:sarf': 'field:arabic',
  'subbranch:balaghah': 'field:arabic',
  'subbranch:adab': 'field:arabic',
  'subbranch:mantiq': 'field:arabic',

  // ---- فروع مقارنة الأديان والردود ----
  'subbranch:comparative-religion': 'field:comparative',
  'subbranch:atheism': 'field:comparative',
  'subbranch:batiniyyah': 'field:comparative',
  'subbranch:eastern-religions': 'field:comparative',
  'subbranch:judaism-christianity': 'field:comparative',
  'subbranch:feminism': 'field:comparative',
  'subbranch:secularism': 'field:comparative',
  'subbranch:missionary': 'field:comparative',
  'subbranch:women-responses': 'field:comparative',
  'subbranch:dialogue': 'field:comparative',

  // ---- فروع القضايا المعاصرة ----
  'subbranch:medicine': 'field:contemporary',
  'subbranch:technology': 'field:contemporary',
  'subbranch:environment': 'field:contemporary',
  'subbranch:minorities': 'field:contemporary',

  // ---- بوابة غير المسلمين والأدوات (تبقى تحت أبوابها) ----
  'subbranch:islam-intro': 'branch:non-muslim',
  'subbranch:convert-guide': 'branch:non-muslim',
  'subbranch:adhkar': 'branch:tools',
  'subbranch:daily-adhkar': 'branch:tools',
  'subbranch:prayer-times': 'branch:tools',
  'subbranch:qibla': 'branch:tools',

  // ---- التصنيفات ----
  'category:places': 'field:history',
  'category:projects': null,
};

const KIND_ORDER = { branch: 0, field: 1, subbranch: 2, category: 3 };

async function main() {
  const res = await fetch(
    `${URL}/rest/v1/taxonomies?select=id,kind,lang,slug,name,parent_id&limit=1000`,
    { headers: H }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const rows = await res.json();

  const key = (r) => `${r.kind}:${r.slug}`;
  const byKeyLang = new Map(rows.map((r) => [`${key(r)}|${r.lang}`, r]));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const changes = [];
  const problems = [];

  for (const r of rows) {
    const spec = PARENTS[key(r)];
    if (!spec) continue; // غير مذكور = لا تغيير
    let desired = null;
    if (spec !== null) {
      const parent = byKeyLang.get(`${spec}|${r.lang}`);
      if (!parent) {
        problems.push(`الأب غير موجود: ${spec} (${r.lang}) لـ ${key(r)}`);
        continue;
      }
      desired = parent.id;
    }
    if ((r.parent_id ?? null) !== desired) {
      changes.push({ row: r, desired, from: r.parent_id ?? null });
    }
  }

  for (const r of rows) {
    if (!PARENTS[key(r)]) continue;
    if (!byKeyLang.has(`${key(r)}|ar`)) problems.push(`مفقود بالعربية: ${key(r)}`);
    if (!byKeyLang.has(`${key(r)}|en`)) problems.push(`مفقود بالإنجليزية: ${key(r)}`);
  }

  const notCovered = rows.filter((r) => !(key(r) in PARENTS));
  const orphans = rows.filter((r) => key(r) in PARENTS && !r.parent_id && PARENTS[key(r)] === null);

  console.log('=== إعادة ربط هرم التصنيفات ===');
  console.log(`صفوف التصنيفات    : ${rows.length}`);
  console.log(`حقول مطلوب تغييرها: ${changes.length}`);
  console.log(`بلا أب بعد الربط  : ${orphans.length} (أبواب ومجالات مستقلة)`);
  if (problems.length) {
    console.log('مشكلات:');
    for (const p of problems) console.log(`  ✖ ${p}`);
  }
  if (notCovered.length) {
    console.log(`عقد لم تذكر في المصفوفة (${notCovered.length}): ${notCovered
      .map((r) => `${r.kind}:${r.slug}`)
      .slice(0, 12)
      .join(' · ')}`);
  }

  // ---- عرض الشجرة العربية الناتجة ----
  const ar = rows.filter((r) => r.lang === 'ar');
  const parentOf = new Map(ar.map((r) => [r.id, r.parent_id ?? null]));
  for (const c of changes) {
    if (c.row.lang !== 'ar') continue;
    parentOf.set(c.row.id, c.desired);
  }
  const childrenOf = new Map();
  for (const r of ar) {
    const p = parentOf.get(r.id);
    if (!childrenOf.has(p)) childrenOf.set(p, []);
    childrenOf.get(p).push(r);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) || a.slug.localeCompare(b.slug));
  }

  const seen = new Set();
  const render = (parentId, depth) => {
    for (const node of childrenOf.get(parentId) ?? []) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      console.log(`${'   '.repeat(depth)}${depth ? '└ ' : ''}${node.name}  [${node.kind}/${node.slug}]`);
      if (depth < 3) render(node.id, depth + 1);
    }
  };

  console.log('\n---------------- الشجرة العربية الناتجة ----------------');
  render(null, 0);
  const unreached = ar.filter((r) => !seen.has(r.id));
  if (unreached.length) {
    console.log(`\n✖ عقد غير متصلة (${unreached.length}): ${unreached.map((r) => `${r.kind}:${r.slug}`).join(' · ')}`);
  }

  if (!COMMIT) {
    console.log('\n(معاينة فقط) للتنفيذ: --commit');
    return;
  }

  let done = 0;
  for (const c of changes) {
    const r2 = await fetch(`${URL}/rest/v1/taxonomies?id=eq.${c.row.id}`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify({ parent_id: c.desired }),
    });
    if (!r2.ok) throw new Error(`PATCH ${c.row.slug}: ${r2.status} ${await r2.text()}`);
    done += 1;
  }
  console.log(`\n✔ تم تحديث ${done} تصنيفًا.`);
  void byId;
}

main().catch((err) => {
  console.error('✖ فشل:', err.message);
  process.exit(1);
});
