// app/[lang]/fields/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getPublicTaxonomies, type PublicTerm } from "@/lib/learn/public";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  explore: string;
  viewAll: string;
  verse: string;
  verseSource: string;
  totalFields: string;
  languages: string;
  comprehensive: string;
  freeAccess: string;
  introTitle: string;
  introDesc: string;
  relatedTitle: string;
  quranPage: string;
  quranPageDesc: string;
  articlesPage: string;
  articlesPageDesc: string;
  dawahPage: string;
  dawahPageDesc: string;
  doubtsPage: string;
  doubtsPageDesc: string;
  allFields: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, UILang> = {
  ar: {
    title: "مجالات المنصة",
    subtitle: "تصفح العلوم الشرعية والمجالات الدعوية المتنوعة",
    home: "الرئيسية",
    description:
      "اكتشف 17 مجالاً شرعياً متنوعاً تغطي العقيدة، الفقه، التفسير، الحديث، السيرة، الدعوة، الأخلاق، والقضايا المعاصرة.",
    explore: "استكشف المجال",
    viewAll: "عرض الكل",
    verse: "﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾",
    verseSource: "سورة البقرة — الآية 31",
    totalFields: "مجال شرعي",
    languages: "لغتان",
    comprehensive: "شامل",
    freeAccess: "مجاني بالكامل",
    introTitle: "لماذا مجالات متعددة؟",
    introDesc:
      "العلم الشرعي بحر واسع، وكل مجال يكمل الآخر. اخترنا لك أهم 17 مجالاً ليغطي احتياجات المسلم المعاصر: من التأسيس في العقيدة والعبادات، إلى التعامل مع قضايا العصر وشبهاته، مروراً بالدعوة والتربية والأسرة.",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع إلى كتاب الله.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "أصول الدعوة ومهاراتها.",
    doubtsPage: "الشبهات والردود",
    doubtsPageDesc: "إجابات عن الشبهات الشائعة.",
    allFields: "جميع المجالات",
  },
  en: {
    title: "Platform Fields",
    subtitle: "Browse diverse Islamic sciences and Dawah fields",
    home: "Home",
    description:
      "Discover 17 diverse Islamic fields covering Creed, Jurisprudence, Exegesis, Hadith, Biography, Dawah, Ethics, and Contemporary Issues.",
    explore: "Explore Field",
    viewAll: "View All",
    verse: "\"And He taught Adam the names - all of them.\"",
    verseSource: "Surah Al-Baqarah — Verse 31",
    totalFields: "Islamic Fields",
    languages: "Languages",
    comprehensive: "Comprehensive",
    freeAccess: "100% Free",
    introTitle: "Why Multiple Fields?",
    introDesc:
      "Islamic knowledge is a vast ocean, and each field complements the other. We selected the 17 most important fields to cover the needs of the modern Muslim: from foundations in creed and worship, to dealing with contemporary issues and doubts, through dawah, upbringing, and family.",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to the Book of Allah.",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "Principles and skills of dawah.",
    doubtsPage: "Doubts and Responses",
    doubtsPageDesc: "Answers to common doubts.",
    allFields: "All Fields",
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
      canonical: `/${l}/fields`,
      languages: {
        ar: "/ar/fields",
        en: "/en/fields",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/fields`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icon-512.png",
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
      images: ["/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function FieldsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  const fields = await getPublicTaxonomies(L, "field");
  const fieldColor = (term: PublicTerm) =>
    term.color ?? "from-primary-500 to-primary-600";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ui.title,
    description: ui.description,
    inLanguage: L,
    numberOfItems: fields.length,
    itemListElement: fields.map((field, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: field.name,
      description: field.name,
      url: `/${L}/fields/${field.slug}`,
    })),
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={L} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${L}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${L}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              📚 {isRTL ? "مجالات شرعية" : "Islamic Fields"}
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
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📚" label={ui.totalFields} value={fields.length} color="primary" />
          <StatCard icon="🌍" label={ui.languages} value={2} color="gold" />
          <StatCard icon="✨" label={ui.comprehensive} value="100%" color="primary" />
          <StatCard icon="🎁" label={ui.freeAccess} value="✓" color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-10 overflow-hidden">
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

        {/* ===== عنوان الشبكة ===== */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📖 {ui.allFields}
          </h2>
          <span className="badge-primary">
            {fields.length} {ui.totalFields}
          </span>
        </div>

        {/* ===== شبكة المجالات ===== */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <Link
              key={field.id}
              href={`/${L}/fields/${field.slug}`}
              className="card card-interactive group relative overflow-hidden p-6"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${fieldColor(field)} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="mb-4 flex items-center gap-3">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(field)} text-2xl text-white shadow-lg`}>
                  {field.icon}
                </span>
                <h2
                  className="text-xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {field.name}
                </h2>
              </div>

              <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {field.name}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                <span>{ui.explore}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${L}/quran`} className="card card-interactive group flex items-center gap-3 p-5">
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

            <Link href={`/${L}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ✍️
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.articlesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.articlesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/dawah-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🤝
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.dawahPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/doubts`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ❓
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.doubtsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.doubtsPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={L} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
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
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}


