// app/[lang]/news/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";

// ============================================================
// الأنواع
// ============================================================

type LocalizedText = {
  ar: string;
  en: string;
};

type NewsItem = {
  id: string;
  date: string;
  title: LocalizedText;
  body: LocalizedText;
  category: LocalizedText;
  icon: string;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  loading: string;
  noNewsTitle: string;
  noNewsDesc: string;
  newsCount: string;
  latest: string;
  publishedOn: string;
  share: string;
  copied: string;
  readMore: string;
  readLess: string;
  newsletterTitle: string;
  newsletterDesc: string;
  newsletterButton: string;
  verse: string;
  verseSource: string;
  latestBadge: string;
  retryButton: string;
  relatedTitle: string;
  livePage: string;
  livePageDesc: string;
  articlesPage: string;
  articlesPageDesc: string;
  khutabPage: string;
  khutabPageDesc: string;
  contactPage: string;
  contactPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  totalNews: string;
  latestNews: string;
  newsletter: string;
  subscribe: string;
  filterAll: string;
  searchPlaceholder: string;
  clearSearch: string;
  noSearchResults: string;
  noSearchResultsDesc: string;
  of: string;
  fetchError: string;
};

type ShareDataLike = {
  title?: string;
  text?: string;
  url?: string;
};

type ShareNavigator = Navigator & {
  share?: (data: ShareDataLike) => Promise<void>;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "الأخبار والنشاطات",
    subtitle: "تابع آخر أخبار ونشاطات الشيخ الدعوية",
    home: "الرئيسية",
    description:
      "صفحة الأخبار والنشاطات الدعوية للشيخ إسماعيل أحمد نجيب. تابع آخر الدروس، المحاضرات، الإعلانات، والأحداث.",
    loading: "جاري تحميل الأخبار...",
    noNewsTitle: "لا توجد أخبار حاليًا",
    noNewsDesc: "ترقب آخر الأخبار قريبًا بإذن الله.",
    newsCount: "خبر",
    latest: "الأحدث",
    publishedOn: "نُشر في",
    share: "مشاركة الخبر",
    copied: "تم نسخ الرابط!",
    readMore: "اقرأ المزيد",
    readLess: "اقرأ أقل",
    newsletterTitle: "لا تفوّت أي خبر",
    newsletterDesc:
      "اشترك في نشرتنا البريدية لتصلك آخر الأخبار والدروس والفتاوى مباشرة إلى بريدك الإلكتروني.",
    newsletterButton: "اشترك الآن",
    verse: "﴿ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴾",
    verseSource: "سورة العصر — الآية 3",
    latestBadge: "الأحدث",
    retryButton: "إعادة المحاولة",
    relatedTitle: "صفحات ذات صلة",
    livePage: "البث المباشر",
    livePageDesc: "تابع الدروس الحية.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    khutabPage: "مكتبة الخطب",
    khutabPageDesc: "خطب جمعة للأئمة والدعاة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "أرسل استفسارك.",
    noteTitle: "تنبيه",
    note1:
      "الأخبار تُنشر بشكل دوري، ويمكن متابعتها أيضًا عبر البث المباشر وقناة اليوتيوب الرسمية.",
    note2:
      "للأسئلة والاستفسارات الخاصة، يُرجى استخدام صفحة التواصل المباشر.",
    totalNews: "إجمالي الأخبار",
    latestNews: "آخر خبر",
    newsletter: "النشرة البريدية",
    subscribe: "اشترك",
    filterAll: "الكل",
    searchPlaceholder: "ابحث في الأخبار...",
    clearSearch: "مسح البحث",
    noSearchResults: "لا توجد أخبار مطابقة",
    noSearchResultsDesc: "جرّب كلمة بحث أخرى.",
    of: "من",
    fetchError: "تعذّر تحميل الأخبار من السيرفر، تم عرض محتوى احتياطي.",
  },
  en: {
    title: "News & Activities",
    subtitle: "Follow the latest news and dawah activities of the Sheikh",
    home: "Home",
    description:
      "News and dawah activities page of Sheikh Ismail Ahmed Naguib. Follow the latest lessons, lectures, announcements, and events.",
    loading: "Loading news...",
    noNewsTitle: "No news currently",
    noNewsDesc: "Stay tuned for the latest news soon, in sha Allah.",
    newsCount: "News",
    latest: "Latest",
    publishedOn: "Published on",
    share: "Share News",
    copied: "Link copied!",
    readMore: "Read More",
    readLess: "Read Less",
    newsletterTitle: "Don't Miss Any News",
    newsletterDesc:
      "Subscribe to our newsletter to receive the latest news, lessons, and fatwas directly to your email.",
    newsletterButton: "Subscribe Now",
    verse:
      "\"And advise each other to truth and advise each other to patience.\"",
    verseSource: "Surah Al-Asr — Verse 3",
    latestBadge: "Latest",
    retryButton: "Retry",
    relatedTitle: "Related Pages",
    livePage: "Live Stream",
    livePageDesc: "Follow live lessons.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    khutabPage: "Khutbah Library",
    khutabPageDesc: "Friday sermons for Imams.",
    contactPage: "Contact Us",
    contactPageDesc: "Send your inquiry.",
    noteTitle: "Notice",
    note1:
      "News is published periodically and can also be followed through the live stream and official YouTube channel.",
    note2:
      "For private questions and inquiries, please use the direct contact page.",
    totalNews: "Total News",
    latestNews: "Latest News",
    newsletter: "Newsletter",
    subscribe: "Subscribe",
    filterAll: "All",
    searchPlaceholder: "Search news...",
    clearSearch: "Clear search",
    noSearchResults: "No matching news",
    noSearchResultsDesc: "Try a different search keyword.",
    of: "of",
    fetchError:
      "Could not load news from the server. Fallback content is shown.",
  },
};

// ============================================================
// بيانات احتياطية
// ============================================================

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    date: "2026-10-05",
    icon: "🎤",
    category: { ar: "دروس", en: "Lessons" },
    title: {
      ar: "بدء سلسلة دروس جديدة في السيرة النبوية",
      en: "New Series on Prophetic Biography Begins",
    },
    body: {
      ar: "يُسعدنا الإعلان عن بدء سلسلة دروس أسبوعية جديدة في السيرة النبوية العطرة، تُعقد كل اثنين بعد صلاة العشاء. تتناول السيرة بأسلوب تربوي يربط الأحداث بواقعنا المعاصر، وتستخرج الدروس والعبر من حياة النبي ﷺ.",
      en: "We are pleased to announce the start of a new weekly series on the Prophetic Biography, held every Monday after Isha prayer. The series approaches the Seerah with an educational method linking events to our contemporary reality and extracting lessons from the Prophet's ﷺ life.",
    },
  },
  {
    id: "news-2",
    date: "2026-09-28",
    icon: "📚",
    category: { ar: "إصدارات", en: "Releases" },
    title: {
      ar: "إصدار كتاب جديد: معالم في طريق الطلب",
      en: "New Book Released: Milestones on the Path of Seeking Knowledge",
    },
    body: {
      ar: "صدر بحمد الله كتاب \"معالم في طريق الطلب\" وهو كتاب تربوي موجه لطلاب العلم المبتدئين، يجمع خلاصة تجارب الشيخ في طلب العلم والتدرج فيه، مع نصائح عملية من تراث السلف.",
      en: "By the grace of Allah, the book \"Milestones on the Path of Seeking Knowledge\" has been released. It is an educational book directed to beginner students of knowledge, collecting the Sheikh's experiences in seeking knowledge with practical advice from the heritage of the Salaf.",
    },
  },
  {
    id: "news-3",
    date: "2026-09-20",
    icon: "🕌",
    category: { ar: "مناسبات", en: "Occasions" },
    title: {
      ar: "برنامج خاص في العشر من ذي الحجة",
      en: "Special Program in the First Ten Days of Dhul-Hijjah",
    },
    body: {
      ar: "يسرنا أن نعلن عن برنامج دعوي مكثف خلال العشر الأوائل من ذي الحجة، يتضمن دروسًا يومية في التفسير والحديث، ومجالس ذكر، وختمة دعاء جماعية في ليلة عرفة.",
      en: "We are pleased to announce an intensive dawah program during the first ten days of Dhul-Hijjah, including daily lessons in tafsir and hadith, remembrance gatherings, and a collective dua khatm on the night of Arafah.",
    },
  },
  {
    id: "news-4",
    date: "2026-09-10",
    icon: "🌐",
    category: { ar: "إعلانات", en: "Announcements" },
    title: {
      ar: "إطلاق النسخة الإنجليزية من المنصة",
      en: "Launch of the English Version of the Platform",
    },
    body: {
      ar: "بحمد الله تم إطلاق النسخة الإنجليزية الكاملة من منصة إسماعيل أحمد نجيب، لتصل الدعوة إلى شريحة أوسع من المسلمين الناطقين بالإنجليزية والباحثين عن الحق حول العالم.",
      en: "By the grace of Allah, the complete English version of the Ismail Ahmed Naguib Platform has been launched, to reach a wider audience of English-speaking Muslims and truth-seekers around the world.",
    },
  },
];

// ============================================================
// دوال مساعدة آمنة
// ============================================================

function safeText(value: unknown, fallback = "", depth = 0): string {
  if (depth > 4) {
    return fallback;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => safeText(item, "", depth + 1))
      .filter(Boolean)
      .join(" ");

    return joined || fallback;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    return (
      safeText(obj.ar, "", depth + 1) ||
      safeText(obj.en, "", depth + 1) ||
      safeText(obj.name, "", depth + 1) ||
      safeText(obj.title, "", depth + 1) ||
      safeText(obj.text, "", depth + 1) ||
      safeText(obj.value, "", depth + 1) ||
      safeText(obj.label, "", depth + 1) ||
      safeText(obj.icon, "", depth + 1) ||
      fallback
    );
  }

  return fallback;
}

function safeLocalized(
  value: unknown,
  fallback: LocalizedText
): LocalizedText {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const ar = safeText(obj.ar, "");
    const en = safeText(obj.en, "");

    if (ar || en) {
      return {
        ar: ar || en || fallback.ar,
        en: en || ar || fallback.en,
      };
    }
  }

  const text = safeText(value, fallback.ar);

  return {
    ar: text || fallback.ar,
    en: text || fallback.en,
  };
}

function normalizeId(value: unknown, fallback: string): string {
  const raw = safeText(value, fallback);
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || fallback;
}

function normalizeDate(value: unknown): string {
  const raw = safeText(value, "");

  if (!raw) {
    return new Date().toISOString();
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function normalizeNewsItem(raw: unknown, index: number): NewsItem {
  const item =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const fallbackId = `news-${index}`;

  return {
    id: normalizeId(item.id ?? item._id ?? item.slug, fallbackId),
    date: normalizeDate(
      item.date ?? item.publishedAt ?? item.createdAt ?? item.updatedAt
    ),
    icon: safeText(item.icon ?? item.emoji, "📰"),
    category: safeLocalized(item.category ?? item.type ?? item.tag ?? item.section, {
      ar: "أخبار",
      en: "News",
    }),
    title: safeLocalized(item.title ?? item.name ?? item.headline, {
      ar: "خبر بدون عنوان",
      en: "Untitled news",
    }),
    body: safeLocalized(
      item.body ?? item.content ?? item.description ?? item.text ?? item.excerpt,
      {
        ar: "",
        en: "",
      }
    ),
  };
}

function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr || "—";
  }

  try {
    return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date.toDateString();
  }
}

function getRelativeTime(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffMs = Date.now() - date.getTime();

  if (diffMs < 0) {
    return lang === "ar" ? "قريبًا" : "Soon";
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === "ar") {
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "أمس";
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
  }

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getShareUrl(lang: Lang, itemId: string): string {
  const path = `/${lang}/news#${encodeURIComponent(itemId)}`;

  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ============================================================
// المكون الرئيسي
// ============================================================

export default function NewsPage() {
  const routeParams = useParams();
  const rawLang = routeParams?.lang;
  const langString = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  const L: Lang = langString === "en" ? "en" : "ar";
  const isRTL = L === "ar";
  const ui = UI[L];

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fontAmiri = {
    fontFamily: "var(--font-amiri-source), 'Amiri', serif",
  };

  const fontQuran = {
    fontFamily:
      "var(--font-scheherazade-source), 'Scheherazade New', serif",
  };

  // ===== جلب الأخبار =====
  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/content", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as unknown;

      const root =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : {};

      const content =
        root.content && typeof root.content === "object" && !Array.isArray(root.content)
          ? (root.content as Record<string, unknown>)
          : {};

      const rawNews = Array.isArray(content.news) ? content.news : [];

      const items = rawNews
        .map((item, index) => normalizeNewsItem(item, index))
        .filter((item) => item.title.ar.trim() || item.title.en.trim());

      setNews(items.length > 0 ? items : FALLBACK_NEWS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "fetch_failed");
      setNews(FALLBACK_NEWS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  // ===== ترتيب حسب التاريخ =====
  const sortedNews = useMemo(() => {
    return [...news].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [news]);

  // ===== فلترة البحث =====
  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return sortedNews;
    }

    return sortedNews.filter((n) => {
      const haystack = [
        n.title.ar,
        n.title.en,
        n.body.ar,
        n.body.en,
        n.category.ar,
        n.category.en,
      ];

      return haystack.some((value) => value.toLowerCase().includes(q));
    });
  }, [sortedNews, searchQuery]);

  const latestNews = sortedNews[0] ?? null;

  // ===== المشاركة =====
  const handleShare = async (item: NewsItem) => {
    const shareData: ShareDataLike = {
      title: item.title[L] || ui.title,
      text: (item.body[L] || "").slice(0, 200),
      url: getShareUrl(L, item.id),
    };

    try {
      const nav =
        typeof navigator !== "undefined"
          ? (navigator as ShareNavigator)
          : undefined;

      if (nav?.share) {
        await nav.share(shareData);
        return;
      }

      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );

        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // تجاهل أخطاء المشاركة مثل إلغاء المستخدم
    }
  };

  // ===== JSON-LD =====
  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: ui.title,
          description: ui.description,
          inLanguage: L,
          url: `/${L}/news`,
        },
        ...sortedNews.slice(0, 10).map((item) => ({
          "@type": "NewsArticle",
          headline: item.title[L],
          description: (item.body[L] || "").slice(0, 200),
          datePublished: item.date,
          inLanguage: L,
          author: {
            "@type": "Person",
            name: isRTL ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib",
          },
        })),
      ],
    };
  }, [sortedNews, L, ui.title, ui.description, isRTL]);

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-cream-dark dark:bg-gray-900"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
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
        {/* ===== تنبيه خطأ التحميل ===== */}
        {error && !loading && (
          <div className="card mb-6 border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                ⚠️ {ui.fetchError}
              </p>

              <button
                type="button"
                onClick={() => void loadNews()}
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
              >
                🔄 {ui.retryButton}
              </button>
            </div>
          </div>
        )}

        {/* ===== Hero ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-blue-800 dark:from-blue-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #2563eb, #0e7490)" }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">📰 {ui.title}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={fontAmiri}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={fontQuran}
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon="📰"
            label={ui.totalNews}
            value={news.length}
            color="primary"
          />

          <StatCard
            icon="🆕"
            label={ui.latestNews}
            value={
              latestNews ? getRelativeTime(latestNews.date, L) : "—"
            }
            color="gold"
            isSmall
          />

          <StatCard
            icon="📧"
            label={ui.newsletter}
            value="✓"
            color="primary"
          />
        </div>

        {/* ===== حالة التحميل ===== */}
        {loading && (
          <div className="space-y-5" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-night-700" />
                  <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-night-700" />
                </div>
                <div className="mb-3 h-7 w-3/4 rounded bg-slate-200 dark:bg-night-700" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-night-700" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-night-700" />
              </div>
            ))}
          </div>
        )}

        {/* ===== لا توجد أخبار ===== */}
        {!loading && news.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl dark:bg-night-800">
                📰
              </span>
            </div>

            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {ui.noNewsTitle}
            </h2>

            <p className="text-slate-500 dark:text-slate-400">
              {ui.noNewsDesc}
            </p>
          </div>
        )}

        {/* ===== المحتوى الرئيسي ===== */}
        {!loading && news.length > 0 && (
          <>
            {/* البحث */}
            <div className="card mb-8 p-6 md:p-7">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={ui.searchPlaceholder}
                    className="input-islamic !ps-12"
                    aria-label={ui.searchPlaceholder}
                  />
                </div>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn-outline whitespace-nowrap"
                  >
                    ✕ {ui.clearSearch}
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                📊 {filteredNews.length} {ui.of} {news.length} {ui.newsCount}
              </p>
            </div>

            {/* الخبر المميز */}
            {!searchQuery && latestNews && (
              <article
                id={latestNews.id}
                className="card relative mb-10 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-10 dark:border-gold-700 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30"
              >
                <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

                <div className="absolute top-4 end-4 flex items-center gap-2 rounded-full bg-gold-500 px-3 py-1 text-xs font-black text-white shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  🆕 {ui.latestBadge}
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-3xl text-white shadow-lg">
                    {latestNews.icon || "📰"}
                  </span>

                  <span className="badge-primary">
                    {latestNews.category[L]}
                  </span>
                </div>

                <h2
                  className="mb-3 text-2xl font-black leading-tight text-slate-900 md:text-3xl dark:text-white"
                  style={fontAmiri}
                >
                  {latestNews.title[L]}
                </h2>

                <p className="mb-4 text-sm font-semibold text-gold-700 dark:text-gold-300">
                  📅 {formatDate(latestNews.date, L)}
                </p>

                <p className="mb-6 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                  {latestNews.body[L]}
                </p>

                <button
                  type="button"
                  onClick={() => void handleShare(latestNews)}
                  className="btn-primary inline-flex items-center gap-2"
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
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>

                  {copiedId === latestNews.id ? ui.copied : ui.share}
                </button>
              </article>
            )}

            {/* باقي الأخبار */}
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={fontAmiri}
              >
                📢{" "}
                {searchQuery
                  ? `${filteredNews.length} ${ui.newsCount}`
                  : ui.newsCount}
              </h2>
            </div>

            {filteredNews.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="mb-3 text-4xl">🔍</div>

                <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {ui.noSearchResults}
                </h3>

                <p className="mb-5 text-slate-500 dark:text-slate-400">
                  {ui.noSearchResultsDesc}
                </p>

                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn-primary"
                >
                  ✕ {ui.clearSearch}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredNews.map((n, i) => {
                  const isExpanded = expandedId === n.id;
                  const isLatest =
                    !searchQuery &&
                    i === 0 &&
                    sortedNews[0]?.id === n.id;

                  return (
                    <article
                      key={n.id}
                      id={n.id}
                      className={`card group relative overflow-hidden p-6 transition-all md:p-7 ${
                        isLatest ? "hidden" : ""
                      }`}
                    >
                      <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                          📅 {formatDate(n.date, L)}
                        </span>

                        <span className="badge-primary">
                          {n.icon || "📰"} {n.category[L]}
                        </span>

                        {isLatest && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            🆕 {ui.latestBadge}
                          </span>
                        )}

                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ⏱️ {getRelativeTime(n.date, L)}
                        </span>
                      </div>

                      <h3
                        className="mb-3 text-xl font-black leading-tight text-slate-900 md:text-2xl dark:text-white"
                        style={fontAmiri}
                      >
                        {n.title[L]}
                      </h3>

                      <div className="relative">
                        <p
                          className={`whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-200 ${
                            isExpanded ? "" : "line-clamp-4"
                          }`}
                        >
                          {n.body[L]}
                        </p>

                        {(n.body[L] || "").length > 300 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : n.id)
                            }
                            className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
                          >
                            {isExpanded ? ui.readLess : ui.readMore}

                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-night-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {ui.publishedOn}: {formatDate(n.date, L)}
                        </span>

                        <button
                          type="button"
                          onClick={() => void handleShare(n)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-2 text-sm font-bold text-gold-700 transition-all hover:bg-gold-100 dark:border-gold-800/50 dark:bg-gold-950/30 dark:text-gold-300 dark:hover:bg-gold-900/40"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>

                          {copiedId === n.id ? ui.copied : ui.share}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== Newsletter CTA ===== */}
        <div
          id="newsletter"
          className="card relative mt-12 overflow-hidden border-2 border-primary-300 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 text-center md:p-12 dark:border-primary-700 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30"
        >
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mb-4 flex justify-center">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-3xl text-5xl text-white shadow-2xl"
              style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
            >
              📧
            </span>
          </div>

          <h3
            className="mb-3 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
            style={fontAmiri}
          >
            {ui.newsletterTitle}
          </h3>

          <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.newsletterDesc}
          </p>

          <Link
            href={`/${L}#newsletter`}
            className="btn-primary inline-flex items-center gap-2"
          >
            📧 {ui.newsletterButton}
          </Link>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={fontAmiri}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${L}/live`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📡
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.livePage}
                </h3>

                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.livePageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/articles`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
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

            <Link
              href={`/${L}/khutab`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🎤
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.khutabPage}
                </h3>

                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.khutabPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/contact`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>

                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيه ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h3
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={fontAmiri}
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
              </ul>
            </div>
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
  isSmall = false,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "gold";
  isSmall?: boolean;
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

      <p
        className={`${isSmall ? "text-sm" : "text-2xl"} font-black ${
          colorClasses[color]
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}