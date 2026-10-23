// tests/turnstile.test.ts
// اختبار استخراج رمز Turnstile من أشكال الطلبات المختلفة.
import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTurnstileGate, getTurnstileToken } from '../lib/turnstile.ts';

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

test('evaluateTurnstileGate: المفتاحان معًا ورمز صالح ⇒ تحقق', () => {
  assert.deepEqual(evaluateTurnstileGate('secret', 'site', 'token'), {
    action: 'verify',
  });
});

test('evaluateTurnstileGate: بلا سر ⇒ تجاوز بدل تعطيل النموذج', () => {
  assert.deepEqual(evaluateTurnstileGate('', 'site', ''), {
    action: 'skip',
    reason: 'no_secret',
  });
});

test('evaluateTurnstileGate: سر بلا مفتاح موقع ⇒ تجاوز مع تحذير', () => {
  assert.deepEqual(evaluateTurnstileGate('secret', '  ', ''), {
    action: 'skip',
    reason: 'no_site_key',
  });
});

test('evaluateTurnstileGate: مفتاح موقع بلا سر ⇒ تجاوز', () => {
  assert.deepEqual(evaluateTurnstileGate('', 'site', 'token'), {
    action: 'skip',
    reason: 'no_secret',
  });
});

test('evaluateTurnstileGate: المفتاحان بلا رمز ⇒ رفض', () => {
  assert.deepEqual(evaluateTurnstileGate('secret', 'site', ''), {
    action: 'reject',
    reason: 'missing_token',
  });
});
