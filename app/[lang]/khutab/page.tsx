// app/[lang]/khutab/page.tsx
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

type Khutbah = {
  id: string;
  category: Localized;
  categoryIcon: string;
  gradient: string;
  title: Localized;
  intro: Localized;
  verse: Localized;
  verseSource: Localized;
  points: Localized[];
  khatima: Localized;
  icon: string;
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
    serviceTitle: string;
    serviceDesc: string;
    allCategory: string;
    khutabCount: string;
    selectHint: string;
    backToList: string;
    introLabel: string;
    pointsLabel: string;
    khatimaLabel: string;
    share: string;
    print: string;
    elementsCount: string;
    verse: string;
    verseSource: string;
    categoriesCount: string;
    sharable: string;
    printable: string;
    relatedTitle: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    dawahPage: string;
    dawahPageDesc: string;
    quranPage: string;
    quranPageDesc: string;
    heroVerse: string;
    heroVerseSource: string;
    noteTitle: string;
    note1: string;
    note2: string;
  }
> = {
  ar: {
    title: "مكتبة الخطب",
    subtitle: "خطب جمعة جاهزة للأئمة والدعاة",
    home: "الرئيسية",
    description:
      "مجموعة من الخطب المنهجية الجاهزة بخطوطها العريضة، يمكنك استخدامها أو الاستلهام منها في خطب الجمعة والمحاضرات.",
    serviceTitle: "خدمة للأئمة والدعاة",
    serviceDesc:
      "مجموعة من الخطب المنهجية الجاهزة، يمكنك استخدامها أو الاستلهام منها في خطبك. كل خطبة متكاملة بعناصرها وخاتمتها.",
    allCategory: "الكل",
    khutabCount: "خطبة",
    selectHint: "اختر الخطبة لعرض تفاصيلها",
    backToList: "العودة لقائمة الخطب",
    introLabel: "المقدمة",
    pointsLabel: "عناصر الخطبة",
    khatimaLabel: "الخاتمة والدعاء",
    share: "مشاركة الخطبة",
    print: "طباعة",
    elementsCount: "عناصر",
    verse: "الآية",
    verseSource: "المصدر",
    categoriesCount: "تصنيف",
    sharable: "قابلة للمشاركة",
    printable: "قابلة للطباعة",
    relatedTitle: "صفحات ذات صلة",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية متنوعة.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "أصول الدعوة ومهاراتها.",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع إلى كتاب الله.",
    heroVerse: "﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ ﴾",
    heroVerseSource: "سورة الجمعة — الآية 9",
    noteTitle: "تنبيه مهم",
    note1: "هذه الخطب للاسترشاد والاستلهام، والأولى أن يعدّ الإمام خطبته بما يناسب حال المصلين.",
    note2: "يُشترط في الخطبة أن تشتمل على الوصية بتقوى الله، ويُستحب الإتيان بآية قرآنية وحديث صحيح.",
  },
  en: {
    title: "Khutbah Library",
    subtitle: "Ready Friday sermons for Imams and Da'ees",
    home: "Home",
    description:
      "A collection of methodological ready-made khutbahs with outlines you can use or draw inspiration from for Friday sermons and lectures.",
    serviceTitle: "Service for Imams and Da'ees",
    serviceDesc:
      "A collection of methodological ready-made khutbahs you can use or draw inspiration from. Each khutbah is complete with elements and conclusion.",
    allCategory: "All",
    khutabCount: "Khutbahs",
    selectHint: "Select a khutbah to view details",
    backToList: "Back to Khutbah List",
    introLabel: "Introduction",
    pointsLabel: "Khutbah Elements",
    khatimaLabel: "Conclusion & Du'a",
    share: "Share Khutbah",
    print: "Print",
    elementsCount: "elements",
    verse: "Verse",
    verseSource: "Source",
    categoriesCount: "Categories",
    sharable: "Shareable",
    printable: "Printable",
    relatedTitle: "Related Pages",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Various fiqh questions.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "Principles and skills of dawah.",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to the Book of Allah.",
    heroVerse: "\"O you who have believed, when [the adhan] is called for the prayer on the day of Jumu'ah [Friday], then proceed to the remembrance of Allah.\"",
    heroVerseSource: "Surah Al-Jumu'ah — Verse 9",
    noteTitle: "Important Notice",
    note1: "These khutbahs are for inspiration and reference. It is better for the Imam to prepare a khutbah suited to his congregation's state.",
    note2: "A valid khutbah must include the counsel of taqwa, and it is recommended to include a Quranic verse and an authentic hadith.",
  },
};

// ============================================================
// بيانات الخطب
// ============================================================

const KHUTAB: Khutbah[] = [
  {
    id: "taqwa",
    category: { ar: "أخلاق", en: "Ethics" },
    categoryIcon: "🌿",
    gradient: "from-emerald-500 to-emerald-700",
    icon: "🌿",
    title: { ar: "التقوى: وصية الله للأولين والآخرين", en: "Taqwa: Allah's Counsel to All Generations" },
    intro: {
      ar: "﴿وَلَقَدْ وَصَّيْنَا الَّذِينَ أُوتُوا الْكِتَابَ مِن قَبْلِكُمْ وَإِيَّاكُمْ أَنِ اتَّقُوا اللَّهَ﴾. التقوى أن تجعل بينك وبين غضب الله وقاية بطاعته واجتناب معاصيه.",
      en: "We have certainly enjoined upon those who were given the Scripture before you and upon you to fear Allah. Taqwa is placing a shield between yourself and Allah's anger through obedience.",
    },
    verse: {
      ar: "وَلَقَدْ وَصَّيْنَا الَّذِينَ أُوتُوا الْكِتَابَ مِن قَبْلِكُمْ وَإِيَّاكُمْ أَنِ اتَّقُوا اللَّهَ",
      en: "And We have instructed those given Scripture before you and yourselves to fear Allah.",
    },
    verseSource: { ar: "سورة النساء — الآية 131", en: "Surah An-Nisa — Verse 131" },
    points: [
      { ar: "التقوى وصية الله للأولين والآخرين.", en: "Taqwa is Allah's counsel to all generations." },
      { ar: "ثمار التقوى في الدنيا والآخرة.", en: "Fruits of taqwa in this world and the hereafter." },
      { ar: "علامات المتقين في القرآن.", en: "Signs of the righteous in the Quran." },
      { ar: "كيف نحقق التقوى في حياتنا اليومية.", en: "How to achieve taqwa in our daily lives." },
    ],
    khatima: {
      ar: "اللهم اجعلنا من المتقين، واحشرنا في زمرتهم يوم الدين، وأوردنا حوض نبيك محمد ﷺ.",
      en: "O Allah, make us among the righteous, gather us in their company on the Day of Judgment, and let us drink from the basin of Your Prophet Muhammad ﷺ.",
    },
  },
  {
    id: "parents",
    category: { ar: "أسرة", en: "Family" },
    categoryIcon: "👨‍👩‍👧",
    gradient: "from-rose-500 to-rose-700",
    icon: "👨‍👩‍👧",
    title: { ar: "بر الوالدين: باب من أبواب الجنة", en: "Honoring Parents: A Gate of Paradise" },
    intro: {
      ar: "﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾. بر الوالدين من أعظم الطاعات وأحب الأعمال إلى الله بعد الصلاة على وقتها.",
      en: "Your Lord has decreed that you worship none but Him, and to parents, good treatment. Honoring parents is among the greatest acts of obedience after prayer on time.",
    },
    verse: {
      ar: "وَبِالْوَالِدَيْنِ إِحْسَانًا",
      en: "And to parents, good treatment.",
    },
    verseSource: { ar: "سورة الإسراء — الآية 23", en: "Surah Al-Isra — Verse 23" },
    points: [
      { ar: "فضل بر الوالدين في القرآن والسنة.", en: "Virtue of honoring parents in Quran and Sunnah." },
      { ar: "عقوق الوالدين من أكبر الكبائر.", en: "Disobedience to parents is among the greatest sins." },
      { ar: "كيف نبر الوالدين في حياتهما وبعد مماتهما.", en: "How to honor parents in life and after death." },
      { ar: "قصص من بر الصحابة بآبائهم.", en: "Stories of companions honoring their parents." },
    ],
    khatima: {
      ar: "اللهم ارحم والدينا كما ربونا صغارا، واغفر لهم وارحمهم، وأكرم نزلهم في جناتك.",
      en: "O Allah, have mercy on our parents as they raised us when we were small, forgive them, and honor them in Your gardens.",
    },
  },
  {
    id: "truthfulness",
    category: { ar: "أخلاق", en: "Ethics" },
    categoryIcon: "✅",
    gradient: "from-blue-500 to-blue-700",
    icon: "✅",
    title: { ar: "الصدق: طريق الجنة ومنجاة", en: "Truthfulness: Path to Paradise and Salvation" },
    intro: {
      ar: "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ﴾. الصدق منجاة، والكذب مهلكة، وهو طريق الأنبياء والصالحين.",
      en: "O you who have believed, fear Allah and be with those who are true. Truthfulness is salvation and lying is destruction - the path of prophets and righteous.",
    },
    verse: {
      ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ",
      en: "O you who have believed, fear Allah and be with those who are true.",
    },
    verseSource: { ar: "سورة التوبة — الآية 119", en: "Surah At-Tawbah — Verse 119" },
    points: [
      { ar: "الصدق طريق الجنة.", en: "Truthfulness leads to Paradise." },
      { ar: "أنواع الصدق: مع الله، مع الناس، مع النفس.", en: "Types of truthfulness: with Allah, people, and self." },
      { ar: "آفات الكذب وعواقبه.", en: "Harms of lying and its consequences." },
      { ar: "الصادقون في القرآن والسنة.", en: "The truthful in Quran and Sunnah." },
    ],
    khatima: {
      ar: "اللهم اجعلنا من الصادقين، وثبتنا على الحق حتى نلقاك، وارزقنا صحبة الصالحين.",
      en: "O Allah, make us among the truthful, keep us firm on truth until we meet You, and grant us the company of the righteous.",
    },
  },
  {
    id: "knowledge",
    category: { ar: "علم", en: "Knowledge" },
    categoryIcon: "📚",
    gradient: "from-indigo-500 to-indigo-700",
    icon: "📚",
    title: { ar: "فضل العلم وطلبه", en: "Virtue of Knowledge and Its Pursuit" },
    intro: {
      ar: "﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾. العلم فريضة على كل مسلم، وطلبه عبادة، والعلماء ورثة الأنبياء.",
      en: "Allah will raise those who have believed among you and those who were given knowledge, by degrees. Knowledge is obligatory for every Muslim, seeking it is worship, and scholars inherit the prophets.",
    },
    verse: {
      ar: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
      en: "Allah will raise those who have believed and those who were given knowledge, by degrees.",
    },
    verseSource: { ar: "سورة المجادلة — الآية 11", en: "Surah Al-Mujadila — Verse 11" },
    points: [
      { ar: "فضل طلب العلم في الإسلام.", en: "Virtue of seeking knowledge in Islam." },
      { ar: "أنواع العلوم: شرعية ودنيوية.", en: "Types of knowledge: religious and worldly." },
      { ar: "آداب طالب العلم.", en: "Etiquette of the student of knowledge." },
      { ar: "العلماء ورثة الأنبياء.", en: "Scholars are the inheritors of the prophets." },
    ],
    khatima: {
      ar: "اللهم علمنا ما ينفعنا، وانفعنا بما علمتنا، وزدنا علماً نافعاً وعملاً صالحاً متقبلاً.",
      en: "O Allah, teach us what benefits us, benefit us with what You taught us, and increase us in beneficial knowledge and accepted righteous deeds.",
    },
  },
  {
    id: "prayer",
    category: { ar: "عبادات", en: "Worship" },
    categoryIcon: "🕌",
    gradient: "from-amber-500 to-amber-700",
    icon: "🕌",
    title: { ar: "الصلاة: عمود الدين ونور المؤمن", en: "Prayer: Pillar of Religion and Believer's Light" },
    intro: {
      ar: "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾. الصلاة عمود الدين، وأول ما يحاسب عليه العبد يوم القيامة، وهي نور وبرهان ونجاة.",
      en: "Indeed, prayer has been decreed upon the believers a decree of specified times. Prayer is the pillar of religion, the first deed to be accounted for, and it is light, proof, and salvation.",
    },
    verse: {
      ar: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
      en: "Indeed, prayer prohibits immorality and wrongdoing.",
    },
    verseSource: { ar: "سورة العنكبوت — الآية 45", en: "Surah Al-Ankabut — Verse 45" },
    points: [
      { ar: "فضل الصلاة وأهميتها.", en: "Virtue and importance of prayer." },
      { ar: "حكم تارك الصلاة.", en: "Ruling on abandoning prayer." },
      { ar: "كيف نخشع في الصلاة.", en: "How to achieve humility in prayer." },
      { ar: "الصلاة نور وبرهان ونجاة.", en: "Prayer is light, proof, and salvation." },
    ],
    khatima: {
      ar: "اللهم أعنا على ذكرك وشكرك وحسن عبادتك، واجعلنا من المحافظين على الصلاة.",
      en: "O Allah, help us to remember You, thank You, and worship You well, and make us among those who guard their prayers.",
    },
  },
  {
    id: "repentance",
    category: { ar: "توبة", en: "Repentance" },
    categoryIcon: "🕊️",
    gradient: "from-purple-500 to-purple-700",
    icon: "🕊️",
    title: { ar: "التوبة: باب مفتوح لا يُغلق", en: "Repentance: An Open Gate" },
    intro: {
      ar: "﴿وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ﴾. باب التوبة مفتوح ما لم تطلع الشمس من مغربها، والله يفرح بتوبة عبده.",
      en: "And repent to Allah, all of you, O believers, that you might succeed. The gate of repentance is open until the sun rises from the west, and Allah rejoices at His servant's repentance.",
    },
    verse: {
      ar: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
      en: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.",
    },
    verseSource: { ar: "سورة الزمر — الآية 53", en: "Surah Az-Zumar — Verse 53" },
    points: [
      { ar: "الله يفرح بتوبة عبده.", en: "Allah rejoices at His servant's repentance." },
      { ar: "شروط التوبة النصوح.", en: "Conditions of sincere repentance." },
      { ar: "قصص التائبين في القرآن.", en: "Stories of the repentant in the Quran." },
      { ar: "لا تيأس من رحمة الله.", en: "Never despair of Allah's mercy." },
    ],
    khatima: {
      ar: "اللهم تب علينا إنك أنت التواب الرحيم، واغفر لنا ذنوبنا وإسرافنا في أمرنا.",
      en: "O Allah, accept our repentance, for You are the Accepter of Repentance, the Merciful. Forgive us our sins and excess in our affairs.",
    },
  },
];

// ============================================================
// المكون الرئيسي
// ============================================================

export default function KhutabPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const ui = UI[L];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // استخراج التصنيفات الفريدة
  const categories = useMemo(() => {
    const unique = new Set<string>();
    KHUTAB.forEach((k) => unique.add(k.category[L]));
    return Array.from(unique);
  }, [L]);

  const filteredKhutab = useMemo(() => {
    if (filter === "all") return KHUTAB;
    return KHUTAB.filter((k) => k.category[L] === filter);
  }, [filter, L]);

  const selectedKhutbah = selectedId ? KHUTAB.find((k) => k.id === selectedId) : null;

  // دالة المشاركة
  const handleShare = (khutbah: Khutbah) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: khutbah.title[L],
        text: khutbah.intro[L],
        url: typeof window !== "undefined" ? window.location.href : "",
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${khutbah.title[L]}\n\n${khutbah.intro[L]}\n\n${typeof window !== "undefined" ? window.location.href : ""}`
      );
    }
  };

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
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-amber-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-gold-800 dark:from-amber-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d97706, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">🎤 {ui.serviceTitle}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.serviceDesc}
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
          <StatCard icon="🎤" label={ui.khutabCount} value={KHUTAB.length} color="primary" />
          <StatCard icon="📂" label={ui.categoriesCount} value={categories.length} color="gold" />
          <StatCard icon="📤" label={ui.sharable} value="✓" color="primary" />
          <StatCard icon="🖨️" label={ui.printable} value="✓" color="gold" />
        </div>

        {!selectedKhutbah ? (
          <>
            {/* ===== الفلاتر ===== */}
            <div className="card mb-8 p-6 md:p-7">
              <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                📂 {isRTL ? "تصفية حسب التصنيف" : "Filter by Category"}
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilter("all")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                    filter === "all"
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700"
                  }`}
                >
                  <span>📚</span>
                  <span>{ui.allCategory}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    filter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                  }`}>
                    {KHUTAB.length}
                  </span>
                </button>

                {categories.map((category) => {
                  const isActive = filter === category;
                  const count = KHUTAB.filter((k) => k.category[L] === category).length;
                  const sampleKhutbah = KHUTAB.find((k) => k.category[L] === category);
                  const icon = sampleKhutbah?.categoryIcon ?? "📄";

                  return (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{category}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===== عنوان القائمة ===== */}
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                📜 {filteredKhutab.length} {ui.khutabCount}
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                💡 {ui.selectHint}
              </span>
            </div>

            {/* ===== قائمة الخطب ===== */}
            {filteredKhutab.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="mb-4 text-5xl">📭</div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {isRTL ? "لا توجد خطب" : "No khutbahs"}
                </h3>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredKhutab.map((khutbah) => (
                  <button
                    key={khutbah.id}
                    onClick={() => setSelectedId(khutbah.id)}
                    className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${khutbah.gradient} p-6 text-start text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                  >
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />

                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="text-4xl drop-shadow-lg">{khutbah.icon}</span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm">
                          {khutbah.categoryIcon} {khutbah.category[L]}
                        </span>
                      </div>

                      <h3
                        className="mb-3 text-xl font-black leading-tight"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {khutbah.title[L]}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/90">
                        {khutbah.intro[L]}
                      </p>

                      <div className="mb-4 rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                        <p
                          className="line-clamp-2 text-xs font-black"
                          style={{ fontFamily: "var(--font-quran)" }}
                          dir="rtl"
                        >
                          ﴿{khutbah.verse.ar}﴾
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/20 pt-3">
                        <span className="text-xs text-white/80">
                          {khutbah.points.length} {ui.elementsCount}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-black transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                          {isRTL ? "عرض الخطبة" : "View"}
                          <svg
                            width="16"
                            height="16"
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
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ===== تفاصيل الخطبة ===== */
          <div className="card relative overflow-hidden p-6 md:p-10">
            <div className={`gradient-primary absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${selectedKhutbah.gradient}`} />

            {/* زر العودة */}
            <button
              onClick={() => setSelectedId(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              {ui.backToList}
            </button>

            {/* رأس الخطبة */}
            <div className="mb-8 border-b-2 border-gold-200 pb-8 text-center dark:border-gold-800">
              <div className="mb-4 flex justify-center">
                <span className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${selectedKhutbah.gradient} text-4xl text-white shadow-xl`}>
                  {selectedKhutbah.icon}
                </span>
              </div>

              <span className="badge-primary mb-3">
                {selectedKhutbah.categoryIcon} {selectedKhutbah.category[L]}
              </span>

              <h2
                className="text-2xl font-black text-slate-900 md:text-4xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {selectedKhutbah.title[L]}
              </h2>
            </div>

            {/* المقدمة */}
            <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-night-700 dark:bg-night-800/40">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm dark:bg-primary-900/40">
                  🎯
                </span>
                <h3
                  className="text-xl font-black text-primary-700 dark:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.introLabel}
                </h3>
              </div>

              <p className="mb-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                {selectedKhutbah.intro[L]}
              </p>

              <div className="rounded-xl border-r-4 border-gold-500 bg-gold-50/60 p-4 dark:border-gold-400 dark:bg-gold-950/20 rtl:border-l-4 rtl:border-r-0">
                <p
                  className="text-lg font-black text-slate-900 md:text-xl dark:text-white"
                  style={{ fontFamily: "var(--font-quran)" }}
                  dir="rtl"
                >
                  ﴿{selectedKhutbah.verse.ar}﴾
                </p>
                <p className="mt-2 text-xs font-bold text-gold-700 dark:text-gold-300">
                  📖 {selectedKhutbah.verseSource[L]}
                </p>
              </div>
            </div>

            {/* العناصر */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm dark:bg-primary-900/40">
                  📋
                </span>
                <h3
                  className="text-xl font-black text-primary-700 dark:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.pointsLabel}
                </h3>
              </div>

              <div className="space-y-3">
                {selectedKhutbah.points.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-primary-200 dark:border-night-700 dark:bg-night-800/40 dark:hover:border-primary-800"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedKhutbah.gradient} font-black text-white shadow-md`}>
                      {index + 1}
                    </span>
                    <p className="pt-2 leading-relaxed text-slate-700 dark:text-slate-200">
                      {point[L]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* الخاتمة */}
            <div className={`mb-8 rounded-2xl bg-gradient-to-br ${selectedKhutbah.gradient} p-6 text-white shadow-lg`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm backdrop-blur-sm">
                  🤲
                </span>
                <h3
                  className="text-xl font-black"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.khatimaLabel}
                </h3>
              </div>

              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {selectedKhutbah.khatima[L]}
              </p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare(selectedKhutbah)}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {ui.share}
              </button>

              <button
                onClick={() => window.print()}
                className="btn-outline inline-flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                {ui.print}
              </button>
            </div>
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
            <Link href={`/${L}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
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

            <Link href={`/${L}/dawah-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🤝</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.dawahPageDesc}
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
          </div>
        </div>

        {/* ===== تنبيه مهم ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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
  icon, label, value, color,
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