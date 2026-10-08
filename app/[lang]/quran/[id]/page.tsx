import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, t, type Lang } from "@/lib/i18n";
import { SURAHS, getSurahByNumber, toArabicNumeral } from "@/lib/data";
import TopBar from "@/components/TopBar";
import BookmarkButton from "@/components/BookmarkButton";

// ===== إعدادات القرآن من AlQuran Cloud =====
const ARABIC_EDITION = "quran-uthmani";
const ENGLISH_EDITION = "en.sahih";

const RECITERS = [
  {
    id: "ar.alafasy",
    ar: "مشاري راشد العفاسي",
    en: "Mishary Rashid Alafasy",
  },
  {
    id: "ar.abdulbasitmurattal",
    ar: "عبد الباسط عبد الصمد مرتل",
    en: "Abdul Basit Abdus-Samad (Murattal)",
  },
  {
    id: "ar.husary",
    ar: "محمود خليل الحصري",
    en: "Mahmoud Khalil Al-Husary",
  },
  {
    id: "ar.minshawi",
    ar: "محمد صديق المنشاوي",
    en: "Mohamed Siddiq El-Minshawi",
  },
] as const;

type ReciterId = (typeof RECITERS)[number]["id"];

type Ayah = {
  number: number;
  text: string;
  numberInSurah: number;
  juz?: number;
  page?: number;
};

type EditionSurah = {
  identifier: string;
  language: string;
  name: string;
  ayahs: Ayah[];
};

type EditionsApiResponse = {
  code: number;
  status: string;
  data: EditionSurah[];
};

type SearchParams = {
  reciter?: string | string[];
};

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function isReciterId(value: string): value is ReciterId {
  return RECITERS.some((reciter) => reciter.id === value);
}

function getReciterLabel(reciter: (typeof RECITERS)[number], lang: Lang) {
  return lang === "ar" ? reciter.ar : reciter.en;
}

function buildReciterHref(lang: Lang, surahNumber: number, reciterId: ReciterId) {
  return `/${lang}/quran/${surahNumber}?reciter=${reciterId}`;
}

function getAudioUrl(reciterId: ReciterId, globalAyahNumber: number) {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
}

async function fetchSurahEditions(surahNumber: number, lang: Lang) {
  const editions =
    lang === "en"
      ? `${ARABIC_EDITION},${ENGLISH_EDITION}`
      : ARABIC_EDITION;

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}`;

  const res = await fetch(url, {
    next: {
      revalidate: 60 * 60 * 24, // تحديث يومي
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Quran data: ${res.status}`);
  }

  const json = (await res.json()) as EditionsApiResponse;

  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error("Invalid Quran API response");
  }

  const arabicEdition = json.data.find(
    (edition) => edition.identifier === ARABIC_EDITION
  );

  if (!arabicEdition) {
    throw new Error("Arabic Quran edition not found");
  }

  const translationEdition =
    lang === "en"
      ? json.data.find((edition) => edition.identifier === ENGLISH_EDITION)
      : undefined;

  return {
    arabicAyahs: arabicEdition.ayahs,
    translationAyahs: translationEdition?.ayahs ?? [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const surahNumber = Number(id);
  const surah = getSurahByNumber(surahNumber);

  if (!surah) {
    return {};
  }

  const title =
    l === "ar"
      ? `سورة ${surah.arabicName}`
      : `Surah ${surah.englishName}`;

  const description =
    l === "ar"
      ? `اقرأ واستمع إلى سورة ${surah.arabicName}، ${toArabicNumeral(
          surah.ayahs
        )} آية، ${surah.type === "makki" ? "مكية" : "مدنية"}.`
      : `Read and listen to Surah ${surah.englishName}, ${surah.ayahs} ayahs, ${
          surah.type === "makki" ? "Meccan" : "Medinan"
        }.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/quran/${surahNumber}`,
      languages: {
        ar: `/ar/quran/${surahNumber}`,
        en: `/en/quran/${surahNumber}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/${l}/quran/${surahNumber}`,
      type: "article",
      locale: l === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang, id } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const isRTL = l === "ar";

  const surahNumber = Number(id);

  if (
    !Number.isInteger(surahNumber) ||
    surahNumber < 1 ||
    surahNumber > SURAHS.length
  ) {
    notFound();
  }

  const surah = getSurahByNumber(surahNumber);

  if (!surah) {
    notFound();
  }

  const sp = await searchParams;
  const requestedReciter = getFirstValue(sp.reciter);

  const reciterId: ReciterId = isReciterId(requestedReciter)
    ? requestedReciter
    : RECITERS[0].id;

  const prevSurah = surahNumber > 1 ? getSurahByNumber(surahNumber - 1) : null;
  const nextSurah =
    surahNumber < SURAHS.length ? getSurahByNumber(surahNumber + 1) : null;

  const pageTitle =
    isRTL ? `سورة ${surah.arabicName}` : `Surah ${surah.englishName}`;

  const pageSubtitle = isRTL
    ? `${toArabicNumeral(surah.ayahs)} آية • ${
        surah.type === "makki" ? "مكية" : "مدنية"
      }`
    : `${surah.ayahs} ayahs • ${
        surah.type === "makki" ? "Meccan" : "Medinan"
      }`;

  let quranData: Awaited<ReturnType<typeof fetchSurahEditions>> | null = null;
  let fetchError: string | null = null;

  try {
    quranData = await fetchSurahEditions(surahNumber, l);
  } catch (error) {
    fetchError =
      error instanceof Error
        ? error.message
        : isRTL
        ? "تعذر تحميل نص السورة حاليًا."
        : "Unable to load surah text right now.";
  }

  return (
    <main>
      <TopBar
        title={pageTitle}
        subtitle={pageSubtitle}
        backHref={`/${l}/quran`}
        showBookmark={false}
        breadcrumb={[
          {
            label: t(l, "nav.home"),
            href: `/${l}`,
          },
          {
            label: t(l, "quran.title"),
            href: `/${l}/quran`,
          },
          {
            label: isRTL ? surah.arabicName : surah.englishName,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== بطاقة معلومات السورة ===== */}
        <div className="card relative overflow-hidden p-6 md:p-8">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-primary-600 dark:text-primary-300">
                {isRTL ? "السورة" : "Surah"}{" "}
                {isRTL ? toArabicNumeral(surah.number) : surah.number}
              </p>

              <h1
                className="text-3xl font-black text-slate-900 md:text-4xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {isRTL ? `سورة ${surah.arabicName}` : surah.englishName}
              </h1>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {isRTL ? surah.englishName : surah.arabicName}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="badge-primary">
                  {isRTL
                    ? `${toArabicNumeral(surah.ayahs)} آية`
                    : `${surah.ayahs} ayahs`}
                </span>

                <span
                  className={
                    surah.type === "makki"
                      ? "badge-gold"
                      : "badge-primary"
                  }
                >
                  {surah.type === "makki"
                    ? t(l, "quran.makki")
                    : t(l, "quran.madani")}
                </span>
              </div>
            </div>

            {/* ===== اختيار القارئ ===== */}
            <div className="w-full md:w-auto">
              <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                {isRTL ? "القارئ" : "Reciter"}
              </p>

              <div className="flex flex-wrap gap-2">
                {RECITERS.map((reciter) => {
                  const isActive = reciter.id === reciterId;

                  return (
                    <Link
                      key={reciter.id}
                      href={buildReciterHref(l, surahNumber, reciter.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                      }`}
                    >
                      {getReciterLabel(reciter, l)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== البسملة ===== */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className="mt-8 text-center">
            <p
              className="quran-text text-2xl md:text-3xl"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* ===== خطأ التحميل ===== */}
        {fetchError && (
          <div className="card mt-8 border-red-200 p-8 text-center dark:border-red-900/40">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-300">
              {isRTL ? "تعذر تحميل الآيات" : "Unable to load ayahs"}
            </h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {fetchError}
            </p>

            <Link
              href={buildReciterHref(l, surahNumber, reciterId)}
              className="btn-primary"
            >
              {isRTL ? "إعادة المحاولة" : "Retry"}
            </Link>
          </div>
        )}

        {/* ===== الآيات ===== */}
        {quranData && (
          <div className="mt-10 space-y-5">
            {quranData.arabicAyahs.map((ayah, index) => {
              const translation = quranData.translationAyahs[index]?.text;
              const audioUrl = getAudioUrl(reciterId, ayah.number);
              const ayahAnchor = `ayah-${ayah.numberInSurah}`;
              const ayahPath = `/${l}/quran/${surahNumber}#${ayahAnchor}`;

              return (
                <article
                  key={ayah.number}
                  id={ayahAnchor}
                  className="card scroll-mt-32 p-5 md:p-7"
                >
                  {/* رأس الآية */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        {isRTL
                          ? toArabicNumeral(ayah.numberInSurah)
                          : ayah.numberInSurah}
                      </span>

                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {isRTL ? "آية" : "Ayah"}{" "}
                        {isRTL
                          ? toArabicNumeral(ayah.numberInSurah)
                          : ayah.numberInSurah}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookmarkButton
                        item={{
                          id: ayahPath,
                          title: `${pageTitle} — ${
                            isRTL ? "آية" : "Ayah"
                          } ${ayah.numberInSurah}`,
                          href: ayahPath,
                          type: "quran-ayah",
                        }}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* النص العربي */}
                  <p
                    className="quran-text text-2xl leading-[2.35] md:text-3xl"
                    style={{ fontFamily: "var(--font-quran)" }}
                  >
                    {ayah.text}
                    <span className="ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 bg-gold-50 text-sm font-black text-gold-700 align-middle dark:border-gold-700/50 dark:bg-gold-900/20 dark:text-gold-300">
                      {isRTL
                        ? toArabicNumeral(ayah.numberInSurah)
                        : ayah.numberInSurah}
                    </span>
                  </p>

                  {/* الترجمة الإنجليزية */}
                  {l === "en" && translation && (
                    <p className="mt-5 border-t border-slate-100 pt-5 text-base leading-relaxed text-slate-600 dark:border-night-700 dark:text-slate-300">
                      {translation}
                    </p>
                  )}

                  {/* مشغل الصوت */}
                  <div className="mt-5">
                    <audio
                      controls
                      preload="none"
                      className="w-full rounded-xl"
                    >
                      <source src={audioUrl} type="audio/mpeg" />
                      {isRTL
                        ? "متصفحك لا يدعم تشغيل الصوت."
                        : "Your browser does not support audio playback."}
                    </audio>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ===== التنقل بين السور ===== */}
        <nav className="mt-12 grid gap-4 sm:grid-cols-2">
          {prevSurah ? (
            <Link
              href={`/${l}/quran/${prevSurah.number}`}
              className="card card-interactive group flex items-center gap-4 p-5"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="shrink-0 text-primary-600 transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 dark:text-primary-300"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isRTL ? "السورة السابقة" : "Previous Surah"}
                </p>
                <h3 className="truncate text-lg font-bold text-slate-800 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {isRTL ? prevSurah.arabicName : prevSurah.englishName}
                </h3>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextSurah ? (
            <Link
              href={`/${l}/quran/${nextSurah.number}`}
              className="card card-interactive group flex items-center justify-end gap-4 p-5 text-end sm:text-end"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isRTL ? "السورة التالية" : "Next Surah"}
                </p>
                <h3 className="truncate text-lg font-bold text-slate-800 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {isRTL ? nextSurah.arabicName : nextSurah.englishName}
                </h3>
              </div>

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="shrink-0 text-primary-600 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 dark:text-primary-300"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </section>
    </main>
  );
}