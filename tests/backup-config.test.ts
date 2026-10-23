// tests/backup-config.test.ts
// اختبار منطق النسخ الاحتياطي النقي: التطبيع، المسارات، وسياسة الاحتفاظ.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BACKUP_CONFIG,
  buildBackupPath,
  normalizeBackupConfig,
  parseBackupDate,
  selectExpiredBackupNames,
} from '../lib/backup-config.ts';

test('normalizeBackupConfig: يعيد الافتراضي للقيم غير الصالحة', () => {
  assert.deepEqual(normalizeBackupConfig(null), DEFAULT_BACKUP_CONFIG);
  assert.deepEqual(normalizeBackupConfig('yes'), DEFAULT_BACKUP_CONFIG);
  assert.deepEqual(normalizeBackupConfig([]), DEFAULT_BACKUP_CONFIG);
});

test('normalizeBackupConfig: يحترم القيم ويقيّد الحدود', () => {
  assert.deepEqual(
    normalizeBackupConfig({ enabled: true, retentionDays: 7, maxFiles: 10 }),
    { enabled: true, retentionDays: 7, maxFiles: 10 }
  );

  assert.deepEqual(
    normalizeBackupConfig({ enabled: false, retentionDays: 0, maxFiles: 9999 }),
    { enabled: false, retentionDays: 1, maxFiles: 365 }
  );

  assert.deepEqual(
    normalizeBackupConfig({ retentionDays: '30', maxFiles: '2.9' }),
    { enabled: false, retentionDays: 30, maxFiles: 2 }
  );
});

test('buildBackupPath: مسار يومي بثوانٍ فقط', () => {
  assert.equal(
    buildBackupPath(new Date('2026-10-23T12:34:56.789Z')),
    'daily/2026-10-23T12-34-56Z.json'
  );
});

test('parseBackupDate: يستخرج التاريخ ويتجاهل الأسماء الغريبة', () => {
  assert.equal(
    parseBackupDate('daily/2026-10-23T12-34-56Z.json')?.toISOString(),
    '2026-10-23T12:34:56.000Z'
  );
  assert.equal(parseBackupDate('daily/not-a-backup.json'), null);
  assert.equal(parseBackupDate('other/2026-10-23T12-34-56Z.json'), null);
});

test('selectExpiredBackupNames: يحذف ما تجاوز المدة أو السقف', () => {
  const now = new Date('2026-10-23T12:00:00Z');
  const names = [
    'daily/2026-10-23T00-00-00Z.json',
    'daily/2026-10-22T00-00-00Z.json',
    'daily/2026-10-20T00-00-00Z.json',
    'daily/2026-10-10T00-00-00Z.json',
    'daily/not-a-backup.json',
  ];

  assert.deepEqual(selectExpiredBackupNames(names, now, 2, 2), [
    'daily/2026-10-20T00-00-00Z.json',
    'daily/2026-10-10T00-00-00Z.json',
  ]);
});

test('selectExpiredBackupNames: السقف وحده يمنع التراكم', () => {
  const now = new Date('2026-10-23T12:00:00Z');
  const names = [
    'daily/2026-10-23T00-00-00Z.json',
    'daily/2026-10-22T00-00-00Z.json',
    'daily/2026-10-21T00-00-00Z.json',
  ];

  assert.deepEqual(selectExpiredBackupNames(names, now, 365, 1), [
    'daily/2026-10-22T00-00-00Z.json',
    'daily/2026-10-21T00-00-00Z.json',
  ]);
});

test('selectExpiredBackupNames: لا يحذف شيئًا داخل المدة والسقف', () => {
  const now = new Date('2026-10-23T12:00:00Z');
  const names = [
    'daily/2026-10-23T00-00-00Z.json',
    'daily/2026-10-22T00-00-00Z.json',
  ];

  assert.deepEqual(selectExpiredBackupNames(names, now, 14, 30), []);
});
