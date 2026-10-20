// lib/email-provider-status.ts
// وصف حالة مزوّد البريد للوحة التحكم — بلا مفاتيح أو كلمات مرور.

export type EmailProviderKind = "smtp" | "resend" | "none";

export type EmailProviderStatus = {
  kind: EmailProviderKind;
  configured: boolean;
  from: string | null;
  smtpHost: string | null;
};

export function getEmailProviderStatus(env: unknown): EmailProviderStatus {
  const source =
    env && typeof env === "object" ? (env as Record<string, unknown>) : {};

  const emailFrom =
    String(source.EMAIL_FROM ?? "").trim() ||
    String(source.FROM_EMAIL ?? "").trim();

  const smtpHost = String(source.SMTP_HOST ?? "").trim();
  const smtpUser = String(source.SMTP_USER ?? "").trim();
  const smtpPass = String(source.SMTP_PASS ?? "").trim();
  const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

  const resendConfigured = Boolean(
    String(source.RESEND_API_KEY ?? "").trim() && emailFrom
  );

  const kind: EmailProviderKind = smtpConfigured
    ? "smtp"
    : resendConfigured
      ? "resend"
      : "none";

  return {
    kind,
    configured: kind !== "none",
    from: emailFrom || (smtpConfigured ? smtpUser : null),
    smtpHost: smtpConfigured ? smtpHost : null,
  };
}
