// tests/password-reset.test.ts
// اختبار منطق استعادة كلمة المرور: الإعداد، الرابط، الرمز، والتجزئة.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PASSWORD_RESET_CONFIG,
  PASSWORD_RESET_MAX_TOKEN_LENGTH,
  buildPasswordResetUrl,
  isPlausiblePasswordResetToken,
  normalizePasswordResetConfig,
} from '../lib/password-reset-config.ts';
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from '../lib/password-reset-token.ts';

test('normalizePasswordResetConfig: يعيد الافتراضي للقيم غير الصالحة', () => {
  assert.deepEqual(normalizePasswordResetConfig(null), DEFAULT_PASSWORD_RESET_CONFIG);
  assert.deepEqual(normalizePasswordResetConfig('on'), DEFAULT_PASSWORD_RESET_CONFIG);
  assert.deepEqual(normalizePasswordResetConfig({ enabled: 'yes' }), DEFAULT_PASSWORD_RESET_CONFIG);
});

test('normalizePasswordResetConfig: يحترم التعطيل الصريح', () => {
  assert.deepEqual(normalizePasswordResetConfig({ enabled: false }), { enabled: false });
});

test('buildPasswordResetUrl: يبني رابطًا آمنًا ويجرّد الشرطة الأخيرة', () => {
  assert.equal(
    buildPasswordResetUrl('https://example.com/', 'ar', 'abc-_123'),
    'https://example.com/ar/reset-password?token=abc-_123'
  );
  assert.equal(
    buildPasswordResetUrl('https://example.com', 'en', 'a b&c'),
    'https://example.com/en/reset-password?token=a%20b%26c'
  );
});

test('buildPasswordResetUrl: أي لغة غير en تعود إلى ar', () => {
  assert.equal(
    buildPasswordResetUrl('https://example.com', 'fr' as unknown as 'ar', 'x'),
    'https://example.com/ar/reset-password?token=x'
  );
});

test('hashPasswordResetToken: ثابت ولا يسرّب الرمز', () => {
  const token = 'reset-abcdefghijklmnopqrstuvwxyz';
  const hash = hashPasswordResetToken(token);
  assert.equal(hash, hashPasswordResetToken(token));
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash.includes(token), false);
});

test('createPasswordResetToken: رمز عشوائي فريد مع تجزئة مطابقة', () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();

  assert.notEqual(first.token, second.token);
  assert.equal(first.hash, hashPasswordResetToken(first.token));
  assert.equal(isPlausiblePasswordResetToken(first.token), true);
});

test('isPlausiblePasswordResetToken: يرفض القصير والطويل والمحارف الغريبة', () => {
  assert.equal(isPlausiblePasswordResetToken(null), false);
  assert.equal(isPlausiblePasswordResetToken('short'), false);
  assert.equal(isPlausiblePasswordResetToken('a'.repeat(21) + '<>'), false);
  assert.equal(
    isPlausiblePasswordResetToken('a'.repeat(PASSWORD_RESET_MAX_TOKEN_LENGTH + 1)),
    false
  );
  assert.equal(isPlausiblePasswordResetToken('a'.repeat(21)), true);
});
