// tests/params.test.ts
// فكّ ترميز بارامترات المسار — أهم إصلاح في المشروع، فيستحق اختبار انحدار.
import test from 'node:test';
import assert from 'node:assert/strict';

import { decodeParam, decodeParams } from '../lib/params.ts';

test('decodeParam يفكّ المعرّف العربي المرمَّز', () => {
  assert.equal(
    decodeParam('lesson-quran-%D8%AA%D9%81%D8%B3%D9%8A%D8%B1'),
    'lesson-quran-تفسير'
  );
});

test('decodeParam يترك النصّ غير المرمَّز كما هو', () => {
  assert.equal(decodeParam('lesson-quran-تفسير'), 'lesson-quran-تفسير');
  assert.equal(decodeParam('plain-slug-42'), 'plain-slug-42');
});

test('decodeParam يعيد القيمة الأصلية عند ترميز تالف', () => {
  assert.equal(decodeParam('bad-%E0%A4%A'), 'bad-%E0%A4%A');
});

test('decodeParam يتعامل مع القيم الفارغة', () => {
  assert.equal(decodeParam(''), '');
});

test('decodeParams يفكّ كل القيم ولا يمسّ غير النصّية', () => {
  const input = { lang: 'ar', slug: '%D9%81%D9%82%D9%87', id: '3' };
  assert.deepEqual(decodeParams(input), {
    lang: 'ar',
    slug: 'فقه',
    id: '3',
  });
});
