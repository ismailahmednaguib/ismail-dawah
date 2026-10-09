// app/[lang]/bookmarks/page.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
    confirmClear: "هل تريد حذف جميع العناصر المحفوظة؟",
    backHome: "العودة للرئيسية",
    count: "عدد العناصر",
    open: "فتح",
    noteTitle: "ملاحظة",
    note1:
      "المفضلة تُحفظ محليًا على جهازك داخل المتصفح، ولا تُرفع إلى السيرفر.",
    note2:
      "إذا مسحت بيانات المتصفح أو استخدمت جهازًا آخر، فقد لا تجد العناصر المحفوظة.",
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
    confirmClear: "Do you want to delete all saved items?",
    backHome: "Back to Home",
    count: "Items",
    open: "Open",
    noteTitle: "Notice",
    note1:
      "Bookmarks are stored locally in your browser and are not uploaded to the server.",
    note2:
      "If you clear browser data or use another device, saved items may not be available.",
  },
};

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  all: { ar: "الكل", en: "All" },
  quran: { ar: "قرآن", en: "Quran" },
  adhkar: { ar: "أذكار", en: "Adhkar" },
  fatwa: { ar: "فتاوى", en: "Fatwas" },
  articles: { ar: "مقالات", en: "Articles" },
  stories: { ar: "قصص", en: "Stories" },
  guides: { ar: "أدلة", en: "Guides" },
  other: { ar: "أخرى", en: "Other" },
};

// ============================================================
// دوال مساعدة
// ============================================================

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function categoryLabel(category: string, lang: Lang): string {
  const label = CATEGORY_LABELS[category];

  if (label) {
    return lang === "ar" ? label.ar : label.en;
  }

  return category;
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

// ============================================================
// الصفحة
// ============================================================

export default function BookmarksPage() {
  const pathname = usePathname();
  const lang: Lang = pathname.startsWith("/en") ? "en" : "ar";
  const ui = UI[lang];
  const isRTL = lang === "ar";

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loaded, setLoaded] = useState<boolean>(false);

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

  const categories = useMemo(() => {
    const unique = new Set(
      bookmarks.map((bookmark) => bookmark.category || "other")
    );

    return ["all", ...Array.from(unique)];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    if (filter === "all") {
      return bookmarks;
    }

    return bookmarks.filter(
      (bookmark) => (bookmark.category || "other") === filter
    );
  }, [bookmarks, filter]);

  function removeBookmark(id: string) {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }

  function clearAll() {
    if (window.confirm(ui.confirmClear)) {
      setBookmarks([]);
      setFilter("all");
    }
  }

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen">
      <section className="container-page py-10 md:py-14">
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
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

        {/* ===== إحصائيات بسيطة ===== */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-5 text-center">
            <p className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">
              {ui.count}
            </p>

            <p className="text-3xl font-black text-primary-700 dark:text-primary-300">
              {bookmarks.length}
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">
              {ui.category}
            </p>

            <p className="text-3xl font-black text-gold-700 dark:text-gold-300">
              {Math.max(categories.length - 1, 0)}
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? "معروض الآن" : "Currently shown"}
            </p>

            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {filtered.length}
            </p>
          </div>
        </div>

        {/* ===== الفلاتر ===== */}
        {bookmarks.length > 0 && (
          <div className="card mb-8 p-6 md:p-7">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
              {ui.category}
            </h2>

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const isActive = filter === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilter(category)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                    }`}
                  >
                    {categoryLabel(category, lang)}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                🗑️ {ui.clearAll}
              </button>

              <Link
                href={`/${lang}`}
                className="btn-outline"
              >
                {ui.backHome}
              </Link>
            </div>
          </div>
        )}

        {/* ===== حالة التحميل ===== */}
        {!loaded && (
          <div className="card p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {isRTL ? "جاري تحميل المفضلة..." : "Loading bookmarks..."}
            </p>
          </div>
        )}

        {/* ===== لا توجد عناصر ===== */}
        {loaded && bookmarks.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔖</div>

            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
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
            <div className="mb-4 text-5xl">📭</div>

            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noFilterResults}
            </h2>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noFilterResultsDesc}
            </p>

            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn-primary"
            >
              {ui.all}
            </button>
          </div>
        )}

        {/* ===== قائمة المفضلة ===== */}
        {loaded && filtered.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((bookmark) => (
              <article
                key={bookmark.id}
                className="card relative overflow-hidden p-6 md:p-7"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="badge-primary">
                    {categoryLabel(bookmark.category, lang)}
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

                <p className="mb-5 break-all text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {bookmark.url}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    {ui.open}
                  </a>

                  <button
                    type="button"
                    onClick={() => removeBookmark(bookmark.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    🗑️ {ui.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-8 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <h2
            className="mb-4 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}