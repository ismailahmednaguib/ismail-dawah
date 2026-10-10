// app/[lang]/qibla/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QiblaContent from "./qibla-content";

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
  hadith: string;
  hadithSource: string;
  introTitle: string;
  introDesc: string;
  statsAccurate: string;
  statsRealtime: string;
  statsGlobal: string;
  statsFree: string;
  relatedTitle: string;
  prayerTimesPage: string;
  prayerTimesPageDesc: string;
  prayerGuidePage: string;
  prayerGuidePageDesc: string;
  mapPage: string;
  mapPageDesc: string;
  hajjPage: string;
  hajjPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
};

const UI: Record<Lang, PageUI> = {
  ar: {
    title: "اتجاه القبلة",
    subtitle: "بوصلة دقيقة لتحديد اتجاه الكعبة المشرفة",
    home: "الرئيسية",
    description:
      "أداة بوصلة القبلة لمنصة إسماعيل أحمد نجيب. تحدد اتجاه الكعبة المشرفة بدقة من موقعك الحالي باستخدام حسابات الدائرة الكبرى، مع دعم الإدخال اليدوي والإشعارات.",
    verse: "﴿ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ﴾",
    verseSource: "سورة البقرة — الآية 144",
    hadith: "مَا بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ قِبْلَةٌ",
    hadithSource: "رواه الترمذي",
    introTitle: "لماذا بوصلة القبلة؟",
    introDesc:
      "استقبال القبلة شرط لصحة الصلاة عند جمهور العلماء. هذه البوصلة تستخدم معادلات رياضية دقيقة (Great Circle) لحساب أقصر مسار من موقعك إلى الكعبة المشرفة، مع دعم البوصلة المغناطيسية في الأجهزة المتوافقة، والإدخال اليدوي للإحداثيات.",
    statsAccurate: "حساب دقيق",
    statsRealtime: "بوصلة حية",
    statsGlobal: "عالمي",
    statsFree: "مجاني 100%",
    relatedTitle: "صفحات ذات صلة",
    prayerTimesPage: "مواقيت الصلاة",
    prayerTimesPageDesc: "أوقات الصلاة في موقعك.",
    prayerGuidePage: "دليل الصلاة",
    prayerGuidePageDesc: "تعلم الصلاة خطوة بخطوة.",
    mapPage: "خريطة المساجد",
    mapPageDesc: "أقرب المساجد لموقعك.",
    hajjPage: "دليل الحج والعمرة",
    hajjPageDesc: "مناسك البيت الحرام.",
    noteTitle: "تنبيهات مهمة",
    note1: "تأكد من معايرة البوصلة بتحريك الجهاز بشكل رقم 8 قبل الاستخدام للحصول على دقة أعلى.",
    note2: "قد تتأثر البوصلة المغناطيسية بالأجهزة الإلكترونية والمعادن القريبة، فابتعد عنها عند تحديد القبلة.",
    note3: "في حالة السفر بالطائرة أو القطار، يُستحب استقبال القبلة عند الإمكان، ويسقط الاستقبال عند التعذر.",
  },
  en: {
    title: "Qibla Direction",
    subtitle: "Accurate compass to locate the Holy Kaaba",
    home: "Home",
    description:
      "Qibla compass tool of the Ismail Ahmed Naguib Platform. Accurately determines the direction to the Holy Kaaba from your current location using Great Circle calculations, with manual input support and device compass integration.",
    verse: "\"So turn your face toward al-Masjid al-Haram.\"",
    verseSource: "Surah Al-Baqarah — Verse 144",
    hadith: "Whatever is between the east and the west is Qiblah.",
    hadithSource: "Narrated by At-Tirmidhi",
    introTitle: "Why Qibla Compass?",
    introDesc:
      "Facing the Qiblah is a condition for valid prayer according to the majority of scholars. This compass uses precise mathematical formulas (Great Circle) to calculate the shortest path from your location to the Holy Kaaba, with support for device magnetometer and manual coordinate input.",
    statsAccurate: "Accurate",
    statsRealtime: "Live Compass",
    statsGlobal: "Worldwide",
    statsFree: "100% Free",
    relatedTitle: "Related Pages",
    prayerTimesPage: "Prayer Times",
    prayerTimesPageDesc: "Prayer times at your location.",
    prayerGuidePage: "Prayer Guide",
    prayerGuidePageDesc: "Learn prayer step by step.",
    mapPage: "Mosques Map",
    mapPageDesc: "Nearest mosques to you.",
    hajjPage: "Hajj & Umrah Guide",
    hajjPageDesc: "Rites of the Holy House.",
    noteTitle: "Important Notices",
    note1: "Calibrate the compass by moving your device in a figure-8 pattern before use for higher accuracy.",
    note2: "The magnetic compass can be affected by nearby electronics and metals; move away from them when determining Qibla.",
    note3: "When traveling by plane or train, facing Qibla is recommended when possible and waived when impossible.",
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
      canonical: `/${l}/qibla`,
      languages: {
        ar: "/ar/qibla",
        en: "/en/qibla",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/qibla`,
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

export default async function QiblaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

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
        url: `/${l}/qibla`,
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
              ? "كيف تعمل بوصلة القبلة؟"
              : "How does the Qibla compass work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "تستخدم البوصلة معادلات الدائرة الكبرى لحساب أقصر مسار من موقعك إلى الكعبة المشرفة، مع دعم البوصلة المغناطيسية في الأجهزة المتوافقة."
                : "The compass uses Great Circle formulas to calculate the shortest path from your location to the Holy Kaaba, with magnetometer support on compatible devices.",
            },
          },
          {
            "@type": "Question",
            name: isRTL
              ? "هل البوصلة دقيقة؟"
              : "Is the compass accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نعم، الحسابات الرياضية دقيقة جداً. لكن البوصلة المغناطيسية قد تتأثر بالأجهزة الإلكترونية، فننصح بمعايرتها قبل الاستخدام."
                : "Yes, the mathematical calculations are very accurate. However, the magnetic compass can be affected by electronics, so we recommend calibrating it before use.",
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

      <section className="container-page pt-10 md:pt-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 p-8 md:p-12 dark:border-gold-800">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          {/* نمط زخرفي */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)",
              backgroundSize: "80px 80px, 100px 100px",
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🧭 {isRTL ? "بوصلة القبلة" : "Qibla Compass"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-white md:text-5xl"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-200">
              {ui.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-500/30 bg-white/10 p-5 shadow-sm backdrop-blur-sm">
              <p
                className="mb-2 text-xl font-black text-gold-400 md:text-2xl"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-500/80">
                {ui.verseSource}
              </p>
            </div>

            {/* حديث شريف */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p
                className="mb-1 text-base font-black text-slate-200 md:text-lg"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.hadith}»
              </p>
              <p className="text-xs text-slate-400">📜 {ui.hadithSource}</p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="🎯" label={ui.statsAccurate} color="primary" />
          <StatCard icon="⚡" label={ui.statsRealtime} color="gold" />
          <StatCard icon="🌍" label={ui.statsGlobal} color="primary" />
          <StatCard icon="✨" label={ui.statsFree} color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.introTitle}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>
      </section>

      {/* ===== المحتوى التفاعلي ===== */}
      <QiblaContent lang={l} />

      {/* ===== صفحات ذات صلة + تنبيهات ===== */}
      <section className="container-page pb-10 md:pb-14">
        {/* صفحات ذات صلة */}
        <div className="mb-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/prayer-times`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕐</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerTimesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerTimesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/prayer-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕌</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerGuidePage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerGuidePageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/map`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🗺️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.mapPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.mapPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/hajj-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕋</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.hajjPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.hajjPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* تنبيهات */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h3
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h3>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note3}</span>
                </li>
              </ul>
            </div>
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