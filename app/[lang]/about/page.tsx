// app/[lang]/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type ValueItem = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
};

type BulletItem = {
  id: string;
  text: Localized;
};

type LinkItem = {
  id: string;
  href: string;
  icon: string;
  title: Localized;
  description: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  quickNav: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  missionTitle: string;
  missionDesc: string;
  visionTitle: string;
  visionParagraph: string;
  valuesTitle: string;
  valuesDesc: string;
  founderTitle: string;
  founderName: string;
  founderRole: string;
  founderParagraph1: string;
  founderParagraph2: string;
  contentTitle: string;
  contentDesc: string;
  sectionsTitle: string;
  sectionsDesc: string;
  privacyTitle: string;
  privacyParagraph: string;
  ctaTitle: string;
  ctaDesc: string;
  contact: string;
  faq: string;
  noteTitle: string;
  note1: string;
  note2: string;
  statsTitle: string;
  statsSections: string;
  statsLanguages: string;
  statsTools: string;
  statsFree: string;
};

// ============================================================
// ثوابت المنصة
// ============================================================

const PLATFORM_NAME: Localized = {
  ar: "منصة إسماعيل أحمد نجيب",
  en: "Ismail Ahmed Naguib Platform",
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "من نحن",
    subtitle: "تعرّف على منصة إسماعيل أحمد نجيب الدعوية",
    home: "الرئيسية",
    description:
      "صفحة من نحن لمنصة إسلامية دعوية تقدم القرآن والأذكار والفتاوى والقصص ومواقيت الصلاة والقبلة والمسبحة وخطط الحفظ وأدوات الدعوة، بلغتين وتصميم متجاوب.",
    quickNav: "تنقل سريع",
    aboutTitle: "عن المنصة",
    aboutParagraph1:
      "منصة إسماعيل أحمد نجيب مشروع دعوي تعليمي يهدف إلى جمع المحتوى الإسلامي النافع في مكان واحد، بأسلوب مبسط ومحترم لعقل المستخدم، ويخدم العربي والإنجليزي على حد سواء.",
    aboutParagraph2:
      "نؤمن أن الدعوة تحتاج إلى علم صادق، وأسلوب حسن، وأداة مريحة، وواجهة نظيفة، ومحتوى قابل للفهم والتطبيق، لا مجرد نصوص مبعثرة أو خطب طويلة.",
    missionTitle: "رسالتنا",
    missionDesc: "نسعى إلى:",
    visionTitle: "رؤيتنا",
    visionParagraph:
      "أن تكون المنصة مرجعًا يوميًا بسيطًا للمسلم الجديد، وطالب العلم المبتدئ، والداعية، والأسرة المسلمة، بلغة يفهمها القلب قبل العين.",
    valuesTitle: "قيمنا",
    valuesDesc: "هذه القيم تضبط محتوى المنصة وأدواتها.",
    founderTitle: "المشرف على المنصة",
    founderName: "إسماعيل أحمد نجيب",
    founderRole: "صاحب المنصة والمشرف على محتواها",
    founderParagraph1:
      "يعمل على تقديم محتوى إسلامي دعوي مبسط، يجمع بين العناية بالنص الشرعي، والاهتمام بالتجربة الرقمية، واحترام وقت المستخدم.",
    founderParagraph2:
      "تقوم المنصة على فكرة أن الدعوة يمكن أن تكون منظمة، جميلة، وسهلة الوصول، دون إخلال بالعلم أو الوقار أو صدق النقل.",
    contentTitle: "منهج المحتوى",
    contentDesc: "نحرص في النشر على ضوابط واضحة:",
    sectionsTitle: "أقسام المنصة",
    sectionsDesc: "تصفح أهم الأقسام المتاحة حاليًا.",
    privacyTitle: "الخصوصية ببساطة",
    privacyParagraph:
      "لا نطلب تسجيلًا إجباريًا لتصفح المحتوى، ومعظم أدوات التقدم مثل المسبحة وخطة الحفظ والورد تُحفظ محليًا على جهازك. عند الحاجة للتواصل أو الحساب، نجمع الحد الأدنى من البيانات فقط.",
    ctaTitle: "هل تريد المشاركة أو الاقتراح؟",
    ctaDesc:
      "نرحب بأسئلتك وملاحظاتك واقتراحاتك، وكذلك تعاون الدعاة والمترجمين والمصممين.",
    contact: "تواصل معنا",
    faq: "الأسئلة الشائعة",
    noteTitle: "ملاحظة",
    note1: "قد يُحدَّث المحتوى دوريًا لتصحيح خطأ أو إضافة قسم جديد.",
    note2:
      "المحتوى العام للتوعية، ولا يغني عن مراجعة أهل العلم في النوازل والمسائل الدقيقة.",
    statsTitle: "المنصة في أرقام",
    statsSections: "قسم ومحتوى",
    statsLanguages: "لغتان",
    statsTools: "أداة عملية",
    statsFree: "مجاني 100%",
  },
  en: {
    title: "About Us",
    subtitle: "Learn about the Ismail Ahmed Naguib Dawah Platform",
    home: "Home",
    description:
      "About page for an Islamic dawah platform offering Quran, adhkar, fatwas, prophets stories, prayer times, qibla, tasbih, memorization plans, and dawah tools, bilingual and responsive.",
    quickNav: "Quick navigation",
    aboutTitle: "About the Platform",
    aboutParagraph1:
      "The Ismail Ahmed Naguib Platform is an educational dawah project that aims to gather beneficial Islamic content in one place, with a simple style that respects the user's mind and serves Arabic and English readers alike.",
    aboutParagraph2:
      "We believe dawah needs sincere knowledge, good manner, a comfortable tool, a clean interface, and content that can be understood and applied, not scattered texts or long sermons only.",
    missionTitle: "Our Mission",
    missionDesc: "We strive to:",
    visionTitle: "Our Vision",
    visionParagraph:
      "To become a simple daily reference for new Muslims, beginner students of knowledge, da'ees, and Muslim families, in a language the heart understands before the eye.",
    valuesTitle: "Our Values",
    valuesDesc: "These values guide the platform's content and tools.",
    founderTitle: "Platform Supervisor",
    founderName: "Ismail Ahmed Naguib",
    founderRole: "Platform owner and content supervisor",
    founderParagraph1:
      "He works to present simplified Islamic dawah content, combining care for the revealed text, attention to digital experience, and respect for the user's time.",
    founderParagraph2:
      "The platform is built on the idea that dawah can be organized, beautiful, and easy to access without compromising knowledge, dignity, or truthful transmission.",
    contentTitle: "Content Methodology",
    contentDesc: "We follow clear publishing standards:",
    sectionsTitle: "Platform Sections",
    sectionsDesc: "Browse the main sections currently available.",
    privacyTitle: "Privacy Simply",
    privacyParagraph:
      "We do not require mandatory registration to browse content, and most progress tools such as tasbih, memorization plan, and daily wird are saved locally on your device. When contact or account features are needed, we collect the minimum data only.",
    ctaTitle: "Want to participate or suggest?",
    ctaDesc:
      "We welcome your questions, feedback, suggestions, and collaboration from da'ees, translators, and designers.",
    contact: "Contact Us",
    faq: "FAQ",
    noteTitle: "Notice",
    note1: "Content may be updated periodically to correct an error or add a new section.",
    note2:
      "General content is for awareness and does not replace consulting qualified scholars in detailed or unusual matters.",
    statsTitle: "Platform in Numbers",
    statsSections: "Sections",
    statsLanguages: "Languages",
    statsTools: "Practical Tools",
    statsFree: "100% Free",
  },
};

// ============================================================
// نقاط الرسالة
// ============================================================

const MISSION_POINTS: BulletItem[] = [
  {
    id: "authentic-simple",
    text: {
      ar: "تقديم محتوى إسلامي صحيح ومبسط.",
      en: "Present authentic and simplified Islamic content.",
    },
  },
  {
    id: "new-muslims",
    text: {
      ar: "مساعدة المسلم الجديد وطالب العلم المبتدئ.",
      en: "Help new Muslims and beginner students of knowledge.",
    },
  },
  {
    id: "dawah-tools",
    text: {
      ar: "توفير أدوات عملية تدعم الداعية والمستخدم.",
      en: "Provide practical tools that support the da'ee and user.",
    },
  },
  {
    id: "bilingual",
    text: {
      ar: "مخاطبة العربي والإنجليزي بلغة واضحة.",
      en: "Address Arabic and English readers in clear language.",
    },
  },
  {
    id: "privacy-respect",
    text: {
      ar: "احترام خصوصية المستخدم وتقليل جمع البيانات.",
      en: "Respect user privacy and minimize data collection.",
    },
  },
  {
    id: "update-correction",
    text: {
      ar: "تحديث المحتوى وتصحيح الأخطاء عند ثبوتها.",
      en: "Update content and correct errors when confirmed.",
    },
  },
];

// ============================================================
// منهج المحتوى
// ============================================================

const CONTENT_METHOD: BulletItem[] = [
  {
    id: "quran-sunnah",
    text: {
      ar: "الاعتماد على القرآن والسنة بفهم سليم.",
      en: "Rely on the Quran and Sunnah with sound understanding.",
    },
  },
  {
    id: "verify",
    text: {
      ar: "التحقق من النقل قبل النشر.",
      en: "Verify narration before publishing.",
    },
  },
  {
    id: "moderation",
    text: {
      ar: "الابتعاد عن الغلو والتقصير.",
      en: "Avoid extremism and negligence.",
    },
  },
  {
    id: "simplify",
    text: {
      ar: "التبسيط دون إخلال بالمعنى الشرعي.",
      en: "Simplify without compromising the Islamic meaning.",
    },
  },
  {
    id: "respect-difference",
    text: {
      ar: "احترام الخلاف المعتبر عند الحاجة.",
      en: "Respect legitimate disagreement when needed.",
    },
  },
  {
    id: "gentle-invitation",
    text: {
      ar: "الدعوة إلى الخير والرد بالتي هي أحسن.",
      en: "Invite to good and respond in the best manner.",
    },
  },
];

// ============================================================
// القيم
// ============================================================

const VALUES: ValueItem[] = [
  {
    id: "ikhlas",
    icon: "❤️",
    title: {
      ar: "الإخلاص",
      en: "Sincerity",
    },
    description: {
      ar: "أن يكون العمل لوجه الله، وابتغاء نفع العباد.",
      en: "Work should be for Allah's sake and for the benefit of people.",
    },
  },
  {
    id: "ilm",
    icon: "📚",
    title: {
      ar: "العلم",
      en: "Knowledge",
    },
    description: {
      ar: "لا نُقدّم محتوى دينيًا إلا بعد مراجعة المصدر والضابط.",
      en: "We do not present religious content except after checking source and discipline.",
    },
  },
  {
    id: "rifq",
    icon: "🤝",
    title: {
      ar: "الرفق",
      en: "Gentleness",
    },
    description: {
      ar: "اللين يفتح القلوب، والخشونة قد تغلق باب الخير.",
      en: "Softness opens hearts, while harshness may close the door of good.",
    },
  },
  {
    id: "tawazun",
    icon: "⚖️",
    title: {
      ar: "التوازن",
      en: "Balance",
    },
    description: {
      ar: "بين النص والواقع، والجدية واليسر، والتقليد والتجديد الرقمي.",
      en: "Between text and reality, seriousness and ease, tradition and digital renewal.",
    },
  },
  {
    id: "khidmah",
    icon: "🌍",
    title: {
      ar: "الخدمة",
      en: "Service",
    },
    description: {
      ar: "المنصة أداة خدمة للناس، لا منصة تفاخر أو جدال.",
      en: "The platform is a service tool for people, not a stage for pride or argument.",
    },
  },
  {
    id: "istimrariyyah",
    icon: "🌱",
    title: {
      ar: "الاستمرار",
      en: "Continuity",
    },
    description: {
      ar: "نعمل على التطوير التدريجي، وتصحيح الأخطاء، وإضافة ما ينفع.",
      en: "We work on gradual improvement, correcting errors, and adding benefit.",
    },
  },
];

// ============================================================
// أقسام المنصة
// ============================================================

const SECTION_LINKS: LinkItem[] = [
  {
    id: "quran",
    href: "/quran",
    icon: "📖",
    title: { ar: "القرآن الكريم", en: "Holy Quran" },
    description: { ar: "تصفح السور والاستماع والقراءة.", en: "Browse surahs, read, and listen." },
  },
  {
    id: "adhkar",
    href: "/adhkar",
    icon: "🤲",
    title: { ar: "الأذكار", en: "Adhkar" },
    description: { ar: "أذكار الصباح والمساء والنوم وبعد الصلاة.", en: "Morning, evening, sleep, and post-prayer adhkar." },
  },
  {
    id: "tasbih",
    href: "/tasbih",
    icon: "📿",
    title: { ar: "المسبحة الإلكترونية", en: "Digital Tasbih" },
    description: { ar: "عدّاد تفاعلي للتسبيح والذكر.", en: "Interactive counter for dhikr and tasbih." },
  },
  {
    id: "prayer-times",
    href: "/prayer-times",
    icon: "🕐",
    title: { ar: "مواقيت الصلاة", en: "Prayer Times" },
    description: { ar: "مواقيت الصلاة حسب موقعك.", en: "Prayer times based on your location." },
  },
  {
    id: "qibla",
    href: "/qibla",
    icon: "🧭",
    title: { ar: "اتجاه القبلة", en: "Qibla Direction" },
    description: { ar: "بوصلة القبلة والمسافة إلى مكة.", en: "Qibla compass and distance to Makkah." },
  },
  {
    id: "fatwa",
    href: "/fatwa",
    icon: "⚖️",
    title: { ar: "الفتاوى", en: "Fatwas" },
    description: { ar: "أسئلة فقهية وإجابات مختصرة.", en: "Islamic questions and concise answers." },
  },
  {
    id: "prophets-stories",
    href: "/prophets-stories",
    icon: "📚",
    title: { ar: "قصص الأنبياء", en: "Prophets Stories" },
    description: { ar: "قصص مختارة ودروس مستفادة.", en: "Selected stories and lessons." },
  },
  {
    id: "quran-memorization",
    href: "/quran-memorization",
    icon: "🎯",
    title: { ar: "خطة حفظ القرآن", en: "Memorization Plan" },
    description: { ar: "نظّم وردك اليومي من الحفظ والمراجعة.", en: "Organize daily memorization and revision." },
  },
  {
    id: "ruqyah",
    href: "/ruqyah",
    icon: "🛡️",
    title: { ar: "الرقية الشرعية", en: "Ruqyah" },
    description: { ar: "آيات وأدعية التحصين والرقية.", en: "Verses and supplications for protection." },
  },
  {
    id: "daily-wird",
    href: "/daily-wird",
    icon: "📅",
    title: { ar: "الورد اليومي", en: "Daily Wird" },
    description: { ar: "خطة أسبوعية للقرآن والذكر والعمل الصالح.", en: "Weekly plan for Quran, dhikr, and good deeds." },
  },
  {
    id: "zakat",
    href: "/zakat",
    icon: "💰",
    title: { ar: "حاسبة الزكاة", en: "Zakat Calculator" },
    description: { ar: "احسب زكاة المال حسب النصاب والديون.", en: "Calculate wealth zakat based on nisab and debts." },
  },
  {
    id: "inheritance",
    href: "/inheritance",
    icon: "📜",
    title: { ar: "حاسبة الميراث", en: "Inheritance Calculator" },
    description: { ar: "قسّم التركة حسب الفرائض المبسطة.", en: "Distribute estate according to simplified faraid." },
  },
  {
    id: "hajj-guide",
    href: "/hajj-guide",
    icon: "🕋",
    title: { ar: "دليل الحج والعمرة", en: "Hajj and Umrah Guide" },
    description: { ar: "خطوات النسك والأدعية والأخطاء الشائعة.", en: "Rites, supplications, and common mistakes." },
  },
  {
    id: "dawah-guide",
    href: "/dawah-guide",
    icon: "🤝",
    title: { ar: "دليل الدعوة", en: "Dawah Guide" },
    description: { ar: "أصول الدعوة وخطواتها ومهاراتها.", en: "Dawah principles, steps, and skills." },
  },
  {
    id: "articles",
    href: "/articles",
    icon: "✍️",
    title: { ar: "المقالات", en: "Articles" },
    description: { ar: "مقالات دعوية وتربوية وشرعية مختارة.", en: "Selected dawah, educational, and Islamic articles." },
  },
  {
    id: "faq",
    href: "/faq",
    icon: "❓",
    title: { ar: "الأسئلة الشائعة", en: "FAQ" },
    description: { ar: "إجابات عن أكثر الأسئلة تكرارًا.", en: "Answers to common questions." },
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

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/about`,
      languages: {
        ar: "/ar/about",
        en: "/en/about",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/about`,
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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: ui.title,
    description: ui.description,
    inLanguage: l,
    url: `/${l}/about`,
    mainEntity: {
      "@type": "Organization",
      name: isRTL ? PLATFORM_NAME.ar : PLATFORM_NAME.en,
      alternateName: isRTL ? PLATFORM_NAME.en : PLATFORM_NAME.ar,
      description: ui.description,
      url: `/${l}`,
      foundingDate: "2024",
      slogan: isRTL ? "نورُ العلم.. بين يديك" : "The Light of Knowledge.. In Your Hands",
      knowsLanguage: ["ar", "en"],
      founder: {
        "@type": "Person",
        name: ui.founderName,
        jobTitle: ui.founderRole,
      },
      sameAs: [],
    },
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
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
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
                  <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              ℹ️ {isRTL ? PLATFORM_NAME.ar : PLATFORM_NAME.en}
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

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard number="35+" label={ui.statsSections} icon="📚" />
          <StatCard number="2" label={ui.statsLanguages} icon="🌍" />
          <StatCard number="15+" label={ui.statsTools} icon="🛠️" />
          <StatCard number="100%" label={ui.statsFree} icon="✨" />
        </div>

        {/* ===== تنقل سريع ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex flex-wrap gap-3">
            <a href="#about" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🌐 {ui.aboutTitle}
            </a>
            <a href="#mission" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🎯 {ui.missionTitle}
            </a>
            <a href="#values" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              💎 {ui.valuesTitle}
            </a>
            <a href="#founder" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              👤 {ui.founderTitle}
            </a>
            <a href="#content" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              📚 {ui.contentTitle}
            </a>
            <a href="#sections" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🧩 {ui.sectionsTitle}
            </a>
            <a href="#privacy" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300">
              🔒 {ui.privacyTitle}
            </a>
          </div>
        </div>

        {/* ===== عن المنصة ===== */}
        <div id="about" className="card mb-8 scroll-mt-32 p-6 md:p-8">
          <h2
            className="mb-5 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.aboutTitle}
          </h2>

          <div className="space-y-4">
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.aboutParagraph1}
            </p>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.aboutParagraph2}
            </p>
          </div>
        </div>

        {/* ===== الرسالة والرؤية ===== */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div id="mission" className="card relative scroll-mt-32 overflow-hidden p-6 md:p-8">
            <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

            <h2
              className="mb-3 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.missionTitle}
            </h2>

            <p className="mb-5 leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.missionDesc}
            </p>

            <ul className="space-y-3">
              {MISSION_POINTS.map((point) => (
                <li
                  key={point.id}
                  className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>{isRTL ? point.text.ar : point.text.en}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="vision" className="card relative scroll-mt-32 overflow-hidden p-6 md:p-8">
            <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

            <h2
              className="mb-5 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.visionTitle}
            </h2>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.visionParagraph}
            </p>

            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
              <p className="text-sm font-black text-gold-700 dark:text-gold-300">
                {isRTL ? "محتوى نافع • تصميم مريح • لغتان • بدون تعقيد" : "Beneficial content • Comfortable design • Two languages • No complexity"}
              </p>
            </div>
          </div>
        </div>

        {/* ===== القيم ===== */}
        <div id="values" className="mb-8 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.valuesTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.valuesDesc}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <article key={value.id} className="card relative overflow-hidden p-6">
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                    {value.icon}
                  </span>
                  <h3
                    className="text-lg font-black leading-relaxed text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {isRTL ? value.title.ar : value.title.en}
                  </h3>
                </div>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {isRTL ? value.description.ar : value.description.en}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ===== المشرف ===== */}
        <div id="founder" className="card mb-8 scroll-mt-32 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-3xl text-white shadow-lg shadow-primary-500/25">
              👤
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-bold text-primary-600 dark:text-primary-400">
                {ui.founderTitle}
              </p>
              <h2
                className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.founderName}
              </h2>
              <p className="mb-5 text-sm font-bold text-gold-700 dark:text-gold-300">
                {ui.founderRole}
              </p>
              <div className="space-y-4">
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.founderParagraph1}
                </p>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.founderParagraph2}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== منهج المحتوى ===== */}
        <div id="content" className="card mb-8 scroll-mt-32 p-6 md:p-8">
          <h2
            className="mb-3 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.contentTitle}
          </h2>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.contentDesc}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {CONTENT_METHOD.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {isRTL ? item.text.ar : item.text.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== أقسام المنصة ===== */}
        <div id="sections" className="mb-8 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.sectionsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.sectionsDesc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTION_LINKS.map((link) => (
              <Link
                key={link.id}
                href={`/${l}${link.href}`}
                className="card card-interactive group flex items-start gap-4 p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                  {link.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {isRTL ? link.title.ar : link.title.en}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {isRTL ? link.description.ar : link.description.en}
                  </p>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-500 rtl:rotate-180 dark:text-slate-600"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== الخصوصية ===== */}
        <div id="privacy" className="card mb-8 scroll-mt-32 border-primary-200 bg-primary-50/40 p-6 md:p-8 dark:border-primary-900/30 dark:bg-primary-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
              🔒
            </span>
            <div>
              <h2
                className="mb-3 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.privacyTitle}
              </h2>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.privacyParagraph}
              </p>
            </div>
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 text-center md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />
          <h2
            className="mb-3 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.ctaTitle}
          </h2>
          <p className="mx-auto mb-7 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
            {ui.ctaDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${l}/contact`} className="btn-primary">
              {ui.contact}
            </Link>
            <Link href={`/${l}/faq`} className="btn-outline">
              {ui.faq}
            </Link>
          </div>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>
          <ul className="space-y-3">
            {[ui.note1, ui.note2].map((note, index) => (
              <li
                key={`note-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون مساعد: StatCard
// ============================================================

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
  return (
    <div className="card card-interactive p-5 text-center">
      <div className="mb-3 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-black text-primary-700 dark:text-primary-300">{number}</p>
      <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}