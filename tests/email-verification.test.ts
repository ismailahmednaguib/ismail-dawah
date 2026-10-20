// tests/email-verification.test.ts
// اختبار منطق تفعيل البريد: الإعداد، الرمز، الرابط، والتحقق من الشكل.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_EMAIL_VERIFICATION_CONFIG,
  EMAIL_VERIFICATION_MAX_TOKEN_LENGTH,
  buildEmailVerificationUrl,
  emailProviderConfigured,
  isPlausibleVerificationToken,
  normalizeEmailVerificationConfig,
} from '../lib/email-verification-config.ts';
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
} from '../lib/email-verification-token.ts';

test('normalizeEmailVerificationConfig: يعيد الافتراضي للقيم غير الصالحة', () => {
  assert.deepEqual(normalizeEmailVerificationConfig(null), DEFAULT_EMAIL_VERIFICATION_CONFIG);
  assert.deepEqual(normalizeEmailVerificationConfig('yes'), DEFAULT_EMAIL_VERIFICATION_CONFIG);
  assert.deepEqual(normalizeEmailVerificationConfig([]), DEFAULT_EMAIL_VERIFICATION_CONFIG);
});

test('normalizeEmailVerificationConfig: يحترم القيمة المنطقية الصريحة', () => {
  assert.deepEqual(normalizeEmailVerificationConfig({ enabled: false }), {
    enabled: false,
  });
});

test('normalizeEmailVerificationConfig: يتجاهل الأنواع الخاطئة', () => {
  assert.deepEqual(
    normalizeEmailVerificationConfig({ enabled: 'false', requireForLogin: 1 }),
    DEFAULT_EMAIL_VERIFICATION_CONFIG
  );
});

test('emailProviderConfigured: يتطلب المفتاح والمرسل معًا', () => {
  assert.equal(emailProviderConfigured({}), false);
  assert.equal(emailProviderConfigured({ RESEND_API_KEY: 'k' }), false);
  assert.equal(emailProviderConfigured({ EMAIL_FROM: 'a@b.c' }), false);
  assert.equal(
    emailProviderConfigured({ RESEND_API_KEY: ' k ', EMAIL_FROM: ' a@b.c ' }),
    true
  );
  // FROM_EMAIL اسم قديم مدعوم للتوافق الرجعي.
  assert.equal(
    emailProviderConfigured({ RESEND_API_KEY: 'k', FROM_EMAIL: 'a@b.c' }),
    true
  );
});

test('emailProviderConfigured: SMTP بلا دومين', () => {
  assert.equal(
    emailProviderConfigured({
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'a@gmail.com',
      SMTP_PASS: 'app-password',
    }),
    true
  );
  assert.equal(
    emailProviderConfigured({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@gmail.com' }),
    false
  );
  assert.equal(
    emailProviderConfigured({ SMTP_HOST: '', SMTP_USER: 'a@gmail.com', SMTP_PASS: 'x' }),
    false
  );
});

test('buildEmailVerificationUrl: يبني رابطًا آمنًا ويجرّد الشرطة الأخيرة', () => {
  assert.equal(
    buildEmailVerificationUrl('https://example.com/', 'ar', 'abc-_123'),
    'https://example.com/ar/verify-email?token=abc-_123'
  );
  assert.equal(
    buildEmailVerificationUrl('https://example.com', 'en', 'a b&c'),
    'https://example.com/en/verify-email?token=a%20b%26c'
  );
});

test('buildEmailVerificationUrl: أي لغة غير en تعود إلى ar', () => {
  assert.equal(
    buildEmailVerificationUrl('https://example.com', 'fr' as unknown as 'ar', 'x'),
    'https://example.com/ar/verify-email?token=x'
  );
});

test('hashEmailVerificationToken: ثابت ولا يسرّب الرمز', () => {
  const token = 'token-abcdefghijklmnopqrstuvwxyz';
  const hash = hashEmailVerificationToken(token);
  assert.equal(hash, hashEmailVerificationToken(token));
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash.includes(token), false);
});

test('createEmailVerificationToken: رمز عشوائي فريد مع تجزئة مطابقة', () => {
  const first = createEmailVerificationToken();
  const second = createEmailVerificationToken();

  assert.notEqual(first.token, second.token);
  assert.equal(first.hash, hashEmailVerificationToken(first.token));
  assert.equal(isPlausibleVerificationToken(first.token), true);
});

test('isPlausibleVerificationToken: يرفض القصير والطويل والمحارف الغريبة', () => {
  assert.equal(isPlausibleVerificationToken(null), false);
  assert.equal(isPlausibleVerificationToken('short'), false);
  assert.equal(isPlausibleVerificationToken('a'.repeat(21) + '<>'), false);
  assert.equal(isPlausibleVerificationToken('a'.repeat(EMAIL_VERIFICATION_MAX_TOKEN_LENGTH + 1)), false);
  assert.equal(isPlausibleVerificationToken('a'.repeat(21)), true);
});
