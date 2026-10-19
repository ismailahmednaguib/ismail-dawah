import test from 'node:test';
import assert from 'node:assert/strict';

import { isPlayStoreUrl, resolvePlayStoreUrl } from '../lib/store.ts';

test('يقبل رابط Google Play الرسمي لصفحة تطبيق', () => {
  const url = 'https://play.google.com/store/apps/details?id=com.ismail.dawah';
  assert.equal(isPlayStoreUrl(url), true);
  assert.equal(resolvePlayStoreUrl(url), url);
});

test('يرفض الروابط غير الرسمية أو غير الآمنة', () => {
  assert.equal(isPlayStoreUrl('http://play.google.com/store/apps/details?id=com.ismail.dawah'), false);
  assert.equal(isPlayStoreUrl('https://play.google.com.evil.example/store/apps/details?id=com.ismail.dawah'), false);
  assert.equal(isPlayStoreUrl('https://example.com/store/apps/details?id=com.ismail.dawah'), false);
  assert.equal(isPlayStoreUrl('https://play.google.com/store/search?q=islam'), false);
  assert.equal(isPlayStoreUrl('javascript:alert(1)'), false);
  assert.equal(isPlayStoreUrl(''), false);
  assert.equal(isPlayStoreUrl(null), false);
});

test('يرفض معرّف الحزمة التالف', () => {
  assert.equal(isPlayStoreUrl('https://play.google.com/store/apps/details?id=dawah'), false);
  assert.equal(isPlayStoreUrl('https://play.google.com/store/apps/details?id=com..dawah'), false);
  assert.equal(isPlayStoreUrl('https://play.google.com/store/apps/details'), false);
});

test('يختار أول مصدر صالح ويتجاوز الفارغ والتالف', () => {
  const good = 'https://play.google.com/store/apps/details?id=com.ismail.dawah';
  assert.equal(resolvePlayStoreUrl('', 'not-a-url', good), good);
  assert.equal(resolvePlayStoreUrl(undefined, null, ''), '');
});
