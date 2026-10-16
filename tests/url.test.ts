// tests/url.test.ts
// روابط الخريطة والخلاصة يجب أن تكون مُرمَّزة ومطلقة دائمًا.
import test from 'node:test';
import assert from 'node:assert/strict';

import { contentUrl, encodeUrl } from '../lib/url.ts';

test('encodeUrl يرمّز المعرّف العربي', () => {
  const out = encodeUrl('https://example.com/ar/learn/lesson/درس-التوحيد');
  assert.equal(
    out,
    'https://example.com/ar/learn/lesson/%D8%AF%D8%B1%D8%B3-%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF'
  );
  assert.ok(!/[\u0600-\u06FF]/.test(out), 'لا يجب أن يبقى حرف عربي خام');
});

test('encodeUrl يعيد المدخل كما هو إذا كان غير صالح', () => {
  assert.equal(encodeUrl('ليس رابطًا'), 'ليس رابطًا');
});

test('contentUrl يبني الرابط ويوحّد الشرطة الأخيرة', () => {
  assert.equal(
    contentUrl('https://example.com/', 'ar', 'lesson', 'درس-1'),
    'https://example.com/ar/learn/lesson/%D8%AF%D8%B1%D8%B3-1'
  );
});

test('contentUrl لا يضيف شرطتين', () => {
  const a = contentUrl('https://example.com', 'en', 'article', 'hello');
  assert.equal(a, 'https://example.com/en/learn/article/hello');
});
