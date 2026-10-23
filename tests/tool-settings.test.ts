import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TOOL_SETTINGS, normalizeToolSettings } from '../lib/tool-settings.ts';
import { buildPageControls, pageGate } from '../lib/page-sections.ts';

test('tool settings keep every supported tool enabled by default', () => {
  const settings = normalizeToolSettings(null);
  assert.deepEqual(Object.keys(settings), Object.keys(DEFAULT_TOOL_SETTINGS));
  assert.equal(settings.quran.sourceMode, 'external');
  assert.equal(settings.prayer.enabled, true);
  assert.equal(settings.qibla.sourceMode, 'device');
});

test('tool settings reject unsafe or unknown values while preserving defaults', () => {
  const settings = normalizeToolSettings({
    qibla: { enabled: false, sourceMode: 'unknown', sourceLabel: '  مصدر مخصص  ' },
    prayer: { enabled: 'no', fallbackMessageAr: '' },
    unknown: { enabled: false },
  });

  assert.equal(settings.qibla.enabled, false);
  assert.equal(settings.qibla.sourceMode, 'device');
  assert.equal(settings.qibla.sourceLabel, 'مصدر مخصص');
  assert.equal(settings.prayer.enabled, true);
  assert.equal(settings.prayer.fallbackMessageAr, DEFAULT_TOOL_SETTINGS.prayer.fallbackMessageAr);
  assert.equal('unknown' in settings, false);
});

test('tool enablement is applied to the public tool page gate', () => {
  const controls = buildPageControls({ tools: { qibla: { enabled: false } } });
  const quranControls = buildPageControls({ tools: { quran: { enabled: false } } });
  assert.equal(pageGate(controls, 'qibla', 'ar').pageVisible, false);
  assert.equal(pageGate(controls, 'prayer-times', 'ar').pageVisible, true);
  assert.equal(pageGate(quranControls, 'quran', 'ar').pageVisible, false);
  assert.equal(pageGate(quranControls, 'quran-surah', 'ar').pageVisible, false);
});

test('tool fallback messages are normalized and bounded', () => {
  const settings = normalizeToolSettings({
    prayer: {
      fallbackMessageAr: '  تعذر المصدر  ',
      fallbackMessageEn: '  Source unavailable  ',
    },
  });

  assert.equal(settings.prayer.fallbackMessageAr, 'تعذر المصدر');
  assert.equal(settings.prayer.fallbackMessageEn, 'Source unavailable');
});
