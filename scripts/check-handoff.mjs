import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const handoff = await readFile(path.join(root, 'OWNER_HANDOFF.md'), 'utf8');
const launch = await readFile(path.join(root, 'LAUNCH_CHECKLIST.md'), 'utf8');

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
const forbidden = [
  'docs: refresh owner handoff after Quran search fix-',
  'مراجعة جميع المقالات المنشورة',
];
const failures = [
  ...requiredHandoff.filter((value) => !handoff.includes(value)).map((value) => 'OWNER_HANDOFF.md missing: ' + value),
  ...requiredLaunch.filter((value) => !launch.includes(value)).map((value) => 'LAUNCH_CHECKLIST.md missing: ' + value),
  ...forbidden.filter((value) => handoff.includes(value) || launch.includes(value)).map((value) => 'Legacy or merged text: ' + value),
 ];

if (failures.length > 0) {
  console.error(failures.join(String.fromCharCode(10)));
  process.exitCode = 1;
} else {
  console.log('handoff QA passed: owner handoff and launch checklist are consistent');
}
