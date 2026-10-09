// app/[lang]/search/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { ADHKAR, PROPHETS, SURAHS, toArabicNumeral } from "@/lib/data";
import TopBar from "@/components/TopBar";

// ============================================================
// الأنواع
// ============================================================

type ResultType =
  | "quran"
  | "adhkar"
  | "prophet"
  | "page"
  | "fatwa"
  | "faq"
  | "tool";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  snippet: string;
  href: string;
  icon: string;
}

interface SearchParams {
  q?: string | string[];
}

interface PopularQuery {
  icon: string;
  ar: string;
  en: string;
}

interface StaticPage {
  id: string;
  icon: string;
  path: string;
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
  keywordsAr: string[];
  keywordsEn: string[];
}

interface TopicItem {
  id: string;
  ar: string;
  en: string;
  categoryAr: string;
  categoryEn: string;
  keywordsAr?: string[];
  keywordsEn?: string[];
}

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
    placeholder: string;
    search: string;
    clear: string;
    results: string;
    of: string;
    noResults: string;
    noResultsDesc: string;
    popular: string;
    popularDesc: string;
    quickPages: string;
    open: string;
    contact: string;
    homeBtn: string;
    note: string;
    types: Record<ResultType, string>;
  }
> = {
  ar: {
    title: "البحث",
    subtitle: "ابحث في القرآن والأذكار والفتاوى والقصص والصفحات",
    home: "الرئيسية",
    description:
      "صفحة البحث العامة في منصة إسماعيل أحمد نجيب الدعوية. ابحث في السور، الأذكار، قصص الأنبياء، الفتاوى، الأسئلة الشائعة، وصفحات المنصة.",
    placeholder: "اكتب كلمة للبحث: صلاة، صبر، القبلة، حفظ، رقية...",
    search: "بحث",
    clear: "مسح البحث",
    results: "عدد النتائج",
    of: "من",
    noResults: "لا توجد نتائج",
    noResultsDesc:
      "جرّب كلمة أخرى، أو تصفح الأقسام الرئيسية، أو راسلنا إذا كنت تبحث عن شيء محدد.",
    popular: "عمليات بحث شائعة",
    popularDesc: "ابدأ بأحد هذه المواضيع، أو اكتب搜索ك في الأعلى.",
    quickPages: "أقسام سريعة",
    open: "فتح",
    contact: "تواصل معنا",
    homeBtn: "العودة للرئيسية",
    note:
      "البحث يشمل العناوين والنصوص المختارة. لبعض الأقسام يتم تحويلك لصفحة القسم مع تمرير كلمة البحث.",
    types: {
      quran: "سورة",
      adhkar: "ذكر",
      prophet: "نبي",
      page: "صفحة",
      fatwa: "فتوى",
      faq: "سؤال",
      tool: "أداة",
    },
  },
  en: {
    title: "Search",
    subtitle: "Search Quran, adhkar, fatwas, stories, and platform pages",
    home: "Home",
    description:
      "General search page for the Ismail Ahmed Naguib Dawah Platform. Search surahs, adhkar, prophets stories, fatwas, FAQs, and platform pages.",
    placeholder: "Search: prayer, patience, qibla, memorization, ruqyah...",
    search: "Search",
    clear: "Clear search",
    results: "Results",
    of: "of",
    noResults: "No results found",
    noResultsDesc:
      "Try another keyword, browse main sections, or contact us if you are looking for something specific.",
    popular: "Popular searches",
    popularDesc: "Start with one of these topics, or type your search above.",
    quickPages: "Quick sections",
    open: "Open",
    contact: "Contact Us",
    homeBtn: "Back to Home",
    note:
      "Search covers titles and selected texts. For some sections, you will be redirected to the section page with the search keyword.",
    types: {
      quran: "Surah",
      adhkar: "Dhikr",
      prophet: "Prophet",
      page: "Page",
      fatwa: "Fatwa",
      faq: "FAQ",
      tool: "Tool",
    },
  },
};

// ============================================================
// اقتراحات بحث شائعة
// ============================================================

const POPULAR_QUERIES: PopularQuery[] = [
  { icon: "📖", ar: "القرآن", en: "Quran" },
  { icon: "🤲", ar: "أذكار الصباح", en: "Morning adhkar" },
  { icon: "🕌", ar: "الصلاة", en: "Prayer" },
  { icon: "🧭", ar: "القبلة", en: "Qibla" },
  { icon: "📿", ar: "المسبحة", en: "Tasbih" },
  { icon: "⚖️", ar: "الفتاوى", en: "Fatwas" },
  { icon: "📚", ar: "قصص الأنبياء", en: "Prophets stories" },
  { icon: "🎯", ar: "حفظ القرآن", en: "Quran memorization" },
  { icon: "🛡️", ar: "الرقية", en: "Ruqyah" },
  { icon: "📅", ar: "الورد اليومي", en: "Daily wird" },
];

// ============================================================
// الصفحات الداخلية
// ============================================================

const PAGES: StaticPage[] = [
  {
    id: "home",
    icon: "🏠",
    path: "",
    ar: "الرئيسية",
    en: "Home",
    descAr: "الصفحة الرئيسية للمنصة",
    descEn: "Platform homepage",
    keywordsAr: ["رئيسية", "home", "منصة"],
    keywordsEn: ["home", "main", "platform"],
  },
  {
    id: "quran",
    icon: "📖",
    path: "/quran",
    ar: "القرآن الكريم",
    en: "Quran",
    descAr: "تصفح السور والاستماع والقراءة",
    descEn: "Browse surahs, read and listen",
    keywordsAr: ["قرآن", "سور", "مصحف", "quran"],
    keywordsEn: ["quran", "surah", "mushaf", "recitation"],
  },
  {
    id: "adhkar",
    icon: "🤲",
    path: "/adhkar",
    ar: "الأذكار",
    en: "Adhkar",
    descAr: "أذكار الصباح والمساء والنوم وبعد الصلاة",
    descEn: "Morning, evening, sleep and prayer adhkar",
    keywordsAr: ["أذكار", "ذكر", "استغفار", "تسبيح"],
    keywordsEn: ["adhkar", "dhikr", "remembrance", "istighfar"],
  },
  {
    id: "prayer-times",
    icon: "🕐",
    path: "/prayer-times",
    ar: "مواقيت الصلاة",
    en: "Prayer Times",
    descAr: "مواقيت الصلاة حسب موقعك",
    descEn: "Prayer times based on your location",
    keywordsAr: ["صلاة", "مواقيت", "فجر", "ظهر", "عصر", "مغرب", "عشاء"],
    keywordsEn: ["prayer", "times", "fajr", "dhuhr", "asr", "maghrib", "isha"],
  },
  {
    id: "qibla",
    icon: "🧭",
    path: "/qibla",
    ar: "اتجاه القبلة",
    en: "Qibla",
    descAr: "بوصلة اتجاه القبلة والمسافة إلى مكة",
    descEn: "Qibla compass and distance to Makkah",
    keywordsAr: ["قبلة", "اتجاه", "مكة", "كعبة", "بوصلة"],
    keywordsEn: ["qibla", "direction", "kaaba", "makkah", "compass"],
  },
  {
    id: "tasbih",
    icon: "📿",
    path: "/tasbih",
    ar: "المسبحة",
    en: "Tasbih",
    descAr: "عدّاد تفاعلي للتسبيح والذكر",
    descEn: "Interactive counter for dhikr",
    keywordsAr: ["مسبحة", "تسبيح", "عداد", "ذكر"],
    keywordsEn: ["tasbih", "counter", "dhikr", "praise"],
  },
  {
    id: "fatwa",
    icon: "⚖️",
    path: "/fatwa",
    ar: "الفتاوى",
    en: "Fatwas",
    descAr: "أسئلة فقهية وإجابات مختصرة",
    descEn: "Islamic questions and concise answers",
    keywordsAr: ["فتوى", "فتاوى", "حكم", "سؤال", "جواب"],
    keywordsEn: ["fatwa", "ruling", "question", "answer", "fiqh"],
  },
  {
    id: "prophets-stories",
    icon: "📚",
    path: "/prophets-stories",
    ar: "قصص الأنبياء",
    en: "Prophets Stories",
    descAr: "قصص مختارة ودروس مستفادة",
    descEn: "Selected stories and lessons",
    keywordsAr: ["أنبياء", "قصص", "رسل", "آدم", "نوح", "إبراهيم", "موسى"],
    keywordsEn: ["prophets", "stories", "messengers", "adam", "nuh", "ibrahim", "musa"],
  },
  {
    id: "quran-memorization",
    icon: "🎯",
    path: "/quran-memorization",
    ar: "خطة حفظ القرآن",
    en: "Memorization Plan",
    descAr: "نظّم وردك اليومي من الحفظ والمراجعة",
    descEn: "Organize daily memorization and revision",
    keywordsAr: ["حفظ", "تحفيظ", "خطة", "ورد", "مراجعة"],
    keywordsEn: ["memorization", "plan", "revision", "hifz"],
  },
  {
    id: "ruqyah",
    icon: "🛡️",
    path: "/ruqyah",
    ar: "الرقية الشرعية",
    en: "Ruqyah",
    descAr: "آيات وأدعية التحصين والرقية",
    descEn: "Verses and supplications for protection",
    keywordsAr: ["رقية", "تحصين", "عين", "حسد", "أدعية"],
    keywordsEn: ["ruqyah", "protection", "evil eye", "supplication"],
  },
  {
    id: "daily-wird",
    icon: "📅",
    path: "/daily-wird",
    ar: "الورد اليومي",
    en: "Daily Wird",
    descAr: "خطة أسبوعية للقرآن والذكر والعمل الصالح",
    descEn: "Weekly plan for Quran, dhikr and good deeds",
    keywordsAr: ["ورد", "يومي", "خطة", "أسبوعي", "التزام"],
    keywordsEn: ["wird", "daily", "weekly", "plan", "routine"],
  },
  {
    id: "faq",
    icon: "❓",
    path: "/faq",
    ar: "الأسئلة الشائعة",
    en: "FAQ",
    descAr: "إجابات عن أكثر الأسئلة تكرارًا",
    descEn: "Answers to common questions",
    keywordsAr: ["أسئلة", "شائعة", "faq", "استفسار"],
    keywordsEn: ["faq", "questions", "answers", "help"],
  },
  {
    id: "contact",
    icon: "📬",
    path: "/contact",
    ar: "تواصل معنا",
    en: "Contact Us",
    descAr: "أرسل سؤالك أو اقتراحك أو ملاحظتك",
    descEn: "Send your question, suggestion or feedback",
    keywordsAr: ["تواصل", "اتصال", "رسالة", "اقتراح", "شكوى"],
    keywordsEn: ["contact", "message", "feedback", "suggestion"],
  },
  {
    id: "about",
    icon: "ℹ️",
    path: "/about",
    ar: "من نحن",
    en: "About",
    descAr: "تعرف على المنصة ورسالتها وقيمها",
    descEn: "Learn about the platform, mission and values",
    keywordsAr: ["من نحن", "عن", "رسالة", "رؤية", "صاحب"],
    keywordsEn: ["about", "mission", "vision", "founder"],
  },
];

// ============================================================
// فتاوى مختصرة للبحث
// ============================================================

const FATWA_TOPICS: TopicItem[] = [
  {
    id: "prayer-congregation",
    ar: "ما حكم صلاة الجماعة للرجل؟",
    en: "What is the ruling on congregational prayer for men?",
    categoryAr: "الصلاة",
    categoryEn: "Prayer",
    keywordsAr: ["صلاة", "جماعة", "حكم"],
    keywordsEn: ["prayer", "congregation", "ruling"],
  },
  {
    id: "fasting-travel",
    ar: "هل يجوز الفطر في السفر في رمضان؟",
    en: "Is it permissible to break the fast while traveling in Ramadan?",
    categoryAr: "الصيام",
    categoryEn: "Fasting",
    keywordsAr: ["صيام", "سفر", "رمضان", "فطر"],
    keywordsEn: ["fasting", "travel", "ramadan", "break fast"],
  },
  {
    id: "fasting-forgetfully",
    ar: "من أكل أو شرب ناسيًا في نهار رمضان هل أفطر؟",
    en: "If someone eats or forgetfully during Ramadan, is the fast broken?",
    categoryAr: "الصيام",
    categoryEn: "Fasting",
    keywordsAr: ["أكل", "شرب", "ناسيًا", "رمضان"],
    keywordsEn: ["eat", "drink", "forgetfully", "ramadan"],
  },
  {
    id: "zakat-cash",
    ar: "كيف تزكى الأموال النقدية؟",
    en: "How is cash money purified through zakat?",
    categoryAr: "الزكاة",
    categoryEn: "Zakat",
    keywordsAr: ["زكاة", "مال", "نقود", "نصاب"],
    keywordsEn: ["zakat", "money", "cash", "nisab"],
  },
  {
    id: "hajj-umrah-order",
    ar: "هل يجوز أداء العمرة قبل الحج؟",
    en: "Is it permissible to perform Umrah before Hajj?",
    categoryAr: "الحج والعمرة",
    categoryEn: "Hajj & Umrah",
    keywordsAr: ["حج", "عمرة", "ترتيب", "نسك"],
    keywordsEn: ["hajj", "umrah", "order", "rites"],
  },
  {
    id: "family-divorce-word",
    ar: "هل يقع الطلاق بالكناية؟",
    en: "Does indirect wording cause divorce?",
    categoryAr: "الأسرة",
    categoryEn: "Family",
    keywordsAr: ["طلاق", "كناية", "أسرة", "زواج"],
    keywordsEn: ["divorce", "kinayah", "family", "marriage"],
  },
  {
    id: "transactions-interest",
    ar: "ما حكم الفائدة البنكية؟",
    en: "What is the ruling on bank interest?",
    categoryAr: "المعاملات",
    categoryEn: "Transactions",
    keywordsAr: ["ربا", "فائدة", "بنك", "معاملات"],
    keywordsEn: ["interest", "bank", "riba", "transactions"],
  },
  {
    id: "aqeedah-tawassul",
    ar: "ما الفرق بين التوسل المشروع والممنوع؟",
    en: "What is the difference between permissible and prohibited tawassul?",
    categoryAr: "العقيدة",
    categoryEn: "Aqeedah",
    keywordsAr: ["توسل", "عقيدة", "توحيد", "شرك"],
    keywordsEn: ["tawassul", "aqeedah", "monotheism", "shirk"],
  },
];

// ============================================================
// أسئلة شائعة مختصرة للبحث
// ============================================================

const FAQ_TOPICS: TopicItem[] = [
  {
    id: "what-is-platform",
    ar: "ما هي منصة إسماعيل أحمد نجيب؟",
    en: "What is the Ismail Ahmed Naguib platform?",
    categoryAr: "عن المنصة",
    categoryEn: "About Platform",
    keywordsAr: ["منصة", "تعريف", "إسماعيل"],
    keywordsEn: ["platform", "about", "ismail"],
  },
  {
    id: "is-free",
    ar: "هل استخدام المنصة مجاني؟",
    en: "Is the platform free to use?",
    categoryAr: "عن المنصة",
    categoryEn: "About Platform",
    keywordsAr: ["مجاني", "سعر", "اشتراك"],
    keywordsEn: ["free", "price", "subscription"],
  },
  {
    id: "need-account",
    ar: "هل أحتاج إلى إنشاء حساب لاستخدام المنصة؟",
    en: "Do I need an account to use the platform?",
    categoryAr: "الحساب",
    categoryEn: "Account",
    keywordsAr: ["حساب", "تسجيل", "دخول"],
    keywordsEn: ["account", "register", "login"],
  },
  {
    id: "forgot-password",
    ar: "نسيت كلمة المرور، ماذا أفعل؟",
    en: "I forgot my password, what should I do?",
    categoryAr: "الحساب",
    categoryEn: "Account",
    keywordsAr: ["كلمة المرور", "نسيت", "استعادة"],
    keywordsEn: ["password", "forgot", "reset"],
  },
  {
    id: "fatwa-source",
    ar: "من أين تأتي الفتاوى المعروضة؟",
    en: "Where do the displayed fatwas come from?",
    categoryAr: "المحتوى",
    categoryEn: "Content",
    keywordsAr: ["فتاوى", "مصدر", "علماء"],
    keywordsEn: ["fatwas", "source", "scholars"],
  },
  {
    id: "offline",
    ar: "هل تعمل المنصة بدون إنترنت؟",
    en: "Does the platform work offline?",
    categoryAr: "التقنية",
    categoryEn: "Technical",
    keywordsAr: ["أوفلاين", "بدون إنترنت", "تطبيق"],
    keywordsEn: ["offline", "internet", "app"],
  },
  {
    id: "dark-mode",
    ar: "كيف أفعّل الوضع الليلي؟",
    en: "How do I enable dark mode?",
    categoryAr: "التقنية",
    categoryEn: "Technical",
    keywordsAr: ["وضع ليلي", "داكن", "ثيم"],
    keywordsEn: ["dark mode", "theme", "night"],
  },
  {
    id: "data-collected",
    ar: "ما البيانات التي تجمعها المنصة عني؟",
    en: "What data does the platform collect about me?",
    categoryAr: "الخصوصية",
    categoryEn: "Privacy",
    keywordsAr: ["بيانات", "خصوصية", "تجميع"],
    keywordsEn: ["data", "privacy", "collect"],
  },
];

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u064B-\u0652\u0670\u0653-\u0655\u0640\u06D6-\u06ED]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase()
    .trim();
}

function includesQuery(haystack: string[], query: string): boolean {
  const q = normalizeText(query);

  if (!q) {
    return false;
  }

  return haystack.some((value) => normalizeText(value).includes(q));
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function truncateText(value: string, maxLength = 140): string {
  const clean = value.replace(/\s+/g, " ").trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength)}…`;
}

function buildSearchHref(lang: Lang, query: string): string {
  return `/${lang}/search?q=${encodeURIComponent(query)}`;
}

function buildSectionSearchHref(
  lang: Lang,
  section: "fatwa" | "faq",
  query: string
): string {
  return `/${lang}/${section}?q=${encodeURIComponent(query)}`;
}

// ============================================================
// البحث
// ============================================================

function searchAll(query: string, lang: Lang): SearchResult[] {
  const results: SearchResult[] = [];
  const isRTL = lang === "ar";

  const addResult = (result: SearchResult) => {
    if (results.length >= 80) return;

    const exists = results.some((item) => item.id === result.id);
    if (!exists) {
      results.push(result);
    }
  };

  // ===== الصفحات =====
  for (const page of PAGES) {
    const haystack = [
      page.ar,
      page.en,
      page.descAr,
      page.descEn,
      page.id,
      ...page.keywordsAr,
      ...page.keywordsEn,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `page-${page.id}`,
        type: "page",
        title: isRTL ? page.ar : page.en,
        subtitle: isRTL ? page.descAr : page.descEn,
        snippet: isRTL ? page.descAr : page.descEn,
        href: `/${lang}${page.path}`,
        icon: page.icon,
      });
    }
  }

  // ===== السور =====
  for (const surah of SURAHS) {
    const typeLabel =
      surah.type === "makki"
        ? isRTL
          ? "مكية"
          : "Meccan"
        : isRTL
        ? "مدنية"
        : "Medinan";

    const haystack = [
      surah.arabicName,
      surah.englishName,
      String(surah.number),
      String(surah.ayahs),
      typeLabel,
      surah.type,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `quran-${surah.number}`,
        type: "quran",
        title: isRTL ? surah.arabicName : surah.englishName,
        subtitle: `${formatNumber(surah.number, lang)} • ${formatNumber(
          surah.ayahs,
          lang
        )} ${isRTL ? "آية" : "ayahs"}`,
        snippet: typeLabel,
        href: `/${lang}/quran/${surah.number}`,
        icon: "📖",
      });
    }
  }

  // ===== فئات الأذكار =====
  for (const category of ADHKAR) {
    const haystack = [
      category.arabicTitle,
      category.englishTitle,
      category.id,
      category.icon,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `adhkar-category-${category.id}`,
        type: "adhkar",
        title: isRTL ? category.arabicTitle : category.englishTitle,
        subtitle: `${formatNumber(category.adhkar.length, lang)} ${
          isRTL ? "ذكر" : "adhkar"
        }`,
        snippet: isRTL
          ? "اضغط لفتح قسم الأذكار"
          : "Open the adhkar section",
        href: `/${lang}/adhkar`,
        icon: category.icon,
      });
    }
  }

  // ===== أذكار مفردة =====
  let individualAdhkarCount = 0;

  outer: for (const category of ADHKAR) {
    for (let index = 0; index < category.adhkar.length; index += 1) {
      const dhikr = category.adhkar[index];

      const haystack = [
        dhikr.text,
        dhikr.source,
        dhikr.virtue ?? "",
        category.arabicTitle,
        category.englishTitle,
      ];

      if (includesQuery(haystack, query)) {
        addResult({
          id: `adhkar-${category.id}-${index}`,
          type: "adhkar",
          title: isRTL ? category.arabicTitle : category.englishTitle,
          subtitle: `${formatNumber(dhikr.count, lang)} ${
            isRTL ? "مرة" : "times"
          }`,
          snippet: truncateText(dhikr.text, 160),
          href: `/${lang}/adhkar`,
          icon: "🤲",
        });

        individualAdhkarCount += 1;

        if (individualAdhkarCount >= 12) {
          break outer;
        }
      }
    }
  }

  // ===== قصص الأنبياء =====
  for (const prophet of PROPHETS) {
    const haystack = [
      prophet.arabicName,
      prophet.englishName,
      prophet.title,
      prophet.id,
      prophet.icon,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `prophet-${prophet.id}`,
        type: "prophet",
        title: isRTL ? prophet.arabicName : prophet.englishName,
        subtitle: prophet.title,
        snippet: prophet.title,
        href: `/${lang}/prophets-stories#${prophet.id}`,
        icon: prophet.icon,
      });
    }
  }

  // ===== الفتاوى =====
  for (const topic of FATWA_TOPICS) {
    const haystack = [
      topic.ar,
      topic.en,
      topic.categoryAr,
      topic.categoryEn,
      topic.id,
      ...(topic.keywordsAr ?? []),
      ...(topic.keywordsEn ?? []),
    ];

    if (includesQuery(haystack, query)) {
      const title = isRTL ? topic.ar : topic.en;

      addResult({
        id: `fatwa-${topic.id}`,
        type: "fatwa",
        title,
        subtitle: isRTL ? topic.categoryAr : topic.categoryEn,
        snippet: isRTL
          ? "اضغط لعرض الفتوى في قسم الفتاوى"
          : "Open this fatwa in the fatwa section",
        href: buildSectionSearchHref(lang, "fatwa", title),
        icon: "⚖️",
      });
    }
  }

  // ===== الأسئلة الشائعة =====
  for (const topic of FAQ_TOPICS) {
    const haystack = [
      topic.ar,
      topic.en,
      topic.categoryAr,
      topic.categoryEn,
      topic.id,
      ...(topic.keywordsAr ?? []),
      ...(topic.keywordsEn ?? []),
    ];

    if (includesQuery(haystack, query)) {
      const title = isRTL ? topic.ar : topic.en;

      addResult({
        id: `faq-${topic.id}`,
        type: "faq",
        title,
        subtitle: isRTL ? topic.categoryAr : topic.categoryEn,
        snippet: isRTL
          ? "اضغط لعرض السؤال في الأسئلة الشائعة"
          : "Open this question in the FAQ section",
        href: buildSectionSearchHref(lang, "faq", title),
        icon: "❓",
      });
    }
  }

  return results;
}

// ============================================================
// Metadata
// ============================================================

export const dynamic = "force-dynamic";

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
      canonical: `/${l}/search`,
      languages: {
        ar: "/ar/search",
        en: "/en/search",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/search`,
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

// ============================================================
// الصفحة
// ============================================================

export default async function SearchPage({
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

  const results = q ? searchAll(q, l) : [];

  return (
    <main>
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
        {/* ===== بطاقة البحث ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/search`}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
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
                placeholder={ui.placeholder}
                className="input-islamic !ps-12"
                aria-label={ui.placeholder}
              />
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

          {q && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="badge-gold">“{q}”</span>

              <Link
                href={`/${l}/search`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {ui.clear}
              </Link>
            </div>
          )}
        </div>

        {/* ===== لا يوجد بحث: اقتراحات + أقسام سريعة ===== */}
        {!q && (
          <>
            <div className="card mb-8 p-6 md:p-8">
              <h2
                className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.popular}
              </h2>

              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                {ui.popularDesc}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {POPULAR_QUERIES.map((item) => (
                  <Link
                    key={item.ar}
                    href={buildSearchHref(l, isRTL ? item.ar : item.en)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  >
                    <span>{item.icon}</span>
                    <span>{isRTL ? item.ar : item.en}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <h2
                className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.quickPages}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PAGES.slice(0, 9).map((page) => (
                  <Link
                    key={page.id}
                    href={`/${l}${page.path}`}
                    className="card card-interactive group flex items-start gap-4 p-5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                      {page.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                        {isRTL ? page.ar : page.en}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {isRTL ? page.descAr : page.descEn}
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
          </>
        )}

        {/* ===== نتائج البحث ===== */}
        {q && results.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔍</div>

            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h2>

            <p className="mx-auto mb-8 max-w-xl leading-relaxed text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}`} className="btn-primary">
                {ui.homeBtn}
              </Link>

              <Link href={`/${l}/contact`} className="btn-outline">
                {ui.contact}
              </Link>
            </div>

            <div className="mt-10">
              <p className="mb-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                {ui.popular}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {POPULAR_QUERIES.slice(0, 6).map((item) => (
                  <Link
                    key={item.ar}
                    href={buildSearchHref(l, isRTL ? item.ar : item.en)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  >
                    <span>{item.icon}</span>
                    <span>{isRTL ? item.ar : item.en}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {q && results.length > 0 && (
          <>
            <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {ui.results}:{" "}
              <span className="text-primary-600 dark:text-primary-400">
                {formatNumber(results.length, l)}
              </span>
            </p>

            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  className="card card-interactive group flex items-start gap-4 p-5 md:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {result.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge-primary text-xs">
                        {ui.types[result.type]}
                      </span>

                      {result.subtitle && (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {result.subtitle}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-1 text-lg font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {result.title}
                    </h3>

                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {result.snippet}
                    </p>
                  </div>

                  <svg
                    width="20"
                    height="20"
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
          </>
        )}

        {/* ===== ملاحظة ===== */}
        <div className="card mt-10 p-6 text-center">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.note}
          </p>
        </div>
      </section>
    </main>
  );
}