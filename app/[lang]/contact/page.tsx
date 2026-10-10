// app/[lang]/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { handleContactForm } from "@/lib/email";
import { CONTACT_INFO, SITE_NAME, SOCIAL_LINKS } from "@/lib/site";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type SearchParams = {
  status?: string | string[];
  field?: string | string[];
};

// ============================================================
// ثوابت
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_SUBJECT: Record<Lang, string> = {
  ar: "رسالة من منصة إسماعيل أحمد نجيب",
  en: "Message from Ismail Ahmed Naguib Platform",
};

const UI: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    formTitle: string;
    formSubtitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    privacy: string;
    contactTitle: string;
    locationTitle: string;
    socialTitle: string;
    quickTitle: string;
    quickFatwa: string;
    quickWird: string;
    quickRuqyah: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorName: string;
    errorEmail: string;
    errorMessage: string;
    errorGeneric: string;
    note: string;
    responseTime: string;
    responseTimeValue: string;
    channels: string;
    channelsValue: string;
    availability: string;
    availabilityValue: string;
    verse: string;
    verseSource: string;
    faqTitle: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    phone: string;
  }
> = {
  ar: {
    title: "تواصل معنا",
    subtitle: "نسعد برسائلكم واستفساراتكم",
    home: "الرئيسية",
    description:
      "صفحة تواصل معنا لمنصة إسماعيل أحمد نجيب الدعوية. أرسل سؤالك، اقتراحك، أو ملاحظتك وسنرد عليك إن شاء الله.",
    formTitle: "نموذج التواصل",
    formSubtitle: "اكتب رسالتك وسنرد عليك إن شاء الله في أقرب وقت.",
    name: "الاسم",
    namePlaceholder: "اسمك الكريم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    subject: "الموضوع (اختياري)",
    subjectPlaceholder: "موضوع الرسالة",
    message: "الرسالة",
    messagePlaceholder: "اكتب رسالتك أو سؤالك هنا...",
    send: "إرسال الرسالة",
    privacy: "بياناتك تُستخدم للرد على رسالتك فقط.",
    contactTitle: "معلومات التواصل",
    locationTitle: "الموقع",
    socialTitle: "تابعنا",
    quickTitle: "روابط سريعة",
    quickFatwa: "الفتاوى",
    quickWird: "الورد اليومي",
    quickRuqyah: "الرقية الشرعية",
    successTitle: "تم إرسال رسالتك",
    successMessage: "شكرًا لك، سنرد عليك في أقرب وقت ممكن.",
    errorTitle: "تعذر إرسال الرسالة",
    errorName: "الاسم مطلوب.",
    errorEmail: "بريد إلكتروني غير صحيح.",
    errorMessage: "الرسالة قصيرة جدًا، اكتب 10 أحرف على الأقل.",
    errorGeneric: "حدث خطأ غير متوقع، حاول لاحقًا.",
    note: "لأسئلة الفتاوى الدقيقة، يُفضل إرسال السؤال عبر نموذج التواصل مع تفاصيل الحالة.",
    responseTime: "متوسط وقت الرد",
    responseTimeValue: "خلال 24-48 ساعة",
    channels: "قنوات التواصل",
    channelsValue: "7 قنوات متاحة",
    availability: "التوفر",
    availabilityValue: "طوال الأسبوع",
    verse: "﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾",
    verseSource: "سورة البقرة — الآية 83",
    faqTitle: "أسئلة شائعة عن التواصل",
    faq1Q: "كم يستغرق الرد على الرسائل؟",
    faq1A: "نحرص على الرد خلال 24 إلى 48 ساعة في الأيام العادية، وقد يتأخر الرد في أوقات الذروة أو الإجازات.",
    faq2Q: "هل يمكن إرسال أسئلة الفتاوى عبر هذا النموذج؟",
    faq2A: "نعم، يمكن ذلك، ولكن يُفضل كتابة تفاصيل الحالة بوضوح ليتمكن المختصون من الإجابة بدقة. وللأسئلة العاجلة أو الخاصة جداً، يُفضل الاتصال المباشر.",
    faq3Q: "هل بياناتي محفوظة وآمنة؟",
    faq3A: "نعم، نستخدم بياناتك فقط للرد على رسالتك، ولا نشاركها مع أي طرف ثالث، ولا نحتفظ بها لأغراض التسويق.",
    phone: "الهاتف",
  },
  en: {
    title: "Contact Us",
    subtitle: "We welcome your messages and inquiries",
    home: "Home",
    description:
      "Contact page for the Ismail Ahmed Naguib Dawah Platform. Send your question, suggestion, or feedback and we will reply, in sha Allah.",
    formTitle: "Contact Form",
    formSubtitle: "Write your message and we will reply as soon as possible.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    subject: "Subject (optional)",
    subjectPlaceholder: "Message subject",
    message: "Message",
    messagePlaceholder: "Write your message or question here...",
    send: "Send Message",
    privacy: "Your data is used only to reply to your message.",
    contactTitle: "Contact Information",
    locationTitle: "Location",
    socialTitle: "Follow Us",
    quickTitle: "Quick Links",
    quickFatwa: "Fatwas",
    quickWird: "Daily Wird",
    quickRuqyah: "Ruqyah",
    successTitle: "Message Sent",
    successMessage: "Thank you. We will reply as soon as possible.",
    errorTitle: "Unable to Send Message",
    errorName: "Name is required.",
    errorEmail: "Invalid email address.",
    errorMessage: "Message is too short. Please write at least 10 characters.",
    errorGeneric: "An unexpected error occurred. Please try again later.",
    note: "For detailed fatwa questions, please send your question through the contact form with case details.",
    responseTime: "Average response time",
    responseTimeValue: "Within 24-48 hours",
    channels: "Communication channels",
    channelsValue: "7 channels available",
    availability: "Availability",
    availabilityValue: "Throughout the week",
    verse: "\"And speak to people good words.\"",
    verseSource: "Surah Al-Baqarah — Verse 83",
    faqTitle: "Frequently Asked Questions",
    faq1Q: "How long does it take to receive a reply?",
    faq1A: "We strive to reply within 24 to 48 hours on regular days, though responses may be delayed during peak times or holidays.",
    faq2Q: "Can I send fatwa questions through this form?",
    faq2A: "Yes, you can, but it's best to clearly describe the case details so specialists can answer accurately. For urgent or very private questions, direct contact is preferred.",
    faq3Q: "Is my data safe and protected?",
    faq3A: "Yes, we use your data only to reply to your message, never share it with third parties, and do not retain it for marketing purposes.",
    phone: "Phone",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function isPlaceholderLink(href?: string): boolean {
  if (!href) return true;
  const lower = href.toLowerCase();
  return (
    lower.includes("yourpage") ||
    lower.includes("yourhandle") ||
    lower.includes("yourchannel") ||
    lower.includes("your@email.com") ||
    lower.includes("000000000") ||
    lower.includes("example.com")
  );
}

function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

// ============================================================
// Metadata
// ============================================================

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/contact`,
      languages: {
        ar: "/ar/contact",
        en: "/en/contact",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/contact`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: ui.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const status = getFirstValue(sp.status);
  const field = getFirstValue(sp.field);

  // ===== Server Action =====
  async function submitContact(formData: FormData): Promise<void> {
    "use server";

    const rawLang = String(formData.get("lang") || "ar");
    const actionLang: Lang = rawLang === "en" ? "en" : "ar";

    // Honeypot للبوتات
    const honeypot = String(formData.get("website") || "").trim();
    if (honeypot) {
      redirect(`/${actionLang}/contact?status=sent`);
    }

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name) redirect(`/${actionLang}/contact?status=error&field=name`);
    if (!email) redirect(`/${actionLang}/contact?status=error&field=email`);
    if (!EMAIL_REGEX.test(email)) redirect(`/${actionLang}/contact?status=error&field=email`);
    if (message.length < 10) redirect(`/${actionLang}/contact?status=error&field=message`);

    let success = false;
    try {
      const result = await handleContactForm(
        name,
        email,
        subject || DEFAULT_SUBJECT[actionLang],
        message,
        actionLang
      );
      success = result.success;
    } catch {
      success = false;
    }

    if (!success) redirect(`/${actionLang}/contact?status=error`);
    redirect(`/${actionLang}/contact?status=sent`);
  }

  const showAlert = status === "sent" || status === "error";
  const alertTitle = status === "sent" ? ui.successTitle : ui.errorTitle;
  const alertMessage =
    status === "sent"
      ? ui.successMessage
      : field === "name"
      ? ui.errorName
      : field === "email"
      ? ui.errorEmail
      : field === "message"
      ? ui.errorMessage
      : ui.errorGeneric;

  const socials = [
    { key: "whatsapp", href: SOCIAL_LINKS.whatsapp, icon: "💬", ar: "واتساب", en: "WhatsApp" },
    { key: "telegram", href: SOCIAL_LINKS.telegram, icon: "✈️", ar: "تيليجرام", en: "Telegram" },
    { key: "facebook", href: SOCIAL_LINKS.facebook, icon: "📘", ar: "فيسبوك", en: "Facebook" },
    { key: "twitter", href: SOCIAL_LINKS.twitter, icon: "🐦", ar: "إكس", en: "X" },
    { key: "instagram", href: SOCIAL_LINKS.instagram, icon: "📸", ar: "إنستغرام", en: "Instagram" },
    { key: "youtube", href: SOCIAL_LINKS.youtube, icon: "▶️", ar: "يوتيوب", en: "YouTube" },
    { key: "tiktok", href: SOCIAL_LINKS.tiktok, icon: "🎵", ar: "تيك توك", en: "TikTok" },
  ].filter((social) => !isPlaceholderLink(social.href));

  const whatsappNumber = onlyDigits(CONTACT_INFO.whatsapp);
  const phoneNumber = onlyDigits(CONTACT_INFO.phone);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/contact`,
      },
      {
        "@type": "Organization",
        name: isRTL ? SITE_NAME : "Ismail Ahmed Naguib Platform",
        url: `/${l}`,
        contactPoint: {
          "@type": "ContactPoint",
          email: !isPlaceholderLink(CONTACT_INFO.email) ? CONTACT_INFO.email : undefined,
          telephone: phoneNumber || undefined,
          contactType: "customer support",
          availableLanguage: ["Arabic", "English"],
        },
        sameAs: socials.map((s) => s.href),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: ui.faq1Q,
            acceptedAnswer: { "@type": "Answer", text: ui.faq1A },
          },
          {
            "@type": "Question",
            name: ui.faq2Q,
            acceptedAnswer: { "@type": "Answer", text: ui.faq2A },
          },
          {
            "@type": "Question",
            name: ui.faq3Q,
            acceptedAnswer: { "@type": "Answer", text: ui.faq3A },
          },
        ],
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== رسالة النجاح/الخطأ ===== */}
        {showAlert && (
          <div
            className={`card mb-8 p-5 md:p-6 ${
              status === "sent"
                ? "border-green-200 bg-green-50/60 dark:border-green-800/40 dark:bg-green-950/20"
                : "border-red-200 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                  status === "sent"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                }`}
              >
                {status === "sent" ? "✅" : "⚠️"}
              </span>

              <div>
                <h2
                  className={`mb-1 text-lg font-black ${
                    status === "sent"
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {alertTitle}
                </h2>
                <p
                  className={`leading-relaxed ${
                    status === "sent"
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {alertMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              {isRTL ? SITE_NAME : "Ismail Ahmed Naguib"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                ⏱️
              </span>
            </div>
            <p className="text-sm font-black text-primary-700 dark:text-primary-300">
              {ui.responseTimeValue}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.responseTime}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                🌐
              </span>
            </div>
            <p className="text-sm font-black text-primary-700 dark:text-primary-300">
              {ui.channelsValue}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.channels}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                📅
              </span>
            </div>
            <p className="text-sm font-black text-primary-700 dark:text-primary-300">
              {ui.availabilityValue}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.availability}
            </p>
          </div>
        </div>

        {/* ===== الشبكة الرئيسية ===== */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          {/* ===== نموذج التواصل ===== */}
          <div className="card p-6 md:p-8">
            <h2
              className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.formTitle}
            </h2>

            <p className="mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
              {ui.formSubtitle}
            </p>

            <form action={submitContact} className="grid gap-5">
              <input type="hidden" name="lang" value={l} />

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={ui.namePlaceholder}
                    className="input-islamic"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={ui.emailPlaceholder}
                    className="input-islamic"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.subject}
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder={ui.subjectPlaceholder}
                  className="input-islamic"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder={ui.messagePlaceholder}
                  className="input-islamic min-h-36 resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  🔒 {ui.privacy}
                </p>

                <button type="submit" className="btn-primary inline-flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  {ui.send}
                </button>
              </div>
            </form>
          </div>

          {/* ===== العمود الجانبي ===== */}
          <div className="space-y-6">
            {/* معلومات التواصل */}
            <div className="card p-6">
              <h2
                className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.contactTitle}
              </h2>

              <div className="space-y-4">
                {!isPlaceholderLink(CONTACT_INFO.email) && (
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:hover:border-primary-800 dark:hover:bg-night-800"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/40">
                      📧
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {ui.email}
                      </p>
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {CONTACT_INFO.email}
                      </p>
                    </div>
                  </a>
                )}

                {whatsappNumber && !isPlaceholderLink(`https://wa.me/${whatsappNumber}`) && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-green-200 hover:bg-green-50/60 dark:border-night-700 dark:hover:border-green-900/40 dark:hover:bg-green-950/20"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl dark:bg-green-900/40">
                      💬
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        WhatsApp
                      </p>
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {CONTACT_INFO.whatsapp}
                      </p>
                    </div>
                  </a>
                )}

                {phoneNumber && !isPlaceholderLink(`tel:${phoneNumber}`) && (
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:hover:border-primary-800 dark:hover:bg-night-800"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/40">
                      📞
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {ui.phone}
                      </p>
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {CONTACT_INFO.phone}
                      </p>
                    </div>
                  </a>
                )}

                <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 dark:border-night-700">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-xl dark:bg-gold-900/30">
                    📍
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {ui.locationTitle}
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {CONTACT_INFO.location[l]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* السوشيال ميديا */}
            {socials.length > 0 && (
              <div className="card p-6">
                <h2
                  className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.socialTitle}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-bold text-slate-700 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:text-slate-200 dark:hover:border-primary-800 dark:hover:bg-night-800"
                    >
                      <span className="text-xl">{social.icon}</span>
                      <span>{isRTL ? social.ar : social.en}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* روابط سريعة */}
            <div className="card p-6">
              <h2
                className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.quickTitle}
              </h2>

              <div className="grid gap-3">
                <Link
                  href={`/${l}/fatwa`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:text-slate-200 dark:hover:border-primary-800 dark:hover:bg-night-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">⚖️</span>
                    {ui.quickFatwa}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href={`/${l}/daily-wird`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:text-slate-200 dark:hover:border-primary-800 dark:hover:bg-night-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    {ui.quickWird}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href={`/${l}/ruqyah`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-200 hover:bg-primary-50/60 dark:border-night-700 dark:text-slate-200 dark:hover:border-primary-800 dark:hover:bg-night-800"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">🛡️</span>
                    {ui.quickRuqyah}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===== الأسئلة الشائعة ===== */}
        <div className="mt-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.faqTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="space-y-4">
            <FaqItem question={ui.faq1Q} answer={ui.faq1A} />
            <FaqItem question={ui.faq2Q} answer={ui.faq2A} />
            <FaqItem question={ui.faq3Q} answer={ui.faq3A} />
          </div>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start justify-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-xl dark:bg-gold-900/40">
              💡
            </span>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {ui.note}
            </p>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون FAQ Item
// ============================================================

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="card group p-6">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h3 className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
          ❓ {question}
        </h3>
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </span>
      </summary>
      <p className="mt-4 border-t border-slate-100 pt-4 leading-relaxed text-slate-600 dark:border-night-700 dark:text-slate-300">
        {answer}
      </p>
    </details>
  );
}