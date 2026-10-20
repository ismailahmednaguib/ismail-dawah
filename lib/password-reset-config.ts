// lib/password-reset-config.ts
// منطق نقي لاستعادة كلمة المرور: الإعداد وبناء الرابط والتحقق من شكل الرمز.
// بلا استيرادات وبلا أسرار — آمن للمتصفح والخادم.

/** مفتاح الإعداد في `site_settings` — يُحرَّر من لوحة التحكم. */
export const PASSWORD_RESET_SETTING_KEY = 'passwordReset';

/** صلاحية رابط الاستعادة: ساعة واحدة (مطابقة لنص البريد). */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

/** أقل مدة بين طلبين لنفس الحساب. */
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;

/** أقصى طول مقبول للرمز القادم من الرابط. */
export const PASSWORD_RESET_MAX_TOKEN_LENGTH = 200;

export type PasswordResetConfig = {
  enabled: boolean;
};

export const DEFAULT_PASSWORD_RESET_CONFIG: PasswordResetConfig = {
  enabled: true,
};

/** يطبّع قيمة الإعداد القادمة من قاعدة البيانات. */
export function normalizePasswordResetConfig(value: unknown): PasswordResetConfig {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof source.enabled === 'boolean'
        ? source.enabled
        : DEFAULT_PASSWORD_RESET_CONFIG.enabled,
  };
}

/** شكل الرمز المتوقع: base64url بطول ٢٠–٢٠٠ حرفًا. */
export function isPlausiblePasswordResetToken(token: unknown): token is string {
  if (typeof token !== 'string') return false;
  if (token.length < 20 || token.length > PASSWORD_RESET_MAX_TOKEN_LENGTH) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(token);
}

/** يبني رابط الاستعادة من النطاق القانوني (لا من ترويسة Host). */
export function buildPasswordResetUrl(
  origin: string,
  lang: 'ar' | 'en',
  token: string
): string {
  const base = String(origin ?? '').trim().replace(/\/+$/, '');
  const safeLang = lang === 'en' ? 'en' : 'ar';
  return `${base}/${safeLang}/reset-password?token=${encodeURIComponent(token)}`;
}
