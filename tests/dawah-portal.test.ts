import test from 'node:test';
import assert from 'node:assert/strict';

import { DAWAH_PORTAL_PAGES, getDawahPortalPage, getDawahPortalSlugs } from '../lib/dawah-portal.ts';

test('dawah portal contains the complete bilingual page set', () => {
  const slugs = getDawahPortalSlugs();

  assert.equal(slugs.length, 12);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.deepEqual(slugs, DAWAH_PORTAL_PAGES.map((page) => page.slug));

  for (const page of DAWAH_PORTAL_PAGES) {
    assert.ok(page.title.ar.trim());
    assert.ok(page.title.en.trim());
    assert.ok(page.summary.ar.trim());
    assert.ok(page.summary.en.trim());
    assert.ok(page.sections.ar.length >= 2);
    assert.ok(page.sections.en.length >= 2);
    assert.ok(page.references.ar.length >= 1);
    assert.ok(page.references.en.length >= 1);
    for (const relatedSlug of page.related) {
      assert.ok(slugs.includes(relatedSlug), `${page.slug} references missing page ${relatedSlug}`);
    }
  }
});

test('dawah portal lookup returns the requested language content', () => {
  const page = getDawahPortalPage('what-is-islam');

  assert.equal(page?.title.ar, 'ما الإسلام؟');
  assert.equal(page?.title.en, 'What Is Islam?');
  assert.ok(page?.references.ar.some((reference) => reference.href?.includes('/quran/')));
});
