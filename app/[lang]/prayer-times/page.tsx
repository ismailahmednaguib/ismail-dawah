// app/[lang]/prayer-times/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrayerTimesContent from "./prayer-times-content";

// ============================================================
// نصوص الواجهة
// ============================================================

type PageUI = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  verse: string;
  verseSource: string;
  prayersCount: string;
  geoLocation: string;
  accurateCalc: string;
  freeAlways: string;
  introTitle: string;
  introDesc: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  relatedTitle: string;
  prayerGuidePage: string;
  prayerGuidePageDesc: string;
  qiblaPage: string;
  qiblaPageDesc: string;
  adhkarPage: string;
  adhkarPageDesc: string;
  quranPage: string;
  quranPageDesc: string;
};

const UI: Record<Lang, PageUI> = {
  ar: {
    title: "مواقيت الصلاة",
    subtitle: "اعرف مواقيت الصلاة حسب موقعك الحالي",
    home: "الرئيسية",
    description:
      "صفحة مواقيت الصلاة اليومية: الفجر، الشروق، الظهر، العصر، المغرب، والعشاء، مع تحديد الوقت المتبقي للصلاة القادمة حسب موقعك الجغرافي.",
    verse: "﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾",
    verseSource: "سورة النساء — الآية 103",
    prayersCount: "5 صلوات",
    geoLocation: "تحديد موقع",
    accurateCalc: "حساب دقيق",
    freeAlways: "مجاني دائماً",
    introTitle: "لماذا مواقيت الصلاة؟",
    introDesc:
      "الصلاة عمود الدين، وأول ما يُحاسب عليه العبد يوم القيامة. هذه الأداة تساعدك على معرفة أوقات الصلاة بدقة حسب موقعك الجغرافي، مع دعم لطرق الحساب المختلفة، وتنبيهات ذكية لاقتراب وقت الصلاة.",
    feature1Title: "تحديد تلقائي للموقع",
    feature1Desc: "يحدد موقعك تلقائياً عبر GPS أو يمكنك إدخاله يدوياً.",
    feature2Title: "طرق حساب متعددة",
    feature2Desc: "اختر من 6 طرق حساب: أم القرى، المصرية، ISNA، وغيرها.",
    feature3Title: "عد تنازلي ذكي",
    feature3Desc: "يعرض الوقت المتبقي للصلاة القادمة بدقة.",
    feature4Title: "تنبيهات صوتية",
    feature4Desc: "تنبيهات قبل الصلاة بفترة تختارها أنت.",
    relatedTitle: "صفحات ذات صلة",
    prayerGuidePage: "دليل الصلاة",
    prayerGuidePageDesc: "تعلم الصلاة خطوة بخطوة.",
    qiblaPage: "اتجاه القبلة",
    qiblaPageDesc: "بوصلة القبلة الدقيقة.",
    adhkarPage: "الأذكار",
    adhkarPageDesc: "أذكار ما بعد الصلاة.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع لكتاب الله.",
  },
  en: {
    title: "Prayer Times",
    subtitle: "Get daily prayer times based on your location",
    home: "Home",
    description:
      "Daily Islamic prayer times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha, with countdown to the next prayer based on your geographic location.",
    verse: "\"Indeed, prayer has been decreed upon the believers a decree of specified times.\"",
    verseSource: "Surah An-Nisa — Verse 103",
    prayersCount: "5 Prayers",
    geoLocation: "Geo-location",
    accurateCalc: "Accurate Calc",
    freeAlways: "Always Free",
    introTitle: "Why Prayer Times?",
    introDesc:
      "Prayer is the pillar of religion and the first deed to be accounted for on the Day of Resurrection. This tool helps you know prayer times accurately based on your geographic location, with support for various calculation methods and smart alerts for approaching prayer times.",
    feature1Title: "Automatic Location Detection",
    feature1Desc: "Detects your location automatically via GPS or manual input.",
    feature2Title: "Multiple Calculation Methods",
    feature2Desc: "Choose from 6 methods: Umm al-Qura, Egyptian, ISNA, and more.",
    feature3Title: "Smart Countdown",
    feature3Desc: "Displays time remaining until next prayer accurately.",
    feature4Title: "Sound Alerts",
    feature4Desc: "Alerts before prayer by a duration you choose.",
    relatedTitle: "Related Pages",
    prayerGuidePage: "Prayer Guide",
    prayerGuidePageDesc: "Learn prayer step by step.",
    qiblaPage: "Qibla Direction",
    qiblaPageDesc: "Accurate Qibla compass.",
    adhkarPage: "Adhkar",
    adhkarPageDesc: "Post-prayer remembrances.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to Allah's Book.",
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
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/prayer-times`,
      languages: {
        ar: "/ar/prayer-times",
        en: "/en/prayer-times",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/prayer-times`,
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

export default async function PrayerTimesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: ui.title,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description: ui.description,
        inLanguage: l,
        url: `/${l}/prayer-times`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: isRTL
              ? "كيف أحسب مواقيت الصلاة بدقة؟"
              : "How to calculate prayer times accurately?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نستخدم طريقة الهيئة المصرية العامة للمساحة افتراضياً، مع إمكانية اختيار طريقة أخرى حسب بلدك."
                : "We use the Egyptian General Authority method by default, with the option to choose another method based on your country.",
            },
          },
          {
            "@type": "Question",
            name: isRTL
              ? "هل يمكن استخدام الموقع بدون إنترنت؟"
              : "Can I use it offline?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "يحتاج الموقع اتصالاً بالإنترنت لجلب المواقيت من API، لكن النتائج تُخزن مؤقتاً للعمل جزئياً بدون اتصال."
                : "The site needs internet to fetch times from API, but results are cached to work partially offline.",
            },
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

      {/* ===== Hero محسّن ===== */}
      <section className="container-page pt-10 md:pt-14">
        <div className="card relative mb-8 overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-primary-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🕐 {isRTL ? "مواقيت دقيقة" : "Accurate Times"}
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
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
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
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="🕌" label={ui.prayersCount} color="primary" />
          <StatCard icon="📍" label={ui.geoLocation} color="gold" />
          <StatCard icon="🎯" label={ui.accurateCalc} color="primary" />
          <StatCard icon="✨" label={ui.freeAlways} color="gold" />
        </div>

        {/* ===== مقدمة + مميزات ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.introTitle}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon="📍"
                title={ui.feature1Title}
                description={ui.feature1Desc}
              />
              <FeatureCard
                icon="⚙️"
                title={ui.feature2Title}
                description={ui.feature2Desc}
              />
              <FeatureCard
                icon="⏱️"
                title={ui.feature3Title}
                description={ui.feature3Desc}
              />
              <FeatureCard
                icon="🔔"
                title={ui.feature4Title}
                description={ui.feature4Desc}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== المحتوى التفاعلي ===== */}
      <PrayerTimesContent lang={l} />

      {/* ===== صفحات ذات صلة ===== */}
      <section className="container-page pb-10 md:pb-14">
        <div className="mt-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${l}/prayer-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🕌
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerGuidePage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerGuidePageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/qibla`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🧭
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.qiblaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.qiblaPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/adhkar`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🤲
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.adhkarPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.adhkarPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/quran`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📖
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.quranPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.quranPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: "primary" | "gold";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-base font-black ${colorClasses[color]}`}>{label}</p>
    </div>
  );
}

// ============================================================
// مكون FeatureCard
// ============================================================

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
        <h3
          className="text-base font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}