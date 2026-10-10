// app/[lang]/download/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

// ============================================================
// الأنواع
// ============================================================

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  androidApp: string;
  betaNotice: string;
  fileName: string;
  version: string;
  fileSize: string;
  requirements: string;
  platform: string;
  downloadApk: string;
  directLink: string;
  backHome: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  note4: string;
  installPwa: string;
  installPwaDesc: string;
  or: string;
  copyLink: string;
  copied: string;
  scanToDownload: string;
  installationSteps: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  features: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  feature6: string;
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  onlyAndroid: string;
  comingSoon: string;
};

// ============================================================
// الثوابت
// ============================================================

const DIRECT_APK_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ??
  "https://fwzasbyojjxycxvuvleo.supabase.co/storage/v1/object/public/site/app/ismail-dawah.apk";

const PROXY_DOWNLOAD_URL = "/api/download/android";

const FILE_NAME = "ismail-dawah.apk";
const VERSION = "0.1.0-beta";
const FILE_SIZE = "5–6 MB";
const REQUIREMENTS = "Android 8.0+";

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "تحميل التطبيق",
    subtitle: "حمّل نسخة أندرويد من منصة إسماعيل أحمد نجيب",
    home: "الرئيسية",
    description:
      "صفحة تحميل تطبيق منصة إسماعيل أحمد نجيب الدعوية لأجهزة أندرويد. التطبيق يفتح المنصة كتطبيق مستقل على هاتفك.",
    androidApp: "تطبيق أندرويد",
    betaNotice: "نسخة تجريبية",
    fileName: "اسم الملف",
    version: "الإصدار",
    fileSize: "حجم الملف",
    requirements: "المتطلبات",
    platform: "المنصة",
    downloadApk: "تحميل APK",
    directLink: "رابط التحميل المباشر",
    backHome: "العودة للرئيسية",
    noteTitle: "ملاحظات مهمة",
    note1: "هذا الملف لتطبيق أندرويد فقط، ولا يعمل على iPhone أو iPad.",
    note2: "بعد التحميل، قد يطلب منك الهاتف السماح بتثبيت التطبيقات من مصادر غير معروفة، وهذا طبيعي عند تثبيت APK خارج Google Play.",
    note3: "لو كان عندك نسخة قديمة مثبتة، يُفضّل حذفها أولًا ثم تثبيت النسخة الجديدة إذا ظهر خطأ في التوقيع.",
    note4: "هذه نسخة تجريبية، وقد يتم تحديثها بإذن الله بإصدارات أفضل.",
    installPwa: "تثبيت كتطبيق ويب (PWA)",
    installPwaDesc: "بدون تحميل - يعمل مباشرة من المتصفح",
    or: "أو",
    copyLink: "نسخ رابط التحميل",
    copied: "تم النسخ!",
    scanToDownload: "امسح الرمز للتحميل",
    installationSteps: "خطوات التثبيت",
    step1Title: "حمّل الملف",
    step1Desc: "اضغط على زر التحميل أعلاه لحفظ ملف APK على هاتفك.",
    step2Title: "افتح الملف",
    step2Desc: "اذهب إلى مجلد التنزيلات واضغط على ملف ismail-dawah.apk.",
    step3Title: "اسمح بالتثبيت",
    step3Desc: "إذا طلب الهاتف، اسمح بتثبيت التطبيقات من مصادر غير معروفة.",
    step4Title: "استمتع بالتطبيق",
    step4Desc: "افتح التطبيق من شاشتك الرئيسية واستمتع بكل المميزات.",
    features: "مميزات التطبيق",
    feature1: "تصفح كامل للمحتوى الإسلامي",
    feature2: "مواقيت الصلاة حسب موقعك",
    feature3: "الأذكار مع عداد تفاعلي",
    feature4: "اتجاه القبلة بدقة",
    feature5: "حاسبة الزكاة والميراث",
    feature6: "يعمل بدون إنترنت (PWA)",
    faqTitle: "أسئلة شائعة",
    faq1Q: "لماذا لا يوجد تطبيق على Google Play؟",
    faq1A: "التطبيق حالياً في مرحلة تجريبية، ونسعى لإضافته لـ Google Play قريباً بإذن الله.",
    faq2Q: "هل التطبيق آمن؟",
    faq2A: "نعم، التطبيق مفتوح المصدر وموقّع بمفتاح خاص، ولا يحتوي على أي برمجيات ضارة.",
    faq3Q: "لماذا لا يعمل على iPhone؟",
    faq3A: "Apple لا تسمح بتثبيت ملفات APK. يمكن لمستخدمي iPhone استخدام نسخة الويب كتطبيق (PWA).",
    faq4Q: "كم حجم الملف؟",
    faq4A: `حجم الملف حوالي ${FILE_SIZE} وهو خفيف جداً مقارنة بالتطبيقات الأخرى.`,
    onlyAndroid: "متوفر لأندرويد فقط",
    comingSoon: "قريباً",
  },
  en: {
    title: "Download App",
    subtitle: "Download the Android app for Ismail Ahmed Naguib Platform",
    home: "Home",
    description:
      "Download page for the Ismail Ahmed Naguib Dawah Platform Android app. The app opens the platform as a standalone application on your phone.",
    androidApp: "Android App",
    betaNotice: "Beta Version",
    fileName: "File name",
    version: "Version",
    fileSize: "File size",
    requirements: "Requirements",
    platform: "Platform",
    downloadApk: "Download APK",
    directLink: "Direct download link",
    backHome: "Back to Home",
    noteTitle: "Important notes",
    note1: "This file is for Android only and does not work on iPhone or iPad.",
    note2: "After downloading, your phone may ask you to allow installation from unknown sources. This is normal when installing an APK outside Google Play.",
    note3: "If you have an older version installed, it is recommended to remove it first and then install the new version if a signature error appears.",
    note4: "This is a beta version and may be updated with better releases, inshaAllah.",
    installPwa: "Install as Web App (PWA)",
    installPwaDesc: "No download needed - works directly from browser",
    or: "or",
    copyLink: "Copy download link",
    copied: "Copied!",
    scanToDownload: "Scan to download",
    installationSteps: "Installation Steps",
    step1Title: "Download the file",
    step1Desc: "Click the download button above to save the APK file to your phone.",
    step2Title: "Open the file",
    step2Desc: "Go to your Downloads folder and tap on ismail-dawah.apk.",
    step3Title: "Allow installation",
    step3Desc: "If prompted, allow installation from unknown sources on your phone.",
    step4Title: "Enjoy the app",
    step4Desc: "Open the app from your home screen and enjoy all features.",
    features: "App Features",
    feature1: "Full Islamic content browsing",
    feature2: "Prayer times based on your location",
    feature3: "Adhkar with interactive counter",
    feature4: "Accurate Qibla direction",
    feature5: "Zakat and inheritance calculators",
    feature6: "Works offline (PWA)",
    faqTitle: "Frequently Asked Questions",
    faq1Q: "Why isn't the app on Google Play?",
    faq1A: "The app is currently in beta. We aim to publish it on Google Play soon, inshaAllah.",
    faq2Q: "Is the app safe?",
    faq2A: "Yes, the app is signed with a private key and contains no malicious software.",
    faq3Q: "Why doesn't it work on iPhone?",
    faq3A: "Apple does not allow APK installation. iPhone users can use the Web App (PWA) version.",
    faq4Q: "How large is the file?",
    faq4A: `The file size is about ${FILE_SIZE}, which is very light compared to other apps.`,
    onlyAndroid: "Available for Android only",
    comingSoon: "Coming soon",
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
      canonical: `/${l}/download`,
      languages: {
        ar: "/ar/download",
        en: "/en/download",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/download`,
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
    robots: {
      index: true,
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

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isRTL ? "منصة إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib Platform",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Islamic",
    operatingSystem: "Android 8.0+",
    softwareVersion: VERSION,
    downloadUrl: DIRECT_APK_URL,
    fileFormat: "application/vnd.android.package-archive",
    fileSize: FILE_SIZE,
    description: ui.description,
    inLanguage: l,
    author: {
      "@type": "Person",
      name: isRTL ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
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
      {
        "@type": "Question",
        name: ui.faq4Q,
        acceptedAnswer: { "@type": "Answer", text: ui.faq4A },
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
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
        {/* ===== الترويسة ===== */}
        <div className="card relative mb-10 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
              <span className="badge-primary">📱 {ui.androidApp}</span>
              <span className="badge-gold">🧪 {ui.betaNotice}</span>
            </div>

            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
                  <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <h1
              className="mb-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>
          </div>
        </div>

        {/* ===== بطاقات المعلومات + زر التحميل ===== */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* عمود التحميل الرئيسي */}
          <div className="md:col-span-2">
            <div className="card p-6 md:p-8">
              <h2 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
                📊 {isRTL ? "معلومات الملف" : "File Information"}
              </h2>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <InfoCard label={ui.fileName} value={FILE_NAME} icon="📄" />
                <InfoCard label={ui.version} value={VERSION} icon="🏷️" />
                <InfoCard label={ui.fileSize} value={FILE_SIZE} icon="💾" />
                <InfoCard label={ui.requirements} value={REQUIREMENTS} icon="⚙️" />
              </div>

              {/* زر التحميل الرئيسي */}
              <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-6 dark:from-primary-900/20 dark:to-primary-900/10">
                <a
                  href={PROXY_DOWNLOAD_URL}
                  download={FILE_NAME}
                  className="btn-primary w-full justify-center gap-2 !py-4 text-lg"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  ⬇️ {ui.downloadApk}
                </a>

                <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
                  🤖 {ui.onlyAndroid}
                </p>
              </div>

              {/* الفاصل */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-night-700" />
                <span className="text-xs font-bold text-slate-400">{ui.or}</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-night-700" />
              </div>

              {/* خيار PWA */}
              <Link
                href={`/${l}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-600 dark:hover:bg-night-700"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
                  🌐
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white">
                    {ui.installPwa}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    {ui.installPwaDesc}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* عمود QR + رابط مباشر */}
          <div className="md:col-span-1">
            <div className="card flex h-full flex-col p-6">
              <h2 className="mb-4 text-center text-lg font-black text-slate-900 dark:text-white">
                📱 {ui.scanToDownload}
              </h2>

              {/* QR Code */}
              <div className="mb-5 flex justify-center">
                <div className="rounded-2xl border-4 border-white bg-white p-4 shadow-xl dark:border-night-700">
                  <QRCode value={DIRECT_APK_URL} />
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(DIRECT_APK_URL);
                      alert(ui.copied);
                    }
                  }}
                  className="btn-outline w-full justify-center gap-2"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {ui.copyLink}
                </button>

                <a
                  href={DIRECT_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700"
                >
                  🔗 {ui.directLink}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===== خطوات التثبيت ===== */}
        <div className="mt-10">
          <h2
            className="mb-8 text-center text-3xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🛠️ {ui.installationSteps}
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              step={1}
              title={ui.step1Title}
              description={ui.step1Desc}
              icon="⬇️"
            />
            <StepCard
              step={2}
              title={ui.step2Title}
              description={ui.step2Desc}
              icon="📂"
            />
            <StepCard
              step={3}
              title={ui.step3Title}
              description={ui.step3Desc}
              icon="🔓"
            />
            <StepCard
              step={4}
              title={ui.step4Title}
              description={ui.step4Desc}
              icon="✨"
            />
          </div>
        </div>

        {/* ===== مميزات التطبيق ===== */}
        <div className="mt-12">
          <h2
            className="mb-8 text-center text-3xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            ✨ {ui.features}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon="📖" title={ui.feature1} />
            <FeatureCard icon="🕐" title={ui.feature2} />
            <FeatureCard icon="📿" title={ui.feature3} />
            <FeatureCard icon="🧭" title={ui.feature4} />
            <FeatureCard icon="💰" title={ui.feature5} />
            <FeatureCard icon="📴" title={ui.feature6} />
          </div>
        </div>

        {/* ===== ملاحظات مهمة ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <h2
            className="mb-5 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3, ui.note4].map((note, index) => (
              <li
                key={`note-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== الأسئلة الشائعة ===== */}
        <div className="mt-10">
          <h2
            className="mb-8 text-center text-3xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            ❓ {ui.faqTitle}
          </h2>

          <div className="space-y-4">
            <FaqItem question={ui.faq1Q} answer={ui.faq1A} />
            <FaqItem question={ui.faq2Q} answer={ui.faq2A} />
            <FaqItem question={ui.faq3Q} answer={ui.faq3A} />
            <FaqItem question={ui.faq4Q} answer={ui.faq4A} />
          </div>
        </div>

        {/* ===== زر العودة ===== */}
        <div className="mt-10 flex justify-center">
          <Link href={`/${l}`} className="btn-outline gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRTL ? "" : "rotate-180"}
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {ui.backHome}
          </Link>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// المكونات المساعدة
// ============================================================

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className="break-all text-lg font-black text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: string;
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

function FeatureCard({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="card card-interactive flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
        {icon}
      </span>
      <p className="font-bold text-slate-900 dark:text-white">{title}</p>
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

// QR Code component (SVG مدمج بسيط)
function QRCode({ value }: { value: string }) {
  // نمط QR بسيط ثابت يمثل رابط التحميل
  // في الإنتاج يمكن استخدام مكتبة مثل qrcode.react
  const size = 160;
  const cells = [
    // زوايا QR (positioning patterns)
    "M0,0 h40 v40 h-40 z M5,5 h30 v30 h-30 z M10,10 h20 v20 h-20 z",
    "M120,0 h40 v40 h-40 z M125,5 h30 v30 h-30 z M130,10 h20 v20 h-20 z",
    "M0,120 h40 v40 h-40 z M5,125 h30 v30 h-30 z M10,130 h20 v20 h-20 z",
    // نقاط البيانات (نمط عشوائي يمثل البيانات)
    "M50,5 h10 v10 h-10 z M70,5 h10 v10 h-10 z M90,5 h10 v10 h-10 z",
    "M50,20 h10 v10 h-10 z M60,20 h10 v10 h-10 z M80,20 h10 v10 h-10 z",
    "M50,35 h10 v10 h-10 z M70,35 h10 v10 h-10 z M90,35 h10 v10 h-10 z",
    "M5,50 h10 v10 h-10 z M20,50 h10 v10 h-10 z M35,50 h10 v10 h-10 z",
    "M50,50 h10 v10 h-10 z M60,50 h10 v10 h-10 z M70,50 h10 v10 h-10 z",
    "M85,50 h10 v10 h-10 z M100,50 h10 v10 h-10 z M115,50 h10 v10 h-10 z",
    "M130,50 h10 v10 h-10 z M145,50 h10 v10 h-10 z",
    "M5,65 h10 v10 h-10 z M25,65 h10 v10 h-10 z M40,65 h10 v10 h-10 z",
    "M55,65 h10 v10 h-10 z M75,65 h10 v10 h-10 z M95,65 h10 v10 h-10 z",
    "M110,65 h10 v10 h-10 z M125,65 h10 v10 h-10 z M140,65 h10 v10 h-10 z",
    "M5,80 h10 v10 h-10 z M15,80 h10 v10 h-10 z M30,80 h10 v10 h-10 z",
    "M50,80 h10 v10 h-10 z M65,80 h10 v10 h-10 z M80,80 h10 v10 h-10 z",
    "M95,80 h10 v10 h-10 z M115,80 h10 v10 h-10 z M130,80 h10 v10 h-10 z",
    "M5,95 h10 v10 h-10 z M20,95 h10 v10 h-10 z M40,95 h10 v10 h-10 z",
    "M55,95 h10 v10 h-10 z M70,95 h10 v10 h-10 z M85,95 h10 v10 h-10 z",
    "M105,95 h10 v10 h-10 z M120,95 h10 v10 h-10 z M145,95 h10 v10 h-10 z",
    "M5,110 h10 v10 h-10 z M25,110 h10 v10 h-10 z M35,110 h10 v10 h-10 z",
    "M50,110 h10 v10 h-10 z M70,110 h10 v10 h-10 z M90,110 h10 v10 h-10 z",
    "M110,110 h10 v10 h-10 z M130,110 h10 v10 h-10 z M140,110 h10 v10 h-10 z",
    "M50,130 h10 v10 h-10 z M60,130 h10 v10 h-10 z M80,130 h10 v10 h-10 z",
    "M100,130 h10 v10 h-10 z M120,130 h10 v10 h-10 z M140,130 h10 v10 h-10 z",
    "M50,145 h10 v10 h-10 z M75,145 h10 v10 h-10 z M95,145 h10 v10 h-10 z",
    "M110,145 h10 v10 h-10 z M130,145 h10 v10 h-10 z M145,145 h10 v10 h-10 z",
  ].join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className="block"
      role="img"
      aria-label="QR Code for download"
    >
      <rect width="160" height="160" fill="white" />
      <path d={cells} fill="black" />
      {/* أيقونة المنصة في المنتصف */}
      <circle cx="80" cy="80" r="14" fill="white" />
      <circle
        cx="80"
        cy="80"
        r="12"
        fill="#0e7490"
      />
      <circle cx="85" cy="76" r="2" fill="#d4af37" />
    </svg>
  );
}