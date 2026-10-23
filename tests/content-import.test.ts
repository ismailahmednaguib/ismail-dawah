import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildContentImportTemplate,
  CONTENT_IMPORT_FORMAT,
  CONTENT_IMPORT_VERSION,
  MAX_CONTENT_IMPORT_ITEMS,
  sanitizeImportedBody,
  validateContentImport,
} from '../lib/content-import.ts';

test('قالب استيراد المحتوى صالح ويقبل ترجمتين', () => {
  const report = validateContentImport(buildContentImportTemplate());

  assert.equal(report.ok, true);
  assert.equal(report.valid, 1);
  assert.equal(report.items[0]?.translations.length, 2);
  assert.deepEqual(report.errors, []);
});

test('استيراد المحتوى يرفض الصيغة والإصدار غير المعروفين', () => {
  const report = validateContentImport({
    format: 'other-format',
    version: 99,
    items: [],
  });

  assert.equal(report.ok, false);
  assert.ok(report.errors.some((issue) => issue.path === 'format'));
  assert.ok(report.errors.some((issue) => issue.path === 'version'));
});

test('استيراد المحتوى يكشف تكرار اللغة والرابط قبل الكتابة', () => {
  const report = validateContentImport({
    format: CONTENT_IMPORT_FORMAT,
    version: CONTENT_IMPORT_VERSION,
    items: [
      {
        content_type: 'article',
        translations: [
          { lang: 'ar', slug: 'same', title: 'الأول' },
          { lang: 'ar', slug: 'same', title: 'الثاني' },
        ],
      },
      {
        content_type: 'lesson',
        translations: [{ lang: 'ar', slug: 'same', title: 'الثالث' }],
      },
    ],
  });

  assert.equal(report.ok, false);
  assert.ok(report.errors.some((issue) => issue.message.includes('مكررة')));
  assert.ok(report.errors.some((issue) => issue.message.includes('مكرر مع المادة')));
});

test('استيراد المحتوى يرفض القيم المصنفة غير المدعومة', () => {
  const report = validateContentImport({
    format: CONTENT_IMPORT_FORMAT,
    version: CONTENT_IMPORT_VERSION,
    items: [
      {
        content_type: 'article',
        audience: ['not-audience'],
        translations: [{ lang: 'fr', slug: 'foreign', title: 'عنوان' }],
      },
    ],
  });

  assert.equal(report.ok, false);
  assert.ok(report.errors.some((issue) => issue.path.endsWith('.audience')));
  assert.ok(report.errors.some((issue) => issue.path.endsWith('.lang')));
});

test('الحد الأقصى للاستيراد يمنع الدفعات الكبيرة', () => {
  const items = Array.from({ length: MAX_CONTENT_IMPORT_ITEMS + 1 }, (_, index) => ({
    content_type: 'article',
    translations: [{ lang: 'ar', slug: `article-${index}`, title: `عنوان ${index}` }],
  }));
  const report = validateContentImport({
    format: CONTENT_IMPORT_FORMAT,
    version: CONTENT_IMPORT_VERSION,
    items,
  });

  assert.equal(report.ok, false);
  assert.ok(report.errors.some((issue) => issue.path === 'items'));
});

test('المحتوى الحساس يضيف تحذيرًا ولا يسمح بالنشر المباشر', () => {
  const report = validateContentImport({
    format: CONTENT_IMPORT_FORMAT,
    version: CONTENT_IMPORT_VERSION,
    items: [
      {
        content_type: 'fatwa',
        translations: [{ lang: 'ar', slug: 'fatwa-import', title: 'فتوى' }],
      },
    ],
  });

  assert.equal(report.ok, true);
  assert.equal(report.warnings.length, 1);
});

test('تنقية متن الاستيراد تزيل العناصر الخطرة وتبقي التنسيق المسموح', () => {
  assert.equal(
    sanitizeImportedBody('<p>نص</p><script>alert(1)</script><strong>مهم</strong>'),
    '<p>نص</p><strong>مهم</strong>'
  );
});
