// app/[lang]/adhkar/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdhkarContent from "./adhkar-content";

// ============================================================
// Metadata
// ============================================================

const META: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    verse: string;
    verseSource: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    sectionsCount: string;
    adhkarCount: string;
    interactive: string;
  }
> = {
  ar: {
    title: "الأذكار",
    subtitle: "أذكار الصباح والمساء والنوم وبعد الصلاة",
    home: "الرئيسية",
    description:
      "مجموعة مختارة من الأذكار الصحيحة من السنة النبوية، مع عدّاد تفاعلي لحفظ وردك اليومي.",
    verse: "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾",
    verseSource: "سورة الرعد — الآية 28",
    feature1Title: "صحيحة من السنة",
    feature1Desc: "أذكار مختارة من أحاديث صحيحة ثابتة عن النبي ﷺ.",
    feature2Title: "عدّاد تفاعلي",
    feature2Desc: "اضغط على الذكر للعد مع اهتزاز وصوت تفاعلي.",
    feature3Title: "حفظ تلقائي",
    feature3Desc: "يُحفظ تقدمك على جهازك ويُعاد تعيينه يومياً.",
    sectionsCount: "4 أقسام",
    adhkarCount: "120+ ذكر",
    interactive: "تجربة تفاعلية",
  },
  en: {
    title: "Adhkar",
    subtitle: "Morning, evening, sleep and after-prayer remembrances",
    home: "Home",
    description:
      "A curated collection of authentic adhkar from the Sunnah, with an interactive counter for your daily remembrance routine.",
    verse: "\"Verily, in the remembrance of Allah do hearts find rest.\"",
    verseSource: "Surah Ar-Ra'd — Verse 28",
    feature1Title: "Authentic from Sunnah",
    feature1Desc: "Adhkar selected from authentic hadiths of the Prophet ﷺ.",
    feature2Title: "Interactive Counter",
    feature2Desc: "Tap the dhikr to count with interactive vibration and sound.",
    feature3Title: "Auto-save",
    feature3Desc: "Your progress is saved locally and resets daily.",
    sectionsCount: "4 Sections",
    adhkarCount: "120+ Adhkar",
    interactive: "Interactive",
  },
};

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
  const m = META[l];

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `/${l}/adhkar`,
      languages: {
        ar: "/ar/adhkar",
        en: "/en/adhkar",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/adhkar`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: m.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
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

export default async function AdhkarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const m = META[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: m.title,
    description: m.description,
    inLanguage: l,
    url: `/${l}/adhkar`,
    isPartOf: {
      "@type": "WebSite",
      name: isRTL ? "منصة إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib Platform",
      url: `/${l}`,
    },
    about: {
      "@type": "Thing",
      name: isRTL ? "الأذكار الإسلامية" : "Islamic Adhkar",
      description: m.description,
    },
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={m.title}
        subtitle={m.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: m.home, href: `/${l}` },
          { label: m.title },
        ]}
      />

      <section className="container-page pt-10 md:pt-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">🤲 {m.title}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {m.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {m.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {m.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {m.verseSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                📂
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {m.sectionsCount}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? "أقسام" : "Sections"}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                📿
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {m.adhkarCount}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? "ذكر" : "Adhkar"}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                ✨
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {m.interactive}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? "تجربة" : "Experience"}
            </p>
          </div>
        </div>

        {/* ===== مميزات الصفحة ===== */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon="📖"
            title={m.feature1Title}
            description={m.feature1Desc}
          />
          <FeatureCard
            icon="👆"
            title={m.feature2Title}
            description={m.feature2Desc}
          />
          <FeatureCard
            icon="💾"
            title={m.feature3Title}
            description={m.feature3Desc}
          />
        </div>
      </section>

      {/* ===== المحتوى التفاعلي ===== */}
      <AdhkarContent lang={l} />

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون مساعد: FeatureCard
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
    <div className="card relative overflow-hidden p-5">
      <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

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