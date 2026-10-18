import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedMutationOrigin } from '../lib/security/origin.ts';

const previous = process.env.CSRF_REQUIRE_ORIGIN;
process.env.CSRF_REQUIRE_ORIGIN = 'true';

test.after(() => {
  if (previous === undefined) delete process.env.CSRF_REQUIRE_ORIGIN;
  else process.env.CSRF_REQUIRE_ORIGIN = previous;
});

test('يسمح بنفس مصدر الموقع', () => {
  const request = new Request('https://example.com/api/register', {
    method: 'POST',
    headers: { origin: 'https://example.com' },
  });
  assert.equal(isAllowedMutationOrigin(request), true);
});

test('يرفض مصدرًا خارجيًا', () => {
  const request = new Request('https://example.com/api/register', {
    method: 'POST',
    headers: { origin: 'https://evil.example' },
  });
  assert.equal(isAllowedMutationOrigin(request), false);
});

test('لا يثق في نطاق فرعي غير مصرّح به', () => {
  const request = new Request('https://example.com/api/register', {
    method: 'POST',
    headers: { origin: 'https://evil.example.com' },
  });
  assert.equal(isAllowedMutationOrigin(request), false);
});

test('يرفض غياب المصدر عند التفعيل الإجباري', () => {
  const request = new Request('https://example.com/api/register', { method: 'POST' });
  assert.equal(isAllowedMutationOrigin(request), false);
});
