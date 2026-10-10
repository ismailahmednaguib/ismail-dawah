// app/[lang]/tasbih/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TasbihContent from "./tasbih-content";

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
  statsPhrases: string;
  statsTracking: string;
  statsLocal: string;
  statsFree: string;
  virtuesTitle: string;
  virtue1Title: string;
  virtue1Desc: string;
  virtue2Title: string;
  virtue2Desc: string;
  virtue3Title: string;
  virtue3Desc: string;
  virtue4Title: string;
  virtue4Desc: string;
  relatedTitle: string;
  adhkarPage: string;
  adhkarPageDesc: string;
  quranPage: string;
  quranPageDesc: string;
  ruqyahPage: string;
  ruqyahPageDesc: string;
  dailyWirdPage: string;
  dailyWirdPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
};

const UI: Record<Lang, PageUI> = {
  ar: {
    title: "المسبحة الإلكترونية",
    subtitle: "عدّاد تفاعلي للتسبيح والذكر مع حفظ التقدم",
    home: "الرئيسية",
    description:
      "مسبحة إلكترونية تفاعلية تحتوي على أشهر الأذكار والتسابيح مع عدّاد ذكي، حفظ تلقائي للتقدم، إحصائيات يومية وإجمالية، واهتزاز خفيف عند كل ضغطة.",
    verse: "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ ﴾",
    verseSource: "سورة البقرة — الآية 152",
    hadith: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    hadithSource: "متفق عليه",
    introTitle: "فضل التسبيح والذكر",
    introDesc:
      "التسبيح والذكر من أحب الأعمال إلى الله، وهو حياة القلوب ونور الصدور. هذه المسبحة الإلكترونية تساعدك على المحافظة على وردك من الذكر مع تتبع تقدمك اليومي والإجمالي، وتذكيرك بأفضال كل ذكر لتستحضر النية والخشوع.",
    statsPhrases: "ذكر متاح",
    statsTracking: "تتبع التقدم",
    statsLocal: "حفظ محلي",
    statsFree: "مجاني 100%",
    virtuesTitle: "فضائل التسبيح",
    virtue1Title: "غراس الجنة",
    virtue1Desc: "قال ﷺ: «من قال سبحان الله وبحمده غُرست له نخلة في الجنة». كل تسبيحة صدقة جارية.",
    virtue2Title: "حطّ الذنوب",
    virtue2Desc: "«من قال سبحان الله وبحمده في يوم مئة مرة حُطّت خطاياه وإن كانت مثل زبد البحر».",
    virtue3Title: "ثقل الميزان",
    virtue3Desc: "الكلمتان الخفيفتان على اللسان ثقيلتان في الميزان، حبيبتان إلى الرحمن.",
    virtue4Title: "كنز من كنوز الجنة",
    virtue4Desc: "«لا حول ولا قوة إلا بالله كنز من كنوز الجنة»، يُقال عند كل أمر عظيم.",
    relatedTitle: "صفحات ذات صلة",
    adhkarPage: "الأذكار",
    adhkarPageDesc: "أذكار الصباح والمساء.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع لكتاب الله.",
    ruqyahPage: "الرقية الشرعية",
    ruqyahPageDesc: "آيات وأدعية التحصين.",
    dailyWirdPage: "الورد اليومي",
    dailyWirdPageDesc: "خطة أسبوعية متكاملة.",
    noteTitle: "نصائح للذكر",
    note1: "استحضر النية والخشوع عند كل تسبيحة، فالذكر بالقلب مع اللسان أفضل.",
    note2: "اجعل لك ورداً ثابتاً يومياً ولو قليلاً، فالأعمال أحبها إلى الله أدومها.",
    note3: "استخدم المسبحة في أوقات الانتظار والسفر والمشي، فهي أوقات ذهبية للذكر.",
  },
  en: {
    title: "Digital Tasbih",
    subtitle: "Interactive counter for dhikr with progress tracking",
    home: "Home",
    description:
      "Interactive digital tasbih featuring popular adhkar and praises with smart counter, automatic progress saving, daily and lifetime statistics, and gentle haptic feedback.",
    verse: "\"So remember Me; I will remember you. And be grateful to Me and do not deny Me.\"",
    verseSource: "Surah Al-Baqarah — Verse 152",
    hadith: "Two words are light on the tongue, heavy on the Scale, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azeem.",
    hadithSource: "Agreed upon",
    introTitle: "Virtue of Tasbih and Dhikr",
    introDesc:
      "Tasbih and dhikr are among the most beloved deeds to Allah, and they are the life of hearts and light of chests. This digital tasbih helps you maintain your daily remembrance with progress tracking, daily and lifetime statistics, and reminders of each dhikr's virtues to inspire intention and humility.",
    statsPhrases: "Phrases Available",
    statsTracking: "Progress Tracking",
    statsLocal: "Local Storage",
    statsFree: "100% Free",
    virtuesTitle: "Virtues of Tasbih",
    virtue1Title: "Paradise Plantation",
    virtue1Desc: "The Prophet ﷺ said: 'Whoever says SubhanAllahi wa bihamdihi, a palm tree is planted for him in Paradise.'",
    virtue2Title: "Sin Forgiveness",
    virtue2Desc: "'Whoever says SubhanAllahi wa bihamdihi 100 times a day, his sins are forgiven even if they were like the foam of the sea.'",
    virtue3Title: "Heavy on the Scale",
    virtue3Desc: "Two words light on the tongue, heavy on the Scale, beloved to the Most Merciful.",
    virtue4Title: "Treasure of Paradise",
    virtue4Desc: "'La hawla wa la quwwata illa billah' is a treasure from the treasures of Paradise.",
    relatedTitle: "Related Pages",
    adhkarPage: "Adhkar",
    adhkarPageDesc: "Morning and evening remembrances.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to Allah's Book.",
    ruqyahPage: "Ruqyah",
    ruqyahPageDesc: "Verses for protection.",
    dailyWirdPage: "Daily Wird",
    dailyWirdPageDesc: "Complete weekly plan.",
    noteTitle: "Tips for Dhikr",
    note1: "Maintain intention and humility with each tasbih. Dhikr with heart and tongue is best.",
    note2: "Set a consistent daily portion, even if small. The most beloved deeds to Allah are the most consistent.",
    note3: "Use the tasbih during waiting times, travel, and walking — these are golden times for dhikr.",
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
      canonical: `/${l}/tasbih`,
      languages: {
        ar: "/ar/tasbih",
        en: "/en/tasbih",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/tasbih`,
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

export default async function TasbihPage({
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
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description: ui.description,
        inLanguage: l,
        url: `/${l}/tasbih`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/tasbih`,
        articleSection: isRTL ? "الأذكار" : "Adhkar",
        keywords: isRTL
          ? "مسبحة, تسبيح, ذكر, عداد, سبحة إلكترونية"
          : "tasbih, dhikr, counter, digital tasbih",
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
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  <circle cx="7" cy="7" r="1.5" fill="#d4af37" />
                  <circle cx="17" cy="7" r="1.5" fill="#d4af37" />
                  <circle cx="7" cy="17" r="1.5" fill="#d4af37" />
                  <circle cx="17" cy="17" r="1.5" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              📿 {isRTL ? "عدّاد التسبيح" : "Tasbih Counter"}
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
          <StatCard icon="🤲" label={ui.statsPhrases} value={10} color="primary" />
          <StatCard icon="📊" label={ui.statsTracking} value="✓" color="gold" />
          <StatCard icon="💾" label={ui.statsLocal} value="✓" color="primary" />
          <StatCard icon="✨" label={ui.statsFree} value="100%" color="gold" />
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
      </section>

      {/* ===== المحتوى التفاعلي ===== */}
      <TasbihContent lang={l} />

      {/* ===== فضائل التسبيح ===== */}
      <section className="container-page pb-10">
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
              icon="🌴"
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
              icon="⚖️"
              title={ui.virtue3Title}
              description={ui.virtue3Desc}
              color="gold"
            />
            <VirtueCard
              icon="💎"
              title={ui.virtue4Title}
              description={ui.virtue4Desc}
              color="primary"
            />
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

            <Link href={`/${l}/ruqyah`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🛡️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.ruqyahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.ruqyahPageDesc}
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
          </div>
        </div>

        {/* ===== نصائح ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              💡
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