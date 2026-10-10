// app/[lang]/quran/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, t, type Lang } from "@/lib/i18n";
import { SURAHS, getSurahByNumber, toArabicNumeral } from "@/lib/data";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookmarkButton from "@/components/BookmarkButton";
import SurahPlayer from "./SurahPlayer";

// ===== إعدادات القرآن من AlQuran Cloud =====
const ARABIC_EDITION = "quran-uthmani";
const ENGLISH_EDITION = "en.sahih";

const RECITERS = [
  { id: "ar.alafasy", ar: "مشاري راشد العفاسي", en: "Mishary Rashid Alafasy" },
  { id: "ar.abdulbasitmurattal", ar: "عبد الباسط عبد الصمد", en: "Abdul Basit Abdus-Samad" },
  { id: "ar.husary", ar: "محمود خليل الحصري", en: "Mahmoud Khalil Al-Husary" },
  { id: "ar.minshawi", ar: "محمد صديق المنشاوي", en: "Mohamed Siddiq El-Minshawi" },
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
  if (Array.isArray(value)) return value[0] ?? "";
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
    lang === "en" ? `${ARABIC_EDITION},${ENGLISH_EDITION}` : ARABIC_EDITION;
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions}`;

  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) throw new Error(`Failed to fetch Quran data: ${res.status}`);

  const json = (await res.json()) as EditionsApiResponse;
  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error("Invalid Quran API response");
  }

  const arabicEdition = json.data.find((e) => e.identifier === ARABIC_EDITION);
  if (!arabicEdition) throw new Error("Arabic Quran edition not found");

  const translationEdition =
    lang === "en"
      ? json.data.find((e) => e.identifier === ENGLISH_EDITION)
      : undefined;

  return {
    arabicAyahs: arabicEdition.ayahs,
    translationAyahs: translationEdition?.ayahs ?? [],
  };
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const surahNumber = Number(id);
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return {};

  const isRTL = l === "ar";
  const title = isRTL ? `سورة ${surah.arabicName}` : `Surah ${surah.englishName}`;
  const typeLabel = isRTL
    ? surah.type === "makki" ? "مكية" : "مدنية"
    : surah.type === "makki" ? "Meccan" : "Medinan";

  const description = isRTL
    ? `اقرأ واستمع إلى سورة ${surah.arabicName}، ${toArabicNumeral(surah.ayahs)} آية ${typeLabel}، بأصوات أفضل القراء.`
    : `Read and listen to Surah ${surah.englishName}, ${surah.ayahs} ayahs (${typeLabel}), with the best reciters.`;

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
      locale: isRTL ? "ar_EG" : "en_US",
      images: [{
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return SURAHS.flatMap((surah) => [
    { lang: "ar", id: String(surah.number) },
    { lang: "en", id: String(surah.number) },
  ]);
}

// ============================================================
// الصفحة
// ============================================================

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang, id } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const isRTL = l === "ar";

  const surahNumber = Number(id);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > SURAHS.length) {
    notFound();
  }

  const surah = getSurahByNumber(surahNumber);
  if (!surah) notFound();

  const sp = await searchParams;
  const requestedReciter = getFirstValue(sp.reciter);
  const reciterId: ReciterId = isReciterId(requestedReciter)
    ? requestedReciter
    : RECITERS[0].id;

  const reciter = RECITERS.find((r) => r.id === reciterId)!;

  const prevSurah = surahNumber > 1 ? getSurahByNumber(surahNumber - 1) : null;
  const nextSurah = surahNumber < SURAHS.length ? getSurahByNumber(surahNumber + 1) : null;

  const pageTitle = isRTL ? `سورة ${surah.arabicName}` : `Surah ${surah.englishName}`;
  const typeLabel = isRTL
    ? surah.type === "makki" ? "مكية" : "مدنية"
    : surah.type === "makki" ? "Meccan" : "Medinan";

  let quranData: Awaited<ReturnType<typeof fetchSurahEditions>> | null = null;
  let fetchError: string | null = null;

  try {
    quranData = await fetchSurahEditions(surahNumber, l);
  } catch (error) {
    fetchError = error instanceof Error
      ? error.message
      : isRTL ? "تعذر تحميل نص السورة حاليًا." : "Unable to load surah text right now.";
  }

  // تحويل الآيات لمشغل الصوت
  const audioAyahs = quranData?.arabicAyahs.map((ayah) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    audioUrl: getAudioUrl(reciterId, ayah.number),
    text: ayah.text,
  })) ?? [];

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageTitle,
    description: `${pageTitle} - ${surah.ayahs} ayahs (${typeLabel})`,
    inLanguage: l,
    url: `/${l}/quran/${surahNumber}`,
    articleSection: isRTL ? "القرآن الكريم" : "Holy Quran",
    keywords: isRTL
      ? `سورة ${surah.arabicName}, القرآن الكريم, تلاوة, ${reciter.ar}`
      : `Surah ${surah.englishName}, Holy Quran, recitation, ${reciter.en}`,
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={pageTitle}
        subtitle={`${toArabicNumeral(surah.ayahs)} ${isRTL ? "آية" : "ayahs"} • ${typeLabel}`}
        backHref={`/${l}/quran`}
        showBookmark={false}
        breadcrumb={[
          { label: t(l, "home"), href: `/${l}` },
          { label: t(l, "quran"), href: `/${l}/quran` },
          { label: isRTL ? surah.arabicName : surah.englishName },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-10 dark:border-gold-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          {/* نمط زخرفي */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, #d4af37 1px, transparent 1px), radial-gradient(circle at 75% 75%, #0e7490 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <span className="text-5xl" style={{ fontFamily: "var(--font-quran)" }}>
                  {surahNumber < 10 ? `0${surahNumber}` : surahNumber}
                </span>
              </span>
            </div>

            <span className="badge-gold mb-4">
              {isRTL ? `السورة ${toArabicNumeral(surahNumber)}` : `Surah ${surahNumber}`}
            </span>

            <h1
              className="mb-2 text-4xl font-black leading-tight text-slate-900 md:text-6xl dark:text-white"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {isRTL ? `سورة ${surah.arabicName}` : surah.englishName}
            </h1>

            <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
              {isRTL ? surah.englishName : surah.arabicName}
            </p>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-night-700 dark:bg-night-800/80">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isRTL ? "الآيات" : "Ayahs"}
                </p>
                <p
                  className="text-xl font-black text-primary-700 dark:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {isRTL ? toArabicNumeral(surah.ayahs) : surah.ayahs}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-night-700 dark:bg-night-800/80">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isRTL ? "النوع" : "Type"}
                </p>
                <p className="text-sm font-black text-gold-700 dark:text-gold-300">
                  {typeLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-night-700 dark:bg-night-800/80">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isRTL ? "القارئ" : "Reciter"}
                </p>
                <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                  {isRTL ? reciter.ar : reciter.en}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-night-700 dark:bg-night-800/80">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isRTL ? "الترتيب" : "Order"}
                </p>
                <p className="text-xl font-black text-primary-700 dark:text-primary-300">
                  {isRTL ? toArabicNumeral(surahNumber) : surahNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== اختيار القارئ ===== */}
        <div className="card mb-8 p-5">
          <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">
            🎤 {isRTL ? "اختر القارئ" : "Choose Reciter"}
          </p>
          <div className="flex flex-wrap gap-2">
            {RECITERS.map((r) => {
              const isActive = r.id === reciterId;
              return (
                <Link
                  key={r.id}
                  href={buildReciterHref(l, surahNumber, r.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
                  }`}
                >
                  {getReciterLabel(r, l)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== المشغل المركزي ===== */}
        {audioAyahs.length > 0 && (
          <SurahPlayer
            ayahs={audioAyahs}
            lang={l}
            surahName={pageTitle}
            reciterName={isRTL ? reciter.ar : reciter.en}
          />
        )}

        {/* ===== البسملة ===== */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className="mt-8 text-center">
            <p
              className="quran-text text-3xl md:text-4xl text-gold-700 dark:text-gold-300"
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
            <p className="mb-6 text-slate-500 dark:text-slate-400">{fetchError}</p>
            <Link href={buildReciterHref(l, surahNumber, reciterId)} className="btn-primary">
              {isRTL ? "إعادة المحاولة" : "Retry"}
            </Link>
          </div>
        )}

        {/* ===== الآيات ===== */}
        {quranData && (
          <div className="mt-10 space-y-5">
            {quranData.arabicAyahs.map((ayah, index) => {
              const translation = quranData.translationAyahs[index]?.text;
              const ayahAnchor = `ayah-${ayah.numberInSurah}`;
              const ayahPath = `/${l}/quran/${surahNumber}#${ayahAnchor}`;

              return (
                <article
                  key={ayah.number}
                  id={ayahAnchor}
                  className="card scroll-mt-52 p-5 transition-all duration-300 md:p-7"
                >
                  {/* رأس الآية */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        {isRTL ? toArabicNumeral(ayah.numberInSurah) : ayah.numberInSurah}
                      </span>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {isRTL ? "آية" : "Ayah"}{" "}
                        {isRTL ? toArabicNumeral(ayah.numberInSurah) : ayah.numberInSurah}
                      </p>
                    </div>

                    <BookmarkButton
                      item={{
                        id: ayahPath,
                        title: `${pageTitle} — ${isRTL ? "آية" : "Ayah"} ${ayah.numberInSurah}`,
                        href: ayahPath,
                        type: "quran-ayah",
                      }}
                      size="sm"
                    />
                  </div>

                  {/* النص العربي */}
                  <p
                    className="quran-text text-2xl leading-[2.35] md:text-3xl"
                    style={{ fontFamily: "var(--font-quran)" }}
                  >
                    {ayah.text}
                    <span className="ms-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 bg-gold-50 text-sm font-black text-gold-700 align-middle dark:border-gold-700/50 dark:bg-gold-900/20 dark:text-gold-300">
                      {isRTL ? toArabicNumeral(ayah.numberInSurah) : ayah.numberInSurah}
                    </span>
                  </p>

                  {/* الترجمة الإنجليزية */}
                  {l === "en" && translation && (
                    <p className="mt-5 border-t border-slate-100 pt-5 text-base leading-relaxed text-slate-600 dark:border-night-700 dark:text-slate-300">
                      {translation}
                    </p>
                  )}
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
                className="shrink-0 text-primary-600 transition-transform group-hover:-translate-x-1 rtl:rotate-180 dark:text-primary-300"
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
          ) : <div />}

          {nextSurah ? (
            <Link
              href={`/${l}/quran/${nextSurah.number}`}
              className="card card-interactive group flex items-center justify-end gap-4 p-5 text-end"
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
                className="shrink-0 text-primary-600 transition-transform group-hover:translate-x-1 rtl:rotate-180 dark:text-primary-300"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div />}
        </nav>
      </section>

      <Footer lang={l} />
    </main>
  );
}