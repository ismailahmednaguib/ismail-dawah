import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_NEW_MUSLIM_JOURNEY_CONFIG, normalizeNewMuslimJourneyConfig } from '../lib/new-muslim-journey.ts';

test('رحلة المسلم الجديد معطلة افتراضيًا وتغطي 30 يومًا برسائل كل 48 ساعة', () => {
  assert.equal(DEFAULT_NEW_MUSLIM_JOURNEY_CONFIG.enabled, false);
  assert.equal(DEFAULT_NEW_MUSLIM_JOURNEY_CONFIG.intervalHours, 48);
  assert.equal(DEFAULT_NEW_MUSLIM_JOURNEY_CONFIG.days.length, 15);
});

test('رحلة المسلم الجديد تنظف الإعدادات وتقيد الفاصل والروابط الداخلية', () => {
  const config = normalizeNewMuslimJourneyConfig({ enabled: true, intervalHours: 999, days: [{ href: 'https://evil.example', subject: { ar: '  عنوان  ' } }] });
  assert.equal(config.enabled, true);
  assert.equal(config.intervalHours, 168);
  assert.equal(config.days[0]?.subject.ar, 'عنوان');
  assert.equal(config.days[0]?.href, '/embrace-islam#first-30-days');
  assert.equal(config.days.length, 15);
});
