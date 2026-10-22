// app/[lang]/articles/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";

import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";
import { getPublicList, type PublicItem, type PublicTerm } from "@/lib/learn/public";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type Category = {
  id: string;
  ar: string;
  en: string;
  icon: string;
  color: string;
};

type Article = {
  id: string;
  categoryId: string;
  date: string;
  readMinutes: number;
  icon: string;
  featured?: boolean;
  tags: {
    ar: string[];
    en: string[];
  };
  title: Localized;
  excerpt: Localized;
  content: {
    ar: string[];
    en: string[];
  };
  href?: string;
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  clearFilters: string;
  category: string;
  categoriesTitle: string;
  results: string;
  of: string;
  noResults: string;
  noResultsDesc: string;
  readArticle: string;
  publishedAt: string;
  readTime: string;
  tags: string;
  page: string;
  previous: string;
  next: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  fatwa: string;
  dawahGuide: string;
  hajjGuide: string;
  featuredTitle: string;
  featuredDesc: string;
  allArticles: string;
  share: string;
  bookmark: string;
  minRead: string;
  articlesCount: string;
  categoriesCount: string;
  freeAccess: string;
};

// ============================================================
// الثوابت
// ============================================================

const PAGE_SIZE = 6;

// ============================================================
// التصنيفات
// ============================================================

const CATEGORIES: Category[] = [
  { id: "all", ar: "كل المقالات", en: "All Articles", icon: "📚", color: "from-slate-500 to-slate-600" },
  { id: "dawah", ar: "الدعوة", en: "Dawah", icon: "🤝", color: "from-primary-500 to-primary-600" },
  { id: "quran", ar: "القرآن", en: "Quran", icon: "📖", color: "from-primary-500 to-primary-600" },
  { id: "fiqh", ar: "الفقه", en: "Fiqh", icon: "⚖️", color: "from-primary-500 to-primary-600" },
  { id: "akhlaq", ar: "الأخلاق", en: "Ethics", icon: "✦", color: "from-primary-500 to-primary-600" },
  { id: "stories", ar: "القصص", en: "Stories", icon: "📜", color: "from-gold-500 to-gold-600" },
  { id: "family", ar: "الأسرة", en: "Family", icon: "🏡", color: "from-gold-500 to-gold-600" },
];

// ============================================================
// المقالات: تُجلب من CMS عبر getPublicList (lib/learn/public)
// ============================================================

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, UILang> = {
  ar: {
    title: "المقالات",
    subtitle: "مقالات دعوية وتربوية وشرعية مختارة",
    home: "الرئيسية",
    description:
      "قسم المقالات في منصة اكتشف الإسلام. مقالات مختصرة في الدعوة والقرآن والفقه والأخلاق والقصص وتربية الأسرة.",
    searchPlaceholder: "ابحث في المقالات...",
    search: "بحث",
    clearFilters: "مسح الفلاتر",
    category: "التصنيف",
    categoriesTitle: "تصنيفات المقالات",
    results: "عدد المقالات",
    of: "من",
    noResults: "لا توجد مقالات مطابقة",
    noResultsDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    readArticle: "اقرأ المقال",
    publishedAt: "نُشر في",
    readTime: "دقائق قراءة",
    tags: "الوسوم",
    page: "صفحة",
    previous: "السابق",
    next: "التالي",
    noteTitle: "تنبيه",
    note1: "هذه المقالات للتوعية العامة، ولا تغني عن مراجعة أهل العلم في المسائل الدقيقة.",
    note2: "يُرجى نقل المحتوى مع ذكر المصدر، وعدم إخراج النصوص عن سياقها.",
    note3: "لو وجدت خطأً أو أردت اقتراح موضوع، راسلنا عبر صفحة تواصل معنا.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    dawahGuide: "دليل الدعوة",
    hajjGuide: "دليل الحج",
    featuredTitle: "مقالات مميزة",
    featuredDesc: "أهم المقالات المختارة لك",
    allArticles: "جميع المقالات",
    share: "مشاركة",
    bookmark: "حفظ",
    minRead: "دقائق",
    articlesCount: "مقال",
    categoriesCount: "تصنيف",
    freeAccess: "وصول مجاني",
  },
  en: {
    title: "Articles",
    subtitle: "Selected dawah, educational, and Islamic articles",
    home: "Home",
    description:
      "Articles section of the Discover Islam. Concise articles on dawah, Quran, fiqh, ethics, stories, and family upbringing.",
    searchPlaceholder: "Search articles...",
    search: "Search",
    clearFilters: "Clear filters",
    category: "Category",
    categoriesTitle: "Article Categories",
    results: "Articles",
    of: "of",
    noResults: "No matching articles",
    noResultsDesc: "Try another keyword or choose a different category.",
    readArticle: "Read article",
    publishedAt: "Published on",
    readTime: "min read",
    tags: "Tags",
    page: "Page",
    previous: "Previous",
    next: "Next",
    noteTitle: "Notice",
    note1: "These articles are for general awareness and do not replace consulting qualified scholars in detailed matters.",
    note2: "Please share content with attribution and do not take texts out of context.",
    note3: "If you find an error or want to suggest a topic, contact us through the Contact Us page.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    dawahGuide: "Dawah Guide",
    hajjGuide: "Hajj Guide",
    featuredTitle: "Featured Articles",
    featuredDesc: "Top articles selected for you",
    allArticles: "All Articles",
    share: "Share",
    bookmark: "Bookmark",
    minRead: "min",
    articlesCount: "Articles",
    categoriesCount: "Categories",
    freeAccess: "Free Access",
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

function normalize(value: string): string {
  return value.trim().toLowerCase();
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

function formatDate(iso: string, lang: Lang): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
    }).format(parsed);
  } catch {
    return parsed.toDateString();
  }
}

function categoryLabel(categoryId: string, lang: Lang): string {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return categoryId;
  return lang === "ar" ? category.ar : category.en;
}

function categoryIcon(categoryId: string): string {
  return CATEGORIES.find((item) => item.id === categoryId)?.icon ?? "📄";
}

function categoryColor(categoryId: string): string {
  return CATEGORIES.find((item) => item.id === categoryId)?.color ?? "from-slate-500 to-slate-600";
}

function articleMatches(article: Article, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  const haystack = [
    article.title.ar,
    article.title.en,
    article.excerpt.ar,
    article.excerpt.en,
    ...article.tags.ar,
    ...article.tags.en,
    ...article.content.ar,
    ...article.content.en,
  ];
  return haystack.some((text) => normalize(text).includes(q));
}

function parsePage(value?: string | string[]): number {
  const raw = getFirstValue(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function buildHref(
  lang: Lang,
  options: { q?: string; category?: string; page?: number }
): string {
  const search = new URLSearchParams();
  if (options.q?.trim()) search.set("q", options.q.trim());
  if (options.category && options.category !== "all") search.set("category", options.category);
  if (options.page && options.page > 1) search.set("page", String(options.page));
  const queryString = search.toString();
  return `/${lang}/articles${queryString ? `?${queryString}` : ""}`;
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
      canonical: `/${l}/articles`,
      languages: { ar: "/ar/articles", en: "/en/articles" },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/articles`,
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

/**
 * يطابق تصنيفات عنصر الـ CMS مع تصنيفات الواجهة الثابتة اعتمادًا على الـ slug.
 */
function resolveCategoryId(terms: PublicTerm[]): string {
  for (const term of terms) {
    const match = CATEGORIES.find((item) => item.id === term.slug);
    if (match) return match.id;
  }
  return "all";
}

/**
 * يقسّم نص المقال إلى فقرات لعرضها في بطاقة المقال.
 */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * يحوّل عنصر المحتوى المنشور القادم من الـ CMS إلى شكل البطاقة المستخدم في الصفحة.
 */
function mapPublicArticle(item: PublicItem, lang: Lang): Article {
  const title = item.title.trim();
  const summary = item.summary?.trim() ?? "";
  const body = item.body?.trim() ?? "";
  const categoryId = resolveCategoryId(item.terms);
  const matchedCategory = CATEGORIES.find(
    (category) => category.id !== "all" && category.id === categoryId
  );
  const icon =
    matchedCategory?.icon ?? item.terms.find((term) => term.icon)?.icon ?? "📰";
  const tags = item.terms.map((term) => term.name).filter(Boolean);
  const paragraphs = splitParagraphs(body || summary);

  return {
    id: `cms-${item.id}`,
    categoryId,
    date: item.published_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    readMinutes: Math.max(1, Math.ceil((body.length || summary.length || 240) / 500)),
    icon,
    tags: { ar: tags, en: tags },
    title: { ar: title, en: title },
    excerpt: { ar: summary, en: summary },
    content: { ar: paragraphs, en: paragraphs },
    href: `/${lang}/learn/article/${encodeURIComponent(item.slug)}`,
  };
}

/**
 * يجلب المقالات المنشورة من CMS عبر الطبقة العامة الموحّدة.
 */
async function getArticles(lang: Lang, search?: string): Promise<Article[]> {
  try {
    const items = await getPublicList(lang, "article", {
      limit: 48,
      search: search?.trim() || undefined,
    });

    return items
      .filter((item) => item.slug && item.title)
      .map((item) => mapPublicArticle(item, lang));
  } catch (error) {
    console.error("[ArticlesPage] public content error:", error);
    return [];
  }
}

// ============================================================
// الصفحة
// ============================================================

export default async function ArticlesPage({
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
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "articles", l);
  const ui = UI[l];
  const isRTL = l === "ar";
  const sp = await searchParams;

  const q = getFirstValue(sp.q).trim();
  const rawCategory = getFirstValue(sp.category);
  const category =
    rawCategory && CATEGORIES.some((item) => item.id === rawCategory)
      ? rawCategory
      : "all";

  const requestedPage = parsePage(sp.page);
  const articles = await getArticles(l, q);

  const filteredArticles = articles.filter((article) => {
    if (category !== "all" && article.categoryId !== category) return false;
    return articleMatches(article, q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageArticles = filteredArticles.slice(startIndex, startIndex + PAGE_SIZE);

  const activeCategory = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];

  // المقالات المميزة
  const featuredArticles = articles.filter((a) => a.featured).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    headline: ui.title,
    description: ui.description,
    inLanguage: l,
    url: `/${l}/articles`,
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: isRTL ? article.title.ar : article.title.en,
      description: isRTL ? article.excerpt.ar : article.excerpt.en,
      datePublished: article.date,
      articleSection: categoryLabel(article.categoryId, l),
      keywords: [...article.tags.ar, ...article.tags.en].join(", "),
    })),
  };

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      {gate.visible('k0') && (
        <PageHero
          icon="✍️"
          badge={isRTL ? "✍️ مقالات مختارة" : "✍️ Selected Articles"}
          title={ui.title}
          subtitle={ui.description}
          crumbs={[
            { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
            { label: ui.title },
          ]}
        />
      )}

      <section className="container-page py-10 md:py-14">
        {/* ===== إحصائيات سريعة ===== */}
        {gate.visible('k1') && (<>
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                📝
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {formatNumber(articles.length, l)}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.articlesCount}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                📂
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {formatNumber(CATEGORIES.length - 1, l)}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {ui.categoriesCount}
            </p>
          </div>

          <div className="card p-5 text-center">
            <div className="mb-2 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                ✨
              </span>
            </div>
            <p className="text-xl font-black text-primary-700 dark:text-primary-300">
              {ui.freeAccess}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              100%
            </p>
          </div>
        </div>

        </>)}
        {/* ===== مقالات مميزة ===== */}
        {gate.visible('k2') && (<>
        {featuredArticles.length > 0 && category === "all" && !q && (
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
                  {ui.featuredDesc}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <FeaturedArticleCard
                  key={article.id}
                  article={article}
                  lang={l}
                  isRTL={isRTL}
                  ui={ui}
                />
              ))}
            </div>
          </div>
        )}

        </>)}
        {/* ===== البحث والفلترة ===== */}
        {gate.visible('k3') && (<>
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/articles`}
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
              <label className="sr-only" htmlFor="articles-category">
                {ui.category}
              </label>
              <select
                id="articles-category"
                name="category"
                defaultValue={category}
                className="input-islamic"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {isRTL ? item.ar : item.en}
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
              {category !== "all" && (
                <span className="badge-primary">
                  {activeCategory.icon} {isRTL ? activeCategory.ar : activeCategory.en}
                </span>
              )}
              {q && <span className="badge-gold">&quot;{q}&quot;</span>}
              <Link
                href={`/${l}/articles`}
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
        {gate.visible('k4') && (<>
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.categoriesTitle}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const isActive = item.id === category;
              const href = buildHref(l, { q, category: item.id, page: 1 });
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
                  <span>{item.icon}</span>
                  <span>{isRTL ? item.ar : item.en}</span>
                </Link>
              );
            })}
          </div>
        </div>

        </>)}
        {/* ===== عدد النتائج ===== */}
        {gate.visible('k5') && (<>
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {ui.results}:{" "}
          <span className="text-primary-700 dark:text-primary-400">
            {formatNumber(filteredArticles.length, l)}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(articles.length, l)}
          </span>
        </p>

        </>)}
        {/* ===== المقالات ===== */}
        {gate.visible('k6') && (<>
        {filteredArticles.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📭</div>
            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">{ui.noResultsDesc}</p>
            <Link href={`/${l}/articles`} className="btn-primary">
              {ui.clearFilters}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {pageArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                lang={l}
                isRTL={isRTL}
                ui={ui}
              />
            ))}
          </div>
        )}

        </>)}
        {/* ===== الترقيم ===== */}
        {totalPages > 1 && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              {ui.page} {formatNumber(currentPage, l)} {ui.of} {formatNumber(totalPages, l)}
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={ui.page}>
              {currentPage > 1 ? (
                <Link
                  href={buildHref(l, { q, category, page: currentPage - 1 })}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {ui.previous}
                </Link>
              ) : (
                <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 dark:border-night-700 dark:bg-night-800 dark:text-slate-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {ui.previous}
                </span>
              )}

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                const isActive = page === currentPage;
                const href = buildHref(l, { q, category, page });
                if (isActive) {
                  return (
                    <span
                      key={page}
                      className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-3 text-sm font-black text-white shadow-lg shadow-primary-500/25"
                    >
                      {formatNumber(page, l)}
                    </span>
                  );
                }
                return (
                  <Link
                    key={page}
                    href={href}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                  >
                    {formatNumber(page, l)}
                  </Link>
                );
              })}

              {currentPage < totalPages ? (
                <Link
                  href={buildHref(l, { q, category, page: currentPage + 1 })}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700"
                >
                  {ui.next}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 dark:border-night-700 dark:bg-night-800 dark:text-slate-400">
                  {ui.next}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRTL ? "rotate-180" : ""}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </nav>
          </div>
        )}

        {/* ===== تنبيه ===== */}
        {gate.visible('k7') && (<>
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>
          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3].map((note, index) => (
              <li
                key={`note-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        </>)}
        {/* ===== روابط سريعة ===== */}
        {gate.visible('k8') && (<>
        <div className="card mt-8 p-6 md:p-8">
          <h2 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
            {isRTL ? "روابط مفيدة" : "Useful links"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📬</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contact}
                </h3>
              </div>
            </Link>
            <Link href={`/${l}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">⚖️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwa}
                </h3>
              </div>
            </Link>
            <Link href={`/${l}/dawah-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🤝</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahGuide}
                </h3>
              </div>
            </Link>
            <Link href={`/${l}/hajj-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕋</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.hajjGuide}
                </h3>
              </div>
            </Link>
          </div>
        </div>
        </>)}
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون بطاقة مقال مميز
// ============================================================

function FeaturedArticleCard({
  article,
  lang,
  isRTL,
  ui,
}: {
  article: Article;
  lang: Lang;
  isRTL: boolean;
  ui: UILang;
}) {
  const color = categoryColor(article.categoryId);

  return (
    <details className="card group relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${color}`} />

      <summary className="flex cursor-pointer list-none flex-col p-6 [&::-webkit-details-marker]:hidden">
        <div className="mb-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${color} px-3 py-1 text-xs font-bold text-white`}>
            {article.icon} {categoryLabel(article.categoryId, lang)}
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-night-800">
            {article.icon}
          </span>
        </div>

        <h3
          className="mb-2 text-lg font-black leading-tight text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {isRTL ? article.title.ar : article.title.en}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {isRTL ? article.excerpt.ar : article.excerpt.en}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formatDate(article.date, lang)}</span>
          <span>{article.readMinutes} {ui.minRead}</span>
        </div>

        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
          {ui.readArticle}
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
        {(isRTL ? article.content.ar : article.content.en).map((paragraph, index) => (
          <p key={index} className="mb-3 leading-relaxed text-slate-600 dark:text-slate-300">
            {paragraph}
          </p>
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          {(isRTL ? article.tags.ar : article.tags.en).map((tag) => (
            <span key={tag} className="badge-gold text-xs">#{tag}</span>
          ))}
        </div>
      </div>
    </details>
  );
}

// ============================================================
// مكون بطاقة مقال عادي
// ============================================================

function ArticleCard({
  article,
  lang,
  isRTL,
  ui,
}: {
  article: Article;
  lang: Lang;
  isRTL: boolean;
  ui: UILang;
}) {
  const content = isRTL ? article.content.ar : article.content.en;
  const tags = isRTL ? article.tags.ar : article.tags.en;

  return (
    <details id={article.id} className="card group scroll-mt-32 p-6 md:p-7">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="badge-primary">
              {categoryIcon(article.categoryId)} {categoryLabel(article.categoryId, lang)}
            </span>
            <span>{ui.publishedAt}: {formatDate(article.date, lang)}</span>
            <span>{formatNumber(article.readMinutes, lang)} {ui.readTime}</span>
          </div>

          <h3
            className="mb-2 text-xl font-black leading-relaxed text-slate-900 md:text-2xl dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {isRTL ? article.title.ar : article.title.en}
          </h3>

          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {isRTL ? article.excerpt.ar : article.excerpt.en}
          </p>

          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
            {ui.readArticle}
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
        </div>

        <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {article.icon}
        </span>
      </summary>

      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-night-700">
        {content.map((paragraph, index) => (
          <p key={`${article.id}-${index}`} className="leading-relaxed text-slate-600 dark:text-slate-300">
            {paragraph}
          </p>
        ))}

        <div>
          <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{ui.tags}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={`${article.id}-${tag}`} className="badge-gold text-xs">#{tag}</span>
            ))}
          </div>
        </div>

        {article.href ? (
          <Link href={article.href} className="btn-primary inline-flex">
            فتح المحتوى الكامل ←
          </Link>
        ) : null}
      </div>
    </details>
  );
}

