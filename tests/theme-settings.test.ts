import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME_SETTINGS, normalizeThemeSettings, themeCssVariables } from '../lib/theme-settings.ts';

test('theme settings preserve valid colors and reject malformed values', () => {
  assert.deepEqual(normalizeThemeSettings(null), DEFAULT_THEME_SETTINGS);
  assert.deepEqual(normalizeThemeSettings({ primaryColor: '#ABCDEF', goldColor: '#123456' }), {
    primaryColor: '#abcdef',
    goldColor: '#123456',
  });
  assert.deepEqual(normalizeThemeSettings({ primaryColor: 'red', goldColor: '#123' }), DEFAULT_THEME_SETTINGS);
});

test('theme variables expose a complete shared primary and gold palette', () => {
  const variables = themeCssVariables({ primaryColor: '#123456', goldColor: '#abcdef' });
  for (const family of ['primary', 'gold']) {
    for (const shade of ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']) {
      assert.match(variables[`--color-${family}-${shade}`], /^#[0-9a-f]{6}$/);
    }
  }
  assert.equal(variables['--color-primary-600'], '#123456');
  assert.equal(variables['--color-gold-600'], '#abcdef');
});
