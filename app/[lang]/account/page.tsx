// app/[lang]/account/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient, getServerUser } from "@/lib/auth";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import ChangePasswordCard from "@/components/auth/ChangePasswordCard";
import {
  PASSWORD_CHANGE_SETTING_KEY,
  normalizePasswordChangeConfig,
} from "@/lib/password-change-config";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type AccountUI = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  login: string;
  loginDesc: string;
  loginAction: string;
  register: string;
  registerDesc: string;
  registerAction: string;
  bookmarks: string;
  bookmarksDesc: string;
  bookmarksAction: string;
  whyTitle: string;
  whyDesc: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  benefit4Title: string;
  benefit4Desc: string;
  howTitle: string;
  howDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  noteTitle: string;
  note1: string;
  note2: string;
  contact: string;
  userArea: string;
  progressTitle: string;
  progressDescription: string;
  progressCompleted: string;
  progressOpen: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, AccountUI> = {
  ar: {
    title: "الحساب",
    subtitle: "تسجيل الدخول وإنشاء الحساب ومتابعة التقدم",
    home: "الرئيسية",
    description:
      "صفحة الحساب في منصة اكتشف الإسلام. يمكنك تسجيل الدخول أو إنشاء حساب جديد لحفظ المفضلة ومتابعة التقدم.",
    login: "تسجيل الدخول",
    loginDesc: "ادخل إلى حسابك إذا كان لديك حساب مسبقًا.",
    loginAction: "فتح صفحة الدخول",
    register: "إنشاء حساب",
    registerDesc: "أنشئ حسابًا جديدًا لحفظ المفضلة ومتابعة التقدم.",
    registerAction: "إنشاء حساب جديد",
    bookmarks: "المفضلة",
    bookmarksDesc: "راجع العناصر التي حفظتها سابقًا.",
    bookmarksAction: "عرض المفضلة",
    whyTitle: "لماذا تنشئ حساباً؟",
    whyDesc: "حسابك يمنحك مزايا إضافية لتجربة أفضل.",
    benefit1Title: "حفظ المفضلة",
    benefit1Desc: "احفظ الآيات والأذكار والمقالات المهمة للرجوع إليها في أي وقت.",
    benefit2Title: "متابعة التقدم",
    benefit2Desc: "تتبّع تقدمك في حفظ القرآن والأذكار اليومية والورد.",
    benefit3Title: "مزامنة الأجهزة",
    benefit3Desc: "ادخل من أي جهاز وستجد بياناتك محفوظة ومتزامنة.",
    benefit4Title: "إشعارات مخصصة",
    benefit4Desc: "احصل على تذكيرات بمواقيت الصلاة والأذكار حسب تفضيلاتك.",
    howTitle: "كيف يعمل النظام؟",
    howDesc: "ثلاث خطوات بسيطة للبدء.",
    step1Title: "أنشئ حسابك",
    step1Desc: "سجّل بالبريد الإلكتروني في أقل من دقيقة.",
    step2Title: "تصفح المحتوى",
    step2Desc: "استكشف الأقسام واحفظ ما يناسبك في المفضلة.",
    step3Title: "تابع تقدمك",
    step3Desc: "شاهد إنجازاتك وتقدّمك في لوحة حسابك.",
    faqTitle: "أسئلة شائعة عن الحساب",
    faq1Q: "هل إنشاء الحساب مجاني؟",
    faq1A: "نعم، إنشاء الحساب واستخدام جميع الميزات مجاني تماماً ولا يتطلب أي رسوم.",
    faq2Q: "هل بياناتي آمنة؟",
    faq2A: "نعم، نستخدم تشفيراً متقدماً لحماية بياناتك ولا نشاركها مع أي طرف ثالث.",
    faq3Q: "ماذا لو نسيت كلمة المرور؟",
    faq3A: "يمكنك استعادة كلمة المرور بسهولة عبر رابط استعادة يُرسل إلى بريدك الإلكتروني.",
    noteTitle: "ملاحظة",
    note1: "يمكنك الآن حفظ إنجاز دروس المكتبة من داخل كل درس، وتظهر إحصائية التقدم عند تسجيل الدخول.",
    note2: "لو واجهت مشكلة في تسجيل الدخول، تواصل معنا عبر صفحة تواصل معنا.",
    contact: "تواصل معنا",
    userArea: "منطقة المستخدم",
    progressTitle: "تقدمك في المكتبة",
    progressDescription: "تابع الدروس التي بدأت بها واحفظ ما أتممته.",
    progressCompleted: "درس مكتمل",
    progressOpen: "فتح المكتبة",
  },
  en: {
    title: "Account",
    subtitle: "Sign in, register, and track progress",
    home: "Home",
    description:
      "Account page for the Discover Islam. You can sign in or create a new account to save bookmarks and track progress.",
    login: "Sign In",
    loginDesc: "Enter your account if you already have one.",
    loginAction: "Open sign in",
    register: "Create Account",
    registerDesc: "Create a new account to save bookmarks and track progress.",
    registerAction: "Create new account",
    bookmarks: "Bookmarks",
    bookmarksDesc: "Review items you saved earlier.",
    bookmarksAction: "View bookmarks",
    whyTitle: "Why Create an Account?",
    whyDesc: "Your account gives you extra benefits for a better experience.",
    benefit1Title: "Save Bookmarks",
    benefit1Desc: "Save important verses, adhkar, and articles to revisit anytime.",
    benefit2Title: "Track Progress",
    benefit2Desc: "Monitor your progress in Quran memorization, daily adhkar, and wird.",
    benefit3Title: "Sync Across Devices",
    benefit3Desc: "Log in from any device and find your data saved and synced.",
    benefit4Title: "Custom Notifications",
    benefit4Desc: "Get prayer and adhkar reminders based on your preferences.",
    howTitle: "How Does It Work?",
    howDesc: "Three simple steps to get started.",
    step1Title: "Create Your Account",
    step1Desc: "Register with your email in less than a minute.",
    step2Title: "Browse Content",
    step2Desc: "Explore sections and save what suits you in bookmarks.",
    step3Title: "Track Progress",
    step3Desc: "See your achievements and progress in your dashboard.",
    faqTitle: "Account FAQ",
    faq1Q: "Is creating an account free?",
    faq1A: "Yes, creating an account and using all features is completely free with no charges.",
    faq2Q: "Is my data secure?",
    faq2A: "Yes, we use advanced encryption to protect your data and never share it with third parties.",
    faq3Q: "What if I forget my password?",
    faq3A: "You can easily recover your password via a reset link sent to your email.",
    noteTitle: "Notice",
    note1: "You can now mark library lessons as complete, and your progress summary appears when you sign in.",
    note2: "If you face a sign-in issue, contact us through the Contact Us page.",
    contact: "Contact Us",
    userArea: "User Area",
    progressTitle: "Your library progress",
    progressDescription: "Keep track of lessons you started and save what you complete.",
    progressCompleted: "completed lessons",
    progressOpen: "Open library",
  },
};

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/account`,
      languages: {
        ar: "/ar/account",
        en: "/en/account",
      },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/account`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: `/og/og-${l}.png`,
          width: 1200,
          height: 630,
          alt: ui.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: [`/og/og-${l}.png`],
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "account", l);
  const ui = UI[l];
  const isRTL = l === "ar";
  const user = await getServerUser();
  const progressSummary = user ? await getProgressSummary(user.id) : null;
  const passwordChangeEnabled = normalizePasswordChangeConfig(
    (__pageSettings as Record<string, unknown>)[PASSWORD_CHANGE_SETTING_KEY]
  ).enabled;

  let showVerificationBanner = false;

  if (user && user.role === "user") {
    try {
      const admin = createAdminClient();
      const queryId = /^\d+$/.test(user.id) ? Number(user.id) : user.id;
      const { data } = await admin
        .from("users")
        .select("email_verified")
        .eq("id", queryId)
        .maybeSingle();

      // عمود غير موجود (ترحيل لم يُنفّذ) => الحساب قديم ويُعامَل مفعّلًا.
      showVerificationBanner =
        (data as { email_verified?: boolean } | null)?.email_verified === false;
    } catch {
      showVerificationBanner = false;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: ui.title,
    description: ui.description,
    inLanguage: l,
    url: `/${l}/account`,
    mainEntity: {
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
  };

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
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
        {showVerificationBanner && user && (
          <EmailVerificationBanner lang={l} email={user.email} />
        )}

        {/* ===== ترويسة ===== */}
        {gate.visible('k0') && (<>
        <div className="card relative mb-10 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">👤 {ui.userArea}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>
          </div>
        </div>

        </>)}
        {/* ===== بطاقات الحساب الرئيسية ===== */}
        {gate.visible('k1') && (<>
        <div className="mb-10 grid gap-5 md:grid-cols-2">
          {/* تسجيل الدخول */}
          <Link
            href={`/${l}/login`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7"
          >
            <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                🔐
              </span>

              <div className="min-w-0">
                <h2
                  className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.login}
                </h2>

                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.loginDesc}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
              {ui.loginAction}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          {/* إنشاء حساب */}
          <Link
            href={`/${l}/register`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7"
          >
            <div className="gradient-gold absolute inset-x-0 top-0 h-1" />

            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
                ✨
              </span>

              <div className="min-w-0">
                <h2
                  className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-gold-700 dark:text-white dark:group-hover:text-gold-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.register}
                </h2>

                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.registerDesc}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-gold-700 dark:text-gold-300">
              {ui.registerAction}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          {/* المفضلة - بعرض كامل */}
          <Link
            href={`/${l}/bookmarks`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7 md:col-span-2"
          >
            <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                  🔖
                </span>

                <div className="min-w-0">
                  <h2
                    className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {ui.bookmarks}
                  </h2>

                  <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {ui.bookmarksDesc}
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                {ui.bookmarksAction}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        {progressSummary && (
          <section className="mb-10" aria-labelledby="account-progress-title">
            <div className="card relative overflow-hidden p-6 md:p-8">
              <div className="gradient-gold absolute inset-x-0 top-0 h-1" />
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2
                    id="account-progress-title"
                    className="text-2xl font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    📈 {ui.progressTitle}
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {ui.progressDescription}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-2xl bg-primary-50 px-5 py-3 text-center dark:bg-primary-900/30">
                    <div className="text-2xl font-black text-primary-800 dark:text-primary-200">
                      {progressSummary.completed}
                      <span className="text-base font-medium text-primary-700 dark:text-primary-300">
                        /{progressSummary.total}
                      </span>
                    </div>
                    <div className="text-xs text-primary-700 dark:text-primary-300">
                      {ui.progressCompleted}
                    </div>
                  </div>
                  <Link href={`/${l}/learn`} className="btn-primary whitespace-nowrap">
                    {ui.progressOpen}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {user && passwordChangeEnabled && (
          <ChangePasswordCard lang={l} />
        )}

        </>)}
        {/* ===== لماذا تنشئ حساباً؟ ===== */}
        {gate.visible('k2') && (<>
        <div className="mb-10">
          <div className="mb-8 text-center">
            <h2
              className="mb-3 text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💎 {ui.whyTitle}
            </h2>
            <div className="islamic-divider my-3">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.whyDesc}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon="🔖"
              title={ui.benefit1Title}
              description={ui.benefit1Desc}
              isRTL={isRTL}
            />
            <BenefitCard
              icon="📊"
              title={ui.benefit2Title}
              description={ui.benefit2Desc}
              isRTL={isRTL}
            />
            <BenefitCard
              icon="🔄"
              title={ui.benefit3Title}
              description={ui.benefit3Desc}
              isRTL={isRTL}
            />
            <BenefitCard
              icon="🔔"
              title={ui.benefit4Title}
              description={ui.benefit4Desc}
              isRTL={isRTL}
            />
          </div>
        </div>

        </>)}
        {/* ===== كيف يعمل النظام؟ ===== */}
        {gate.visible('k3') && (<>
        <div className="mb-10">
          <div className="mb-8 text-center">
            <h2
              className="mb-3 text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🛠️ {ui.howTitle}
            </h2>
            <div className="islamic-divider my-3">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.howDesc}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <StepCard
              step={1}
              icon="✍️"
              title={ui.step1Title}
              description={ui.step1Desc}
            />
            <StepCard
              step={2}
              icon="📚"
              title={ui.step2Title}
              description={ui.step2Desc}
            />
            <StepCard
              step={3}
              icon="📈"
              title={ui.step3Title}
              description={ui.step3Desc}
            />
          </div>
        </div>

        </>)}
        {/* ===== الأسئلة الشائعة ===== */}
        {gate.visible('k4') && (<>
        <div className="mb-10">
          <div className="mb-8 text-center">
            <h2
              className="mb-3 text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              ❓ {ui.faqTitle}
            </h2>
          </div>

          <div className="space-y-4">
            <FaqItem question={ui.faq1Q} answer={ui.faq1A} />
            <FaqItem question={ui.faq2Q} answer={ui.faq2A} />
            <FaqItem question={ui.faq3Q} answer={ui.faq3A} />
          </div>
        </div>

        </>)}
        {/* ===== ملاحظة ===== */}
        {gate.visible('k5') && (<>
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h2
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h2>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${l}/contact`} className="btn-primary">
                  {ui.contact}
                </Link>
                <Link href={`/${l}`} className="btn-outline">
                  {ui.home}
                </Link>
              </div>
            </div>
          </div>
        </div>
        </>)}
      </section>

      <Footer lang={l} />
    </main>
  );
}

async function getProgressSummary(userId: string) {
  const sessionUserId = userId.trim();
  if (!sessionUserId || sessionUserId.length > 255) return null;

  try {
    const { data, error } = await createAdminClient()
      .from("learner_content_progress")
      .select("content_id,completed_at")
      .eq("user_id", sessionUserId);

    if (error) {
      console.error("[account progress]", error);
      return null;
    }

    const items = data ?? [];
    return {
      total: items.length,
      completed: items.filter((item: { completed_at?: string | null }) => Boolean(item.completed_at)).length,
    };
  } catch {
    return null;
  }
}

// ============================================================
// المكونات المساعدة
// ============================================================

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
  isRTL: boolean;
}) {
  return (
    <div className="card card-interactive relative overflow-hidden p-6 text-center">
      <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
        {icon}
      </span>

      <h3
        className="mb-2 text-lg font-black text-slate-900 dark:text-white"
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card relative overflow-hidden p-6">
      <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 font-black text-white shadow-lg">
          {step}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

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

