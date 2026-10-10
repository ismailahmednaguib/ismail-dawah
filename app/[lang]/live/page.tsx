// app/[lang]/live/page.tsx
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

type ScheduleItem = {
  id: string;
  day: Localized;
  time: Localized;
  topic: Localized;
  place: Localized;
  icon: string;
};

type LiveSettings = {
  liveUrl: string;
  liveTitle: Localized;
  meetingDay: Localized;
  meetingTime: Localized;
  meetingPlace: Localized;
  meetingLink: string;
};

// ============================================================
// بيانات احتياطية (fallback في حال فشل getContent)
// ============================================================

const FALLBACK_SETTINGS: LiveSettings = {
  liveUrl: "https://www.youtube.com/@IsmailAhmedNaguib/live",
  liveTitle: {
    ar: "البث المباشر",
    en: "Live Stream",
  },
  meetingDay: { ar: "الجمعة", en: "Friday" },
  meetingTime: { ar: "بعد صلاة المغرب", en: "After Maghrib Prayer" },
  meetingPlace: { ar: "مسجد الرحمن — القاهرة", en: "Ar-Rahman Mosque — Cairo" },
  meetingLink: "https://maps.google.com",
};

const FALLBACK_SCHEDULE: ScheduleItem[] = [
  {
    id: "tafsir",
    icon: "📖",
    day: { ar: "السبت", en: "Saturday" },
    time: { ar: "بعد العشاء", en: "After Isha" },
    topic: { ar: "تفسير جزء عم", en: "Tafsir of Juz Amma" },
    place: { ar: "مسجد الرحمن", en: "Ar-Rahman Mosque" },
  },
  {
    id: "aqeedah",
    icon: "🕌",
    day: { ar: "الأحد", en: "Sunday" },
    time: { ar: "بعد المغرب", en: "After Maghrib" },
    topic: { ar: "شرح العقيدة الواسطية", en: "Explanation of Al-Aqeedah Al-Wasitiyyah" },
    place: { ar: "مسجد الرحمن", en: "Ar-Rahman Mosque" },
  },
  {
    id: "seerah",
    icon: "🌙",
    day: { ar: "الاثنين", en: "Monday" },
    time: { ar: "بعد العشاء", en: "After Isha" },
    topic: { ar: "السيرة النبوية", en: "Prophetic Biography" },
    place: { ar: "مسجد الرحمن", en: "Ar-Rahman Mosque" },
  },
  {
    id: "hadith",
    icon: "📜",
    day: { ar: "الأربعاء", en: "Wednesday" },
    time: { ar: "بعد المغرب", en: "After Maghrib" },
    topic: { ar: "شرح الأربعين النووية", en: "Explanation of An-Nawawi's 40 Hadith" },
    place: { ar: "مسجد الرحمن", en: "Ar-Rahman Mosque" },
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
    watchLive: string;
    liveNow: string;
    weeklyMeeting: string;
    weeklyMeetingDesc: string;
    day: string;
    time: string;
    place: string;
    viewMap: string;
    weeklySchedule: string;
    weeklyScheduleDesc: string;
    noSchedule: string;
    noteTitle: string;
    note1: string;
    note2: string;
    liveCount: string;
    meetingCount: string;
    lessonsCount: string;
    freeAlways: string;
    verse: string;
    verseSource: string;
    hadith: string;
    hadithSource: string;
    relatedTitle: string;
    quranPage: string;
    quranPageDesc: string;
    articlesPage: string;
    articlesPageDesc: string;
    khutabPage: string;
    khutabPageDesc: string;
    contactPage: string;
    contactPageDesc: string;
    liveUnavailable: string;
    liveUnavailableDesc: string;
    offlineNotice: string;
  }
> = {
  ar: {
    title: "البث المباشر والمجالس",
    subtitle: "تابع دروس الشيخ ومجالسه الأسبوعية",
    home: "الرئيسية",
    description:
      "صفحة البث المباشر لمنصة إسماعيل أحمد نجيب الدعوية. تابع الدروس الحية والمجلس الأسبوعي وجدول الدروس الأسبوعية.",
    watchLive: "شاهد البث المباشر",
    liveNow: "مباشر الآن",
    weeklyMeeting: "المجلس الأسبوعي",
    weeklyMeetingDesc: "موعد ثابت كل أسبوع للقاء والدروس",
    day: "اليوم",
    time: "الوقت",
    place: "المكان",
    viewMap: "عرض الموقع على الخريطة",
    weeklySchedule: "جدول الدروس الأسبوعي",
    weeklyScheduleDesc: "دروس ثابتة خلال الأسبوع",
    noSchedule: "لا يوجد دروس مجدولة حالياً",
    noteTitle: "تنبيه مهم",
    note1: "قد يتأخر البث المباشر أو يُؤجل بسبب ظروف طارئة. تابع الصفحة أو وسائل التواصل للمواعيد الدقيقة.",
    note2: "المواعيد والأماكن قد تتغير في المناسبات أو الإجازات، يُفضل التأكد قبل الحضور.",
    liveCount: "بث مباشر",
    meetingCount: "مجلس أسبوعي",
    lessonsCount: "دروس",
    freeAlways: "مجاني دائماً",
    verse: "﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾",
    verseSource: "سورة الذاريات — الآية 55",
    hadith: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    hadithSource: "رواه مسلم",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع لكتاب الله.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات دعوية وتربوية.",
    khutabPage: "مكتبة الخطب",
    khutabPageDesc: "خطب جمعة للأئمة والدعاة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار عن المواعيد.",
    liveUnavailable: "البث غير متاح حالياً",
    liveUnavailableDesc: "سيبدأ البث المباشر في الموعد المحدد. ترقب الإعلانات.",
    offlineNotice: "تحقق من اتصالك بالإنترنت",
  },
  en: {
    title: "Live Stream & Gatherings",
    subtitle: "Follow the Sheikh's lessons and weekly gatherings",
    home: "Home",
    description:
      "Live stream page of the Ismail Ahmed Naguib Dawah Platform. Watch live lessons, weekly gatherings, and the weekly lessons schedule.",
    watchLive: "Watch Live Stream",
    liveNow: "LIVE NOW",
    weeklyMeeting: "Weekly Meeting",
    weeklyMeetingDesc: "A fixed weekly appointment for gatherings and lessons",
    day: "Day",
    time: "Time",
    place: "Location",
    viewMap: "View Location on Map",
    weeklySchedule: "Weekly Lessons Schedule",
    weeklyScheduleDesc: "Fixed lessons throughout the week",
    noSchedule: "No scheduled lessons currently",
    noteTitle: "Important Notice",
    note1: "Live stream may be delayed or postponed due to unexpected circumstances. Follow the page or social media for exact timings.",
    note2: "Times and locations may change during occasions or holidays. Please verify before attending.",
    liveCount: "Live Stream",
    meetingCount: "Weekly Meeting",
    lessonsCount: "Lessons",
    freeAlways: "Always Free",
    verse: "\"And remind, for indeed, the reminder benefits the believers.\"",
    verseSource: "Surah Adh-Dhariyat — Verse 55",
    hadith: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    hadithSource: "Narrated by Muslim",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to Allah's Book.",
    articlesPage: "Articles",
    articlesPageDesc: "Dawah and educational articles.",
    khutabPage: "Khutbah Library",
    khutabPageDesc: "Friday sermons for Imams.",
    contactPage: "Contact Us",
    contactPageDesc: "For schedule inquiries.",
    liveUnavailable: "Live stream is currently unavailable",
    liveUnavailableDesc: "The live stream will start at the scheduled time. Watch for announcements.",
    offlineNotice: "Check your internet connection",
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
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/live`,
      languages: {
        ar: "/ar/live",
        en: "/en/live",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/live`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "video.episode",
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

export default async function LivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  // محاولة جلب البيانات من Supabase، مع fallback
  let settings: LiveSettings = FALLBACK_SETTINGS;
  let schedule: ScheduleItem[] = FALLBACK_SCHEDULE;

  try {
    const { getContent } = await import("@/lib/content");
    const c = await getContent();

    if (c?.settings) {
      settings = {
        liveUrl: c.settings.liveUrl || FALLBACK_SETTINGS.liveUrl,
        liveTitle: {
          ar: c.settings.liveTitle?.ar || FALLBACK_SETTINGS.liveTitle.ar,
          en: c.settings.liveTitle?.en || FALLBACK_SETTINGS.liveTitle.en,
        },
        meetingDay: {
          ar: c.settings.meetingDay?.ar || c.settings.meetingDay || FALLBACK_SETTINGS.meetingDay.ar,
          en: c.settings.meetingDay?.en || c.settings.meetingDay || FALLBACK_SETTINGS.meetingDay.en,
        },
        meetingTime: {
          ar: c.settings.meetingTime?.ar || c.settings.meetingTime || FALLBACK_SETTINGS.meetingTime.ar,
          en: c.settings.meetingTime?.en || c.settings.meetingTime || FALLBACK_SETTINGS.meetingTime.en,
        },
        meetingPlace: {
          ar: c.settings.meetingPlace?.ar || c.settings.meetingPlace || FALLBACK_SETTINGS.meetingPlace.ar,
          en: c.settings.meetingPlace?.en || c.settings.meetingPlace || FALLBACK_SETTINGS.meetingPlace.en,
        },
        meetingLink: c.settings.meetingLink || FALLBACK_SETTINGS.meetingLink,
      };
    }

    if (c?.schedule && Array.isArray(c.schedule) && c.schedule.length > 0) {
      schedule = c.schedule.map((s: any) => ({
        id: s.id || String(Math.random()),
        icon: s.icon || "📅",
        day: {
          ar: s.day?.ar || s.day || "",
          en: s.day?.en || s.day || "",
        },
        time: {
          ar: s.time?.ar || s.time || "",
          en: s.time?.en || s.time || "",
        },
        topic: {
          ar: s.topic?.ar || s.topic || "",
          en: s.topic?.en || s.topic || "",
        },
        place: {
          ar: s.place?.ar || s.place || "",
          en: s.place?.en || s.place || "",
        },
      }));
    }
  } catch {
    // استخدام البيانات الاحتياطية
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BroadcastEvent",
        name: settings.liveTitle[L],
        description: ui.description,
        inLanguage: L,
        isLiveBroadcast: true,
        broadcastOf: {
          "@type": "Event",
          name: settings.liveTitle[L],
        },
      },
      {
        "@type": "Event",
        name: ui.weeklyMeeting,
        description: ui.weeklyMeetingDesc,
        inLanguage: L,
        location: {
          "@type": "Place",
          name: settings.meetingPlace[L],
        },
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
        <div className="card relative mb-8 overflow-hidden border-2 border-red-200 bg-gradient-to-br from-red-50 via-cream-dark to-red-50 p-8 md:p-12 dark:border-red-900 dark:from-red-950/30 dark:via-gray-900 dark:to-red-950/30">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />

          {/* شارة LIVE */}
          {settings.liveUrl && (
            <div className="absolute top-6 end-6 flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-black text-white shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              {ui.liveNow}
            </div>
          )}

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">📡 {isRTL ? "بث مباشر" : "Live Stream"}</span>

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
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="📡" label={ui.liveCount} value="●" color="primary" isLive />
          <StatCard icon="🕌" label={ui.meetingCount} value={1} color="gold" />
          <StatCard icon="📚" label={ui.lessonsCount} value={schedule.length} color="primary" />
          <StatCard icon="✨" label={ui.freeAlways} value="100%" color="gold" />
        </div>

        {/* ===== البث المباشر ===== */}
        {settings.liveUrl ? (
          <div className="card relative mb-10 overflow-hidden border-2 border-red-300 bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl dark:border-red-800">
            {/* زخرفة */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />

            {/* شارة LIVE صغيرة */}
            <div className="absolute top-4 end-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-300" />
              </span>
              {ui.liveNow}
            </div>

            <div className="relative text-center">
              <div className="mb-4 flex justify-center">
                <span className="text-6xl">📡</span>
              </div>

              <h2
                className="mb-4 text-2xl font-black md:text-3xl"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {settings.liveTitle[L]}
              </h2>

              <a
                href={settings.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-black text-red-700 shadow-xl transition-all hover:bg-white/90 hover:scale-105 active:scale-95"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {ui.watchLive}
              </a>
            </div>
          </div>
        ) : (
          <div className="card mb-10 border-amber-200 bg-amber-50/60 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="mb-4 text-5xl">📡</div>
            <h2
              className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.liveUnavailable}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {ui.liveUnavailableDesc}
            </p>
          </div>
        )}

        {/* ===== المجلس الأسبوعي ===== */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🕌 {ui.weeklyMeeting}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.weeklyMeetingDesc}
            </p>
          </div>

          <div className="card p-6 md:p-8">
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <InfoCard
                icon="📅"
                label={ui.day}
                value={settings.meetingDay[L]}
                color="gold"
              />
              <InfoCard
                icon="🕐"
                label={ui.time}
                value={settings.meetingTime[L]}
                color="primary"
              />
              <InfoCard
                icon="📍"
                label={ui.place}
                value={settings.meetingPlace[L]}
                color="gold"
              />
            </div>

            {settings.meetingLink && (
              <a
                href={settings.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex w-full items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {ui.viewMap}
              </a>
            )}
          </div>
        </div>

        {/* ===== جدول الدروس الأسبوعي ===== */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🗓️ {ui.weeklySchedule}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.weeklyScheduleDesc}
            </p>
          </div>

          {schedule.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="mb-3 text-4xl">📭</div>
              <p className="text-slate-500 dark:text-slate-400">{ui.noSchedule}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schedule.map((s) => (
                <article
                  key={s.id}
                  className="card card-interactive group relative overflow-hidden border-r-4 border-gold-500 p-5 rtl:border-l-4 rtl:border-r-0"
                >
                  <div className="gradient-gold absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                      {s.icon}
                    </span>
                    <div>
                      <p
                        className="text-lg font-black text-primary-700 dark:text-gold-300"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {s.day[L]}
                      </p>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        🕐 {s.time[L]}
                      </p>
                    </div>
                  </div>

                  <h3
                    className="mb-2 text-lg font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {s.topic[L]}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    📍 {s.place[L]}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ===== حديث شريف ===== */}
        <div className="card relative mb-10 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 text-center md:p-12 dark:border-gold-700 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <p
            className="mb-3 text-xl font-black text-primary-700 md:text-3xl dark:text-gold-300"
            style={{ fontFamily: "var(--font-quran)" }}
          >
            «{ui.hadith}»
          </p>
          <p className="text-sm text-gold-700 dark:text-gold-400">
            📜 {ui.hadithSource}
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

            <Link href={`/${L}/khutab`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🎤</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.khutabPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.khutabPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📬</span>
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

        {/* ===== تنبيه مهم ===== */}
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
  isLive = false,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "gold";
  isLive?: boolean;
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
      {isLive ? (
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          </span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">LIVE</p>
        </div>
      ) : (
        <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      )}
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// مكون InfoCard
// ============================================================

function InfoCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: "primary" | "gold";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="text-center">
      <div className="mb-3 flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-3xl dark:bg-gold-900/40">
          {icon}
        </span>
      </div>
      <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`text-lg font-black ${colorClasses[color]}`}
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {value}
      </p>
    </div>
  );
}