// tests/email-provider-status.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { getEmailProviderStatus } from '../lib/email-provider-status.ts';

test('getEmailProviderStatus: لا مزوّد', () => {
  assert.deepEqual(getEmailProviderStatus({}), {
    kind: 'none',
    configured: false,
    from: null,
    smtpHost: null,
  });
});

test('getEmailProviderStatus: SMTP يُقدَّم على Resend', () => {
  const status = getEmailProviderStatus({
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_USER: 'owner@gmail.com',
    SMTP_PASS: 'secret',
    RESEND_API_KEY: 're_key',
    EMAIL_FROM: 'no-reply@example.com',
  });

  assert.equal(status.kind, 'smtp');
  assert.equal(status.configured, true);
  assert.equal(status.smtpHost, 'smtp.gmail.com');
  assert.equal(status.from, 'no-reply@example.com');
});

test('getEmailProviderStatus: المرسل يقع على SMTP_USER', () => {
  const status = getEmailProviderStatus({
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_USER: 'owner@gmail.com',
    SMTP_PASS: 'secret',
  });

  assert.equal(status.kind, 'smtp');
  assert.equal(status.from, 'owner@gmail.com');
});

test('getEmailProviderStatus: Resend يتطلب المفتاح والمرسل', () => {
  assert.equal(
    getEmailProviderStatus({ RESEND_API_KEY: 're_key' }).kind,
    'none'
  );
  assert.equal(
    getEmailProviderStatus({
      RESEND_API_KEY: 're_key',
      EMAIL_FROM: 'no-reply@example.com',
    }).kind,
    'resend'
  );
});
