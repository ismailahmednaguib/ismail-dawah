import test from 'node:test';
import assert from 'node:assert/strict';

import { readSettingText } from '../lib/settings-text.ts';

test('قراءة إعداد مترجم: كل لغة تأخذ قيمتها', () => {
  const value = { ar: 'اكتشف الإسلام', en: 'Discover Islam' };

  assert.equal(readSettingText(value, 'ar', 'احتياطي'), 'اكتشف الإسلام');
  assert.equal(readSettingText(value, 'en', 'fallback'), 'Discover Islam');
});

test('قراءة إعداد مترجم: تُشذّب المسافات', () => {
  assert.equal(
    readSettingText({ ar: '  اكتشف الإسلام  ' }, 'ar', 'احتياطي'),
    'اكتشف الإسلام'
  );
});

test('قراءة إعداد مترجم: لا يُسرّب العربي إلى الإنجليزية', () => {
  assert.equal(
    readSettingText({ ar: 'اكتشف الإسلام' }, 'en', 'Discover Islam'),
    'Discover Islam'
  );

  assert.equal(
    readSettingText('اكتشف الإسلام', 'en', 'Discover Islam'),
    'Discover Islam'
  );
});

test('قراءة إعداد مترجم: النص المفرد العربي يصل للعربية', () => {
  assert.equal(readSettingText('اكتشف الإسلام', 'ar', 'احتياطي'), 'اكتشف الإسلام');
});

test('قراءة إعداد مترجم: النص الإنجليزي يصل للإنجليزية', () => {
  assert.equal(readSettingText('Discover Islam', 'en', 'fallback'), 'Discover Islam');
});

test('قراءة إعداد مترجم: القيم الفارغة أو غير النصية تعود للاحتياطي', () => {
  for (const value of [undefined, null, '', '   ', 42, true, ['x'], { en: '   ' }]) {
    assert.equal(readSettingText(value, 'en', 'fallback'), 'fallback');
  }
});

test('قراءة إعداد مترجم: الكائن غير المترجم لا يُستخدم', () => {
  assert.equal(readSettingText({ value: 'x' }, 'ar', 'احتياطي'), 'احتياطي');
});
