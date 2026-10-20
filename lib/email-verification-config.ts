// lib/email-verification-config.ts
// منطق نقي لتفعيل البريد: تطبيع الإعداد وبناء الرابط والتحقق من شكل الرمز.
// بلا استيرادات وبلا أسرار — آمن للاستخدام في الخادم والمتصفح معًا.

/** مفتاح الإعداد في `site_settings` — يُحرَّر من لوحة التحكم. */
export const EMAIL_VERIFICATION_SETTING_KEY = 'emailVerification';

/** صلاحية رابط التفعيل: ٢٤ ساعة. */
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

/** أقل مدة بين طلبين لإعادة الإرسال. */
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

/** أقصى طول مقبول للرمز القادم من الرابط. */
export const EMAIL_VERIFICATION_MAX_TOKEN_LENGTH = 200;

export type EmailVerificationConfig = {
  /** إرسال رابط تفعيل للحسابات الجديدة. */
  enabled: boolean;
};

export const DEFAULT_EMAIL_VERIFICATION_CONFIG: EmailVerificationConfig = {
  enabled: true,
};

/**
 * يطبّع قيمة الإعداد القادمة من قاعدة البيانات.
 * أي شكل غير متوقع يعود إلى الافتراضي بدل تعطيل الميزة صمتًا.
 */
export function normalizeEmailVerificationConfig(value: unknown): EmailVerificationConfig {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof source.enabled === 'boolean'
        ? source.enabled
        : DEFAULT_EMAIL_VERIFICATION_CONFIG.enabled,
  };
}

/** هل مزوّد البريد مضبوط على الخادم؟ لا نرسل ولا نُنشئ رموزًا بدونه. */
export function emailProviderConfigured(env: unknown): boolean {
  const source =
    env && typeof env === 'object' ? (env as Record<string, unknown>) : {};

  return Boolean(
    String(source.RESEND_API_KEY ?? '').trim() &&
      String(source.EMAIL_FROM ?? '').trim()
  );
}

/** شكل الرمز المتوقع: base64url بطول ٢٠–٢٠٠ حرفًا. */
export function isPlausibleVerificationToken(token: unknown): token is string {
  if (typeof token !== 'string') return false;
  if (token.length < 20 || token.length > EMAIL_VERIFICATION_MAX_TOKEN_LENGTH) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(token);
}

/** يبني رابط التفعيل من النطاق القانوني (لا من ترويسة Host). */
export function buildEmailVerificationUrl(
  origin: string,
  lang: 'ar' | 'en',
  token: string
): string {
  const base = String(origin ?? '').trim().replace(/\/+$/, '');
  const safeLang = lang === 'en' ? 'en' : 'ar';
  return `${base}/${safeLang}/verify-email?token=${encodeURIComponent(token)}`;
}
