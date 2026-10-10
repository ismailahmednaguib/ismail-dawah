// app/[lang]/quran/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  all: string;
  meccan: string;
  medinan: string;
  surah: string;
  surahs: string;
  ayahs: string;
  revelation: string;
  openSurah: string;
  noResults: string;
  noResultsDesc: string;
  loadError: string;
  loadErrorDesc: string;
  retry: string;
  totalSurahs: string;
  results: string;
  noteTitle: string;
  note1: string;
  note2: string;
  verse: string;
  verseSource: string;
  totalAyahs: string;
  totalJuz: string;
  totalPages: string;
  introTitle: string;
  introDesc: string;
  relatedTitle: string;
  memorizationPage: string;
  memorizationPageDesc: string;
  adhkarPage: string;
  adhkarPageDesc: string;
  prayerTimesPage: string;
  prayerTimesPageDesc: string;
  tafsirPage: string;
  tafsirPageDesc: string;
  hadithTitle: string;
  hadithText: string;
  hadithSource: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "القرآن الكريم",
    subtitle: "تصفح السور الكريمة والبحث والفلترة",
    home: "الرئيسية",
    description:
      "صفحة القرآن الكريم في منصة إسماعيل أحمد نجيب الدعوية. تصفح 114 سورة، اقرأ واستمع بأصوات أفضل القراء، مع البحث والفلترة بين المكية والمدنية.",
    searchPlaceholder: "ابحث باسم السورة أو رقمها...",
    search: "بحث",
    all: "الكل",
    meccan: "مكية",
    medinan: "مدنية",
    surah: "سورة",
    surahs: "سورة",
    ayahs: "آية",
    revelation: "النزول",
    openSurah: "اقرأ واستمع",
    noResults: "لا توجد سور مطابقة",
    noResultsDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    loadError: "تعذّر تحميل قائمة السور حاليًا",
    loadErrorDesc:
      "قد يكون هناك مشكلة مؤقتة في الاتصال بمصدر القرآن. أعد المحاولة بعد قليل.",
    retry: "إعادة المحاولة",
    totalSurahs: "عدد السور",
    results: "النتائج",
    noteTitle: "ملاحظة",
    note1:
      "النص القرآني من مصدر موثوق (AlQuran Cloud) بالرسم العثماني، والتلاوات الصوتية من أجود القراء.",
    note2:
      "يُرجى احترام المصحف وعدم إخراج النصوص عن سياقها، ونقل المصدر عند الاقتباس.",
    verse: "﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾",
    verseSource: "سورة الحجر — الآية 9",
    totalAyahs: "آية في القرآن",
    totalJuz: "جزء",
    totalPages: "صفحة",
    introTitle: "فضل تلاوة القرآن",
    introDesc:
      "القرآن الكريم كلام الله المنزل على نبيه محمد ﷺ، المتعبد بتلاوته، المعجز بأقصر سورة منه. من قرأه فله بكل حرف حسنة، والحسنة بعشر أمثالها. وهو شفاء للصدور، ونور في الظلمات، ورفعة في الآخرة.",
    relatedTitle: "صفحات ذات صلة",
    memorizationPage: "خطة حفظ القرآن",
    memorizationPageDesc: "نظّم وردك اليومي من الحفظ.",
    adhkarPage: "الأذكار",
    adhkarPageDesc: "أذكار الصباح والمساء.",
    prayerTimesPage: "مواقيت الصلاة",
    prayerTimesPageDesc: "أوقات الصلاة حسب موقعك.",
    tafsirPage: "التفسير",
    tafsirPageDesc: "فهم معاني الآيات.",
    hadithTitle: "حديث شريف",
    hadithText: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    hadithSource: "رواه البخاري",
  },
  en: {
    title: "Holy Quran",
    subtitle: "Browse, search, and filter Quran surahs",
    home: "Home",
    description:
      "Quran page on the Ismail Ahmed Naguib Dawah Platform. Browse 114 surahs, read and listen with the best reciters, with search and filtering between Meccan and Medinan.",
    searchPlaceholder: "Search by surah name or number...",
    search: "Search",
    all: "All",
    meccan: "Meccan",
    medinan: "Medinan",
    surah: "Surah",
    surahs: "Surahs",
    ayahs: "verses",
    revelation: "Revelation",
    openSurah: "Read & Listen",
    noResults: "No matching surahs",
    noResultsDesc: "Try another keyword or choose a different filter.",
    loadError: "Unable to load surah list currently",
    loadErrorDesc:
      "There may be a temporary issue connecting to the Quran source. Please try again shortly.",
    retry: "Retry",
    totalSurahs: "Total surahs",
    results: "Results",
    noteTitle: "Notice",
    note1:
      "Quranic text is from a trusted source (AlQuran Cloud) in Uthmani script, with recitations from the finest reciters.",
    note2:
      "Please respect the mushaf, do not take texts out of context, and attribute the source when quoting.",
    verse: "\"Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian.\"",
    verseSource: "Surah Al-Hijr — Verse 9",
    totalAyahs: "verses in Quran",
    totalJuz: "Juz",
    totalPages: "Pages",
    introTitle: "Virtue of Reciting the Quran",
    introDesc:
      "The Noble Quran is the word of Allah revealed to His Prophet Muhammad ﷺ, worshiped through its recitation, miraculous in its shortest surah. Whoever reads it earns a good deed for every letter, and each good deed is multiplied tenfold. It is healing for the hearts, light in darkness, and elevation in the hereafter.",
    relatedTitle: "Related Pages",
    memorizationPage: "Quran Memorization",
    memorizationPageDesc: "Organize your daily portion.",
    adhkarPage: "Adhkar",
    adhkarPageDesc: "Morning and evening adhkar.",
    prayerTimesPage: "Prayer Times",
    prayerTimesPageDesc: "Prayer times by your location.",
    tafsirPage: "Tafsir",
    tafsirPageDesc: "Understanding verse meanings.",
    hadithTitle: "Prophetic Hadith",
    hadithText: "The best of you are those who learn the Quran and teach it.",
    hadithSource: "Narrated by Al-Bukhari",
  },
};

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? "";
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

function isMeccan(revelationType: string): boolean {
  const normalized = normalize(revelationType);
  return (
    normalized.includes("meccan") ||
    normalized.includes("مكية") ||
    normalized.includes("makki")
  );
}

function isMedinan(revelationType: string): boolean {
  const normalized = normalize(revelationType);
  return (
    normalized.includes("medinan") ||
    normalized.includes("madani") ||
    normalized.includes("مدنية")
  );
}

function revelationLabel(revelationType: string, lang: Lang): string {
  if (isMeccan(revelationType)) {
    return lang === "ar" ? "مكية" : "Meccan";
  }
  if (isMedinan(revelationType)) {
    return lang === "ar" ? "مدنية" : "Medinan";
  }
  return revelationType;
}

function surahMatches(surah: Surah, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  const haystack = [
    String(surah.number),
    surah.name,
    surah.englishName,
    surah.englishNameTranslation,
  ];
  return haystack.some((text) => normalize(text).includes(q));
}

async function fetchSurahs(): Promise<Surah[]> {
  const response = await fetch("https://api.alquran.cloud/v1/surah", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch surahs");
  }

  const json = await response.json();
  const data = json?.data;

  if (!Array.isArray(data)) return [];

  return data
    .map((item: any): Surah | null => {
      const number = Number(item?.number);
      const name = String(item?.name ?? "");
      const englishName = String(item?.englishName ?? "");
      const englishNameTranslation = String(item?.englishNameTranslation ?? "");
      const numberOfAyahs = Number(item?.numberOfAyahs ?? 0);
      const revelationType = String(item?.revelationType ?? "");

      if (!Number.isFinite(number) || !name) return null;

      return {
        number,
        name,
        englishName,
        englishNameTranslation,
        numberOfAyahs: Number.isFinite(numberOfAyahs) ? numberOfAyahs : 0,
        revelationType,
      };
    })
    .filter((item): item is Surah => Boolean(item))
    .sort((a, b) => a.number - b.number);
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
      canonical: `/${l}/quran`,
      languages: {
        ar: "/ar/quran",
        en: "/en/quran",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/quran`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "book",
      images: [
        {
          url: "/icons/icon-512.png",
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
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function QuranPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const q = getFirstValue(sp.q).trim();
  const rawType = getFirstValue(sp.type);
  const type = rawType === "meccan" || rawType === "medinan" ? rawType : "all";

  let surahs: Surah[] = [];
  let loadError = false;

  try {
    surahs = await fetchSurahs();
  } catch {
    loadError = true;
  }

  const filteredSurahs = surahs.filter((surah) => {
    if (type === "meccan" && !isMeccan(surah.revelationType)) return false;
    if (type === "medinan" && !isMedinan(surah.revelationType)) return false;
    return surahMatches(surah, q);
  });

  // حسابات إحصائية
  const meccanCount = surahs.filter((s) => isMeccan(s.revelationType)).length;
  const medinanCount = surahs.filter((s) => isMedinan(s.revelationType)).length;
  const totalAyahs = surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        name: isRTL ? "القرآن الكريم" : "The Holy Quran",
        inLanguage: l,
        numberOfPages: 604,
        numberOfChapters: surahs.length || 114,
        author: {
          "@type": "Organization",
          name: isRTL ? "الله سبحانه وتعالى" : "Allah (God)",
        },
        description: ui.description,
        url: `/${l}/quran`,
      },
      {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: filteredSurahs.length,
        itemListElement: filteredSurahs.slice(0, 50).map((surah, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: isRTL ? surah.name : surah.englishName,
          url: `/${l}/quran/${surah.number}`,
        })),
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          {/* نمط زخرفي */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 50%, #0e7490 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              📖 {isRTL ? "كتاب الله" : "Book of Allah"}
            </span>

            <h1
              className="mb-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl dark:text-white"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-300 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-2xl font-black text-gold-700 md:text-3xl dark:text-gold-300"
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

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="📖"
            label={ui.totalSurahs}
            value={formatNumber(surahs.length || 114, l)}
            color="primary"
          />
          <StatCard
            icon="✨"
            label={ui.totalAyahs}
            value={formatNumber(totalAyahs || 6236, l)}
            color="gold"
          />
          <StatCard
            icon="📚"
            label={ui.totalJuz}
            value={formatNumber(30, l)}
            color="primary"
          />
          <StatCard
            icon="📄"
            label={ui.totalPages}
            value={formatNumber(604, l)}
            color="gold"
          />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💎 {ui.introTitle}
            </h2>
            <p className="mb-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>

            {/* حديث شريف */}
            <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-4 dark:border-gold-900/30 dark:bg-gold-950/15">
              <p
                className="mb-1 text-lg font-black text-gold-700 md:text-xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.hadithText}»
              </p>
              <p className="text-xs font-bold text-gold-600 dark:text-gold-400">
                📜 {ui.hadithSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== البحث والفلترة ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/quran`}
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
              <label className="sr-only" htmlFor="quran-type">
                {ui.revelation}
              </label>
              <select
                id="quran-type"
                name="type"
                defaultValue={type}
                className="input-islamic"
              >
                <option value="all">{ui.all}</option>
                <option value="meccan">
                  {ui.meccan} ({formatNumber(meccanCount, l)})
                </option>
                <option value="medinan">
                  {ui.medinan} ({formatNumber(medinanCount, l)})
                </option>
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

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
            <span>
              {ui.totalSurahs}:{" "}
              <span className="text-primary-600 dark:text-primary-400">
                {formatNumber(surahs.length, l)}
              </span>
            </span>
            <span>•</span>
            <span>
              {ui.results}:{" "}
              <span className="text-slate-700 dark:text-slate-200">
                {formatNumber(filteredSurahs.length, l)}
              </span>
            </span>
          </div>
        </div>

        {/* ===== خطأ التحميل ===== */}
        {loadError && (
          <div className="card mb-8 border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
              {ui.loadError}
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
              {ui.loadErrorDesc}
            </p>
            <Link href={`/${l}/quran`} className="btn-primary">
              {ui.retry}
            </Link>
          </div>
        )}

        {/* ===== لا توجد نتائج ===== */}
        {!loadError && filteredSurahs.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📭</div>
            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>
            <Link href={`/${l}/quran`} className="btn-primary">
              {ui.all}
            </Link>
          </div>
        )}

        {/* ===== قائمة السور ===== */}
        {!loadError && filteredSurahs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah) => {
              const isMeccanSurah = isMeccan(surah.revelationType);
              return (
                <Link
                  key={surah.number}
                  href={`/${l}/quran/${surah.number}`}
                  className="card card-interactive group relative overflow-hidden p-5"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${isMeccanSurah ? "bg-gradient-to-r from-gold-400 to-gold-600" : "bg-gradient-to-r from-primary-400 to-primary-600"}`} />

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black ${
                      isMeccanSurah
                        ? "bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300"
                        : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    }`}>
                      {formatNumber(surah.number, l)}
                    </span>

                    <span className={isMeccanSurah ? "badge-gold text-xs" : "badge-primary text-xs"}>
                      {revelationLabel(surah.revelationType, l)}
                    </span>
                  </div>

                  <h2
                    className="mb-1 text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                    style={{ fontFamily: "var(--font-quran)" }}
                  >
                    {surah.name}
                  </h2>

                  <p className="mb-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {surah.englishName}
                  </p>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {surah.englishNameTranslation}
                  </p>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 dark:border-night-700 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      ✨ {formatNumber(surah.numberOfAyahs, l)} {ui.ayahs}
                    </span>

                    <span className="inline-flex items-center gap-1 text-primary-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 dark:text-primary-300 transition-transform">
                      {ui.openSurah}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isRTL ? "rotate-180" : ""}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        {!loadError && surahs.length > 0 && (
          <div className="mt-12">
            <h2
              className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🔗 {ui.relatedTitle}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href={`/${l}/quran-memorization`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🎯</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.memorizationPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.memorizationPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${l}/adhkar`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🤲</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.adhkarPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.adhkarPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${l}/prayer-times`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕐</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.prayerTimesPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.prayerTimesPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${l}/fields/tafsir`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🔍</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.tafsirPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.tafsirPageDesc}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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

      <Footer lang={l} />
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