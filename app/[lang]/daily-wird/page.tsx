// app/[lang]/daily-wird/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";

// ============================================================
// الأنواع
// ============================================================

type Lang = "ar" | "en";

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

type SearchParams = {
  q?: string | string[];
  day?: string | string[];
  done?: string | string[];
};

// ============================================================
// بيانات الورد اليومي
// ============================================================

const DAYS: WirdDay[] = [
  {
    id: "saturday",
    ar: "السبت",
    en: "Saturday",
    icon: "🌅",
    tasks: [
      {
        id: "saturday-quran",
        icon: "📖",
        ar: "اقرأ وردك من القرآن الكريم ولو صفحة واحدة",
        en: "Read your Quran portion, even one page",
        href: "/quran",
        hrefLabelAr: "القرآن",
        hrefLabelEn: "Quran",
      },
      {
        id: "saturday-morning-adhkar",
        icon: "🤲",
        ar: "قل أذكار الصباح",
        en: "Say morning adhkar",
        href: "/adhkar",
        hrefLabelAr: "الأذكار",
        hrefLabelEn: "Adhkar",
      },
      {
        id: "saturday-tasbih",
        icon: "📿",
        ar: "سبح 33 تسبيحة على الأقل",
        en: "Say at least 33 tasbih",
        href: "/tasbih",
        hrefLabelAr: "المسبحة",
        hrefLabelEn: "Tasbih",
      },
      {
        id: "saturday-prayer",
        icon: "🕌",
        ar: "حافظ على الصلاة في وقتها",
        en: "Pray on time",
        href: "/prayer-times",
        hrefLabelAr: "المواقيت",
        hrefLabelEn: "Times",
      },
    ],
  },
  {
    id: "sunday",
    ar: "الأحد",
    en: "Sunday",
    icon: "📚",
    tasks: [
      {
        id: "sunday-memorize",
        icon: "🎯",
        ar: "احفظ آية أو أكثر وراجعها",
        en: "Memorize one or more ayahs and revise them",
        href: "/quran-memorization",
        hrefLabelAr: "خطة الحفظ",
        hrefLabelEn: "Plan",
      },
      {
        id: "sunday-prophet-story",
        icon: "🧠",
        ar: "اقرأ قصة نبي واستخرج درسًا واحدًا",
        en: "Read a prophet story and extract one lesson",
        href: "/prophets-stories",
        hrefLabelAr: "القصص",
        hrefLabelEn: "Stories",
      },
      {
        id: "sunday-evening-adhkar",
        icon: "🌙",
        ar: "قل أذكار المساء",
        en: "Say evening adhkar",
        href: "/adhkar",
        hrefLabelAr: "الأذكار",
        hrefLabelEn: "Adhkar",
      },
      {
        id: "sunday-dua",
        icon: "🤲",
        ar: "ادعُ الله بأدعية القرآن والسنة",
        en: "Make du'a with Quranic and prophetic supplications",
        href: "/ruqyah",
        hrefLabelAr: "الأدعية",
        hrefLabelEn: "Du'a",
      },
    ],
  },
  {
    id: "monday",
    ar: "الاثنين",
    en: "Monday",
    icon: "💧",
    tasks: [
      {
        id: "monday-quran-listen",
        icon: "🎧",
        ar: "استمع إلى تلاوة قرآن بصوت مطمئن",
        en: "Listen to a calm Quran recitation",
        href: "/quran",
        hrefLabelAr: "القرآن",
        hrefLabelEn: "Quran",
      },
      {
        id: "monday-istighfar",
        icon: "🔁",
        ar: "أكثِر من الاستغفار",
        en: "Increase istighfar",
        href: "/tasbih",
        hrefLabelAr: "المسبحة",
        hrefLabelEn: "Tasbih",
      },
      {
        id: "monday-sadaqah",
        icon: "💝",
        ar: "تصدق ولو بالقليل أو بكلمة طيبة",
        en: "Give charity, even small or with a kind word",
      },
      {
        id: "monday-family",
        icon: "👨‍‍👧👦",
        ar: "ذكّر أهلك بخير أو علمهم شيئًا",
        en: "Remind your family with good or teach them something",
      },
    ],
  },
  {
    id: "tuesday",
    ar: "الثلاثاء",
    en: "Tuesday",
    icon: "⚖️",
    tasks: [
      {
        id: "tuesday-fatwa",
        icon: "❓",
        ar: "تعلم حكمًا شرعيًا تحتاجه في يومك",
        en: "Learn a practical Islamic ruling",
        href: "/fatwa",
        hrefLabelAr: "الفتاوى",
        hrefLabelEn: "Fatwas",
      },
      {
        id: "tuesday-review",
        icon: "🔂",
        ar: "راجع محفوظك السابق",
        en: "Revise previous memorization",
        href: "/quran-memorization",
        hrefLabelAr: "الحفظ",
        hrefLabelEn: "Memorization",
      },
      {
        id: "tuesday-gratitude",
        icon: "🌿",
        ar: "اشكر الله على ثلاث نعم",
        en: "Thank Allah for three blessings",
      },
      {
        id: "tuesday-salawat",
        icon: "🕊️",
        ar: "صلِّ على النبي ﷺ مئة مرة",
        en: "Send 100 blessings upon the Prophet ﷺ",
        href: "/tasbih",
        hrefLabelAr: "المسبحة",
        hrefLabelEn: "Tasbih",
      },
    ],
  },
  {
    id: "wednesday",
    ar: "الأربعاء",
    en: "Wednesday",
    icon: "🧭",
    tasks: [
      {
        id: "wednesday-quran-reflection",
        icon: "💡",
        ar: "تدبر في آية واحدة واكتب تفسيرها المختصر",
        en: "Reflect on one ayah and write a short insight",
        href: "/quran",
        hrefLabelAr: "القرآن",
        hrefLabelEn: "Quran",
      },
      {
        id: "wednesday-qibla",
        icon: "🕋",
        ar: "تأكد من اتجاه القبلة في مصلاك",
        en: "Check your prayer direction",
        href: "/qibla",
        hrefLabelAr: "القبلة",
        hrefLabelEn: "Qibla",
      },
      {
        id: "wednesday-health",
        icon: "🏃",
        ar: "حافظ على صحتك فإن للمؤمن قوة",
        en: "Take care of your health; a believer should be strong",
      },
      {
        id: "wednesday-good-deed",
        icon: "✨",
        ar: "اصنع معروفًا اليوم",
        en: "Do a good deed today",
      },
    ],
  },
  {
    id: "thursday",
    ar: "الخميس",
    en: "Thursday",
    icon: "📖",
    tasks: [
      {
        id: "thursday-kahf",
        icon: "📜",
        ar: "اقرأ سورة الكهف",
        en: "Read Surah Al-Kahf",
        href: "/quran/18",
        hrefLabelAr: "الكهف",
        hrefLabelEn: "Al-Kahf",
      },
      {
        id: "thursday-dua-accepted",
        icon: "🤲",
        ar: "اغتنم ساعة الإجابة يوم الجمعة بالدعاء",
        en: "Prepare for Friday's hour of response with du'a",
      },
      {
        id: "thursday-revision",
        icon: "🔁",
        ar: "راجع وردك الأسبوعي",
        en: "Review your weekly portion",
        href: "/quran-memorization",
        hrefLabelAr: "المراجعة",
        hrefLabelEn: "Revision",
      },
      {
        id: "thursday-charity",
        icon: "💰",
        ar: "جهّز صدقة الجمعة",
        en: "Prepare Friday charity",
      },
    ],
  },
  {
    id: "friday",
    ar: "الجمعة",
    en: "Friday",
    icon: "🕌",
    tasks: [
      {
        id: "friday-ghusl",
        icon: "💧",
        ar: "اغتسل للجمعة وتطيب ولبس أحسن ثيابك",
        en: "Perform ghusl, wear clean good clothes",
      },
      {
        id: "friday-salah",
        icon: "🕌",
        ar: "اشهد صلاة الجمعة مبكرًا",
        en: "Attend Jumu'ah prayer early",
        href: "/prayer-times",
        hrefLabelAr: "المواقيت",
        hrefLabelEn: "Times",
      },
      {
        id: "friday-salawat",
        icon: "🕊️",
        ar: "أكثِر من الصلاة على النبي ﷺ",
        en: "Increase salawat upon the Prophet ﷺ",
        href: "/tasbih",
        hrefLabelAr: "المسبحة",
        hrefLabelEn: "Tasbih",
      },
      {
        id: "friday-dua-hour",
        icon: "⏳",
        ar: "ادعُ في ساعة الإجابة بعد العصر",
        en: "Make du'a in the hour of response after Asr",
      },
      {
        id: "friday-kahf",
        icon: "📜",
        ar: "اقرأ سورة الكهف",
        en: "Read Surah Al-Kahf",
        href: "/quran/18",
        hrefLabelAr: "الكهف",
        hrefLabelEn: "Al-Kahf",
      },
    ],
  },
];

const ALL_TASK_IDS = DAYS.flatMap((day) => day.tasks.map((task) => task.id));

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
    search: string;
    clearSearch: string;
    resetProgress: string;
    results: string;
    of: string;
    noResults: string;
    noResultsDesc: string;
    weeklyProgress: string;
    dayProgress: string;
    completed: string;
    pending: string;
    open: string;
    markDone: string;
    markUndone: string;
    allDays: string;
    note: string;
    tipTitle: string;
    tips: string[];
  }
> = {
  ar: {
    title: "الورد اليومي",
    subtitle: "خطة أسبوعية بسيطة للقرآن والذكر والعمل الصالح",
    home: "الرئيسية",
    description:
      "صفحة الورد اليومي تساعدك على تنظيم علاقتك بالقرآن والأذكار والعمل الصالح خلال الأسبوع، مع متابعة تقدمك بشكل بسيط.",
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
    note: "💡 تقدمك محفوظ داخل رابط الصفحة. لو أردت الاحتفاظ به، احفظ الصفحة كإشارة مرجعية بعد تحديث الحالة.",
    tipTitle: "نصائح للالتزام بالورد",
    tips: [
      "ابدأ بالمهمة الأسهل حتى تكسر حاجز التسويف.",
      "اربط الورد بوقت ثابت يوميًا مثل بعد الفجر.",
      "لا تجعل الهدف كبيرًا حتى لا تنقطع.",
      "راجع تقدمك كل جمعة وادعُ الله بالاستمرار.",
    ],
  },
  en: {
    title: "Daily Wird",
    subtitle: "A simple weekly plan for Quran, dhikr, and good deeds",
    home: "Home",
    description:
      "The daily wird page helps you organize your relationship with the Quran, adhkar, and good deeds throughout the week with simple progress tracking.",
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
    note: "💡 Your progress is stored in the page URL. To keep it, bookmark the page after updating the state.",
    tipTitle: "Tips for staying consistent",
    tips: [
      "Start with the easiest task to break procrastination.",
      "Attach your wird to a fixed daily time, such as after Fajr.",
      "Do not set an overly large goal that leads to burnout.",
      "Review your progress every Friday and ask Allah for consistency.",
    ],
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    return String(value)
      .split("")
      .map((digit) => {
        const number = Number(digit);
        return Number.isFinite(number) ? arabicNumerals[number] : digit;
      })
      .join("");
  }

  return String(value);
}

function parseDone(value?: string | string[]): string[] {
  const raw = getFirstValue(value);

  if (!raw) {
    return [];
  }

  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => ALL_TASK_IDS.includes(id));

  return Array.from(new Set(ids));
}

function taskMatchesQuery(task: WirdTask, query: string): boolean {
  if (!query) {
    return true;
  }

  const q = normalize(query);

  return [task.ar, task.en, task.id].some((value) => normalize(value).includes(q));
}

function buildHref(
  lang: Lang,
  options: {
    q?: string;
    day?: string;
    done?: string[];
  }
): string {
  const search = new URLSearchParams();

  if (options.q?.trim()) {
    search.set("q", options.q.trim());
  }

  if (options.day && options.day !== "all") {
    search.set("day", options.day);
  }

  if (options.done && options.done.length > 0) {
    search.set("done", options.done.join(","));
  }

  const queryString = search.toString();

  return `/${lang}/daily-wird${queryString ? `?${queryString}` : ""}`;
}

function toggleTask(done: string[], taskId: string): string[] {
  if (done.includes(taskId)) {
    return done.filter((id) => id !== taskId);
  }

  return [...done, taskId];
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (lang !== "ar" && lang !== "en") {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/daily-wird`,
      languages: {
        ar: "/ar/daily-wird",
        en: "/en/daily-wird",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/daily-wird`,
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

export default async function DailyWirdPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (lang !== "ar" && lang !== "en") {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;

  const q = getFirstValue(sp.q).trim();
  const rawDay = getFirstValue(sp.day);
  const doneIds = parseDone(sp.done);
  const doneRaw = doneIds.join(",");

  const selectedDay =
    rawDay && DAYS.some((day) => day.id === rawDay) ? rawDay : "all";

  const daysToRender =
    selectedDay === "all"
      ? DAYS
      : DAYS.filter((day) => day.id === selectedDay);

  const filteredDays = daysToRender
    .map((day) => ({
      ...day,
      tasks: day.tasks.filter((task) => taskMatchesQuery(task, q)),
    }))
    .filter((day) => day.tasks.length > 0);

  const totalTasks = ALL_TASK_IDS.length;
  const completedTotal = doneIds.filter((id) => ALL_TASK_IDS.includes(id)).length;
  const weeklyPercent =
    totalTasks > 0 ? Math.min(Math.round((completedTotal / totalTasks) * 100), 100) : 0;

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
            action={`/${l}/daily-wird`}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <input
              type="hidden"
              name="day"
              value={selectedDay === "all" ? "" : selectedDay}
            />

            <input
              type="hidden"
              name="done"
              value={doneRaw}
            />

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
                placeholder={ui.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={ui.searchPlaceholder}
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {q && (
              <Link
                href={buildHref(l, {
                  day: selectedDay,
                  done: doneIds,
                })}
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
                {ui.clearSearch}
              </Link>
            )}

            {doneIds.length > 0 && (
              <Link
                href={buildHref(l, {
                  q,
                  day: selectedDay,
                })}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/30"
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
                  <path d="M3 12a9 9 0 1 0 9-9" />
                  <path d="M3 3v6h6" />
                </svg>
                {ui.resetProgress}
              </Link>
            )}
          </div>
        </div>

        {/* ===== التقدم الأسبوعي ===== */}
        <div className="card relative mb-8 overflow-hidden p-6 md:p-8">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.weeklyProgress}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {formatNumber(completedTotal, l)} / {formatNumber(totalTasks, l)}{" "}
                {ui.completed}
              </p>
            </div>

            <div className="text-4xl font-black text-primary-600 md:text-5xl dark:text-primary-400">
              {formatNumber(weeklyPercent, l)}%
            </div>
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400 transition-all duration-700"
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>
        </div>

        {/* ===== تبويبات الأيام ===== */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Link
            href={buildHref(l, {
              q,
              day: "all",
              done: doneIds,
            })}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
              selectedDay === "all"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
            }`}
          >
            <span>🗓️</span>
            <span>{ui.allDays}</span>
          </Link>

          {DAYS.map((day) => {
            const isActive = selectedDay === day.id;
            const dayTaskIds = day.tasks.map((task) => task.id);
            const dayCompleted = dayTaskIds.filter((id) => doneIds.includes(id)).length;
            const dayPercent =
              dayTaskIds.length > 0
                ? Math.round((dayCompleted / dayTaskIds.length) * 100)
                : 0;

            return (
              <Link
                key={day.id}
                href={buildHref(l, {
                  q,
                  day: day.id,
                  done: doneIds,
                })}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                }`}
              >
                <span>{day.icon}</span>
                <span>{isRTL ? day.ar : day.en}</span>

                {dayCompleted > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    }`}
                  >
                    {formatNumber(dayPercent, l)}%
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ===== عدد النتائج ===== */}
        <p className="mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {ui.results}:{" "}
          <span className="text-primary-600 dark:text-primary-400">
            {formatNumber(
              filteredDays.reduce((sum, day) => sum + day.tasks.length, 0),
              l
            )}
          </span>{" "}
          {ui.of}{" "}
          <span className="text-slate-700 dark:text-slate-200">
            {formatNumber(totalTasks, l)}
          </span>
        </p>

        {/* ===== لا توجد نتائج ===== */}
        {filteredDays.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">📭</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <Link
              href={buildHref(l, {
                day: selectedDay,
                done: doneIds,
              })}
              className="btn-primary"
            >
              {ui.clearSearch}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDays.map((day) => {
              const dayTaskIds = day.tasks.map((task) => task.id);
              const dayCompleted = dayTaskIds.filter((id) => doneIds.includes(id)).length;
              const dayPercent =
                dayTaskIds.length > 0
                  ? Math.min(Math.round((dayCompleted / dayTaskIds.length) * 100), 100)
                  : 0;

              return (
                <div key={day.id} className="card p-6 md:p-7">
                  {/* رأس اليوم */}
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                        {day.icon}
                      </span>

                      <div>
                        <h2
                          className="text-2xl font-black text-slate-900 dark:text-white"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {isRTL ? day.ar : day.en}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatNumber(dayCompleted, l)} /{" "}
                          {formatNumber(day.tasks.length, l)} {ui.completed}
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-56">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>{ui.dayProgress}</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {formatNumber(dayPercent, l)}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-gold-400 transition-all duration-500"
                          style={{ width: `${dayPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* مهام اليوم */}
                  <div className="space-y-3">
                    {day.tasks.map((task) => {
                      const isDone = doneIds.includes(task.id);
                      const toggleHref = buildHref(l, {
                        q,
                        day: selectedDay,
                        done: toggleTask(doneIds, task.id),
                      });

                      return (
                        <div
                          key={task.id}
                          className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${
                            isDone
                              ? "border-green-200 bg-green-50/60 dark:border-green-800/40 dark:bg-green-950/20"
                              : "border-slate-200 bg-white hover:border-primary-200 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-700"
                          }`}
                        >
                          <Link
                            href={toggleHref}
                            className="group flex min-w-0 flex-1 items-start gap-3"
                            aria-label={isDone ? ui.markUndone : ui.markDone}
                          >
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isDone
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-slate-300 bg-white text-transparent group-hover:border-primary-500 dark:border-night-600 dark:bg-night-900"
                              }`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>

                            <span className="min-w-0">
                              <span
                                className={`flex items-center gap-2 text-sm font-bold leading-relaxed ${
                                  isDone
                                    ? "text-green-800 line-through decoration-green-500/60 dark:text-green-200"
                                    : "text-slate-800 group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-300"
                                }`}
                              >
                                <span>{task.icon}</span>
                                <span>{isRTL ? task.ar : task.en}</span>
                              </span>
                            </span>
                          </Link>

                          {task.href && (
                            <Link
                              href={`/${l}${task.href}`}
                              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:bg-primary-100 active:scale-95 dark:border-primary-800/50 dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/40"
                            >
                              <span>{isRTL ? task.hrefLabelAr : task.hrefLabelEn}</span>

                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={isRTL ? "rotate-180" : ""}
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== نصائح ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            💡 {ui.tipTitle}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {ui.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-black text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {formatNumber(index + 1, l)}
                </span>

                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card mt-6 p-5 text-center">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.note}
          </p>
        </div>
      </section>
    </main>
  );
}