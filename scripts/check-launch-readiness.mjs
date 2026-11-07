import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const AS_JSON = process.argv.includes('--json');
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(LF)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    const raw = line.slice(i + 1).trim();
    out[key] = raw.length >= 2 && ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) ? raw.slice(1, -1) : raw;
  }
  return out;
}

function withoutCr(value) {
  return value.endsWith(CR) ? value.slice(0, -1) : value;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === LF) {
      row.push(withoutCr(field));
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) {
    row.push(withoutCr(field));
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }
  return rows;
}

function queueReport(file, doneStatuses) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) return { file, present: false, total: 0, done: 0, pending: 0, statuses: {} };
  const rows = parseCsv(fs.readFileSync(fullPath, 'utf8'));
  const header = rows.shift() ?? [];
  const statusIndex = header.indexOf('status');
  if (statusIndex < 0) return { file, present: true, valid: false, total: 0, done: 0, pending: 0, statuses: {} };
  const statuses = {};
  let done = 0;
  for (const row of rows) {
    const status = (row[statusIndex] ?? '').trim().toLowerCase() || 'missing';
    statuses[status] = (statuses[status] ?? 0) + 1;
    if (doneStatuses.includes(status)) done += 1;
  }
  return { file, present: true, valid: true, total: rows.length, done, pending: rows.length - done, statuses };
}

function readEvidence(file) {
  const fullPath = path.join(ROOT, file);
  const expected = [
    { id: 'backup-restore', required: true },
    { id: 'migration-ledger', required: true },
    { id: 'production-performance', required: true },
    { id: 'real-device-accessibility', required: true },
    { id: 'live-tools', required: true },
    { id: 'search-console', required: false },
    { id: 'custom-domain', required: false },
    { id: 'google-play', required: false },
  ];
  if (!fs.existsSync(fullPath)) return { file, present: false, valid: false, gates: [] };
  try {
    const document = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const gates = expected.map((definition) => {
      const recorded = Array.isArray(document.gates) ? document.gates.find((gate) => gate?.id === definition.id) : null;
      const passed = recorded?.status === 'passed'
        && typeof recorded.evidence === 'string' && recorded.evidence.trim()
        && typeof recorded.completed_at === 'string' && recorded.completed_at.trim();
      return { ...definition, status: passed ? 'passed' : 'manual-pending' };
    });
    const valid = document.schema === 'discover-islam-launch-evidence'
      && document.version === 1
      && Array.isArray(document.gates)
      && gates.every((gate) => document.gates.some((recorded) => recorded?.id === gate.id));
    return { file, present: true, valid, gates };
  } catch {
    return { file, present: true, valid: false, gates: [] };
  }
}

const env = { ...loadEnv(path.join(ROOT, '.env.local')), ...loadEnv(path.join(ROOT, '.env')), ...process.env };
const requiredFiles = [
  'ROADMAP_V4.md', 'LAUNCH_CHECKLIST.md', 'OWNER_HANDOFF.md',
  'FATWA_REVIEW_QUEUE.csv', 'CONTENT_EXPANSION_QUEUE.csv', 'LAUNCH_EXTERNAL_EVIDENCE.json',
];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(ROOT, file)));
const fatwa = queueReport('FATWA_REVIEW_QUEUE.csv', ['approved', 'complete', 'completed']);
const coverage = queueReport('CONTENT_EXPANSION_QUEUE.csv', ['approved', 'complete', 'completed', 'published']);
const requiredEnv = ['ADMIN_MFA_ENCRYPTION_KEY'];
const optionalEnv = ['CRON_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM', 'AI_ASSISTANT_API_KEY', 'AI_ASSISTANT_ENDPOINT'];
const missingRequiredEnv = requiredEnv.filter((name) => !String(env[name] ?? '').trim());
const externalGateDefinitions = [
  { id: 'backup-restore', label: 'اختبار النسخ والاسترجاع على Preview أو قاعدة منفصلة', required: true },
  { id: 'migration-ledger', label: 'تأكيد سجل migrations الرسمي في Supabase', required: true },
  { id: 'production-performance', label: 'إعادة قياس Lighthouse وTBT على نسخة Vercel', required: true },
  { id: 'real-device-accessibility', label: 'اختبار الأجهزة الحقيقية والشبكات البطيئة وقارئات الشاشة', required: true },
  { id: 'live-tools', label: 'اختبار المواقيت والقبلة والأذان بقيم حية على أجهزة فعلية', required: true },
  { id: 'search-console', label: 'إضافة Google Search Console إذا قرر المالك ذلك', required: false },
  { id: 'custom-domain', label: 'حسم البقاء على vercel.app أو اختيار نطاق مخصص', required: false },
  { id: 'google-play', label: 'حساب Google Play ومفتاح توقيع Android عند نشر التطبيق', required: false },
];
const evidence = readEvidence('LAUNCH_EXTERNAL_EVIDENCE.json');
const externalGates = externalGateDefinitions.map((gate) => {
  const recorded = evidence.gates.find((item) => item.id === gate.id);
  return { ...gate, status: recorded?.status ?? 'manual-pending' };
});
const manualIssues = [
  ...(fatwa.pending > 0 ? ['مراجعة واعتماد طابور الفتاوى'] : []),
  ...(coverage.pending > 0 ? ['إكمال طابور تغطية المحتوى'] : []),
  ...(missingRequiredEnv.length ? ['ضبط متغيرات MFA المطلوبة في بيئة النشر'] : []),
  ...externalGates.filter((gate) => gate.required && gate.status !== 'passed').map((gate) => gate.label),
];
const structuralIssues = [
  ...(missingFiles.length ? ['ملفات التسليم الناقصة: ' + missingFiles.join('، ')] : []),
  ...(!evidence.valid ? ['سجل الأدلة الخارجي غير صالح أو غير مكتمل'] : []),
  ...(!fatwa.valid ? ['صيغة FATWA_REVIEW_QUEUE.csv غير صالحة'] : []),
  ...(!coverage.valid ? ['صيغة CONTENT_EXPANSION_QUEUE.csv غير صالحة'] : []),
];
const result = {
  strict: STRICT,
  files: { required: requiredFiles.length, missing: missingFiles },
  fatwa,
  coverage,
  environment: {
    required: Object.fromEntries(requiredEnv.map((name) => [name, Boolean(String(env[name] ?? '').trim())])),
    optional: Object.fromEntries(optionalEnv.map((name) => [name, Boolean(String(env[name] ?? '').trim())])),
  },
  evidence,
  externalGates,
  manualIssues,
  structuralIssues,
  ready: structuralIssues.length === 0 && manualIssues.length === 0,
};

if (AS_JSON) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('============================================================');
  console.log(' فحص جاهزية إطلاق منصة اكتشف الإسلام');
  console.log('============================================================');
  console.log('ملفات التسليم: ' + (missingFiles.length ? '✖ ناقصة' : '✔ موجودة'));
  console.log('مراجعة الفتاوى: ' + fatwa.done + '/' + fatwa.total + ' مكتمل');
  console.log('تغطية المحتوى: ' + coverage.done + '/' + coverage.total + ' مكتمل');
  console.log('مفتاح تشفير MFA: ' + (missingRequiredEnv.length ? '✖ غير مضبوط في البيئة الحالية' : '✔ مضبوط'));
  console.log('المتغيرات الاختيارية: ' + optionalEnv.filter((name) => String(env[name] ?? '').trim()).length + '/' + optionalEnv.length + ' مضبوطة');
  const requiredExternal = externalGates.filter((gate) => gate.required);
  console.log('البوابات الخارجية المطلوبة: ' + requiredExternal.filter((gate) => gate.status !== 'passed').length + '/' + requiredExternal.length + ' معلّقة للتحقق اليدوي');
  if (structuralIssues.length) console.log('✖ مشاكل بنيوية: ' + structuralIssues.join(' · '));
  if (manualIssues.length) console.log('⚠ بنود يدوية متبقية: ' + manualIssues.join(' · '));
  if (!structuralIssues.length && !manualIssues.length) console.log('✅ جاهز للإطلاق وفق البوابات المحلية والخارجية المسجلة.');
  else console.log(STRICT ? '❌ الوضع الصارم لم ينجح.' : 'ℹ️ تقرير فقط — شغّل --strict لجعل البنود اليدوية مانعة.');
}

if (structuralIssues.length) process.exit(2);
process.exit(STRICT && manualIssues.length ? 1 : 0);
