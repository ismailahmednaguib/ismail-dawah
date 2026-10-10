// app/[lang]/learn/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string };

type LearnStep = {
  id: string;
  order: number;
  title: Localized;
  desc: Localized;
  field: string;
  fieldIcon: string;
  fieldName: Localized;
};

type Tip = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
  color: string;
};

// ============================================================
// بيانات احتياطية (fallback في حال فشل getContent)
// ============================================================

const FALLBACK_STEPS: LearnStep[] = [
  {
    id: "aqeedah",
    order: 1,
    title: { ar: "التأسيس في العقيدة", en: "Foundation in Creed" },
    desc: {
      ar: "ابدأ بتعلم أصول الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر. العقيدة هي أساس الدين.",
      en: "Start by learning the fundamentals of faith in Allah, His angels, books, messengers, the Last Day, and divine decree. Creed is the foundation of religion.",
    },
    field: "aqeedah",
    fieldIcon: "🕌",
    fieldName: { ar: "العقيدة", en: "Creed" },
  },
  {
    id: "fiqh-basics",
    order: 2,
    title: { ar: "فقه العبادات", en: "Worship Jurisprudence" },
    desc: {
      ar: "تعلم أحكام الطهارة والصلاة والصيام والزكاة. هذه العبادات لا يستغني عنها المسلم في حياته اليومية.",
      en: "Learn rulings of purification, prayer, fasting, and zakat. These worships are essential for every Muslim's daily life.",
    },
    field: "fiqh",
    fieldIcon: "⚖️",
    fieldName: { ar: "الفقه", en: "Fiqh" },
  },
  {
    id: "quran",
    order: 3,
    title: { ar: "تلاوة القرآن وحفظه", en: "Quran Recitation and Memorization" },
    desc: {
      ar: "اجعل لك ورداً يومياً من القرآن، واحفظ ما تيسر مع التدبر والفهم. القرآن ربيع القلب ونور الصدر.",
      en: "Have a daily Quran portion, and memorize what is easy with reflection and understanding. The Quran is the heart's spring and chest's light.",
    },
    field: "quran-sciences",
    fieldIcon: "📚",
    fieldName: { ar: "علوم القرآن", en: "Quranic Sciences" },
  },
  {
    id: "hadith",
    order: 4,
    title: { ar: "دراسة السنة النبوية", en: "Studying Prophetic Sunnah" },
    desc: {
      ar: "اقرأ الأربعين النووية ورياض الصالحين، ثم انتقل إلى كتب الصحاح. السنة وحي ثانٍ يفسر القرآن.",
      en: "Read the Forty Hadith of Nawawi and Gardens of the Righteous, then move to the Sahih books. Sunnah is a second revelation that explains the Quran.",
    },
    field: "hadith",
    fieldIcon: "📜",
    fieldName: { ar: "الحديث", en: "Hadith" },
  },
  {
    id: "seerah",
    order: 5,
    title: { ar: "السيرة النبوية", en: "Prophetic Biography" },
    desc: {
      ar: "اقرأ السيرة النبوية لتفهم سياق التنزيل وتتأسى بالنبي ﷺ. السيرة مدرسة كاملة في التربية والقيادة.",
      en: "Read the Prophetic biography to understand the context of revelation and follow the Prophet ﷺ. Seerah is a complete school of education and leadership.",
    },
    field: "seerah",
    fieldIcon: "🌙",
    fieldName: { ar: "السيرة النبوية", en: "Prophetic Biography" },
  },
  {
    id: "tafsir",
    order: 6,
    title: { ar: "التفسير والتدبر", en: "Tafsir and Reflection" },
    desc: {
      ar: "اقرأ تفسير السعدي أو ابن كثير لفهم معاني القرآن. التدبر ثمرة التلاوة ومفتاح العمل.",
      en: "Read Tafsir as-Sa'di or Ibn Kathir to understand Quran meanings. Reflection is the fruit of recitation and key to action.",
    },
    field: "tafsir",
    fieldIcon: "📖",
    fieldName: { ar: "التفسير", en: "Tafsir" },
  },
  {
    id: "ethics",
    order: 7,
    title: { ar: "التزكية والأخلاق", en: "Self-Purification and Ethics" },
    desc: {
      ar: "طهّر قلبك من أمراضه، وتحلَّ بالأخلاق الإسلامية. العلم بلا تزكية حجة على صاحبه.",
      en: "Purify your heart from its diseases and adopt Islamic ethics. Knowledge without purification is a proof against its bearer.",
    },
    field: "ethics",
    fieldIcon: "💫",
    fieldName: { ar: "الأخلاق", en: "Ethics" },
  },
  {
    id: "specialization",
    order: 8,
    title: { ar: "التخصص والتعمق", en: "Specialization and Deepening" },
    desc: {
      ar: "بعد التأسيس، اختر مجالاً تتخصص فيه وتعمق: فقه، تفسير، حديث، دعوة، أو غير ذلك مما يناسب ميولك.",
      en: "After foundation, choose a field to specialize in: fiqh, tafsir, hadith, dawah, or what suits your inclination.",
    },
    field: "thought",
    fieldIcon: "💡",
    fieldName: { ar: "الفكر الإسلامي", en: "Islamic Thought" },
  },
];

const TIPS: Tip[] = [
  {
    id: "ikhlas",
    icon: "🎯",
    title: { ar: "الإخلاص", en: "Sincerity" },
    description: {
      ar: "اجعل طلبك للعلم لله وحده، لا للرياء ولا للسمعة. فالعلم عبادة، والعبادة لا تُقبل إلا بإخلاص.",
      en: "Make your seeking of knowledge for Allah alone, not for show or reputation. Knowledge is worship, and worship is only accepted with sincerity.",
    },
    color: "from-gold-500 to-gold-600",
  },
  {
    id: "tadarruj",
    icon: "⏳",
    title: { ar: "التدرج", en: "Gradual Progress" },
    description: {
      ar: "لا تستعجل، ابدأ بالأساسيات ثم تدرج. من أراد العلم جملةً فاتته جملة. الصبر مفتاح الفهم.",
      en: "Don't rush; start with basics and progress gradually. Whoever wants knowledge all at once will miss it all. Patience is the key to understanding.",
    },
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "taqyeed",
    icon: "📝",
    title: { ar: "التقييد والكتابة", en: "Writing and Recording" },
    description: {
      ar: "اكتب ما تتعلمه، فالعلم صيد والكتابة قيده. قيّد العلم بالحفظ والكتابة والمراجعة.",
      en: "Write what you learn. Knowledge is prey and writing is its rope. Bind knowledge through memorization, writing, and revision.",
    },
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "amal",
    icon: "🤲",
    title: { ar: "العمل بالعلم", en: "Acting Upon Knowledge" },
    description: {
      ar: "العلم بلا عمل كالشجرة بلا ثمر. اعمل بما تعلمت قبل أن تتعلم المزيد، فالعلم يُطلب للعمل.",
      en: "Knowledge without action is like a tree without fruit. Act on what you learned before learning more, for knowledge is sought for action.",
    },
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "suhbah",
    icon: "👥",
    title: { ar: "صحبة العالم", en: "Companionship of Scholars" },
    description: {
      ar: "الزم العلماء وطلاب العلم، فالعلم لا يُؤخذ من الكتب فقط بل من مجالسة أهله وأخذ الأدب منهم.",
      en: "Stay with scholars and students of knowledge. Knowledge isn't taken only from books but from sitting with its people and learning their manners.",
    },
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "muraajaah",
    icon: "🔄",
    title: { ar: "المراجعة المستمرة", en: "Continuous Revision" },
    description: {
      ar: "راجع ما حفظت باستمرار، فالعلم سريع الهروب. المراجعة تثبت المحفوظ وتحيي المعلومة.",
      en: "Review what you memorized regularly. Knowledge escapes quickly. Revision stabilizes what is memorized and revives information.",
    },
    color: "from-rose-500 to-rose-600",
  },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
    heroHadith: string;
    heroHadithSource: string;
    introTitle: string;
    introDesc: string;
    introQuote: string;
    introQuoteSource: string;
    stepsTitle: string;
    stepsSubtitle: string;
    step: string;
    field: string;
    tipsTitle: string;
    tipsSubtitle: string;
    closingVerse: string;
    closingVerseSource: string;
    stepsCount: string;
    tipsCount: string;
    fieldsCount: string;
    freeAccess: string;
    relatedTitle: string;
    quranPage: string;
    quranPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    fieldsPage: string;
    fieldsPageDesc: string;
    quranMemorization: string;
    quranMemorizationDesc: string;
    noteTitle: string;
    note1: string;
    note2: string;
    viewField: string;
  }
> = {
  ar: {
    title: "مسار التعلم",
    subtitle: "خطة مرتبة لطالب العلم من البداية إلى الاحتراف",
    home: "الرئيسية",
    description:
      "مسار تعلم مرتب لطالب العلم الشرعي، يأخذك من التأسيس في العقيدة والعبادات إلى التخصص والتعمق في العلوم الشرعية، مع نصائح عملية من تراث الأمة.",
    heroTitle: "مسار التعلم الشرعي",
    heroSubtitle: "خطة مرتبة لطالب العلم من البداية إلى الاحتراف",
    heroHadith: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    heroHadithSource: "رواه مسلم",
    introTitle: "كيف تبدأ رحلة العلم؟",
    introDesc:
      "طلب العلم فريضة على كل مسلم، لكنه يحتاج إلى منهج مرتب حتى لا يتيه الطالب في بحر العلوم. هذا المسار مصمم ليأخذك من البداية خطوة بخطوة، لتبني أساساً قوياً ثم تتعمق في التخصص.",
    introQuote: "تَعَلَّمُوا الْعِلْمَ وَتَعَلَّمُوا لِلْعِلْمِ السَّكِينَةَ وَالْوَقَارَ",
    introQuoteSource: "أثر عن عمر بن الخطاب رضي الله عنه",
    stepsTitle: "خطوات المسار",
    stepsSubtitle: "مراحل مرتبة من التأسيس إلى التخصص",
    step: "المرحلة",
    field: "المجال",
    tipsTitle: "نصائح لطالب العلم",
    tipsSubtitle: "وصايا من تراث الأمة لكل سالك طريق العلم",
    closingVerse: "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
    closingVerseSource: "سورة طه — الآية 114",
    stepsCount: "مراحل",
    tipsCount: "نصائح",
    fieldsCount: "مجالات",
    freeAccess: "مجاني",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع لكتاب الله.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    fieldsPage: "مجالات المنصة",
    fieldsPageDesc: "17 مجالاً شرعياً متنوعاً.",
    quranMemorization: "خطة حفظ القرآن",
    quranMemorizationDesc: "نظّم وردك اليومي.",
    noteTitle: "تنبيه مهم",
    note1: "هذا المسار استرشادي، وقد يختلف ترتيب المراحل حسب حاجة الطالب وخلفيته العلمية.",
    note2: "الأفضل مصاحبة عالم أو طالب علم متمكن ليرشدك ويصحح مسيرتك في كل مرحلة.",
    viewField: "استكشف المجال",
  },
  en: {
    title: "Learning Path",
    subtitle: "An organized plan for the student of knowledge from beginner to advanced",
    home: "Home",
    description:
      "An organized learning path for the student of Islamic knowledge, taking you from foundations in creed and worship to specialization in Islamic sciences, with practical advice from the Ummah's heritage.",
    heroTitle: "Islamic Learning Path",
    heroSubtitle: "An organized plan from beginner to advanced",
    heroHadith: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    heroHadithSource: "Narrated by Muslim",
    introTitle: "How to Begin the Journey of Knowledge?",
    introDesc:
      "Seeking knowledge is obligatory on every Muslim, but it requires an organized methodology so the student doesn't get lost in the ocean of sciences. This path is designed to take you step by step from the beginning, building a strong foundation before specializing.",
    introQuote: "Learn knowledge, and learn for knowledge tranquility and dignity.",
    introQuoteSource: "Attributed to Umar ibn al-Khattab (may Allah be pleased with him)",
    stepsTitle: "Path Steps",
    stepsSubtitle: "Ordered stages from foundation to specialization",
    step: "Stage",
    field: "Field",
    tipsTitle: "Tips for the Student of Knowledge",
    tipsSubtitle: "Advice from the Ummah's heritage for every seeker of knowledge",
    closingVerse: "\"And say: My Lord, increase me in knowledge.\"",
    closingVerseSource: "Surah Taha — Verse 114",
    stepsCount: "Stages",
    tipsCount: "Tips",
    fieldsCount: "Fields",
    freeAccess: "Free",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to Allah's Book.",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    fieldsPage: "Platform Fields",
    fieldsPageDesc: "17 diverse Islamic fields.",
    quranMemorization: "Quran Memorization Plan",
    quranMemorizationDesc: "Organize your daily portion.",
    noteTitle: "Important Notice",
    note1: "This path is for guidance; the order of stages may differ based on the student's needs and background.",
    note2: "It's best to accompany a scholar or knowledgeable student to guide and correct your path at each stage.",
    viewField: "Explore Field",
  },
};

// ============================================================
// تدرجات الألوان للبطاقات
// ============================================================

const GRADIENTS = [
  "from-emerald-500 to-emerald-700",
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
  "from-pink-500 to-pink-700",
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
      canonical: `/${l}/learn`,
      languages: {
        ar: "/ar/learn",
        en: "/en/learn",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/learn`,
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

export default async function LearnPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  // محاولة جلب البيانات من Supabase، مع fallback للبيانات الثابتة
  let steps: LearnStep[] = FALLBACK_STEPS;

  try {
    const { getContent } = await import("@/lib/content");
    const c = await getContent();

    if (c?.learnSteps && c.learnSteps.length > 0 && c?.fields) {
      const sortedSteps = [...c.learnSteps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      steps = sortedSteps.map((step: any, index: number) => {
  const field = c.fields?.find((f: any) => f?.slug === step?.field);

  return {
    id: String(step?.id ?? `step-${index}`),
    order: Number(step?.order ?? index),
    title: step?.title ?? { ar: "", en: "" },
    desc: step?.desc ?? { ar: "", en: "" },
    field: String(step?.field ?? field?.slug ?? ""),
    fieldIcon:
      typeof field?.icon === "string"
        ? field.icon
        : typeof step?.fieldIcon === "string"
        ? step.fieldIcon
        : "📘",
    fieldName: field?.name ?? step?.fieldName ?? { ar: "", en: "" },
  } as LearnStep;
});
    }
  } catch {
    // استخدام FALLBACK_STEPS
  }

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: L,
        url: `/${L}/learn`,
        articleSection: isRTL ? "طلب العلم" : "Seeking Knowledge",
        keywords: isRTL
          ? "طلب العلم, مسار التعلم, طالب العلم, العلوم الشرعية"
          : "seeking knowledge, learning path, student of knowledge, Islamic sciences",
      },
      {
        "@type": "HowTo",
        name: ui.stepsTitle,
        description: ui.stepsSubtitle,
        inLanguage: L,
        step: sortedSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title[L],
          text: step.desc[L],
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
        <div className="card relative mb-8 overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-cream-dark to-purple-50 p-8 md:p-12 dark:border-indigo-800 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #4f46e5, #9333ea)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">🎓 {ui.heroTitle}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.heroSubtitle}
            </p>

            {/* حديث شريف */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                ﴿{ui.heroHadith}﴾
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                📜 {ui.heroHadithSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📚" label={ui.stepsCount} value={sortedSteps.length} color="primary" />
          <StatCard icon="💡" label={ui.tipsCount} value={TIPS.length} color="gold" />
          <StatCard icon="🌐" label={ui.fieldsCount} value={17} color="primary" />
          <StatCard icon="✨" label={ui.freeAccess} value="100%" color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-10 overflow-hidden border-r-4 border-gold-500">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-primary-700 dark:text-gold-300"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🌟 {ui.introTitle}
            </h2>
            <p className="mb-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>

            <div className="rounded-xl border-r-4 border-gold-500 bg-gold-50/60 p-5 dark:border-gold-400 dark:bg-gold-950/20 rtl:border-l-4 rtl:border-r-0">
              <p
                className="text-lg font-black text-primary-700 md:text-xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.introQuote}»
              </p>
              <p className="mt-2 text-xs font-bold text-gold-700 dark:text-gold-400">
                📜 {ui.introQuoteSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== خطوات المسار ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              📚 {ui.stepsTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.stepsSubtitle}
            </p>
          </div>

          <div className="space-y-5">
            {sortedSteps.map((step, i) => {
              const gradient = GRADIENTS[i % GRADIENTS.length];

              return (
                <Link
                  key={step.id}
                  href={`/${L}/fields/${step.field}`}
                  className={`group relative block overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8`}
                >
                  {/* زخرفة خلفية */}
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                  <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                    {/* رقم الخطوة */}
                    <div className="flex-shrink-0">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <span
                          className="text-4xl font-black"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {step.order}
                        </span>
                      </div>
                    </div>

                    {/* المحتوى */}
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-3xl">{step.fieldIcon}</span>
                        <h3
                          className="text-2xl font-black"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {step.title[L]}
                        </h3>
                      </div>
                      <p className="mb-3 text-lg leading-relaxed text-white/90">
                        {step.desc[L]}
                      </p>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                        <span>{step.fieldIcon}</span>
                        <span>
                          {ui.field}: {step.fieldName[L]}
                        </span>
                      </span>
                    </div>

                    {/* السهم */}
                    <div className="flex-shrink-0">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm transition-transform group-hover:scale-110">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={isRTL ? "rotate-180" : ""}
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== نصائح لطالب العلم ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.tipsTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.tipsSubtitle}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((tip) => (
              <div
                key={tip.id}
                className="card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tip.color}`} />

                <div className="mb-4 flex items-center gap-3">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tip.color} text-2xl text-white shadow-lg`}>
                    {tip.icon}
                  </span>
                  <h3
                    className="text-xl font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {tip.title[L]}
                  </h3>
                </div>

                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip.description[L]}
                </p>
              </div>
            ))}
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

            <Link href={`/${L}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">✍️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.articlesPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.articlesPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/fields`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📚</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fieldsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fieldsPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/quran-memorization`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🎯</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.quranMemorization}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.quranMemorizationDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيه مهم ===== */}
        <div className="card mb-8 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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

        {/* ===== آية ختامية ===== */}
        <div className="card relative overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 text-center md:p-12 dark:border-gold-700 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <p
            className="mb-3 text-2xl font-black text-primary-700 md:text-4xl dark:text-gold-300"
            style={{ fontFamily: "var(--font-quran)" }}
          >
            {ui.closingVerse}
          </p>
          <p className="text-sm text-gold-700 dark:text-gold-400">
            {ui.closingVerseSource}
          </p>
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