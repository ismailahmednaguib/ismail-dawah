// scripts/check-fields.mjs
// ============================================================================
// فحص قبول: لا يفتح أي باب على صفحة فارغة، والأسماء تظهر بلغة الصفحة.
//
// يفحص:
//   • كل رابط /fields/<slug> في هيكل التنقّل، وكل مجالات صفحة /fields.
//   • في اللغتين: ألّا تكون الصفحة 404، وألّا تظهر فيها حالة «لا يوجد محتوى».
//   • ألّا يعرض الموقع الإنجليزي اسمًا عربيًّا في عنوان الصفحة.
//
// التشغيل (بعد npm run build && npm start):
//   node scripts/check-fields.mjs
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? 'http://localhost:3000').replace(/\/+$/, '');

const fieldsSource = fs.readFileSync(
  path.join(process.cwd(), 'app', '[lang]', 'fields', '[slug]', 'page.tsx'),
  'utf8'
);

// نستخرج نصوص الحالة الفارغة من الصفحة نفسها حتى لا تتقادم النسخة هنا
const arEmpty = /noContent:\s*"([^"]+)"/.exec(fieldsSource.split('en:')[0])?.[1] ?? '';
const enEmpty = /noContent:\s*"([^"]+)"/.exec(fieldsSource.split('en:')[1] ?? '')?.[1] ?? '';

const navSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'navigation.ts'), 'utf8');
const navSlugs = [...new Set([...navSource.matchAll(/\/fields\/([A-Za-z0-9-]+)/g)].map((m) => m[1]))];

// مجالات صفحة /fields (تُقرأ من الصفحة الحيّة)
const indexHtml = await (await fetch(`${BASE}/ar/fields`)).text();
const indexSlugs = [...new Set([...indexHtml.matchAll(/\/fields\/([A-Za-z0-9-]+)/g)].map((m) => m[1]))]
  .filter((s) => !s.startsWith('page-'));

const slugs = [...new Set([...navSlugs, ...indexSlugs])].sort();

const ARABIC = /[\u0600-\u06FF]/;
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const problems = [];
let checked = 0;

for (const slug of slugs) {
  for (const lang of ['ar', 'en']) {
    checked += 1;
    const res = await fetch(`${BASE}/${lang}/fields/${slug}`);
    const html = await res.text();
    const text = strip(html);
    const empty = lang === 'ar' ? arEmpty : enEmpty;

    if (res.status !== 200) {
      problems.push(`${lang}/fields/${slug}: حالة ${res.status}`);
      continue;
    }
    if (empty && text.includes(empty)) {
      problems.push(`${lang}/fields/${slug}: صفحة فارغة (${empty})`);
      continue;
    }
    if (lang === 'en') {
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? '';
      if (ARABIC.test(strip(h1))) {
        problems.push(`en/fields/${slug}: العنوان عربي (${strip(h1).trim().slice(0, 40)})`);
      }
    }
  }
}

console.log('============================================================');
console.log('فحص قبول صفحات الأبواب');
console.log('============================================================');
console.log(`مفاهيم مفحوصة : ${slugs.length} (${checked} صفحة باللغتين)`);
console.log(`نصّ الفراغ (ar): ${arEmpty}`);
console.log('------------------------------------------------------------');

if (problems.length === 0) {
  console.log('✅ لا صفحة فارغة، وكل الأسماء معرّبة صحيحًا.');
} else {
  console.log(`⚠ ${problems.length} مشكلة:`);
  for (const p of problems) console.log('   - ' + p);
}

process.exit(problems.length === 0 ? 0 : 1);
