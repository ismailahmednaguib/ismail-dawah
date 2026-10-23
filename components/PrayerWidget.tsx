"use client";

// ============================================================
// بطاقة الصلاة القادمة في الرئيسية.
// تقرأ الموقع وطريقة الحساب المحفوظين من صفحة المواقيت،
// وتستخدم القاهرة والهيئة المصرية افتراضيًا عند عدم وجود حفظ.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PRAYERS } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_prayer_location_v2";
const SETTINGS_KEY = "dawah_prayer_settings_v1";

const DEFAULT_LOCATION = {
  latitude: 30.0444,
  longitude: 31.2357,
};

type SavedLocation = {
  latitude?: number;
  longitude?: number;
  label?: string;
};

type WidgetLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

type SavedSettings = {
  method?: number;
};

type Timings = Record<string, string>;

type AladhanResponse = {
  code: number;
  data?: {
    timings?: Timings;
    date?: {
      hijri?: { date?: string };
      gregorian?: { date?: string };
    };
  };
};

const UI = {
  ar: {
    next: "الصلاة القادمة",
    remaining: "المتبقي",
    today: "مواقيت اليوم",
    times: "المواقيت كاملة",
    qibla: "اتجاه القبلة",
    loading: "جارٍ تحميل المواقيت…",
    error: "تعذّر تحميل المواقيت الآن.",
    open: "افتح صفحة المواقيت",
    defaultLocation: "القاهرة (افتراضي)",
    tomorrow: "غدًا",
    hour: "س",
    minute: "د",
  },
  en: {
    next: "Next prayer",
    remaining: "Remaining",
    today: "Today's times",
    times: "All prayer times",
    qibla: "Qibla direction",
    loading: "Loading prayer times…",
    error: "Could not load prayer times right now.",
    open: "Open prayer times",
    defaultLocation: "Cairo (default)",
    tomorrow: "Tomorrow",
    hour: "h",
    minute: "m",
  },
} as const;

function toArabicDigits(value: string): string {
  return value.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

function todayPath(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${now.getFullYear()}`;
}

function parseTimeToDate(time: string, base: Date): Date {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return base;
  const date = new Date(base);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

function timingKey(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function formatCountdown(ms: number, lang: Lang): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const text =
    lang === "ar"
      ? hours > 0
        ? `${hours} ${UI.ar.hour} ${minutes} ${UI.ar.minute}`
        : `${minutes} ${UI.ar.minute}`
      : hours > 0
        ? `${hours}${UI.en.hour} ${minutes}${UI.en.minute}`
        : `${minutes}${UI.en.minute}`;
  return lang === "ar" ? toArabicDigits(text) : text;
}

export default function PrayerWidget({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const isRTL = lang === "ar";
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<WidgetLocation>({ ...DEFAULT_LOCATION, label: UI[lang].defaultLocation });
  const [method, setMethod] = useState(5);
  const [timings, setTimings] = useState<Timings | null>(null);
  const [hijri, setHijri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    try {
      const rawLocation = localStorage.getItem(STORAGE_KEY);
      if (rawLocation) {
        const parsed = JSON.parse(rawLocation) as SavedLocation;
        if (
          typeof parsed.latitude === "number" &&
          typeof parsed.longitude === "number" &&
          parsed.latitude >= -90 &&
          parsed.latitude <= 90 &&
          parsed.longitude >= -180 &&
          parsed.longitude <= 180
        ) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            label:
              typeof parsed.label === "string" && parsed.label.trim()
                ? parsed.label.trim()
                : ui.defaultLocation,
          });
        }
      }

      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings) as SavedSettings;
        if (typeof parsed.method === "number") setMethod(parsed.method);
      }
    } catch {
      // تجاهل التخزين التالف
    } finally {
      setMounted(true);
    }
  }, [ui.defaultLocation]);

  useEffect(() => {
    // العدّاد المعروض بالدقائق فقط، فلا حاجة لتحديث كل ثانية.
    // التحديث كل ٣٠ ثانية يقلّل عمل الخيط الرئيسي ويحافظ على دقة الدقيقة.
    let interval: number | null = null;
    const tick = () => setNow(new Date());
    const start = () => {
      if (interval === null) interval = window.setInterval(tick, 30_000);
    };
    const stop = () => {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const url = `https://api.aladhan.com/v1/timings/${todayPath()}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("prayer-times");
        const json = (await response.json()) as AladhanResponse;
        if (json.code !== 200 || !json.data?.timings) throw new Error("prayer-times");
        setTimings(json.data.timings);
        setHijri(json.data.date?.hijri?.date ?? null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(true);
          setTimings(null);
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [location.latitude, location.longitude, method, mounted]);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    const events = PRAYERS.filter((prayer) => prayer.id !== "sunrise")
      .map((prayer) => {
        const time = timings[timingKey(prayer.id)] ?? "";
        return { ...prayer, time, date: parseTimeToDate(time, now) };
      })
      .filter((prayer) => prayer.time);

    const upcoming = events.find((prayer) => prayer.date.getTime() > now.getTime());
    if (upcoming) return { ...upcoming, tomorrow: false };

    const first = events[0];
    if (!first) return null;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      ...first,
      date: parseTimeToDate(first.time, tomorrow),
      tomorrow: true,
    };
  }, [timings, now]);

  const displayTime = useMemo(() => {
    if (!nextPrayer) return "";
    return lang === "ar" ? toArabicDigits(nextPrayer.time) : nextPrayer.time;
  }, [nextPrayer, lang]);

  return (
    <section className="container-page -mt-6 pb-2">
      <div className="card relative overflow-hidden border-primary-200/70 bg-gradient-to-br from-white via-cream-dark to-primary-50/50 p-5 shadow-lg dark:border-primary-900/40 dark:from-night-800 dark:via-night-900 dark:to-primary-950/30 md:p-6">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-gold-400 via-primary-500 to-primary-700"
        />

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>

            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
                {ui.next}
              </p>

              {loading && !timings ? (
                <p className="mt-1 text-sm opacity-70">{ui.loading}</p>
              ) : error ? (
                <p className="mt-1 text-sm opacity-70">
                  {ui.error}{" "}
                  <Link href={`/${lang}/prayer-times`} className="underline">
                    {ui.open}
                  </Link>
                </p>
              ) : nextPrayer ? (
                <>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="text-2xl font-black text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? nextPrayer.arabicName : nextPrayer.englishName}
                    </span>
                    <span className="text-xl font-black text-primary-700 dark:text-primary-300">
                      {displayTime}
                    </span>
                    {nextPrayer.tomorrow && (
                      <span className="text-xs font-bold text-gold-700 dark:text-gold-300">
                        {ui.tomorrow}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs font-semibold opacity-70">
                    {ui.remaining}: {formatCountdown(nextPrayer.date.getTime() - now.getTime(), lang)}
                    {" · "}
                    {location.label}
                  </p>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {hijri && (
              <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-bold opacity-80 dark:bg-white/10">
                {lang === "ar" ? toArabicDigits(hijri) : hijri}
              </span>
            )}
            <Link
              href={`/${lang}/prayer-times`}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              {ui.times}
            </Link>
            <Link
              href={`/${lang}/qibla`}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              {ui.qibla}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
