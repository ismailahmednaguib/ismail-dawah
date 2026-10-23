export type ThemeSettings = {
  primaryColor: string;
  goldColor: string;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  primaryColor: '#0e7490',
  goldColor: '#d4af37',
};

function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim());
}

function hexToRgb(value: string): [number, number, number] {
  const clean = value.slice(1);
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return '#' + [red, green, blue]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('');
}

function mix(value: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(value);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(
    r1 + (r2 - r1) * amount,
    g1 + (g2 - g1) * amount,
    b1 + (b2 - b1) * amount,
  );
}

export function normalizeThemeSettings(value: unknown): ThemeSettings {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    primaryColor: isHex(source.primaryColor) ? source.primaryColor.trim().toLowerCase() : DEFAULT_THEME_SETTINGS.primaryColor,
    goldColor: isHex(source.goldColor) ? source.goldColor.trim().toLowerCase() : DEFAULT_THEME_SETTINGS.goldColor,
  };
}

function palette(base: string): Record<string, string> {
  return {
    '50': mix(base, '#ffffff', 0.95),
    '100': mix(base, '#ffffff', 0.87),
    '200': mix(base, '#ffffff', 0.72),
    '300': mix(base, '#ffffff', 0.52),
    '400': mix(base, '#ffffff', 0.28),
    '500': mix(base, '#ffffff', 0.08),
    '600': base,
    '700': mix(base, '#000000', 0.18),
    '800': mix(base, '#000000', 0.32),
    '900': mix(base, '#000000', 0.48),
    '950': mix(base, '#000000', 0.66),
  };
}

export function themeCssVariables(value: unknown): Record<string, string> {
  const settings = normalizeThemeSettings(value);
  const primary = palette(settings.primaryColor);
  const gold = palette(settings.goldColor);
  const variables: Record<string, string> = {};

  for (const [shade, color] of Object.entries(primary)) variables['--color-primary-' + shade] = color;
  for (const [shade, color] of Object.entries(gold)) variables['--color-gold-' + shade] = color;

  return variables;
}
