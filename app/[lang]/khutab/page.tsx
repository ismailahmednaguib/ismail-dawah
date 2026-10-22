// app/[lang]/khutab/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";
import type { PublicItem } from "@/lib/learn/public";

import { usePageGate } from "@/components/PageGate";
// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string; [key: string]: string };

type Khutbah = {
  id: string;
  category: Localized;
  categoryIcon: string;
  gradient: string;
  title: Localized;
  intro: Localized;
  verse: Localized;
  verseSource: Localized;
  points: Localized[];
  khatima: Localized;
  icon: string;
  /** تاريخ النشر من الـCMS (published_at). */
  date: string | null;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    serviceTitle: string;
    serviceDesc: string;
    allCategory: string;
    khutabCount: string;
    selectHint: string;
    backToList: string;
    introLabel: string;
    pointsLabel: string;
    khatimaLabel: string;
    share: string;
    print: string;
    elementsCount: string;
    verse: string;
    verseSource: string;
    categoriesCount: string;
    sharable: string;
    printable: string;
    relatedTitle: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    dawahPage: string;
    dawahPageDesc: string;
    quranPage: string;
    quranPageDesc: string;
    heroVerse: string;
    heroVerseSource: string;
    noteTitle: string;
    note1: string;
    note2: string;
  }
> = {
  ar: {
    title: "مكتبة الخطب",
    subtitle: "خطب جمعة جاهزة للأئمة والدعاة",
    home: "الرئيسية",
    description:
      "مجموعة من الخطب المنهجية الجاهزة بخطوطها العريضة، يمكنك استخدامها أو الاستلهام منها في خطب الجمعة والمحاضرات.",
    serviceTitle: "خدمة للأئمة والدعاة",
    serviceDesc:
      "مجموعة من الخطب المنهجية الجاهزة، يمكنك استخدامها أو الاستلهام منها في خطبك. كل خطبة متكاملة بعناصرها وخاتمتها.",
    allCategory: "الكل",
    khutabCount: "خطبة",
    selectHint: "اختر الخطبة لعرض تفاصيلها",
    backToList: "العودة لقائمة الخطب",
    introLabel: "المقدمة",
    pointsLabel: "عناصر الخطبة",
    khatimaLabel: "الخاتمة والدعاء",
    share: "مشاركة الخطبة",
    print: "طباعة",
    elementsCount: "عناصر",
    verse: "الآية",
    verseSource: "المصدر",
    categoriesCount: "تصنيف",
    sharable: "قابلة للمشاركة",
    printable: "قابلة للطباعة",
    relatedTitle: "صفحات ذات صلة",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية متنوعة.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "أصول الدعوة ومهاراتها.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع إلى كتاب الله.",
    heroVerse: "﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ ﴾",
    heroVerseSource: "سورة الجمعة — الآية 9",
    noteTitle: "تنبيه مهم",
    note1: "هذه الخطب للاسترشاد والاستلهام، والأولى أن يعدّ الإمام خطبته بما يناسب حال المصلين.",
    note2: "يُشترط في الخطبة أن تشتمل على الوصية بتقوى الله، ويُستحب الإتيان بآية قرآنية وحديث صحيح.",
  },
  en: {
    title: "Khutbah Library",
    subtitle: "Ready Friday sermons for Imams and Da'ees",
    home: "Home",
    description:
      "A collection of methodological ready-made khutbahs with outlines you can use or draw inspiration from for Friday sermons and lectures.",
    serviceTitle: "Service for Imams and Da'ees",
    serviceDesc:
      "A collection of methodological ready-made khutbahs you can use or draw inspiration from. Each khutbah is complete with elements and conclusion.",
    allCategory: "All",
    khutabCount: "Khutbahs",
    selectHint: "Select a khutbah to view details",
    backToList: "Back to Khutbah List",
    introLabel: "Introduction",
    pointsLabel: "Khutbah Elements",
    khatimaLabel: "Conclusion & Du'a",
    share: "Share Khutbah",
    print: "Print",
    elementsCount: "elements",
    verse: "Verse",
    verseSource: "Source",
    categoriesCount: "Categories",
    sharable: "Shareable",
    printable: "Printable",
    relatedTitle: "Related Pages",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Various fiqh questions.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "Principles and skills of dawah.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to the Book of Allah.",
    heroVerse: "\"O you who have believed, when [the adhan] is called for the prayer on the day of Jumu'ah [Friday], then proceed to the remembrance of Allah.\"",
    heroVerseSource: "Surah Al-Jumu'ah — Verse 9",
    noteTitle: "Important Notice",
    note1: "These khutbahs are for inspiration and reference. It is better for the Imam to prepare a khutbah suited to his congregation's state.",
    note2: "A valid khutbah must include the counsel of taqwa, and it is recommended to include a Quranic verse and an authentic hadith.",
  },
};

// ============================================================
// تحويل عناصر المحتوى (CMS) إلى نموذج العرض
// ============================================================

/** تدرّجات لونية تُوزّع على البطاقات بالتناوب (نفس تدرّجات التصميم). */
const KHUTBAH_GRADIENTS = [
  "from-primary-500 to-primary-700",
  "from-gold-500 to-gold-700",
  "from-night-500 to-night-700",
  "from-primary-600 to-primary-800",
  "from-gold-600 to-gold-800",
];

/** أسماء التصنيف الافتراضية عند غياب التصنيفات في الـCMS. */
const CATEGORY_FALLBACK: Record<string, string> = {
  ar: "خطبة",
  en: "Khutbah",
};

/** تقسيم نصّ الخطبة إلى عناصر/جُمل. */
function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?؟])\s+/g, "$1\n")
    .split("\n")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** استخراج آية مقتبسة من نص الخطبة إن وُجدت. */
function extractVerse(text: string): string {
  const match = text.match(/[«﴿]([^»﴾]+)[»﴾]/);
  return match ? match[1].trim() : "";
}

/** بناء نموذج خطبة واحد من عنصر محتوى منشور في الـCMS. */
function toKhutbah(item: PublicItem, index: number, lang: "ar" | "en"): Khutbah {
  const term = item.terms?.[0];
  const categoryName = term?.name?.trim() || CATEGORY_FALLBACK[lang];
  const icon = term?.icon?.trim() || "🕌";

  const body = (item.body ?? "").trim();
  const summary = (item.summary ?? "").trim();
  const sentences = splitSentences(body);

  const introText = summary || sentences[0] || "";
  // إن وُجد ملخّص فكل الجُمل عناصر، وإلا فالجملة الأولى تُعرض كمقدّمة.
  const rawPoints = summary ? sentences : sentences.slice(1);
  const khatimaText = rawPoints.length > 1 ? rawPoints[rawPoints.length - 1] : "";
  const pointTexts = khatimaText ? rawPoints.slice(0, -1) : rawPoints;
  const verseText = extractVerse(body) || sentences[0] || "";

  return {
    id: item.id,
    category: { ar: categoryName, en: categoryName },
    categoryIcon: icon,
    gradient: KHUTBAH_GRADIENTS[index % KHUTBAH_GRADIENTS.length],
    icon,
    title: { ar: item.title, en: item.title },
    intro: { ar: introText, en: introText },
    verse: { ar: verseText, en: verseText },
    verseSource: { ar: "", en: "" },
    points: pointTexts.map((sentence) => ({ ar: sentence, en: sentence })),
    khatima: { ar: khatimaText, en: khatimaText },
    date: item.published_at,
  };
}

// ============================================================
// المكون الرئيسي
// ============================================================

export default function KhutabPage() {
  const pathname = usePathname();
  const lang: "ar" | "en" = pathname.startsWith("/en") ? "en" : "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const gate = usePageGate("khutab", L);
  const ui = UI[L];

  const [khutab, setKhutab] = useState<Khutbah[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // ===== جلب الخطب من الـCMS =====
  useEffect(() => {
    let cancelled = false;

    const loadKhutab = async () => {
      try {
        const response = await fetch(
          `/api/library?type=khutbah&lang=${lang}&limit=60`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = (await response.json()) as { data?: PublicItem[] };
        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (!cancelled) {
          setKhutab(items.map((item, index) => toKhutbah(item, index, lang)));
        }
      } catch (err) {
        console.error("[/khutab] failed to load khutbahs", err);
        if (!cancelled) setKhutab([]);
      }
    };

    void loadKhutab();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // استخراج التصنيفات الفريدة
  const categories = useMemo(() => {
    const unique = new Set<string>();
    khutab.forEach((k) => unique.add(k.category[L]));
    return Array.from(unique);
  }, [khutab, L]);

  const filteredKhutab = useMemo(() => {
    if (filter === "all") return khutab;
    return khutab.filter((k) => k.category[L] === filter);
  }, [khutab, filter, L]);

  const selectedKhutbah = selectedId ? khutab.find((k) => k.id === selectedId) : null;

  // دالة المشاركة
  const handleShare = (khutbah: Khutbah) => {
    const dateText = khutbah.date
      ? new Date(khutbah.date).toLocaleDateString(isRTL ? "ar" : "en")
      : "";
    const shareText = [khutbah.title[L], khutbah.intro[L], dateText]
      .filter((part) => part.length > 0)
      .join("\n\n");

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: khutbah.title[L],
        text: shareText,
        url: typeof window !== "undefined" ? window.location.href : "",
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${shareText}\n\n${typeof window !== "undefined" ? window.location.href : ""}`
      );
    }
  };

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
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
        {gate.visible('k0') && (<>
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d97706, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">🎤 {ui.serviceTitle}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.serviceDesc}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.heroVerse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.heroVerseSource}
              </p>
            </div>
          </div>
        </div>

        </>)}
        {/* ===== إحصائيات ===== */}
        {gate.visible('k1') && (<>
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="🎤" label={ui.khutabCount} value={khutab.length} color="primary" />
          <StatCard icon="📂" label={ui.categoriesCount} value={categories.length} color="gold" />
          <StatCard icon="📤" label={ui.sharable} value="✓" color="primary" />
          <StatCard icon="🖨️" label={ui.printable} value="✓" color="gold" />
        </div>

        {!selectedKhutbah ? (
          <>
            {/* ===== الفلاتر ===== */}
            <div className="card mb-8 p-6 md:p-7">
              <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                📂 {isRTL ? "تصفية حسب التصنيف" : "Filter by Category"}
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilter("all")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                    filter === "all"
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700"
                  }`}
                >
                  <span>📚</span>
                  <span>{ui.allCategory}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    filter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                  }`}>
                    {khutab.length}
                  </span>
                </button>

                {categories.map((category) => {
                  const isActive = filter === category;
                  const count = khutab.filter((k) => k.category[L] === category).length;
                  const sampleKhutbah = khutab.find((k) => k.category[L] === category);
                  const icon = sampleKhutbah?.categoryIcon ?? "📄";

                  return (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{category}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===== عنوان القائمة ===== */}
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                📜 {filteredKhutab.length} {ui.khutabCount}
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                💡 {ui.selectHint}
              </span>
            </div>

            {/* ===== قائمة الخطب ===== */}
            {filteredKhutab.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="mb-4 text-5xl">📭</div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {isRTL ? "لا توجد خطب" : "No khutbahs"}
                </h3>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredKhutab.map((khutbah) => (
                  <button
                    key={khutbah.id}
                    onClick={() => setSelectedId(khutbah.id)}
                    className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${khutbah.gradient} p-6 text-start text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                  >
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />

                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="text-4xl drop-shadow-lg">{khutbah.icon}</span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm">
                          {khutbah.categoryIcon} {khutbah.category[L]}
                        </span>
                      </div>

                      <h3
                        className="mb-3 text-xl font-black leading-tight"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {khutbah.title[L]}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/90">
                        {khutbah.intro[L]}
                      </p>

                      <div className="mb-4 rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                        <p
                          className="line-clamp-2 text-xs font-black"
                          style={{ fontFamily: "var(--font-quran)" }}
                          dir="rtl"
                        >
                          ﴿{khutbah.verse.ar}﴾
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/20 pt-3">
                        <span className="text-xs text-white/80">
                          {khutbah.points.length} {ui.elementsCount}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-black transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                          {isRTL ? "عرض الخطبة" : "View"}
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
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ===== تفاصيل الخطبة ===== */
          <div className="card relative overflow-hidden p-6 md:p-10">
            <div className={`gradient-primary absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${selectedKhutbah.gradient}`} />

            {/* زر العودة */}
            <button
              onClick={() => setSelectedId(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              {ui.backToList}
            </button>

            {/* رأس الخطبة */}
            <div className="mb-8 border-b-2 border-gold-200 pb-8 text-center dark:border-gold-800">
              <div className="mb-4 flex justify-center">
                <span className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${selectedKhutbah.gradient} text-4xl text-white shadow-xl`}>
                  {selectedKhutbah.icon}
                </span>
              </div>

              <span className="badge-primary mb-3">
                {selectedKhutbah.categoryIcon} {selectedKhutbah.category[L]}
              </span>

              <h2
                className="text-2xl font-black text-slate-900 md:text-4xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {selectedKhutbah.title[L]}
              </h2>
            </div>

            {/* المقدمة */}
            <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-night-700 dark:bg-night-800/40">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm dark:bg-primary-900/40">
                  🎯
                </span>
                <h3
                  className="text-xl font-black text-primary-700 dark:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.introLabel}
                </h3>
              </div>

              <p className="mb-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                {selectedKhutbah.intro[L]}
              </p>

              <div className="rounded-xl border-r-4 border-gold-500 bg-gold-50/60 p-4 dark:border-gold-400 dark:bg-gold-950/20 rtl:border-l-4 rtl:border-r-0">
                <p
                  className="text-lg font-black text-slate-900 md:text-xl dark:text-white"
                  style={{ fontFamily: "var(--font-quran)" }}
                  dir="rtl"
                >
                  ﴿{selectedKhutbah.verse.ar}﴾
                </p>
                <p className="mt-2 text-xs font-bold text-gold-700 dark:text-gold-300">
                  📖 {selectedKhutbah.verseSource[L]}
                </p>
              </div>
            </div>

            {/* العناصر */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm dark:bg-primary-900/40">
                  📋
                </span>
                <h3
                  className="text-xl font-black text-primary-700 dark:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.pointsLabel}
                </h3>
              </div>

              <div className="space-y-3">
                {selectedKhutbah.points.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-primary-200 dark:border-night-700 dark:bg-night-800/40 dark:hover:border-primary-800"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedKhutbah.gradient} font-black text-white shadow-md`}>
                      {index + 1}
                    </span>
                    <p className="pt-2 leading-relaxed text-slate-700 dark:text-slate-200">
                      {point[L]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* الخاتمة */}
            <div className={`mb-8 rounded-2xl bg-gradient-to-br ${selectedKhutbah.gradient} p-6 text-white shadow-lg`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm backdrop-blur-sm">
                  🤲
                </span>
                <h3
                  className="text-xl font-black"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.khatimaLabel}
                </h3>
              </div>

              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {selectedKhutbah.khatima[L]}
              </p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare(selectedKhutbah)}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2"
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
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {ui.share}
              </button>

              <button
                onClick={() => window.print()}
                className="btn-outline inline-flex items-center justify-center gap-2"
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
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                {ui.print}
              </button>
            </div>
          </div>
        )}

        </>)}
        {/* ===== صفحات ذات صلة ===== */}
        {gate.visible('k2') && (<>
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${L}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">⚖️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fatwaPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">✍️</span>
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

            <Link href={`/${L}/quran`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📖</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.quranPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.quranPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        </>)}
        {/* ===== تنبيه مهم ===== */}
        {gate.visible('k3') && (<>
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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
              </ul>
            </div>
          </div>
        </div>
        </>)}
      </section>

      <Footer lang={L} />
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


