import test from 'node:test';
import assert from 'node:assert/strict';
import { DAWAH_INQUIRY_RETENTION_DAYS, getDawahInquiryRetentionCutoff } from '../lib/dawah-retention.ts';

test('dawah inquiry retention cutoff defaults to 90 days', () => {
  const now = new Date('2026-11-24T00:00:00.000Z');
  assert.equal(DAWAH_INQUIRY_RETENTION_DAYS, 90);
  assert.equal(getDawahInquiryRetentionCutoff(now).toISOString(), '2026-08-26T00:00:00.000Z');
});

test('dawah inquiry retention cutoff ignores invalid day counts', () => {
  const now = new Date('2026-11-24T00:00:00.000Z');
  assert.equal(getDawahInquiryRetentionCutoff(now, 0).toISOString(), '2026-08-26T00:00:00.000Z');
});
