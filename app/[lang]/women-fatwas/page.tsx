// app/[lang]/women-fatwas/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";

import { usePageGate } from "@/components/PageGate";
// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string; [key: string]: string };

type Fatwa = {
  id: string;
  category: Localized;
  q: Localized;
  a: Localized;
  icon: string;
  verse?: string; // عربي فقط (نص قرآني ثابت)
  verseSource?: Localized;
  hadith?: string; // عربي فقط
  hadithSource?: Localized;
  gradient: string;
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
    searchPlaceholder: string;
    all: string;
    noResults: string;
    noResultsDesc: string;
    answer: string;
    verse: string;
    hadith: string;
    whyTitle: string;
    whyDesc: string;
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    relatedTitle: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    familyPage: string;
    familyPageDesc: string;
    fieldsPage: string;
    fieldsPageDesc: string;
    fatwasCount: string;
    categoriesCount: string;
    languages: string;
    freeAlways: string;
    heroVerse: string;
    heroVerseSource: string;
    heroIntro: string;
    heroIntroDesc: string;
    fatwaLabel: string;
    clickHint: string;
    clearSearch: string;
    clearFilter: string;
  }
> = {
  ar: {
    title: "فتاوى المرأة المسلمة",
    subtitle: "إجابات على أهم الأسئلة الفقهية الخاصة بالمرأة",
    home: "الرئيسية",
    description:
      "مجموعة فتاوى مهمة تهم كل امرأة مسلمة في عبادتها وحياتها اليومية: الصلاة، الحيض، الحجاب، الزواج، والعمل، بأدلة من القرآن والسنة.",
    searchPlaceholder: "ابحثي في الفتاوى...",
    all: "الكل",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّبي كلمة أخرى أو اختاري فئة مختلفة.",
    answer: "الإجابة",
    verse: "الدليل من القرآن",
    hadith: "الدليل من السنة",
    whyTitle: "لماذا فتاوى خاصة بالمرأة؟",
    whyDesc:
      "المرأة المسلمة لها أحكام فقهية خاصة في العبادات والمعاملات والأسرة، تحتاج إلى بيان واضح ومباشر.",
    why1Title: "خصوصية الأحكام",
    why1Desc: "الحيض والنفاس والحجاب وأحكام الزواج لها تفاصيل تحتاج عناية خاصة.",
    why2Title: "وضوح الإجابة",
    why2Desc: "إجابات مباشرة ومختصرة بدون تعقيد، مع ذكر الدليل من القرآن والسنة.",
    why3Title: "مراعاة الحال",
    why3Desc: "الفتاوى تراعي واقع المرأة المعاصرة وتحدياتها في العمل والأسرة.",
    noteTitle: "تنبيهات فقهية مهمة",
    note1:
      "هذه الفتاوى على المذهب السائد عند جمهور العلماء، وفي بعض المسائل خلاف معتبر.",
    note2:
      "يُنصح بالرجوع لعالم ثقة في المسائل الخاصة والمعقدة التي تحتاج تفصيلاً أكثر.",
    note3:
      "المحتوى للتوعية العامة، ولا يُغني عن دراسة الفقه دراسة منهجية من مصادره.",
    relatedTitle: "صفحات ذات صلة",
    fatwaPage: "الفتاوى العامة",
    fatwaPageDesc: "أسئلة فقهية في العبادات والمعاملات.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    familyPage: "مجالات الأسرة",
    familyPageDesc: "أحكام الأسرة والتربية.",
    fieldsPage: "مجالات المنصة",
    fieldsPageDesc: "17 مجالاً شرعياً متنوعاً.",
    fatwasCount: "فتوى",
    categoriesCount: "فئات",
    languages: "لغتان",
    freeAlways: "مجاني",
    heroVerse: "﴿ وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ ﴾",
    heroVerseSource: "سورة التوبة — الآية 71",
    heroIntro: "أختاه المسلمة",
    heroIntroDesc:
      "هذه مجموعة من الفتاوى المهمة التي تهم كل امرأة مسلمة في عبادتها وحياتها اليومية. اختاري القسم الذي يهمك وابحثي عن إجابتك.",
    fatwaLabel: "فتوى",
    clickHint: "اضغطي على أي فتوى لقراءة الإجابة",
    clearSearch: "مسح البحث",
    clearFilter: "مسح الفلتر",
  },
  en: {
    title: "Muslim Women's Fatwas",
    subtitle: "Answers to key fiqh questions specific to women",
    home: "Home",
    description:
      "A collection of important fatwas for every Muslim woman in her worship and daily life: prayer, menstruation, hijab, marriage, and work, with evidences from Quran and Sunnah.",
    searchPlaceholder: "Search fatwas...",
    all: "All",
    noResults: "No results found",
    noResultsDesc: "Try another keyword or choose a different category.",
    answer: "Answer",
    verse: "Quranic Evidence",
    hadith: "Prophetic Evidence",
    whyTitle: "Why Special Fatwas for Women?",
    whyDesc:
      "Muslim women have specific fiqh rulings in worship, transactions, and family matters that require clear and direct explanation.",
    why1Title: "Specificity of Rulings",
    why1Desc: "Menstruation, postpartum, hijab, and marriage rulings have details requiring special care.",
    why2Title: "Clarity of Answer",
    why2Desc: "Direct and concise answers without complexity, with evidences from Quran and Sunnah.",
    why3Title: "Considering Context",
    why3Desc: "The fatwas consider the reality of the modern woman and her challenges in work and family.",
    noteTitle: "Important Fiqh Notices",
    note1:
      "These fatwas follow the predominant view among the majority of scholars, and some issues have legitimate differences of opinion.",
    note2:
      "It is recommended to consult a trusted scholar for specific and complex matters requiring more detail.",
    note3:
      "The content is for general awareness and does not replace methodical study of fiqh from its sources.",
    relatedTitle: "Related Pages",
    fatwaPage: "General Fatwas",
    fatwaPageDesc: "Fiqh questions on worship and transactions.",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    familyPage: "Family Field",
    familyPageDesc: "Family and upbringing rulings.",
    fieldsPage: "Platform Fields",
    fieldsPageDesc: "17 diverse Islamic fields.",
    fatwasCount: "Fatwas",
    categoriesCount: "Categories",
    languages: "Languages",
    freeAlways: "Free",
    heroVerse: "\"The believing men and believing women are allies of one another.\"",
    heroVerseSource: "Surah At-Tawbah — Verse 71",
    heroIntro: "Dear Muslim Sister",
    heroIntroDesc:
      "This is a collection of important fatwas for every Muslim woman in her worship and daily life. Choose the category that interests you and find your answer.",
    fatwaLabel: "fatwas",
    clickHint: "Click any fatwa to read the answer",
    clearSearch: "Clear search",
    clearFilter: "Clear filter",
  },
};

// ============================================================
// مصدر البيانات: واجهة المكتبة العامة (CMS)
// ============================================================

type ApiFatwa = {
  id: string;
  content_type: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  published_at: string | null;
  views: number;
  audience: string[];
  levels: string[];
  terms: {
    id: string;
    kind: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  }[];
  isFallback: boolean;
};

// نصوص حرفية حتى يلتقطها Tailwind عند البناء.
const GRADIENTS = [
  "from-pink-500 to-rose-600",
  "from-primary-500 to-primary-700",
  "from-purple-500 to-purple-700",
  "from-rose-500 to-rose-700",
];

// يحوّل عنصر CMS إلى شكل الفتوى الذي يتوقعه التصميم الحالي.
function toFatwa(item: ApiFatwa, index: number): Fatwa {
  const term =
    item.terms.find((t) => t.kind === "category") ||
    item.terms.find((t) => t.kind === "topic") ||
    item.terms[0] ||
    null;

  const name = term?.name?.trim() || "";
  const title = item.title?.trim() || "";
  const body = item.body?.trim() || item.summary?.trim() || "";

  return {
    id: item.id,
    icon: term?.icon || "📄",
    gradient: GRADIENTS[index % GRADIENTS.length],
    category: { ar: name || "عام", en: name || "General" },
    q: { ar: title, en: title },
    a: { ar: body, en: body },
  };
}

// ============================================================
// المكون الرئيسي
// ============================================================

export default function WomenFatwasPage() {
  const pathname = usePathname();
  const params = useParams();
  const L: Lang = pathname?.startsWith("/en")
    ? "en"
    : pathname?.startsWith("/ar")
      ? "ar"
      : (params?.lang as string) === "en"
        ? "en"
        : "ar";
  const isRTL = L === "ar";
  const gate = usePageGate("women-fatwas", L);
  const ui = UI[L];

  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fatwas, setFatwas] = useState<Fatwa[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== جلب الفتاوى من CMS =====
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFilter("all");
      setOpenId(null);

      try {
        const res = await fetch(`/api/library?type=fatwa&lang=${L}&limit=60`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const payload = (await res.json()) as { data?: ApiFatwa[] };
        const items = Array.isArray(payload?.data) ? payload.data : [];

        if (!cancelled) setFatwas(items.map((item, i) => toFatwa(item, i)));
      } catch {
        if (!cancelled) setFatwas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [L]);

  // ===== الفئات الفريدة =====
  const categories = useMemo(() => {
    const unique = new Map<string, Localized>();
    fatwas.forEach((f) => unique.set(f.category.ar, f.category));
    return Array.from(unique.values());
  }, [fatwas]);

  // ===== الفلترة =====
  const filtered = useMemo(() => {
    return fatwas.filter((f) => {
      const matchesCategory =
        filter === "all" || f.category.ar === filter || f.category.en === filter;

      if (!search.trim()) return matchesCategory;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        f.q.ar.toLowerCase().includes(q) ||
        f.q.en.toLowerCase().includes(q) ||
        f.a.ar.toLowerCase().includes(q) ||
        f.a.en.toLowerCase().includes(q) ||
        f.category.ar.toLowerCase().includes(q) ||
        f.category.en.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [fatwas, filter, search]);

  // ===== عدادات الفئات =====
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: fatwas.length };
    categories.forEach((cat) => {
      counts[cat.ar] = fatwas.filter((f) => f.category.ar === cat.ar).length;
    });
    return counts;
  }, [categories, fatwas]);

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
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
        <div className="card relative mb-8 overflow-hidden border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-cream-dark to-rose-50 p-8 md:p-12 dark:border-pink-800 dark:from-pink-950/30 dark:via-gray-900 dark:to-rose-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          {/* زخارف */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-800/20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-800/20" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #ec4899, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🌸 {ui.heroIntro}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.heroIntroDesc}
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
          <StatCard icon="📜" label={ui.fatwasCount} value={fatwas.length} color="primary" />
          <StatCard icon="📂" label={ui.categoriesCount} value={categories.length} color="gold" />
          <StatCard icon="🌍" label={ui.languages} value={2} color="primary" />
          <StatCard icon="✨" label={ui.freeAlways} value="100%" color="gold" />
        </div>

        </>)}
        {/* ===== لماذا فتاوى خاصة ===== */}
        {gate.visible('k2') && (<>
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-3 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.whyTitle}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.whyDesc}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <WhyCard
                icon="🎯"
                title={ui.why1Title}
                description={ui.why1Desc}
                color="from-pink-500 to-pink-600"
              />
              <WhyCard
                icon="💎"
                title={ui.why2Title}
                description={ui.why2Desc}
                color="from-rose-500 to-rose-600"
              />
              <WhyCard
                icon="🌸"
                title={ui.why3Title}
                description={ui.why3Desc}
                color="from-purple-500 to-purple-600"
              />
            </div>
          </div>
        </div>

        </>)}
        {/* ===== البحث ===== */}
        {gate.visible('k3') && (<>
        <div className="card mb-6 p-5">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ui.searchPlaceholder}
              className="input-islamic !ps-12"
              aria-label={ui.searchPlaceholder}
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              ✕ {ui.clearSearch}
            </button>
          )}
        </div>

        </>)}
        {/* ===== الفلاتر ===== */}
        {gate.visible('k4') && (<>
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                : "border border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
            }`}
          >
            <span>🌸</span>
            <span>{ui.all}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
              }`}
            >
              {categoryCounts.all}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = filter === cat.ar;
            const count = categoryCounts[cat.ar] || 0;
            const sampleFatwa = fatwas.find((f) => f.category.ar === cat.ar);
            const icon = sampleFatwa?.icon || "📄";

            return (
              <button
                key={cat.ar}
                onClick={() => setFilter(cat.ar)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
                }`}
              >
                <span>{icon}</span>
                <span>{cat[L]}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        </>)}
        {/* ===== العنوان ===== */}
        {gate.visible('k5') && (<>
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📜 {filtered.length} {ui.fatwaLabel}
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            💡 {ui.clickHint}
          </span>
        </div>

        </>)}
        {/* ===== حالة التحميل ===== */}
        {loading && (
          <div className="mb-4 space-y-4" aria-busy="true" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 dark:bg-night-700" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 h-5 w-24 rounded-full bg-slate-200 dark:bg-night-700" />
                    <div className="mb-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-night-700" />
                    <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-night-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== لا توجد نتائج ===== */}
        {!loading &&
          (filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {search && (
                <button onClick={() => setSearch("")} className="btn-outline">
                  ✕ {ui.clearSearch}
                </button>
              )}
              {filter !== "all" && (
                <button onClick={() => setFilter("all")} className="btn-primary">
                  🌸 {ui.all}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((f) => {
              const isOpen = openId === f.id;

              return (
                <article
                  key={f.id}
                  className="card group overflow-hidden transition-all hover:shadow-xl"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="flex w-full items-start gap-4 p-6 text-start transition-colors hover:bg-slate-50 dark:hover:bg-night-800"
                    aria-expanded={isOpen}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${f.gradient} text-2xl text-white shadow-md`}
                    >
                      {f.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full bg-gradient-to-r ${f.gradient} px-3 py-0.5 text-xs font-black text-white`}
                        >
                          {f.category[L]}
                        </span>
                      </div>

                      <h3
                        className="mb-1 text-lg font-black text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {f.q[L]}
                      </h3>

                      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {f.a[L]}
                      </p>
                    </div>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-lg font-black text-pink-700 transition-transform dark:bg-pink-900/40 dark:text-pink-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-6 pt-4 dark:border-night-700">
                      {/* الإجابة */}
                      <div className="mb-4 rounded-2xl border-r-4 border-pink-500 bg-pink-50 p-5 dark:border-pink-400 dark:bg-pink-950/20 rtl:border-l-4 rtl:border-r-0">
                        <p className="mb-2 text-sm font-black text-pink-700 dark:text-pink-300">
                          💡 {ui.answer}
                        </p>
                        <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                          {f.a[L]}
                        </p>
                      </div>

                      {/* الدليل القرآني */}
                      {f.verse && (
                        <div className="mb-3 rounded-2xl border-r-4 border-gold-500 bg-gold-50/60 p-4 dark:border-gold-400 dark:bg-gold-950/20 rtl:border-l-4 rtl:border-r-0">
                          <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-300">
                            📖 {ui.verse}
                          </p>
                          <p
                            className="text-lg font-black text-slate-900 dark:text-white"
                            style={{ fontFamily: "var(--font-quran)" }}
                            dir="rtl"
                          >
                            ﴿{f.verse}﴾
                          </p>
                          {f.verseSource && (
                            <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">
                              {f.verseSource[L]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* الدليل النبوي */}
                      {f.hadith && (
                        <div className="rounded-2xl border-r-4 border-primary-500 bg-primary-50 p-4 dark:border-primary-400 dark:bg-primary-950/20 rtl:border-l-4 rtl:border-r-0">
                          <p className="mb-1 text-xs font-black text-primary-700 dark:text-primary-300">
                            🌙 {ui.hadith}
                          </p>
                          <p
                            className="text-base font-black text-slate-900 dark:text-white"
                            style={{ fontFamily: "var(--font-amiri)" }}
                            dir="rtl"
                          >
                            «{f.hadith}»
                          </p>
                          {f.hadithSource && (
                            <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                              📜 {f.hadithSource[L]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ))}

        {/* ===== صفحات ذات صلة ===== */}
        {gate.visible('k6') && (<>
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${L}/fatwa`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ⚖️
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fatwaPageDesc}
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
              href={`/${L}/fields/family`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                👨‍👩‍👧
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.familyPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.familyPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/fields`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📚
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fieldsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fieldsPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        </>)}
        {/* ===== تنبيهات فقهية ===== */}
        {gate.visible('k7') && (<>
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              ⚠️
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
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note3}</span>
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

// ============================================================
// مكون WhyCard
// ============================================================

function WhyCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:border-night-700 dark:bg-night-800/40">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl text-white shadow-md`}
        >
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


