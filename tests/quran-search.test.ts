import test from 'node:test';
import assert from 'node:assert/strict';

import { searchSurahs } from '../lib/references/quran-search.ts';
import { SURAH_MEANINGS_EN } from '../lib/references/surah-meanings.ts';

function first(query: string, lang: 'ar' | 'en') {
  const [match] = searchSurahs(query, lang);
  assert.ok(match, `لا نتيجة للاستعلام: ${query}`);
  return match;
}

test('بحث السور: الاسم العربي مع الأداة وبدونها', () => {
  assert.equal(first('الفاتحة', 'ar').number, 1);
  assert.equal(first('فاتحة', 'ar').number, 1);
  assert.equal(first('الفاتحة', 'ar').title, 'سورة الفاتحة');
  assert.equal(first('الفاتحة', 'ar').summary, '٧ آيات');
  assert.equal(first('البقرة', 'ar').summary, '٢٨٦ آية');
});

test('بحث السور: يوحد الألف والهمزة والتاء المربوطة', () => {
  assert.equal(first('الانعام', 'ar').number, 6);
  assert.equal(first('الأنعام', 'ar').number, 6);
  assert.equal(first('البقره', 'ar').number, 2);
});

test('بحث السور: الاسم الإنجليزي بلا حساسية لحالة الأحرف والشرطات', () => {
  assert.equal(first('al fatihah', 'en').number, 1);
  assert.equal(first('Al-Fatihah', 'en').number, 1);
  assert.equal(first('fatiha', 'en').number, 1);
  assert.equal(first('imran', 'en').number, 3);
  assert.equal(first('ya-sin', 'en').number, 36);
  assert.equal(first("ma'idah", 'en').number, 5);
});

test('بحث السور: معنى الاسم الإنجليزي مثل The Cave', () => {
  assert.equal(first('The Cave', 'en').number, 18);
  assert.equal(first('cave', 'en').number, 18);
  assert.equal(first('the opening', 'en').number, 1);
  assert.equal(first('The Cow', 'en').number, 2);
  assert.equal(first('family of imraan', 'en').number, 3);

  const arabic = first('The Cave', 'ar');
  assert.equal(arabic.number, 18);
  assert.equal(arabic.title, 'سورة الكهف');
});

test('بحث السور: كلمات الوصل وحدها لا تعيد نتائج', () => {
  assert.deepEqual(searchSurahs('the', 'en'), []);
  assert.deepEqual(searchSurahs('of', 'en'), []);
});

test('بحث السور: المعنى التام يتقدم على بداية المعنى', () => {
  const matches = searchSurahs('The Night', 'en');
  assert.equal(matches[0].number, 92);
  assert.ok(matches.some((match) => match.number === 17));
});

test('بحث السور: رقم السورة باللاتينية والعربية والفارسية', () => {
  assert.equal(first('2', 'ar').number, 2);
  assert.equal(first('٢', 'ar').number, 2);
  assert.equal(first('۲', 'ar').number, 2);
  assert.equal(first('36', 'en').number, 36);
});

test('بحث السور: التطابق التام يتقدم على مجرد الاحتواء', () => {
  const matches = searchSurahs('الفلق', 'ar');
  assert.equal(matches[0].number, 113);
});

test('بحث السور: نتائج الإنجليزية لا تحتوي حروفًا عربية', () => {
  for (const match of searchSurahs('al', 'en')) {
    assert.doesNotMatch(match.title, /[\u0600-\u06FF]/);
    assert.doesNotMatch(match.summary, /[\u0600-\u06FF]/);
  }
});

test('بحث السور: الاستعلام الفارغ يعيد مصفوفة فارغة', () => {
  assert.deepEqual(searchSurahs('', 'ar'), []);
  assert.deepEqual(searchSurahs('   ', 'ar'), []);
});

test('بحث السور: يعيد عنوانًا وملخصًا إنجليزيين', () => {
  const match = first('kahf', 'en');
  assert.equal(match.number, 18);
  assert.equal(match.title, 'Surah Al-Kahf');
  assert.equal(match.summary, '110 verses');
});

test('معاني السور: ١١٤ مدخلًا إنجليزيًّا بلا حروف عربية', () => {
  const numbers = Object.keys(SURAH_MEANINGS_EN)
    .map(Number)
    .sort((a, b) => a - b);

  assert.deepEqual(
    numbers,
    Array.from({ length: 114 }, (_, index) => index + 1)
  );

  for (const meaning of Object.values(SURAH_MEANINGS_EN)) {
    assert.ok(meaning.trim().length > 0);
    assert.doesNotMatch(meaning, /[\u0600-\u06FF]/);
  }
});

test('بحث السور: نتائج المعاني الإنجليزية لا تحتوي حروفًا عربية', () => {
  for (const query of ['The Cave', 'The Opening', 'The Cow']) {
    for (const match of searchSurahs(query, 'en')) {
      assert.doesNotMatch(match.title, /[\u0600-\u06FF]/);
      assert.doesNotMatch(match.summary, /[\u0600-\u06FF]/);
    }
  }
});
