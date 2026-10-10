// app/[lang]/map/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";

// ============================================================
// الأنواع
// ============================================================

type Place = {
  id: string;
  name: string;
  area: string;
  note?: string;
  day?: string;
  lat?: number;
  lng?: number;
  address?: string;
  type?: string;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  loading: string;
  noPlacesTitle: string;
  noPlacesDesc: string;
  retryButton: string;
  placesCount: string;
  areasCount: string;
  daysCount: string;
  allPlacesTitle: string;
  allPlacesDesc: string;
  clickHint: string;
  detailsTitle: string;
  openMaps: string;
  close: string;
  distance: string;
  distanceUnit: string;
  unknownDistance: string;
  todayLesson: string;
  address: string;
  verse: string;
  verseSource: string;
  relatedTitle: string;
  livePage: string;
  livePageDesc: string;
  prayerTimesPage: string;
  prayerTimesPageDesc: string;
  qiblaPage: string;
  qiblaPageDesc: string;
  contactPage: string;
  contactPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  locationEnabled: string;
  locationDisabled: string;
  locationDesc: string;
  nearest: string;
  search: string;
  searchPlaceholder: string;
  clearSearch: string;
  all: string;
  noSearchResults: string;
  noSearchResultsDesc: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "خريطة الدروس والمساجد",
    subtitle: "اعرف أقرب مكان لحضور دروس الشيخ",
    home: "الرئيسية",
    description:
      "خريطة تفاعلية تعرض أماكن دروس الشيخ إسماعيل أحمد نجيب والمساجد التي يُقيم فيها المجالس، مع حساب المسافة من موقعك الحالي.",
    loading: "جاري تحميل الأماكن...",
    noPlacesTitle: "لا توجد أماكن مسجلة حالياً",
    noPlacesDesc: "سيتم إضافة أماكن الدروس والمجالس قريباً إن شاء الله.",
    retryButton: "إعادة المحاولة",
    placesCount: "مكان للدروس",
    areasCount: "منطقة مختلفة",
    daysCount: "أيام في الأسبوع",
    allPlacesTitle: "كل الأماكن",
    allPlacesDesc: "اضغط على أي مكان لمعرفة التفاصيل وفتحه في خرائط جوجل.",
    clickHint: "اضغط على المكان لعرض التفاصيل",
    detailsTitle: "تفاصيل المكان",
    openMaps: "افتح في خرائط جوجل",
    close: "إغلاق",
    distance: "المسافة من موقعك",
    distanceUnit: "كم",
    unknownDistance: "غير محدد",
    todayLesson: "يوم الدرس",
    address: "العنوان",
    verse: "﴿ إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ ﴾",
    verseSource: "سورة التوبة — الآية 18",
    relatedTitle: "صفحات ذات صلة",
    livePage: "البث المباشر",
    livePageDesc: "تابع الدروس الحية.",
    prayerTimesPage: "مواقيت الصلاة",
    prayerTimesPageDesc: "أوقات الصلاة في منطقتك.",
    qiblaPage: "اتجاه القبلة",
    qiblaPageDesc: "بوصلة القبلة الدقيقة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار عن المواعيد.",
    noteTitle: "تنبيهات مهمة",
    note1: "قد تتغير مواعيد الدروس بسبب الظروف الطارئة أو المناسبات. يُفضل التأكد قبل الحضور.",
    note2: "الصف مفتوح للجميع، ولا يشترط تسجيل مسبق في معظم الدروس.",
    note3: "يرجى الالتزام بآداب المجلس: الإنصات، عدم التصوير بدون إذن، وإغلاق الهاتف.",
    locationEnabled: "✓ موقعك مفعّل",
    locationDisabled: "الموقع غير متاح",
    locationDesc: "نستخدم موقعك فقط لحساب المسافة إلى أقرب مسجد.",
    nearest: "الأقرب إليك",
    search: "بحث",
    searchPlaceholder: "ابحث عن مسجد أو منطقة...",
    clearSearch: "مسح البحث",
    all: "الكل",
    noSearchResults: "لا توجد نتائج مطابقة",
    noSearchResultsDesc: "جرّب كلمة أخرى أو اختر منطقة مختلفة.",
  },
  en: {
    title: "Lessons & Mosques Map",
    subtitle: "Find the nearest location to attend the Sheikh's lessons",
    home: "Home",
    description:
      "An interactive map showing Sheikh Ismail Ahmed Naguib's lesson locations and mosques, with distance calculation from your current location.",
    loading: "Loading places...",
    noPlacesTitle: "No places registered yet",
    noPlacesDesc: "Lesson and gathering locations will be added soon, in sha Allah.",
    retryButton: "Retry",
    placesCount: "Lesson locations",
    areasCount: "Different areas",
    daysCount: "Days per week",
    allPlacesTitle: "All Locations",
    allPlacesDesc: "Click on any location to view details and open in Google Maps.",
    clickHint: "Click to view details",
    detailsTitle: "Location Details",
    openMaps: "Open in Google Maps",
    close: "Close",
    distance: "Distance from you",
    distanceUnit: "km",
    unknownDistance: "Not specified",
    todayLesson: "Lesson Day",
    address: "Address",
    verse: "\"The mosques of Allah are only to be maintained by those who believe in Allah and the Last Day.\"",
    verseSource: "Surah At-Tawbah — Verse 18",
    relatedTitle: "Related Pages",
    livePage: "Live Stream",
    livePageDesc: "Follow live lessons.",
    prayerTimesPage: "Prayer Times",
    prayerTimesPageDesc: "Prayer times in your area.",
    qiblaPage: "Qibla Direction",
    qiblaPageDesc: "Accurate Qibla compass.",
    contactPage: "Contact Us",
    contactPageDesc: "For schedule inquiries.",
    noteTitle: "Important Notices",
    note1: "Lesson times may change due to emergencies or occasions. Please verify before attending.",
    note2: "The class is open to everyone; no prior registration is required in most lessons.",
    note3: "Please observe gathering etiquette: listen attentively, do not record without permission, and silence your phone.",
    locationEnabled: "✓ Location enabled",
    locationDisabled: "Location unavailable",
    locationDesc: "We only use your location to calculate distance to the nearest mosque.",
    nearest: "Nearest to you",
    search: "Search",
    searchPlaceholder: "Search for a mosque or area...",
    clearSearch: "Clear search",
    all: "All",
    noSearchResults: "No matching results",
    noSearchResultsDesc: "Try another keyword or choose a different area.",
  },
};

// ============================================================
// دالة حساب المسافة (Haversine)
// ============================================================

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(value.toFixed(1))
      .split("")
      .map((d) => {
        const n = Number(d);
        return Number.isFinite(n) ? arabicNumerals[n] : d;
      })
      .join("");
  }
  return value.toFixed(1);
}

// ============================================================
// المكون الرئيسي
// ============================================================

export default function MapPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const ui = UI[L];

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState<string>("all");

  // ===== جلب البيانات + موقع المستخدم =====
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        const r = await fetch("/api/content");
        const j = await r.json();
        if (!cancelled) {
          setPlaces(j?.content?.places || []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {
          // تجاهل أخطاء الموقع
        }
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== المناطق الفريدة =====
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.area && set.add(p.area));
    return Array.from(set);
  }, [places]);

  // ===== قائمة الأماكن مع المسافة =====
  const placesWithDistance = useMemo(() => {
    return places.map((p) => {
      let distance: number | null = null;
      if (
        userLocation &&
        typeof p.lat === "number" &&
        typeof p.lng === "number"
      ) {
        distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          p.lat,
          p.lng
        );
      }
      return { ...p, distance };
    });
  }, [places, userLocation]);

  // ===== الفلترة والبحث =====
  const filteredPlaces = useMemo(() => {
    let result = placesWithDistance;

    if (filterArea !== "all") {
      result = result.filter((p) => p.area === filterArea);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          (p.note && p.note.toLowerCase().includes(q)) ||
          (p.day && p.day.toLowerCase().includes(q))
      );
    }

    return result;
  }, [placesWithDistance, filterArea, searchQuery]);

  // ===== ترتيب حسب المسافة =====
  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }, [filteredPlaces]);

  // ===== إحصائيات =====
  const totalPlaces = places.length;
  const totalAreas = uniqueAreas.length;
  const totalDays = new Set(places.map((p) => p.day).filter(Boolean)).size || 7;

  // ===== مسافة المكان المختار =====
  const selectedDistance = useMemo(() => {
    if (!selected || !userLocation) return null;
    if (typeof selected.lat !== "number" || typeof selected.lng !== "number")
      return null;
    return getDistance(
      userLocation.lat,
      userLocation.lng,
      selected.lat,
      selected.lng
    );
  }, [selected, userLocation]);

  // ===== رابط خرائط جوجل =====
  const getMapsUrl = (place: Place): string => {
    if (typeof place.lat === "number" && typeof place.lng === "number") {
      return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(
      `${place.name} ${place.area}`
    )}`;
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
        <div className="card relative mb-8 overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-teal-800 dark:from-teal-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0d9488, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-5">🗺️ {ui.title}</span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* حالة الموقع */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold backdrop-blur-sm dark:bg-night-800/80">
              {userLocation ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-green-700 dark:text-green-300">
                    {ui.locationEnabled}
                  </span>
                </>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  📍 {ui.locationDesc}
                </span>
              )}
            </div>

            {/* آية كريمة */}
            <div className="mt-6 rounded-2xl border border-gold-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
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

        {/* ===== حالة التحميل ===== */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-night-700" />
                  <div className="flex-1">
                    <div className="mb-2 h-5 w-3/4 rounded bg-slate-200 dark:bg-night-700" />
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-night-700" />
                  </div>
                </div>
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-night-700" />
              </div>
            ))}
          </div>
        )}

        {/* ===== حالة الخطأ ===== */}
        {!loading && error && (
          <div className="card border-red-200 bg-red-50/60 p-10 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
              {ui.loading.replace("...", "")}
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              {ui.retryButton}
            </button>
          </div>
        )}

        {/* ===== لا توجد أماكن ===== */}
        {!loading && !error && places.length === 0 && (
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl dark:bg-night-800">
                🗺️
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {ui.noPlacesTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {ui.noPlacesDesc}
            </p>
          </div>
        )}

        {/* ===== المحتوى الرئيسي ===== */}
        {!loading && !error && places.length > 0 && (
          <>
            {/* إحصائيات سريعة */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="card p-5 text-center">
                <div className="mb-2 flex justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    🕌
                  </span>
                </div>
                <p className="text-2xl font-black text-primary-700 dark:text-primary-300">
                  {totalPlaces}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ui.placesCount}
                </p>
              </div>

              <div className="card p-5 text-center">
                <div className="mb-2 flex justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    📍
                  </span>
                </div>
                <p className="text-2xl font-black text-gold-700 dark:text-gold-300">
                  {totalAreas}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ui.areasCount}
                </p>
              </div>

              <div className="card p-5 text-center">
                <div className="mb-2 flex justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    📅
                  </span>
                </div>
                <p className="text-2xl font-black text-primary-700 dark:text-primary-300">
                  {totalDays}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ui.daysCount}
                </p>
              </div>
            </div>

            {/* البحث والفلترة */}
            <div className="card mb-8 p-6 md:p-7">
              <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={ui.searchPlaceholder}
                    className="input-islamic !ps-12"
                    aria-label={ui.searchPlaceholder}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn-outline whitespace-nowrap"
                  >
                    ✕ {ui.clearSearch}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterArea("all")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    filterArea === "all"
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
                  }`}
                >
                  🌐 {ui.all}
                </button>

                {uniqueAreas.map((area) => {
                  const isActive = filterArea === area;
                  const count = places.filter((p) => p.area === area).length;

                  return (
                    <button
                      key={area}
                      onClick={() => setFilterArea(area)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:text-slate-300"
                      }`}
                    >
                      📍 {area}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-night-700 dark:text-slate-300"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* عنوان القائمة */}
            <div className="mb-6">
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                📍 {ui.allPlacesTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {sortedPlaces.length} {ui.placesCount} • {ui.clickHint}
              </p>
            </div>

            {/* ===== لا توجد نتائج بحث ===== */}
            {sortedPlaces.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="mb-3 text-4xl">🔍</div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {ui.noSearchResults}
                </h3>
                <p className="mb-5 text-slate-500 dark:text-slate-400">
                  {ui.noSearchResultsDesc}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="btn-outline"
                    >
                      ✕ {ui.clearSearch}
                    </button>
                  )}
                  {filterArea !== "all" && (
                    <button
                      onClick={() => setFilterArea("all")}
                      className="btn-primary"
                    >
                      🌐 {ui.all}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sortedPlaces.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="card card-interactive group relative overflow-hidden p-6 text-start transition-all hover:-translate-y-1"
                  >
                    <div className="gradient-primary absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* شارة "الأقرب" */}
                    {p.distance !== null &&
                      p.distance === sortedPlaces[0]?.distance &&
                      userLocation && (
                        <span className="absolute top-3 end-3 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                          ⭐ {ui.nearest}
                        </span>
                      )}

                    <div className="mb-4 flex items-start gap-4">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #0d9488, #0e7490)",
                        }}
                      >
                        🕌
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="mb-1 text-lg font-black leading-tight text-slate-900 dark:text-white"
                          style={{ fontFamily: "var(--font-amiri)" }}
                        >
                          {p.name}
                        </h3>
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                          📍 {p.area}
                        </p>
                      </div>
                    </div>

                    {p.note && (
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {p.note}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-night-700">
                      {p.day && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          📅 {p.day}
                        </span>
                      )}
                      {p.distance !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                          📏 {formatNumber(p.distance, L)} {ui.distanceUnit}
                        </span>
                      )}
                      <span className="ms-auto text-xs font-bold text-primary-700 dark:text-primary-300">
                        {ui.clickHint} →
                      </span>
                    </div>
                  </button>
                ))}
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
                <Link
                  href={`/${L}/live`}
                  className="card card-interactive group flex items-center gap-3 p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                    📡
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {ui.livePage}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {ui.livePageDesc}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/${L}/prayer-times`}
                  className="card card-interactive group flex items-center gap-3 p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                    🕐
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {ui.prayerTimesPage}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {ui.prayerTimesPageDesc}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/${L}/qibla`}
                  className="card card-interactive group flex items-center gap-3 p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                    🧭
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                      {ui.qiblaPage}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {ui.qiblaPageDesc}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/${L}/contact`}
                  className="card card-interactive group flex items-center gap-3 p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                    📬
                  </span>
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

            {/* ===== تنبيهات مهمة ===== */}
            <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
                  📌
                </span>
                <div>
                  <h2
                    className="mb-4 text-xl font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {ui.noteTitle}
                  </h2>
                  <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{ui.note1}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{ui.note2}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{ui.note3}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ===== Modal التفاصيل ===== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس */}
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <span
                  className="flex h-20 w-20 items-center justify-center rounded-3xl text-5xl text-white shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #0d9488, #0e7490)",
                  }}
                >
                  🕌
                </span>
              </div>

              <h3
                className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {selected.name}
              </h3>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                📍 {selected.area}
              </span>
            </div>

            {/* المسافة */}
            {selectedDistance !== null && (
              <div className="mb-4 rounded-2xl border border-gold-200 bg-gold-50/60 p-4 text-center dark:border-gold-900/30 dark:bg-gold-950/15">
                <p className="mb-1 text-xs font-bold text-gold-700 dark:text-gold-300">
                  📏 {ui.distance}
                </p>
                <p
                  className="text-3xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {formatNumber(selectedDistance, L)}{" "}
                  <span className="text-base text-slate-500">
                    {ui.distanceUnit}
                  </span>
                </p>
              </div>
            )}

            {/* اليوم */}
            {selected.day && (
              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  📅 {ui.todayLesson}
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {selected.day}
                </p>
              </div>
            )}

            {/* العنوان */}
            {selected.address && (
              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
                <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  🏠 {ui.address}
                </p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {selected.address}
                </p>
              </div>
            )}

            {/* الملاحظة */}
            {selected.note && (
              <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-900/30 dark:bg-primary-950/15">
                <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                  {selected.note}
                </p>
              </div>
            )}

            {/* الأزرار */}
            <div className="flex gap-3">
              <a
                href={getMapsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {ui.openMaps}
              </a>
              <button
                onClick={() => setSelected(null)}
                className="btn-outline inline-flex items-center justify-center px-5"
                aria-label={ui.close}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer lang={L} />
    </main>
  );
}