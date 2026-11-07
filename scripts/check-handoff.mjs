import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const handoff = await readFile(path.join(root, 'OWNER_HANDOFF.md'), 'utf8');
const launch = await readFile(path.join(root, 'LAUNCH_CHECKLIST.md'), 'utf8');
const audit = await readFile(path.join(root, 'scripts', 'audit-rls.mjs'), 'utf8');

const requiredHandoff = [
  '## 1) المراجعة العلمية',
  '## 2) MFA للمالك',
  '## 3) اختبار النسخ والاسترجاع',
  '## 5) دليل التنفيذ والتحقق الحالي',
  'لا نثبت SHA هنا',
];
const requiredLaunch = [
  '## ✅ مثبت داخل المشروع',
  '## ⚠️ مراجعة بشرية وحسابات خارجية',
  '## ⚠️ تحقق خارجي قبل الإطلاق النهائي',
  'OWNER_HANDOFF.md',
  '20261023_content_revisions.sql',
  '20261026_scheduled_publishing.sql',
  '20261027_admin_mfa.sql',
];
const requiredAudit = ['publicBroken.length', 'const strictFailure ='];
const forbidden = [
  'docs: refresh owner handoff after Quran search fix-',
  'مراجعة جميع المقالات المنشورة',
];
const forbiddenHandoff = [
  '### migrations المطلوبة قبل تفعيل الميزات',
  'نفّذ supabase/migrations/20261023_content_revisions.sql في Supabase SQL Editor',
  'نفّذ supabase/migrations/20261026_scheduled_publishing.sql قبل استخدام جدولة النشر',
];
const malformed = [
  '0فتوى منشورة، وعدد المراجعين المعتمدين = 20الحالة الحالية',
  '0فحص الإنتاج',
  '0بحث القرآن',
];
const failures = [
  ...requiredHandoff.filter((value) => !handoff.includes(value)).map((value) => 'OWNER_HANDOFF.md missing: ' + value),
  ...requiredLaunch.filter((value) => !launch.includes(value)).map((value) => 'LAUNCH_CHECKLIST.md missing: ' + value),
  ...requiredAudit.filter((value) => !audit.includes(value)).map((value) => 'scripts/audit-rls.mjs missing strict guard: ' + value),
  ...forbidden.filter((value) => handoff.includes(value) || launch.includes(value)).map((value) => 'Legacy or merged text: ' + value),
  ...forbiddenHandoff.filter((value) => handoff.includes(value)).map((value) => 'Legacy handoff text: ' + value),
  ...malformed.filter((value) => handoff.includes(value) || launch.includes(value)).map((value) => 'Malformed handoff or launch text: ' + value),
];

if (failures.length > 0) {
  console.error(failures.join(String.fromCharCode(10)));
  process.exitCode = 1;
} else {
  console.log('handoff QA passed: owner handoff, launch checklist, and RLS guard are consistent');
}
