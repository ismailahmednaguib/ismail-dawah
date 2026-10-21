// app/[lang]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, languages, type Lang } from "@/lib/i18n";
import { getVerseOfTheDay } from "@/lib/verse";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import LatestTabs from "@/components/home/LatestTabs";
import NavIcon from "@/components/NavIcon";
import PrayerWidget from "@/components/PrayerWidget";
import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import { getPublicCounts, getPublicList } from "@/lib/learn/public";
import {
  NAV_TREE,
  applyNavigationConfig,
  navHref,
  navLabel,
  type NavNode,
} from "@/lib/navigation";

// المحتوى يُقرأ من قاعدة البيانات وقت الطلب حتى تظهر تعديلات لوحة التحكم فورًا.
export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ismailahmednaguib.vercel.app"
).replace(/\/$/, "");

// ============================================================
// الأنواع
// ============================================================

function settingText(
  settings: Record<string, any>,
  key: string,
  lang: Lang,
  fallback: string
): string {
  const value = settings[key];

  // القيمة المترجمة (كائن {ar,en}) لها الأولوية على النص المفرد.
  if (value && typeof value === "object") {
    const localized = value[lang];
    if (typeof localized === "string" && localized.trim()) return localized.trim();
  }

  if (typeof value === "string" && value.trim()) {
    const text = value.trim();
    // لا نُسرّب نصًا غير مترجم (عربي) إلى الواجهة الإنجليزية.
    if (lang === "en" && /[\u0600-\u06FF]/.test(text)) return fallback;
    return text;
  }

  return fallback;
}

function settingFlag(
  settings: Record<string, any>,
  key: string,
  fallback: boolean
): boolean {
  const value = settings[key];
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.ar === "boolean") return record.ar;
    if (typeof record.en === "boolean") return record.en;
  }
  return fallback;
}

// ============================================================
// نصوص الواجهة
// ============================================================

type UiText = {
  badge: string;
  title: string;
  subtitle: string;
  cta1: string;
  cta2: string;
  statSections: string;
  statLanguages: string;
  statLessons: string;
  statFatwas: string;
  learnTitle: string;
  learnSubtitle: string;
  responsesTitle: string;
  responsesSubtitle: string;
  dawahTitle: string;
  dawahSubtitle: string;
  portalBadge: string;
  portalTitle: string;
  portalDesc: string;
  portalCta1: string;
  portalCta2: string;
  verseLabel: string;
  downloadBadge: string;
  downloadTitle: string;
  downloadDesc: string;
  downloadBtn: string;
  downloadPage: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaRegister: string;
  ctaAbout: string;
  metaTitle: string;
  metaDesc: string;
  pathsTitle: string;
  pathsSubtitle: string;
  latestTitle: string;
  latestSubtitle: string;
  latestLessons: string;
  latestFatwas: string;
  latestArticles: string;
  latestHadith: string;
  latestDoubts: string;
  latestKhutab: string;
  latestStories: string;
  viewAll: string;
  readMore: string;
  sectionsTitle: string;
  sectionsSubtitle: string;
  sectionsItems: string;
  sectionsExplore: string;
};

const UI: Record<string, UiText> = {
  ar: {
    badge: "✨ منصة دعوية شاملة",
    title: "منصة إسماعيل أحمد نجيب الدعوية",
    subtitle:
      "منصة إسلامية شاملة تجمع القرآن الكريم، والأذكار، والفتاوى، وقصص الأنبياء، ومواقيت الصلاة، واتجاه القبلة، وأدوات الدعوة في مكان واحد.",
    cta1: "ابدأ رحلة العلم",
    cta2: "البث المباشر",
    statSections: "مادة منشورة",
    statLanguages: "لغات متاحة",
    statLessons: "درس منشور",
    statFatwas: "فتوى منشورة",
    learnTitle: "تعلّم العلوم الشرعية",
    learnSubtitle: "ابدأ بأساسيات الدين وتدرّج في طلب العلم الشرعي",
    responsesTitle: "العلوم والردود",
    responsesSubtitle: "ردود على الشبهات وقضايا معاصرة بمنهج شرعي معتدل",
    dawahTitle: "الدعوة والتوعية",
    dawahSubtitle: "أدوات ومواد دعوية لنشر العلم الشرعي",
    portalBadge: "◈ لغير المسلمين",
    portalTitle: "تبحث عن الحقيقة؟ ابدأ من هنا",
    portalDesc:
      "تعريف مبسّط بالإسلام، وإجابات هادئة عن أكثر الأسئلة تكرارًا، وخطوات واضحة لمن يريد اعتناق الإسلام.",
    portalCta1: "تعريف بالإسلام",
    portalCta2: "كيف أدخل الإسلام؟",
    verseLabel: "آية اليوم",
    downloadBadge: "📱 تطبيق أندرويد",
    downloadTitle: "حمّل التطبيق الآن",
    downloadDesc:
      "افتح منصة إسماعيل أحمد نجيب كتطبيق مستقل على هاتفك الأندرويد بدون الحاجة لفتح المتصفح.",
    downloadBtn: "تحميل APK مباشرة",
    downloadPage: "صفحة التحميل",
    ctaTitle: "ابدأ رحلتك الإيمانية اليوم",
    ctaDesc: "أنشئ حسابك المجاني وتابع وردك وأذكارك وتعلّمك في مكان واحد.",
    ctaRegister: "إنشاء حساب مجاني",
    ctaAbout: "تعرّف علينا",
    metaTitle: "منصة إسماعيل أحمد نجيب الدعوية",
    metaDesc:
      "منصة إسلامية شاملة للقرآن، الأذكار، الفتاوى، مواقيت الصلاة، القبلة، وأدوات الدعوة. بالعربية والإنجليزية.",
    pathsTitle: "اختر مسارك",
    pathsSubtitle:
      "ابدأ من الباب الأقرب إلى احتياجك، ثم انتقل تدريجيًا إلى ما يناسب رحلتك.",
    latestTitle: "أحدث ما نُشر",
    latestSubtitle: "مختارات من الدروس والفتاوى والمقالات والأحاديث والأسئلة",
    latestLessons: "أحدث الدروس",
    latestFatwas: "أحدث الفتاوى",
    latestArticles: "أحدث المقالات",
    latestHadith: "من الأحاديث",
    latestDoubts: "من الأسئلة الشائعة",
    latestKhutab: "من الخطب",
    latestStories: "من السيرة والقصص",
    viewAll: "عرض الكل",
    readMore: "اقرأ المزيد",
    sectionsTitle: "أبواب الموقع",
    sectionsSubtitle: "كل ما تحتاجه في مكان واحد — اختر الباب الذي تريد أن تبدأ منه",
    sectionsItems: "موضوعًا",
    sectionsExplore: "تصفّح القسم",
  },
  en: {
    badge: "✨ Comprehensive Dawah Platform",
    title: "Ismail Ahmed Naguib Dawah Platform",
    subtitle:
      "A comprehensive Islamic platform that brings together the Holy Quran, adhkar, fatwas, prophets' stories, prayer times, Qibla direction, and dawah tools in one place.",
    cta1: "Start Learning",
    cta2: "Live Stream",
    statSections: "Published items",
    statLanguages: "Available languages",
    statLessons: "Published lessons",
    statFatwas: "Published fatwas",
    learnTitle: "Learn Islamic Sciences",
    learnSubtitle:
      "Start with the fundamentals and progress in seeking Islamic knowledge",
    responsesTitle: "Knowledge & Responses",
    responsesSubtitle:
      "Responses to doubts and contemporary issues with balanced Islamic methodology",
    dawahTitle: "Dawah & Awareness",
    dawahSubtitle:
      "Tools and materials for spreading authentic Islamic knowledge",
    portalBadge: "◈ For Non-Muslims",
    portalTitle: "Seeking the truth? Start here",
    portalDesc:
      "A simple introduction to Islam, calm answers to the most-asked questions, and clear steps for those who wish to embrace Islam.",
    portalCta1: "Introduction to Islam",
    portalCta2: "How to embrace Islam",
    verseLabel: "Verse of the Day",
    downloadBadge: "📱 Android App",
    downloadTitle: "Download the App Now",
    downloadDesc:
      "Open the Ismail Ahmed Naguib platform as a standalone app on your Android phone without needing a browser.",
    downloadBtn: "Download APK Direct",
    downloadPage: "Download Page",
    ctaTitle: "Start Your Faith Journey Today",
    ctaDesc:
      "Create your free account and keep your wird, adhkar and learning in one place.",
    ctaRegister: "Create Free Account",
    ctaAbout: "About Us",
    metaTitle: "Ismail Ahmed Naguib Dawah Platform",
    metaDesc:
      "A comprehensive Islamic platform for Quran, adhkar, fatwas, prayer times, Qibla, and dawah tools. In Arabic and English.",
    pathsTitle: "Choose your path",
    pathsSubtitle:
      "Start with the path closest to your needs, then grow at your own pace.",
    latestTitle: "Latest Published",
    latestSubtitle: "A selection of lessons, fatwas, articles, hadith, and FAQs",
    latestLessons: "Latest Lessons",
    latestFatwas: "Latest Fatwas",
    latestArticles: "Latest Articles",
    latestHadith: "From the Hadith",
    latestDoubts: "From the FAQ",
    latestKhutab: "From the Khutbahs",
    latestStories: "From Seerah & Stories",
    viewAll: "View all",
    readMore: "Read more",
    sectionsTitle: "Explore the Platform",
    sectionsSubtitle: "Everything you need in one place — pick a section to begin",
    sectionsItems: "topics",
    sectionsExplore: "Browse section",
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
  const settings = await getSiteSettings();
  const metaTitle = settingText(settings, "metaTitle", l, ui.metaTitle);
  const metaDesc = settingText(settings, "metaDescription", l, ui.metaDesc);
  const ogImage = settingText(settings, "ogImage", l, `${SITE_URL}/icon-512.png`);

  return {
    // absolute: عشان الـ template اللي في الـ layout ما يكرّرش الاسم
    title: { absolute: metaTitle },
    description: metaDesc,
    alternates: {
      canonical: `${SITE_URL}/${l}`,
      languages: {
        ar: `${SITE_URL}/ar`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/ar`,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${SITE_URL}/${l}`,
      siteName: metaTitle,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: ogImage, // كان فيه نقطة زيادة في الآخر: "/icon-512.png."
          width: 512,
          height: 512,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary", // الصورة مربعة 512×512 فمش مناسبة لـ summary_large_image
      title: metaTitle,
      description: metaDesc,
      images: [ogImage],
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
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const isRTL = l === "ar";
  const settings = await getSiteSettings();
  const baseUi = UI[l];
  const gate = pageGate(buildPageControls(settings as Record<string, unknown>), "home", l);
  const ui: UiText = {
    ...baseUi,
    badge: settingText(settings, "homeKicker", l, baseUi.badge),
    title: settingText(settings, "homeTitle", l, settingText(settings, "ownerName", l, baseUi.title)),
    subtitle: settingText(
      settings,
      "homeSubtitle",
      l,
      settingText(settings, "homeHeroText", l, baseUi.subtitle)
    ),
    cta1: settingText(settings, "homeCta1", l, baseUi.cta1),
    cta2: settingText(settings, "homeCta2", l, baseUi.cta2),
  };
  const verse = getVerseOfTheDay(l);

  // أبواب الموقع — مبنية على هيكل التنقّل (تتأثر بإعدادات اللوحة).
  const navTree = applyNavigationConfig(
    (settings as Record<string, unknown>).navigation,
    NAV_TREE
  );
  const primaryKeys = ["quran", "sciences", "fatwa", "tools", "responses", "non-muslim"];
  const topGroups = primaryKeys
    .map((key) => navTree.find((node) => node.key === key))
    .filter((node): node is NavNode => Boolean(node));

  const [counts, latestLessons, latestFatwas, latestArticles, latestHadith, latestDoubts, latestKhutab, latestStories] =
    await Promise.all([
      getPublicCounts(l),
      getPublicList(l, "lesson", { limit: 3 }),
      getPublicList(l, "fatwa", { limit: 3 }),
      getPublicList(l, "article", { limit: 3 }),
      getPublicList(l, "hadith", { limit: 3 }),
      getPublicList(l, "faq", { limit: 3 }),
      getPublicList(l, "khutbah", { limit: 3 }),
      getPublicList(l, "story", { limit: 3 }),
    ]);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ui.metaTitle,
    url: `${SITE_URL}/${l}`,
    inLanguage: l,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${l}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main id="main-content" tabIndex={-1}
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-cream-dark dark:bg-gray-900"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <Header lang={l} overHero settings={settings} />

      {/* ============ Hero Section ============ */}
      {gate.visible('hero') && (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-20 text-white md:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute -top-24 -end-24 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -start-20 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl"
        />

        <div className="container-page relative text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2 text-sm font-bold backdrop-blur-sm">
            {ui.badge}
          </span>

          <h1
            className="mb-6 text-4xl font-black leading-tight md:text-6xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.title}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-50">
            {ui.subtitle}
          </p>

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
                aria-hidden="true"
                focusable="false"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={`/${l}/live`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              <span aria-hidden="true" className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              {ui.cta2}
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroStatCard value={String(Math.max(counts.total, 0))} label={ui.statSections} />
            <HeroStatCard value={String(languages.length)} label={ui.statLanguages} />
            <HeroStatCard value={String(Math.max(counts.lesson ?? 0, 0))} label={ui.statLessons} />
            <HeroStatCard value={String(Math.max(counts.fatwa ?? 0, 0))} label={ui.statFatwas} />
          </div>
        </div>

        {/* موجة سفلية */}
        <div className="relative mt-16" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" className="block w-full">
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              className="fill-cream-dark dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>
      )}

      {settingFlag(settings, "showPrayerBar", true) && <PrayerWidget lang={l} />}

      {/* ============ أبواب الموقع ============ */}
      {gate.visible('sections') && topGroups.length > 0 && (
      <section className="container-page py-14 md:py-16">
        <div className="mb-9 text-center">
          <h2
            className="section-title mb-0"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🗺️ {gate.title('sections', ui.sectionsTitle, l)}
          </h2>
          <div className="islamic-divider my-0" aria-hidden="true">
            <span className="text-xl text-gold-500">✦</span>
          </div>
          <p className="section-subtitle mx-auto max-w-2xl">
            {ui.sectionsSubtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topGroups.map((group) => (
            <GatewayCard
              key={group.key}
              node={group}
              lang={l}
              itemsLabel={ui.sectionsItems}
              exploreLabel={ui.sectionsExplore}
            />
          ))}
        </div>
      </section>
      )}

      {/* ============ آية اليوم ============ */}
      {gate.visible('verse') && (
      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="card relative overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-10 text-center md:p-14 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
            <div
              aria-hidden="true"
              className="gradient-gold absolute inset-x-0 top-0 h-1.5"
            />

            <p className="mb-4 text-xs font-black tracking-wider text-gold-600 dark:text-gold-400">
              {gate.title('verse', ui.verseLabel, l)}
            </p>

            <p
              className="mb-6 text-2xl font-black leading-[2.2] text-slate-900 md:text-3xl dark:text-white"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {verse.text}
            </p>

            <p className="text-sm font-bold text-gold-700 dark:text-gold-300">
              {verse.source}
            </p>
          </div>
        </div>
      </section>
      )}

      {/* ============ أحدث ما نُشر ============ */}
      {gate.visible('latest') && latestLessons.length +
        latestFatwas.length +
        latestArticles.length +
        latestHadith.length +
        latestDoubts.length +
        latestKhutab.length +
        latestStories.length >
        0 && (
        <section className="bg-primary-50/50 py-16 dark:bg-night-800/30 md:py-20">
          <div className="container-page">
            <div className="mb-10 text-center">
              <h2
                className="section-title mb-0"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                🆕 {gate.title('latest', ui.latestTitle, l)}
              </h2>
              <div className="islamic-divider my-0" aria-hidden="true">
                <span className="text-xl text-gold-500">✦</span>
              </div>
              <p className="section-subtitle mx-auto max-w-2xl">
                {ui.latestSubtitle}
              </p>
            </div>

            <noscript>
              <style>{`[data-latest-panel][hidden]{display:block!important}`}</style>
            </noscript>

            <LatestTabs
              lang={l}
              viewAll={ui.viewAll}
              rows={[
                {
                  key: "lesson",
                  title: ui.latestLessons,
                  href: `/${l}/learn?type=lesson`,
                  items: latestLessons,
                },
                {
                  key: "fatwa",
                  title: ui.latestFatwas,
                  href: `/${l}/fatwa`,
                  items: latestFatwas,
                },
                {
                  key: "article",
                  title: ui.latestArticles,
                  href: `/${l}/articles`,
                  items: latestArticles,
                },
                {
                  key: "hadith",
                  title: ui.latestHadith,
                  href: `/${l}/hadith`,
                  items: latestHadith,
                },
                {
                  key: "faq",
                  title: ui.latestDoubts,
                  href: `/${l}/faq`,
                  items: latestDoubts,
                },
                {
                  key: "khutbah",
                  title: ui.latestKhutab,
                  href: `/${l}/khutab`,
                  items: latestKhutab,
                },
                {
                  key: "story",
                  title: ui.latestStories,
                  href: `/${l}/learn?type=story`,
                  items: latestStories,
                },
              ]}
            />
          </div>
        </section>
      )}

      {/* ============ النشرة البريدية ============ */}
      {gate.visible('newsletter') && (
      <section className="container-page pb-16 md:pb-20">
        <Newsletter lang={l} />
      </section>
      )}

      {/* ============ تطبيق أندرويد ============ */}
      {gate.visible('download') && (
      <section className="container-page pb-16 md:pb-20">
        <div className="card relative overflow-hidden border-2 border-primary-200 p-8 md:p-10 dark:border-primary-800">
          <div
            aria-hidden="true"
            className="gradient-primary absolute inset-x-0 top-0 h-1.5"
          />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">{ui.downloadBadge}</span>

            <h2
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {gate.title('download', ui.downloadTitle, l)}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
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
      )}

      {/* ============ CTA النهائي ============ */}
      {gate.visible('cta') && (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-16 text-white md:py-20">
        <div
          aria-hidden="true"
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
            {gate.title('cta', ui.ctaTitle, l)}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
            {gate.title('cta', ui.ctaDesc, l)}
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
      )}

      {/* الصفحة بتنتهي بسكشن ملوّن → flushTop يشيل الفراغ بينه وبين الفوتر */}
      <Footer lang={l} settings={settings} showNewsletter={false} flushTop />
    </main>
  );
}

// ============================================================
// HeroStatCard
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
// GatewayCard — بطاقة باب من أبواب الموقع (من هيكل التنقّل)
// ============================================================

function GatewayCard({
  node,
  lang,
  itemsLabel,
  exploreLabel,
}: {
  node: NavNode;
  lang: Lang;
  itemsLabel: string;
  exploreLabel: string;
}) {
  const isRTL = lang === "ar";
  const count = node.children?.length ?? 0;
  const desc = node.desc ? (isRTL ? node.desc.ar : node.desc.en) : "";

  return (
    <Link
      href={`/${lang}${navHref(node)}`}
      className="card card-interactive group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1"
    >
      <div
        aria-hidden="true"
        className="gradient-primary absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-3xl shadow-sm dark:bg-primary-900/40"
        >
          <NavIcon name={node.key} fallback={node.icon} />
        </span>
        <h3
          className="text-lg font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {navLabel(node, lang)}
        </h3>
      </div>

      {desc && (
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {desc}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3">
        {count > 0 ? (
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
            {count} {itemsLabel}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
          {exploreLabel}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={`transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ============================================================
// نهاية مكوّنات الرئيسية
// ============================================================


