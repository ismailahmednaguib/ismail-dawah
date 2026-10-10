// app/[lang]/daily-wird/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DailyWirdClient from "./DailyWirdClient";

// ============================================================
// الأنواع
// ============================================================

type WirdTask = {
  id: string;
  icon: string;
  ar: string;
  en: string;
  href?: string;
  hrefLabelAr?: string;
  hrefLabelEn?: string;
};

type WirdDay = {
  id: string;
  ar: string;
  en: string;
  icon: string;
  tasks: WirdTask[];
};

// ============================================================
// بيانات الورد اليومي
// ============================================================

const DAYS: WirdDay[] = [
  {
    id: "saturday",
    ar: "السبت", en: "Saturday", icon: "🌅",
    tasks: [
      { id: "saturday-quran", icon: "📖", ar: "اقرأ وردك من القرآن الكريم ولو صفحة واحدة", en: "Read your Quran portion, even one page", href: "/quran", hrefLabelAr: "القرآن", hrefLabelEn: "Quran" },
      { id: "saturday-morning-adhkar", icon: "🤲", ar: "قل أذكار الصباح", en: "Say morning adhkar", href: "/adhkar", hrefLabelAr: "الأذكار", hrefLabelEn: "Adhkar" },
      { id: "saturday-tasbih", icon: "📿", ar: "سبح 33 تسبيحة على الأقل", en: "Say at least 33 tasbih", href: "/tasbih", hrefLabelAr: "المسبحة", hrefLabelEn: "Tasbih" },
      { id: "saturday-prayer", icon: "🕌", ar: "حافظ على الصلاة في وقتها", en: "Pray on time", href: "/prayer-times", hrefLabelAr: "المواقيت", hrefLabelEn: "Times" },
    ],
  },
  {
    id: "sunday",
    ar: "الأحد", en: "Sunday", icon: "📚",
    tasks: [
      { id: "sunday-memorize", icon: "🎯", ar: "احفظ آية أو أكثر وراجعها", en: "Memorize one or more ayahs and revise them", href: "/quran-memorization", hrefLabelAr: "خطة الحفظ", hrefLabelEn: "Plan" },
      { id: "sunday-prophet-story", icon: "🧠", ar: "اقرأ قصة نبي واستخرج درسًا واحدًا", en: "Read a prophet story and extract one lesson", href: "/prophets-stories", hrefLabelAr: "القصص", hrefLabelEn: "Stories" },
      { id: "sunday-evening-adhkar", icon: "🌙", ar: "قل أذكار المساء", en: "Say evening adhkar", href: "/adhkar", hrefLabelAr: "الأذكار", hrefLabelEn: "Adhkar" },
      { id: "sunday-dua", icon: "🤲", ar: "ادعُ الله بأدعية القرآن والسنة", en: "Make du'a with Quranic and prophetic supplications", href: "/ruqyah", hrefLabelAr: "الأدعية", hrefLabelEn: "Du'a" },
    ],
  },
  {
    id: "monday",
    ar: "الاثنين", en: "Monday", icon: "💧",
    tasks: [
      { id: "monday-quran-listen", icon: "🎧", ar: "استمع إلى تلاوة قرآن بصوت مطمئن", en: "Listen to a calm Quran recitation", href: "/quran", hrefLabelAr: "القرآن", hrefLabelEn: "Quran" },
      { id: "monday-istighfar", icon: "🔁", ar: "أكثِر من الاستغفار", en: "Increase istighfar", href: "/tasbih", hrefLabelAr: "المسبحة", hrefLabelEn: "Tasbih" },
      { id: "monday-sadaqah", icon: "💝", ar: "تصدق ولو بالقليل أو بكلمة طيبة", en: "Give charity, even small or with a kind word" },
      { id: "monday-family", icon: "👨‍👩‍👧‍👦", ar: "ذكّر أهلك بخير أو علمهم شيئًا", en: "Remind your family with good or teach them something" },
    ],
  },
  {
    id: "tuesday",
    ar: "الثلاثاء", en: "Tuesday", icon: "⚖️",
    tasks: [
      { id: "tuesday-fatwa", icon: "❓", ar: "تعلم حكمًا شرعيًا تحتاجه في يومك", en: "Learn a practical Islamic ruling", href: "/fatwa", hrefLabelAr: "الفتاوى", hrefLabelEn: "Fatwas" },
      { id: "tuesday-review", icon: "🔂", ar: "راجع محفوظك السابق", en: "Revise previous memorization", href: "/quran-memorization", hrefLabelAr: "الحفظ", hrefLabelEn: "Memorization" },
      { id: "tuesday-gratitude", icon: "🌿", ar: "اشكر الله على ثلاث نعم", en: "Thank Allah for three blessings" },
      { id: "tuesday-salawat", icon: "🕊️", ar: "صلِّ على النبي ﷺ مئة مرة", en: "Send 100 blessings upon the Prophet ﷺ", href: "/tasbih", hrefLabelAr: "المسبحة", hrefLabelEn: "Tasbih" },
    ],
  },
  {
    id: "wednesday",
    ar: "الأربعاء", en: "Wednesday", icon: "🧭",
    tasks: [
      { id: "wednesday-quran-reflection", icon: "💡", ar: "تدبر في آية واحدة واكتب تفسيرها المختصر", en: "Reflect on one ayah and write a short insight", href: "/quran", hrefLabelAr: "القرآن", hrefLabelEn: "Quran" },
      { id: "wednesday-qibla", icon: "🕋", ar: "تأكد من اتجاه القبلة في مصلاك", en: "Check your prayer direction", href: "/qibla", hrefLabelAr: "القبلة", hrefLabelEn: "Qibla" },
      { id: "wednesday-health", icon: "🏃", ar: "حافظ على صحتك فإن للمؤمن قوة", en: "Take care of your health; a believer should be strong" },
      { id: "wednesday-good-deed", icon: "✨", ar: "اصنع معروفًا اليوم", en: "Do a good deed today" },
    ],
  },
  {
    id: "thursday",
    ar: "الخميس", en: "Thursday", icon: "📖",
    tasks: [
      { id: "thursday-kahf", icon: "📜", ar: "اقرأ سورة الكهف", en: "Read Surah Al-Kahf", href: "/quran/18", hrefLabelAr: "الكهف", hrefLabelEn: "Al-Kahf" },
      { id: "thursday-dua-accepted", icon: "🤲", ar: "اغتنم ساعة الإجابة يوم الجمعة بالدعاء", en: "Prepare for Friday's hour of response with du'a" },
      { id: "thursday-revision", icon: "🔁", ar: "راجع وردك الأسبوعي", en: "Review your weekly portion", href: "/quran-memorization", hrefLabelAr: "المراجعة", hrefLabelEn: "Revision" },
      { id: "thursday-charity", icon: "💰", ar: "جهّز صدقة الجمعة", en: "Prepare Friday charity" },
    ],
  },
  {
    id: "friday",
    ar: "الجمعة", en: "Friday", icon: "🕌",
    tasks: [
      { id: "friday-ghusl", icon: "💧", ar: "اغتسل للجمعة وتطيب ولبس أحسن ثيابك", en: "Perform ghusl, wear clean good clothes" },
      { id: "friday-salah", icon: "🕌", ar: "اشهد صلاة الجمعة مبكرًا", en: "Attend Jumu'ah prayer early", href: "/prayer-times", hrefLabelAr: "المواقيت", hrefLabelEn: "Times" },
      { id: "friday-salawat", icon: "🕊️", ar: "أكثِر من الصلاة على النبي ﷺ", en: "Increase salawat upon the Prophet ﷺ", href: "/tasbih", hrefLabelAr: "المسبحة", hrefLabelEn: "Tasbih" },
      { id: "friday-dua-hour", icon: "⏳", ar: "ادعُ في ساعة الإجابة بعد العصر", en: "Make du'a in the hour of response after Asr" },
      { id: "friday-kahf", icon: "📜", ar: "اقرأ سورة الكهف", en: "Read Surah Al-Kahf", href: "/quran/18", hrefLabelAr: "الكهف", hrefLabelEn: "Al-Kahf" },
    ],
  },
];

// ============================================================
// نصوص الواجهة (للـ Client Component)
// ============================================================

const CLIENT_UI: Record<Lang, any> = {
  ar: {
    searchPlaceholder: "ابحث في مهام الورد...",
    search: "بحث",
    clearSearch: "مسح البحث",
    resetProgress: "تصفير التقدم",
    results: "عدد المهام",
    of: "من",
    noResults: "لا توجد مهام مطابقة",
    noResultsDesc: "جرّب كلمة أخرى أو اختر يومًا مختلفًا.",
    weeklyProgress: "التقدم الأسبوعي",
    dayProgress: "تقدم اليوم",
    completed: "مكتملة",
    pending: "متبقية",
    open: "فتح",
    markDone: "علّم كمكتملة",
    markUndone: "إلغاء الإكمال",
    allDays: "كل الأسبوع",
    note: "تقدمك يُحفظ تلقائيًا على جهازك، ويُعاد تعيينه يوميًا لبدء يوم جديد.",
    tipTitle: "نصائح للالتزام بالورد",
    tips: [
      "ابدأ بالمهمة الأسهل حتى تكسر حاجز التسويف.",
      "اربط الورد بوقت ثابت يوميًا مثل بعد الفجر.",
      "لا تجعل الهدف كبيرًا حتى لا تنقطع.",
      "راجع تقدمك كل جمعة وادعُ الله بالاستمرار.",
    ],
    celebration: "ما شاء الله! 🎉",
    celebrationDesc: "لقد أتممت جميع مهام اليوم. تقبل الله منك وزادك حرصًا.",
    todayProgress: "تقدم اليوم",
    streakTitle: "أيام متتالية",
    streakDesc: "استمر!",
    totalDone: "المنجز",
    today: "اليوم",
  },
  en: {
    searchPlaceholder: "Search wird tasks...",
    search: "Search",
    clearSearch: "Clear search",
    resetProgress: "Reset progress",
    results: "Tasks",
    of: "of",
    noResults: "No matching tasks",
    noResultsDesc: "Try another word or choose a different day.",
    weeklyProgress: "Weekly progress",
    dayProgress: "Day progress",
    completed: "Completed",
    pending: "Remaining",
    open: "Open",
    markDone: "Mark as done",
    markUndone: "Undo completion",
    allDays: "Full week",
    note: "Your progress is saved automatically on your device and resets daily for a fresh start.",
    tipTitle: "Tips for staying consistent",
    tips: [
      "Start with the easiest task to break procrastination.",
      "Attach your wird to a fixed daily time, such as after Fajr.",
      "Do not set an overly large goal that leads to burnout.",
      "Review your progress every Friday and ask Allah for consistency.",
    ],
    celebration: "MashaAllah! 🎉",
    celebrationDesc: "You completed all tasks for today. May Allah accept it from you.",
    todayProgress: "Today's progress",
    streakTitle: "Day streak",
    streakDesc: "Keep it up!",
    totalDone: "Completed",
    today: "Today",
  },
};

// ============================================================
// نصوص Metadata
// ============================================================

const META_UI: Record<Lang, {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  verse: string;
  verseSource: string;
}> = {
  ar: {
    title: "الورد اليومي",
    subtitle: "خطة أسبوعية بسيطة للقرآن والذكر والعمل الصالح",
    home: "الرئيسية",
    description: "صفحة الورد اليومي تساعدك على تنظيم علاقتك بالقرآن والأذكار والعمل الصالح خلال الأسبوع، مع متابعة تقدمك بشكل بسيط.",
    verse: "﴿ وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ ﴾",
    verseSource: "سورة الحجر — الآية 99",
  },
  en: {
    title: "Daily Wird",
    subtitle: "A simple weekly plan for Quran, dhikr, and good deeds",
    home: "Home",
    description: "The daily wird page helps you organize your relationship with the Quran, adhkar, and good deeds throughout the week with simple progress tracking.",
    verse: "\"And worship your Lord until there comes to you the certainty (death).\"",
    verseSource: "Surah Al-Hijr — Verse 99",
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
  if (lang !== "ar" && lang !== "en") return {};

  const l = lang as Lang;
  const ui = META_UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/daily-wird`,
      languages: { ar: "/ar/daily-wird", en: "/en/daily-wird" },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/daily-wird`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: ui.title }],
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

export default async function DailyWirdPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "ar" && lang !== "en") notFound();

  const l = lang as Lang;
  const ui = META_UI[l];
  const isRTL = l === "ar";
  const totalTasks = DAYS.flatMap((d) => d.tasks).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: ui.title,
    description: ui.description,
    inLanguage: l,
    url: `/${l}/daily-wird`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalTasks,
      itemListElement: DAYS.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: isRTL ? day.ar : day.en,
        itemListElement: day.tasks.map((task, tIndex) => ({
          "@type": "ListItem",
          position: tIndex + 1,
          name: isRTL ? task.ar : task.en,
        })),
      })),
    },
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

      {/* ===== Hero محسّن ===== */}
      <section className="container-page pt-10 md:pt-14">
        <div className="card relative mb-8 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">📅 {isRTL ? "خطة أسبوعية" : "Weekly Plan"}</span>

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
            <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
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
          </div>
        </div>
      </section>

      {/* ===== Client Component ===== */}
      <DailyWirdClient
        lang={l}
        isRTL={isRTL}
        DAYS={DAYS}
        UI={CLIENT_UI[l]}
      />

      <Footer lang={l} />
    </main>
  );
}