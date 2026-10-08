import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, t, type Lang } from "@/lib/i18n";
import { SURAHS, toArabicNumeral } from "@/lib/data";
import TopBar from "@/components/TopBar";

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

  return {
    title: t(l, "quran.title"),
    description: t(l, "quran.subtitle"),
    alternates: {
      canonical: `/${l}/quran`,
    },
  };
}

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
};

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function buildQuranQuery(options: {
  q?: string;
  type?: "all" | "makki" | "madani";
}) {
  const search = new URLSearchParams();

  if (options.q?.trim()) {
    search.set("q", options.q.trim());
  }

  if (options.type && options.type !== "all") {
    search.set("type", options.type);
  }

  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
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
  const isRTL = l === "ar";

  const sp = await searchParams;

  const q = getFirstValue(sp.q).trim();
  const rawType = getFirstValue(sp.type);

  const type: "all" | "makki" | "madani" =
    rawType === "makki" || rawType === "madani" ? rawType : "all";

  const totalAyahs = SURAHS.reduce((sum, surah) => sum + surah.ayahs, 0);

  const filteredSurahs = SURAHS.filter((surah) => {
    if (type !== "all" && surah.type !== type) {
      return false;
    }

    if (!q) {
      return true;
    }

    const lowerQ = q.toLowerCase();

    return (
      surah.arabicName.includes(q) ||
      surah.englishName.toLowerCase().includes(lowerQ) ||
      String(surah.number) === q
    );
  });

  const filterLinks = [
    {
      key: "all" as const,
      label: isRTL ? "الكل" : "All",
    },
    {
      key: "makki" as const,
      label: t(l, "quran.makki"),
    },
    {
      key: "madani" as const,
      label: t(l, "quran.madani"),
    },
  ];

  return (
    <main>
      <TopBar
        title={t(l, "quran.title")}
        subtitle={t(l, "quran.subtitle")}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: t(l, "nav.home"),
            href: `/${l}`,
          },
          {
            label: t(l, "quran.title"),
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card p-5 text-center">
            <p className="text-3xl font-black text-primary-600 dark:text-primary-400">
              {isRTL ? toArabicNumeral(SURAHS.length) : SURAHS.length}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isRTL ? "سورة" : "Surahs"}
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-3xl font-black text-gold-600 dark:text-gold-400">
              {isRTL ? toArabicNumeral(totalAyahs) : totalAyahs}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isRTL ? "آية" : "Ayahs"}
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-3xl font-black text-primary-600 dark:text-primary-400">
              {isRTL ? toArabicNumeral(30) : 30}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(l, "quran.juz")}
            </p>
          </div>

          <div className="card p-5 text-center">
            <p className="text-3xl font-black text-gold-600 dark:text-gold-400">
              {isRTL ? toArabicNumeral(604) : 604}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(l, "quran.page")}
            </p>
          </div>
        </div>

        {/* ===== البحث والفلترة ===== */}
        <div className="card mb-8 p-5 md:p-6">
          <form
            method="get"
            action={`/${l}/quran`}
            className="flex flex-col gap-4 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
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
                placeholder={t(l, "quran.search.placeholder")}
                className="input-islamic !ps-12"
                aria-label={t(l, "quran.search.placeholder")}
              />
            </div>

            <input
              type="hidden"
              name="type"
              value={type === "all" ? "" : type}
            />

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
              {isRTL ? "بحث" : "Search"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {filterLinks.map((filter) => {
              const isActive = type === filter.key;
              const href = `/${l}/quran${buildQuranQuery({
                q,
                type: filter.key,
              })}`;

              return (
                <Link
                  key={filter.key}
                  href={href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}

            {(q || type !== "all") && (
              <Link
                href={`/${l}/quran`}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                {isRTL ? "مسح الفلاتر" : "Clear filters"}
              </Link>
            )}
          </div>
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          {isRTL
            ? `عدد السور المعروضة: ${toArabicNumeral(filteredSurahs.length)}`
            : `Showing ${filteredSurahs.length} surahs`}
        </p>

        {/* ===== قائمة السور ===== */}
        {filteredSurahs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {isRTL ? "لا توجد نتائج" : "No results found"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {isRTL
                ? "جرّب البحث باسم السورة أو رقمها."
                : "Try searching by surah name or number."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah) => (
              <Link
                key={surah.number}
                href={`/${l}/quran/${surah.number}`}
                className="card card-interactive group block p-5"
              >
                <div className="flex items-center gap-4">
                  {/* رقم السورة */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    {isRTL ? toArabicNumeral(surah.number) : surah.number}
                  </div>

                  {/* معلومات السورة */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-800 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
                      {isRTL ? surah.arabicName : surah.englishName}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {isRTL
                          ? `${toArabicNumeral(surah.ayahs)} آية`
                          : `${surah.ayahs} ayahs`}
                      </span>

                      <span className="text-slate-300 dark:text-slate-600">
                        •
                      </span>

                      <span
                        className={`badge ${
                          surah.type === "makki"
                            ? "border-gold-300 bg-gold-100 text-gold-700 dark:border-gold-700/50 dark:bg-gold-900/30 dark:text-gold-400"
                            : "border-primary-300 bg-primary-100 text-primary-700 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        }`}
                      >
                        {surah.type === "makki"
                          ? t(l, "quran.makki")
                          : t(l, "quran.madani")}
                      </span>
                    </div>
                  </div>

                  {/* سهم */}
                  <svg
                    className="h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-500 rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:text-slate-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}