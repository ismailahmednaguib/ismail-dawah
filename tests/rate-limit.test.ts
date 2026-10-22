// tests/rate-limit.test.ts
// منطق حدّ المعدّل: يجب أن يكون الحدّ دقيقًا، والإعداد المخزَّن غير الموثوق آمنًا.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MemoryRateLimiter,
  RATE_LIMIT_DEFAULTS,
  RATE_LIMIT_SCOPES,
  clientIpFromHeaders,
  normalizeRateLimitConfig,
  rateLimitKey,
} from '../lib/rate-limit-core.ts';

test('المحدد يسمح حتى الحدّ ثم يرفض', () => {
  const limiter = new MemoryRateLimiter();
  for (let i = 1; i <= 3; i += 1) {
    const r = limiter.consume('k', 60, 3);
    assert.equal(r.allowed, true, `المحاولة ${i} يجب أن تُسمح`);
  }
  const blocked = limiter.consume('k', 60, 3);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
});

test('المفاتيح مستقلة عن بعضها', () => {
  const limiter = new MemoryRateLimiter();
  limiter.consume('a', 60, 1);
  assert.equal(limiter.consume('a', 60, 1).allowed, false);
  assert.equal(limiter.consume('b', 60, 1).allowed, true);
});

test('النافذة تُصفَّر بعد انتهائها', () => {
  let nowMs = 1_000_000;
  const limiter = new MemoryRateLimiter(() => nowMs);
  assert.equal(limiter.consume('k', 60, 1).allowed, true);
  assert.equal(limiter.consume('k', 60, 1).allowed, false);
  nowMs += 61_000;
  assert.equal(limiter.consume('k', 60, 1).allowed, true);
});

test('الباقي يتناقص بشكل صحيح', () => {
  const limiter = new MemoryRateLimiter();
  assert.equal(limiter.consume('k', 60, 5).remaining, 4);
  assert.equal(limiter.consume('k', 60, 5).remaining, 3);
});

test('sweep يحذف السطور المنتهية فقط', () => {
  let nowMs = 1_000_000;
  const limiter = new MemoryRateLimiter(() => nowMs);
  limiter.consume('old', 10, 5);
  nowMs += 11_000;
  limiter.consume('fresh', 600, 5);
  assert.equal(limiter.size(), 2);
  assert.equal(limiter.sweep(), 1);
  assert.equal(limiter.size(), 1);
});

test('الإعداد المخزَّن غير الموثوق لا يُسقط الافتراضي ولا يقبل قيمًا تالفة', () => {
  const merged = normalizeRateLimitConfig({
    login: { max: 5, windowSeconds: 120 },
    register: { max: -1, windowSeconds: 'ساعة' },
    questions: 'نصّ',
    analytics: { max: 1e9 },
  });

  assert.equal(merged.login.max, 5);
  assert.equal(merged.login.windowSeconds, 120);

  assert.equal(merged.register.max, RATE_LIMIT_DEFAULTS.register.max);
  assert.equal(merged.register.windowSeconds, RATE_LIMIT_DEFAULTS.register.windowSeconds);

  assert.deepEqual(merged.questions, RATE_LIMIT_DEFAULTS.questions);

  // قيمة أضخم من الحدّ الأقصى تُرفض ويعود الافتراضي
  assert.equal(merged.analytics.max, RATE_LIMIT_DEFAULTS.analytics.max);
});

test('الإعداد الفارغ أو التالف يعطي الحدود الافتراضية كاملة', () => {
  for (const bad of [null, undefined, 'x', 7, [], { login: null }]) {
    const merged = normalizeRateLimitConfig(bad);
    for (const scope of RATE_LIMIT_SCOPES) {
      assert.deepEqual(merged[scope], RATE_LIMIT_DEFAULTS[scope]);
    }
  }
});

test('rateLimitKey يوحّد الحالة ويحدّ الطول', () => {
  assert.equal(rateLimitKey('login', ' 1.2.3.4 '), 'login:1.2.3.4');
  assert.equal(rateLimitKey('login', 'A@B.test'), 'login:a@b.test');
  assert.equal(rateLimitKey('login', 'x'.repeat(500)).length, 'login:'.length + 190);
});

test('نطاق البحث العام له حدّ افتراضي قابل للتحكم', () => {
  assert.ok(RATE_LIMIT_SCOPES.includes('search'));
  assert.equal(RATE_LIMIT_DEFAULTS.search.windowSeconds, 60);
  assert.equal(RATE_LIMIT_DEFAULTS.search.max, 120);
});

test('clientIpFromHeaders يقرأ الترويسات بترتيب الثقة', () => {
  const headers = new Map<string, string>([
    ['x-forwarded-for', '9.9.9.9, 10.0.0.1'],
    ['x-real-ip', '1.1.1.1'],
  ]);
  assert.equal(clientIpFromHeaders((n) => headers.get(n)), '9.9.9.9');

  const onlyReal = new Map([['x-real-ip', '2.2.2.2']]);
  assert.equal(clientIpFromHeaders((n) => onlyReal.get(n)), '2.2.2.2');

  assert.equal(clientIpFromHeaders(() => null), 'unknown');
});
