import assert from 'node:assert/strict';
import test from 'node:test';

import { NAV_TREE, applyNavigationConfig } from '../lib/navigation.ts';

test('footer legal links remain editable through the navigation tree', () => {
  const tree = applyNavigationConfig({
    contact: { en: 'Contact the team', href: '/contact-team' },
    terms: { visible: false },
  }, NAV_TREE);
  const about = tree.find((node) => node.key === 'about');
  const contact = about?.children?.find((node) => node.key === 'contact');
  const terms = about?.children?.find((node) => node.key === 'terms');

  assert.equal(contact?.en, 'Contact the team');
  assert.equal(contact?.href, '/contact-team');
  assert.equal(terms, undefined);
});
