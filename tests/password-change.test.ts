// tests/password-change.test.ts
// اختبار تطبيع إعداد تغيير كلمة المرور.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PASSWORD_CHANGE_CONFIG,
  normalizePasswordChangeConfig,
} from '../lib/password-change-config.ts';

test('normalizePasswordChangeConfig: الافتراضي مفعّل', () => {
  assert.deepEqual(normalizePasswordChangeConfig(undefined), DEFAULT_PASSWORD_CHANGE_CONFIG);
  assert.deepEqual(normalizePasswordChangeConfig(null), { enabled: true });
});

test('normalizePasswordChangeConfig: يتجاهل القيم غير المنطقية', () => {
  assert.deepEqual(normalizePasswordChangeConfig('off'), { enabled: true });
  assert.deepEqual(normalizePasswordChangeConfig({ enabled: 'no' }), { enabled: true });
});

test('normalizePasswordChangeConfig: يحترم التعطيل الصريح', () => {
  assert.deepEqual(normalizePasswordChangeConfig({ enabled: false }), { enabled: false });
});
