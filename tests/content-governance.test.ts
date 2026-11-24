import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONTENT_GOVERNANCE, governanceText, normalizeContentGovernance } from '../lib/content-governance.ts';

test('content governance keeps safe defaults', () => {
  const config = normalizeContentGovernance(null);
  assert.deepEqual(config, DEFAULT_CONTENT_GOVERNANCE);
  assert.equal(config.responseSlaHours, 48);
  assert.equal(config.inquiryRetentionDays, 90);
});

test('content governance clamps limits and removes unsafe reviewer entries', () => {
  const config = normalizeContentGovernance({
    responseSlaHours: 9999,
    inquiryRetentionDays: 0,
    reviewers: ['  مراجع موثوق  ', 'x\u0000y', '', 22],
    checklist: { source: false },
    methodology: { ar: '  منهج  ', en: '' },
  });

  assert.equal(config.responseSlaHours, 720);
  assert.equal(config.inquiryRetentionDays, 1);
  assert.deepEqual(config.reviewers, ['مراجع موثوق', 'x y']);
  assert.equal(config.checklist.source, false);
  assert.equal(config.checklist.citation, true);
  assert.equal(config.methodology.ar, 'منهج');
  assert.equal(governanceText(config.methodology, 'en'), '');
});
