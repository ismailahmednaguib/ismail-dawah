// app/[lang]/qibla/qibla-content.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toArabicNumeral } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "dawah_qibla_location_v1";

// إحداثيات الكعبة المشرفة
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

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

interface QiblaResult {
  bearing: number;
  distanceKm: number;
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
    qiblaDirection: string;
    fromNorth: string;
    distance: string;
    km: string;
    m: string;
    compassHint: string;
    rotateDevice: string;
    alignArrow: string;
    kaaba: string;
    north: string;
    south: string;
    east: string;
    west: string;
    degrees: string;
    loading: string;
    errorLoad: string;
    retry: string;
    noGeolocation: string;
    geoDenied: string;
    manualLocation: string;
    currentLocationLabel: string;
    coordinates: string;
    note: string;
    accuracy: string;
    notSupported: string;
    alignCompass: string;
    pointToKaaba: string;
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
    qiblaDirection: "اتجاه القبلة",
    fromNorth: "من الشمال",
    distance: "المسافة إلى مكة",
    km: "كم",
    m: "م",
    compassHint: "وجّه البوصلة نحو السهم الفيروزي",
    rotateDevice: "قم بتدوير جهازك حتى يتماشى السهم الأحمر مع الشمال",
    alignArrow: "وجّه السهم نحو الكعبة",
    kaaba: "الكعبة",
    north: "شمال",
    south: "جنوب",
    east: "شرق",
    west: "غرب",
    degrees: "درجة",
    loading: "جارٍ الحساب...",
    errorLoad: "تعذر حساب اتجاه القبلة",
    retry: "إعادة المحاولة",
    noGeolocation: "المتصفح لا يدعم تحديد الموقع الجغرافي",
    geoDenied: "تم رفض إذن الموقع أو تعذر تحديده",
    manualLocation: "موقع يدوي",
    currentLocationLabel: "موقعك الحالي",
    coordinates: "الإحداثيات",
    note: "يُحسب اتجاه القبلة باستخدام صيغة الدائرة الكبرى (Great Circle) من موقعك إلى الكعبة المشرفة. قد يختلف قليلاً حسب دقة الجهاز والمجال المغناطيسي المحلي.",
    accuracy: "الدقة",
    notSupported: "جهازك لا يدعم البوصلة المغناطيسية",
    alignCompass: "وجّه جهازك نحو الشمال أولاً",
    pointToKaaba: "ثم اتبع السهم الفيروزي",
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
    qiblaDirection: "Qibla Direction",
    fromNorth: "from North",
    distance: "Distance to Makkah",
    km: "km",
    m: "m",
    compassHint: "Point your device toward the cyan arrow",
    rotateDevice: "Rotate your device until the red needle aligns with North",
    alignArrow: "Align the arrow toward the Kaaba",
    kaaba: "Kaaba",
    north: "N",
    south: "S",
    east: "E",
    west: "W",
    degrees: "°",
    loading: "Calculating...",
    errorLoad: "Unable to calculate Qibla direction",
    retry: "Retry",
    noGeolocation: "Your browser does not support geolocation",
    geoDenied: "Location permission was denied or unavailable",
    manualLocation: "Manual location",
    currentLocationLabel: "Your current location",
    coordinates: "Coordinates",
    note: "Qibla direction is calculated using the Great Circle formula from your location to the Kaaba. Results may vary slightly depending on device accuracy and local magnetic interference.",
    accuracy: "Accuracy",
    notSupported: "Your device does not support the magnetometer",
    alignCompass: "Point your device toward North first",
    pointToKaaba: "Then follow the cyan arrow",
  },
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

function calculateQibla(lat: number, lng: number): QiblaResult {
  const lat1 = toRadians(lat);
  const lon1 = toRadians(lng);
  const lat2 = toRadians(KAABA_LAT);
  const lon2 = toRadians(KAABA_LNG);

  const deltaLon = lon2 - lon1;

  const y = Math.sin(deltaLon);
  const x =
    Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLon);

  const bearing = normalizeBearing(toDegrees(Math.atan2(y, x)));

  // Haversine distance
  const R = 6371; // Earth radius in km
  const dLat = lat2 - lat1;
  const dLon = deltaLon;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return { bearing, distanceKm };
}

function formatNumber(value: number, lang: Lang): string {
  return lang === "ar" ? toArabicNumeral(value) : String(value);
}

function formatDistance(km: number, lang: Lang): string {
  const ui = UI[lang] || UI.ar;

  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${formatNumber(meters, lang)} ${ui.m}`;
  }

  const rounded = Math.round(km);
  return `${formatNumber(rounded, lang)} ${ui.km}`;
}

function compassLabel(angle: number, lang: Lang): string {
  const ui = UI[lang] || UI.ar;
  const directions = [
    ui.north,
    lang === "ar" ? "ش ق" : "NE",
    ui.east,
    lang === "ar" ? "ج ق" : "SE",
    ui.south,
    lang === "ar" ? "ج غ" : "SW",
    ui.west,
    lang === "ar" ? "ش غ" : "NW",
  ];
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

function defaultLocation(lang: Lang): LocationState {
  return {
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
    label: lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt",
    source: "default",
  };
}

export default function QiblaContent({ lang }: { lang: Lang }) {
  const ui = UI[lang] || UI.ar;
  const isRTL = lang === "ar";

  const [location, setLocation] = useState<LocationState>(() =>
    defaultLocation(lang)
  );
  const [hydrated, setHydrated] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState<boolean | null>(null);

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

  // ===== البوصلة المغناطيسية =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasOrientation =
      "DeviceOrientationEvent" in window ||
      "webkitCompassHeading" in window;

    setCompassSupported(hasOrientation);

    if (!hasOrientation) return;

    const handler = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      let heading: number | null = null;

      if (typeof event.webkitCompassHeading === "number") {
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = normalizeBearing(360 - event.alpha);
      }

      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    window.addEventListener("deviceorientation", handler, true);
    window.addEventListener("deviceorientationabsolute", handler as EventListener, true);

    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      window.removeEventListener("deviceorientationabsolute", handler as EventListener, true);
    };
  }, []);

  // ===== حساب القبلة =====
  const qibla = useMemo(() => {
    if (!hydrated) return null;
    return calculateQibla(location.latitude, location.longitude);
  }, [hydrated, location.latitude, location.longitude]);

  // ===== زاوية السهم بالنسبة للبوصلة =====
  const arrowAngle = useMemo(() => {
    if (!qibla) return 0;
    if (deviceHeading === null) return qibla.bearing;
    return normalizeBearing(qibla.bearing - deviceHeading);
  }, [deviceHeading, qibla]);

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
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: LocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: ui.currentLocationLabel,
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
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [applyLocation, ui.currentLocationLabel, ui.geoDenied, ui.noGeolocation]);

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
        label: labelInput.trim() || ui.manualLocation,
        source: "manual",
      };

      applyLocation(loc);
    },
    [applyLocation, labelInput, latInput, lngInput, ui.invalidCoords, ui.manualLocation]
  );

  const locationLabel =
    location.source === "default"
      ? isRTL
        ? "القاهرة، مصر (افتراضي)"
        : "Cairo, Egypt (default)"
      : location.label;

  // ===== زوايا البوصلة =====
  const northAngle = deviceHeading !== null ? normalizeBearing(-deviceHeading) : 0;

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
              {location.longitude.toFixed(4)}
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
      {error && (
        <div className="card mb-8 border-red-200 p-6 text-center dark:border-red-900/40">
          <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="btn-ghost"
          >
            {ui.retry}
          </button>
        </div>
      )}

      {/* ===== البوصلة ===== */}
      {qibla && (
        <div className="card relative mb-8 overflow-hidden p-6 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
            {/* البوصلة الدائرية */}
            <div className="relative flex flex-col items-center">
              <div
                className="relative flex h-72 w-72 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-primary-50 via-white to-gold-50 shadow-islamic md:h-96 md:w-96 dark:border-night-800 dark:from-night-800 dark:via-night-900 dark:to-night-950"
                style={{
                  transform: `rotate(${northAngle}deg)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                {/* علامات الاتجاهات */}
                {[
                  { angle: 0, label: ui.north, color: "text-red-600" },
                  { angle: 90, label: ui.east, color: "text-slate-500" },
                  { angle: 180, label: ui.south, color: "text-slate-500" },
                  { angle: 270, label: ui.west, color: "text-slate-500" },
                ].map((dir) => (
                  <span
                    key={dir.angle}
                    className={`absolute text-sm font-black ${dir.color}`}
                    style={{
                      transform: `rotate(${dir.angle}deg) translateY(-${
                        dir.angle % 90 === 0 ? 130 : 125
                      }px)`,
                    }}
                  >
                    {dir.label}
                  </span>
                ))}

                {/* خطوط الدرجات */}
                {Array.from({ length: 36 }).map((_, i) => {
                  const angle = i * 10;
                  const isMajor = angle % 90 === 0;
                  const isMid = angle % 30 === 0;
                  return (
                    <span
                      key={angle}
                      className={`absolute left-1/2 top-1/2 origin-top ${
                        isMajor
                          ? "h-4 w-0.5 bg-slate-400"
                          : isMid
                          ? "h-3 w-px bg-slate-300"
                          : "h-2 w-px bg-slate-200"
                      }`}
                      style={{
                        transform: `rotate(${angle}deg) translateY(-${
                          isMajor ? 120 : 125
                        }px)`,
                      }}
                    />
                  );
                })}

                {/* سهم القبلة */}
                <div
                  className="absolute left-1/2 top-1/2 z-10 origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${qibla.bearing - northAngle}deg)`,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <svg
                    width="40"
                    height="140"
                    viewBox="0 0 40 140"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="qiblaArrow"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0e7490" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 0L32 40H26V130H14V40H8L20 0Z"
                      fill="url(#qiblaArrow)"
                    />
                    <circle cx="20" cy="130" r="6" fill="#d4af37" />
                  </svg>
                </div>

                {/* الكعبة في المنتصف */}
                <div className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-3xl shadow-lg">
                  🕋
                </div>

                {/* المركز */}
                <div className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500 shadow-md" />
              </div>

              {/* اتجاه الجهاز */}
              {deviceHeading !== null && (
                <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {ui.accuracy}: {formatNumber(Math.round(deviceHeading), lang)}
                  {ui.degrees}
                </p>
              )}
            </div>

            {/* معلومات القبلة */}
            <div className="w-full max-w-md">
              <div className="card mb-5 p-6">
                <p className="mb-2 text-sm font-bold text-primary-600 dark:text-primary-400">
                  {ui.qiblaDirection}
                </p>

                <p className="text-5xl font-black text-slate-900 md:text-6xl dark:text-white">
                  {formatNumber(Math.round(qibla.bearing), lang)}
                  <span className="ms-1 text-2xl text-gold-500">
                    {ui.degrees}
                  </span>
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {ui.fromNorth} • {compassLabel(qibla.bearing, lang)}
                </p>
              </div>

              <div className="card mb-5 p-6">
                <p className="mb-2 text-sm font-bold text-gold-600 dark:text-gold-400">
                  {ui.distance}
                </p>

                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatDistance(qibla.distanceKm, lang)}
                </p>
              </div>

              {/* تعليمات البوصلة */}
              <div className="card border-primary-200 bg-primary-50/50 p-5 dark:border-primary-800/40 dark:bg-primary-950/20">
                <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                  🧭 {ui.compassHint}
                </p>

                {compassSupported === false ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {ui.notSupported}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {ui.alignCompass}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {ui.pointToKaaba}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== حالة التحميل ===== */}
      {!qibla && hydrated && (
        <div className="card mb-8 p-10 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-night-700 dark:border-t-primary-400" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {ui.loading}
          </p>
        </div>
      )}

      {/* ===== ملاحظة ===== */}
      <div className="card p-5 text-center">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {ui.note}
        </p>
      </div>
    </section>
  );
}