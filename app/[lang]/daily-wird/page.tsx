// app/[lang]/daily-wird/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n";

import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate, toolFallbackMessage } from "@/lib/page-sections";
import ToolUnavailablePage from "@/components/ToolUnavailablePage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero, Callout } from "@/components/ui";
import DailyWirdClient from "./DailyWirdClient";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

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
      { id: "tuesday-gratitude", icon: "✦", ar: "اشكر الله على ثلاث نعم", en: "Thank Allah for three blessings" },
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

const CLIENT_UI: Record<string, any> = {
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

const META_UI: Record<string, {
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
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/daily-wird`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{ url: `/og/og-${l}.png`, width: 1200, height: 630, alt: ui.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: [`/og/og-${l}.png`],
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
  const __pageSettings = await getSiteSettings();
  const controls = buildPageControls(__pageSettings as Record<string, unknown>);
  const gate = pageGate(controls, "daily-wird", l);
  if (!gate.pageVisible) return <ToolUnavailablePage lang={l} message={toolFallbackMessage(controls, "daily-wird", l)} />;
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
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      {gate.visible('k0') && (
        <PageHero
          icon="📅"
          badge={isRTL ? "📅 خطة أسبوعية" : "📅 Weekly Plan"}
          title={ui.title}
          subtitle={ui.description}
          crumbs={[
            { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
            { label: ui.title },
          ]}
        >
          <div className="mt-7">
            <Callout icon="🕌" tone="gold">
              <p
                className="text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">{ui.verseSource}</p>
            </Callout>
          </div>
        </PageHero>
      )}
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

