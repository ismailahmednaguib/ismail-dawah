import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================
// حرّاس التصميم: تمنع أخطاء صامتة لا يكتشفها TypeScript
// ============================================================

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CODE_DIRS = ['app', 'components'];
const CODE_EXTS = new Set(['.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.vercel']);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) {
        walk(full, out);
      }
      continue;
    }

    if (CODE_EXTS.has(extname(full))) {
      out.push(full);
    }
  }

  return out;
}

function codeFiles(): string[] {
  return CODE_DIRS.flatMap((dir) => walk(join(ROOT, dir)));
}

test('كل درجة لون مستخدمة في الكود معرّفة في @theme', () => {
  const css = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');

  // الألوان المخصّصة فقط (primary/gold/night...)؛ ألوان Tailwind الافتراضية
  // مثل slate/gray تأتي من الثيم الافتراضي ولا نحتاج تعريفها.
  const defined = new Set(
    [...css.matchAll(/--color-([a-z]+-\d{2,3})\s*:/g)].map((match) => match[1])
  );
  assert.ok(defined.size > 0, 'لم يُعثر على أي لون في @theme');

  const families = [...new Set([...defined].map((key) => key.replace(/-\d+$/, '')))];
  const prefix =
    'bg|text|border|from|via|to|ring|fill|stroke|divide|accent|outline|decoration|caret|placeholder|shadow';
  const usage = new RegExp(`\\b(?:${prefix})-(${families.join('|')})-(\\d{2,3})\\b`, 'g');

  const missing = new Map<string, string[]>();

  for (const file of codeFiles()) {
    const content = readFileSync(file, 'utf8');

    for (const match of content.matchAll(usage)) {
      const key = `${match[1]}-${match[2]}`;
      if (defined.has(key)) continue;

      const relative = file.slice(ROOT.length).replaceAll('\\', '/');
      const files = missing.get(key) ?? [];
      if (!files.includes(relative)) files.push(relative);
      missing.set(key, files);
    }
  }

  const report = [...missing.entries()]
    .map(([key, files]) => `${key} (${files.slice(0, 3).join(', ')})`)
    .join('\n');

  assert.equal(
    missing.size,
    0,
    `درجات ألوان مستخدمة وغير معرّفة في app/globals.css @theme — Tailwind يحذف أدواتها بصمت:\n${report}`
  );
});

test('نظام الأيقونات يقبل الاسم الرسمي والإيموجي القديم', () => {
  const source = readFileSync(join(ROOT, 'components', 'ui', 'index.tsx'), 'utf8');
  assert.match(source, /iconMap/);
  assert.match(source, /hasOwnProperty\.call\(iconMap, value\)/);
});

test('صور OG موجودة وبمقاس 1200×630', () => {
  for (const lang of ['ar', 'en']) {
    const file = join(ROOT, 'public', 'og', `og-${lang}.png`);
    const buffer = readFileSync(file);

    assert.equal(buffer.toString('ascii', 1, 4), 'PNG', `og-${lang}.png ليس ملف PNG`);
    assert.equal(buffer.toString('ascii', 12, 16), 'IHDR', `og-${lang}.png بلا ترويسة IHDR`);
    assert.equal(buffer.readUInt32BE(16), 1200, `عرض og-${lang}.png ليس 1200`);
    assert.equal(buffer.readUInt32BE(20), 630, `ارتفاع og-${lang}.png ليس 630`);
  }
});

test('لا صفحة تعود إلى أيقونة 512 كصورة مشاركة', () => {
  const offenders = codeFiles()
    .filter((file) => file.endsWith('page.tsx'))
    .filter((file) => {
      const content = readFileSync(file, 'utf8');
      return content.includes('url: "/icon-512.png"') || content.includes('images: ["/icon-512.png"]');
    })
    .map((file) => file.slice(ROOT.length).replaceAll('\\', '/'));

  assert.deepEqual(
    offenders,
    [],
    `صفحات تستخدم /icon-512.png في OG بدل /og/og-<lang>.png: ${offenders.join(', ')}`
  );
});

test('كل صفحة تعرّف openGraph لها صورة مشاركة لغوية', () => {
  const offenders = codeFiles()
    .filter((file) => file.endsWith('page.tsx'))
    .filter((file) => {
      const content = readFileSync(file, 'utf8');
      if (!content.includes('openGraph')) return false;
      return (
        !content.includes('/og/og-') &&
        !content.includes('generateSEO') &&
        !content.includes('/api/og')
      );
    })
    .map((file) => file.slice(ROOT.length).replaceAll('\\', '/'));

  assert.deepEqual(
    offenders,
    [],
    `صفحات تعرّف openGraph بلا صورة ثابتة أو /api/og أو generateSEO: ${offenders.join(', ')}`
  );
});

test('كل صفحة تعرّف openGraph تحمل اسم الموقع (siteName)', () => {
  const offenders = codeFiles()
    .filter((file) => file.endsWith('page.tsx'))
    .filter((file) => {
      const content = readFileSync(file, 'utf8');
      return content.includes('openGraph') && !content.includes('siteName');
    })
    .map((file) => file.slice(ROOT.length).replaceAll('\\', '/'));

  assert.deepEqual(
    offenders,
    [],
    `صفحات تعرّف openGraph بلا siteName (يُستبدل openGraph كاملًا فلا يرث اسم الموقع من التخطيط): ${offenders.join(', ')}`
  );
});

test('الافتراضي في lib/seo.ts يستخدم صور OG اللغوية', () => {
  const seo = readFileSync(join(ROOT, 'lib', 'seo.ts'), 'utf8');

  assert.match(seo, /ar:\s*"\/og\/og-ar\.png"/);
  assert.match(seo, /en:\s*"\/og\/og-en\.png"/);
  assert.match(seo, /resolveImageUrl\(options\.image,\s*lang\)/);
});

test('البحث لا يعود لترجمة لغة أخرى عند غياب الترجمة المطلوبة', () => {
  const route = readFileSync(join(ROOT, 'app', 'api', 'search', 'route.ts'), 'utf8');

  assert.doesNotMatch(route, /content_translations\?\.\[0\]/);
  assert.doesNotMatch(route, /\?\?\s*item\.content_translations/);
  assert.match(route, /translation\.lang === lang/);
});

test('البحث لا يستعلم جدول quran_verses غير الموجود', () => {
  const route = readFileSync(join(ROOT, 'app', 'api', 'search', 'route.ts'), 'utf8');

  assert.doesNotMatch(route, /from\('quran_verses'\)/);
  assert.match(route, /searchSurahs\(q,\s*lang\)/);
});
