import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeContentReportInput, normalizeContentReportStatus } from '../lib/content-report.ts';

test('بلاغ المحتوى يقبل مسارًا داخليًا ويشذب المدخلات', () => {
  const result = normalizeContentReportInput({
    page_url: ' /ar/learn/fatwa/test?x=1 ',
    page_title: '  عنوان  ',
    description: '  يوجد خطأ في المرجع  ',
    email: 'visitor@example.com',
    lang: 'ar',
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value, {
      pageUrl: '/ar/learn/fatwa/test?x=1',
      pageTitle: 'عنوان',
      description: 'يوجد خطأ في المرجع',
      email: 'visitor@example.com',
      lang: 'ar',
    });
  }
});

test('بلاغ المحتوى يرفض الروابط الخارجية والوصف القصير', () => {
  assert.equal(normalizeContentReportInput({ page_url: 'https://evil.example', page_title: 'x', description: 'وصف طويل كافٍ' }).ok, false);
  assert.equal(normalizeContentReportInput({ page_url: '/ar/about', page_title: 'x', description: 'قصير' }).ok, false);
});

test('حالات البلاغ محصورة في القيم المعروفة', () => {
  assert.equal(normalizeContentReportStatus('resolved'), 'resolved');
  assert.equal(normalizeContentReportStatus('something-else'), 'new');
});
