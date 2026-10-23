import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultSectionOrder,
  mergeSectionOrder,
} from '../lib/page-sections.ts';

test('section order keeps only known sections and appends missing defaults', () => {
  const defaults = defaultSectionOrder();
  const result = mergeSectionOrder({
    home: ['cta', 'unknown', 'hero', 'cta'],
  });

  assert.deepEqual(result.home.slice(0, 3), ['cta', 'hero', 'sections']);
  assert.deepEqual(result.quran, defaults.quran);
});

test('section order falls back safely for invalid settings', () => {
  assert.deepEqual(mergeSectionOrder(null), defaultSectionOrder());
  assert.deepEqual(mergeSectionOrder({ home: 'not-an-array' }), defaultSectionOrder());
});
