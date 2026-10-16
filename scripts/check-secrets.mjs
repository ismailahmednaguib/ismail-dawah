// scripts/check-secrets.mjs
// ============================================================================
// فحص تسرّب المفاتيح — يمنع وصول مفتاح الخدمة (service role) إلى المتصفح.
//
// يفحص:
//   ١) هل ظهرت قيمة أي سرّ حقيقي داخل ملف مصدري (بعد استثناء ملفات .env)؟
//   ٢) هل يستورد مكوّن عميلي ("use client") وحدة خادمية وحساسة؟
//   ٣) هل ملفات البيئة مُتعقَّبة في Git؟
//
// التشغيل: node scripts/check-secrets.mjs
// الخروج: 0 نظيف · 1 وُجد تسريب
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

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

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  'dist',
  'build',
  'coverage',
  'android',
]);

const SKIP_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.pdf', '.zip', '.apk', '.keystore']);

const SKIP_FILE = /^\.env(\.|$)|\.example$/;

const SENSITIVE_IMPORTS = [
  '@/lib/supabase/admin',
  '@/lib/admin/session',
  '@/lib/admin/owner',
  '@/lib/email',
];

/** أسماء المتغيرات التي تُعدّ سرًّا (وليست عامة). */
function isSecretName(name) {
  if (name.startsWith('NEXT_PUBLIC_')) return false;
  return /SERVICE|SECRET|PRIVATE|PASSWORD|TOKEN|API_KEY|ACCESS_KEY/i.test(name);
}

const secrets = Object.entries(env)
  .filter(([name, value]) => isSecretName(name) && typeof value === 'string' && value.length >= 16)
  .map(([name, value]) => ({ name, value }));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SKIP_EXT.has(ext)) continue;
      if (SKIP_FILE.test(entry.name)) continue;
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const files = walk('.');
const findings = [];

/** يستورد الملف الوحدة بقيمة فعلية (لا `import type` المُمحى عند البناء). */
function valueImportsModule(text, mod) {
  const target = new RegExp(
    `from\\s*['"]${mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`
  );
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (current === null) {
      if (!/^import\b/.test(trimmed)) continue;
      current = trimmed;
    } else {
      current += ` ${trimmed}`;
    }

    const finished = current.includes(';') || target.test(current);
    if (!finished) continue;

    if (!/^import\s+type\b/.test(current) && target.test(current)) return true;
    current = null;
  }

  return false;
}

// (١) قيمة سرّ حقيقي داخل ملف مصدري
for (const file of files) {
  let text;
  try {
    const stat = fs.statSync(file);
    if (stat.size > 2_000_000) continue;
    text = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const secret of secrets) {
    if (text.includes(secret.value)) {
      findings.push({
        type: 'قيمة سرّ داخل ملف',
        file,
        detail: `قيمة ${secret.name} ظاهرة نصًّا في الملف`,
      });
    }
  }

  // (٢) مكوّن عميلي يستورد وحدة خادمية (نتجاهل `import type` فهي تُمحى عند البناء)
  const isClient = /^\s*["']use client["']/m.test(text);
  if (isClient) {
    for (const mod of SENSITIVE_IMPORTS) {
      if (valueImportsModule(text, mod)) {
        findings.push({
          type: 'مكوّن عميلي يستورد وحدة خادمية',
          file,
          detail: `import من ${mod}`,
        });
      }
    }
  }
}

// (٣) ملفات البيئة متعقَّبة في Git
try {
  const tracked = execSync('git ls-files', { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);

  for (const file of tracked) {
    const base = path.basename(file);
    if (/^\.env(\.local|\.production|\.development)?$/.test(base)) {
      findings.push({
        type: 'ملف بيئة متعقَّب في Git',
        file,
        detail: 'يجب إزالته من التتبّع وإضافته إلى .gitignore',
      });
    }
    if (base.endsWith('.keystore') || base === 'google-services.json') {
      findings.push({ type: 'ملف إصدار متعقَّب', file, detail: 'لا يُرفع إلى المستودع' });
    }
  }
} catch {
  // Git غير متاح — نكمل بالفحوصات الأخرى
}

console.log('==================================================');
console.log('  فحص تسرّب المفاتيح');
console.log('==================================================');
console.log(`  الملفات المفحوصة: ${files.length}`);
console.log(`  المتغيرات السرّية المفحوصة: ${secrets.map((s) => s.name).join(' · ') || '—'}`);
console.log('');

if (findings.length === 0) {
  console.log('✅ لا تسريب: ٠ نتيجة.');
  process.exit(0);
}

for (const finding of findings) {
  console.log(`✖ [${finding.type}] ${finding.file}`);
  console.log(`   ${finding.detail}`);
}

console.log('');
console.log(`❌ وُجد ${findings.length} تسريبًا.`);
process.exit(1);
