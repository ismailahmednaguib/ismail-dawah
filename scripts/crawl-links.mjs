// scripts/crawl-links.mjs
// ============================================================================
// جردة الروابط الميتة في كل الموقع (المرحلة ٨).
//
// يبدأ من خريطة الموقع (sitemap.xml) + الصفحات الرئيسية، ثم يتبع كل رابط داخلي
// حتى حدّ أقصى، ويُبلّغ عن:
//   • صفحات لا تُرجع 200 (والصفحة التي أدّت إليها).
//   • روابط داخلية توصّل إلى صفحة مكسورة.
//
// التشغيل (يحتاج الخادم على المنفذ 3000):
//   node scripts/crawl-links.mjs                 (حد 600 صفحة)
//   node scripts/crawl-links.mjs --max=2000
//   node scripts/crawl-links.mjs --base=https://ismailahmednaguib.vercel.app
// ============================================================================

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const BASE = argValue('base', 'http://localhost:3000').replace(/\/+$/, '');
const MAX_PAGES = Number(argValue('max', 600));
const CONCURRENCY = 6;

const SKIP_PREFIXES = ['/api/', '/admin', '/_next/', '/login', '/register'];
const SKIP_EXTENSIONS = /\.(png|jpe?g|svg|gif|webp|avif|ico|css|js|mjs|json|xml|txt|webmanifest|pdf|woff2?)$/i;

const normalize = (href) => {
  const url = new URL(href, BASE);
  if (url.origin !== BASE) return null;
  if (SKIP_PREFIXES.some((p) => url.pathname.startsWith(p))) return null;
  if (SKIP_EXTENSIONS.test(url.pathname)) return null;
  url.hash = '';
  url.search = ''; // نفحص الصفحة نفسها لا الفلاتر
  return url.pathname;
};

async function fetchPage(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    const text = res.status === 200 ? await res.text() : '';
    return { status: res.status, text };
  } catch (err) {
    return { status: 'ERR', text: '', error: err.message };
  }
}

// ============================================================
// 1) جمع بذور الزحف: sitemap + الصفحات الرئيسية
// ============================================================

const seeds = new Set(['/ar', '/en']);

try {
  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  if (sitemap.ok) {
    const xml = await sitemap.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      // نأخذ المسار فقط ليعمل الزحف على أي بيئة (محلية أو إنتاج)
      let pathname = '';
      try {
        pathname = new URL(m[1]).pathname;
      } catch {
        pathname = m[1];
      }
      const p = normalize(pathname);
      if (p) seeds.add(p);
    }
    console.log(`خريطة الموقع: ${seeds.size} رابطًا بذريًّا.`);
  } else {
    console.warn(`⚠ تعذّر جلب sitemap.xml (${sitemap.status}) — نكتفي بالصفحات الرئيسية.`);
  }
} catch {
  console.warn('⚠ تعذّر جلب sitemap.xml — نكتفي بالصفحات الرئيسية.');
}

// ============================================================
// 2) الزحف
// ============================================================

const visited = new Map(); // path -> status
const links = new Map(); // path -> Set(المصادر)
const queue = [...seeds];
for (const s of seeds) visited.set(s, 'pending');

const status = new Map();
let truncated = false;

while (queue.length > 0) {
  if (status.size >= MAX_PAGES) {
    truncated = true;
    break;
  }

  const batch = queue.splice(0, CONCURRENCY);

  await Promise.all(
    batch.map(async (path) => {
      const { status: code, text } = await fetchPage(path);
      status.set(path, code);

      if (code !== 200 || !text) return;

      for (const m of text.matchAll(/href="(\/[^"#]*)"/g)) {
        const target = normalize(m[1]);
        if (!target) continue;

        if (!links.has(target)) links.set(target, new Set());
        links.get(target).add(path);

        if (!visited.has(target) && !SKIP_EXTENSIONS.test(target)) {
          visited.set(target, 'pending');
          queue.push(target);
        }
      }
    })
  );

  const done = status.size;
  const total = visited.size;
  process.stdout.write(`\r  زُحف: ${done} / ${total} صفحة`);

  if (queue.length === 0 && links.size > 0) {
    // أضف أي رابط داخلي لم يُزحف بعد
    for (const target of links.keys()) {
      if (!visited.has(target)) {
        visited.set(target, 'pending');
        queue.push(target);
      }
    }
  }
}

process.stdout.write('\n\n');

// ============================================================
// 3) التقرير
// ============================================================

const broken = [...status.entries()].filter(([, code]) => code !== 200);
const brokenSet = new Set(broken.map(([p]) => p));

const incomingBroken = [...brokenSet]
  .map((target) => ({ target, sources: [...(links.get(target) ?? [])] }))
  .filter((entry) => entry.sources.length > 0)
  .sort((a, b) => b.sources.length - a.sources.length);

console.log('================================================================');
console.log('جردة الروابط الميتة');
console.log('================================================================');
console.log(`الأساس        : ${BASE}`);
console.log(`صفحات مفحوصة  : ${status.size}${truncated ? ` (بلغنا الحد ${MAX_PAGES})` : ''}`);
console.log(`روابط داخلية  : ${links.size}`);
console.log(`صفحات مكسورة  : ${broken.length}`);
console.log('----------------------------------------------------------------');

if (broken.length === 0) {
  console.log('✅ لا توجد روابط ميتة.');
} else {
  console.log('الصفحات المكسورة:');
  for (const [path, code] of broken) {
    const srcs = [...(links.get(path) ?? [])];
    console.log(`  ${String(code).padEnd(5)} ${decodeURIComponent(path)}`);
    for (const s of srcs.slice(0, 5)) {
      console.log(`          ← مصدرها: ${decodeURIComponent(s)}`);
    }
    if (srcs.length > 5) console.log(`          ← و${srcs.length - 5} مصدرًا آخر`);
  }
}

if (incomingBroken.length > 0) {
  console.log('----------------------------------------------------------------');
  console.log(`روابط داخلية توصّل إلى صفحات مكسورة: ${incomingBroken.length}`);
}

process.exit(broken.length === 0 ? 0 : 1);
