import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SURAHS,
  hadithBookLabel,
  hadithGradeKey,
  hadithGradeLabel,
  metadataText,
  quranReferenceLabel,
} from '../lib/references/display.ts';

test('قائمة السور: ١١٤ سورة بأرقام فريدة', () => {
  assert.equal(SURAHS.length, 114);
  assert.equal(new Set(SURAHS.map((surah) => surah.n)).size, 114);
  assert.equal(SURAHS[50].ar, 'الذاريات');
  assert.equal(SURAHS[50].en, 'Adh-Dhariyat');
  assert.equal(SURAHS[113].en, 'An-Nas');
});

test('مرجع القرآن: عربي وإنجليزي', () => {
  assert.equal(quranReferenceLabel(51, 56, null, 'ar'), 'سورة الذاريات، الآية 56');
  assert.equal(quranReferenceLabel(51, 56, null, 'en'), 'Surah Adh-Dhariyat, verse 56');
});

test('مرجع القرآن: نطاق آيات', () => {
  assert.equal(quranReferenceLabel(2, 1, 5, 'ar'), 'سورة البقرة، الآية 1-5');
  assert.equal(quranReferenceLabel(2, 1, 5, 'en'), 'Surah Al-Baqarah, verses 1–5');
});

test('مرجع القرآن: سورة غير معروفة لا تسرّب رقمًا فقط', () => {
  assert.equal(quranReferenceLabel(999, 3, null, 'en'), 'The Holy Quran, verse 3');
});

test('كتاب الحديث: ترجمة الأسماء المعروفة وإخفاء العربي المجهول', () => {
  assert.equal(hadithBookLabel('صحيح البخاري', 'en'), 'Sahih al-Bukhari');
  assert.equal(hadithBookLabel('سنن الترمذي', 'en'), "Jami' at-Tirmidhi");
  assert.equal(hadithBookLabel('كتاب مجهول', 'en'), '');
  assert.equal(hadithBookLabel('صحيح البخاري', 'ar'), 'صحيح البخاري');
  assert.equal(hadithBookLabel('Sahih Muslim', 'en'), 'Sahih Muslim');
});

test('درجة الحديث: توحيد المفاتيح العربية والإنجليزية', () => {
  assert.equal(hadithGradeKey('sahih'), 'sahih');
  assert.equal(hadithGradeKey('صحيح'), 'sahih');
  assert.equal(hadithGradeKey('حسن'), 'hasan');

  assert.equal(hadithGradeLabel('sahih', 'en'), 'Sahih');
  assert.equal(hadithGradeLabel('sahih', 'ar'), 'صحيح');
  assert.equal(hadithGradeLabel('صحيح', 'en'), 'Sahih');
  assert.equal(hadithGradeLabel('درجة مجهولة', 'en'), '');
});

test('البيانات الوصفية: إخفاء العربي غير المترجم في الإنجليزية', () => {
  assert.equal(metadataText('أبو هريرة', 'en'), '');
  assert.equal(metadataText('أبو هريرة', 'ar'), 'أبو هريرة');
  assert.equal(metadataText('Abu Hurayrah', 'en'), 'Abu Hurayrah');
  assert.equal(metadataText('  ', 'en'), '');
});
