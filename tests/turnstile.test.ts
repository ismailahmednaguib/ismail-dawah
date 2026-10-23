// tests/turnstile.test.ts
// اختبار استخراج رمز Turnstile من أشكال الطلبات المختلفة.
import test from 'node:test';
import assert from 'node:assert/strict';

import { getTurnstileToken } from '../lib/turnstile.ts';

test('getTurnstileToken: يقرأ الحقل القياسي', () => {
  assert.equal(getTurnstileToken({ turnstileToken: ' abc ' }), 'abc');
});

test('getTurnstileToken: يدعم اسم Cloudflare وحقل token القديم', () => {
  assert.equal(
    getTurnstileToken({ 'cf-turnstile-response': 'cf-token' }),
    'cf-token'
  );
  assert.equal(getTurnstileToken({ token: 'legacy' }), 'legacy');
});

test('getTurnstileToken: يتجاهل الأنواع غير النصية والفراغ', () => {
  assert.equal(getTurnstileToken(null), '');
  assert.equal(getTurnstileToken({}), '');
  assert.equal(getTurnstileToken({ turnstileToken: 123 }), '');
  assert.equal(getTurnstileToken({ turnstileToken: '   ' }), '');
});

test('getTurnstileToken: يحدّ الطول الأقصى', () => {
  assert.equal(getTurnstileToken({ turnstileToken: 'x'.repeat(5_000) }).length, 4_096);
});
