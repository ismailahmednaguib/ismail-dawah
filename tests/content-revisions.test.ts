// tests/content-revisions.test.ts
// سجل النسخ: بناء النسخة، التحقق منها، واختيار الترجمة للاستعادة.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_CONTENT_REVISIONS,
  MAX_REVISION_TRANSLATIONS,
  buildContentRevisionSnapshot,
  buildRevisionRestoreInput,
  parseContentRevisionSnapshot,
  pickRevisionTranslation,
  type ContentRevisionSnapshot,
} from '../lib/content-revisions.ts';

function validSnapshot(): ContentRevisionSnapshot {
  return {
    content: {
      content_type: 'fatwa',
      audience: ['muslim_general'],
      age_groups: ['adults'],
      levels: ['beginner'],
      madhhabs: ['general'],
      needs_scholar_review: true,
      is_sensitive: true,
      status: 'published',
    },
    translations: [
      {
        id: 't-ar',
        lang: 'ar',
        title: 'حكم الصلاة',
        slug: 'salah-ruling',
        summary: 'ملخص',
        body: '<p>نص</p>',
        meta_title: 'عنوان SEO',
        meta_description: 'وصف SEO',
      },
      {
        id: 't-en',
        lang: 'en',
        title: 'Prayer ruling',
        slug: 'prayer-ruling',
        summary: null,
        body: null,
        meta_title: null,
        meta_description: null,
      },
    ],
  };
}

test('بناء النسخة يحفظ الحقول القابلة للتعديل فقط', () => {
  const snapshot = buildContentRevisionSnapshot({
    id: 'content-1',
    content_type: 'fatwa',
    status: 'published',
    audience: ['muslim_general'],
    age_groups: ['adults'],
    levels: ['beginner'],
    madhhabs: ['general'],
    needs_scholar_review: true,
    is_sensitive: true,
    views: 999,
    content_translations: [
      {
        id: 't-ar',
        lang: 'ar',
        title: 'حكم الصلاة',
        slug: 'salah-ruling',
        summary: 'ملخص',
        body: '<p>نص</p>',
        body_plain: 'نص',
        meta_title: 'عنوان SEO',
        meta_description: 'وصف SEO',
        is_reviewed: true,
      },
    ],
  });

  assert.equal(snapshot.content.content_type, 'fatwa');
  assert.equal(snapshot.content.status, 'published');
  assert.equal((snapshot.content as Record<string, unknown>).views, undefined);
  assert.equal((snapshot as unknown as Record<string, unknown>).id, undefined);

  assert.equal(snapshot.translations.length, 1);
  const translation = snapshot.translations[0] as Record<string, unknown>;
  assert.equal(translation.body_plain, undefined);
  assert.equal(translation.is_reviewed, undefined);
  assert.equal(translation.title, 'حكم الصلاة');
});

test('بناء النسخة يعوّض المصفوفات الفارغة ويستبعد الترجمة الناقصة', () => {
  const snapshot = buildContentRevisionSnapshot({
    content_type: '',
    audience: null,
    age_groups: [],
    levels: ['  '],
    madhhabs: [42],
    content_translations: [
      { id: '', lang: 'ar', title: 'بلا معرّف', slug: 'x' },
      { id: 't-1', lang: 'ar', title: 'عنوان', slug: 'slug' },
    ],
  });

  assert.equal(snapshot.content.content_type, 'article');
  assert.deepEqual(snapshot.content.audience, ['muslim_general']);
  assert.deepEqual(snapshot.content.age_groups, ['all']);
  assert.deepEqual(snapshot.content.levels, ['beginner']);
  assert.deepEqual(snapshot.content.madhhabs, ['general']);
  assert.equal(snapshot.content.status, null);
  assert.equal(snapshot.translations.length, 1);
  assert.equal(snapshot.translations[0].id, 't-1');
});

test('النسخة الصالحة تمرّ عبر التحقق دون تغيير', () => {
  const snapshot = validSnapshot();
  assert.deepEqual(parseContentRevisionSnapshot(snapshot), snapshot);
});

test('التحقق يرفض النسخ الناقصة أو التالفة', () => {
  assert.equal(parseContentRevisionSnapshot(null), null);
  assert.equal(parseContentRevisionSnapshot([]), null);
  assert.equal(parseContentRevisionSnapshot({}), null);
  assert.equal(
    parseContentRevisionSnapshot({ content: validSnapshot().content, translations: [] }),
    null
  );
  assert.equal(
    parseContentRevisionSnapshot({
      content: { ...validSnapshot().content, needs_scholar_review: 'yes' },
      translations: validSnapshot().translations,
    }),
    null
  );
  assert.equal(
    parseContentRevisionSnapshot({
      ...validSnapshot(),
      translations: [{ id: 't', lang: 'ar', title: 'عنوان', slug: '' }],
    }),
    null
  );
  assert.equal(
    parseContentRevisionSnapshot({
      ...validSnapshot(),
      content: { ...validSnapshot().content, audience: [] },
    }),
    null
  );
});

test('التحقق يرفض أكثر من الحد الأقصى للترجمات', () => {
  const snapshot = validSnapshot();
  const translations = Array.from({ length: MAX_REVISION_TRANSLATIONS + 1 }, (_, index) => ({
    ...snapshot.translations[0],
    id: `t-${index}`,
    lang: `l${index}`,
  }));

  assert.equal(
    parseContentRevisionSnapshot({ ...snapshot, translations }),
    null
  );
});

test('اختيار الترجمة يفضّل العربية ثم أول ترجمة', () => {
  const snapshot = validSnapshot();
  assert.equal(pickRevisionTranslation(snapshot)?.id, 't-ar');

  const withoutArabic = {
    ...snapshot,
    translations: snapshot.translations.filter((item) => item.lang !== 'ar'),
  };
  assert.equal(pickRevisionTranslation(withoutArabic)?.id, 't-en');
});

test('مدخلات الاستعادة لا تعيد حالة النشر', () => {
  const plan = buildRevisionRestoreInput(validSnapshot());

  assert.equal(plan.translation?.id, 't-ar');
  assert.equal(plan.translation?.title, 'حكم الصلاة');
  assert.equal(plan.translation?.body, '<p>نص</p>');
  assert.equal('status' in plan.content, false);
  assert.equal(plan.content.is_sensitive, true);
});

test('مدخلات الاستعادة تحوّل الحقول الاختيارية الفارغة إلى نص فارغ', () => {
  const snapshot = validSnapshot();
  const plan = buildRevisionRestoreInput({
    ...snapshot,
    translations: [snapshot.translations[1]],
  });

  assert.equal(plan.translation?.id, 't-en');
  assert.equal(plan.translation?.summary, '');
  assert.equal(plan.translation?.body, '');
  assert.equal(plan.translation?.meta_title, '');
  assert.equal(plan.translation?.meta_description, '');
});

test('حد النسخ المحفوظة لكل مادة ثابت', () => {
  assert.equal(MAX_CONTENT_REVISIONS, 50);
});
