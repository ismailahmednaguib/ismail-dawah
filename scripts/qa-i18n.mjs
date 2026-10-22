#!/usr/bin/env node
// scripts/qa-i18n.mjs
// بوابة انحدار: تفحص صفحات الواجهة الإنجليزية للتأكد من خلوّ العنوان والوصف
// والنص المرئي من العربي غير المترجم. صفحات المحتوى العربي المقصود (القرآن،
// الأذكار، مناسك الحج) مستثناة لأن النص العربي فيها هو المتن نفسه.
//
// الاستخدام:
//   node scripts/qa-i18n.mjs --base=http://localhost:3000
//   node scripts/qa-i18n.mjs --base=https://ismailahmednaguib.vercel.app
//   npm run qa:i18n -- --base=http://localhost:3000
//
// تعتمد على خادم يعمل (مثل smoke-content). تخرج بالرمز 1 عند وجود تسريب.

const DEFAULT_BASE = process.env.QA_BASE_URL || 'http://localhost:3000';

function readBase() {
  const arg = process.argv.find((item) => item.startsWith('--base='));
  return (arg ? arg.slice('--base='.length) : DEFAULT_BASE).replace(/\/+$/, '');
}

const BASE = readBase();
const ARABIC = /[\u0600-\u06FF]/;

// صفحات واجهة لا يُفترض أن يظهر فيها أي نص عربي في النسخة الإنجليزية.
const PATHS = [
  '/en',
  '/en/about',
  '/en/contact',
  '/en/fatwa',
  '/en/articles',
  '/en/learn',
  '/en/faq',
  '/en/privacy',
  '/en/terms',
  '/en/download',
  '/en/prayer-times',
  '/en/qibla',
  '/en/zakat',
  '/en/live',
  '/en/doubts',
  '/en/fields',
  '/en/fields/tawhid',
  '/en/topic/aqeedah',
  '/en/search',
  '/en/login',
  '/en/register',
  '/en/hadith',
  '/en/fiqh',
  '/en/religions',
  '/en/religions/comparison',
  '/en/religions/methodology',
  '/en/religions/resources/questions',
  '/en/prayer-guide',
  '/en/quran-memorization',
  '/en/calendar',
  '/en/dawah-guide',
  '/en/embrace-islam',
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function metaValues(html) {
  const values = [];
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (title) values.push({ name: 'title', value: title[1] });

  const pattern =
    /<meta[^>]+(?:name|property)="(description|og:title|og:description|og:site_name|twitter:title|twitter:description)"[^>]*content="([^"]*)"/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    values.push({ name: match[1], value: match[2] });
  }
  return values;
}

async function checkPath(path) {
  let response;
  try {
    response = await fetch(BASE + path, {
      headers: { 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    return { path, error: String(error) };
  }

  if (!response.ok) {
    return { path, error: `HTTP ${response.status}` };
  }

  const html = await response.text();
  const meta = metaValues(html).filter((item) => ARABIC.test(item.value));

  const text = stripHtml(html);
  const snippets = [
    ...new Set(
      text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 1 && line.length < 160 && ARABIC.test(line))
    ),
  ].slice(0, 6);

  if (meta.length === 0 && snippets.length === 0) return null;

  return {
    path,
    meta,
    snippets,
  };
}

async function main() {
  console.log(`فحص الواجهة الإنجليزية على ${BASE} (${PATHS.length} صفحة)`);

  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < PATHS.length) {
      const path = PATHS[cursor++];
      const result = await checkPath(path);
      if (result) results.push(result);
    }
  }

  await Promise.all([worker(), worker(), worker(), worker()]);

  const errors = results.filter((result) => result.error);
  const leaks = results.filter((result) => !result.error);

  for (const item of leaks) {
    console.log(`\n✖ ${item.path}`);
    for (const meta of item.meta ?? []) {
      console.log(`  [${meta.name}] ${meta.value}`);
    }
    for (const snippet of item.snippets ?? []) {
      console.log(`  ${snippet}`);
    }
  }

  for (const item of errors) {
    console.log(`\n⚠ ${item.path}: ${item.error}`);
  }

  if (leaks.length === 0 && errors.length === 0) {
    console.log(`\n✔ لا يوجد تسريب عربي في ${PATHS.length} صفحة إنجليزية.`);
    return;
  }

  if (leaks.length > 0) {
    console.error(`\n✖ ${leaks.length} صفحة فيها نص عربي غير متوقع.`);
  }
  if (errors.length > 0) {
    console.error(`⚠ ${errors.length} صفحة تعذّر فحصها.`);
  }
  process.exitCode = 1;
}

main();
