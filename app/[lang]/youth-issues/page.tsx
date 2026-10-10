// app/[lang]/youth-issues/page.tsx
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

type YouthIssue = {
  id: string;
  icon: string;
  title: Localized;
  problem: Localized;
  solution: Localized;
  ayah: string; // عربي فقط (نص قرآني)
  ayahSource: Localized;
  gradient: string;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  introTitle: string;
  introDesc: string;
  issuesTitle: string;
  issuesSubtitle: string;
  problem: string;
  solution: string;
  quranicEvidence: string;
  messageTitle: string;
  messageText: string;
  noteTitle: string;
  note1: string;
  note2: string;
  relatedTitle: string;
  articlesPage: string;
  articlesPageDesc: string;
  doubtsPage: string;
  doubtsPageDesc: string;
  atheismPage: string;
  atheismPageDesc: string;
  contactPage: string;
  contactPageDesc: string;
  issuesCount: string;
  solutionsCount: string;
  versesCount: string;
  freeAlways: string;
  verse: string;
  verseSource: string;
  hadith: string;
  hadithSource: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "قضايا الشباب المعاصرة",
    subtitle: "مشاكل الشباب اليوم وحلولها من منظور إسلامي",
    home: "الرئيسية",
    description:
      "صفحة متخصصة في قضايا الشباب المعاصرة: الحب قبل الزواج، إدمان السوشيال ميديا، الاكتئاب، أصدقاء السوء، وغيرها، مع حلول عملية من منظور إسلامي.",
    introTitle: "لماذا قضايا الشباب؟",
    introDesc:
      "الشباب هم عماد الأمة ومستقبلها، ويواجهون اليوم تحديات فريدة لم تكن موجودة في السابق. هذه الصفحة تقدم رؤية إسلامية متوازنة لأهم هذه التحديات مع حلول عملية من القرآن والسنة.",
    issuesTitle: "القضايا والحلول",
    issuesSubtitle: "اختر القضية التي تهمك واقرأ الحل الشرعي",
    problem: "المشكلة",
    solution: "الحل",
    quranicEvidence: "الدليل من القرآن",
    messageTitle: "رسالة للشاب المسلم",
    messageText:
      "أنت قوة الأمة ومستقبلها. لا تستهن بنفسك ولا بقدراتك. اجعل شبابك فيما ينفعك في دينك ودنياك، وكن سبباً في صلاح مجتمعك. تذكر أن النبي ﷺ نصُر بالشباب، وأن كثيراً من الصحابة والعلماء بلغوا المراتب العليا وهم في ريعان الشباب.",
    noteTitle: "تنبيهات مهمة",
    note1:
      "الاكتئاب والقلق أمراض حقيقية تحتاج أحياناً إلى علاج طبي ونفسي، ولا عيب في طلب المساعدة المتخصصة.",
    note2:
      "الحلول المقدمة عامة، وقد تختلف التفاصيل حسب حالة كل شخص، فالأفضل استشارة عالم أو متخصص ثقة.",
    relatedTitle: "صفحات ذات صلة",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    doubtsPage: "الشبهات والردود",
    doubtsPageDesc: "إجابات عن الشبهات الشائعة.",
    atheismPage: "الرد على الإلحاد",
    atheismPageDesc: "الرد على الشبهات الإلحادية.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار والدعم.",
    issuesCount: "قضية",
    solutionsCount: "حل عملي",
    versesCount: "آية",
    freeAlways: "مجاني",
    verse: "﴿ إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى ﴾",
    verseSource: "سورة الكهف — الآية 13",
    hadith: "نُصِرْتُ بِالشَّبَابِ",
    hadithSource: "أثر نبوي شريف",
  },
  en: {
    title: "Contemporary Youth Issues",
    subtitle: "Today's youth problems and their Islamic solutions",
    home: "Home",
    description:
      "A specialized page on contemporary youth issues: pre-marital love, social media addiction, depression, bad friends, and more, with practical solutions from an Islamic perspective.",
    introTitle: "Why Youth Issues?",
    introDesc:
      "Youth are the backbone and future of the Ummah, facing today unique challenges that did not exist before. This page offers a balanced Islamic vision of the most important challenges with practical solutions from the Quran and Sunnah.",
    issuesTitle: "Issues and Solutions",
    issuesSubtitle: "Choose the issue that concerns you and read the Islamic solution",
    problem: "The Problem",
    solution: "The Solution",
    quranicEvidence: "Quranic Evidence",
    messageTitle: "Message to the Muslim Youth",
    messageText:
      "You are the strength and future of the Ummah. Do not underestimate yourself or your capabilities. Make your youth benefit you in your religion and worldly life, and be a cause for your society's righteousness. Remember that the Prophet ﷺ was supported by youth, and many companions and scholars reached high ranks in their youth.",
    noteTitle: "Important Notices",
    note1:
      "Depression and anxiety are real illnesses that sometimes need medical and psychological treatment. There is no shame in seeking specialized help.",
    note2:
      "The solutions provided are general, and details may vary according to each person's situation. It is best to consult a trusted scholar or specialist.",
    relatedTitle: "Related Pages",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    doubtsPage: "Doubts and Responses",
    doubtsPageDesc: "Answers to common doubts.",
    atheismPage: "Responding to Atheism",
    atheismPageDesc: "Answering atheist doubts.",
    contactPage: "Contact Us",
    contactPageDesc: "For inquiries and support.",
    issuesCount: "Issues",
    solutionsCount: "Solutions",
    versesCount: "Verses",
    freeAlways: "Free",
    verse: "\"Indeed, they were youths who believed in their Lord, and We increased them in guidance.\"",
    verseSource: "Surah Al-Kahf — Verse 13",
    hadith: "I was supported by the youth.",
    hadithSource: "Prophetic tradition",
  },
};

// ============================================================
// القضايا
// ============================================================

const ISSUES: YouthIssue[] = [
  {
    id: "pre-marital-love",
    icon: "💔",
    title: { ar: "الحب قبل الزواج", en: "Pre-Marital Love" },
    problem: {
      ar: "علاقات عاطفية خارج إطار الزواج تؤدي للذنوب والمشاكل النفسية والاجتماعية.",
      en: "Emotional relationships outside marriage lead to sins and psychological and social problems.",
    },
    solution: {
      ar: "الحب الحقيقي هو ما يُبنى على الحلال. الزواج هو الطريق الشرعي، ومن استعفف أعفّه الله. اشغل نفسك بالطاعة والنافع.",
      en: "True love is built on what is lawful. Marriage is the legitimate path, and whoever seeks chastity, Allah will keep him chaste. Keep yourself busy with obedience and beneficial things.",
    },
    ayah: "وَلْيَسْتَعْفِفِ الَّذِينَ لَا يَجِدُونَ نِكَاحًا حَتَّىٰ يُغْنِيَهُمُ اللَّهُ مِن فَضْلِهِ",
    ayahSource: { ar: "سورة النور — الآية 33", en: "Surah An-Nur — Verse 33" },
    gradient: "from-rose-500 to-rose-700",
  },
  {
    id: "social-media-addiction",
    icon: "📱",
    title: { ar: "إدمان السوشيال ميديا", en: "Social Media Addiction" },
    problem: {
      ar: "ساعات طويلة ضائعة، مقارنة بالآخرين، اكتئاب، وتشوه الصورة الذاتية.",
      en: "Long wasted hours, comparison with others, depression, and distorted self-image.",
    },
    solution: {
      ar: "حدد وقتاً معيناً للاستخدام. استخدم الوقت في ما ينفع: حفظ قرآن، قراءة، رياضة، تعلم مهارة. تذكر أن ما تراه على السوشيال ليس الحقيقة الكاملة.",
      en: "Set specific time limits. Use time beneficially: Quran memorization, reading, sports, learning a skill. Remember that what you see on social media is not the full reality.",
    },
    ayah: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    ayahSource: { ar: "سورة النجم — الآية 39", en: "Surah An-Najm — Verse 39" },
    gradient: "from-blue-500 to-blue-700",
  },
  {
    id: "excessive-gaming",
    icon: "🎮",
    title: { ar: "ألعاب الفيديو المفرطة", en: "Excessive Video Gaming" },
    problem: {
      ar: "تضييع الوقت، إهمال الدراسة، عزلة اجتماعية، وتأثير على الصحة.",
      en: "Wasting time, neglecting studies, social isolation, and health impacts.",
    },
    solution: {
      ar: "اللعب ليس حراماً لكن الإفراط فيه ضار. ضع حداً أقصى ساعة يومياً، واختر ألعاباً نافعة لا تحتوي على محرمات. وازن بين الترفيه والإنتاجية.",
      en: "Gaming is not haram but excess is harmful. Set a maximum of one hour daily, choose beneficial games without forbidden content. Balance entertainment and productivity.",
    },
    ayah: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    ayahSource: { ar: "سورة النساء — الآية 103", en: "Surah An-Nisa — Verse 103" },
    gradient: "from-purple-500 to-purple-700",
  },
  {
    id: "depression-anxiety",
    icon: "💭",
    title: { ar: "الاكتئاب والقلق", en: "Depression and Anxiety" },
    problem: {
      ar: "شعور بالحزن المستمر، فقدان الشغف، اضطرابات النوم، وصعوبة التركيز.",
      en: "Persistent sadness, loss of passion, sleep disturbances, and difficulty concentrating.",
    },
    solution: {
      ar: "الاكتئاب مرض يحتاج علاج. ادعُ الله وتوكل عليه، واطلب المساعدة من متخصص. الذكر والصلاة والقرب من الله علاج روحاني، والعلاج الطبي مكمل لا منافٍ.",
      en: "Depression is an illness that needs treatment. Supplicate to Allah and rely on Him, and seek help from a specialist. Dhikr, prayer, and closeness to Allah are spiritual healing, and medical treatment is complementary, not contradictory.",
    },
    ayah: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    ayahSource: { ar: "سورة الرعد — الآية 28", en: "Surah Ar-Ra'd — Verse 28" },
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    id: "loss-of-purpose",
    icon: "🎓",
    title: { ar: "فقدان الهدف في الحياة", en: "Loss of Purpose in Life" },
    problem: {
      ar: "لا أعرف لماذا أعيش، لا هدف واضح، شعور بالضياع واللامعنى.",
      en: "I don't know why I live, no clear goal, feeling lost and meaningless.",
    },
    solution: {
      ar: "هدفك الأكبر: عبادة الله وعمارة الأرض. اجعل لك أهدافاً قصيرة وواضحة: حفظ، تعلم، خدمة. ابحث عن قدوة صالحة، وتذكر أن الحياة اختبار والآخرة هي دار القرار.",
      en: "Your greatest goal: worship Allah and build the earth. Set short and clear goals: memorization, learning, service. Find a good role model, and remember that life is a test and the hereafter is the eternal home.",
    },
    ayah: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
    ayahSource: { ar: "سورة الذاريات — الآية 56", en: "Surah Adh-Dhariyat — Verse 56" },
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    id: "bad-friends",
    icon: "👥",
    title: { ar: "أصدقاء السوء", en: "Bad Friends" },
    problem: {
      ar: "أصدقاء يدفعونك للذنوب والتفاهة، ويسحبونك بعيداً عن الطاعة.",
      en: "Friends who push you to sins and triviality, pulling you away from obedience.",
    },
    solution: {
      ar: "اختر أصدقاءك بعناية. الصاحب الصالح يرفعك، وصاحب السوء يضرك. قال ﷺ: «المرء على دين خليله». ابحث عن رفقة صالحة في المسجد والحلقات والأنشطة النافعة.",
      en: "Choose your friends carefully. A righteous companion elevates you, while a bad one harms you. The Prophet ﷺ said: 'A person follows the religion of his friend.' Seek righteous companionship in mosques, circles, and beneficial activities.",
    },
    ayah: "الْأَخِلَّاءُ يَوْمَئِذٍ بَعْضُهُمْ لِبَعْضٍ عَدُوٌّ إِلَّا الْمُتَّقِينَ",
    ayahSource: { ar: "سورة الزخرف — الآية 67", en: "Surah Az-Zukhruf — Verse 67" },
    gradient: "from-amber-500 to-amber-700",
  },
  {
    id: "financial-pressure",
    icon: "💰",
    title: { ar: "الضغط المادي والمقارنة", en: "Financial Pressure and Comparison" },
    problem: {
      ar: "أرى أصدقائي في رفاهية وأنا في ضيق، أشعر بالنقص والإحباط.",
      en: "I see my friends in luxury while I am in hardship, feeling inadequate and frustrated.",
    },
    solution: {
      ar: "الرزق مقسوم، والمقارنة تسرق السعادة. احمد الله على ما عندك، وانظر لمن هو أقل منك في الدنيا. الرضا كنز لا يفنى، والسعادة في القلب لا في الجيب.",
      en: "Provision is divided, and comparison steals happiness. Thank Allah for what you have, and look at those with less in this world. Contentment is an inexhaustible treasure, and happiness is in the heart, not the pocket.",
    },
    ayah: "وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ",
    ayahSource: { ar: "سورة النساء — الآية 32", en: "Surah An-Nisa — Verse 32" },
    gradient: "from-orange-500 to-orange-700",
  },
  {
    id: "religious-disconnection",
    icon: "🎭",
    title: { ar: "الانفصال عن الدين", en: "Disconnection from Religion" },
    problem: {
      ar: "أشعر أن الدين لا يناسب عصري، أو أن هناك تعارضاً بين الدين والعلم.",
      en: "I feel religion doesn't suit my era, or that there's a conflict between religion and science.",
    },
    solution: {
      ar: "الدين صالح لكل زمان. ابحث عن علماء معاصرين يفهمون واقعك. الشبهات تُرد بالعلم لا بالهروب. ابدأ باليقينيات ولا تنشغل بالخلافيات، واسأل أهل العلم فيما أشكل عليك.",
      en: "Religion is valid for all times. Search for contemporary scholars who understand your reality. Doubts are answered with knowledge, not escape. Start with certainties, don't get lost in disagreements, and ask scholars about what confuses you.",
    },
    ayah: "وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ وَهُوَ مُحْسِنٌ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ",
    ayahSource: { ar: "سورة لقمان — الآية 22", en: "Surah Luqman — Verse 22" },
    gradient: "from-teal-500 to-teal-700",
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
      canonical: `/${l}/youth-issues`,
      languages: {
        ar: "/ar/youth-issues",
        en: "/en/youth-issues",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/youth-issues`,
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

export default async function YouthIssuesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: L,
        url: `/${L}/youth-issues`,
        articleSection: isRTL ? "قضايا الشباب" : "Youth Issues",
        keywords: isRTL
          ? "الشباب, قضايا الشباب, الاكتئاب, السوشيال ميديا, الحب, الزواج"
          : "youth, youth issues, depression, social media, love, marriage",
      },
      {
        "@type": "FAQPage",
        mainEntity: ISSUES.map((issue) => ({
          "@type": "Question",
          name: issue.title[L],
          acceptedAnswer: {
            "@type": "Answer",
            text: `${ui.problem}: ${issue.problem[L]} — ${ui.solution}: ${issue.solution[L]}`,
          },
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
        <div className="card relative mb-8 overflow-hidden border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-violet-800 dark:from-violet-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🧑 {isRTL ? "قضايا معاصرة" : "Contemporary Issues"}
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

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="💡" label={ui.issuesCount} value={ISSUES.length} color="primary" />
          <StatCard icon="✅" label={ui.solutionsCount} value={ISSUES.length} color="gold" />
          <StatCard icon="📖" label={ui.versesCount} value={ISSUES.length} color="primary" />
          <StatCard icon="✨" label={ui.freeAlways} value="100%" color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🌟 {ui.introTitle}
            </h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>

        {/* ===== القضايا والحلول ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.issuesTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.issuesSubtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {ISSUES.map((issue) => (
              <article
                key={issue.id}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${issue.gradient} p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
              >
                {/* زخرفة خلفية */}
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  {/* العنوان */}
                  <div className="mb-5 text-center">
                    <span className="mb-3 inline-block text-5xl">{issue.icon}</span>
                    <h3
                      className="text-xl font-black"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {issue.title[L]}
                    </h3>
                  </div>

                  {/* المشكلة */}
                  <div className="mb-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <h4 className="mb-2 text-sm font-black text-white/90">
                      ⚠️ {ui.problem}
                    </h4>
                    <p className="text-sm leading-relaxed text-white/90">
                      {issue.problem[L]}
                    </p>
                  </div>

                  {/* الحل */}
                  <div className="mb-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <h4 className="mb-2 text-sm font-black text-white/90">
                      ✅ {ui.solution}
                    </h4>
                    <p className="text-sm leading-relaxed text-white/90">
                      {issue.solution[L]}
                    </p>
                  </div>

                  {/* الدليل القرآني */}
                  <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <p className="mb-1 text-[10px] font-black text-white/80">
                      📖 {ui.quranicEvidence}
                    </p>
                    <p
                      className="text-center text-base font-black"
                      style={{ fontFamily: "var(--font-quran)" }}
                      dir="rtl"
                    >
                      ﴿{issue.ayah}﴾
                    </p>
                    <p className="mt-1 text-center text-[10px] text-white/70">
                      {issue.ayahSource[L]}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ===== رسالة للشباب ===== */}
        <div className="card relative mb-10 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 text-center md:p-12 dark:border-gold-700 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <span className="mb-4 inline-block text-5xl">💬</span>

          <h2
            className="mb-4 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.messageTitle}
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.messageText}
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
              href={`/${L}/doubts`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ❓
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.doubtsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.doubtsPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/atheism-response`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🧠
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.atheismPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.atheismPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/contact`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
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