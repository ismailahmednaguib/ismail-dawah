// app/[lang]/search/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { ADHKAR, PROPHETS, SURAHS, toArabicNumeral } from "@/lib/data";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    verse: string;
    verseSource: string;
    hadith: string;
    hadithSource: string;
    surahsCount: string;
    adhkarCount: string;
    fatwasCount: string;
    pagesCount: string;
    introTitle: string;
    introDesc: string;
    relatedTitle: string;
    quranPage: string;
    quranPageDesc: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    faqPage: string;
    faqPageDesc: string;
    smartSearch: string;
    tip1: string;
    tip2: string;
    tip3: string;
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
    popularDesc: "ابدأ بأحد هذه المواضيع، أو اكتب بحثك في الأعلى.",
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
    verse: "﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾",
    verseSource: "سورة العلق — الآية 1",
    hadith: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    hadithSource: "رواه مسلم",
    surahsCount: "سورة",
    adhkarCount: "ذكر",
    fatwasCount: "فتوى",
    pagesCount: "صفحة",
    introTitle: "نصائح للبحث الفعّال",
    introDesc:
      "استخدم كلمات مفتاحية واضحة مثل اسم السورة أو الموضوع الفقهي أو اسم النبي. البحث يدعم العربية والإنجليزية، ويتجاهل التشكيل والحركات لتسهيل العثور على النتائج.",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "تصفح 114 سورة كاملة.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية وإجابات.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    faqPage: "الأسئلة الشائعة",
    faqPageDesc: "إجابات سريعة عن المنصة.",
    smartSearch: "🔍 بحث ذكي",
    tip1: "استخدم كلمة واحدة أو كلمتين للنتائج الأفضل",
    tip2: "يمكنك البحث بالعربية أو الإنجليزية",
    tip3: "التشكيل والحركات لا تؤثر على نتائج البحث",
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
    verse: "\"Read in the name of your Lord who created.\"",
    verseSource: "Surah Al-Alaq — Verse 1",
    hadith: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    hadithSource: "Narrated by Muslim",
    surahsCount: "Surahs",
    adhkarCount: "Adhkar",
    fatwasCount: "Fatwas",
    pagesCount: "Pages",
    introTitle: "Tips for Effective Search",
    introDesc:
      "Use clear keywords such as surah name, fiqh topic, or prophet name. The search supports Arabic and English, and ignores diacritics to make finding results easier.",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Browse all 114 surahs.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Fiqh questions and answers.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    faqPage: "FAQ",
    faqPageDesc: "Quick answers about the platform.",
    smartSearch: "🔍 Smart Search",
    tip1: "Use one or two keywords for best results",
    tip2: "You can search in Arabic or English",
    tip3: "Diacritics do not affect search results",
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
  if (Array.isArray(value)) return value[0] ?? "";
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
  if (!q) return false;
  return haystack.some((value) => normalizeText(value).includes(q));
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function truncateText(value: string, maxLength = 140): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
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
    if (!exists) results.push(result);
  };

  // ===== الصفحات =====
  for (const page of PAGES) {
    const haystack = [
      page.ar, page.en, page.descAr, page.descEn, page.id,
      ...page.keywordsAr, ...page.keywordsEn,
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
        ? isRTL ? "مكية" : "Meccan"
        : isRTL ? "مدنية" : "Medinan";

    const haystack = [
      surah.arabicName, surah.englishName,
      String(surah.number), String(surah.ayahs),
      typeLabel, surah.type,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `quran-${surah.number}`,
        type: "quran",
        title: isRTL ? surah.arabicName : surah.englishName,
        subtitle: `${formatNumber(surah.number, lang)} • ${formatNumber(surah.ayahs, lang)} ${isRTL ? "آية" : "ayahs"}`,
        snippet: typeLabel,
        href: `/${lang}/quran/${surah.number}`,
        icon: "📖",
      });
    }
  }

  // ===== فئات الأذكار =====
  for (const category of ADHKAR) {
    const haystack = [
      category.arabicTitle, category.englishTitle,
      category.id, category.icon,
    ];

    if (includesQuery(haystack, query)) {
      addResult({
        id: `adhkar-category-${category.id}`,
        type: "adhkar",
        title: isRTL ? category.arabicTitle : category.englishTitle,
        subtitle: `${formatNumber(category.adhkar.length, lang)} ${isRTL ? "ذكر" : "adhkar"}`,
        snippet: isRTL ? "اضغط لفتح قسم الأذكار" : "Open the adhkar section",
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
        dhikr.text, dhikr.source, dhikr.virtue ?? "",
        category.arabicTitle, category.englishTitle,
      ];

      if (includesQuery(haystack, query)) {
        addResult({
          id: `adhkar-${category.id}-${index}`,
          type: "adhkar",
          title: isRTL ? category.arabicTitle : category.englishTitle,
          subtitle: `${formatNumber(dhikr.count, lang)} ${isRTL ? "مرة" : "times"}`,
          snippet: truncateText(dhikr.text, 160),
          href: `/${lang}/adhkar`,
          icon: "🤲",
        });

        individualAdhkarCount += 1;
        if (individualAdhkarCount >= 12) break outer;
      }
    }
  }

  // ===== قصص الأنبياء =====
  for (const prophet of PROPHETS) {
    const haystack = [
      prophet.arabicName, prophet.englishName,
      prophet.title, prophet.id, prophet.icon,
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
      topic.ar, topic.en, topic.categoryAr, topic.categoryEn, topic.id,
      ...(topic.keywordsAr ?? []), ...(topic.keywordsEn ?? []),
    ];

    if (includesQuery(haystack, query)) {
      const title = isRTL ? topic.ar : topic.en;
      addResult({
        id: `fatwa-${topic.id}`,
        type: "fatwa",
        title,
        subtitle: isRTL ? topic.categoryAr : topic.categoryEn,
        snippet: isRTL ? "اضغط لعرض الفتوى في قسم الفتاوى" : "Open this fatwa in the fatwa section",
        href: buildSectionSearchHref(lang, "fatwa", title),
        icon: "⚖️",
      });
    }
  }

  // ===== الأسئلة الشائعة =====
  for (const topic of FAQ_TOPICS) {
    const haystack = [
      topic.ar, topic.en, topic.categoryAr, topic.categoryEn, topic.id,
      ...(topic.keywordsAr ?? []), ...(topic.keywordsEn ?? []),
    ];

    if (includesQuery(haystack, query)) {
      const title = isRTL ? topic.ar : topic.en;
      addResult({
        id: `faq-${topic.id}`,
        type: "faq",
        title,
        subtitle: isRTL ? topic.categoryAr : topic.categoryEn,
        snippet: isRTL ? "اضغط لعرض السؤال في الأسئلة الشائعة" : "Open this question in the FAQ section",
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
  if (!isValidLang(lang)) return {};

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

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const q = getFirstValue(sp.q).trim();
  const results = q ? searchAll(q, l) : [];

  // حساب الإحصائيات
  const totalAdhkar = ADHKAR.reduce((sum, cat) => sum + cat.adhkar.length, 0);

  // JSON-LD: WebSite + SearchAction
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: isRTL ? "منصة إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib Platform",
        url: `/${l}`,
        inLanguage: l,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `/${l}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        name: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/search`,
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

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-primary-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">
              🔍 {isRTL ? "بحث شامل" : "Comprehensive Search"}
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
          <StatCard icon="📖" label={ui.surahsCount} value={formatNumber(114, l)} color="primary" />
          <StatCard icon="🤲" label={ui.adhkarCount} value={formatNumber(totalAdhkar, l)} color="gold" />
          <StatCard icon="⚖️" label={ui.fatwasCount} value={formatNumber(FATWA_TOPICS.length, l)} color="primary" />
          <StatCard icon="📄" label={ui.pagesCount} value={formatNumber(PAGES.length, l)} color="gold" />
        </div>

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
                autoFocus
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
              <span className="badge-gold">"{q}"</span>

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

        {/* ===== نصائح البحث ===== */}
        {!q && (
          <div className="card mb-8 overflow-hidden">
            <div className="gradient-gold h-1.5 w-full" />
            <div className="p-6 md:p-8">
              <h2
                className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                💡 {ui.introTitle}
              </h2>
              <p className="mb-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.introDesc}
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    1
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {ui.tip1}
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    2
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {ui.tip2}
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    3
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {ui.tip3}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {/* صفحات ذات صلة */}
            <div className="mb-8">
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

                <Link href={`/${l}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">⚖️</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {ui.fatwaPage}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {ui.fatwaPageDesc}
                    </p>
                  </div>
                </Link>

                <Link href={`/${l}/articles`} className="card card-interactive group flex items-center gap-3 p-5">
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

                <Link href={`/${l}/faq`} className="card card-interactive group flex items-center gap-3 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">❓</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {ui.faqPage}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {ui.faqPageDesc}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

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
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            📌 {ui.note}
          </p>
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
  value: string | number;
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