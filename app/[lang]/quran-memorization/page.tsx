// app/[lang]/quran-memorization/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MemorizationPlan from "./MemorizationPlan";

// ============================================================
// نصوص الواجهة
// ============================================================

type PageUI = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  verse: string;
  verseSource: string;
  hadith: string;
  hadithSource: string;
  introTitle: string;
  introDesc: string;
  statsTotalSurahs: string;
  statsTotalAyahs: string;
  statsTracking: string;
  statsFree: string;
  tipsTitle: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  relatedTitle: string;
  quranPage: string;
  quranPageDesc: string;
  adhkarPage: string;
  adhkarPageDesc: string;
  dailyWirdPage: string;
  dailyWirdPageDesc: string;
  tafsirPage: string;
  tafsirPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  virtuesTitle: string;
  virtue1Title: string;
  virtue1Desc: string;
  virtue2Title: string;
  virtue2Desc: string;
  virtue3Title: string;
  virtue3Desc: string;
  virtue4Title: string;
  virtue4Desc: string;
};

const UI: Record<Lang, PageUI> = {
  ar: {
    title: "خطة حفظ القرآن",
    subtitle: "نظّم وردك اليومي من الحفظ والمراجعة وتتبع تقدمك",
    home: "الرئيسية",
    description:
      "أداة خطة حفظ القرآن من منصة إسماعيل أحمد نجيب. اختر السورة، حدد هدفك اليومي، وتتبع تقدمك في الحفظ والمراجعة مع نظام Streak للتحفيز.",
    verse: "﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾",
    verseSource: "سورة القمر — الآية 17",
    hadith: "اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ",
    hadithSource: "رواه مسلم",
    introTitle: "فضل حفظ القرآن",
    introDesc:
      "حفظ القرآن من أعظم القربات وأفضل الطاعات. حافظ القرآن يرتقي في الدرجات يوم القيامة، ويُقال له: اقرأ وارتقِ ورتل كما كنت ترتل في الدنيا. وهذه الأداة تساعدك على تنظيم خطة حفظ منهجية مع التتبع اليومي والتحفيز المستمر.",
    statsTotalSurahs: "سورة للحفظ",
    statsTotalAyahs: "آية",
    statsTracking: "تتبع يومي",
    statsFree: "مجاني 100%",
    tipsTitle: "منهج الحفظ الناجح",
    tip1: "اختر وقتاً ثابتاً يومياً، ويفضل بعد صلاة الفجر حيث يكون الذهن صافياً.",
    tip2: "ابدأ بالمراجعة قبل الحفظ الجديد، فالمراجعة أثمن من الحفظ الجديد.",
    tip3: "استمع للتلاوة قبل الحفظ لضبط النطق والتجويد.",
    tip4: "لا تنتقل لصفحة جديدة حتى تتقن ما قبلها تماماً.",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع للسور.",
    adhkarPage: "الأذكار",
    adhkarPageDesc: "أذكار الصباح والمساء.",
    dailyWirdPage: "الورد اليومي",
    dailyWirdPageDesc: "خطة أسبوعية متكاملة.",
    tafsirPage: "التفسير",
    tafsirPageDesc: "فهم معاني الآيات.",
    noteTitle: "تنبيهات مهمة",
    note1: "تقدمك يُحفظ محلياً على جهازك، ويُعاد تعيينه حسب اختيارك.",
    note2: "الأفضل الحفظ مع شيخ متقن لتصحيح التلاوة وضبط الأحكام.",
    note3: "الاستمرارية أهم من الكمية. آية واحدة يومياً مع المراجعة خير من صفحة تُنسى.",
    virtuesTitle: "فضائل حفظ القرآن",
    virtue1Title: "الرفعة في الجنة",
    virtue1Desc: "يقال لصاحب القرآن: اقرأ وارتقِ ورتل، فإن منزلتك عند آخر آية تقرأها.",
    virtue2Title: "الشفاعة يوم القيامة",
    virtue2Desc: "القرآن شافع مشفع لمن عمل به، يأتي يوم القيامة يدافع عن صاحبه.",
    virtue3Title: "أهل الله وخاصته",
    virtue3Desc: "إن لله أهلين من الناس، أهل القرآن هم أهل الله وخاصته.",
    virtue4Title: "التاج والوقار",
    virtue4Desc: "يُتوج حافظ القرآن بتاج الكرامة، ويُكسى والداه حلتين لا تقوم لهما الدنيا.",
  },
  en: {
    title: "Quran Memorization Plan",
    subtitle: "Organize your daily portion of memorization and revision, and track your progress",
    home: "Home",
    description:
      "Quran memorization plan tool from the Ismail Ahmed Naguib Platform. Choose a surah, set your daily goal, and track your memorization and review progress with a motivational streak system.",
    verse: "\"And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?\"",
    verseSource: "Surah Al-Qamar — Verse 17",
    hadith: "Recite the Quran, for it will come on the Day of Resurrection as an intercessor for its companions.",
    hadithSource: "Narrated by Muslim",
    introTitle: "Virtue of Memorizing the Quran",
    introDesc:
      "Memorizing the Quran is one of the greatest acts of worship and best deeds. The memorizer of the Quran rises in degrees on the Day of Resurrection, and it is said to them: 'Recite and rise, and recite as you used to recite in the world.' This tool helps you organize a methodical memorization plan with daily tracking and continuous motivation.",
    statsTotalSurahs: "Surahs to Memorize",
    statsTotalAyahs: "Ayahs",
    statsTracking: "Daily Tracking",
    statsFree: "100% Free",
    tipsTitle: "Successful Memorization Method",
    tip1: "Choose a fixed daily time, preferably after Fajr prayer when the mind is clear.",
    tip2: "Start with revision before new memorization, for revision is more valuable than new memorization.",
    tip3: "Listen to recitation before memorizing to fix pronunciation and tajweed.",
    tip4: "Do not move to a new page until you have fully mastered the previous one.",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to surahs.",
    adhkarPage: "Adhkar",
    adhkarPageDesc: "Morning and evening remembrances.",
    dailyWirdPage: "Daily Wird",
    dailyWirdPageDesc: "Complete weekly plan.",
    tafsirPage: "Tafsir",
    tafsirPageDesc: "Understand verse meanings.",
    noteTitle: "Important Notices",
    note1: "Your progress is saved locally on your device and resets according to your choice.",
    note2: "It is best to memorize with a proficient teacher to correct recitation and master rulings.",
    note3: "Consistency is more important than quantity. One ayah daily with revision is better than a page that is forgotten.",
    virtuesTitle: "Virtues of Memorizing the Quran",
    virtue1Title: "Elevation in Paradise",
    virtue1Desc: "It is said to the companion of the Quran: 'Recite and rise, for your rank is at the last verse you recite.'",
    virtue2Title: "Intercession on Judgment Day",
    virtue2Desc: "The Quran is an intercessor for those who act upon it, coming on Judgment Day to defend its companion.",
    virtue3Title: "People of Allah",
    virtue3Desc: "Allah has people among mankind; the people of the Quran are Allah's people and His special ones.",
    virtue4Title: "Crown and Dignity",
    virtue4Desc: "The memorizer of the Quran is crowned with the crown of dignity, and their parents are clothed with two garments better than this world.",
  },
};

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
      canonical: `/${l}/quran-memorization`,
      languages: {
        ar: "/ar/quran-memorization",
        en: "/en/quran-memorization",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/quran-memorization`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
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

export default async function QuranMemorizationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: ui.title,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description: ui.description,
        inLanguage: l,
        url: `/${l}/quran-memorization`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "HowTo",
        name: ui.tipsTitle,
        description: ui.introDesc,
        inLanguage: l,
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: isRTL ? "اختر وقتاً ثابتاً" : "Choose fixed time",
            text: ui.tip1,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: isRTL ? "ابدأ بالمراجعة" : "Start with revision",
            text: ui.tip2,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: isRTL ? "استمع قبل الحفظ" : "Listen before memorizing",
            text: ui.tip3,
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: isRTL ? "لا تنتقل قبل الإتقان" : "Don't move before mastery",
            text: ui.tip4,
          },
        ],
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

      <section className="container-page pt-10 md:pt-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-emerald-800 dark:from-emerald-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          {/* نمط زخرفي */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #10b981 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #10b981, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🎯 {isRTL ? "خطة منهجية" : "Methodical Plan"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.subtitle}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>

            {/* حديث شريف */}
            <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 backdrop-blur-sm dark:border-primary-800 dark:bg-primary-950/20">
              <p
                className="mb-1 text-base font-black text-primary-700 md:text-lg dark:text-primary-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.hadith}»
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                📜 {ui.hadithSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📖" label={ui.statsTotalSurahs} value={114} color="primary" />
          <StatCard icon="✨" label={ui.statsTotalAyahs} value={6236} color="gold" />
          <StatCard icon="📊" label={ui.statsTracking} value="✓" color="primary" />
          <StatCard icon="🎁" label={ui.statsFree} value="100%" color="gold" />
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
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>

        {/* ===== فضائل حفظ القرآن ===== */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🌟 {ui.virtuesTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <VirtueCard
              icon="👑"
              title={ui.virtue1Title}
              description={ui.virtue1Desc}
              color="gold"
            />
            <VirtueCard
              icon="🤲"
              title={ui.virtue2Title}
              description={ui.virtue2Desc}
              color="primary"
            />
            <VirtueCard
              icon="💫"
              title={ui.virtue3Title}
              description={ui.virtue3Desc}
              color="gold"
            />
            <VirtueCard
              icon="🏆"
              title={ui.virtue4Title}
              description={ui.virtue4Desc}
              color="primary"
            />
          </div>
        </div>

        {/* ===== الخطة التفاعلية ===== */}
        <div className="mb-10">
          <MemorizationPlan lang={l} />
        </div>

        {/* ===== منهج الحفظ ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-primary h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              📚 {ui.tipsTitle}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <TipCard number={1} text={ui.tip1} isRTL={isRTL} />
              <TipCard number={2} text={ui.tip2} isRTL={isRTL} />
              <TipCard number={3} text={ui.tip3} isRTL={isRTL} />
              <TipCard number={4} text={ui.tip4} isRTL={isRTL} />
            </div>
          </div>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mb-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/quran`} className="card card-interactive group flex items-center gap-3 p-5">
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

            <Link href={`/${l}/daily-wird`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📅</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dailyWirdPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.dailyWirdPageDesc}
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

        {/* ===== تنبيهات ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note3}</span>
                </li>
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
// مكون VirtueCard
// ============================================================

function VirtueCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: "primary" | "gold";
}) {
  const borderClass =
    color === "gold"
      ? "border-gold-300 bg-gold-50/60 dark:border-gold-800/40 dark:bg-gold-950/20"
      : "border-primary-300 bg-primary-50/60 dark:border-primary-800/40 dark:bg-primary-950/20";
  const titleColor =
    color === "gold"
      ? "text-gold-700 dark:text-gold-300"
      : "text-primary-700 dark:text-primary-300";

  return (
    <div
      className={`card border-2 ${borderClass} p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-night-800">
          {icon}
        </span>
        <h3
          className={`text-lg font-black ${titleColor}`}
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

// ============================================================
// مكون TipCard
// ============================================================

function TipCard({
  number,
  text,
  isRTL,
}: {
  number: number;
  text: string;
  isRTL: boolean;
}) {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const displayNumber = isRTL
    ? String(number)
        .split("")
        .map((d) => arabicNumerals[Number(d)] || d)
        .join("")
    : String(number);

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-black text-white shadow-md">
        {displayNumber}
      </span>
      <p className="leading-relaxed text-slate-700 dark:text-slate-200">
        {text}
      </p>
    </div>
  );
}