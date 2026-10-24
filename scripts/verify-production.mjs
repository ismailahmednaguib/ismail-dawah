#!/usr/bin/env node
// فحص قبول النسخة المنشورة بعد النشر.
//
// التشغيل:
//   npm run qa:production
//   npm run qa:production -- --base=https://example.com
//
// لا يقرأ أسرارًا ولا يكتب إلى الموقع؛ يفحص الصفحات الأساسية، وواجهات البحث،
// وملفات الاكتشاف، والتحويلات، وترويسات الحماية، ويمنع نجاحًا كاذبًا للمصدر.

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
    const response = await fetch(BASE + pathname, {
      redirect: 'manual',
      headers: { Accept: 'text/html,application/xhtml+json,application/json,text/plain,application/xml' },
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

function recordFailure(message) {
  failures.push(message);
}

console.log('============================================================');
console.log('فحص قبول النسخة المنشورة');
console.log('============================================================');
console.log('العنوان: ' + BASE);

const pageResults = await Promise.all(pages.map(async ([pathname, lang]) => {
  try {
    const result = await fetchText(pathname);
    const langMatch = new RegExp('<html[^>]+lang="' + lang + '"', 'i').test(result.body)
      || new RegExp("<html[^>]+lang='" + lang + "'", 'i').test(result.body);
    const hasDescription = /<meta[^>]+name=["']description["']/i.test(result.body);

    if (result.response.status !== 200) {
      recordFailure(pathname + ': HTTP ' + result.response.status);
    } else if (!langMatch) {
      recordFailure(pathname + ': وسم اللغة لا يطابق ' + lang);
    } else if (!hasDescription) {
      recordFailure(pathname + ': وصف SEO غير موجود');
    }

    return { pathname, status: result.response.status, cache: result.response.headers.get('x-vercel-cache') ?? 'n/a' };
  } catch (error) {
    recordFailure(pathname + ': ' + (error instanceof Error ? error.message : String(error)));
    return { pathname, status: 'ERR', cache: 'n/a' };
  }
}));

for (const page of pageResults) {
  console.log('  ' + page.status + '  ' + page.pathname + '  cache=' + page.cache);
}

const apiResults = await Promise.all(apiChecks.map(async ([pathname, lang]) => {
  try {
    const result = await fetchText(pathname);
    let payload = null;
    try {
      payload = JSON.parse(result.body);
    } catch {
      recordFailure(pathname + ': استجابة JSON غير صالحة');
    }

    if (result.response.status !== 200) {
      recordFailure(pathname + ': HTTP ' + result.response.status);
    } else if (!Array.isArray(payload?.data)) {
      recordFailure(pathname + ': الحقل data ليس مصفوفة');
    } else if (payload?.source_unavailable) {
      recordFailure(pathname + ': مصدر القرآن غير متاح');
    } else if (lang === 'en' && payload.data.some((item) => ARABIC.test((item.title ?? '') + ' ' + (item.summary ?? '')))) {
      recordFailure(pathname + ': تسريب عربي في نتيجة البحث الإنجليزية');
    }

    return { pathname, status: result.response.status, count: Array.isArray(payload?.data) ? payload.data.length : 0 };
  } catch (error) {
    recordFailure(pathname + ': ' + (error instanceof Error ? error.message : String(error)));
    return { pathname, status: 'ERR', count: 0 };
  }
}));

for (const api of apiResults) {
  console.log('  ' + api.status + '  ' + api.pathname + '  نتائج=' + api.count);
}

const runtimeChecks = [];

try {
  const result = await fetchText('/manifest.webmanifest');
  let manifest = null;
  try {
    manifest = JSON.parse(result.body);
  } catch {
    recordFailure('/manifest.webmanifest: JSON غير صالح');
  }
  if (result.response.status !== 200) recordFailure('/manifest.webmanifest: HTTP ' + result.response.status);
  if (!result.response.headers.get('content-type')?.includes('json')) recordFailure('/manifest.webmanifest: نوع المحتوى ليس JSON');
  if (!manifest || typeof manifest !== 'object' || typeof manifest.start_url !== 'string' || typeof manifest.id !== 'string') {
    recordFailure('/manifest.webmanifest: start_url أو id غير موجود');
  }
  runtimeChecks.push({ pathname: '/manifest.webmanifest', status: result.response.status });
} catch (error) {
  recordFailure('/manifest.webmanifest: ' + (error instanceof Error ? error.message : String(error)));
  runtimeChecks.push({ pathname: '/manifest.webmanifest', status: 'ERR' });
}

for (const pathname of ['/robots.txt', '/sitemap.xml']) {
  try {
    const result = await fetchText(pathname);
    if (result.response.status !== 200) recordFailure(pathname + ': HTTP ' + result.response.status);
    if (pathname === '/robots.txt' && !/sitemap:/i.test(result.body)) recordFailure('/robots.txt: رابط sitemap غير موجود');
    if (pathname === '/sitemap.xml' && !/<(?:urlset|sitemapindex)\b/i.test(result.body)) recordFailure('/sitemap.xml: بنية XML غير متوقعة');
    runtimeChecks.push({ pathname, status: result.response.status });
  } catch (error) {
    recordFailure(pathname + ': ' + (error instanceof Error ? error.message : String(error)));
    runtimeChecks.push({ pathname, status: 'ERR' });
  }
}

try {
  const result = await fetchText('/');
  const location = result.response.headers.get('location') ?? '';
  if (![301, 302, 303, 307, 308].includes(result.response.status)) {
    recordFailure('/: تحويل اللغة غير موجود (HTTP ' + result.response.status + ')');
  } else if (!/^\/(?:ar|en)(?:[/?#]|$)/i.test(location)) {
    recordFailure('/: وجهة تحويل اللغة غير صحيحة (' + (location || 'فارغة') + ')');
  }
  runtimeChecks.push({ pathname: '/', status: result.response.status, location });
} catch (error) {
  recordFailure('/: ' + (error instanceof Error ? error.message : String(error)));
  runtimeChecks.push({ pathname: '/', status: 'ERR', location: '' });
}

try {
  const result = await fetchText('/en');
  const requiredHeaders = [
    ['content-security-policy', 'CSP'],
    ['strict-transport-security', 'HSTS'],
    ['permissions-policy', 'Permissions-Policy'],
  ];
  for (const [header, label] of requiredHeaders) {
    if (!result.response.headers.get(header)) recordFailure('/en: ترويسة ' + label + ' غير موجودة');
  }
  if ((result.response.headers.get('x-frame-options') ?? '').toUpperCase() !== 'DENY') {
    recordFailure('/en: X-Frame-Options ليست DENY');
  }
  runtimeChecks.push({ pathname: '/en security headers', status: result.response.status });
} catch (error) {
  recordFailure('/en security headers: ' + (error instanceof Error ? error.message : String(error)));
  runtimeChecks.push({ pathname: '/en security headers', status: 'ERR' });
}

for (const check of runtimeChecks) {
  const suffix = check.location ? ' -> ' + check.location : '';
  console.log('  ' + check.status + '  ' + check.pathname + suffix);
}

if (failures.length) {
  console.log('❌ فشل الفحص: ' + failures.length);
  for (const failure of failures) console.log('  - ' + failure);
  process.exit(1);
}

console.log('✅ النسخة المنشورة تعيد الصفحات واللغات وSEO وبحث القرآن وملفات الاكتشاف والتحويلات وترويسات الحماية كما هو متوقع.');
