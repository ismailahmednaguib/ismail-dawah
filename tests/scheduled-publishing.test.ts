// tests/scheduled-publishing.test.ts
// اختبار منطق جدولة النشر: التطبيع والاستحقاق.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SCHEDULE_MIN_LEAD_MS,
  isScheduledDue,
  normalizeScheduledAt,
} from '../lib/scheduled-publishing.ts';

const NOW = new Date('2026-10-23T12:00:00.000Z');

test('normalizeScheduledAt: يعيد ISO UTC للموعد الصالح', () => {
  assert.equal(
    normalizeScheduledAt('2026-10-24T09:30:00.000Z', NOW),
    '2026-10-24T09:30:00.000Z'
  );
});

test('normalizeScheduledAt: يرفض الماضي والقريب جدًّا', () => {
  assert.throws(
    () => normalizeScheduledAt('2026-10-23T11:59:00.000Z', NOW),
    /بعد دقيقة/
  );
  assert.throws(
    () =>
      normalizeScheduledAt(
        new Date(NOW.getTime() + SCHEDULE_MIN_LEAD_MS - 1).toISOString(),
        NOW
      ),
    /بعد دقيقة/
  );
});

test('normalizeScheduledAt: يرفض الفراغ وغير الصالح', () => {
  assert.throws(() => normalizeScheduledAt('', NOW), /حدّد/);
  assert.throws(() => normalizeScheduledAt(null, NOW), /حدّد/);
  assert.throws(() => normalizeScheduledAt('not-a-date', NOW), /غير صالح/);
});

test('isScheduledDue: يقارن الموعد بالوقت الحالي', () => {
  assert.equal(isScheduledDue('2026-10-23T11:00:00.000Z', NOW), true);
  assert.equal(isScheduledDue('2026-10-23T12:00:00.000Z', NOW), true);
  assert.equal(isScheduledDue('2026-10-23T12:00:01.000Z', NOW), false);
  assert.equal(isScheduledDue(null, NOW), false);
  assert.equal(isScheduledDue('bad', NOW), false);
});
