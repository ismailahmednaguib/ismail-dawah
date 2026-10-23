// scripts/check-migrations.mjs
// فحص read-only للهجرات التي تغيّر سلوك الإنتاج.
// التشغيل: npm run qa:migrations
// الفشل الصارم: npm run qa:migrations -- --strict

import fs from 'node:fs';

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

const env = { ...loadEnv('.env.local'), ...loadEnv('.env'), ...process.env };
const baseUrl = String(env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const strict = process.argv.includes('--strict');

if (!baseUrl || !serviceKey) {
  console.error('✖ تحتاج NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const checks = [
  {
    name: 'dawah_journey_subscribers',
    query: 'dawah_journey_subscribers?select=id&limit=1',
    migration: '20261016_dawah_journey.sql',
  },
  {
    name: 'dawah_request_assignments',
    query: 'dawah_request_assignments?select=id&limit=1',
    migration: '20261016_dawah_assignments.sql',
  },
  {
    name: 'content_revisions',
    query: 'content_revisions?select=id&limit=1',
    migration: '20261023_content_revisions.sql',
  },
  {
    name: 'push_subscriptions',
    query: 'push_subscriptions?select=id&limit=1',
    migration: '20261024_push_subscriptions.sql',
  },
  {
    name: 'content.scheduled_at',
    query: 'content?select=scheduled_at&limit=1',
    migration: '20261026_scheduled_publishing.sql',
  },
  {
    name: 'admin_mfa',
    query: 'admin_mfa?select=admin_id&limit=1',
    migration: '20261027_admin_mfa.sql',
  },
];

const storageChecks = [
  {
    name: 'storage bucket backups',
    path: '/storage/v1/bucket/backups',
    migration: '20261025_backup_bucket.sql',
  },
];

async function check(item) {
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${item.query}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    return {
      ...item,
      ok: response.ok,
      detail: response.ok ? '' : (await response.text()).slice(0, 180),
    };
  } catch (error) {
    return {
      ...item,
      ok: false,
      detail: error instanceof Error ? error.message : 'تعذر الاتصال',
    };
  }
}

const results = await Promise.all(checks.map(check));
const storageResults = await Promise.all(storageChecks.map(async (item) => {
  try {
    const response = await fetch(`${baseUrl}${item.path}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    return {
      ...item,
      ok: response.ok,
      detail: response.ok ? '' : (await response.text()).slice(0, 180),
    };
  } catch (error) {
    return {
      ...item,
      ok: false,
      detail: error instanceof Error ? error.message : 'تعذر الاتصال',
    };
  }
}));
results.push(...storageResults);
console.log('حالة migrations الإنتاجية (قراءة فقط)');
console.log('--------------------------------------');
for (const result of results) {
  if (result.ok) {
    console.log(`✔ ${result.name} — منفّذة`);
  } else {
    console.log(`⏳ ${result.name} — معلّقة: ${result.migration}`);
    if (result.detail) console.log(`  ${result.detail}`);
  }
}

const missing = results.filter((result) => !result.ok);
if (strict && missing.length > 0) {
  console.error(`\n✖ الفحص الصارم فشل: ${missing.length} migration معلّقة.`);
  process.exit(1);
}

if (missing.length === 0) {
  console.log('\n✅ كل migrations المطلوبة لهذا الفحص منفّذة.');
} else {
  console.log('\nℹ️ نفّذ الملفات المعلّقة يدويًا في Supabase SQL Editor ثم أعد الفحص.');
}
