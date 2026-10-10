// app/[lang]/women-fatwas/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";

// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string };

type Fatwa = {
  id: string;
  category: Localized;
  q: Localized;
  a: Localized;
  icon: string;
  verse?: string; // عربي فقط (نص قرآني ثابت)
  verseSource?: Localized;
  hadith?: string; // عربي فقط
  hadithSource?: Localized;
  gradient: string;
};

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
    searchPlaceholder: string;
    all: string;
    noResults: string;
    noResultsDesc: string;
    answer: string;
    verse: string;
    hadith: string;
    whyTitle: string;
    whyDesc: string;
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    relatedTitle: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    familyPage: string;
    familyPageDesc: string;
    fieldsPage: string;
    fieldsPageDesc: string;
    fatwasCount: string;
    categoriesCount: string;
    languages: string;
    freeAlways: string;
    heroVerse: string;
    heroVerseSource: string;
    heroIntro: string;
    heroIntroDesc: string;
    fatwaLabel: string;
    clickHint: string;
    clearSearch: string;
    clearFilter: string;
  }
> = {
  ar: {
    title: "فتاوى المرأة المسلمة",
    subtitle: "إجابات على أهم الأسئلة الفقهية الخاصة بالمرأة",
    home: "الرئيسية",
    description:
      "مجموعة فتاوى مهمة تهم كل امرأة مسلمة في عبادتها وحياتها اليومية: الصلاة، الحيض، الحجاب، الزواج، والعمل، بأدلة من القرآن والسنة.",
    searchPlaceholder: "ابحثي في الفتاوى...",
    all: "الكل",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّبي كلمة أخرى أو اختاري فئة مختلفة.",
    answer: "الإجابة",
    verse: "الدليل من القرآن",
    hadith: "الدليل من السنة",
    whyTitle: "لماذا فتاوى خاصة بالمرأة؟",
    whyDesc:
      "المرأة المسلمة لها أحكام فقهية خاصة في العبادات والمعاملات والأسرة، تحتاج إلى بيان واضح ومباشر.",
    why1Title: "خصوصية الأحكام",
    why1Desc: "الحيض والنفاس والحجاب وأحكام الزواج لها تفاصيل تحتاج عناية خاصة.",
    why2Title: "وضوح الإجابة",
    why2Desc: "إجابات مباشرة ومختصرة بدون تعقيد، مع ذكر الدليل من القرآن والسنة.",
    why3Title: "مراعاة الحال",
    why3Desc: "الفتاوى تراعي واقع المرأة المعاصرة وتحدياتها في العمل والأسرة.",
    noteTitle: "تنبيهات فقهية مهمة",
    note1:
      "هذه الفتاوى على المذهب السائد عند جمهور العلماء، وفي بعض المسائل خلاف معتبر.",
    note2:
      "يُنصح بالرجوع لعالم ثقة في المسائل الخاصة والمعقدة التي تحتاج تفصيلاً أكثر.",
    note3:
      "المحتوى للتوعية العامة، ولا يُغني عن دراسة الفقه دراسة منهجية من مصادره.",
    relatedTitle: "صفحات ذات صلة",
    fatwaPage: "الفتاوى العامة",
    fatwaPageDesc: "أسئلة فقهية في العبادات والمعاملات.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    familyPage: "مجالات الأسرة",
    familyPageDesc: "أحكام الأسرة والتربية.",
    fieldsPage: "مجالات المنصة",
    fieldsPageDesc: "17 مجالاً شرعياً متنوعاً.",
    fatwasCount: "فتوى",
    categoriesCount: "فئات",
    languages: "لغتان",
    freeAlways: "مجاني",
    heroVerse: "﴿ وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ ﴾",
    heroVerseSource: "سورة التوبة — الآية 71",
    heroIntro: "أختاه المسلمة",
    heroIntroDesc:
      "هذه مجموعة من الفتاوى المهمة التي تهم كل امرأة مسلمة في عبادتها وحياتها اليومية. اختاري القسم الذي يهمك وابحثي عن إجابتك.",
    fatwaLabel: "فتوى",
    clickHint: "اضغطي على أي فتوى لقراءة الإجابة",
    clearSearch: "مسح البحث",
    clearFilter: "مسح الفلتر",
  },
  en: {
    title: "Muslim Women's Fatwas",
    subtitle: "Answers to key fiqh questions specific to women",
    home: "Home",
    description:
      "A collection of important fatwas for every Muslim woman in her worship and daily life: prayer, menstruation, hijab, marriage, and work, with evidences from Quran and Sunnah.",
    searchPlaceholder: "Search fatwas...",
    all: "All",
    noResults: "No results found",
    noResultsDesc: "Try another keyword or choose a different category.",
    answer: "Answer",
    verse: "Quranic Evidence",
    hadith: "Prophetic Evidence",
    whyTitle: "Why Special Fatwas for Women?",
    whyDesc:
      "Muslim women have specific fiqh rulings in worship, transactions, and family matters that require clear and direct explanation.",
    why1Title: "Specificity of Rulings",
    why1Desc: "Menstruation, postpartum, hijab, and marriage rulings have details requiring special care.",
    why2Title: "Clarity of Answer",
    why2Desc: "Direct and concise answers without complexity, with evidences from Quran and Sunnah.",
    why3Title: "Considering Context",
    why3Desc: "The fatwas consider the reality of the modern woman and her challenges in work and family.",
    noteTitle: "Important Fiqh Notices",
    note1:
      "These fatwas follow the predominant view among the majority of scholars, and some issues have legitimate differences of opinion.",
    note2:
      "It is recommended to consult a trusted scholar for specific and complex matters requiring more detail.",
    note3:
      "The content is for general awareness and does not replace methodical study of fiqh from its sources.",
    relatedTitle: "Related Pages",
    fatwaPage: "General Fatwas",
    fatwaPageDesc: "Fiqh questions on worship and transactions.",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    familyPage: "Family Field",
    familyPageDesc: "Family and upbringing rulings.",
    fieldsPage: "Platform Fields",
    fieldsPageDesc: "17 diverse Islamic fields.",
    fatwasCount: "Fatwas",
    categoriesCount: "Categories",
    languages: "Languages",
    freeAlways: "Free",
    heroVerse: "\"The believing men and believing women are allies of one another.\"",
    heroVerseSource: "Surah At-Tawbah — Verse 71",
    heroIntro: "Dear Muslim Sister",
    heroIntroDesc:
      "This is a collection of important fatwas for every Muslim woman in her worship and daily life. Choose the category that interests you and find your answer.",
    fatwaLabel: "fatwas",
    clickHint: "Click any fatwa to read the answer",
    clearSearch: "Clear search",
    clearFilter: "Clear filter",
  },
};

// ============================================================
// الفتاوى
// ============================================================

const FATWAS: Fatwa[] = [
  {
    id: "women-prayer-mosque",
    icon: "🕌",
    gradient: "from-blue-500 to-blue-700",
    category: { ar: "الصلاة", en: "Prayer" },
    q: {
      ar: "هل تصلي المرأة في المسجد؟",
      en: "Can a woman pray in the mosque?",
    },
    a: {
      ar: "نعم، يجوز للمرأة أن تصلي في المسجد، ولا يجوز منعها. قال ﷺ: «لا تَمْنَعُوا إماءَ اللهِ مساجدَ اللهِ». لكن صلاتها في بيتها أفضل لها، وهذا من رحمة الإسلام بها وتيسيره عليها.",
      en: "Yes, a woman may pray in the mosque and should not be prevented. The Prophet ﷺ said: 'Do not prevent the female servants of Allah from the mosques of Allah.' However, her prayer at home is better for her, and this is from Islam's mercy and ease toward women.",
    },
    verse: "وَأَنْ أَقِيمُوا الصَّلَاةَ",
    verseSource: { ar: "سورة الأنعام — الآية 71", en: "Surah Al-An'am — Verse 71" },
  },
  {
    id: "women-leading-prayer",
    icon: "👩",
    gradient: "from-blue-500 to-blue-700",
    category: { ar: "الصلاة", en: "Prayer" },
    q: {
      ar: "هل يجوز للمرأة أن تؤم النساء؟",
      en: "Can a woman lead other women in prayer?",
    },
    a: {
      ar: "نعم، يجوز للمرأة أن تؤم النساء في الصلاة، وتقف في وسطهن لا في المقدمة. وقد أمت عائشة رضي الله عنها النساء. وهذا خاص بالنساء فقط.",
      en: "Yes, a woman may lead other women in prayer, standing in the middle of them, not in front. Aisha (may Allah be pleased with her) led women in prayer. This is specifically for women only.",
    },
  },
  {
    id: "menstruation-ramadan",
    icon: "🌙",
    gradient: "from-rose-500 to-rose-700",
    category: { ar: "الحيض", en: "Menstruation" },
    q: {
      ar: "ماذا تفعل الحائض في رمضان؟",
      en: "What should a menstruating woman do in Ramadan?",
    },
    a: {
      ar: "الحائض تفطر في رمضان وتقضي الأيام التي أفطرتها بعد رمضان. ولا تصلي ولا تصوم ولا تقرأ القرآن من المصحف أثناء الحيض، لكن تذكر الله وتدعو وتستمع للقرآن.",
      en: "A menstruating woman breaks her fast in Ramadan and makes up the missed days after Ramadan. She does not pray, fast, or read Quran from the mushaf during menstruation, but she may remember Allah, supplicate, and listen to Quran.",
    },
  },
  {
    id: "menstruation-quran",
    icon: "📖",
    gradient: "from-rose-500 to-rose-700",
    category: { ar: "الحيض", en: "Menstruation" },
    q: {
      ar: "هل يجوز للحائض قراءة القرآن عن ظهر قلب؟",
      en: "Can a menstruating woman recite Quran from memory?",
    },
    a: {
      ar: "اختلف العلماء، والراجح جواز القراءة عن ظهر قلب (بدون مس المصحف) للحاجة، كالمعلمة والطالبة. أما من غير حاجة فالأحوط الترك.",
      en: "Scholars differed, and the stronger view is that reciting from memory (without touching the mushaf) is permissible for a need, such as a teacher or student. Without a need, it is safer to abstain.",
    },
  },
  {
    id: "hijab-definition",
    icon: "👗",
    gradient: "from-purple-500 to-purple-700",
    category: { ar: "الحجاب", en: "Hijab" },
    q: {
      ar: "ما هو الحجاب الشرعي؟",
      en: "What is the Islamic hijab?",
    },
    a: {
      ar: "الحجاب الشرعي أن يغطي جميع بدن المرأة، لا يكون شفافاً ولا ضيقاً، ولا يكون زينة في نفسه، ولا يشبه لباس الرجال ولا لباس الكافرات. وهو فريضة على كل مسلمة بالغة.",
      en: "The Islamic hijab covers the entire body of a woman, is not transparent or tight, is not an adornment in itself, and does not resemble men's clothing or disbelievers' clothing. It is obligatory on every adult Muslim woman.",
    },
    verse: "يَا أَيُّهَا النَّبِيُّ قُل لِّأَزْوَاجِكَ وَبَنَاتِكَ وَنِسَاءِ الْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَابِيبِهِنَّ",
    verseSource: { ar: "سورة الأحزاب — الآية 59", en: "Surah Al-Ahzab — Verse 59" },
  },
  {
    id: "hijab-face-hands",
    icon: "👤",
    gradient: "from-purple-500 to-purple-700",
    category: { ar: "الحجاب", en: "Hijab" },
    q: {
      ar: "هل الوجه والكفان عورة؟",
      en: "Are the face and hands considered awrah?",
    },
    a: {
      ar: "اختلف العلماء: فالجمهور على أنهما ليسا بعورة ويجوز كشفهما، وذهب بعض العلماء إلى وجوب تغطيتهما. الأحوط والأبرأ للذمة التغطية خاصة في زمن الفتنة.",
      en: "Scholars differed: the majority say they are not awrah and may be uncovered, while some scholars say they must be covered. Covering is safer and more cautious, especially in times of tribulation.",
    },
  },
  {
    id: "marriage-work-condition",
    icon: "💍",
    gradient: "from-pink-500 to-pink-700",
    category: { ar: "الزواج", en: "Marriage" },
    q: {
      ar: "هل يجوز للمرأة أن تشترط العمل في عقد الزواج؟",
      en: "Can a woman stipulate working in the marriage contract?",
    },
    a: {
      ar: "نعم، يجوز للمرأة أن تشترط في عقد الزواج أن تعمل، أو أن لا يمنعها الزوج من الدراسة، ونحو ذلك. والمسلمون على شروطهم ما لم يحلوا حراماً أو يحرموا حلالاً.",
      en: "Yes, a woman may stipulate in the marriage contract that she works or that the husband does not prevent her from studying, and similar conditions. Muslims are bound by their conditions unless they make lawful what is unlawful or vice versa.",
    },
  },
  {
    id: "marriage-divorce-request",
    icon: "⚖️",
    gradient: "from-pink-500 to-pink-700",
    category: { ar: "الزواج", en: "Marriage" },
    q: {
      ar: "هل يجوز للمرأة أن تطلب الطلاق؟",
      en: "Can a woman request divorce?",
    },
    a: {
      ar: "نعم، يجوز لها أن تطلب الخلع إذا كرهت الزوج أو خافت أن لا تقيم حدود الله. والخلع فسخ بعوض، ولا يجوز لها طلب الطلاق من غير سبب شرعي.",
      en: "Yes, she may request khul' (divorce for compensation) if she dislikes her husband or fears she cannot observe Allah's limits. Khul' is dissolution with compensation. She may not request divorce without a legitimate reason.",
    },
    hadith: "أَيُّمَا امْرَأَةٍ سَأَلَتْ زَوْجَهَا طَلَاقًا فِي غَيْرِ مَا بَأْسٍ فَحَرَامٌ عَلَيْهَا رَائِحَةُ الْجَنَّةِ",
    hadithSource: { ar: "رواه أبو داود والترمذي", en: "Narrated by Abu Dawud and At-Tirmidhi" },
  },
  {
    id: "work-permissibility",
    icon: "💼",
    gradient: "from-emerald-500 to-emerald-700",
    category: { ar: "العمل", en: "Work" },
    q: {
      ar: "هل يجوز للمرأة أن تعمل؟",
      en: "Is it permissible for a woman to work?",
    },
    a: {
      ar: "نعم، يجوز للمرأة العمل بشروط: أن يكون العمل مشروعاً، لا اختلاط محرم، ولا خلوة، ولا سفر بلا محرم، ولا ترك لواجباتها. والأصل قرارها في البيت.",
      en: "Yes, a woman may work with conditions: the work must be lawful, no unlawful mixing, no seclusion with men, no travel without a mahram, and not neglecting her duties. Her original place is in the home.",
    },
    verse: "وَقَرْنَ فِي بُيُوتِكُنَّ",
    verseSource: { ar: "سورة الأحزاب — الآية 33", en: "Surah Al-Ahzab — Verse 33" },
  },
  {
    id: "work-travel-mahram",
    icon: "✈️",
    gradient: "from-emerald-500 to-emerald-700",
    category: { ar: "العمل", en: "Work" },
    q: {
      ar: "هل يجوز للمرأة أن تسافر بلا محرم؟",
      en: "Can a woman travel without a mahram?",
    },
    a: {
      ar: "الراجح من أقوال العلماء أن السفر الذي يقصر فيه الصلاة لا يجوز بلا محرم. أما السفر القصير (داخل المدينة) فلا حرج فيه. وهذا حفظ للمرأة وصون لها.",
      en: "The strongest scholarly view is that travel requiring shortened prayer is not permissible without a mahram. Short travel (within the city) has no harm. This is protection and preservation for women.",
    },
  },
];

// ============================================================
// المكون الرئيسي
// ============================================================

export default function WomenFatwasPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const ui = UI[L];

  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ===== الفئات الفريدة =====
  const categories = useMemo(() => {
    const unique = new Map<string, Localized>();
    FATWAS.forEach((f) => unique.set(f.category.ar, f.category));
    return Array.from(unique.values());
  }, []);

  // ===== الفلترة =====
  const filtered = useMemo(() => {
    return FATWAS.filter((f) => {
      const matchesCategory =
        filter === "all" || f.category.ar === filter || f.category.en === filter;

      if (!search.trim()) return matchesCategory;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        f.q.ar.toLowerCase().includes(q) ||
        f.q.en.toLowerCase().includes(q) ||
        f.a.ar.toLowerCase().includes(q) ||
        f.a.en.toLowerCase().includes(q) ||
        f.category.ar.toLowerCase().includes(q) ||
        f.category.en.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [filter, search]);

  // ===== عدادات الفئات =====
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FATWAS.length };
    categories.forEach((cat) => {
      counts[cat.ar] = FATWAS.filter((f) => f.category.ar === cat.ar).length;
    });
    return counts;
  }, [categories]);

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
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
        <div className="card relative mb-8 overflow-hidden border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-cream-dark to-rose-50 p-8 md:p-12 dark:border-pink-800 dark:from-pink-950/30 dark:via-gray-900 dark:to-rose-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          {/* زخارف */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-800/20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-800/20" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #ec4899, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🌸 {ui.heroIntro}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.heroIntroDesc}
            </p>

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.heroVerse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.heroVerseSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📜" label={ui.fatwasCount} value={FATWAS.length} color="primary" />
          <StatCard icon="📂" label={ui.categoriesCount} value={categories.length} color="gold" />
          <StatCard icon="🌍" label={ui.languages} value={2} color="primary" />
          <StatCard icon="✨" label={ui.freeAlways} value="100%" color="gold" />
        </div>

        {/* ===== لماذا فتاوى خاصة ===== */}
        <div className="card mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-3 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💡 {ui.whyTitle}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.whyDesc}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <WhyCard
                icon="🎯"
                title={ui.why1Title}
                description={ui.why1Desc}
                color="from-pink-500 to-pink-600"
              />
              <WhyCard
                icon="💎"
                title={ui.why2Title}
                description={ui.why2Desc}
                color="from-rose-500 to-rose-600"
              />
              <WhyCard
                icon="🌸"
                title={ui.why3Title}
                description={ui.why3Desc}
                color="from-purple-500 to-purple-600"
              />
            </div>
          </div>
        </div>

        {/* ===== البحث ===== */}
        <div className="card mb-6 p-5">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ui.searchPlaceholder}
              className="input-islamic !ps-12"
              aria-label={ui.searchPlaceholder}
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              ✕ {ui.clearSearch}
            </button>
          )}
        </div>

        {/* ===== الفلاتر ===== */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                : "border border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
            }`}
          >
            <span>🌸</span>
            <span>{ui.all}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
              }`}
            >
              {categoryCounts.all}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = filter === cat.ar;
            const count = categoryCounts[cat.ar] || 0;
            const sampleFatwa = FATWAS.find((f) => f.category.ar === cat.ar);
            const icon = sampleFatwa?.icon || "📄";

            return (
              <button
                key={cat.ar}
                onClick={() => setFilter(cat.ar)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
                }`}
              >
                <span>{icon}</span>
                <span>{cat[L]}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===== العنوان ===== */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📜 {filtered.length} {ui.fatwaLabel}
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            💡 {ui.clickHint}
          </span>
        </div>

        {/* ===== لا توجد نتائج ===== */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {search && (
                <button onClick={() => setSearch("")} className="btn-outline">
                  ✕ {ui.clearSearch}
                </button>
              )}
              {filter !== "all" && (
                <button onClick={() => setFilter("all")} className="btn-primary">
                  🌸 {ui.all}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((f) => {
              const isOpen = openId === f.id;

              return (
                <article
                  key={f.id}
                  className="card group overflow-hidden transition-all hover:shadow-xl"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="flex w-full items-start gap-4 p-6 text-start transition-colors hover:bg-slate-50 dark:hover:bg-night-800"
                    aria-expanded={isOpen}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${f.gradient} text-2xl text-white shadow-md`}
                    >
                      {f.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full bg-gradient-to-r ${f.gradient} px-3 py-0.5 text-xs font-black text-white`}
                        >
                          {f.category[L]}
                        </span>
                      </div>

                      <h3
                        className="mb-1 text-lg font-black text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {f.q[L]}
                      </h3>

                      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {f.a[L]}
                      </p>
                    </div>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-lg font-black text-pink-700 transition-transform dark:bg-pink-900/40 dark:text-pink-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 p-6 pt-4 dark:border-night-700">
                      {/* الإجابة */}
                      <div className="mb-4 rounded-2xl border-r-4 border-pink-500 bg-pink-50 p-5 dark:border-pink-400 dark:bg-pink-950/20 rtl:border-l-4 rtl:border-r-0">
                        <p className="mb-2 text-sm font-black text-pink-700 dark:text-pink-300">
                          💡 {ui.answer}
                        </p>
                        <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                          {f.a[L]}
                        </p>
                      </div>

                      {/* الدليل القرآني */}
                      {f.verse && (
                        <div className="mb-3 rounded-2xl border-r-4 border-gold-500 bg-gold-50/60 p-4 dark:border-gold-400 dark:bg-gold-950/20 rtl:border-l-4 rtl:border-r-0">
                          <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-300">
                            📖 {ui.verse}
                          </p>
                          <p
                            className="text-lg font-black text-slate-900 dark:text-white"
                            style={{ fontFamily: "var(--font-quran)" }}
                            dir="rtl"
                          >
                            ﴿{f.verse}﴾
                          </p>
                          {f.verseSource && (
                            <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">
                              {f.verseSource[L]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* الدليل النبوي */}
                      {f.hadith && (
                        <div className="rounded-2xl border-r-4 border-emerald-500 bg-emerald-50 p-4 dark:border-emerald-400 dark:bg-emerald-950/20 rtl:border-l-4 rtl:border-r-0">
                          <p className="mb-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                            🌙 {ui.hadith}
                          </p>
                          <p
                            className="text-base font-black text-slate-900 dark:text-white"
                            style={{ fontFamily: "var(--font-amiri)" }}
                            dir="rtl"
                          >
                            «{f.hadith}»
                          </p>
                          {f.hadithSource && (
                            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                              📜 {f.hadithSource[L]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${L}/fatwa`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ⚖️
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fatwaPageDesc}
                </p>
              </div>
            </Link>

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
              href={`/${L}/fields/family`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                👨‍👩‍👧
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.familyPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.familyPageDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${L}/fields`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📚
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fieldsPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fieldsPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيهات فقهية ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              ⚠️
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

// ============================================================
// مكون WhyCard
// ============================================================

function WhyCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:border-night-700 dark:bg-night-800/40">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl text-white shadow-md`}
        >
          {icon}
        </span>
        <h3
          className="text-base font-black text-slate-900 dark:text-white"
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