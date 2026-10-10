// app/[lang]/calendar/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveCountdown from "./LiveCountdown";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type HijriParts = {
  year: number;
  month: number;
  day: number;
};

type CalendarEntry = {
  date: Date;
  hijri: HijriParts | null;
};

type IslamicEvent = {
  id: string;
  month: number;
  day: number;
  ar: string;
  en: string;
  icon: string;
  descAr: string;
  descEn: string;
};

type UpcomingEvent = IslamicEvent & {
  nextDate: Date | null;
  daysLeft: number | null;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  todayLabel: string;
  hijriToday: string;
  gregorian: string;
  hijri: string;
  upcomingTitle: string;
  upcomingDesc: string;
  allTitle: string;
  eventDate: string;
  nextDate: string;
  countdown: string;
  approximate: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  noConversion: string;
  heroTitle: string;
  daysRemaining: string;
  totalEvents: string;
  thisMonth: string;
  days: string;
  relatedTitle: string;
  prayerTimes: string;
  prayerTimesDesc: string;
  qibla: string;
  qiblaDesc: string;
  adhkar: string;
  adhkarDesc: string;
  hijriGuide: string;
  hijriGuideDesc: string;
  verse: string;
  verseSource: string;
};

// ============================================================
// أسماء الشهور الهجرية
// ============================================================

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

// ============================================================
// المناسبات الإسلامية
// ============================================================

const EVENTS: IslamicEvent[] = [
  {
    id: "hijri-new-year",
    month: 1, day: 1,
    ar: "رأس السنة الهجرية", en: "Islamic New Year", icon: "🌙",
    descAr: "بداية عام هجري جديد، وهو وقت مناسب للمحاسبة والدعاء والاستقبال بالطاعة.",
    descEn: "The beginning of a new Hijri year, a suitable time for self-reflection, supplication, and starting with obedience.",
  },
  {
    id: "ashura",
    month: 1, day: 10,
    ar: "يوم عاشوراء", en: "Day of Ashura", icon: "🤲",
    descAr: "العاشر من محرم، ويُسَنّ صيامه لغير الحاج، وقد ورد في فضله تكفير ذنوب السنة الماضية.",
    descEn: "The tenth of Muharram. Fasting it is recommended for non-pilgrims, and its virtue includes expiation of the previous year's sins.",
  },
  {
    id: "mawlid",
    month: 3, day: 12,
    ar: "ذكرى المولد النبوي", en: "Mawlid Reminder", icon: "🕌",
    descAr: "ذكرى مولد النبي ﷺ، وهي فرصة لتذكير السيرة العطرة والشمائل النبوية والاقتداء بها.",
    descEn: "The reminder of the Prophet's ﷺ birth, an opportunity to recall his noble biography, character, and example.",
  },
  {
    id: "isra-miraj",
    month: 7, day: 27,
    ar: "الإسراء والمعراج", en: "Isra and Mi'raj", icon: "✨",
    descAr: "ذكرى رحلة الإسراء والمعراج، وفيها فُرضت الصلوات الخمس، وهي من أعظم آيات الله لنبيه.",
    descEn: "The reminder of the Night Journey and Ascension, when the five daily prayers were obligated, and one of Allah's great signs to His Prophet.",
  },
  {
    id: "nisf-shaban",
    month: 8, day: 15,
    ar: "منتصف شعبان", en: "Middle of Sha'ban", icon: "📿",
    descAr: "منتصف شهر شعبان، ويكثر فيه بعض الناس من الذكر والدعاء، مع التنبيه إلى أن الأحكام تختلف حسب المذاهب والأدلة.",
    descEn: "The middle of Sha'ban. Many increase in remembrance and supplication, while rulings vary according to schools of thought and evidence.",
  },
  {
    id: "ramadan-start",
    month: 9, day: 1,
    ar: "بداية شهر رمضان", en: "Start of Ramadan", icon: "🌙",
    descAr: "شهر الصيام والقيام وتلاوة القرآن، وهو شهر الرحمة والمغفرة والعتق من النار.",
    descEn: "The month of fasting, night prayer, and Quran recitation. It is a month of mercy, forgiveness, and freedom from the Fire.",
  },
  {
    id: "laylat-qadr",
    month: 9, day: 27,
    ar: "ليلة القدر (التماس)", en: "Laylat al-Qadr (expected)", icon: "🌟",
    descAr: "تُتلَمى ليلة القدر في الوتر من العشر الأواخر، وقد يُشار إلى السابع والعشرين للتذكير، لكنها ليست محددة قطعًا.",
    descEn: "Laylat al-Qadr is sought in the odd nights of the last ten days. The twenty-seventh is often mentioned for reminder, but it is not definitively fixed.",
  },
  {
    id: "eid-fitr",
    month: 10, day: 1,
    ar: "عيد الفطر", en: "Eid al-Fitr", icon: "🎉",
    descAr: "أول شوال، عيد المسلمين بعد رمضان، وفيه زكاة الفطر وصلاة العيد والتكبير والفرح بالطاعة.",
    descEn: "The first of Shawwal, the Muslims' festival after Ramadan, including Zakat al-Fitr, Eid prayer, takbir, and joy in obedience.",
  },
  {
    id: "arafat",
    month: 12, day: 9,
    ar: "يوم عرفة", en: "Day of Arafah", icon: "🕋",
    descAr: "التاسع من ذي الحجة، يوم الحج الأكبر، ويُستحب صيامه لغير الحاج لما ورد في فضله.",
    descEn: "The ninth of Dhu al-Hijjah, the greatest day of Hajj. Fasting it is recommended for non-pilgrims due to its reported virtue.",
  },
  {
    id: "eid-adha",
    month: 12, day: 10,
    ar: "عيد الأضحى", en: "Eid al-Adha", icon: "🐑",
    descAr: "العاشر من ذي الحجة، عيد التضحية وأيام التشريق، وفيه التقرب إلى الله بالأضاحي وذكره.",
    descEn: "The tenth of Dhu al-Hijjah, the Festival of Sacrifice and the Days of Tashreeq, drawing near to Allah with sacrifices and remembrance.",
  },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "التقويم الهجري",
    subtitle: "المناسبات الإسلامية وتاريخ اليوم الهجري والميلادي",
    home: "الرئيسية",
    description: "صفحة التقويم الهجري لمنصة إسماعيل أحمد نجيب الدعوية. تعرض تاريخ اليوم الهجري والميلادي، وأقرب المناسبات الإسلامية مثل رمضان، العيد، عاشوراء، عرفة، والإسراء والمعراج.",
    todayLabel: "تاريخ اليوم",
    hijriToday: "التاريخ الهجري",
    gregorian: "ميلادي",
    hijri: "هجري",
    upcomingTitle: "المناسبات القادمة",
    upcomingDesc: "أقرب المناسبات الإسلامية مرتبة حسب الموعد المتوقع بناءً على التقويم الهجري.",
    allTitle: "كل المناسبات",
    eventDate: "التاريخ الهجري",
    nextDate: "الموعد المتوقع",
    countdown: "العد التنازلي",
    approximate: "تاريخ تقريبي",
    noteTitle: "تنبيه مهم",
    note1: "التواريخ مبنية على حسابات تقويم أم القرى، وقد تختلف حسب رؤية الهلال المحلية أو قرار الجهة المختصة.",
    note2: "بعض المناسبات مثل ليلة القدر تُتلَمى في العشر الأواخر، والعرض هنا للتذكير لا للتحديد القطعي.",
    note3: "هذه الصفحة للتوعية والتنظيم، ولا تغني عن مراجعة أهل العلم أو الجهات الرسمية في الأحكام والمواقيت.",
    noConversion: "تعذر حساب التاريخ الهجري تلقائيًا في هذه البيئة، وستظهر التواريخ الهجرية النصية فقط.",
    heroTitle: "المناسبة القادمة",
    daysRemaining: "يوم متبقي",
    totalEvents: "مناسبة",
    thisMonth: "الشهر الحالي",
    days: "يوم",
    relatedTitle: "صفحات ذات صلة",
    prayerTimes: "مواقيت الصلاة",
    prayerTimesDesc: "مواعيد الصلوات الخمس حسب موقعك.",
    qibla: "اتجاه القبلة",
    qiblaDesc: "بوصلة القبلة والمسافة إلى مكة.",
    adhkar: "الأذكار",
    adhkarDesc: "أذكار الصباح والمساء وبعد الصلاة.",
    hijriGuide: "دليل الحج والعمرة",
    hijriGuideDesc: "خطوات النسك والأدعية.",
    verse: "﴿ إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا ﴾",
    verseSource: "سورة التوبة — الآية 36",
  },
  en: {
    title: "Hijri Calendar",
    subtitle: "Islamic occasions and today's Hijri and Gregorian date",
    home: "Home",
    description: "Hijri calendar page for the Ismail Ahmed Naguib Dawah Platform. It shows today's Hijri and Gregorian date and upcoming Islamic occasions such as Ramadan, Eid, Ashura, Arafah, and Isra and Mi'raj.",
    todayLabel: "Today's date",
    hijriToday: "Hijri date",
    gregorian: "Gregorian",
    hijri: "Hijri",
    upcomingTitle: "Upcoming occasions",
    upcomingDesc: "The nearest Islamic occasions sorted by expected date based on the Hijri calendar.",
    allTitle: "All occasions",
    eventDate: "Hijri date",
    nextDate: "Expected date",
    countdown: "Countdown",
    approximate: "Approximate date",
    noteTitle: "Important notice",
    note1: "Dates are based on Umm al-Qura calendar calculations and may differ according to local moon sighting or official decision.",
    note2: "Some occasions, such as Laylat al-Qadr, are sought in the last ten nights. The display here is for reminder, not definitive determination.",
    note3: "This page is for awareness and organization. It does not replace consulting qualified scholars or official authorities for rulings and timings.",
    noConversion: "Automatic Hijri conversion is unavailable in this environment, so only textual Hijri dates will be shown.",
    heroTitle: "Next Occasion",
    daysRemaining: "days remaining",
    totalEvents: "occasions",
    thisMonth: "Current month",
    days: "days",
    relatedTitle: "Related Pages",
    prayerTimes: "Prayer Times",
    prayerTimesDesc: "Five daily prayers based on your location.",
    qibla: "Qibla Direction",
    qiblaDesc: "Qibla compass and distance to Mecca.",
    adhkar: "Adhkar",
    adhkarDesc: "Morning, evening, and post-prayer adhkar.",
    hijriGuide: "Hajj & Umrah Guide",
    hijriGuideDesc: "Rites, supplications, and steps.",
    verse: "\"Indeed, the number of months with Allah is twelve months.\"",
    verseSource: "Surah At-Tawbah — Verse 36",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

// ✅ إصلاح: إضافة جميع الأرقام العربية (كانت 1, 3, 5, 7, 9 مفقودة!)
function toArabicDigits(value: number | string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(value).replace(/\d/g, (digit) => {
    const number = Number(digit);
    return arabicNumerals[number] ?? digit;
  });
}

function startAtNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return startAtNoon(d);
}

function parseNumericPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number {
  const raw = parts.find((part) => part.type === type)?.value;
  const match = raw?.match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

function getHijriParts(date: Date): HijriParts | null {
  const calendars = ["islamic-umalqura", "islamic", "islamic-civil"];

  for (const calendar of calendars) {
    try {
      const formatter = new Intl.DateTimeFormat(
        `en-US-u-ca-${calendar}`,
        { day: "numeric", month: "numeric", year: "numeric" }
      );

      const parts = formatter.formatToParts(date);
      const day = parseNumericPart(parts, "day");
      const month = parseNumericPart(parts, "month");
      const year = parseNumericPart(parts, "year");

      if (
        Number.isFinite(day) &&
        Number.isFinite(month) &&
        Number.isFinite(year) &&
        month >= 1 && month <= 12 &&
        day >= 1 && day <= 30
      ) {
        return { year, month, day };
      }
    } catch {
      // نجرب التقويم التالي
    }
  }

  return null;
}

function buildCalendar(from: Date, days = 400): CalendarEntry[] {
  const calendar: CalendarEntry[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDays(from, i);
    const hijri = getHijriParts(date);
    calendar.push({ date, hijri });
  }
  return calendar;
}

function findNextEvent(
  event: IslamicEvent,
  calendar: CalendarEntry[]
): { date: Date | null; daysLeft: number | null } {
  for (let i = 0; i < calendar.length; i += 1) {
    const entry = calendar[i];
    if (!entry.hijri) continue;

    if (entry.hijri.month === event.month && entry.hijri.day === event.day) {
      return { date: entry.date, daysLeft: i };
    }
  }
  return { date: null, daysLeft: null };
}

function formatGregorian(date: Date | null, lang: Lang): string {
  if (!date) return "—";
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function formatHijriParts(parts: HijriParts | null, lang: Lang): string {
  if (!parts) return "—";

  const monthName = lang === "ar"
    ? HIJRI_MONTHS_AR[parts.month - 1] ?? ""
    : HIJRI_MONTHS_EN[parts.month - 1] ?? "";

  if (lang === "ar") {
    return `${toArabicDigits(parts.day)} ${monthName} ${toArabicDigits(parts.year)} هـ`;
  }
  return `${parts.day} ${monthName} ${parts.year} AH`;
}

function formatEventHijri(event: IslamicEvent, lang: Lang): string {
  const monthName = lang === "ar"
    ? HIJRI_MONTHS_AR[event.month - 1] ?? ""
    : HIJRI_MONTHS_EN[event.month - 1] ?? "";

  if (lang === "ar") {
    return `${toArabicDigits(event.day)} ${monthName}`;
  }
  return `${event.day} ${monthName}`;
}

function formatCountdown(days: number | null, lang: Lang, ui: UILang): string {
  if (days === null) return ui.approximate;

  if (lang === "ar") {
    if (days === 0) return "اليوم";
    if (days === 1) return "غدًا";
    if (days === 2) return "بعد يومين";
    if (days >= 3 && days <= 10) return `بعد ${toArabicDigits(days)} أيام`;
    return `بعد ${toArabicDigits(days)} يوم`;
  }

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === 2) return "In 2 days";
  return `In ${days} days`;
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
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/calendar`,
      languages: { ar: "/ar/calendar", en: "/en/calendar" },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/calendar`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{
        url: "/icons/icon-512.png",
        width: 512, height: 512, alt: ui.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: ["/icons/icon-512.png"],
    },
  };
}

// ============================================================
// الصفحة
// ============================================================

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const today = startAtNoon(new Date());
  const todayHijri = getHijriParts(today);
  const calendar = buildCalendar(today, 400);

  const upcoming: UpcomingEvent[] = EVENTS.map((event) => {
    const next = findNextEvent(event, calendar);
    return { ...event, nextDate: next.date, daysLeft: next.daysLeft };
  }).sort((a, b) => {
    const aDays = a.daysLeft ?? 99999;
    const bDays = b.daysLeft ?? 99999;
    return aDays - bDays;
  });

  const nextEvent = upcoming[0];
  const nextFour = upcoming.slice(0, 4);

  // حساب الشهر الحالي
  const currentHijriMonth = todayHijri?.month ?? 0;
  const currentMonthName = currentHijriMonth > 0
    ? (isRTL ? HIJRI_MONTHS_AR[currentHijriMonth - 1] : HIJRI_MONTHS_EN[currentHijriMonth - 1])
    : "—";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: ui.title,
    description: ui.description,
    inLanguage: l,
    url: `/${l}/calendar`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: upcoming.map((event, index) => ({
        "@type": "Event",
        position: index + 1,
        name: isRTL ? event.ar : event.en,
        description: isRTL ? event.descAr : event.descEn,
        startDate: event.nextDate?.toISOString().split("T")[0] ?? "",
        eventStatus: "https://schema.org/EventScheduled",
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

      <section className="container-page py-10 md:py-14">
        {/* ===== تنبيه لو الحساب الهجري فشل ===== */}
        {!todayHijri && (
          <div className="card mb-8 border-amber-200 bg-amber-50/60 p-5 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-sm font-semibold leading-relaxed text-amber-800 dark:text-amber-200">
              {ui.noConversion}
            </p>
          </div>
        )}

        {/* ===== Hero: المناسبة القادمة ===== */}
        {nextEvent && nextEvent.nextDate && (
          <div className="card relative mb-8 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-primary-50 p-8 md:p-10 dark:border-gold-700 dark:from-gold-950/30 dark:to-primary-950/30">
            <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

            <div className="mx-auto max-w-3xl text-center">
              <span className="badge-gold mb-4">⭐ {ui.heroTitle}</span>

              <div className="mb-4 flex justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 text-4xl text-white shadow-2xl">
                  {nextEvent.icon}
                </span>
              </div>

              <h2
                className="mb-2 text-3xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {isRTL ? nextEvent.ar : nextEvent.en}
              </h2>

              <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
                {isRTL ? nextEvent.descAr : nextEvent.descEn}
              </p>

              {/* العد التنازلي الحي */}
              {nextEvent.nextDate && (
                <LiveCountdown targetDate={nextEvent.nextDate} lang={l} />
              )}
            </div>
          </div>
        )}

        {/* ===== بطاقة اليوم ===== */}
        <div className="card relative mb-10 overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">{ui.todayLabel}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {formatGregorian(today, l)}
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.hijriToday}:{" "}
              <span className="font-black text-primary-700 dark:text-primary-300">
                {formatHijriParts(todayHijri, l)}
              </span>
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-night-700 dark:bg-night-800">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {ui.gregorian}
                </p>
                <p className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                  {formatGregorian(today, l)}
                </p>
              </div>

              <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-900/40 dark:bg-primary-950/20">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary-700 dark:text-primary-300">
                  {ui.hijri}
                </p>
                <p className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                  {formatHijriParts(todayHijri, l)}
                </p>
              </div>
            </div>

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

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="📅"
            label={ui.totalEvents}
            value={EVENTS.length}
            color="primary"
          />
          <StatCard
            icon="🌙"
            label={ui.thisMonth}
            value={currentMonthName}
            color="gold"
          />
          <StatCard
            icon="⏰"
            label={ui.daysRemaining}
            value={nextEvent?.daysLeft ?? 0}
            color="primary"
          />
          <StatCard
            icon="🗓️"
            label={ui.days}
            value={new Date().getDate()}
            color="slate"
          />
        </div>

        {/* ===== المناسبات القادمة ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.upcomingTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.upcomingDesc}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {nextFour.map((event) => {
              const countdown = formatCountdown(event.daysLeft, l, ui);
              const hijriLabel = formatEventHijri(event, l);
              const nextLabel = event.nextDate
                ? formatGregorian(event.nextDate, l)
                : ui.approximate;

              return (
                <article
                  key={event.id}
                  className="card relative overflow-hidden p-6 md:p-7"
                >
                  <div className="gradient-gold absolute inset-x-0 top-0 h-1" />

                  <div className="mb-5 flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                      {event.icon}
                    </span>

                    <div className="min-w-0">
                      <h3
                        className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {isRTL ? event.ar : event.en}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {hijriLabel}
                      </p>
                    </div>
                  </div>

                  <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
                    {isRTL ? event.descAr : event.descEn}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-night-700 dark:bg-night-800/50">
                      <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {ui.nextDate}
                      </p>
                      <p className="text-sm font-black leading-relaxed text-slate-800 dark:text-slate-100">
                        {nextLabel}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gold-100 bg-gold-50/60 p-4 dark:border-gold-900/30 dark:bg-gold-950/20">
                      <p className="mb-1 text-xs font-bold text-gold-700 dark:text-gold-300">
                        {ui.countdown}
                      </p>
                      <p className="text-sm font-black leading-relaxed text-slate-800 dark:text-slate-100">
                        {countdown}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ===== كل المناسبات ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.allTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="space-y-4">
            {upcoming.map((event) => {
              const countdown = formatCountdown(event.daysLeft, l, ui);
              const hijriLabel = formatEventHijri(event, l);
              const nextLabel = event.nextDate
                ? formatGregorian(event.nextDate, l)
                : ui.approximate;

              return (
                <article
                  key={event.id}
                  className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/40">
                      {event.icon}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-lg font-black leading-relaxed text-slate-900 dark:text-white">
                        {isRTL ? event.ar : event.en}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {isRTL ? event.descAr : event.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
                    <span className="badge-primary">
                      {ui.eventDate}: {hijriLabel}
                    </span>

                    <span className="badge-gold">
                      {ui.nextDate}: {nextLabel}
                    </span>

                    <span
                      className={`rounded-xl px-4 py-2 text-sm font-black ${
                        event.daysLeft === 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : event.daysLeft !== null && event.daysLeft <= 7
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "bg-slate-100 text-slate-700 dark:bg-night-800 dark:text-slate-300"
                      }`}
                    >
                      {countdown}
                    </span>
                  </div>
                </article>
              );
            })}
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
            <Link
              href={`/${l}/prayer-times`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🕐
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerTimes}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.prayerTimesDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/qibla`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🧭
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.qibla}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.qiblaDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/adhkar`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🤲
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.adhkar}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.adhkarDesc}
                </p>
              </div>
            </Link>

            <Link
              href={`/${l}/hajj-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🕋
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.hijriGuide}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.hijriGuideDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيه ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/20">
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

              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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

      <Footer lang={l} />
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
  value: string | number;
  color: "primary" | "gold" | "slate";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
    slate: "text-slate-900 dark:text-white",
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