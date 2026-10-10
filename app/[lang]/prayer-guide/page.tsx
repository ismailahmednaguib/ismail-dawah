// app/[lang]/prayer-guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string };

type PrayerStep = {
  num: number;
  title: Localized;
  desc: Localized;
  icon: string;
  details: Localized[];
  gradient: string;
};

type Prayer = {
  name: Localized;
  rakat: number;
  sunnah: Localized;
  icon: string;
  time: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  introTitle: string;
  introDesc: string;
  fivePrayersTitle: string;
  fivePrayersSubtitle: string;
  stepsTitle: string;
  stepsSubtitle: string;
  detailsLabel: string;
  rakatCount: string;
  sunnahLabel: string;
  conditionsTitle: string;
  beforePrayer: string;
  nullifiers: string;
  stepsCount: string;
  prayersCount: string;
  conditionsCount: string;
  nullifiersCount: string;
  verse: string;
  verseSource: string;
  hadith: string;
  hadithSource: string;
  relatedTitle: string;
  prayerTimesPage: string;
  prayerTimesPageDesc: string;
  qiblaPage: string;
  qiblaPageDesc: string;
  quranPage: string;
  quranPageDesc: string;
  adhkarPage: string;
  adhkarPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  // شروط الصلاة
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
  c6: string;
  c7: string;
  // مبطلات
  n1: string;
  n2: string;
  n3: string;
  n4: string;
  n5: string;
  n6: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "دليل الصلاة",
    subtitle: "تعلم الصلاة خطوة بخطوة كما كان يصلي النبي ﷺ",
    home: "الرئيسية",
    description:
      "دليل عملي شامل لتعلم الصلاة الصحيحة، يتضمن خطوات الصلاة، الصلوات الخمس، الشروط، والمبطلات، مع الأدعية والأذكار المأثورة.",
    introTitle: "الصلاة عماد الدين",
    introDesc:
      "الصلاة هي الركن الثاني من أركان الإسلام، وأول ما يُحاسب عليه العبد يوم القيامة. هذا الدليل يأخذك خطوة بخطوة لتتعلم الصلاة كما كان يصلي النبي ﷺ.",
    fivePrayersTitle: "الصلوات الخمس",
    fivePrayersSubtitle: "مواقيت وعدد ركعات كل صلاة",
    stepsTitle: "خطوات الصلاة",
    stepsSubtitle: "8 خطوات لأداء الصلاة صحيحة",
    detailsLabel: "التفاصيل",
    rakatCount: "عدد الركعات",
    sunnahLabel: "السنن الرواتب",
    conditionsTitle: "شروط صحة الصلاة",
    beforePrayer: "قبل الصلاة",
    nullifiers: "مبطلات الصلاة",
    stepsCount: "خطوات",
    prayersCount: "صلوات",
    conditionsCount: "شروط",
    nullifiersCount: "مبطلات",
    verse: "﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾",
    verseSource: "سورة النساء — الآية 103",
    hadith: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    hadithSource: "رواه البخاري",
    relatedTitle: "صفحات ذات صلة",
    prayerTimesPage: "مواقيت الصلاة",
    prayerTimesPageDesc: "أوقات الصلاة حسب موقعك.",
    qiblaPage: "اتجاه القبلة",
    qiblaPageDesc: "بوصلة القبلة الدقيقة.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع لكتاب الله.",
    adhkarPage: "الأذكار",
    adhkarPageDesc: "أذكار الصلاة وبعد السلام.",
    noteTitle: "تنبيهات مهمة",
    note1: "هذا الدليل مبسط للمبتدئين، ويُنصح بمراجعة كتب الفقه المعتمدة للتفاصيل الدقيقة.",
    note2: "الوضوء شرط لصحة الصلاة، فتعلم أحكامه قبل تعلم الصلاة.",
    note3: "الأفضل التعلم بالتطبيق العملي مع إمام ثقة أو مشاهدة مقاطع تعليمية صحيحة.",
    c1: "الإسلام والعقل والبلوغ",
    c2: "دخول الوقت",
    c3: "الطهارة من الحدث",
    c4: "طهارة الثوب والبدن والمكان",
    c5: "ستر العورة",
    c6: "استقبال القبلة",
    c7: "النية",
    n1: "الكلام العمد",
    n2: "الضحك",
    n3: "الأكل والشرب",
    n4: "كثرة الحركة لغير ضرورة",
    n5: "الالتفات بلا حاجة",
    n6: "انتقاض الطهارة",
  },
  en: {
    title: "Prayer Guide",
    subtitle: "Learn prayer step by step as the Prophet ﷺ prayed",
    home: "Home",
    description:
      "A comprehensive practical guide to learning correct prayer, including prayer steps, five prayers, conditions, and nullifiers, with authentic supplications and remembrances.",
    introTitle: "Prayer is the Pillar of Religion",
    introDesc:
      "Prayer is the second pillar of Islam and the first deed to be accounted for on the Day of Resurrection. This guide takes you step by step to learn prayer as the Prophet ﷺ prayed.",
    fivePrayersTitle: "The Five Prayers",
    fivePrayersSubtitle: "Timings and number of rak'ahs for each prayer",
    stepsTitle: "Prayer Steps",
    stepsSubtitle: "8 steps to perform prayer correctly",
    detailsLabel: "Details",
    rakatCount: "Rak'ahs",
    sunnahLabel: "Regular Sunnah",
    conditionsTitle: "Conditions of Valid Prayer",
    beforePrayer: "Before Prayer",
    nullifiers: "Prayer Nullifiers",
    stepsCount: "Steps",
    prayersCount: "Prayers",
    conditionsCount: "Conditions",
    nullifiersCount: "Nullifiers",
    verse: "\"Indeed, prayer has been decreed upon the believers a decree of specified times.\"",
    verseSource: "Surah An-Nisa — Verse 103",
    hadith: "Pray as you have seen me praying.",
    hadithSource: "Narrated by Al-Bukhari",
    relatedTitle: "Related Pages",
    prayerTimesPage: "Prayer Times",
    prayerTimesPageDesc: "Prayer times based on your location.",
    qiblaPage: "Qibla Direction",
    qiblaPageDesc: "Accurate Qibla compass.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to Allah's Book.",
    adhkarPage: "Adhkar",
    adhkarPageDesc: "Prayer adhkar and post-salam.",
    noteTitle: "Important Notices",
    note1: "This guide is simplified for beginners. Consult authentic fiqh books for detailed rulings.",
    note2: "Wudu is a condition for valid prayer, so learn its rulings before learning prayer.",
    note3: "It's best to learn through practical application with a trusted imam or by watching authentic educational videos.",
    c1: "Islam, sanity, and puberty",
    c2: "Entry of prayer time",
    c3: "Purification from ritual impurity",
    c4: "Purity of clothing, body, and place",
    c5: "Covering the awrah",
    c6: "Facing the Qiblah",
    c7: "Intention",
    n1: "Intentional speech",
    n2: "Laughing",
    n3: "Eating and drinking",
    n4: "Excessive movement without necessity",
    n5: "Turning around without need",
    n6: "Breaking wudu",
  },
};

// ============================================================
// خطوات الصلاة
// ============================================================

const STEPS: PrayerStep[] = [
  {
    num: 1,
    icon: "💧",
    gradient: "from-blue-500 to-blue-700",
    title: { ar: "النية والطهارة", en: "Intention and Purification" },
    desc: {
      ar: "انوِ الصلاة في قلبك، وتأكد من طهارتك (الوضوء) وطهارة ثوبك ومكانك.",
      en: "Make the intention in your heart, and ensure your purification (wudu) and the purity of your clothes and place.",
    },
    details: [
      { ar: "النية محلها القلب، ولا يُشترط التلفظ بها.", en: "Intention is in the heart; verbalizing it is not required." },
      { ar: "الوضوء شرط لصحة الصلاة.", en: "Wudu is a condition for valid prayer." },
      { ar: "يجب أن يكون الثوب والبدن والمكان طاهراً.", en: "Clothing, body, and place must be pure." },
      { ar: "استقبال القبلة شرط أساسي.", en: "Facing the Qiblah is a fundamental condition." },
    ],
  },
  {
    num: 2,
    icon: "🤲",
    gradient: "from-emerald-500 to-emerald-700",
    title: { ar: "تكبيرة الإحرام", en: "Opening Takbir" },
    desc: {
      ar: "قف مستقبلاً القبلة، وارفع يديك حذو منكبيك، وكبّر قائلاً: الله أكبر.",
      en: "Stand facing the Qiblah, raise your hands to your shoulders, and say: Allahu Akbar.",
    },
    details: [
      { ar: "ارفع يديك حذو منكبيك أو حذو أذنيك.", en: "Raise your hands to your shoulders or ears." },
      { ar: "قل: الله أكبر.", en: "Say: Allahu Akbar." },
      { ar: "انظر إلى موضع سجودك.", en: "Look at the place of your prostration." },
      { ar: "ضع يدك اليمنى على اليسرى فوق صدرك.", en: "Place your right hand over your left on your chest." },
    ],
  },
  {
    num: 3,
    icon: "📖",
    gradient: "from-purple-500 to-purple-700",
    title: { ar: "دعاء الاستفتاح والفاتحة", en: "Opening Du'a and Al-Fatihah" },
    desc: {
      ar: "اقرأ دعاء الاستفتاح، ثم استعذ بالله، ثم اقرأ الفاتحة.",
      en: "Recite the opening supplication, seek refuge with Allah, then recite Al-Fatihah.",
    },
    details: [
      { ar: "دعاء الاستفتاح: سبحانك اللهم وبحمدك...", en: "Opening du'a: Subhanaka Allahumma wa bihamdik..." },
      { ar: "قل: أعوذ بالله من الشيطان الرجيم.", en: "Say: I seek refuge with Allah from the expelled Satan." },
      { ar: "اقرأ الفاتحة كاملة.", en: "Recite Al-Fatihah completely." },
      { ar: "قل: آمين بعد الفاتحة.", en: "Say: Amin after Al-Fatihah." },
    ],
  },
  {
    num: 4,
    icon: "🙇",
    gradient: "from-amber-500 to-amber-700",
    title: { ar: "الركوع", en: "Ruku (Bowing)" },
    desc: {
      ar: "كبّر وانحنِ حتى تطمئن راكعاً، وسبّح ثلاثاً: سبحان ربي العظيم.",
      en: "Say takbir and bow until at ease, glorifying three times: Subhana Rabbi al-Azeem.",
    },
    details: [
      { ar: "كبّر وأنت نازل للركوع.", en: "Say takbir while descending into ruku." },
      { ar: "ضع يديك على ركبتيك.", en: "Place your hands on your knees." },
      { ar: "اجعل ظهرك مستوياً.", en: "Keep your back straight." },
      { ar: "قل: سبحان ربي العظيم (3 مرات).", en: "Say: Subhana Rabbi al-Azeem (3 times)." },
    ],
  },
  {
    num: 5,
    icon: "🧍",
    gradient: "from-rose-500 to-rose-700",
    title: { ar: "الرفع من الركوع", en: "Rising from Ruku" },
    desc: {
      ar: "ارفع من الركوع قائلاً: سمع الله لمن حمده، ثم: ربنا ولك الحمد.",
      en: "Rise from ruku saying: Sami'a Allahu liman hamidah, then: Rabbana wa lakal-hamd.",
    },
    details: [
      { ar: "قل وأنت رافع: سمع الله لمن حمده.", en: "Say while rising: Sami'a Allahu liman hamidah." },
      { ar: "قف معتدلاً تماماً.", en: "Stand completely upright." },
      { ar: "قل: ربنا ولك الحمد حمداً كثيراً طيباً مباركاً فيه.", en: "Say: Rabbana wa lakal-hamd hamdan katheeran tayyiban mubarakan feeh." },
      { ar: "أطل القيام قليلاً.", en: "Prolong the standing slightly." },
    ],
  },
  {
    num: 6,
    icon: "🤲",
    gradient: "from-indigo-500 to-indigo-700",
    title: { ar: "السجود", en: "Sujud (Prostration)" },
    desc: {
      ar: "اسجد على سبعة أعضاء، وسبّح: سبحان ربي الأعلى ثلاثاً.",
      en: "Prostrate on seven body parts, glorifying: Subhana Rabbi al-A'la three times.",
    },
    details: [
      { ar: "اسجد على 7 أعضاء: الجبهة مع الأنف، الكفين، الركبتين، أطراف القدمين.", en: "Prostrate on 7 parts: forehead with nose, palms, knees, toes." },
      { ar: "قل: سبحان ربي الأعلى (3 مرات).", en: "Say: Subhana Rabbi al-A'la (3 times)." },
      { ar: "ادعُ الله في السجود بما شئت.", en: "Supplicate to Allah in sujud as you wish." },
      { ar: "السجود أقرب ما يكون العبد من ربه.", en: "Sujud is when the servant is closest to his Lord." },
    ],
  },
  {
    num: 7,
    icon: "🧎",
    gradient: "from-teal-500 to-teal-700",
    title: { ar: "الجلسة بين السجدتين", en: "Sitting Between Two Prostrations" },
    desc: {
      ar: "ارفع من السجود واجلس مفترشاً، وقل: رب اغفر لي.",
      en: "Rise from sujud and sit in ifitirash position, saying: Rabbi ighfir li.",
    },
    details: [
      { ar: "اجلس مفترشاً رجلك اليسرى وانصب اليمنى.", en: "Sit with your left foot laid flat and right foot upright." },
      { ar: "قل: رب اغفر لي، رب اغفر لي.", en: "Say: Rabbi ighfir li, Rabbi ighfir li." },
      { ar: "ضع يديك على فخذيك.", en: "Place your hands on your thighs." },
      { ar: "أطل الجلسة قليلاً.", en: "Prolong the sitting slightly." },
    ],
  },
  {
    num: 8,
    icon: "☮️",
    gradient: "from-pink-500 to-pink-700",
    title: { ar: "التشهد والتسليم", en: "Tashahhud and Taslim" },
    desc: {
      ar: "في آخر الصلاة، اقرأ التشهد والصلاة الإبراهيمية، ثم سلّم يميناً وشمالاً.",
      en: "At the end of prayer, recite tashahhud and Abrahamic prayer, then give salam right and left.",
    },
    details: [
      { ar: "اقرأ التشهد: التحيات لله...", en: "Recite tashahhud: At-tahiyyatu lillah..." },
      { ar: "اقرأ الصلاة الإبراهيمية: اللهم صل على محمد...", en: "Recite salawat: Allahumma salli 'ala Muhammad..." },
      { ar: "ادعُ الله بما شئت قبل التسليم.", en: "Supplicate to Allah as you wish before taslim." },
      { ar: "سلّم: السلام عليكم ورحمة الله (يميناً ثم يساراً).", en: "Give salam: As-salamu alaykum wa rahmatullah (right then left)." },
    ],
  },
];

// ============================================================
// الصلوات الخمس
// ============================================================

const PRAYERS: Prayer[] = [
  {
    name: { ar: "الفجر", en: "Fajr" },
    rakat: 2,
    sunnah: { ar: "ركعتان قبلها", en: "2 rak'ahs before" },
    icon: "🌅",
    time: { ar: "من طلوع الفجر إلى شروق الشمس", en: "From dawn until sunrise" },
  },
  {
    name: { ar: "الظهر", en: "Dhuhr" },
    rakat: 4,
    sunnah: { ar: "4 قبلها + 2 بعدها", en: "4 before + 2 after" },
    icon: "☀️",
    time: { ar: "من زوال الشمس إلى وقت العصر", en: "From sun's zenith until Asr time" },
  },
  {
    name: { ar: "العصر", en: "Asr" },
    rakat: 4,
    sunnah: { ar: "لا سنة راتبة", en: "No regular sunnah" },
    icon: "🌤️",
    time: { ar: "من دخول وقته إلى اصفرار الشمس", en: "From its time until sun yellows" },
  },
  {
    name: { ar: "المغرب", en: "Maghrib" },
    rakat: 3,
    sunnah: { ar: "ركعتان بعدها", en: "2 rak'ahs after" },
    icon: "🌇",
    time: { ar: "من غروب الشمس إلى مغيب الشفق", en: "From sunset until twilight disappears" },
  },
  {
    name: { ar: "العشاء", en: "Isha" },
    rakat: 4,
    sunnah: { ar: "ركعتان بعدها + وتر", en: "2 rak'ahs after + witr" },
    icon: "🌙",
    time: { ar: "من مغيب الشفق إلى نصف الليل", en: "From twilight disappearance until midnight" },
  },
];

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
      canonical: `/${l}/prayer-guide`,
      languages: {
        ar: "/ar/prayer-guide",
        en: "/en/prayer-guide",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/prayer-guide`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
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

export default async function PrayerGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  const conditions = [ui.c1, ui.c2, ui.c3, ui.c4, ui.c5, ui.c6, ui.c7];
  const nullifiers = [ui.n1, ui.n2, ui.n3, ui.n4, ui.n5, ui.n6];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: L,
        url: `/${L}/prayer-guide`,
        articleSection: isRTL ? "العبادات" : "Worship",
        keywords: isRTL
          ? "الصلاة, تعلم الصلاة, خطوات الصلاة, كيفية الصلاة"
          : "prayer, learn prayer, prayer steps, how to pray",
      },
      {
        "@type": "HowTo",
        name: ui.stepsTitle,
        description: ui.stepsSubtitle,
        inLanguage: L,
        step: STEPS.map((step) => ({
          "@type": "HowToStep",
          position: step.num,
          name: step.title[L],
          text: step.desc[L],
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: isRTL ? "ما شروط صحة الصلاة؟" : "What are the conditions for valid prayer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: conditions.join("، "),
            },
          },
          {
            "@type": "Question",
            name: isRTL ? "ما مبطلات الصلاة؟" : "What nullifies prayer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: nullifiers.join("، "),
            },
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
        <div className="card relative mb-8 overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-teal-800 dark:from-teal-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0d9488, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.84L18.16 11H17v8H7v-8H5.84L12 4.84z" />
                  <circle cx="12" cy="9" r="2" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">🕌 {ui.introTitle}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>

            {/* حديث شريف */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                «{ui.hadith}»
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                📜 {ui.hadithSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📋" label={ui.stepsCount} value={STEPS.length} color="primary" />
          <StatCard icon="🕐" label={ui.prayersCount} value={PRAYERS.length} color="gold" />
          <StatCard icon="✅" label={ui.conditionsCount} value={conditions.length} color="primary" />
          <StatCard icon="⚠️" label={ui.nullifiersCount} value={nullifiers.length} color="gold" />
        </div>

        {/* ===== الصلوات الخمس ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🕐 {ui.fivePrayersTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.fivePrayersSubtitle}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PRAYERS.map((p, i) => (
              <div
                key={i}
                className="card card-interactive group relative overflow-hidden border-t-4 border-gold-500 p-6"
              >
                <div className="gradient-gold absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-3xl dark:bg-primary-900/40">
                    {p.icon}
                  </span>
                  <div>
                    <h3
                      className="text-xl font-black text-primary-700 dark:text-gold-300"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {p.name[L]}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.time[L]}
                    </p>
                  </div>
                </div>

                <div className="mb-3 rounded-xl bg-slate-50 p-3 dark:bg-night-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {ui.rakatCount}:
                    </span>
                    <span
                      className="text-2xl font-black text-gold-600 dark:text-gold-400"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {p.rakat}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-primary-700 dark:text-primary-300">
                    {ui.sunnahLabel}:
                  </strong>{" "}
                  {p.sunnah[L]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== خطوات الصلاة ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              📋 {ui.stepsTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.stepsSubtitle}
            </p>
          </div>

          <div className="space-y-5">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.gradient} p-6 text-white shadow-lg md:p-8`}
              >
                {/* زخرفة */}
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
                      {s.icon}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-sm font-black text-gray-900">
                          {s.num}
                        </span>
                        <h3
                          className="text-xl font-black"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {s.title[L]}
                        </h3>
                      </div>

                      <p className="text-white/90">
                        {s.desc[L]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <h4 className="mb-2 text-sm font-black text-gold-300">
                      📝 {ui.detailsLabel}:
                    </h4>
                    <ul className="space-y-2">
                      {s.details.map((d, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-white/90"
                        >
                          <span className="mt-1 text-gold-300">✓</span>
                          <span>{d[L]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== شروط ومبطلات الصلاة ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              ✅ {ui.conditionsTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* الشروط */}
            <div className="card overflow-hidden border-e-4 border-emerald-500 p-6 rtl:border-e-0 rtl:border-s-4">
              <h3
                className="mb-4 text-xl font-black text-primary-700 dark:text-gold-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                🕋 {ui.beforePrayer}
              </h3>

              <ul className="space-y-2">
                {conditions.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      ✓
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* المبطلات */}
            <div className="card overflow-hidden border-e-4 border-red-500 p-6 rtl:border-e-0 rtl:border-s-4">
              <h3
                className="mb-4 text-xl font-black text-primary-700 dark:text-gold-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                ⚠️ {ui.nullifiers}
              </h3>

              <ul className="space-y-2">
                {nullifiers.map((n, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      ✗
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {n}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ===== آية الصلاة ===== */}
        <div className="card relative mb-10 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 text-center md:p-12 dark:border-gold-700 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <p
            className="mb-3 text-2xl font-black text-primary-700 md:text-4xl dark:text-gold-300"
            style={{ fontFamily: "var(--font-quran)" }}
          >
            {ui.verse}
          </p>
          <p className="text-sm text-gold-700 dark:text-gold-400">
            {ui.verseSource}
          </p>
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
            <Link href={`/${L}/prayer-times`} className="card card-interactive group flex items-center gap-3 p-5">
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

            <Link href={`/${L}/qibla`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🧭</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.qiblaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.qiblaPageDesc}
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

            <Link href={`/${L}/adhkar`} className="card card-interactive group flex items-center gap-3 p-5">
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
          </div>
        </div>

        {/* ===== تنبيهات مهمة ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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