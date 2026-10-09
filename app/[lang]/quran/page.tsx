// app/[lang]/quran/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

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
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "القرآن الكريم",
    subtitle: "تصفح السور الكريمة والبحث والفلترة",
    home: "الرئيسية",
    description:
      "صفحة القرآن الكريم في منصة إسماعيل أحمد نجيب الدعوية. تصفح السور، ابحث بالاسم أو الرقم، وفلتر بين المكية والمدنية.",
    searchPlaceholder: "ابحث باسم السورة أو رقمها...",
    search: "بحث",
    all: "الكل",
    meccan: "مكية",
    medinan: "مدنية",
    surah: "سورة",
    ayahs: "آية",
    revelation: "النزول",
    openSurah: "فتح السورة",
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
      "هذه الصفحة تعرض فهرس السور وبياناتها الأساسية. لقراءة السورة كاملة والاستماع إليها، استخدم الرابط الخارجي.",
    note2:
      "يُرجى احترام المصحف وعدم إخراج النصوص عن سياقها، ونقل المصدر عند الاقتباس.",
  },
  en: {
    title: "Holy Quran",
    subtitle: "Browse, search, and filter Quran surahs",
    home: "Home",
    description:
      "Quran page on the Ismail Ahmed Naguib Dawah Platform. Browse surahs, search by name or number, and filter Meccan or Medinan surahs.",
    searchPlaceholder: "Search by surah name or number...",
    search: "Search",
    all: "All",
    meccan: "Meccan",
    medinan: "Medinan",
    surah: "Surah",
    ayahs: "verses",
    revelation: "Revelation",
    openSurah: "Open surah",
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
      "This page shows the surah index and basic metadata. To read and listen to the full surah, use the external link.",
    note2:
      "Please respect the mushaf, do not take texts out of context, and attribute the source when quoting.",
  },
};

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
  if (!query) {
    return true;
  }

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

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item: any): Surah | null => {
      const number = Number(item?.number);
      const name = String(item?.name ?? "");
      const englishName = String(item?.englishName ?? "");
      const englishNameTranslation = String(item?.englishNameTranslation ?? "");
      const numberOfAyahs = Number(item?.numberOfAyahs ?? 0);
      const revelationType = String(item?.revelationType ?? "");

      if (!Number.isFinite(number) || !name) {
        return null;
      }

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

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
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function QuranPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;

  const q = getFirstValue(sp.q).trim();
  const rawType = getFirstValue(sp.type);
  const type =
    rawType === "meccan" || rawType === "medinan" ? rawType : "all";

  let surahs: Surah[] = [];
  let loadError = false;

  try {
    surahs = await fetchSurahs();
  } catch {
    loadError = true;
  }

  const filteredSurahs = surahs.filter((surah) => {
    if (type === "meccan" && !isMeccan(surah.revelationType)) {
      return false;
    }

    if (type === "medinan" && !isMedinan(surah.revelationType)) {
      return false;
    }

    return surahMatches(surah, q);
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: isRTL ? "القرآن الكريم" : "The Holy Quran",
    inLanguage: l,
    numberOfChapters: surahs.length || 114,
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              📖 {isRTL ? "114 سورة" : "114 Surahs"}
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
                <option value="meccan">{ui.meccan}</option>
                <option value="medinan">{ui.medinan}</option>
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
              const externalUrl = `https://quran.com/${surah.number}`;

              return (
                <a
                  key={surah.number}
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card-interactive group relative overflow-hidden p-5"
                >
                  <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-base font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {formatNumber(surah.number, l)}
                    </span>

                    <span className="badge-gold text-xs">
                      {revelationLabel(surah.revelationType, l)}
                    </span>
                  </div>

                  <h2
                    className="mb-1 text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {surah.name}
                  </h2>

                  <p className="mb-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {surah.englishName}
                  </p>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {surah.englishNameTranslation}
                  </p>

                  <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>
                      {formatNumber(surah.numberOfAyahs, l)} {ui.ayahs}
                    </span>

                    <span className="inline-flex items-center gap-1 text-primary-700 dark:text-primary-300">
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
                        className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </a>
              );
            })}
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