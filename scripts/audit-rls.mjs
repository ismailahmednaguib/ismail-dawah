// scripts/audit-rls.mjs
// ============================================================================
// تدقيق RLS — يكشف ما يقرأه الزائر المجهول (المفتاح العام anon) دون حقّ.
//
// الطريقة: طلب REST بمفتاح anon (نفس ما يملكه أي زائر) على كل جدول حسّاس.
//   • «مكشوف وبه بيانات»  → خطر حرج (تسريب فعلي).
//   • «منفَّذ ولكن فارغ»   → خطر كامن (يُسرّب فور امتلاء الجدول).
//
// التشغيل: node scripts/audit-rls.mjs
//          node scripts/audit-rls.mjs --json
//          node scripts/audit-rls.mjs --strict   (يُفشل عند أي كشف)
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
const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const AS_JSON = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');

if (!URL || !ANON) {
  console.error('✖ NEXT_PUBLIC_SUPABASE_URL أو NEXT_PUBLIC_SUPABASE_ANON_KEY غير مضبوط.');
  process.exit(2);
}

/** جداول يجب ألّا يقرأها الزائر المجهول (بيانات شخصية أو تشغيلية). */
const PRIVATE_TABLES = [
  'admin_users',
  'admin_login_attempts',
  'user_roles',
  'users',
  'audit_log',
  'activity_log',
  'page_views',
  'analytics_events',
  'site_settings',
  'review_queue',
  'content_revisions',
  'newsletter_subscribers',
  'dawah_journey_subscribers',
  'dawah_request_assignments',
  'learner_content_progress',
  'user_favorites',
  'user_questions',
  'media_library',
  'rate_limits',
  'push_subscriptions',
];

/** جداول عامة بطبيعتها — يجب أن تبقى مقروءة للمفتاح العام. */
const PUBLIC_TABLES = [
  'content',
  'content_translations',
  'taxonomies',
  'content_terms',
];

/** يعيد حالة القراءة: غير موجود · محجوب · منفَّذ-وفارغ · به بيانات. */
async function probe(table) {
  try {
    const res = await fetch(`${URL}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        Prefer: 'count=exact',
      },
    });

    if (res.status === 404) return { state: 'missing', rows: 0 };
    if (res.status !== 200 && res.status !== 206) return { state: 'blocked', rows: 0 };

    const range = res.headers.get('content-range') || '';
    const total = Number(range.split('/')[1] ?? '0');
    return { state: total > 0 ? 'leaking' : 'open', rows: total };
  } catch (error) {
    return { state: 'error', rows: 0, error: String(error) };
  }
}

const privateResults = [];
for (const table of PRIVATE_TABLES) {
  privateResults.push({ table, ...(await probe(table)) });
}

const publicResults = [];
for (const table of PUBLIC_TABLES) {
  publicResults.push({ table, ...(await probe(table)) });
}

const leaking = privateResults.filter((row) => row.state === 'leaking');
const open = privateResults.filter((row) => row.state === 'open');
const publicBroken = publicResults.filter((row) => row.state !== 'leaking' && row.state !== 'open');

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        leaking: leaking.map((row) => ({ table: row.table, rows: row.rows })),
        open: open.map((row) => row.table),
        publicBroken: publicBroken.map((row) => ({ table: row.table, state: row.state })),
        privateResults,
        publicResults,
      },
      null,
      2
    )
  );
  process.exit(STRICT && (leaking.length || open.length) ? 1 : 0);
}

const STATE_LABELS = {
  leaking: '✖ مكشوف وبه بيانات',
  open: '⚠ منفَّذ لكن فارغ (خطر كامن)',
  blocked: '✔ محجوب',
  missing: '✔ غير موجود',
  error: '؟ تعذّر الفحص',
};

console.log('============================================================');
console.log('  تدقيق RLS — ما يقرأه الزائر المجهول بالمفتاح العام');
console.log('============================================================');
console.log('');
console.log('— جداول خاصة:');
for (const row of privateResults) {
  const extra = row.state === 'leaking' ? ` (${row.rows} صفًّا)` : '';
  console.log(`   ${row.table.padEnd(26)} ${STATE_LABELS[row.state]}${extra}`);
}

console.log('');
console.log('— جداول عامة (يجب أن تبقى مقروءة):');
for (const row of publicResults) {
  const ok = row.state === 'leaking' || row.state === 'open';
  console.log(
    `   ${row.table.padEnd(26)} ${ok ? '✔ متاح' : `✖ غير متاح (${row.state})`}`
  );
}

console.log('');
if (!leaking.length && !open.length && !publicBroken.length) {
  console.log('✅ ٠ جدول خاص مكشوف · كل الجداول العامة متاحة.');
  process.exit(0);
}

if (leaking.length) {
  console.log(`🚨 تسريب فعلي: ${leaking.map((row) => row.table).join(' · ')}`);
  console.log('   الحل: نفّذ supabase/migrations/20261017_rls_hardening.sql أو supabase/APPLY_MISSING_TO_PRODUCTION.sql في SQL Editor.');
}
if (open.length) {
  console.log(`⚠ جداول قابلة للقراءة (فارغة الآن): ${open.map((row) => row.table).join(' · ')}`);
}
if (publicBroken.length) {
  console.log(`❌ جداول عامة لم تعد متاحة: ${publicBroken.map((row) => row.table).join(' · ')} — تحقّق من سياسات RLS.`);
}

console.log(
  STRICT ? '❌ التدقيق لم ينجح.' : 'ℹ️ تقرير فقط — شغّل مع --strict لجعله إلزاميًّا.'
);
process.exit(STRICT && (leaking.length || open.length) ? 1 : 0);
