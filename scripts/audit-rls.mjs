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
const SERVICE = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const AS_JSON = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');
const REQUEST_TIMEOUT_MS = Math.min(Math.max(Number(env.QA_HTTP_TIMEOUT_MS) || 8000, 1000), 30000);

if (!URL || !ANON) {
  console.error('✖ NEXT_PUBLIC_SUPABASE_URL أو NEXT_PUBLIC_SUPABASE_ANON_KEY غير مضبوط.');
  process.exit(2);
}

const PRIVATE_TABLES = [
  'admin_users', 'admin_login_attempts', 'user_roles', 'users', 'audit_log',
  'activity_log', 'page_views', 'analytics_events', 'site_settings', 'review_queue',
  'content_revisions', 'newsletter_subscribers', 'dawah_journey_subscribers',
  'dawah_request_assignments', 'learner_content_progress', 'user_favorites',
  'user_questions', 'media_library', 'rate_limits', 'push_subscriptions', 'admin_mfa',
];
const PUBLIC_TABLES = ['content', 'content_translations', 'taxonomies', 'content_terms'];

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function countWithServiceKey(table) {
  if (!SERVICE) return null;
  try {
    const res = await fetchWithTimeout(URL + '/rest/v1/' + table + '?select=*&limit=1', {
      headers: { apikey: SERVICE, Authorization: 'Bearer ' + SERVICE, Prefer: 'count=exact' },
    });
    if (res.status === 404 || !res.ok) return null;
    const range = res.headers.get('content-range') || '';
    const total = Number(range.split('/')[1] ?? '0');
    return Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
}

async function probe(table) {
  try {
    const res = await fetchWithTimeout(URL + '/rest/v1/' + table + '?select=*&limit=1', {
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, Prefer: 'count=exact' },
    });
    if (res.status === 404) return { state: 'missing', rows: 0 };
    if (res.status !== 200 && res.status !== 206) return { state: 'blocked', rows: 0 };
    const range = res.headers.get('content-range') || '';
    const total = Number(range.split('/')[1] ?? '0');
    if (total > 0) return { state: 'leaking', rows: total };
    const serviceRows = await countWithServiceKey(table);
    if (serviceRows !== null && serviceRows > 0) return { state: 'blocked', rows: 0, evidence: 'service_rows_hidden' };
    return { state: 'open', rows: total };
  } catch (error) {
    return { state: 'error', rows: 0, error: String(error) };
  }
}

const [privateResults, publicResults] = await Promise.all([
  Promise.all(PRIVATE_TABLES.map(async (table) => ({ table, ...(await probe(table)) }))),
  Promise.all(PUBLIC_TABLES.map(async (table) => ({ table, ...(await probe(table)) }))),
]);
const leaking = privateResults.filter((row) => row.state === 'leaking');
const open = privateResults.filter((row) => row.state === 'open');
const errors = privateResults.filter((row) => row.state === 'error');
const publicBroken = publicResults.filter((row) => row.state !== 'leaking' && row.state !== 'open');
const strictFailure = leaking.length || open.length || errors.length || publicBroken.length;

if (AS_JSON) {
  console.log(JSON.stringify({
    leaking: leaking.map((row) => ({ table: row.table, rows: row.rows })),
    open: open.map((row) => row.table),
    errors: errors.map((row) => ({ table: row.table, error: row.error })),
    publicBroken: publicBroken.map((row) => ({ table: row.table, state: row.state })),
    privateResults,
    publicResults,
  }, null, 2));
  process.exit(STRICT && strictFailure ? 1 : 0);
}

const STATE_LABELS = {
  leaking: '✖ مكشوف وبه بيانات', open: '⚠ منفَّذ لكن فارغ (خطر كامن)',
  blocked: '✔ محجوب', missing: '✔ غير موجود', error: '؟ تعذّر الفحص',
};
console.log('============================================================');
console.log(' تدقيق RLS — ما يقرأه الزائر المجهول بالمفتاح العام');
console.log('============================================================\n');
console.log('— جداول خاصة:');
for (const row of privateResults) {
  const extra = row.state === 'leaking' ? ' (' + row.rows + ' صفًّا)' : '';
  console.log(' ' + row.table.padEnd(26) + ' ' + STATE_LABELS[row.state] + extra);
}
console.log('\n— جداول عامة (يجب أن تبقى مقروءة):');
for (const row of publicResults) {
  const ok = row.state === 'leaking' || row.state === 'open';
  console.log(' ' + row.table.padEnd(26) + ' ' + (ok ? '✔ متاح' : '✖ غير متاح (' + row.state + ')'));
}
console.log('');
if (!strictFailure) {
  console.log('✅ ٠ جدول خاص مكشوف · كل الجداول العامة متاحة.');
  process.exit(0);
}
if (leaking.length) {
  console.log('🚨 تسريب فعلي: ' + leaking.map((row) => row.table).join(' · '));
  console.log(' الحل: نفّذ supabase/migrations/20261017_rls_hardening.sql أو supabase/APPLY_MISSING_TO_PRODUCTION.sql في SQL Editor.');
}
if (open.length) console.log('⚠ جداول قابلة للقراءة (فارغة الآن): ' + open.map((row) => row.table).join(' · '));
if (errors.length) console.log('⚠ تعذّر فحص الجداول: ' + errors.map((row) => row.table).join(' · ') + ' — راجع الشبكة أو QA_HTTP_TIMEOUT_MS.');
if (publicBroken.length) console.log('❌ جداول عامة لم تعد متاحة: ' + publicBroken.map((row) => row.table).join(' · ') + ' — تحقّق من سياسات RLS.');
console.log(STRICT ? '❌ التدقيق لم ينجح.' : 'ℹ️ تقرير فقط — شغّل مع --strict لجعله إلزاميًّا.');
process.exit(STRICT ? 1 : 0);
