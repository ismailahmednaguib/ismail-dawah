// tests/settings-keys.test.ts
// القيم المنطقية والمركّبة لا تُخزَّن لكل لغة؛ وإلا صارت كائنًا truthy في الواجهة.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NON_LOCALIZED_SETTING_KEYS,
  isNonLocalizedSetting,
} from '../lib/settings-keys.ts';

test('المفاتيح المنطقية غير مرتبطة بلغة', () => {
  assert.equal(isNonLocalizedSetting('publicApiEnabled'), true);
  assert.equal(isNonLocalizedSetting('showPrayerBar'), true);
});

test('الإعدادات المركّبة غير مرتبطة بلغة', () => {
  for (const key of [
    'pageSections',
    'sectionTitles',
    'hiddenPages',
    'sectionOrder',
    'navigation',
    'editorPicks',
    'dawahJourney',
    'assistant',
    'emailVerification',
    'passwordReset',
    'passwordChange',
  ]) {
    assert.equal(isNonLocalizedSetting(key), true, key);
  }
});

test('النصوص القابلة للترجمة ليست ضمن القائمة', () => {
  for (const key of ['ownerName', 'homeTitle', 'metaTitle', 'email', 'address', 'weeklySchedule']) {
    assert.equal(isNonLocalizedSetting(key), false, key);
  }
  assert.equal(NON_LOCALIZED_SETTING_KEYS.has('ownerName'), false);
});
