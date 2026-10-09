// app/[lang]/prayer-times/prayer-times-content.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { PRAYERS, toArabicNumeral } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_prayer_location_v1";
const CALCULATION_METHOD = 5; // Egyptian General Authority of Survey

const DEFAULT_COORDINATES = {
  latitude: 30.0444,
  longitude: 31.2357,
};

interface LocationState {
  latitude: number;
  longitude: number;
  label: string;
  source: "default" | "geolocation" | "manual";
}

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: Timings;
    date: {
      readable: string;
      hijri: {
        date: string;
        month?: {
          ar?: string;
          en?: string;
        };
        year?: string;
      };
      gregorian: {
        date: string;
        weekday?: {
          en?: string;
        };
      };
    };
    meta?: {
      timezone?: string;
    };
  };
}

interface PrayerEvent {
  id: string;
  arabicName: string;
  englishName: string;
  icon: string;
  time: string;
  date: Date;
  isTomorrow: boolean;
}

const UI: Record<
  Lang,
  {
    currentLocation: string;
    useMyLocation: string;
    locating: string;
    enterManually: string;
    latitude: string;
    longitude: string;
    cityLabel: string;
    save: string;
    cancel: string;
    invalidCoords: string;
    nextPrayer: string;
    remaining: string;
    hijri: string;
    gregorian: string;
    loadingTimes: string;
    errorLoad: string;
    retry: string;
    passed: string;
    upcoming: string;
    allPrayers: string;
    sunrise: string;
    note: string;
    noGeolocation: string;
    geoDenied: string;
    tomorrow: string;
    manualLocation: string;
    currentLocationLabel: string;
    coordinates: string;
    calculation: string;
  }
> = {
  ar: {
    currentLocation: "الموقع الحالي",
    useMyLocation: "استخدم موقعي",
    locating: "جارٍ تحديد الموقع...",
    enterManually: "إدخال يدوي",
    latitude: "خط العرض",
    longitude: "خط الطول",
    cityLabel: "المدينة / الوصف",
    save: "حفظ",
    cancel: "إلغاء",
    invalidCoords: "أدخل إحداثيات صحيحة",
    nextPrayer: "الصلاة القادمة",
    remaining: "المتبقي",
    hijri: "التاريخ الهجري",
    gregorian: "التاريخ الميلادي",
    loadingTimes: "جارٍ تحميل المواقيت...",
    errorLoad: "تعذر تحميل مواقيت الصلاة",
    retry: "إعادة المحاولة",
    passed: "انقضت",
    upcoming: "قادمة",
    allPrayers: "مواقيت اليوم",
    sunrise: "شروق",
    note: "تُحسب المواقيت باستخدام طريقة هيئة المساحة المصرية. قد تختلف النتيجة قليلاً حسب الموقع والتوقيت المحلي.",
    noGeolocation: "المتصفح لا يدعم تحديد الموقع الجغرافي",
    geoDenied: "تم رفض إذن الموقع أو تعذر تحديده",
    tomorrow: "غدًا",
    manualLocation: "موقع يدوي",
    currentLocationLabel: "موقعك الحالي",
    coordinates: "الإحداثيات",
    calculation: "طريقة الحساب: المصرية",
  },
  en: {
    currentLocation: "Current location",
    useMyLocation: "Use my location",
    locating: "Locating...",
    enterManually: "Enter manually",
    latitude: "Latitude",
    longitude: "Longitude",
    cityLabel: "City / Label",
    save: "Save",
    cancel: "Cancel",
    invalidCoords: "Please enter valid coordinates",
    nextPrayer: "Next prayer",
    remaining: "Remaining",
    hijri: "Hijri date",
    gregorian: "Gregorian date",
    loadingTimes: "Loading prayer times...",
    errorLoad: "Unable to load prayer times",
    retry: "Retry",
    passed: "Passed",
    upcoming: "Upcoming",
    allPrayers: "Today’s times",
    sunrise: "Sunrise",
    note: "Prayer times are calculated using the Egyptian General Authority of Survey method. Results may vary slightly depending on location and local time.",
    noGeolocation: "Your browser does not support geolocation",
    geoDenied: "Location permission was denied or unavailable",
    tomorrow: "tomorrow",
    manualLocation: "Manual location",
    currentLocationLabel: "Your current location",
    coordinates: "Coordinates",
    calculation: "Calculation: Egyptian method",
  },
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function todayString(): string {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function defaultLocation(lang: Lang): LocationState {
  return {
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
    label: lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt",
    source: "default",
  };
}

function timingKey(id: string): keyof Timings {
  return `${id.charAt(0).toUpperCase()}${id.slice(1)}` as keyof Timings;
}

function parseTimeToDate(time: string, base: Date): Date {
  const [hoursPart, minutesPart] = time.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  const date = new Date(base);

  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }

  return date;
}

function formatDisplayTime(time: string, lang: Lang): string {
  const [hoursPart, minutesPart] = time.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "--:--";
  }

  const period = hours >= 12 ? (lang === "ar" ? "م" : "PM") : lang === "ar" ? "ص" : "AM";
  const hour12 = hours % 12 || 12;
  const minute = pad(minutes);

  if (lang === "ar") {
    return `${toArabicNumeral(hour12)}:${toArabicNumeral(minute)} ${period}`;
  }

  return `${hour12}:${minute} ${period}`;
}

function formatRemaining(ms: number, lang: Lang): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (lang === "ar") {
    const hoursText = toArabicNumeral(hours);
    const minutesText = toArabicNumeral(pad(minutes));

    if (hours === 0) {
      return `${minutesText} دقيقة`;
    }

    if (minutes === 0) {
      if (hours === 1) return `${hoursText} ساعة`;
      if (hours === 2) return `${hoursText} ساعتان`;
      if (hours <= 10) return `${hoursText} ساعات`;
      return `${hoursText} ساعة`;
    }

    if (hours === 1) return `ساعة و${minutesText} دقيقة`;
    if (hours === 2) return `ساعتان و${minutesText} دقيقة`;
    if (hours <= 10) return `${hoursText} ساعات و${minutesText} دقيقة`;

    return `${hoursText} ساعة و${minutesText} دقيقة`;
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function getNextPrayer(timings: Timings, now: Date): PrayerEvent {
  const events: PrayerEvent[] = PRAYERS.map((prayer) => {
    const key = timingKey(prayer.id);
    const time = timings[key] ?? "--:--";
    const date = parseTimeToDate(time, now);

    return {
      id: prayer.id,
      arabicName: prayer.arabicName,
      englishName: prayer.englishName,
      icon: prayer.icon,
      time,
      date,
      isTomorrow: false,
    };
  });

  const upcoming = events.find((event) => event.date.getTime() > now.getTime());

  if (upcoming) {
    return upcoming;
  }

  const first = events[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    ...first,
    date: parseTimeToDate(first.time, tomorrow),
    isTomorrow: true,
  };
}

export default function PrayerTimesContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";

  const [location, setLocation] = useState<LocationState>(() =>
    defaultLocation(lang)
  );
  const [timings, setTimings] = useState<Timings | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);
  const [gregorianDate, setGregorianDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  // ===== تحميل الموقع المحفوظ =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocationState>;

        if (
          typeof parsed.latitude === "number" &&
          typeof parsed.longitude === "number" &&
          parsed.latitude >= -90 &&
          parsed.latitude <= 90 &&
          parsed.longitude >= -180 &&
          parsed.longitude <= 180
        ) {
          const source: LocationState["source"] =
            parsed.source === "geolocation" ||
            parsed.source === "manual" ||
            parsed.source === "default"
              ? parsed.source
              : "manual";

          const nextLocation: LocationState = {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            label:
              typeof parsed.label === "string" && parsed.label.trim()
                ? parsed.label
                : defaultLocation(lang).label,
            source,
          };

          setLocation(nextLocation);
          setLatInput(String(nextLocation.latitude));
          setLngInput(String(nextLocation.longitude));
          setLabelInput(nextLocation.label);
        }
      }
    } catch {
      // تجاهل أخطاء القراءة
    } finally {
      setHydrated(true);
    }
  }, [lang]);

  // ===== تحديث الوقت كل 30 ثانية =====
  useEffect(() => {
    setNow(new Date());

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  // ===== جلب المواقيت =====
  const fetchTimings = useCallback(
    async (loc: LocationState) => {
      setLoading(true);
      setError(null);

      try {
        const url = `https://api.aladhan.com/v1/timings/${todayString()}?latitude=${loc.latitude}&longitude=${loc.longitude}&method=${CALCULATION_METHOD}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(ui.errorLoad);
        }

        const json = (await res.json()) as AladhanResponse;

        if (json.code !== 200 || !json.data?.timings) {
          throw new Error(ui.errorLoad);
        }

        setTimings(json.data.timings);
        setHijriDate(json.data.date?.hijri?.date ?? null);
        setGregorianDate(json.data.date?.gregorian?.date ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : ui.errorLoad);
        setTimings(null);
      } finally {
        setLoading(false);
      }
    },
    [ui.errorLoad]
  );

  useEffect(() => {
    if (!hydrated) return;

    fetchTimings(location);
  }, [fetchTimings, hydrated, location]);

  // ===== حفظ الموقع =====
  const persistLocation = useCallback((loc: LocationState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // تجاهل أخطاء الحفظ
    }

    setLatInput(String(loc.latitude));
    setLngInput(String(loc.longitude));
    setLabelInput(loc.label);
  }, []);

  const applyLocation = useCallback(
    (loc: LocationState) => {
      setLocation(loc);
      persistLocation(loc);
      setManualOpen(false);
      setError(null);
    },
    [persistLocation]
  );

  // ===== طلب الموقع الجغرافي =====
  const requestGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(ui.noGeolocation);
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: LocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: isRTL ? ui.currentLocationLabel : ui.currentLocationLabel,
          source: "geolocation",
        };

        applyLocation(loc);
        setGeoLoading(false);
      },
      (err) => {
        setError(err.message || ui.geoDenied);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  }, [applyLocation, isRTL, ui.currentLocationLabel, ui.geoDenied, ui.noGeolocation]);

  // ===== حفظ الإدخال اليدوي =====
  const saveManual = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const lat = Number(latInput);
      const lng = Number(lngInput);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        setError(ui.invalidCoords);
        return;
      }

      const loc: LocationState = {
        latitude: lat,
        longitude: lng,
        label: labelInput.trim() || (isRTL ? ui.manualLocation : ui.manualLocation),
        source: "manual",
      };

      applyLocation(loc);
    },
    [applyLocation, isRTL, labelInput, latInput, lngInput, ui.invalidCoords, ui.manualLocation]
  );

  const nextPrayer = useMemo(() => {
    if (!timings || !now) return null;
    return getNextPrayer(timings, now);
  }, [now, timings]);

  const locationLabel =
    location.source === "default"
      ? isRTL
        ? "القاهرة، مصر (افتراضي)"
        : "Cairo, Egypt (default)"
      : location.label;

  return (
    <section className="container-page py-10 md:py-14">
      {/* ===== بطاقة الموقع ===== */}
      <div className="card mb-8 p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-bold text-primary-600 dark:text-primary-400">
              {ui.currentLocation}
            </p>

            <h2
              className="text-xl font-black text-slate-900 md:text-2xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {locationLabel}
            </h2>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {ui.coordinates}: {location.latitude.toFixed(4)},{" "}
              {location.longitude.toFixed(4)} • {ui.calculation}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={requestGeolocation}
              disabled={geoLoading}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-70"
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
                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {geoLoading ? ui.locating : ui.useMyLocation}
            </button>

            <button
              type="button"
              onClick={() => setManualOpen((open) => !open)}
              className="btn-outline inline-flex items-center gap-2"
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
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              {ui.enterManually}
            </button>
          </div>
        </div>

        {manualOpen && (
          <form
            onSubmit={saveManual}
            className="mt-6 grid gap-4 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 md:grid-cols-3 dark:border-night-700 dark:bg-night-800/50"
          >
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {ui.latitude}
              </label>
              <input
                type="number"
                step="any"
                value={latInput}
                onChange={(event) => setLatInput(event.target.value)}
                placeholder="30.0444"
                className="input-islamic"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {ui.longitude}
              </label>
              <input
                type="number"
                step="any"
                value={lngInput}
                onChange={(event) => setLngInput(event.target.value)}
                placeholder="31.2357"
                className="input-islamic"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {ui.cityLabel}
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(event) => setLabelInput(event.target.value)}
                placeholder={isRTL ? "القاهرة" : "Cairo"}
                className="input-islamic"
              />
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-3">
              <button type="submit" className="btn-primary">
                {ui.save}
              </button>

              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="btn-ghost"
              >
                {ui.cancel}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===== حالة الخطأ ===== */}
      {error && !timings && (
        <div className="card mb-8 border-red-200 p-8 text-center dark:border-red-900/40">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-300">
            {ui.errorLoad}
          </h2>

          <p className="mb-6 text-slate-500 dark:text-slate-400">{error}</p>

          <button
            type="button"
            onClick={() => fetchTimings(location)}
            className="btn-primary"
          >
            {ui.retry}
          </button>
        </div>
      )}

      {/* ===== حالة التحميل ===== */}
      {loading && !timings && !error && (
        <div className="card mb-8 p-10 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-night-700 dark:border-t-primary-400" />

          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {ui.loadingTimes}
          </p>
        </div>
      )}

      {/* ===== الصلاة القادمة ===== */}
      {timings && nextPrayer && now && (
        <div
          className="card relative mb-8 overflow-hidden p-6 text-white md:p-10"
          style={{
            background:
              "linear-gradient(135deg, #083344 0%, #0e7490 55%, #06b6d4 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
              backgroundSize: "60px 60px, 90px 90px",
            }}
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold text-gold-300">
                {ui.nextPrayer}
              </p>

              <h2
                className="mb-3 text-4xl font-black leading-tight md:text-5xl"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {isRTL ? nextPrayer.arabicName : nextPrayer.englishName}
              </h2>

              <p className="text-2xl font-black text-gold-200 md:text-3xl">
                {formatDisplayTime(nextPrayer.time, lang)}
              </p>

              <p className="mt-4 text-lg font-semibold text-primary-50">
                {ui.remaining}:{" "}
                <span className="text-gold-200">
                  {formatRemaining(nextPrayer.date.getTime() - now.getTime(), lang)}
                </span>

                {nextPrayer.isTomorrow && (
                  <span className="ms-2 text-sm text-primary-100">
                    ({ui.tomorrow})
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="mb-1 text-xs font-bold text-primary-100">
                  {ui.hijri}
                </p>
                <p className="text-lg font-black text-white">
                  {hijriDate ?? "--"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="mb-1 text-xs font-bold text-primary-100">
                  {ui.gregorian}
                </p>
                <p className="text-lg font-black text-white">
                  {gregorianDate ?? "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== كل المواقيت ===== */}
      {timings && (
        <>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {ui.allPrayers}
            </h2>

            {now && (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {formatDisplayTime(
                  `${pad(now.getHours())}:${pad(now.getMinutes())}`,
                  lang
                )}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRAYERS.map((prayer) => {
              const key = timingKey(prayer.id);
              const time = timings[key] ?? "--:--";
              const prayerDate = now ? parseTimeToDate(time, now) : null;
              const isNext = nextPrayer?.id === prayer.id;
              const isPassed =
                !!now && !!prayerDate && prayerDate.getTime() <= now.getTime();

              return (
                <div
                  key={prayer.id}
                  className={`card p-5 transition-all duration-300 ${
                    isNext
                      ? "border-primary-400 bg-primary-50/70 shadow-lg shadow-primary-500/10 dark:border-primary-600 dark:bg-primary-950/30"
                      : isPassed
                      ? "opacity-70"
                      : ""
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/40">
                        {prayer.icon}
                      </span>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {isRTL ? prayer.arabicName : prayer.englishName}
                        </h3>

                        {prayer.id === "sunrise" && (
                          <p className="text-xs font-semibold text-gold-600 dark:text-gold-400">
                            {ui.sunrise}
                          </p>
                        )}
                      </div>
                    </div>

                    {isNext && (
                      <span className="badge-gold">
                        {isRTL ? "القادمة" : "Next"}
                      </span>
                    )}
                  </div>

                  <p className="text-3xl font-black text-primary-700 dark:text-primary-300">
                    {formatDisplayTime(time, lang)}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {isNext
                      ? ui.nextPrayer
                      : isPassed
                      ? ui.passed
                      : ui.upcoming}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="card mt-8 p-5 text-center">
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {ui.note}
            </p>
          </div>
        </>
      )}
    </section>
  );
}