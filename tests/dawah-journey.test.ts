import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DAWAH_JOURNEY_CONFIG, normalizeDawahJourneyConfig } from '../lib/dawah-journey.ts';

test('dawah journey defaults to disabled and seven days', () => {
  const config = normalizeDawahJourneyConfig(null);
  assert.equal(config.enabled, false);
  assert.equal(config.intervalHours, 24);
  assert.equal(config.days.length, 7);
});

test('dawah journey sanitizes settings and keeps safe internal links', () => {
  const config = normalizeDawahJourneyConfig({
    enabled: true,
    intervalHours: 999,
    days: [{
      href: 'https://example.com',
      subject: { ar: '  يوم 1  ', en: '' },
      body: { ar: 'رسالة\u0000', en: 'Message' },
    }],
  });

  assert.equal(config.enabled, true);
  assert.equal(config.intervalHours, 168);
  assert.equal(config.days[0].href, DEFAULT_DAWAH_JOURNEY_CONFIG.days[0].href);
  assert.equal(config.days[0].subject.ar, 'يوم 1');
  assert.equal(config.days[0].subject.en, DEFAULT_DAWAH_JOURNEY_CONFIG.days[0].subject.en);
  assert.equal(config.days[0].body.ar, 'رسالة');
});
