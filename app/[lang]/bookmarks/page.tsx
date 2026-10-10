// app/[lang]/bookmarks/page.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type Lang = "ar" | "en";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: number;
  excerpt?: string;
};

type UILang = {
  title: string;
  subtitle: string;
  description: string;
  home: string;
  empty: string;
  emptyDesc: string;
  noFilterResults: string;
  noFilterResultsDesc: string;
  all: string;
  category: string;
  addedAt: string;
  remove: string;
  clearAll: string;
  confirmClear: string;
  backHome: string;
  count: string;
  open: string;
  noteTitle: string;
  note1: string;
  note2: string;
  search: string;
  searchPlaceholder: string;
  export: string;
  import: string;
  exportSuccess: string;
  importSuccess: string;
  importError: string;
  categoriesCount: string;
  shownNow: string;
  newest: string;
  oldest: string;
  sortBy: string;
  noSearchResults: string;
  noSearchResultsDesc: string;
  clearSearch: string;
};

// ============================================================
// الثوابت
// ============================================================

const STORAGE_KEY = "ismail-dawah-bookmarks";

const UI: Record<Lang, UILang> = {
  ar: {
    title: "المفضلة",
    subtitle: "العناصر التي حفظتها سابقًا",
    description:
      "راجع العناصر التي قمت بحفظها في المنصة، مثل السور، الأذكار، الفتاوى، المقالات، أو أي صفحة أعجبتك.",
    home: "الرئيسية",
    empty: "لا توجد عناصر محفوظة",
    emptyDesc:
      "لم تقم بحفظ أي عنصر بعد. استخدم زر الحفظ في الصفحات لإضافة عناصر إلى المفضلة.",
    noFilterResults: "لا توجد نتائج في هذا التصنيف",
    noFilterResultsDesc: "جرّب تصنيفًا آخر أو اعرض كل العناصر.",
    all: "الكل",
    category: "التصنيف",
    addedAt: "أُضيف في",
    remove: "إزالة",
    clearAll: "حذف الكل",
    confirmClear: "هل تريد حذف جميع العناصر المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.",
    backHome: "العودة للرئيسية",
    count: "عدد العناصر",
    open: "فتح",
    noteTitle: "ملاحظة",
    note1:
      "المفضلة تُحفظ محليًا على جهازك داخل المتصفح، ولا تُرفع إلى السيرفر.",
    note2:
      "إذا مسحت بيانات المتصفح أو استخدمت جهازًا آخر، فقد لا تجد العناصر المحفوظة. استخدم زر التصدير لحفظ نسخة احتياطية.",
    search: "بحث",
    searchPlaceholder: "ابحث في العناصر المحفوظة...",
    export: "تصدير المفضلة",
    import: "استيراد المفضلة",
    exportSuccess: "تم تصدير المفضلة بنجاح",
    importSuccess: "تم استيراد المفضلة بنجاح",
    importError: "فشل استيراد الملف. تأكد من صحة التنسيق.",
    categoriesCount: "التصنيفات",
    shownNow: "معروض الآن",
    newest: "الأحدث أولاً",
    oldest: "الأقدم أولاً",
    sortBy: "ترتيب حسب",
    noSearchResults: "لا توجد نتائج للبحث",
    noSearchResultsDesc: "جرّب كلمات بحث مختلفة.",
    clearSearch: "مسح البحث",
  },
  en: {
    title: "Bookmarks",
    subtitle: "Items you saved earlier",
    description:
      "Review items you saved on the platform, such as surahs, adhkar, fatwas, articles, or any page you liked.",
    home: "Home",
    empty: "No saved items",
    emptyDesc:
      "You have not saved any item yet. Use the save button on pages to add items to bookmarks.",
    noFilterResults: "No results in this category",
    noFilterResultsDesc: "Try another category or show all items.",
    all: "All",
    category: "Category",
    addedAt: "Added at",
    remove: "Remove",
    clearAll: "Clear all",
    confirmClear: "Do you want to delete all saved items? This action cannot be undone.",
    backHome: "Back to Home",
    count: "Items",
    open: "Open",
    noteTitle: "Notice",
    note1:
      "Bookmarks are stored locally in your browser and are not uploaded to the server.",
    note2:
      "If you clear browser data or use another device, saved items may not be available. Use the export button to save a backup.",
    search: "Search",
    searchPlaceholder: "Search saved items...",
    export: "Export bookmarks",
    import: "Import bookmarks",
    exportSuccess: "Bookmarks exported successfully",
    importSuccess: "Bookmarks imported successfully",
    importError: "Failed to import file. Please check the format.",
    categoriesCount: "Categories",
    shownNow: "Currently shown",
    newest: "Newest first",
    oldest: "Oldest first",
    sortBy: "Sort by",
    noSearchResults: "No search results",
    noSearchResultsDesc: "Try different search keywords.",
    clearSearch: "Clear search",
  },
};

const CATEGORY_CONFIG: Record<string, { ar: string; en: string; icon: string; color: string }> = {
  all: { ar: "الكل", en: "All", icon: "📚", color: "from-slate-500 to-slate-600" },
  quran: { ar: "قرآن", en: "Quran", icon: "📖", color: "from-green-500 to-green-600" },
  adhkar: { ar: "أذكار", en: "Adhkar", icon: "🤲", color: "from-primary-500 to-primary-600" },
  fatwa: { ar: "فتاوى", en: "Fatwas", icon: "⚖️", color: "from-blue-500 to-blue-600" },
  articles: { ar: "مقالات", en: "Articles", icon: "✍️", color: "from-amber-500 to-amber-600" },
  stories: { ar: "قصص", en: "Stories", icon: "📜", color: "from-purple-500 to-purple-600" },
  guides: { ar: "أدلة", en: "Guides", icon: "🗺️", color: "from-teal-500 to-teal-600" },
  other: { ar: "أخرى", en: "Other", icon: "📌", color: "from-gray-500 to-gray-600" },
};

// ============================================================
// دوال مساعدة
// ============================================================

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function categoryLabel(category: string, lang: Lang): string {
  const config = CATEGORY_CONFIG[category];
  if (config) {
    return lang === "ar" ? config.ar : config.en;
  }
  return category;
}

function categoryIcon(category: string): string {
  return CATEGORY_CONFIG[category]?.icon ?? "📌";
}

function categoryColor(category: string): string {
  return CATEGORY_CONFIG[category]?.color ?? "from-gray-500 to-gray-600";
}

function formatDate(timestamp: number, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// ============================================================
// الصفحة
// ============================================================

export default function BookmarksPage() {
  const pathname = usePathname();
  const lang: Lang = pathname.startsWith("/en") ? "en" : "ar";
  const ui = UI[lang];
  const isRTL = lang === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [loaded, setLoaded] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // تحميل المفضلة من localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          const normalized: Bookmark[] = parsed
            .map((item: any) => ({
              id: String(item?.id ?? createId()),
              title: String(item?.title ?? ""),
              url: String(item?.url ?? "#"),
              category: String(item?.category ?? "other"),
              createdAt: Number(item?.createdAt ?? Date.now()),
              excerpt: item?.excerpt ? String(item.excerpt) : undefined,
            }))
            .filter(
              (item) =>
                item.id &&
                item.title &&
                isSafeUrl(item.url)
            );

          setBookmarks(normalized);
        }
      }
    } catch {
      // تجاهل أخطاء القراءة
    }

    setLoaded(true);
  }, []);

  // حفظ المفضلة في localStorage
  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // تجاهل أخطاء الحفظ
    }
  }, [bookmarks, loaded]);

  // عرض الإشعارات
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const categories = useMemo(() => {
    const unique = new Set(
      bookmarks.map((bookmark) => bookmark.category || "other")
    );
    return ["all", ...Array.from(unique)];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    let result = bookmarks;

    // فلتر التصنيف
    if (filter !== "all") {
      result = result.filter(
        (bookmark) => (bookmark.category || "other") === filter
      );
    }

    // فلتر البحث
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(
        (bookmark) =>
          normalize(bookmark.title).includes(q) ||
          normalize(bookmark.category).includes(q) ||
          (bookmark.excerpt && normalize(bookmark.excerpt).includes(q))
      );
    }

    // الترتيب
    result = [...result].sort((a, b) => {
      return sortBy === "newest"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt;
    });

    return result;
  }, [bookmarks, filter, searchQuery, sortBy]);

  function removeBookmark(id: string) {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }

  function clearAll() {
    if (window.confirm(ui.confirmClear)) {
      setBookmarks([]);
      setFilter("all");
      setSearchQuery("");
    }
  }

  function exportBookmarks() {
    try {
      const data = JSON.stringify(bookmarks, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ismail-dawah-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotification({ type: "success", message: ui.exportSuccess });
    } catch {
      setNotification({ type: "error", message: ui.importError });
    }
  }

  function importBookmarks(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed)) {
          const imported: Bookmark[] = parsed
            .map((item: any) => ({
              id: String(item?.id ?? createId()),
              title: String(item?.title ?? ""),
              url: String(item?.url ?? "#"),
              category: String(item?.category ?? "other"),
              createdAt: Number(item?.createdAt ?? Date.now()),
              excerpt: item?.excerpt ? String(item.excerpt) : undefined,
            }))
            .filter((item) => item.id && item.title && isSafeUrl(item.url));

          // دمج مع الموجود (تجنب التكرار)
          setBookmarks((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const newItems = imported.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });

          setNotification({ type: "success", message: ui.importSuccess });
        } else {
          setNotification({ type: "error", message: ui.importError });
        }
      } catch {
        setNotification({ type: "error", message: ui.importError });
      }
    };
    reader.readAsText(file);

    // إعادة تعيين الحقل
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ui.title,
    description: ui.description,
    inLanguage: lang,
    url: `/${lang}/bookmarks`,
    isPartOf: {
      "@type": "WebSite",
      name: isRTL ? "منصة إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib Platform",
      url: `/${lang}`,
    },
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={lang} />

      {/* ===== إشعار ===== */}
      {notification && (
        <div
          className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? "✓" : "✗"} {notification.message}
        </div>
      )}

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🔖 {isRTL ? "عناصر محفوظة" : "Saved items"}
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
          </div>
        </div>

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="🔖"
            label={ui.count}
            value={bookmarks.length}
            color="primary"
          />
          <StatCard
            icon="📂"
            label={ui.categoriesCount}
            value={Math.max(categories.length - 1, 0)}
            color="gold"
          />
          <StatCard
            icon="👁️"
            label={ui.shownNow}
            value={filtered.length}
            color="slate"
          />
          <StatCard
            icon="⚡"
            label={isRTL ? "الأحدث" : "Newest"}
            value={
              bookmarks.length > 0
                ? new Date(bookmarks[bookmarks.length - 1]?.createdAt ?? Date.now()).toLocaleDateString(
                    lang === "ar" ? "ar-EG" : "en-US",
                    { month: "short", day: "numeric" }
                  )
                : "—"
            }
            color="primary"
          />
        </div>

        {/* ===== أدوات التحكم ===== */}
        {bookmarks.length > 0 && (
          <div className="card mb-8 p-6 md:p-7">
            {/* البحث والفرز */}
            <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={ui.searchPlaceholder}
                  className="input-islamic !ps-12"
                  aria-label={ui.searchPlaceholder}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="input-islamic md:w-48"
                aria-label={ui.sortBy}
              >
                <option value="newest">{ui.newest}</option>
                <option value="oldest">{ui.oldest}</option>
              </select>
            </div>

            {/* الفلاتر */}
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
              {ui.category}
            </h2>

            <div className="mb-5 flex flex-wrap gap-3">
              {categories.map((category) => {
                const isActive = filter === category;
                const icon = categoryIcon(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilter(category)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${categoryColor(category)} text-white shadow-lg`
                        : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{categoryLabel(category, lang)}</span>
                    {category !== "all" && (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black">
                        {bookmarks.filter((b) => b.category === category).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportBookmarks}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-bold text-primary-700 transition-all hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {ui.export}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-2.5 text-sm font-bold text-gold-700 transition-all hover:bg-gold-100 dark:border-gold-800 dark:bg-gold-950/30 dark:text-gold-300 dark:hover:bg-gold-900/30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {ui.import}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importBookmarks}
                className="hidden"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700"
                >
                  ✗ {ui.clearSearch}
                </button>
              )}

              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                🗑️ {ui.clearAll}
              </button>

              <Link href={`/${lang}`} className="btn-outline ms-auto">
                {ui.backHome}
              </Link>
            </div>
          </div>
        )}

        {/* ===== حالة التحميل ===== */}
        {!loaded && (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="mb-4 h-6 w-24 rounded bg-slate-200 dark:bg-night-700" />
                <div className="mb-2 h-8 w-3/4 rounded bg-slate-200 dark:bg-night-700" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-night-700" />
              </div>
            ))}
          </div>
        )}

        {/* ===== لا توجد عناصر ===== */}
        {loaded && bookmarks.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl dark:bg-night-800">
                🔖
              </span>
            </div>

            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {ui.empty}
            </h2>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.emptyDesc}
            </p>

            <Link href={`/${lang}`} className="btn-primary">
              {ui.backHome}
            </Link>
          </div>
        )}

        {/* ===== لا توجد نتائج في الفلتر ===== */}
        {loaded && bookmarks.length > 0 && filtered.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl dark:bg-night-800">
                {searchQuery ? "🔍" : "📭"}
              </span>
            </div>

            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {searchQuery ? ui.noSearchResults : ui.noFilterResults}
            </h2>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {searchQuery ? ui.noSearchResultsDesc : ui.noFilterResultsDesc}
            </p>

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="btn-primary"
              >
                {ui.clearSearch}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="btn-primary"
              >
                {ui.all}
              </button>
            )}
          </div>
        )}

        {/* ===== قائمة المفضلة ===== */}
        {loaded && filtered.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((bookmark) => {
              const icon = categoryIcon(bookmark.category);
              const color = categoryColor(bookmark.category);

              return (
                <article
                  key={bookmark.id}
                  className="card card-interactive group relative overflow-hidden p-6 md:p-7"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${color} px-3 py-1 text-xs font-bold text-white`}>
                      {icon} {categoryLabel(bookmark.category, lang)}
                    </span>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {ui.addedAt}: {formatDate(bookmark.createdAt, lang)}
                    </span>
                  </div>

                  <h3
                    className="mb-2 text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {bookmark.title}
                  </h3>

                  {bookmark.excerpt && (
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {bookmark.excerpt}
                    </p>
                  )}

                  <p className="mb-5 break-all text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                    {bookmark.url}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {ui.open}
                    </a>

                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      {ui.remove}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-8 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h2
                className="mb-4 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h2>

              <ul className="space-y-3">
                {[ui.note1, ui.note2].map((note, index) => (
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
          </div>
        </div>
      </section>

      <Footer lang={lang} />
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
  value: string | number;
  color: "primary" | "gold" | "slate";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
    slate: "text-slate-900 dark:text-white",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}