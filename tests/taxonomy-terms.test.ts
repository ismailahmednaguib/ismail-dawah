import test from 'node:test';
import assert from 'node:assert/strict';

import { mergeTermTranslations, type TermLike } from '../lib/learn/terms.ts';

function term(overrides: Partial<TermLike>): TermLike {
  return {
    id: 'ar-1',
    kind: 'field',
    name: 'العقيدة',
    slug: 'aqeedah',
    icon: '🕌',
    color: 'primary',
    lang: 'ar',
    ...overrides,
  };
}

test('دمج التصنيفات: يطابق نفس slug وkind ويأخذ الاسم الإنجليزي', () => {
  const arabic = term({});
  const english = term({ id: 'en-1', name: 'Creed (Aqeedah)', lang: 'en', icon: null, color: null });

  const [merged] = mergeTermTranslations([arabic], [english], 'en');

  assert.equal(merged.id, 'en-1');
  assert.equal(merged.name, 'Creed (Aqeedah)');
  assert.equal(merged.lang, 'en');
});

test('دمج التصنيفات: نفس الـslug بنوع مختلف لا يُطابَق', () => {
  const arabic = term({ kind: 'branch', name: 'العقيدة وأصول الدين' });
  const englishField = term({ id: 'en-field', kind: 'field', name: 'Creed (Aqeedah)', lang: 'en' });

  const [merged] = mergeTermTranslations([arabic], [englishField], 'en');

  assert.equal(merged.name, 'العقيدة وأصول الدين');
  assert.equal(merged.id, 'ar-1');
});

test('دمج التصنيفات: التصنيف بلا ترجمة يبقى كما هو', () => {
  const arabic = term({ slug: 'unknown', name: 'تصنيف بلا ترجمة' });

  const [merged] = mergeTermTranslations([arabic], [], 'en');

  assert.deepEqual(merged, arabic);
});

test('دمج التصنيفات: يحافظ على icon/color إن غابا في الترجمة', () => {
  const arabic = term({ icon: '📖', color: 'gold' });
  const english = term({ id: 'en-2', name: 'Fiqh', lang: 'en', icon: null, color: null });

  const [merged] = mergeTermTranslations([arabic], [english], 'en');

  assert.equal(merged.icon, '📖');
  assert.equal(merged.color, 'gold');
});

test('دمج التصنيفات: العربية لا تتأثر ولا تُستبدل', () => {
  const arabic = term({});
  const english = term({ id: 'en-3', name: 'Creed', lang: 'en' });

  const result = mergeTermTranslations([arabic], [english], 'ar');

  assert.equal(result[0], arabic);
});
