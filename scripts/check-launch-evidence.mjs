import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'LAUNCH_EXTERNAL_EVIDENCE.json');
const STRICT = process.argv.includes('--strict');
const AS_JSON = process.argv.includes('--json');

const EXPECTED = [
  { id: 'backup-restore', required: true },
  { id: 'migration-ledger', required: true },
  { id: 'production-performance', required: true },
  { id: 'real-device-accessibility', required: true },
  { id: 'live-tools', required: true },
  { id: 'search-console', required: false },
  { id: 'custom-domain', required: false },
  { id: 'google-play', required: false },
];

const problems = [];
let document;

if (!fs.existsSync(FILE)) {
  problems.push('LAUNCH_EXTERNAL_EVIDENCE.json غير موجود');
} else {
  const source = fs.readFileSync(FILE, 'utf8');
  if (!source.endsWith('\n')) problems.push('الملف يجب أن ينتهي بسطر جديد');
  try {
    document = JSON.parse(source);
  } catch (error) {
    problems.push('JSON غير صالح: ' + error.message);
  }
}

if (document) {
  if (document.schema !== 'discover-islam-launch-evidence') problems.push('schema غير صحيح');
  if (document.version !== 1) problems.push('version يجب أن تساوي 1');
  if (!Array.isArray(document.gates)) {
    problems.push('gates يجب أن تكون مصفوفة');
  } else {
    const actual = document.gates;
    const actualIds = actual.map((gate) => gate?.id);
    if (actual.length !== EXPECTED.length) problems.push('عدد البوابات يجب أن يساوي ' + EXPECTED.length);
    if (new Set(actualIds).size !== actualIds.length) problems.push('معرّفات البوابات مكررة');
    for (const gate of EXPECTED) {
      const item = actual.find((candidate) => candidate?.id === gate.id);
      if (!item) {
        problems.push('البوابة مفقودة: ' + gate.id);
        continue;
      }
      if (item.required !== gate.required) problems.push('قيمة required غير صحيحة: ' + gate.id);
      if (!['pending', 'passed'].includes(item.status)) problems.push('status غير مسموح: ' + gate.id);
      const evidence = typeof item.evidence === 'string' ? item.evidence.trim() : '';
      const completedAt = typeof item.completed_at === 'string' ? item.completed_at.trim() : '';
      if (item.status === 'passed' && (!evidence || !completedAt)) problems.push('البوابة passed بلا evidence وcompleted_at: ' + gate.id);
      if (item.status === 'pending' && (evidence || completedAt)) problems.push('البوابة pending لا ينبغي أن تحمل evidence أو completed_at: ' + gate.id);
    }
    for (const id of actualIds) {
      if (!EXPECTED.some((gate) => gate.id === id)) problems.push('بوابة غير معروفة: ' + id);
    }
  }
}

const gates = Array.isArray(document?.gates) ? document.gates : [];
const requiredPending = gates.filter((gate) => gate.required && gate.status !== 'passed');
const passed = gates.filter((gate) => gate.status === 'passed');

const result = {
  valid: problems.length === 0,
  strict: STRICT,
  file: 'LAUNCH_EXTERNAL_EVIDENCE.json',
  total: gates.length,
  passed: passed.length,
  requiredPending: requiredPending.map((gate) => gate.id),
  problems,
};

if (AS_JSON) {
  console.log(JSON.stringify(result, null, 2));
} else if (problems.length) {
  console.error('launch evidence QA failed');
  for (const problem of problems) console.error('- ' + problem);
} else {
  console.log('launch evidence QA passed: ' + passed.length + '/' + gates.length + ' passed; ' + requiredPending.length + ' required pending');
}

if (problems.length || (STRICT && requiredPending.length)) process.exit(1);
