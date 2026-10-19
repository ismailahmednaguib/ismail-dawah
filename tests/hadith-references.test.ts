// tests/hadith-references.test.ts
// اختبار منطق مطابقة الاقتباسات الحديثية (حالات معروفة النتيجة).
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildHadithIndex,
  detectHadithBook,
  detectHadithBookInText,
  findHadithCandidates,
  matchHadithQuote,
} from '../lib/references/hadith.ts';

const RECORDS = [
  { book: 'bukhari' as const, number: 1, text: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الْأَخْلَاقِ' },
  { book: 'muslim' as const, number: 2, text: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ' },
  { book: 'tirmidhi' as const, number: 3, text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ' },
  { book: 'nasai' as const, number: 4, text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ وَفِي كُلٍّ خَيْرٌ' },
];

test('buildHadithIndex: يبني فهرسًا مطبَّعًا', () => {
  const index = buildHadithIndex(RECORDS);
  assert.equal(index.length, RECORDS.length);
  assert.equal(index[0].norm, 'انما بعثت لاتمم صالح الاخلاق');
});

test('matchHadithQuote: يطابق حديثًا واحدًا بدقة', () => {
  const match = matchHadithQuote(
    'إنما بعثت لأتمم صالح الأخلاق',
    buildHadithIndex(RECORDS)
  );
  assert.ok(match);
  assert.equal(match.hadith.book, 'bukhari');
  assert.equal(match.hadith.number, 1);
});

test('matchHadithQuote: يرفض الغموض ولا يخمّن', () => {
  const match = matchHadithQuote(
    'المؤمن القوي خير وأحب إلى الله',
    buildHadithIndex(RECORDS)
  );
  assert.equal(match, null);
});

test('matchHadithQuote: يتجاهل المقاطع الأقصر من الحد الأدنى', () => {
  const match = matchHadithQuote('إنما بعثت', buildHadithIndex(RECORDS));
  assert.equal(match, null);
});

test('findHadithCandidates: يعيد كل المرشّحين لا واحدًا', () => {
  const candidates = findHadithCandidates(
    'المؤمن القوي خير وأحب إلى الله',
    buildHadithIndex(RECORDS)
  );
  assert.equal(candidates.length, 2);
});

test('detectHadithBookInText: يقرأ الكتاب من أي موضع في النص', () => {
  assert.equal(detectHadithBookInText('المصدر: صحيح مسلم'), 'muslim');
  assert.equal(detectHadithBookInText('نص خالٍ من ذكر الكتب'), null);
});

test('detectHadithBook: يستخرج الكتاب المذكور قرب الاقتباس', () => {
  const bukhariBody = 'قال ﷺ، رواه البخاري: «إنما بعثت لأتمم صالح الأخلاق»';
  assert.equal(detectHadithBook(bukhariBody, bukhariBody.indexOf('«') + 1), 'bukhari');

  const muslimBody = 'أخرجه مسلم في صحيحه: «إنما بعثت لأتمم مكارم الأخلاق»';
  assert.equal(detectHadithBook(muslimBody, muslimBody.indexOf('«') + 1), 'muslim');
});

test('detectHadithBook: لا يخطئ في سياق قرآني', () => {
  const quranBody = 'قال تعالى: «مالك يوم الدين» وقال: «إياك نعبد»';
  assert.equal(detectHadithBook(quranBody, quranBody.indexOf('«') + 1), null);

  const plainBody = 'قال ﷺ: «تبسمك في وجه أخيك صدقة»';
  assert.equal(detectHadithBook(plainBody, plainBody.indexOf('«') + 1), null);
});
