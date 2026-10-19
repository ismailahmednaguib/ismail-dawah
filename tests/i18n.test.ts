import test from 'node:test';
import assert from 'node:assert/strict';

import { preferredLanguageFromHeader } from '../lib/i18n/config.ts';

test('لغة الجذر: الإنجليزية أولًا عند تفضيلها', () => {
  assert.equal(preferredLanguageFromHeader('en-US,en;q=0.9'), 'en');
  assert.equal(preferredLanguageFromHeader('en'), 'en');
});

test('لغة الجذر: العربية عند تفضيلها أو غياب الترويسة', () => {
  assert.equal(preferredLanguageFromHeader('ar-EG,ar;q=0.9,en;q=0.8'), 'ar');
  assert.equal(preferredLanguageFromHeader(null), 'ar');
  assert.equal(preferredLanguageFromHeader(''), 'ar');
  assert.equal(preferredLanguageFromHeader('*'), 'ar');
});

test('لغة الجذر: تراعي أولوية q لا ترتيب الكتابة', () => {
  assert.equal(preferredLanguageFromHeader('en;q=0.4, ar;q=0.9'), 'ar');
  assert.equal(preferredLanguageFromHeader('ar;q=0.2, en;q=0.8'), 'en');
});

test('لغة الجذر: تتجاوز اللغات غير المدعومة', () => {
  assert.equal(preferredLanguageFromHeader('fr-FR,fr;q=0.9,en;q=0.6'), 'en');
  assert.equal(preferredLanguageFromHeader('de,fr;q=0.8'), 'ar');
});
