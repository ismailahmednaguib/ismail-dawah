import test from 'node:test';
import assert from 'node:assert/strict';

import { legacySlugCandidates } from '../lib/learn/legacy-slugs.ts';

test('legacy hadith slug removes only the duplicate type prefix', () => {
  assert.deepEqual(
    legacySlugCandidates('hadith', 'hadith-hadith-حديث-الإيمان-10'),
    ['hadith-hadith-حديث-الإيمان-10', 'hadith-حديث-الإيمان-10']
  );
});

test('legacy slug resolver does not strip meaningful numeric suffixes', () => {
  assert.deepEqual(legacySlugCandidates('hadith', 'hadith-intention-10'), ['hadith-intention-10']);
});

test('non-hadith content keeps its exact slug', () => {
  assert.deepEqual(legacySlugCandidates('lesson', 'lesson-lesson-فقه-1'), ['lesson-lesson-فقه-1']);
});
