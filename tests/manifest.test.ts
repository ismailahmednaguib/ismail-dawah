import test from 'node:test';
import assert from 'node:assert/strict';

import { buildManifest } from '../lib/manifest.ts';

test('بيان التثبيت: العربية RTL واسم عربي', () => {
  const manifest = buildManifest('ar');
  assert.equal(manifest.lang, 'ar');
  assert.equal(manifest.dir, 'rtl');
  assert.equal(manifest.name, 'اكتشف الإسلام – Discover Islam');
  assert.equal(manifest.start_url, '/');
});

test('بيان التثبيت: الإنجليزية LTR واسم إنجليزي', () => {
  const manifest = buildManifest('en');
  assert.equal(manifest.lang, 'en');
  assert.equal(manifest.dir, 'ltr');
  assert.equal(manifest.name, 'Discover Islam');
  assert.equal(manifest.start_url, '/');
});

test('بيان التثبيت: اختصارات كل لغة تفتح صفحاتها الصحيحة', () => {
  const ar = buildManifest('ar');
  const en = buildManifest('en');

  assert.ok(ar.shortcuts?.every((shortcut) => shortcut.url.startsWith('/ar/')));
  assert.ok(en.shortcuts?.every((shortcut) => shortcut.url.startsWith('/en/')));
  assert.ok(ar.shortcuts?.length);
  assert.ok(en.shortcuts?.length);
});

test('بيان التثبيت: أيقونات maskable وany موجودة', () => {
  const manifest = buildManifest('ar');
  const purposes = manifest.icons?.map((icon) => icon.purpose);

  assert.ok(purposes?.includes('any'));
  assert.ok(purposes?.includes('maskable'));
});

test('بيان التثبيت: لون التطبيق يأخذ الهوية البصرية المركزية', () => {
  const manifest = buildManifest('ar', { primaryColor: '#123456', goldColor: '#abcdef' }, {
    name: { ar: 'منصة تجريبية', en: 'Test Platform' },
    shortName: { ar: 'تجريبية', en: 'Test' },
    description: { ar: 'وصف مخصص', en: 'Custom description' },
  });
  assert.equal(manifest.theme_color, '#123456');
  assert.equal(manifest.name, 'منصة تجريبية');
  assert.equal(manifest.short_name, 'تجريبية');
  assert.equal(manifest.description, 'وصف مخصص');
});
