// lib/email.ts
// نظام إرسال الإيميلات — آمن للبناء (Lazy Client + Simulation)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ===== إعدادات =====
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@yourdomain.com";
const FROM_NAME = process.env.FROM_NAME || "إسماعيل أحمد نجيب";

// ===== عميل Supabase Admin بشكل Lazy =====
let emailAdminClient: SupabaseClient | null = null;

function getEmailAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!emailAdminClient) {
    emailAdminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return emailAdminClient;
}

const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getEmailAdminClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// ===== عميل Resend بشكل Lazy =====
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

// ===== الأنواع =====
export type EmailType =
  | "verification"
  | "password_reset"
  | "newsletter"
  | "contact"
  | "welcome"
  | "admin_notification";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: EmailType;
}

interface EmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

// ===== القالب الأساسي =====
function emailLayout(content: string, direction: "rtl" | "ltr" = "rtl"): string {
  return `<!DOCTYPE html>
<html lang="${direction === "rtl" ? "ar" : "en"}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: #a5f3fc; margin: 10px 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .footer { background-color: #0f172a; padding: 20px; text-align: center; }
    .footer p { color: #94a3b8; margin: 5px 0; font-size: 12px; }
    .footer a { color: #67e8f9; text-decoration: none; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 20px 0; }
    .info-box { background-color: #f0f9ff; border-radius: 8px; padding: 15px; margin: 15px 0; border-right: 4px solid #06b6d4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${FROM_NAME}</h1>
      <p>منصة دعوية شاملة</p>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${FROM_NAME} — جميع الحقوق محفوظة</p>
      <p>
        <a href="https://ismailahmednaguib.vercel.app">الموقع</a> •
        <a href="https://ismailahmednaguib.vercel.app/ar/about">من نحن</a> •
        <a href="https://ismailahmednaguib.vercel.app/ar/contact">تواصل معنا</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ===== تسجيل الإيميلات =====
async function logEmail(
  options: EmailOptions,
  status: "sent" | "failed" | "simulated",
  error?: string,
  emailId?: string
): Promise<void> {
  try {
    await supabase.from("email_logs").insert({
      to_email: options.to,
      subject: options.subject,
      type: options.type,
      status,
      error: error || null,
      resend_id: emailId || null,
      sent_at: new Date().toISOString(),
    });
  } catch {
    // تجاهل أخطاء التسجيل
  }
}

// ===== الإرسال الأساسي =====
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    console.log("📧 [Email Simulation]", {
      to: options.to,
      subject: options.subject,
      type: options.type,
    });
    await logEmail(options, "simulated");
    return { success: true, id: "simulated-" + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      await logEmail(options, "failed", error.message);
      return { success: false, error: error.message };
    }

    await logEmail(options, "sent", undefined, data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    await logEmail(options, "failed", msg);
    return { success: false, error: msg };
  }
}

// ===== قوالب الإيميلات =====
export async function sendVerificationEmail(to: string, verificationUrl: string, lang: "ar" | "en" = "ar"): Promise<EmailResult> {
  const isRTL = lang === "ar";
  const content = isRTL
    ? `<h2 style="color: #1e293b;">مرحبًا بك! 👋</h2>
       <p style="color: #475569; line-height: 1.8;">شكرًا لتسجيلك في منصة <strong>${FROM_NAME}</strong>.</p>
       <p style="color: #475569; line-height: 1.8;">لتفعيل حسابك، اضغط على الزر بالأسفل:</p>
       <div style="text-align: center;"><a href="${verificationUrl}" class="btn">تفعيل الحساب</a></div>
       <div class="info-box"><p style="margin: 0; color: #0369a1; font-size: 14px;">💡 لو الزر لا يعمل، انسخ الرابط:<br><a href="${verificationUrl}" style="word-break: break-all; color: #0891b2;">${verificationUrl}</a></p></div>
       <p style="color: #94a3b8; font-size: 12px;">هذا الرابط صالح لمدة 24 ساعة فقط.</p>`
    : `<h2 style="color: #1e293b;">Welcome! 👋</h2>
       <p style="color: #475569; line-height: 1.8;">Thank you for signing up at <strong>${FROM_NAME}</strong>.</p>
       <p style="color: #475569; line-height: 1.8;">To activate your account, click the button below:</p>
       <div style="text-align: center;"><a href="${verificationUrl}" class="btn">Activate Account</a></div>
       <div class="info-box"><p style="margin: 0; color: #0369a1; font-size: 14px;">💡 If the button doesn't work, copy this link:<br><a href="${verificationUrl}" style="word-break: break-all; color: #0891b2;">${verificationUrl}</a></p></div>
       <p style="color: #94a3b8; font-size: 12px;">This link is valid for 24 hours only.</p>`;

  return sendEmail({
    to,
    subject: isRTL ? "تفعيل حسابك في " + FROM_NAME : "Activate your account at " + FROM_NAME,
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "verification",
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, lang: "ar" | "en" = "ar"): Promise<EmailResult> {
  const isRTL = lang === "ar";
  const content = isRTL
    ? `<h2 style="color: #1e293b;">إعادة تعيين كلمة المرور 🔐</h2>
       <p style="color: #475569; line-height: 1.8;">وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بك.</p>
       <div style="text-align: center;"><a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a></div>
       <div class="info-box" style="border-right-color: #f59e0b; background-color: #fffbeb;"><p style="margin: 0; color: #92400e; font-size: 14px;">⚠️ لو لم تطلب هذا، تجاهل هذا الإيميل.</p></div>
       <p style="color: #94a3b8; font-size: 12px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>`
    : `<h2 style="color: #1e293b;">Reset Your Password 🔐</h2>
       <p style="color: #475569; line-height: 1.8;">We received a request to reset your password.</p>
       <div style="text-align: center;"><a href="${resetUrl}" class="btn">Reset Password</a></div>
       <div class="info-box" style="border-right-color: #f59e0b; background-color: #fffbeb;"><p style="margin: 0; color: #92400e; font-size: 14px;">⚠️ If you didn't request this, ignore this email.</p></div>
       <p style="color: #94a3b8; font-size: 12px;">This link is valid for 1 hour only.</p>`;

  return sendEmail({
    to,
    subject: isRTL ? "إعادة تعيين كلمة المرور" : "Reset Your Password",
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "password_reset",
  });
}

export async function sendWelcomeEmail(to: string, fullName: string, lang: "ar" | "en" = "ar"): Promise<EmailResult> {
  const isRTL = lang === "ar";
  const siteUrl = "https://ismailahmednaguib.vercel.app";
  const content = isRTL
    ? `<h2 style="color: #1e293b;">أهلًا بك يا ${fullName}! 🎉</h2>
       <p style="color: #475569; line-height: 1.8;">تم تفعيل حسابك بنجاح في منصة <strong>${FROM_NAME}</strong>.</p>
       <div class="divider"></div>
       <h3 style="color: #0e7490;">ماذا يمكنك أن تفعل الآن؟</h3>
       <ul style="color: #475569; line-height: 2;">
         <li>📖 قراءة القرآن الكريم والاستماع إليه</li>
         <li>🤲 الوصول إلى الأذكار والأدعية</li>
         <li>🕌 معرفة مواقيت الصلاة حسب موقعك</li>
         <li>⚖️ الاطلاع على الفتاوى الشرعية</li>
         <li>🔖 حفظ المحتوى المفضل لديك</li>
       </ul>
       <div style="text-align: center;"><a href="${siteUrl}" class="btn">ابدأ الآن</a></div>`
    : `<h2 style="color: #1e293b;">Welcome, ${fullName}! 🎉</h2>
       <p style="color: #475569; line-height: 1.8;">Your account has been successfully activated at <strong>${FROM_NAME}</strong>.</p>
       <div class="divider"></div>
       <h3 style="color: #0e7490;">What can you do now?</h3>
       <ul style="color: #475569; line-height: 2;">
         <li>📖 Read and listen to the Holy Quran</li>
         <li>🤲 Access Adhkar and Duas</li>
         <li>🕌 Get prayer times based on your location</li>
         <li>⚖️ Browse Islamic Fatwas</li>
         <li>🔖 Bookmark your favorite content</li>
       </ul>
       <div style="text-align: center;"><a href="${siteUrl}" class="btn">Get Started</a></div>`;

  return sendEmail({
    to,
    subject: isRTL ? `أهلًا بك في ${FROM_NAME}!` : `Welcome to ${FROM_NAME}!`,
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "welcome",
  });
}

export async function sendNewsletterEmail(to: string, subject: string, contentHtml: string, lang: "ar" | "en" = "ar"): Promise<EmailResult> {
  return sendEmail({
    to,
    subject,
    html: emailLayout(contentHtml, lang === "ar" ? "rtl" : "ltr"),
    type: "newsletter",
  });
}

export async function sendContactConfirmationEmail(to: string, name: string, lang: "ar" | "en" = "ar"): Promise<EmailResult> {
  const isRTL = lang === "ar";
  const content = isRTL
    ? `<h2 style="color: #1e293b;">تم استلام رسالتك ✅</h2>
       <p style="color: #475569; line-height: 1.8;">شكرًا لك يا <strong>${name}</strong> على تواصلك معنا.</p>
       <p style="color: #475569; line-height: 1.8;">سنقوم بالرد على رسالتك في أقرب وقت ممكن، عادةً خلال 24-48 ساعة.</p>`
    : `<h2 style="color: #1e293b;">Message Received ✅</h2>
       <p style="color: #475569; line-height: 1.8;">Thank you, <strong>${name}</strong>, for contacting us.</p>
       <p style="color: #475569; line-height: 1.8;">We will reply to your message as soon as possible, usually within 24-48 hours.</p>`;

  return sendEmail({
    to,
    subject: isRTL ? "تم استلام رسالتك" : "Your Message Has Been Received",
    html: emailLayout(content, isRTL ? "rtl" : "ltr"),
    type: "contact",
  });
}

export async function sendAdminNotificationEmail(subject: string, message: string, source: string): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return { success: false, error: "ADMIN_EMAIL not configured" };
  }
  const content = `<h2 style="color: #1e293b;">🔔 إشعار جديد</h2>
    <div class="info-box">
      <p style="margin: 0 0 10px; color: #475569;"><strong>المصدر:</strong> ${source}</p>
      <p style="margin: 0; color: #475569;"><strong>الرسالة:</strong></p>
      <p style="margin: 10px 0 0; color: #1e293b; line-height: 1.8;">${message}</p>
    </div>`;
  return sendEmail({
    to: adminEmail,
    subject: `[إشعار] ${subject}`,
    html: emailLayout(content),
    type: "admin_notification",
  });
}

export async function handleContactForm(
  name: string,
  email: string,
  subject: string,
  message: string,
  lang: "ar" | "en" = "ar"
): Promise<{ success: boolean; error?: string }> {
  try {
    await sendAdminNotificationEmail(`رسالة تواصل جديدة: ${subject}`, `من: ${name} (${email})\n\n${message}`, "نموذج التواصل");
    await sendContactConfirmationEmail(email, name, lang);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===== طبقة توافق لـ API route القديمة =====
export async function subscribeEmail(email: string, lang: string = "ar"): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: "Email is required" };
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: normalizedEmail, lang, subscribed_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}