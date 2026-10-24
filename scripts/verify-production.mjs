#!/usr/bin/env node
// فحص قبول النسخة المنشورة بعد النشر.
//
// التشغيل:
//   npm run qa:production
//   npm run qa:production -- --base=https://example.com
//
// لا يقرأ أسرارًا ولا يكتب إلى الموقع؛ يفحص صفحات أساسية وواجهة بحث القرآن
// ويؤكد أن النسخة المنشورة تعيد اللغة الصحيحة ولا تعرض نجاحًا كاذبًا للمصدر.

const DEFAULT_BASE = 'https://ismailahmednaguib.vercel.app';
const BASE = (
  process.argv.find((arg) => arg.startsWith('--base='))?.slice('--base='.length)
  ?? process.env.QA_BASE_URL
  ?? DEFAULT_BASE
).replace(/\/+$/, '');

const TIMEOUT_MS = 15_000;
const ARABIC = /[\u0600-\u06FF]/;

function timeoutSignal() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchText(pathname) {
  const request = timeoutSignal();
  try {
    const response = await fetch(`${BASE}${pathname}`, {
      redirect: 'manual',
      headers: { Accept: 'text/html,application/xhtml+json,application/json' },
      signal: request.signal,
    });
    return { pathname, response, body: await response.text() };
  } finally {
    request.clear();
  }
}

const pages = [
  ['/ar', 'ar'],
  ['/en', 'en'],
  ['/ar/quran', 'ar'],
  ['/en/quran', 'en'],
  ['/ar/fatwa', 'ar'],
  ['/en/fatwa', 'en'],
  ['/ar/search', 'ar'],
  ['/en/search', 'en'],
  ['/ar/prayer-times', 'ar'],
  ['/en/prayer-times', 'en'],
  ['/ar/prayer-guide', 'ar'],
  ['/en/prayer-guide', 'en'],
  ['/ar/qibla', 'ar'],
  ['/en/qibla', 'en'],
];

const apiChecks = [
  ['/api/quran/search?q=الله&lang=ar', 'ar'],
  ['/api/quran/search?q=Allah&lang=en', 'en'],
];

const failures = [];

console.log('============================================================');
console.log('فحص قبول النسخة المنشورة');
console.log('============================================================');
console.log(`العنوان: ${BASE}`);

const pageResults = await Promise.all(pages.map(async ([pathname, lang]) => {
  try {
    const result = await fetchText(pathname);
    const langMatch = new RegExp(`<html[^>]+lang=["']${lang}["']`, 'i').test(result.body);
    const hasDescription = /<meta[^>]+name=["']description["']/i.test(result.body);

    if (result.response.status !== 200) {
      failures.push(`${pathname}: HTTP ${result.response.status}`);
    } else if (!langMatch) {
      failures.push(`${pathname}: وسم اللغة لا يطابق ${lang}`);
    } else if (!hasDescription) {
      failures.push(`${pathname}: وصف SEO غير موجود`);
    }

    return { pathname, status: result.response.status, cache: result.response.headers.get('x-vercel-cache') ?? 'n/a' };
  } catch (error) {
    failures.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`);
    return { pathname, status: 'ERR', cache: 'n/a' };
  }
}));

for (const page of pageResults) {
  console.log(`  ${page.status}  ${page.pathname}  cache=${page.cache}`);
}

const apiResults = await Promise.all(apiChecks.map(async ([pathname, lang]) => {
  try {
    const result = await fetchText(pathname);
    let payload = null;
    try {
      payload = JSON.parse(result.body);
    } catch {
      failures.push(`${pathname}: استجابة JSON غير صالحة`);
    }

    if (result.response.status !== 200) {
      failures.push(`${pathname}: HTTP ${result.response.status}`);
    } else if (!Array.isArray(payload?.data)) {
      failures.push(`${pathname}: الحقل data ليس مصفوفة`);
    } else if (payload?.source_unavailable) {
      failures.push(`${pathname}: مصدر القرآن غير متاح`);
    } else if (lang === 'en' && payload.data.some((item) => ARABIC.test(`${item.title ?? ''} ${item.summary ?? ''}`))) {
      failures.push(`${pathname}: تسريب عربي في نتيجة البحث الإنجليزية`);
    }

    return { pathname, status: result.response.status, count: Array.isArray(payload?.data) ? payload.data.length : 0 };
  } catch (error) {
    failures.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`);
    return { pathname, status: 'ERR', count: 0 };
  }
}));

for (const api of apiResults) {
  console.log(`  ${api.status}  ${api.pathname}  نتائج=${api.count}`);
}

if (failures.length) {
  console.log(`❌ فشل الفحص: ${failures.length}`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}

console.log('✅ النسخة المنشورة تعيد الصفحات واللغات وSEO وبحث القرآن كما هو متوقع.');
