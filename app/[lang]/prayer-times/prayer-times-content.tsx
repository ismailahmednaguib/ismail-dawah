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

const STORAGE_KEY = "dawah_prayer_location_v2";
const SETTINGS_KEY = "dawah_prayer_settings_v1";

const DEFAULT_COORDINATES = {
  latitude: 30.0444,
  longitude: 31.2357,
};

// طرق الحساب المتاحة
const CALCULATION_METHODS = [
  { id: 3, ar: "جامعة أم القرى (مكة)", en: "Umm al-Qura (Makkah)" },
  { id: 5, ar: "الهيئة المصرية العامة للمساحة", en: "Egyptian General Authority" },
  { id: 2, ar: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)", en: "Islamic Society of North America (ISNA)" },
  { id: 1, ar: "رابطة العالم الإسلامي", en: "Muslim World League" },
  { id: 8, ar: "الخليج 918 (الكويت، قطر، الإمارات)", en: "Gulf Region (Kuwait, Qatar, UAE)" },
  { id: 13, ar: "ديانة تركيا", en: "Diyanet (Turkey)" },
];

interface LocationState {
  latitude: number;
  longitude: number;
  label: string;
  source: "default" | "geolocation" | "manual";
}

interface PrayerSettings {
  method: number;
  soundEnabled: boolean;
  adhanEnabled: boolean;
  notifyBefore: number; // دقائق قبل الصلاة
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
        month?: { ar?: string; en?: string };
        year?: string;
      };
      gregorian: {
        date: string;
        weekday?: { en?: string };
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
    settings: string;
    method: string;
    soundAlert: string;
    adhanAlert: string;
    notifyBefore: string;
    minutesBefore: string;
    settingsSaved: string;
    timeNow: string;
    currentTime: string;
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
    note: "قد تختلف المواقيت قليلاً حسب الموقع والتوقيت المحلي وطريقة الحساب المختارة.",
    noGeolocation: "المتصفح لا يدعم تحديد الموقع الجغرافي",
    geoDenied: "تم رفض إذن الموقع أو تعذر تحديده",
    tomorrow: "غدًا",
    manualLocation: "موقع يدوي",
    currentLocationLabel: "موقعك الحالي",
    coordinates: "الإحداثيات",
    calculation: "طريقة الحساب",
    settings: "الإعدادات",
    method: "طريقة حساب المواقيت",
    soundAlert: "تنبيه صوتي عند اقتراب الصلاة",
    adhanAlert: "تشغيل الأذان عند دخول الوقت",
    notifyBefore: "التنبيه قبل الصلاة بـ",
    minutesBefore: "دقائق",
    settingsSaved: "تم حفظ الإعدادات",
    timeNow: "الوقت الحالي",
    currentTime: "الآن",
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
    allPrayers: "Today's times",
    sunrise: "Sunrise",
    note: "Prayer times may vary slightly depending on location, local time, and selected calculation method.",
    noGeolocation: "Your browser does not support geolocation",
    geoDenied: "Location permission was denied or unavailable",
    tomorrow: "tomorrow",
    manualLocation: "Manual location",
    currentLocationLabel: "Your current location",
    coordinates: "Coordinates",
    calculation: "Calculation method",
    settings: "Settings",
    method: "Prayer times calculation method",
    soundAlert: "Sound alert when prayer approaches",
    adhanAlert: "Play adhan at prayer time",
    notifyBefore: "Notify before prayer by",
    minutesBefore: "minutes",
    settingsSaved: "Settings saved",
    timeNow: "Current time",
    currentTime: "Now",
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

function defaultSettings(): PrayerSettings {
  return {
    method: 5,
    soundEnabled: true,
    adhanEnabled: false,
    notifyBefore: 10,
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

    if (hours === 0) return `${minutesText} دقيقة`;
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

  if (hours === 0) return `${minutes}m`;
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
  if (upcoming) return upcoming;

  const first = events[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    ...first,
    date: parseTimeToDate(first.time, tomorrow),
    isTomorrow: true,
  };
}

// تنبيه صوتي بسيط
function playBeep() {
  try {
    if (typeof window === "undefined" || !window.AudioContext) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch {
    // تجاهل
  }
}

export default function PrayerTimesContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";

  const [location, setLocation] = useState<LocationState>(() => defaultLocation(lang));
  const [settings, setSettings] = useState<PrayerSettings>(() => defaultSettings());
  const [timings, setTimings] = useState<Timings | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);
  const [gregorianDate, setGregorianDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [lastNotifiedPrayer, setLastNotifiedPrayer] = useState<string | null>(null);

  // ===== تحميل الموقع والإعدادات =====
  useEffect(() => {
    try {
      const locRaw = localStorage.getItem(STORAGE_KEY);
      if (locRaw) {
        const parsed = JSON.parse(locRaw) as Partial<LocationState>;
        if (
          typeof parsed.latitude === "number" &&
          typeof parsed.longitude === "number" &&
          parsed.latitude >= -90 && parsed.latitude <= 90 &&
          parsed.longitude >= -180 && parsed.longitude <= 180
        ) {
          const source: LocationState["source"] =
            parsed.source === "geolocation" || parsed.source === "manual" || parsed.source === "default"
              ? parsed.source
              : "manual";

          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            label: typeof parsed.label === "string" && parsed.label.trim() ? parsed.label : defaultLocation(lang).label,
            source,
          });
          setLatInput(String(parsed.latitude));
          setLngInput(String(parsed.longitude));
          setLabelInput(parsed.label || "");
        }
      }

      const settingsRaw = localStorage.getItem(SETTINGS_KEY);
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw) as Partial<PrayerSettings>;
        setSettings({ ...defaultSettings(), ...parsed });
      }
    } catch {
      // تجاهل
    } finally {
      setHydrated(true);
    }
  }, [lang]);

  // ===== تحديث الوقت كل 10 ثوانٍ =====
  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 10000);
    return () => window.clearInterval(interval);
  }, []);

  // ===== جلب المواقيت =====
  const fetchTimings = useCallback(
    async (loc: LocationState, method: number) => {
      setLoading(true);
      setError(null);

      try {
        const url = `https://api.aladhan.com/v1/timings/${todayString()}?latitude=${loc.latitude}&longitude=${loc.longitude}&method=${method}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(ui.errorLoad);
        const json = (await res.json()) as AladhanResponse;
        if (json.code !== 200 || !json.data?.timings) throw new Error(ui.errorLoad);

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
    fetchTimings(location, settings.method);
  }, [fetchTimings, hydrated, location, settings.method]);

  // ===== حفظ الموقع =====
  const persistLocation = useCallback((loc: LocationState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {}
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

  // ===== حفظ الإعدادات =====
  const saveSettings = useCallback((newSettings: PrayerSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch {}
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  }, []);

  // ===== طلب الموقع الجغرافي =====
  const requestGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(ui.noGeolocation);
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: ui.currentLocationLabel,
          source: "geolocation",
        });
        setGeoLoading(false);
      },
      (err) => {
        setError(err.message || ui.geoDenied);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, [applyLocation, ui.currentLocationLabel, ui.geoDenied, ui.noGeolocation]);

  // ===== حفظ الإدخال اليدوي =====
  const saveManual = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const lat = Number(latInput);
      const lng = Number(lngInput);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError(ui.invalidCoords);
        return;
      }
      applyLocation({
        latitude: lat,
        longitude: lng,
        label: labelInput.trim() || ui.manualLocation,
        source: "manual",
      });
    },
    [applyLocation, labelInput, latInput, lngInput, ui.invalidCoords, ui.manualLocation]
  );

  const nextPrayer = useMemo(() => {
    if (!timings || !now) return null;
    return getNextPrayer(timings, now);
  }, [now, timings]);

  // ===== تنبيه عند اقتراب الصلاة =====
  useEffect(() => {
    if (!nextPrayer || !now || !settings.soundEnabled) return;
    const msUntil = nextPrayer.date.getTime() - now.getTime();
    const minutesUntil = msUntil / 60000;

    if (
      minutesUntil <= settings.notifyBefore &&
      minutesUntil > 0 &&
      lastNotifiedPrayer !== nextPrayer.id
    ) {
      playBeep();
      setLastNotifiedPrayer(nextPrayer.id);
    }

    // إعادة تعيين عند تغيير الصلاة القادمة
    if (lastNotifiedPrayer && lastNotifiedPrayer !== nextPrayer.id) {
      setLastNotifiedPrayer(null);
    }
  }, [nextPrayer, now, settings.soundEnabled, settings.notifyBefore, lastNotifiedPrayer]);

  const locationLabel =
    location.source === "default"
      ? isRTL
        ? "القاهرة، مصر (افتراضي)"
        : "Cairo, Egypt (default)"
      : location.label;

  const methodName = CALCULATION_METHODS.find((m) => m.id === settings.method);

  // حساب نسبة الوقت المتبقي للصلاة القادمة
  const progressPercent = useMemo(() => {
    if (!nextPrayer || !now || !timings) return 0;
    const prayersList = PRAYERS.map((p) => ({
      id: p.id,
      date: parseTimeToDate(timings[timingKey(p.id)] ?? "00:00", now),
    }));

    const currentIdx = prayersList.findIndex((p) => p.id === nextPrayer.id);
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : prayersList.length - 1;
    const prevPrayer = prayersList[prevIdx];

    let prevDate = prevPrayer.date;
    if (currentIdx === 0 && nextPrayer.isTomorrow) {
      // إذا كانت الصلاة القادمة غداً، فالصلاة السابقة اليوم
      prevDate = prevPrayer.date;
    } else if (now.getTime() < prevDate.getTime()) {
      prevDate = new Date(prevDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const totalMs = nextPrayer.date.getTime() - prevDate.getTime();
    const elapsedMs = now.getTime() - prevDate.getTime();

    if (totalMs <= 0) return 100;
    return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  }, [nextPrayer, now, timings]);

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
              {location.longitude.toFixed(4)} • {ui.calculation}:{" "}
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {isRTL ? methodName?.ar : methodName?.en}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={requestGeolocation}
              disabled={geoLoading}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-70"
              aria-label={ui.useMyLocation}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {geoLoading ? ui.locating : ui.useMyLocation}
            </button>

            <button
              type="button"
              onClick={() => setManualOpen((open) => !open)}
              className="btn-outline inline-flex items-center gap-2"
              aria-label={ui.enterManually}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              {ui.enterManually}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              className="btn-outline inline-flex items-center gap-2"
              aria-label={ui.settings}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {ui.settings}
            </button>
          </div>
        </div>

        {/* رسالة الحفظ */}
        {savedMessage && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm font-bold text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300">
            ✓ {ui.settingsSaved}
          </div>
        )}

        {/* ===== الإدخال اليدوي ===== */}
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
              <button type="submit" className="btn-primary">{ui.save}</button>
              <button type="button" onClick={() => setManualOpen(false)} className="btn-ghost">
                {ui.cancel}
              </button>
            </div>
          </form>
        )}

        {/* ===== الإعدادات ===== */}
        {settingsOpen && (
          <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/50 p-5 dark:border-gold-900/30 dark:bg-gold-950/20">
            <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
              ⚙️ {ui.settings}
            </h3>

            <div className="space-y-4">
              {/* طريقة الحساب */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.method}
                </label>
                <select
                  value={settings.method}
                  onChange={(e) => saveSettings({ ...settings, method: Number(e.target.value) })}
                  className="input-islamic"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {isRTL ? m.ar : m.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* التنبيهات */}
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-night-700 dark:bg-night-800">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => saveSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      🔔 {ui.soundAlert}
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-night-700 dark:bg-night-800">
                  <input
                    type="checkbox"
                    checked={settings.adhanEnabled}
                    onChange={(e) => saveSettings({ ...settings, adhanEnabled: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      🕌 {ui.adhanAlert}
                    </p>
                  </div>
                </label>
              </div>

              {/* دقائق قبل الصلاة */}
              {settings.soundEnabled && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.notifyBefore}: <span className="text-primary-600 dark:text-primary-400">{settings.notifyBefore}</span> {ui.minutesBefore}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={settings.notifyBefore}
                    onChange={(e) => saveSettings({ ...settings, notifyBefore: Number(e.target.value) })}
                    className="w-full accent-primary-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>5</span>
                    <span>15</span>
                    <span>30</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            onClick={() => fetchTimings(location, settings.method)}
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
            background: "linear-gradient(135deg, #083344 0%, #0e7490 55%, #06b6d4 100%)",
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

              <p className="mt-2 text-sm text-primary-100">
                🕐 {ui.currentTime}: {formatDisplayTime(
                  `${pad(now.getHours())}:${pad(now.getMinutes())}`,
                  lang
                )}
              </p>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="#d4af37"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - progressPercent / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 text-xs font-bold text-primary-100">{ui.hijri}</p>
                  <p className="text-base font-black text-white">{hijriDate ?? "--"}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-1 text-xs font-bold text-primary-100">{ui.gregorian}</p>
                  <p className="text-base font-black text-white">{gregorianDate ?? "--"}</p>
                </div>
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
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                🕐 {ui.timeNow}: {formatDisplayTime(
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
              const isPassed = !!now && !!prayerDate && prayerDate.getTime() <= now.getTime();

              return (
                <div
                  key={prayer.id}
                  className={`card relative overflow-hidden p-5 transition-all duration-300 ${
                    isNext
                      ? "border-primary-400 bg-primary-50/70 shadow-lg shadow-primary-500/10 dark:border-primary-600 dark:bg-primary-950/30"
                      : isPassed
                      ? "opacity-70"
                      : ""
                  }`}
                >
                  {isNext && (
                    <div className="gradient-primary absolute inset-x-0 top-0 h-1" />
                  )}

                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                          isNext
                            ? "bg-primary-500 text-white shadow-lg"
                            : "bg-primary-100 dark:bg-primary-900/40"
                        }`}
                      >
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

                    {isPassed && !isNext && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="text-3xl font-black text-primary-700 dark:text-primary-300">
                    {formatDisplayTime(time, lang)}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {isNext ? ui.nextPrayer : isPassed ? ui.passed : ui.upcoming}
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