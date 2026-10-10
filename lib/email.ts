// lib/email.ts
// نظام إرسال الإيميلات — Server-only، آمن، مع تحقق وتهريب للمدخلات.

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SITE_URL } from "./site";

// ============================================================
// Types
// ============================================================

export type EmailType =
  | "verification"
  | "password_reset"
  | "newsletter"
  | "contact"
  | "welcome"
  | "admin_notification";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  type: EmailType;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
  unsubscribeUrl?: string;
  headers?: Record<string, string>;
}

export interface EmailResult {
  ok: boolean;
  success: boolean;
  message?: string;
  error?: string;
  id?: string;
}

export interface SubscribeResult {
  ok: boolean;
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================
// Constants
// ============================================================

const FALLBACK_SITE_URL = "https://ismailahmednaguib.vercel.app";

const MAX_SUBJECT_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SOURCE_LENGTH = 120;
const MAX_FROM_NAME_LENGTH = 80;
const MAX_HEADER_VALUE_LENGTH = 500;

const RESEND_TIMEOUT_MS = 10_000;
const DB_TIMEOUT_MS = 5_000;
const LOG_TIMEOUT_MS = 3_000;

// ============================================================
// General helpers
// ============================================================

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeSiteUrl(raw: string): string {
  const value = String(raw || "").trim();

  if (!value) {
    return FALLBACK_SITE_URL;
  }

  try {
    const url = new URL(value);
    const pathname =
      url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");

    return `${url.origin}${pathname}`;
  } catch {
    return value.replace(/\/+$/, "") || FALLBACK_SITE_URL;
  }
}

function getSiteUrl(): string {
  return normalizeSiteUrl(String(SITE_URL || FALLBACK_SITE_URL));
}

function sanitizeControlChars(value: unknown, preserveNewline = false): string {
  const str = String(value ?? "");

  if (preserveNewline) {
    // يحافظ على \n و \t، ويزيل باقي ضوابط Unicode/ASCII الخطرة
    return str.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
      " "
    );
  }

  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
}

function sanitizeHeaderValue(value: unknown): string {
  return sanitizeControlChars(value)
    .replace(/\r?\n/g, " ")
    .trim()
    .slice(0, MAX_HEADER_VALUE_LENGTH);
}

function sanitizeDisplayName(value: unknown): string {
  return sanitizeControlChars(value)
    .replace(/[<>"]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FROM_NAME_LENGTH);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(value: unknown): string {
  return escapeHtml(sanitizeControlChars(value, true)).replace(
    /\n/g,
    "<br />"
  );
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isValidEmail(value: unknown): boolean {
  const email = normalizeEmail(value);

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeLang(value: unknown): "ar" | "en" {
  const lang = String(value ?? "")
    .trim()
    .toLowerCase();

  if (lang === "en" || lang.startsWith("en-")) {
    return "en";
  }

  return "ar";
}

function isLangToken(value: string): boolean {
  const lower = value.trim().toLowerCase();

  return (
    lower === "ar" ||
    lower === "en" ||
    lower.startsWith("ar-") ||
    lower.startsWith("en-")
  );
}

function safeUrl(value: unknown, allowRelative = false): string | null {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw) {
    return null;
  }

  if (/^(javascript|data|blob|file|vbscript):/i.test(raw)) {
    return null;
  }

  if (raw.startsWith("//")) {
    return null;
  }

  if (allowRelative && raw.startsWith("/")) {
    return raw;
  }

  try {
    const url = new URL(raw, getSiteUrl());

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function htmlToText(html: string): string {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * تنظيف أساسي لمحتوى HTML القادم من الأدمن.
 *
 * ⚠️ في الإنتاج، الأفضل استخدام مكتبة مثل sanitize-html قبل استدعاء هذا الملف.
 * هذه الدالة خط دفاع إضافي وليست بديلًا كاملًا.
 */
function sanitizeEmailHtml(html: string): string {
  return String(html ?? "")
    .replace(
      /<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[\s\S]*?<\/\s*\1\s*>/gi,
      ""
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*>/gi,
      ""
    )
    .replace(/\son\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(
      /(?:href|src|xlink:href)\s*=\s*(["'])\s*(?:javascript|data|vbscript):[^"']*\1/gi,
      'href="#"'
    )
    .replace(
      /(?:href|src|xlink:href)\s*=\s*(?:javascript|data|vbscript):[^\s>]+/gi,
      'href="#"'
    );
}

function isMissingTableError(error: unknown): boolean {
  const message = String((error as any)?.message || "");

  return (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message) ||
    /schema/i.test(message)
  );
}

function isMissingColumnError(error: unknown, column: string): boolean {
  const message = String((error as any)?.message || "");

  return (
    new RegExp(column, "i").test(message) &&
    (/column.*does not exist/i.test(message) ||
      /Could not find the column/i.test(message) ||
      /schema.*does not exist/i.test(message))
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

// ============================================================
// Env helpers
// ============================================================

function getFromEmail(): string {
  const env = process.env.FROM_EMAIL?.trim();

  if (env && isValidEmail(env)) {
    return normalizeEmail(env);
  }

  try {
    const hostname = new URL(getSiteUrl()).hostname;
    const generated = `no-reply@${hostname}`;

    if (isValidEmail(generated)) {
      return generated;
    }
  } catch {
    // ignore
  }

  return "no-reply@ismailahmednaguib.vercel.app";
}

function getFromName(): string {
  return (
    sanitizeDisplayName(process.env.FROM_NAME?.trim()) || "إسماعيل أحمد نجيب"
  );
}

function getAdminEmail(): string | null {
  const env = process.env.ADMIN_EMAIL?.trim();

  if (env && isValidEmail(env)) {
    return normalizeEmail(env);
  }

  return null;
}

function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// ============================================================
// Supabase client
// ============================================================

let emailAdminClient: SupabaseClient | null | undefined;

function getEmailAdminClient(): SupabaseClient | null {
  if (emailAdminClient !== undefined) {
    return emailAdminClient;
  }

  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";

  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";

  if (!url || !serviceKey) {
    emailAdminClient = null;
    return null;
  }

  emailAdminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return emailAdminClient;
}

// ============================================================
// Resend client
// ============================================================

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const key = getResendApiKey();

  if (!key) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(key);
  }

  return resendClient;
}

// ============================================================
// Email logging
// ============================================================

async function logEmail(
  options: EmailOptions,
  status: "sent" | "failed" | "simulated",
  error?: string,
  emailId?: string
): Promise<void> {
  const client = getEmailAdminClient();

  if (!client) {
    return;
  }

  const recipients = toArray(options.to);
  const validRecipients = recipients
    .map(normalizeEmail)
    .filter(isValidEmail);

  const toEmail =
    validRecipients.join(", ").slice(0, 500) ||
    sanitizeControlChars(recipients.join(", ")).slice(0, 500);

  const recipientCount = recipients.length;
  const subject = sanitizeControlChars(options.subject).slice(0, 300);
  const safeError = error ? sanitizeControlChars(error).slice(0, 1000) : null;
  const sentAt = new Date().toISOString();

  const attempts: Array<Record<string, unknown>> = [
    {
      to_email: toEmail,
      recipient_count: recipientCount,
      subject,
      type: options.type,
      status,
      error: safeError,
      resend_id: emailId || null,
      sent_at: sentAt,
    },
    {
      to_email: toEmail,
      subject,
      type: options.type,
      status,
      error: safeError,
      resend_id: emailId || null,
      sent_at: sentAt,
    },
    {
      to_email: toEmail,
      type: options.type,
      status,
      sent_at: sentAt,
    },
    {
      to_email: toEmail,
      type: options.type,
      status,
    },
  ];

  for (const payload of attempts) {
    try {
      const result = (await withTimeout(
        client.from("email_logs").insert(payload) as unknown as Promise<{
          error: any;
        }>,
        LOG_TIMEOUT_MS,
        "email_log_insert"
      )) as any;

      if (!result.error) {
        return;
      }

      if (isMissingTableError(result.error)) {
        return;
      }

      if (
        isMissingColumnError(result.error, "recipient_count") ||
        isMissingColumnError(result.error, "subject") ||
        isMissingColumnError(result.error, "error") ||
        isMissingColumnError(result.error, "resend_id") ||
        isMissingColumnError(result.error, "sent_at")
      ) {
        continue;
      }

      console.warn("[Email] Failed to log email:", result.error);
      return;
    } catch (err) {
      console.warn("[Email] Unexpected log email error:", err);
      return;
    }
  }
}

// ============================================================
// Core sender
// ============================================================

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const recipients = toArray(options.to);

  if (recipients.length === 0) {
    return {
      ok: false,
      success: false,
      error: "no_recipients",
    };
  }

  const validRecipients = recipients
    .map(normalizeEmail)
    .filter(isValidEmail);

  if (validRecipients.length === 0) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const validCc = toArray(options.cc)
    .map(normalizeEmail)
    .filter(isValidEmail);

  const validBcc = toArray(options.bcc)
    .map(normalizeEmail)
    .filter(isValidEmail);

  const subject = sanitizeControlChars(options.subject)
    .trim()
    .slice(0, MAX_SUBJECT_LENGTH);

  const html = String(options.html ?? "").trim();

  if (!subject || !html) {
    return {
      ok: false,
      success: false,
      error: "missing_subject_or_html",
    };
  }

  const resend = getResendClient();

  if (!resend) {
    if (isProduction()) {
      console.error("[Email] RESEND_API_KEY is not configured in production.");

      await logEmail(options, "failed", "email_provider_not_configured");

      return {
        ok: false,
        success: false,
        error: "email_provider_not_configured",
      };
    }

    console.log("📧 [Email Simulation]", {
      to: validRecipients,
      subject,
      type: options.type,
    });

    await logEmail(options, "simulated");

    return {
      ok: true,
      success: true,
      id: `simulated-${Date.now()}`,
      message: "Email simulated in development.",
    };
  }

  try {
    const unsubscribeUrl = options.unsubscribeUrl
      ? safeUrl(options.unsubscribeUrl)
      : null;

    const fromName = getFromName();
    const fromEmail = getFromEmail();

    const payload: any = {
      from: `${fromName} <${fromEmail}>`,
      to: validRecipients.length === 1 ? validRecipients[0] : validRecipients,
      subject,
      html,
      text: options.text
        ? sanitizeControlChars(options.text, true)
        : htmlToText(html),
    };

    if (options.replyTo && isValidEmail(options.replyTo)) {
      payload.replyTo = normalizeEmail(options.replyTo);
    }

    if (validCc.length > 0) {
      payload.cc = validCc.length === 1 ? validCc[0] : validCc;
    }

    if (validBcc.length > 0) {
      payload.bcc = validBcc.length === 1 ? validBcc[0] : validBcc;
    }

    if (options.tags && Array.isArray(options.tags)) {
      payload.tags = options.tags
        .filter(
          (tag) =>
            tag &&
            typeof tag.name === "string" &&
            typeof tag.value === "string"
        )
        .map((tag) => ({
          name: sanitizeControlChars(tag.name).slice(0, 100),
          value: sanitizeControlChars(tag.value).slice(0, 200),
        }))
        .filter((tag) => tag.name)
        .slice(0, 10);
    }

    const headers: Record<string, string> = {};

    if (options.headers && typeof options.headers === "object") {
      for (const [key, value] of Object.entries(options.headers)) {
        const headerName = String(key)
          .replace(/[^\x21-\x7E]/g, "")
          .replace(/[:\s]/g, "")
          .trim();

        if (!headerName) {
          continue;
        }

        // منع تجاوز رؤوس حساسة قد تتحكم بها Resend
        if (/^(content-type|from|to|subject)$/i.test(headerName)) {
          continue;
        }

        const headerValue = sanitizeHeaderValue(value);

        if (!headerValue) {
          continue;
        }

        headers[headerName] = headerValue;
      }
    }

    if (unsubscribeUrl) {
      headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    if (Object.keys(headers).length > 0) {
      payload.headers = headers;
    }

    const result = (await withTimeout(
      resend.emails.send(payload) as unknown as Promise<{
        data?: { id?: string };
        error?: { message?: string };
      }>,
      RESEND_TIMEOUT_MS,
      "resend_send"
    )) as any;

    if (result?.error) {
      const errorMessage = String(result.error.message || "resend_error");

      console.error("[Email] Resend error:", errorMessage);

      await logEmail(
        { ...options, to: validRecipients },
        "failed",
        errorMessage
      );

      return {
        ok: false,
        success: false,
        error: "email_send_failed",
      };
    }

    await logEmail(
      { ...options, to: validRecipients },
      "sent",
      undefined,
      result?.data?.id
    );

    return {
      ok: true,
      success: true,
      id: result?.data?.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "unknown_email_error";

    console.error("[Email] Unexpected send error:", errorMessage);

    await logEmail(
      { ...options, to: validRecipients },
      "failed",
      errorMessage
    );

    return {
      ok: false,
      success: false,
      error: "email_send_failed",
    };
  }
}

// ============================================================
// Email layout
// ============================================================

function emailLayout(
  content: string,
  direction: "rtl" | "ltr" = "rtl",
  extraFooter: string = ""
): string {
  const siteUrl = getSiteUrl();
  const lang = direction === "rtl" ? "ar" : "en";
  const year = new Date().getFullYear();
  const fromName = getFromName();

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fromName)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #1e293b;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(8, 51, 68, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
      padding: 30px 20px;
      text-align: center;
    }

    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }

    .header p {
      color: #a5f3fc;
      margin: 10px 0 0;
      font-size: 14px;
    }

    .content {
      padding: 40px 30px;
      line-height: 1.8;
    }

    .footer {
      background-color: #0f172a;
      padding: 20px;
      text-align: center;
    }

    .footer p {
      color: #94a3b8;
      margin: 5px 0;
      font-size: 12px;
    }

    .footer a {
      color: #67e8f9;
      text-decoration: none;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
    }

    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 20px 0;
    }

    .info-box {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      border-inline-start: 4px solid #06b6d4;
    }

    .warning-box {
      background-color: #fffbeb;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      border-inline-start: 4px solid #f59e0b;
    }

    a {
      color: #0891b2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(fromName)}</h1>
      <p>${
        direction === "rtl"
          ? "منصة دعوية شاملة"
          : "Complete Dawah Platform"
      }</p>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p>
        © ${year} ${escapeHtml(fromName)} — ${
        direction === "rtl" ? "جميع الحقوق محفوظة" : "All rights reserved"
      }
      </p>
      <p>
        <a href="${escapeHtml(siteUrl)}">${
        direction === "rtl" ? "الموقع" : "Website"
      }</a>
        •
        <a href="${escapeHtml(
          `${siteUrl}/${direction === "rtl" ? "ar" : "en"}/about`
        )}">${direction === "rtl" ? "من نحن" : "About"}</a>
        •
        <a href="${escapeHtml(
          `${siteUrl}/${direction === "rtl" ? "ar" : "en"}/contact`
        )}">${direction === "rtl" ? "تواصل معنا" : "Contact"}</a>
      </p>
      ${extraFooter}
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// Templates
// ============================================================

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  lang: "ar" | "en" = "ar"
): Promise<EmailResult> {
  const email = normalizeEmail(to);

  if (!isValidEmail(email)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const safeVerificationUrl = safeUrl(verificationUrl);

  if (!safeVerificationUrl) {
    return {
      ok: false,
      success: false,
      error: "invalid_verification_url",
    };
  }

  const isRTL = lang === "ar";
  const urlHtml = escapeHtml(safeVerificationUrl);
  const fromName = getFromName();

  const content = isRTL
    ? `
      <h2 style="color:#1e293b;margin-top:0;">مرحبًا بك! 👋</h2>
      <p style="color:#475569;">شكرًا لتسجيلك في منصة <strong>${escapeHtml(
        fromName
      )}</strong>.</p>
      <p style="color:#475569;">لتفعيل حسابك، اضغط على الزر بالأسفل:</p>

      <div style="text-align:center;">
        <a href="${urlHtml}" class="btn">تفعيل الحساب</a>
      </div>

      <div class="info-box">
        <p style="margin:0;color:#0369a1;font-size:14px;">
          💡 لو الزر لا يعمل، انسخ هذا الرابط:<br>
          <a href="${urlHtml}" style="word-break:break-all;color:#0891b2;">${urlHtml}</a>
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;">هذا الرابط صالح لمدة 24 ساعة فقط.</p>
    `
    : `
      <h2 style="color:#1e293b;margin-top:0;">Welcome! 👋</h2>
      <p style="color:#475569;">Thank you for signing up at <strong>${escapeHtml(
        fromName
      )}</strong>.</p>
      <p style="color:#475569;">To activate your account, click the button below:</p>

      <div style="text-align:center;">
        <a href="${urlHtml}" class="btn">Activate Account</a>
      </div>

      <div class="info-box">
        <p style="margin:0;color:#0369a1;font-size:14px;">
          💡 If the button doesn't work, copy this link:<br>
          <a href="${urlHtml}" style="word-break:break-all;color:#0891b2;">${urlHtml}</a>
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;">This link is valid for 24 hours only.</p>
    `;

  return sendEmail({
    to: email,
    subject: isRTL
      ? `تفعيل حسابك في ${fromName}`
      : `Activate your account at ${fromName}`,
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "verification",
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  lang: "ar" | "en" = "ar"
): Promise<EmailResult> {
  const email = normalizeEmail(to);

  if (!isValidEmail(email)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const safeResetUrl = safeUrl(resetUrl);

  if (!safeResetUrl) {
    return {
      ok: false,
      success: false,
      error: "invalid_reset_url",
    };
  }

  const isRTL = lang === "ar";
  const urlHtml = escapeHtml(safeResetUrl);

  const content = isRTL
    ? `
      <h2 style="color:#1e293b;margin-top:0;">إعادة تعيين كلمة المرور 🔐</h2>
      <p style="color:#475569;">وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بك.</p>

      <div style="text-align:center;">
        <a href="${urlHtml}" class="btn">إعادة تعيين كلمة المرور</a>
      </div>

      <div class="warning-box">
        <p style="margin:0;color:#92400e;font-size:14px;">
          ⚠️ لو لم تطلب هذا، تجاهل هذا الإيميل.
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
    `
    : `
      <h2 style="color:#1e293b;margin-top:0;">Reset Your Password 🔐</h2>
      <p style="color:#475569;">We received a request to reset your password.</p>

      <div style="text-align:center;">
        <a href="${urlHtml}" class="btn">Reset Password</a>
      </div>

      <div class="warning-box">
        <p style="margin:0;color:#92400e;font-size:14px;">
          ⚠️ If you didn't request this, ignore this email.
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;">This link is valid for 1 hour only.</p>
    `;

  return sendEmail({
    to: email,
    subject: isRTL ? "إعادة تعيين كلمة المرور" : "Reset Your Password",
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "password_reset",
  });
}

export async function sendWelcomeEmail(
  to: string,
  fullName: string,
  lang: "ar" | "en" = "ar"
): Promise<EmailResult> {
  const email = normalizeEmail(to);

  if (!isValidEmail(email)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const isRTL = lang === "ar";
  const fromName = getFromName();

  const safeName = escapeHtml(
    sanitizeControlChars(fullName)
      .trim()
      .slice(0, MAX_NAME_LENGTH) || (isRTL ? "صديقنا الكريم" : "Dear friend")
  );

  const siteUrl = escapeHtml(getSiteUrl());

  const content = isRTL
    ? `
      <h2 style="color:#1e293b;margin-top:0;">أهلًا بك يا ${safeName}! 🎉</h2>
      <p style="color:#475569;">تم تفعيل حسابك بنجاح في منصة <strong>${escapeHtml(
        fromName
      )}</strong>.</p>

      <div class="divider"></div>

      <h3 style="color:#0e7490;">ماذا يمكنك أن تفعل الآن؟</h3>
      <ul style="color:#475569;line-height:2;">
        <li>📖 قراءة القرآن الكريم والاستماع إليه</li>
        <li>🤲 الوصول إلى الأذكار والأدعية</li>
        <li>🕌 معرفة مواقيت الصلاة حسب موقعك</li>
        <li>⚖️ الاطلاع على الفتاوى الشرعية</li>
        <li>🔖 حفظ المحتوى المفضل لديك</li>
      </ul>

      <div style="text-align:center;">
        <a href="${siteUrl}" class="btn">ابدأ الآن</a>
      </div>
    `
    : `
      <h2 style="color:#1e293b;margin-top:0;">Welcome, ${safeName}! 🎉</h2>
      <p style="color:#475569;">Your account has been successfully activated at <strong>${escapeHtml(
        fromName
      )}</strong>.</p>

      <div class="divider"></div>

      <h3 style="color:#0e7490;">What can you do now?</h3>
      <ul style="color:#475569;line-height:2;">
        <li>📖 Read and listen to the Holy Quran</li>
        <li>🤲 Access Adhkar and Duas</li>
        <li>🕌 Get prayer times based on your location</li>
        <li>⚖️ Browse Islamic Fatwas</li>
        <li>🔖 Bookmark your favorite content</li>
      </ul>

      <div style="text-align:center;">
        <a href="${siteUrl}" class="btn">Get Started</a>
      </div>
    `;

  return sendEmail({
    to: email,
    subject: isRTL
      ? `أهلًا بك في ${fromName}!`
      : `Welcome to ${fromName}!`,
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "welcome",
  });
}

export async function sendNewsletterEmail(
  to: string,
  subject: string,
  contentHtml: string,
  lang: "ar" | "en" = "ar",
  unsubscribeUrl?: string
): Promise<EmailResult> {
  const email = normalizeEmail(to);

  if (!isValidEmail(email)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const isRTL = lang === "ar";

  const safeSubject = sanitizeControlChars(subject)
    .trim()
    .slice(0, MAX_SUBJECT_LENGTH);

  const safeContent = sanitizeEmailHtml(contentHtml);

  const safeUnsubscribeUrl = unsubscribeUrl
    ? safeUrl(unsubscribeUrl)
    : null;

  const extraFooter = safeUnsubscribeUrl
    ? `<p style="margin-top:10px;">
        <a href="${escapeHtml(safeUnsubscribeUrl)}">${
        isRTL ? "إلغاء الاشتراك" : "Unsubscribe"
      }</a>
      </p>`
    : "";

  return sendEmail({
    to: email,
    subject: safeSubject,
    html: emailLayout(safeContent, isRTL ? "rtl" : "ltr", extraFooter),
    type: "newsletter",
    unsubscribeUrl: safeUnsubscribeUrl || undefined,
  });
}

export async function sendContactConfirmationEmail(
  to: string,
  name: string,
  lang: "ar" | "en" = "ar"
): Promise<EmailResult> {
  const email = normalizeEmail(to);

  if (!isValidEmail(email)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const isRTL = lang === "ar";

  const safeName = escapeHtml(
    sanitizeControlChars(name)
      .trim()
      .slice(0, MAX_NAME_LENGTH) || (isRTL ? "زائرنا الكريم" : "Valued visitor")
  );

  const content = isRTL
    ? `
      <h2 style="color:#1e293b;margin-top:0;">تم استلام رسالتك ✅</h2>
      <p style="color:#475569;">شكرًا لك يا <strong>${safeName}</strong> على تواصلك معنا.</p>
      <p style="color:#475569;">سنقوم بالرد على رسالتك في أقرب وقت ممكن، عادةً خلال 24-48 ساعة.</p>
    `
    : `
      <h2 style="color:#1e293b;margin-top:0;">Message Received ✅</h2>
      <p style="color:#475569;">Thank you, <strong>${safeName}</strong>, for contacting us.</p>
      <p style="color:#475569;">We will reply to your message as soon as possible, usually within 24-48 hours.</p>
    `;

  return sendEmail({
    to: email,
    subject: isRTL
      ? "تم استلام رسالتك"
      : "Your Message Has Been Received",
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "contact",
  });
}

export async function sendAdminNotificationEmail(
  subject: string,
  message: string,
  source: string,
  options?: {
    replyTo?: string;
    lang?: "ar" | "en";
  }
): Promise<EmailResult> {
  const adminEmail = getAdminEmail();

  if (!adminEmail) {
    console.warn("[Email] ADMIN_EMAIL is not configured or invalid.");

    return {
      ok: false,
      success: false,
      error: "admin_email_not_configured",
    };
  }

  const lang = options?.lang === "en" ? "en" : "ar";
  const isRTL = lang === "ar";

  const safeSubjectPlain =
    sanitizeControlChars(subject)
      .trim()
      .slice(0, MAX_SUBJECT_LENGTH) ||
    (isRTL ? "إشعار جديد" : "New notification");

  const safeSource =
    sanitizeControlChars(source)
      .trim()
      .slice(0, MAX_SOURCE_LENGTH) ||
    (isRTL ? "النظام" : "System");

  const safeMessage = nl2br(
    sanitizeControlChars(message, true)
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH) ||
    (isRTL ? "لا توجد رسالة." : "No message.")
  );

  const replyTo =
    options?.replyTo && isValidEmail(options.replyTo)
      ? normalizeEmail(options.replyTo)
      : undefined;

  const content = isRTL
    ? `
      <h2 style="color:#1e293b;margin-top:0;">🔔 إشعار جديد</h2>

      <div class="info-box">
        <p style="margin:0 0 10px;color:#475569;">
          <strong>المصدر:</strong> ${escapeHtml(safeSource)}
        </p>

        <p style="margin:0;color:#475569;">
          <strong>الرسالة:</strong>
        </p>

        <p style="margin:10px 0 0;color:#1e293b;line-height:1.8;">
          ${safeMessage}
        </p>
      </div>
    `
    : `
      <h2 style="color:#1e293b;margin-top:0;">🔔 New Notification</h2>

      <div class="info-box">
        <p style="margin:0 0 10px;color:#475569;">
          <strong>Source:</strong> ${escapeHtml(safeSource)}
        </p>

        <p style="margin:0;color:#475569;">
          <strong>Message:</strong>
        </p>

        <p style="margin:10px 0 0;color:#1e293b;line-height:1.8;">
          ${safeMessage}
        </p>
      </div>
    `;

  return sendEmail({
    to: adminEmail,
    subject: isRTL
      ? `[إشعار] ${safeSubjectPlain}`
      : `[Notification] ${safeSubjectPlain}`,
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "admin_notification",
    replyTo,
  });
}

// ============================================================
// Contact form helper
// ============================================================

export async function handleContactForm(
  name: string,
  email: string,
  subject: string,
  message: string,
  lang: "ar" | "en" = "ar"
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = normalizeEmail(email);

  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      error: "invalid_email",
    };
  }

  const cleanName = sanitizeControlChars(name)
    .trim()
    .slice(0, MAX_NAME_LENGTH);

  const cleanSubject = sanitizeControlChars(subject)
    .trim()
    .slice(0, MAX_SUBJECT_LENGTH);

  const cleanMessage = sanitizeControlChars(message, true)
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);

  if (!cleanName || !cleanSubject || !cleanMessage) {
    return {
      success: false,
      error: "missing_fields",
    };
  }

  const adminResult = await sendAdminNotificationEmail(
    `رسالة تواصل جديدة: ${cleanSubject}`,
    `من: ${cleanName} (${cleanEmail})\n\n${cleanMessage}`,
    "نموذج التواصل",
    {
      replyTo: cleanEmail,
      lang,
    }
  );

  const userResult = await sendContactConfirmationEmail(
    cleanEmail,
    cleanName,
    lang
  );

  if (!adminResult.ok) {
    console.error("[Email] Admin notification failed:", adminResult.error);
  }

  if (!userResult.ok) {
    console.error("[Email] Contact confirmation failed:", userResult.error);
  }

  // إذا فشل إشعار الأدمن، نعتبر العملية غير ناجحة من منظور النظام.
  // لا نكشف تفاصيل الفشل للمستخدم.
  if (!adminResult.ok) {
    return {
      success: false,
      error: "contact_failed",
    };
  }

  return {
    success: true,
  };
}

// ============================================================
// Newsletter subscription
// ============================================================

function parseSubscribeArgs(
  args: Array<string | null | undefined>
): { lang: "ar" | "en"; name?: string } {
  let lang: "ar" | "en" = "ar";
  let name: string | undefined;

  for (const raw of args) {
    if (typeof raw !== "string") {
      continue;
    }

    const trimmed = raw.trim();

    if (!trimmed) {
      continue;
    }

    if (isLangToken(trimmed)) {
      lang = normalizeLang(trimmed);
      continue;
    }

    if (!name) {
      const safeName = sanitizeControlChars(trimmed)
        .trim()
        .slice(0, MAX_NAME_LENGTH);

      if (safeName) {
        name = safeName;
      }
    }
  }

  return { lang, name };
}

export async function subscribeEmail(
  email: string,
  ...args: Array<string | null | undefined>
): Promise<SubscribeResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const { lang, name } = parseSubscribeArgs(args);

  const client = getEmailAdminClient();

  if (!client) {
    console.error("[Email] Supabase is not configured for newsletter.");

    return {
      ok: false,
      success: false,
      error: "db_not_configured",
    };
  }

  const now = new Date().toISOString();

  const basePayload: Record<string, unknown> = {
    email: normalizedEmail,
    lang,
    active: true,
    subscribed_at: now,
    updated_at: now,
    unsubscribed_at: null,
  };

  const attempts: Array<Record<string, unknown>> = [];

  if (name) {
    attempts.push({
      ...basePayload,
      name,
    });
  }

  attempts.push({ ...basePayload });

  attempts.push({
    email: normalizedEmail,
    lang,
    active: true,
    subscribed_at: now,
  });

  attempts.push({
    email: normalizedEmail,
    lang,
    active: true,
  });

  attempts.push({
    email: normalizedEmail,
    lang,
  });

  for (const payload of attempts) {
    try {
      const result = (await withTimeout(
        client
          .from("newsletter_subscribers")
          .upsert(payload, { onConflict: "email" }) as unknown as Promise<{
          error: any;
        }>,
        DB_TIMEOUT_MS,
        "newsletter_upsert"
      )) as any;

      if (!result.error) {
        return {
          ok: true,
          success: true,
          message:
            lang === "en"
              ? "You have been subscribed successfully."
              : "تم الاشتراك بنجاح.",
        };
      }

      if (isMissingTableError(result.error)) {
        console.error(
          "[Email] newsletter_subscribers table is missing. Run the required SQL."
        );

        return {
          ok: false,
          success: false,
          error: "newsletter_table_missing",
        };
      }

      if (
        isMissingColumnError(result.error, "name") ||
        isMissingColumnError(result.error, "updated_at") ||
        isMissingColumnError(result.error, "unsubscribed_at") ||
        isMissingColumnError(result.error, "subscribed_at") ||
        isMissingColumnError(result.error, "active") ||
        isMissingColumnError(result.error, "lang")
      ) {
        continue;
      }

      console.error("[Email] Newsletter upsert error:", result.error);

      return {
        ok: false,
        success: false,
        error: "subscription_failed",
      };
    } catch (error) {
      console.error("[Email] Unexpected newsletter upsert error:", error);

      return {
        ok: false,
        success: false,
        error: "subscription_failed",
      };
    }
  }

  return {
    ok: false,
    success: false,
    error: "subscription_failed",
  };
}

export async function unsubscribeEmail(
  email: string,
  lang?: string
): Promise<SubscribeResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      success: false,
      error: "invalid_email",
    };
  }

  const safeLang = normalizeLang(lang);

  const client = getEmailAdminClient();

  if (!client) {
    return {
      ok: false,
      success: false,
      error: "db_not_configured",
    };
  }

  const now = new Date().toISOString();

  const attempts: Array<Record<string, unknown>> = [
    {
      active: false,
      unsubscribed_at: now,
      updated_at: now,
    },
    {
      active: false,
      unsubscribed_at: now,
    },
    {
      active: false,
    },
  ];

  for (const payload of attempts) {
    try {
      const result = (await withTimeout(
        client
          .from("newsletter_subscribers")
          .update(payload)
          .eq("email", normalizedEmail) as unknown as Promise<{
          error: any;
        }>,
        DB_TIMEOUT_MS,
        "newsletter_unsubscribe"
      )) as any;

      if (!result.error) {
        return {
          ok: true,
          success: true,
          message:
            safeLang === "en"
              ? "You have been unsubscribed successfully."
              : "تم إلغاء الاشتراك.",
        };
      }

      if (isMissingTableError(result.error)) {
        return {
          ok: false,
          success: false,
          error: "newsletter_table_missing",
        };
      }

      if (
        isMissingColumnError(result.error, "updated_at") ||
        isMissingColumnError(result.error, "unsubscribed_at") ||
        isMissingColumnError(result.error, "active")
      ) {
        continue;
      }

      console.error("[Email] Newsletter unsubscribe error:", result.error);

      return {
        ok: false,
        success: false,
        error: "unsubscribe_failed",
      };
    } catch (error) {
      console.error("[Email] Unexpected unsubscribe error:", error);

      return {
        ok: false,
        success: false,
        error: "unsubscribe_failed",
      };
    }
  }

  return {
    ok: false,
    success: false,
    error: "unsubscribe_failed",
  };
}

/**
 * يبني رابط إلغاء اشتراك آمنًا.
 *
 * ⚠️ مهم:
 * لا تستخدم رابطًا يعتمد على البريد فقط في الإنتاج لأن أي شخص يستطيع إلغاء
 * اشتراك بريد يعرفه. استخدم token موقّع أو رابطًا مؤقتًا من قاعدة البيانات.
 */
export function buildUnsubscribeUrl(params: {
  token?: string | null;
  email?: string | null;
}): string | null {
  const token =
    typeof params.token === "string" ? params.token.trim() : "";

  if (token) {
    const safeToken = encodeURIComponent(
      sanitizeControlChars(token).slice(0, 512)
    );

    return `${getSiteUrl()}/api/newsletter/unsubscribe?token=${safeToken}`;
  }

  // لا نولّد رابط إلغاء اشتراك بالبريد فقط افتراضيًا.
  return null;
}

// ============================================================
// Default export
// ============================================================

const emailApi = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNewsletterEmail,
  sendContactConfirmationEmail,
  sendAdminNotificationEmail,
  handleContactForm,
  subscribeEmail,
  unsubscribeEmail,
  buildUnsubscribeUrl,
};

export default emailApi;