// app/[lang]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string };

type QuickTool = {
  href: string;
  icon: string;
  title: Localized;
  color: "primary" | "gold";
};

type SectionItem = {
  href: string;
  icon: string;
  title: Localized;
  desc: Localized;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
  {
    // Hero
    badge: string;
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    // Stats
    statSections: string;
    statLanguages: string;
    statSurahs: string;
    statFree: string;
    // Sections
    learnTitle: string;
    learnSubtitle: string;
    responsesTitle: string;
    responsesSubtitle: string;
    dawahTitle: string;
    dawahSubtitle: string;
    // Verse
    verseLabel: string;
    verseText: string;
    verseSource: string;
    // Download
    downloadBadge: string;
    downloadTitle: string;
    downloadDesc: string;
    downloadBtn: string;
    downloadPage: string;
    // Newsletter
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    newsletterBtn: string;
    newsletterNote: string;
    // CTA
    ctaTitle: string;
    ctaDesc: string;
    ctaRegister: string;
    ctaAbout: string;
    // Meta
    metaTitle: string;
    metaDesc: string;
    // Misc
    explore: string;
    live: string;
  }
> = {
  ar: {
    badge: "✨ منصة دعوية شاملة",
    title: "منصة إسماعيل أحمد نجيب",
    subtitle:
      "منصة إسلامية شاملة تجمع القرآن الكريم، والأذكار، والفتاوى، وقصص الأنبياء، ومواقيت الصلاة، واتجاه القبلة، وأدوات الدعوة في مكان واحد.",
    cta1: "ابدأ رحلة العلم",
    cta2: "البث المباشر",
    statSections: "قسم ومحتوى",
    statLanguages: "لغتان",
    statSurahs: "سورة قرآنية",
    statFree: "مجاني بالكامل",
    learnTitle: "تعلّم العلوم الشرعية",
    learnSubtitle: "ابدأ بأساسيات الدين وتدرّج في طلب العلم الشرعي",
    responsesTitle: "العلوم والردود",
    responsesSubtitle: "ردود على الشبهات وقضايا معاصرة بمنهج شرعي معتدل",
    dawahTitle: "الدعوة والتوعية",
    dawahSubtitle: "أدوات ومواد دعوية لنشر العلم الشرعي",
    verseLabel: "آية اليوم",
    verseText: "﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ﴾",
    verseSource: "سورة العلق — الآيات 1-2",
    downloadBadge: "📱 تطبيق أندرويد",
    downloadTitle: "حمّل التطبيق الآن",
    downloadDesc:
      "افتح منصة إسماعيل أحمد نجيب كتطبيق مستقل على هاتفك الأندرويد بدون الحاجة لفتح المتصفح.",
    downloadBtn: "تحميل APK مباشرة",
    downloadPage: "صفحة التحميل",
    newsletterTitle: "اشترك في النشرة البريدية",
    newsletterDesc:
      "احصل على جديد المحتوى الدعوي والدروس والفتاوى مباشرة إلى بريدك الإلكتروني.",
    newsletterPlaceholder: "بريدك الإلكتروني",
    newsletterBtn: "اشترك الآن",
    newsletterNote: "لن نشارك بريدك مع أي طرف ثالث، ويمكنك الإلغاء في أي وقت.",
    ctaTitle: "ابدأ رحلتك الإيمانية اليوم",
    ctaDesc: "انضم إلى آلاف المسلمين الذين يستخدمون المنصة يومياً للتعلم والتذكير.",
    ctaRegister: "إنشاء حساب مجاني",
    ctaAbout: "تعرّف علينا",
    metaTitle: "منصة إسماعيل أحمد نجيب الدعوية",
    metaDesc:
      "منصة إسلامية شاملة للقرآن، الأذكار، الفتاوى، مواقيت الصلاة، القبلة، وأدوات الدعوة. بالعربية والإنجليزية.",
    explore: "استكشف",
    live: "مباشر",
  },
  en: {
    badge: "✨ Comprehensive Dawah Platform",
    title: "Ismail Ahmed Naguib Platform",
    subtitle:
      "A comprehensive Islamic platform that brings together the Holy Quran, adhkar, fatwas, prophets' stories, prayer times, Qibla direction, and dawah tools in one place.",
    cta1: "Start Learning",
    cta2: "Live Stream",
    statSections: "Sections & Content",
    statLanguages: "Languages",
    statSurahs: "Quran Surahs",
    statFree: "100% Free",
    learnTitle: "Learn Islamic Sciences",
    learnSubtitle: "Start with the fundamentals and progress in seeking Islamic knowledge",
    responsesTitle: "Knowledge & Responses",
    responsesSubtitle: "Responses to doubts and contemporary issues with balanced Islamic methodology",
    dawahTitle: "Dawah & Awareness",
    dawahSubtitle: "Tools and materials for spreading authentic Islamic knowledge",
    verseLabel: "Verse of the Day",
    verseText: "\"Read in the name of your Lord who created — Created man from a clinging substance.\"",
    verseSource: "Surah Al-Alaq — Verses 1-2",
    downloadBadge: "📱 Android App",
    downloadTitle: "Download the App Now",
    downloadDesc:
      "Open the Ismail Ahmed Naguib platform as a standalone app on your Android phone without needing a browser.",
    downloadBtn: "Download APK Direct",
    downloadPage: "Download Page",
    newsletterTitle: "Subscribe to Our Newsletter",
    newsletterDesc:
      "Get the latest dawah content, lessons, and fatwas directly to your email inbox.",
    newsletterPlaceholder: "Your email address",
    newsletterBtn: "Subscribe Now",
    newsletterNote: "We will never share your email with third parties, and you can unsubscribe anytime.",
    ctaTitle: "Start Your Faith Journey Today",
    ctaDesc: "Join thousands of Muslims who use the platform daily for learning and remembrance.",
    ctaRegister: "Create Free Account",
    ctaAbout: "About Us",
    metaTitle: "Ismail Ahmed Naguib Dawah Platform",
    metaDesc:
      "A comprehensive Islamic platform for Quran, adhkar, fatwas, prayer times, Qibla, and dawah tools. In Arabic and English.",
    explore: "Explore",
    live: "Live",
  },
};

// ============================================================
// الأدوات السريعة
// ============================================================

const QUICK_TOOLS: QuickTool[] = [
  { href: "/quran", icon: "📖", title: { ar: "القرآن", en: "Quran" }, color: "primary" },
  { href: "/adhkar", icon: "🤲", title: { ar: "الأذكار", en: "Adhkar" }, color: "gold" },
  { href: "/prayer-times", icon: "🕐", title: { ar: "المواقيت", en: "Prayer Times" }, color: "primary" },
  { href: "/qibla", icon: "🧭", title: { ar: "القبلة", en: "Qibla" }, color: "gold" },
  { href: "/tasbih", icon: "📿", title: { ar: "المسبحة", en: "Tasbih" }, color: "primary" },
  { href: "/calendar", icon: "📅", title: { ar: "التقويم", en: "Calendar" }, color: "gold" },
  { href: "/fatwa", icon: "⚖️", title: { ar: "الفتاوى", en: "Fatwas" }, color: "primary" },
  { href: "/ruqyah", icon: "🛡️", title: { ar: "الرقية", en: "Ruqyah" }, color: "gold" },
];

// ============================================================
// قسم تعلّم
// ============================================================

const LEARN_ITEMS: SectionItem[] = [
  {
    href: "/prayer-guide",
    icon: "🕌",
    title: { ar: "دليل الصلاة", en: "Prayer Guide" },
    desc: { ar: "تعلم الصلاة خطوة بخطوة", en: "Learn prayer step by step" },
  },
  {
    href: "/hajj-guide",
    icon: "🕋",
    title: { ar: "دليل الحج والعمرة", en: "Hajj & Umrah Guide" },
    desc: { ar: "مناسك الحج والعمرة", en: "Rites of Hajj and Umrah" },
  },
  {
    href: "/zakat",
    icon: "💰",
    title: { ar: "حاسبة الزكاة", en: "Zakat Calculator" },
    desc: { ar: "احسب زكاة مالك", en: "Calculate your zakat" },
  },
  {
    href: "/inheritance",
    icon: "📜",
    title: { ar: "حاسبة الميراث", en: "Inheritance Calculator" },
    desc: { ar: "قسّم التركة شرعياً", en: "Distribute estate by Sharia" },
  },
  {
    href: "/prophets-stories",
    icon: "📚",
    title: { ar: "قصص الأنبياء", en: "Prophets Stories" },
    desc: { ar: "عبر ودروس من سير الأنبياء", en: "Lessons from prophets' lives" },
  },
  {
    href: "/quran-memorization",
    icon: "🎯",
    title: { ar: "خطة حفظ القرآن", en: "Quran Memorization" },
    desc: { ar: "نظّم وردك اليومي", en: "Organize your daily portion" },
  },
];

// ============================================================
// قسم الردود
// ============================================================

const RESPONSE_ITEMS: SectionItem[] = [
  {
    href: "/atheism-response",
    icon: "🧠",
    title: { ar: "الرد على الإلحاد", en: "Responding to Atheism" },
    desc: { ar: "الرد على الشبهات الإلحادية", en: "Answering atheist doubts" },
  },
  {
    href: "/doubts",
    icon: "❓",
    title: { ar: "الشبهات والردود", en: "Doubts & Responses" },
    desc: { ar: "شبهات شائعة وإجاباتها", en: "Common doubts and answers" },
  },
  {
    href: "/youth-issues",
    icon: "👥",
    title: { ar: "قضايا الشباب", en: "Youth Issues" },
    desc: { ar: "حلول إسلامية لمشاكل الشباب", en: "Islamic solutions for youth" },
  },
  {
    href: "/women-fatwas",
    icon: "🧕",
    title: { ar: "فتاوى المرأة", en: "Women's Fatwas" },
    desc: { ar: "أحكام خاصة بالمرأة المسلمة", en: "Rulings for Muslim women" },
  },
  {
    href: "/embrace-islam",
    icon: "🌱",
    title: { ar: "اعتناق الإسلام", en: "Embrace Islam" },
    desc: { ar: "دليل المسلم الجديد", en: "Guide for new Muslims" },
  },
  {
    href: "/articles",
    icon: "✍️",
    title: { ar: "المقالات", en: "Articles" },
    desc: { ar: "مقالات دعوية وتربوية", en: "Dawah and educational articles" },
  },
];

// ============================================================
// قسم الدعوة
// ============================================================

const DAWAH_ITEMS: SectionItem[] = [
  {
    href: "/dawah-guide",
    icon: "📢",
    title: { ar: "دليل الدعوة", en: "Dawah Guide" },
    desc: { ar: "أصول ومهارات الدعوة", en: "Dawah principles and skills" },
  },
  {
    href: "/fields",
    icon: "🗺️",
    title: { ar: "المجالات الدعوية", en: "Dawah Fields" },
    desc: { ar: "17 مجالاً شرعياً متنوعاً", en: "17 diverse Islamic fields" },
  },
  {
    href: "/projects",
    icon: "🏗️",
    title: { ar: "المشاريع", en: "Projects" },
    desc: { ar: "ساهم في صدقة جارية", en: "Contribute to ongoing charity" },
  },
  {
    href: "/khutab",
    icon: "🎤",
    title: { ar: "مكتبة الخطب", en: "Khutbah Library" },
    desc: { ar: "خطب جمعة للأئمة والدعاة", en: "Friday sermons for Imams" },
  },
  {
    href: "/live",
    icon: "📺",
    title: { ar: "البث المباشر", en: "Live Stream" },
    desc: { ar: "تابع الدروس الحية", en: "Watch live lessons" },
  },
  {
    href: "/khatm-dua",
    icon: "🤝",
    title: { ar: "ختم الدعاء", en: "Khatm Dua" },
    desc: { ar: "برنامج دعائي جماعي", en: "Collective dua program" },
  },
];

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ismail-dawah.vercel.app";

  return {
    title: {
      default: ui.metaTitle,
      template: `%s | ${ui.metaTitle}`,
    },
    description: ui.metaDesc,
    alternates: {
      canonical: `/${l}`,
      languages: {
        ar: `${baseUrl}/ar`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title: ui.metaTitle,
      description: ui.metaDesc,
      url: `${baseUrl}/${l}`,
      siteName: ui.metaTitle,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: ui.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.metaTitle,
      description: ui.metaDesc,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة الرئيسية
// ============================================================

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) return null;

  const l = lang as Lang;
  const isRTL = l === "ar";
  const ui = UI[l];

  // JSON-LD
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ui.metaTitle,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ismail-dawah.vercel.app"}/${l}`,
    inLanguage: l,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ismail-dawah.vercel.app"}/${l}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <Header lang={l} />

      {/* ============ Hero Section ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-20 text-white md:py-28">
        {/* زخرفة خلفية */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />

        {/* دوائر متوهجة */}
        <div className="absolute -top-24 -end-24 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -start-20 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />

        <div className="container-page relative text-center">
          {/* الشارة */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2 text-sm font-bold backdrop-blur-sm">
            {ui.badge}
          </span>

          {/* العنوان */}
          <h1
            className="mb-6 text-4xl font-black leading-tight md:text-6xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.title}
          </h1>

          {/* الوصف */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-50">
            {ui.subtitle}
          </p>

          {/* أزرار CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${l}/learn`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 px-7 py-3.5 text-base font-black text-gray-900 shadow-lg shadow-gold-500/25 transition-all hover:from-gold-600 hover:to-gold-700 hover:shadow-xl"
            >
              {ui.cta1}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={`/${l}/live`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              {ui.cta2}
            </Link>
          </div>

          {/* إحصائيات */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroStatCard value="35+" label={ui.statSections} />
            <HeroStatCard value="2" label={ui.statLanguages} />
            <HeroStatCard value="114" label={ui.statSurahs} />
            <HeroStatCard value="100%" label={ui.statFree} />
          </div>
        </div>

        {/* موجة سفلية */}
        <div className="relative mt-16">
          <svg viewBox="0 0 1440 80" fill="none" className="block w-full">
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              className="fill-cream-dark dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* ============ الأدوات السريعة ============ */}
      <section className="container-page -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {QUICK_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={`/${l}${tool.href}`}
              className="card card-interactive group flex flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-1"
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {tool.icon}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isRTL ? tool.title.ar : tool.title.en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ قسم تعلّم ============ */}
      <section className="container-page py-16 md:py-20">
        <div className="mb-10 text-center">
          <h2
            className="section-title mb-0"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📚 {ui.learnTitle}
          </h2>
          <div className="islamic-divider my-0">
            <span className="text-xl text-gold-500">✦</span>
          </div>
          <p className="section-subtitle mx-auto max-w-2xl">{ui.learnSubtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_ITEMS.map((item) => (
            <SectionCard key={item.href} item={item} lang={l} color="primary" />
          ))}
        </div>
      </section>

      {/* ============ قسم العلوم والردود ============ */}
      <section className="bg-primary-50/50 py-16 dark:bg-night-800/30 md:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🧠 {ui.responsesTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.responsesSubtitle}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RESPONSE_ITEMS.map((item) => (
              <SectionCard key={item.href} item={item} lang={l} color="gold" />
            ))}
          </div>
        </div>
      </section>

      {/* ============ آية اليوم ============ */}
      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="card relative overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-10 text-center md:p-14 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
            <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

            <p className="mb-4 text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400">
              {ui.verseLabel}
            </p>

            <div className="mb-6 text-5xl text-gold-500">﴿</div>

            <p
              className="mb-6 text-2xl font-black leading-[2.2] text-slate-900 md:text-3xl dark:text-white"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {ui.verseText}
            </p>

            <div className="mb-6 text-5xl text-gold-500">﴾</div>

            <p className="text-sm font-bold text-gold-700 dark:text-gold-300">
              {ui.verseSource}
            </p>
          </div>
        </div>
      </section>

      {/* ============ قسم الدعوة ============ */}
      <section className="container-page pb-16 md:pb-20">
        <div className="mb-10 text-center">
          <h2
            className="section-title mb-0"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📢 {ui.dawahTitle}
          </h2>
          <div className="islamic-divider my-0">
            <span className="text-xl text-gold-500">✦</span>
          </div>
          <p className="section-subtitle mx-auto max-w-2xl">{ui.dawahSubtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DAWAH_ITEMS.map((item) => (
            <SectionCard key={item.href} item={item} lang={l} color="primary" />
          ))}
        </div>
      </section>

      {/* ============ النشرة البريدية ============ */}
      <section className="container-page pb-16 md:pb-20">
        <div className="card relative overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-primary-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-gold-500 text-4xl text-white shadow-lg">
                📬
              </span>
            </div>

            <h2
              className="mb-3 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.newsletterTitle}
            </h2>

            <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.newsletterDesc}
            </p>

            <form
              action={`/${l}/api/newsletter`}
              method="POST"
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                required
                placeholder={ui.newsletterPlaceholder}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-bold text-slate-900 outline-none transition-all focus:border-primary-500 dark:border-night-700 dark:bg-night-800 dark:text-white dark:focus:border-primary-400"
                dir="ltr"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                {ui.newsletterBtn}
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              🔒 {ui.newsletterNote}
            </p>
          </div>
        </div>
      </section>

      {/* ============ تطبيق أندرويد ============ */}
      <section className="container-page pb-16 md:pb-20">
        <div className="card relative overflow-hidden border-2 border-primary-200 p-8 md:p-10 dark:border-primary-800">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">{ui.downloadBadge}</span>

            <h2
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.downloadTitle}
            </h2>

            <p className="mb-7 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.downloadDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/api/download/android"
                download="ismail-dawah.apk"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {ui.downloadBtn}
              </a>

              <Link href={`/${l}/download`} className="btn-outline">
                {ui.downloadPage}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA النهائي ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-16 text-white md:py-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="container-page relative text-center">
          <h2
            className="mb-4 text-3xl font-black md:text-4xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.ctaTitle}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            {ui.ctaDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${l}/register`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 px-7 py-3.5 text-base font-black text-gray-900 shadow-lg transition-all hover:from-gold-600 hover:to-gold-700"
            >
              {ui.ctaRegister}
            </Link>
            <Link
              href={`/${l}/about`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              {ui.ctaAbout}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون HeroStatCard
// ============================================================

function HeroStatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
      <p className="text-2xl font-black text-gold-300 md:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/80">{label}</p>
    </div>
  );
}

// ============================================================
// مكون SectionCard
// ============================================================

function SectionCard({
  item,
  lang,
  color,
}: {
  item: SectionItem;
  lang: Lang;
  color: "primary" | "gold";
}) {
  const isRTL = lang === "ar";
  const gradient =
    color === "gold"
      ? "from-gold-500 to-gold-600"
      : "from-primary-500 to-primary-600";
  const iconBg =
    color === "gold"
      ? "bg-gold-100 dark:bg-gold-900/40"
      : "bg-primary-100 dark:bg-primary-900/40";

  return (
    <Link
      href={`/${lang}${item.href}`}
      className="card card-interactive group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="mb-4 flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} text-3xl shadow-sm`}
        >
          {item.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className="mb-1 text-lg font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {isRTL ? item.title.ar : item.title.en}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isRTL ? item.desc.ar : item.desc.en}
          </p>
        </div>

        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-500 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-slate-600"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}