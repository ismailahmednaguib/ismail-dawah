import test from 'node:test';
import assert from 'node:assert/strict';

import { dhikrSourceText, dhikrVirtueText } from '../lib/data.ts';

test('مصدر الذكر: العربية تعيد النص كما هو', () => {
  assert.equal(dhikrSourceText('رواه مسلم', 'ar'), 'رواه مسلم');
  assert.equal(dhikrSourceText('متفق عليه', 'ar'), 'متفق عليه');
});

test('مصدر الذكر: الإنجليزية تترجم أسماء المصادر المعروفة', () => {
  assert.equal(dhikrSourceText('رواه مسلم', 'en'), 'Narrated by Muslim');
  assert.equal(dhikrSourceText('رواه البخاري', 'en'), 'Narrated by Al-Bukhari');
  assert.equal(dhikrSourceText('متفق عليه', 'en'), 'Agreed upon (Al-Bukhari & Muslim)');
});

test('مصدر الذكر: النص العربي غير المعروف لا يظهر بالإنجليزية', () => {
  assert.equal(dhikrSourceText('رواه فلان', 'en'), '');
});

test('مصدر الذكر: النص الإنجليزي يبقى كما هو', () => {
  assert.equal(dhikrSourceText('Narrated by Muslim', 'en'), 'Narrated by Muslim');
});

test('فضل الذكر: يظهر بالعربية ويُخفى بالإنجليزية حتى تُراجَع الترجمة', () => {
  assert.equal(dhikrVirtueText('سيد الاستغفار', 'ar'), 'سيد الاستغفار');
  assert.equal(dhikrVirtueText('سيد الاستغفار', 'en'), '');
  assert.equal(dhikrVirtueText(undefined, 'en'), '');
});
