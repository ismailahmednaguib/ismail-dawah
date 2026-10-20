// lib/password-change-config.ts
// منطق نقي لتفعيل تغيير كلمة المرور من صفحة الحساب.
// بلا استيرادات — آمن للمتصفح والخادم.

/** مفتاح الإعداد في `site_settings` — يُحرَّر من لوحة التحكم. */
export const PASSWORD_CHANGE_SETTING_KEY = 'passwordChange';

export type PasswordChangeConfig = {
  enabled: boolean;
};

export const DEFAULT_PASSWORD_CHANGE_CONFIG: PasswordChangeConfig = {
  enabled: true,
};

/** يطبّع قيمة الإعداد القادمة من قاعدة البيانات. */
export function normalizePasswordChangeConfig(value: unknown): PasswordChangeConfig {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof source.enabled === 'boolean'
        ? source.enabled
        : DEFAULT_PASSWORD_CHANGE_CONFIG.enabled,
  };
}
