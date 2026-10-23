// app/[lang]/fatwa/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";

import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero, Callout, renderDesignIcon } from "@/components/ui";
import { getPublicList, type PublicItem, type PublicTerm } from "@/lib/learn/public";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

// ============================================================
// أنواع البيانات
// ============================================================

type FatwaCategory = {
  id: string;
  ar: string;
  en: string;
  icon: string;
};

type Fatwa = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  tags: string[];
  source?: string;
  reviewed?: boolean;
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
};

// ============================================================
// التصنيفات
// ============================================================

const CATEGORIES: FatwaCategory[] = [
  { id: "all", ar: "كل الفتاوى", en: "All Fatwas", icon: "📚" },
  { id: "prayer", ar: "الصلاة", en: "Prayer", icon: "🕌" },
  { id: "fasting", ar: "الصيام", en: "Fasting", icon: "🌙" },
  { id: "zakat", ar: "الزكاة", en: "Zakat", icon: "💰" },
  { id: "hajj", ar: "الحج والعمرة", en: "Hajj & Umrah", icon: "🕋" },
  { id: "family", ar: "الأسرة", en: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "transactions", ar: "المعاملات", en: "Transactions", icon: "🤝" },
  { id: "aqeedah", ar: "العقيدة", en: "Aqeedah", icon: "🧠" },
  { id: "ethics", ar: "الأخلاق والآداب", en: "Ethics & Manners", icon: "✦" },
];

// ============================================================
// الفتاوى: تُجلب من CMS عبر getPublicList (lib/learn/public)
// ============================================================

/**
 * يطابق تصنيفات عنصر الـ CMS مع تصنيفات الواجهة الثابتة
 * اعتمادًا على الـ slug ثم على اسم التصنيف العربي/الإنجليزي.
 */
function resolveCategoryId(terms: PublicTerm[]): string {
  for (const term of terms) {
    const bySlug = CATEGORIES.find(
      (item) => item.id !== "all" && item.id === term.slug
    );
    if (bySlug) return bySlug.id;
  }

  for (const term of terms) {
    const name = term.name?.trim();
    if (!name) continue;
    const byName = CATEGORIES.find(
      (item) => item.id !== "all" && (item.ar === name || item.en === name)
    );
    if (byName) return byName.id;
  }

  return "all";
}

/**
 * يحوّل عنصر المحتوى المنشور القادم من الـ CMS إلى شكل الفتوى في الصفحة.
 */
function mapPublicFatwa(item: PublicItem): Fatwa {
  const sourceTerm = item.terms.find((term) =>
    ["source", "reference", "references", "book", "hadith"].includes(term.kind)
  );

  return {
    id: item.slug || item.id,
    categoryId: resolveCategoryId(item.terms),
    question: item.title.trim(),
    answer: (item.body ?? item.summary ?? "").trim(),
    tags: item.terms.map((term) => term.name).filter(Boolean),
    source: sourceTerm?.name?.trim() || undefined,
    reviewed: Boolean(item.reviewer_id),
  };
}

/**
 * يجلب الفتاوى المنشورة من الـ CMS عبر الطبقة العامة الموحّدة.
 */
async function getFatwas(lang: Lang, search?: string): Promise<Fatwa[]> {
  try {
    const items = await getPublicList(lang, "fatwa", {
      limit: 48,
      search: search?.trim() || undefined,
    });

    return items
      .filter((item) => Boolean(item.slug) && Boolean(item.title?.trim()))
      .map((item) => mapPublicFatwa(item));
  } catch (error) {
    console.error("[FatwaPage] public content error:", error);
    return [];
  }
}

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    searchPlaceholder: string;
    category: string;
    search: string;
    clearFilters: string;
    results: string;
    noResults: string;
    noResultsDesc: string;
    askQuestion: string;
    source: string;
    tags: string;
    answer: string;
    disclaimer: string;
    disclaimerText: string;
    reviewedLabel: string;
    categoriesTitle: string;
    popularTitle: string;
    popularDesc: string;
    readAnswer: string;
    of: string;
    verse: string;
    verseSource: string;
    totalFatwas: string;
    totalCategories: string;
    trustedSources: string;
    relatedTitle: string;
    contactPage: string;
    contactPageDesc: string;
    dawahPage: string;
    dawahPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    doubtsPage: string;
    doubtsPageDesc: string;
    featuredTitle: string;
  }
> = {
  ar: {
    title: "الفتاوى",
    subtitle: "أسئلة فقهية وإجاباتها المختصرة",
    home: "الرئيسية",
    description:
      "قسم الفتاوى يحتوي على أسئلة فقهية شائعة في العبادات والمعاملات والأسرة والعقيدة والأخلاق، مع إجابات مختصرة ومحكمة.",
    searchPlaceholder: "ابحث في الفتاوى...",
    category: "التصنيف",
    search: "بحث",
    clearFilters: "مسح الفلاتر",
    results: "عدد النتائج",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    askQuestion: "أرسل سؤالك",
    source: "المصدر",
    tags: "الوسوم",
    answer: "الإجابة",
    disclaimer: "تنبيه",
    disclaimerText:
      "هذه الفتاوى مختصرة للتوعية العامة، ولا تغني عن مراجعة أهل العلم المختصين في النوازل والمسائل الدقيقة.",
    reviewedLabel: "مراجعة علمية",
    categoriesTitle: "تصنيفات الفتاوى",
    popularTitle: "فتاوى مختارة",
    popularDesc: "أكثر الأسئلة شيوعًا وإفادة",
    readAnswer: "عرض الإجابة",
    of: "من",
    verse: "﴿ وَلَوْ رَدُّوهُ إِلَى الرَّسُولِ وَإِلَىٰ أُولِي الْأَمْرِ مِنْهُمْ لَعَلِمَهُ الَّذِينَ يَسْتَنبِطُونَهُ مِنْهُمْ ﴾",
    verseSource: "سورة النساء — الآية 83",
    totalFatwas: "فتوى",
    totalCategories: "تصنيف",
    trustedSources: "مصادر موثوقة",
    relatedTitle: "صفحات ذات صلة",
    contactPage: "تواصل معنا",
    contactPageDesc: "أرسل سؤالك المباشر.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "أصول الدعوة ومهاراتها.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات فقهية وتربوية.",
    doubtsPage: "الشبهات والردود",
    doubtsPageDesc: "إجابات عن الشبهات الشائعة.",
    featuredTitle: "فتاوى مميزة",
  },
  en: {
    title: "Fatwas",
    subtitle: "Common Islamic questions and concise answers",
    home: "Home",
    description:
      "The fatwa section contains common Islamic questions about worship, transactions, family life, creed, and ethics, with concise and careful answers.",
    searchPlaceholder: "Search fatwas...",
    category: "Category",
    search: "Search",
    clearFilters: "Clear filters",
    results: "Results",
    noResults: "No results found",
    noResultsDesc: "Try another keyword or choose a different category.",
    askQuestion: "Send your question",
    source: "Source",
    tags: "Tags",
    answer: "Answer",
    disclaimer: "Notice",
    disclaimerText:
      "These fatwas are brief for general awareness and do not replace consulting qualified scholars in detailed or unusual cases.",
    reviewedLabel: "Scholarly review",
    categoriesTitle: "Fatwa Categories",
    popularTitle: "Selected Fatwas",
    popularDesc: "Most common and beneficial questions",
    readAnswer: "Show answer",
    of: "of",
    verse: "\"But if they had referred it back to the Messenger and to those in authority among them, those who can draw out the truth would have known it.\"",
    verseSource: "Surah An-Nisa — Verse 83",
    totalFatwas: "Fatwas",
    totalCategories: "Categories",
    trustedSources: "Trusted Sources",
    relatedTitle: "Related Pages",
    contactPage: "Contact Us",
    contactPageDesc: "Send your direct question.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "Principles and skills of dawah.",
    articlesPage: "Articles",
    articlesPageDesc: "Fiqh and educational articles.",
    doubtsPage: "Doubts and Responses",
    doubtsPageDesc: "Answers to common doubts.",
    featuredTitle: "Featured Fatwas",
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

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(value)
      .split("")
      .map((digit) => {
        const number = Number(digit);
        return Number.isFinite(number) ? arabicNumerals[number] : digit;
      })
      .join("");
  }
  return String(value);
}

function categoryLabel(categoryId: string, lang: Lang): string {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return categoryId;
  return lang === "ar" ? category.ar : category.en;
}

function categoryIcon(categoryId: string): string {
  return CATEGORIES.find((item) => item.id === categoryId)?.icon ?? "📖";
}

function categoryColor(categoryId: string): string {
  const colors: Record<string, string> = {
    prayer: "from-primary-500 to-primary-600",
    fasting: "from-primary-500 to-primary-600",
    zakat: "from-gold-500 to-gold-600",
    hajj: "from-gold-500 to-gold-600",
    family: "from-primary-500 to-primary-600",
    transactions: "from-primary-500 to-primary-600",
    aqeedah: "from-night-500 to-night-600",
    ethics: "from-primary-500 to-primary-600",
  };
  return colors[categoryId] ?? "from-slate-500 to-slate-600";
}

function matchesQuery(fatwa: Fatwa, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  return (
    fatwa.question.toLowerCase().includes(q) ||
    fatwa.answer.toLowerCase().includes(q) ||
    fatwa.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    categoryLabel(fatwa.categoryId, "ar").includes(query.trim()) ||
    categoryLabel(fatwa.categoryId, "en").toLowerCase().includes(q)
  );
}

function buildFatwaQuery(options: { q?: string; category?: string }): string {
  const search = new URLSearchParams();
  if (options.q?.trim()) search.set("q", options.q.trim());
  if (options.category && options.category !== "all") search.set("category", options.category);
  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
}

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
      canonical: `/${l}/fatwa`,
      languages: {
        ar: "/ar/fatwa",
        en: "/en/fatwa",
      },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/fatwa`,
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
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function FatwaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "fatwa", l);
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const q = getFirstValue(sp.q).trim();
  const rawCategory = getFirstValue(sp.category);
  const category =
    rawCategory && CATEGORIES.some((item) => item.id === rawCategory)
      ? rawCategory
      : "all";

  // الفتاوى المنشورة من CMS (مع تمرير البحث إلى الطبقة العامة).
  const fatwas = await getFatwas(l, q);

  const filteredFatwas = fatwas.filter((fatwa) => {
    if (category !== "all" && fatwa.categoryId !== category) return false;
    return matchesQuery(fatwa, q);
  });

  const activeCategory =
    CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];

  // الفتاوى المميزة (أول 3)
  const featuredFatwas = fatwas.slice(0, 3);

  // JSON-LD: FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: l,
    name: ui.title,
    description: ui.description,
    mainEntity: fatwas.map((fatwa) => ({
      "@type": "Question",
      name: fatwa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: fatwa.answer,
      },
    })),
  };

  // حساب عدد المصادر الفريدة
  const uniqueSources = new Set(fatwas.map((f) => f.source).filter(Boolean)).size;

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="site-page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      {gate.visible('k0') && (
        <PageHero
          icon="⚖️"
          badge={isRTL ? "⚖️ أسئلة شرعية" : "⚖️ Islamic Questions"}
          title={ui.title}
          subtitle={ui.description}
          crumbs={[
            { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
            { label: ui.title },
          ]}
        />
      )}

      <section className="container-page py-10 md:py-14">
        {gate.visible('k0') && (
          <div className="mb-8">
            <Callout icon="🕌" tone="gold">
              <p
                className="text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">{ui.verseSource}</p>
            </Callout>
          </div>
        )}
        {/* ===== إحصائيات سريعة ===== */}
        {gate.visible('k1') && (<>
        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard icon="⚖️" label={ui.totalFatwas} value={fatwas.length} color="primary" />
          <StatCard icon="📂" label={ui.totalCategories} value={CATEGORIES.length - 1} color="gold" />
          <StatCard icon="📚" label={ui.trustedSources} value={uniqueSources} color="primary" />
        </div>

        </>)}
        {/* ===== بطاقة البحث والفلترة ===== */}
        {gate.visible('k2') && (<>
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/fatwa`}
            className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={ui.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={ui.searchPlaceholder}
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="fatwa-category">
                {ui.category}
              </label>

              <select
                id="fatwa-category"
                name="category"
                defaultValue={category}
                className="input-islamic"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {l === "ar" ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary whitespace-nowrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {ui.search}
            </button>
          </form>

          {(q || category !== "all") && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="badge-primary">
                {ui.category}: {renderDesignIcon(activeCategory.icon, 16)}{" "}
                {l === "ar" ? activeCategory.ar : activeCategory.en}
              </span>

              {q && <span className="badge-gold">&quot;{q}&quot;</span>}

              <Link
                href={`/${l}/fatwa`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {ui.clearFilters}
              </Link>
            </div>
          )}
        </div>

        </>)}
        {/* ===== التصنيفات السريعة ===== */}
        {gate.visible('k3') && (<>
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.categoriesTitle}
          </h2>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const isActive = item.id === category;
              const href = `/${l}/fatwa${buildFatwaQuery({ q, category: item.id })}`;
              const count = item.id === "all"
                ? fatwas.length
                : fatwas.filter((f) => f.categoryId === item.id).length;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  }`}
                >
                  <span aria-hidden="true">{renderDesignIcon(item.icon, 20)}</span>
                  <span>{l === "ar" ? item.ar : item.en}</span>
                  {item.id !== "all" && count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                    }`}>
                      {formatNumber(count, l)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        </>)}
        {/* ===== فتاوى مميزة (عند عدم وجود فلترة) ===== */}
        {gate.visible('k4') && (<>
        {!q && category === "all" && (
          <div className="mb-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  className="text-2xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  ⭐ {ui.featuredTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {ui.popularDesc}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featuredFatwas.map((fatwa) => {
                const color = categoryColor(fatwa.categoryId);
                const icon = categoryIcon(fatwa.categoryId);
                const cat = categoryLabel(fatwa.categoryId, l);

                return (
                  <details key={fatwa.id} className="card group relative overflow-hidden">
                    <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${color}`} />

                    <summary className="flex cursor-pointer list-none flex-col p-6 [&::-webkit-details-marker]:hidden">
                      <div className="mb-4 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${color} px-3 py-1 text-xs font-bold text-white`}>
                          {renderDesignIcon(icon, 16)} {cat}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-night-800">
                          {renderDesignIcon(icon, 28)}
                        </span>
                      </div>

                      <h3
                        className="mb-2 text-lg font-black leading-tight text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {fatwa.question}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {fatwa.answer}
                      </p>

                      <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                        {ui.readAnswer}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-open:rotate-180"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </summary>

                    <div className="border-t border-slate-100 p-6 pt-4 dark:border-night-700">
                      <p className="mb-3 text-sm font-bold text-primary-700 dark:text-primary-300">
                        {ui.answer}
                      </p>
                      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                        {fatwa.answer}
                      </p>
                      {fatwa.source && (
                        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📚", 16)}</span>{ui.source}: {fatwa.source}
                        </p>
                      )}
                      {fatwa.reviewed && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                          ✓ {ui.reviewedLabel}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {fatwa.tags.map((tag) => (
                          <span key={tag} className="badge-gold text-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}

        </>)}
        {/* ===== عدد النتائج ===== */}
        {gate.visible('k5') && (<>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {ui.results}:{" "}
            <span className="text-primary-700 dark:text-primary-400">
              {formatNumber(filteredFatwas.length, l)}
            </span>{" "}
            {ui.of}{" "}
            <span className="text-slate-700 dark:text-slate-200">
              {formatNumber(fatwas.length, l)}
            </span>
          </p>

          <Link
            href={`/${l}/contact`}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
          >
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {ui.askQuestion}
          </Link>
        </div>

        </>)}
        {/* ===== لا توجد نتائج ===== */}
        {filteredFatwas.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔎</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}/fatwa`} className="btn-primary">
                {ui.clearFilters}
              </Link>

              <Link href={`/${l}/contact`} className="btn-outline">
                {ui.askQuestion}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredFatwas.map((fatwa) => {
              const cat = categoryLabel(fatwa.categoryId, l);
              const icon = categoryIcon(fatwa.categoryId);
              const color = categoryColor(fatwa.categoryId);

              return (
                <details key={fatwa.id} className="card group relative overflow-hidden p-6">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />

                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${color} px-2.5 py-0.5 text-xs font-bold text-white`}>
                          {renderDesignIcon(icon, 16)} {cat}
                        </span>
                      </div>

                      <h3
                        className="text-lg font-black leading-relaxed text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {fatwa.question}
                      </h3>
                    </div>

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

                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                    <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                      {ui.answer}
                    </p>

                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                      {fatwa.answer}
                    </p>

                    {fatwa.source && (
                      <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📚", 16)}</span>{ui.source}: {fatwa.source}
                      </p>
                    )}

                    {fatwa.reviewed && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                        ✓ {ui.reviewedLabel}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {fatwa.tags.map((tag) => (
                        <span key={tag} className="badge-gold text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        {gate.visible('k6') && (<>
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("🔗", 22)}</span>{ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">{renderDesignIcon("mail", 24)}</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/dawah-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🤝</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.dawahPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">{renderDesignIcon("✍️", 24)}</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.articlesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.articlesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/doubts`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">❓</span>
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

        </>)}
        {/* ===== تنبيه ===== */}
        {gate.visible('k7') && (<>
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 dark:border-gold-800/40 dark:bg-gold-950/20">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              {renderDesignIcon("⚠️", 24)}
            </span>

            <div>
              <h3
                className="mb-2 text-lg font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.disclaimer}
              </h3>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.disclaimerText}
              </p>
            </div>
          </div>
        </div>
        </>)}
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon, label, value, color,
}: {
  icon: string;
  label: string;
  value: number;
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
          {renderDesignIcon(icon, 28)}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

