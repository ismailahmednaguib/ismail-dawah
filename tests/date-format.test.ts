// tests/date-format.test.ts
// تنسيق تاريخ النشر يجب أن يكون ثابتًا بين الخادم والمتصفح.
import test from 'node:test';
import assert from 'node:assert/strict';

import { formatPublishDate } from '../lib/date-format.ts';

test('العربية: أرقام عربية وشهر عربي', () => {
  assert.equal(
    formatPublishDate('2026-10-20T23:30:00Z', true),
    '٢٠ أكتوبر ٢٠٢٦'
  );
});

test('الإنجليزية: شهر مختصر ويوم ثم سنة', () => {
  assert.equal(
    formatPublishDate('2026-10-20T23:30:00Z', false),
    'Oct 20, 2026'
  );
});

test('UTC يمنع انتقال اليوم باختلاف المنطقة الزمنية', () => {
  assert.equal(
    formatPublishDate('2026-10-20T23:30:00Z', false),
    'Oct 20, 2026'
  );
});

test('التاريخ التالف يعيد نصًّا فارغًا', () => {
  assert.equal(formatPublishDate('not-a-date', true), '');
});
