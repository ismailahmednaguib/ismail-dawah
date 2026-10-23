// tests/editor-picks.test.ts
// محلّل مختارات المحرر: صيغة type:slug، ترتيب، تكرار، وحدود.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EDITOR_PICK_TYPES,
  MAX_EDITOR_PICKS,
  parseEditorPicks,
} from '../lib/home/editor-picks.ts';

test('يحلّل سطرًا لكل مادة ويحتفظ بالترتيب', () => {
  const picks = parseEditorPicks(
    'lesson:lesson-quran-1\narticle:article-sabr\nfatwa:fatwa-zakat'
  );

  assert.deepEqual(picks, [
    { type: 'lesson', slug: 'lesson-quran-1' },
    { type: 'article', slug: 'article-sabr' },
    { type: 'fatwa', slug: 'fatwa-zakat' },
  ]);
});

test('يتجاهل الأسطر الفارغة والتعليقات والمسافات', () => {
  const picks = parseEditorPicks(`
    # مواد مختارة

    Lesson : lesson-one
    article:   article-two
    fatwa:
    unknown:thing
  `);

  assert.deepEqual(picks, [
    { type: 'lesson', slug: 'lesson-one' },
    { type: 'article', slug: 'article-two' },
  ]);
});

test('يقبل مصفوفة من النصوص والكائنات', () => {
  const picks = parseEditorPicks([
    'story:story-one',
    { type: 'hadith', slug: 'hadith-one' },
    { type: 'faq', slug: 'faq-one' },
  ]);

  assert.deepEqual(picks, [
    { type: 'story', slug: 'story-one' },
    { type: 'hadith', slug: 'hadith-one' },
    { type: 'faq', slug: 'faq-one' },
  ]);
});

test('يزيل التكرار ويحتفظ بأول ظهور', () => {
  const picks = parseEditorPicks(
    'lesson:same\narticle:same\nlesson:same\nlesson:same'
  );

  assert.deepEqual(picks, [
    { type: 'lesson', slug: 'same' },
    { type: 'article', slug: 'same' },
  ]);
});

test('يقصر القائمة عند الحد الأقصى', () => {
  const lines = Array.from(
    { length: MAX_EDITOR_PICKS + 4 },
    (_, index) => `lesson:lesson-${index + 1}`
  );
  const picks = parseEditorPicks(lines.join('\n'));

  assert.equal(picks.length, MAX_EDITOR_PICKS);
  assert.equal(picks[0]?.slug, 'lesson-1');
  assert.equal(picks.at(-1)?.slug, `lesson-${MAX_EDITOR_PICKS}`);
});

test('يرفض الأنواع غير المدعومة والمدخلات غير الصحيحة', () => {
  assert.deepEqual(parseEditorPicks('page:home'), []);
  assert.deepEqual(parseEditorPicks('lesson'), []);
  assert.deepEqual(parseEditorPicks(':slug'), []);
  assert.deepEqual(parseEditorPicks(42), []);
  assert.deepEqual(parseEditorPicks(null), []);
  assert.deepEqual(parseEditorPicks({ ar: '', en: '' }), []);
});

test('يقبل المعرّفات العربية ويحفظ ما بعد أول نقطتين', () => {
  const picks = parseEditorPicks(
    'article:مقال-عن-الصبر\nlesson:lesson-quran-خطة-حفظ-القرآن-للمبتدئين-7\nstory:story:with-colon'
  );

  assert.deepEqual(picks, [
    { type: 'article', slug: 'مقال-عن-الصبر' },
    { type: 'lesson', slug: 'lesson-quran-خطة-حفظ-القرآن-للمبتدئين-7' },
    { type: 'story', slug: 'story:with-colon' },
  ]);
});

test('يقرأ القيمة القديمة المترجمة بالعربية أولًا', () => {
  const picks = parseEditorPicks({
    ar: 'lesson:arabic-slug',
    en: 'lesson:english-slug',
  });

  assert.deepEqual(picks, [{ type: 'lesson', slug: 'arabic-slug' }]);
});

test('كل الأنواع المعلنة مقبولة', () => {
  for (const type of EDITOR_PICK_TYPES) {
    assert.deepEqual(parseEditorPicks(`${type}:slug`), [
      { type, slug: 'slug' },
    ]);
  }
});
