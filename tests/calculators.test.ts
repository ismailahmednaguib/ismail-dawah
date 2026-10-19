// tests/calculators.test.ts
// حالات معروفة النتيجة للحاسبتين (زكاة · ميراث)، بلا قاعدة بيانات أو واجهة.
import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateInheritance } from '../lib/calculators/inheritance.ts';
import { Fraction } from '../lib/calculators/fraction.ts';
import {
  calculateZakat,
  normalizeIrrigation,
  normalizeNisabBasis,
  parseNonNegativeNumber,
} from '../lib/calculators/zakat.ts';

const baseInput = {
  deceasedGender: 'male' as const,
  hasSpouse: false,
  hasFather: false,
  hasMother: false,
  sons: 0,
  daughters: 0,
  fullBrothers: 0,
  fullSisters: 0,
};

function shareOf(
  rows: ReturnType<typeof calculateInheritance>['rows'],
  key: string
): Fraction | undefined {
  return rows.find((row) => row.key === key)?.share;
}

test('الزوجة والأب والأم والابن والبنت: فروض ثم تعصيب 2:1', () => {
  const result = calculateInheritance({
    ...baseInput,
    hasSpouse: true,
    hasFather: true,
    hasMother: true,
    sons: 1,
    daughters: 1,
  });

  assert.equal(shareOf(result.rows, 'spouse')?.toString(), '1/8');
  assert.equal(shareOf(result.rows, 'father')?.toString(), '1/6');
  assert.equal(shareOf(result.rows, 'mother')?.toString(), '1/6');
  assert.equal(shareOf(result.rows, 'sons')?.toString(), '13/36');
  assert.equal(shareOf(result.rows, 'daughters')?.toString(), '13/72');
  assert.equal(result.totalShare.toString(), '1');
  assert.equal(result.appliedAwl, false);
  assert.equal(result.appliedRadd, false);
});

test('زوج وأم وأختان شقيقتان: عول من 6 إلى 8', () => {
  const result = calculateInheritance({
    ...baseInput,
    deceasedGender: 'female',
    hasSpouse: true,
    hasMother: true,
    fullSisters: 2,
  });

  assert.equal(shareOf(result.rows, 'spouse')?.toString(), '3/8');
  assert.equal(shareOf(result.rows, 'mother')?.toString(), '1/8');
  assert.equal(shareOf(result.rows, 'fullSisters')?.toString(), '1/2');
  assert.equal(result.totalShare.toString(), '1');
  assert.equal(result.appliedAwl, true);
  assert.ok(result.warnings.includes('awl'));
});

test('أم وبنت واحدة: رد فيصير للأم الربع وللبنت ثلاثة أرباع', () => {
  const result = calculateInheritance({
    ...baseInput,
    hasMother: true,
    daughters: 1,
  });

  assert.equal(shareOf(result.rows, 'mother')?.toString(), '1/4');
  assert.equal(shareOf(result.rows, 'daughters')?.toString(), '3/4');
  assert.equal(result.totalShare.toString(), '1');
  assert.equal(result.appliedRadd, true);
  assert.ok(result.warnings.includes('radd'));
});

test('العمرية: زوج وأب وأم بلا ولد ولا إخوة', () => {
  const result = calculateInheritance({
    ...baseInput,
    deceasedGender: 'female',
    hasSpouse: true,
    hasFather: true,
    hasMother: true,
  });

  assert.equal(shareOf(result.rows, 'spouse')?.toString(), '1/2');
  assert.equal(shareOf(result.rows, 'mother')?.toString(), '1/6');
  assert.equal(shareOf(result.rows, 'father')?.toString(), '1/3');
  assert.equal(result.totalShare.toString(), '1');
});

test('الأب والأم فقط: للأم الثلث والباقي للأب تعصيبًا', () => {
  const result = calculateInheritance({
    ...baseInput,
    hasFather: true,
    hasMother: true,
  });

  assert.equal(shareOf(result.rows, 'mother')?.toString(), '1/3');
  assert.equal(shareOf(result.rows, 'father')?.toString(), '2/3');
  assert.equal(result.totalShare.toString(), '1');
});

test('الزوج وحده: يأخذ النصف ويُنبه أن الباقي أُعطي له في الحاسبة المبسطة', () => {
  const result = calculateInheritance({
    ...baseInput,
    deceasedGender: 'female',
    hasSpouse: true,
  });

  assert.equal(shareOf(result.rows, 'spouse')?.toString(), '1');
  assert.ok(result.warnings.includes('spouse_only'));
});

test('بلا ورثة: لا صفوف وتنبيه واضح', () => {
  const result = calculateInheritance(baseInput);

  assert.equal(result.rows.length, 0);
  assert.deepEqual(result.warnings, ['no_heirs']);
  assert.equal(result.totalShare.toString(), '0');
});

test('الزكاة: مال بلغ نصاب الفضة تجب فيه 2.5%', () => {
  const result = calculateZakat({
    cash: 100_000,
    goldGrams: 0,
    silverGrams: 0,
    goldPrice: 0,
    silverPrice: 1,
    goods: 0,
    receivables: 0,
    debts: 0,
    crops: 0,
    nisabBasis: 'silver',
    irrigation: 'rain',
    submitted: true,
  });

  assert.equal(result.nisabValue, 595);
  assert.equal(result.payable, true);
  assert.equal(result.zakatAmount, 2500);
});

test('الزكاة: نصاب الذهب والديون تخفض صافي المال', () => {
  const result = calculateZakat({
    cash: 8_000,
    goldGrams: 0,
    silverGrams: 0,
    goldPrice: 100,
    silverPrice: 1,
    goods: 0,
    receivables: 0,
    debts: 1_000,
    crops: 0,
    nisabBasis: 'gold',
    irrigation: 'rain',
    submitted: true,
  });

  assert.equal(result.goldNisabValue, 8_500);
  assert.equal(result.netWealth, 7_000);
  assert.equal(result.payable, false);
  assert.equal(result.zakatAmount, 0);
});

test('الزكاة: الذهب وزنًا يبلغ النصاب حتى دون سعر، بلا مبلغ محسوب', () => {
  const result = calculateZakat({
    cash: 500,
    goldGrams: 85,
    silverGrams: 0,
    goldPrice: 0,
    silverPrice: 0,
    goods: 0,
    receivables: 0,
    debts: 0,
    crops: 0,
    nisabBasis: 'silver',
    irrigation: 'rain',
    submitted: true,
  });

  assert.equal(result.reachedMetalNisabByWeight, true);
  assert.equal(result.canCalculateMonetaryNisab, false);
  assert.equal(result.payable, true);
  assert.equal(result.zakatAmount, 0);
  assert.ok(result.warnings.includes('gold_price_missing'));
  assert.ok(result.warnings.includes('nisab_unknown'));
});

test('الزكاة: نسبة المحصول 10% و5% و7.5%', () => {
  const make = (irrigation: 'rain' | 'irrigated' | 'mixed') =>
    calculateZakat({
      cash: 0,
      goldGrams: 0,
      silverGrams: 0,
      goldPrice: 0,
      silverPrice: 0,
      goods: 0,
      receivables: 0,
      debts: 0,
      crops: 1_000,
      nisabBasis: 'silver',
      irrigation,
      submitted: true,
    });

  assert.equal(make('rain').cropZakat, 100);
  assert.equal(make('irrigated').cropZakat, 50);
  assert.equal(make('mixed').cropZakat, 75);
});

test('مدخلات الزكاة: تنظيف الأرقام والمفردات', () => {
  assert.equal(parseNonNegativeNumber(' 1,250 '), 1250);
  assert.equal(parseNonNegativeNumber('-5'), 0);
  assert.equal(parseNonNegativeNumber('abc'), 0);
  assert.equal(parseNonNegativeNumber(undefined), 0);
  assert.equal(normalizeNisabBasis('GOLD'), 'gold');
  assert.equal(normalizeNisabBasis('anything'), 'silver');
  assert.equal(normalizeIrrigation('Irrigated'), 'irrigated');
  assert.equal(normalizeIrrigation('mixed'), 'mixed');
  assert.equal(normalizeIrrigation('x'), 'rain');
});
