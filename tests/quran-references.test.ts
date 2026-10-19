// tests/quran-references.test.ts
// اختبار منطق مطابقة الاقتباسات القرآنية بنص المصحف (حالات معروفة النتيجة).
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildVerseIndex,
  classifyQuoteContext,
  extractQuotedSpans,
  matchQuranQuote,
  normalizeArabicText,
  splitQuoteFragments,
} from '../lib/references/quran.ts';

test('normalizeArabicText: يجرّد التشكيل ويوحّد الألف', () => {
  assert.equal(
    normalizeArabicText('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'),
    'الحمد لله رب العالمين'
  );
});

test('normalizeArabicText: يوحّد التاء المربوطة والألف المقصورة', () => {
  assert.equal(normalizeArabicText('رَحْمَةٌ وَهُدًى'), 'رحمه وهدي');
});

test('normalizeArabicText: يحذف الألف الخنجرية كما تُكتب إملائيًا', () => {
  assert.equal(normalizeArabicText('إِلَٰهَ'), 'اله');
  assert.equal(normalizeArabicText('هَٰذَا'), 'هذا');
  assert.equal(normalizeArabicText('ٱلرَّحْمَٰنِ'), 'الرحمن');
});

test('normalizeArabicText: يزيل علامات الوقف وعلامات الاتجاه', () => {
  assert.equal(normalizeArabicText('\uFEFFكِتَابٌ ۖ مُبِينٌ'), 'كتاب مبين');
});

test('extractQuotedSpans: يستخرج النص بين علامتي التنصيص', () => {
  const body = 'قال تعالى: «إن الله مع الصابرين» ثم أكمل الكلام.';
  const spans = extractQuotedSpans(body);
  assert.equal(spans.length, 1);
  assert.equal(spans[0].text, 'إن الله مع الصابرين');
  assert.equal(body.slice(spans[0].start, spans[0].end), 'إن الله مع الصابرين');
});

test('extractQuotedSpans: يتجاهل الاقتباسات الأقصر من أربعة أحرف', () => {
  const spans = extractQuotedSpans('نصّ «أبج» ونصّ «كلمة أطول»');
  assert.equal(spans.length, 1);
  assert.equal(spans[0].text, 'كلمة أطول');
});

test('classifyQuoteContext: يفرّق بين القرآن والحديث والنص المجرّد', () => {
  const quranBody = 'قال تعالى: «الذي خلق الموت والحياة»';
  assert.equal(classifyQuoteContext(quranBody, quranBody.indexOf('«') + 1), 'quran');

  const hadithBody = 'قال رسول الله ﷺ: «إنما بعثت لأتمم صالح الأخلاق»';
  assert.equal(classifyQuoteContext(hadithBody, hadithBody.indexOf('«') + 1), 'hadith');

  const plainBody = 'وهذا نص مقتبس: «كلمة جامعة»';
  assert.equal(classifyQuoteContext(plainBody, plainBody.indexOf('«') + 1), 'unknown');
});

test('splitQuoteFragments: يقسم عند الحذف ويطرح المقاطع القصيرة', () => {
  const fragments = splitQuoteFragments('ولنبلونكم بشيء من الخوف والجوع... وبشر الصابرين');
  assert.equal(fragments.length, 2);
  assert.equal(fragments[0], 'ولنبلونكم بشيء من الخوف والجوع');
  assert.equal(fragments[1], 'وبشر الصابرين');

  assert.deepEqual(splitQuoteFragments('قصير'), []);
});

const VERSES = [
  { surah: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  {
    surah: 2,
    ayah: 155,
    text: 'وَلَنَبْلُوَنَّكُمْ بِشَيْءٍ مِنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِنَ الْأَمْوَالِ وَالْأَنْفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ',
  },
  {
    surah: 67,
    ayah: 2,
    text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
  },
  {
    surah: 14,
    ayah: 39,
    text: 'الْحَمْدُ لِلَّهِ الَّذِي وَهَبَ لِي عَلَى الْكِبَرِ إِسْمَاعِيلَ وَإِسْحَاقَ ۚ إِنَّ رَبِّي لَسَمِيعُ الدُّعَاءِ',
  },
];

test('buildVerseIndex: يبني فهرسًا مطبَّعًا', () => {
  const index = buildVerseIndex(VERSES);
  assert.equal(index.length, VERSES.length);
  assert.equal(index[0].norm, 'الحمد لله رب العالمين');
});

test('matchQuranQuote: يطابق آية واحدة بدقة', () => {
  const match = matchQuranQuote(
    'الذي خلق الموت والحياة ليبلوكم أيكم أحسن عملًا',
    buildVerseIndex(VERSES)
  );
  assert.ok(match);
  assert.equal(match.verse.surah, 67);
  assert.equal(match.verse.ayah, 2);
  assert.equal(match.candidates, 1);
});

test('matchQuranQuote: يطابق اقتباسًا فيه حذف داخل آية واحدة', () => {
  const match = matchQuranQuote(
    'ولنبلونكم بشيء من الخوف والجوع... وبشر الصابرين',
    buildVerseIndex(VERSES)
  );
  assert.ok(match);
  assert.equal(match.verse.surah, 2);
  assert.equal(match.verse.ayah, 155);
});

test('matchQuranQuote: يرفض الغموض ولا يخمّن', () => {
  assert.equal(matchQuranQuote('الحمد لله', buildVerseIndex(VERSES)), null);
});

test('matchQuranQuote: يعيد null للمقاطع القصيرة جدًا', () => {
  assert.equal(matchQuranQuote('يا أيها', buildVerseIndex(VERSES)), null);
});
