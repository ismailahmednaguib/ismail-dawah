"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const PRAYERS_AR = [
  { key: "Fajr", name: "الفجر", icon: "🌄" },
  { key: "Sunrise", name: "الشروق", icon: "🌅" },
  { key: "Dhuhr", name: "الظهر", icon: "☀️" },
  { key: "Asr", name: "العصر", icon: "🌤️" },
  { key: "Maghrib", name: "المغرب", icon: "🌇" },
  { key: "Isha", name: "العشاء", icon: "🌙" },
];

const PRAYERS_EN = [
  { key: "Fajr", name: "Fajr", icon: "🌄" },
  { key: "Sunrise", name: "Sunrise", icon: "🌅" },
  { key: "Dhuhr", name: "Dhuhr", icon: "☀️" },
  { key: "Asr", name: "Asr", icon: "🌤️" },
  { key: "Maghrib", name: "Maghrib", icon: "🌇" },
  { key: "Isha", name: "Isha", icon: "🌙" },
];

export default function PrayerTimesPage() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [location, setLocation] = useState<string>(lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [city, setCity] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTimings = async (cityName: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityName)}&method=5`
      );
      const data = await res.json();
      if (data.data) {
        setTimings(data.data.timings);
        setLocation(`${data.data.meta.timezone}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings("Cairo");
  }, []);

  // حساب الصلاة القادمة
  const getNextPrayer = () => {
    if (!timings) return null;
    const prayers = PRAYERS_AR.filter((p) => p.key !== "Sunrise");
    const nowMins = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
      const [h, m] = timings[prayer.key as keyof PrayerTimings].split(":").map(Number);
      const prayerMins = h * 60 + m;
      if (prayerMins > nowMins) {
        return { ...prayer, time: timings[prayer.key as keyof PrayerTimings], diff: prayerMins - nowMins };
      }
    }
    // لو فات كل الصلوات، الفجر بتاع بكرة
    const [h, m] = timings.Fajr.split(":").map(Number);
    return { ...PRAYERS_AR[0], time: timings.Fajr, diff: 24 * 60 - nowMins + h * 60 + m };
  };

  const nextPrayer = getNextPrayer();
  const formatCountdown = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const s = 60 - now.getSeconds();
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isCurrentPrayer = (key: string) => {
    if (!timings) return false;
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const idx = prayers.indexOf(key);
    if (idx === -1) return false;

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [h, m] = timings[key as keyof PrayerTimings].split(":").map(Number);
    const prayerMins = h * 60 + m;
    if (nowMins < prayerMins) return false;

    if (idx === prayers.length - 1) return true;
    const [nh, nm] = timings[prayers[idx + 1] as keyof PrayerTimings].split(":").map(Number);
    return nowMins < nh * 60 + nm;
  };

  const displayPrayers = lang === "ar" ? PRAYERS_AR : PRAYERS_EN;

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50/30 dark:from-night-950 dark:via-night-900 dark:to-night-950">
      {/* Hero مع العد التنازلي */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 start-10 w-72 h-72 bg-gold-400 rounded-full blur-3xl animate-float" />
        </div>

        <div className="container-page relative text-center text-white">
          <span className="badge bg-white/15 border border-white/25 text-white mb-4">
            🕌 {lang === "ar" ? "أوقات الصلاة" : "Prayer Times"}
          </span>
          <h1 className="heading-1 !text-white mb-4">
            {lang === "ar" ? "مواقيت الصلاة" : "Prayer Times"}
          </h1>
          <p className="text-primary-100 mb-8">
            📍 {location} • {now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* العد التنازلي للصلاة القادمة */}
          {nextPrayer && (
            <div className="inline-block glass rounded-3xl px-8 md:px-16 py-6 border border-white/20">
              <p className="text-primary-100 text-sm mb-2">
                {lang === "ar" ? "الصلاة القادمة" : "Next Prayer"}
              </p>
              <div className="text-4xl md:text-6xl font-black mb-2" style={{ fontFamily: "var(--font-amiri)" }}>
                {nextPrayer.icon} {nextPrayer.name}
              </div>
              <div className="text-2xl md:text-3xl font-mono text-gold-300" dir="ltr">
                {formatCountdown(nextPrayer.diff)}
              </div>
              <p className="text-primary-100 mt-2">
                {lang === "ar" ? "الساعة" : "At"} {nextPrayer.time}
              </p>
            </div>
          )}

          {/* البحث عن مدينة */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (city.trim()) fetchTimings(city.trim());
            }}
            className="mt-8 flex max-w-md mx-auto gap-2"
          >
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={lang === "ar" ? "اكتب اسم مدينتك..." : "Enter your city..."}
              className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/25 text-white placeholder:text-primary-200 outline-none focus:bg-white/20 transition-all"
            />
            <button type="submit" className="btn-gold !py-3 cursor-pointer">
              🔍 {lang === "ar" ? "بحث" : "Search"}
            </button>
          </form>
        </div>
      </section>

      {/* شبكة المواقيت */}
      <section className="container-page py-16 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="mt-4 text-body">
              {lang === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        ) : timings ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {displayPrayers.map((prayer) => {
              const isCurrent = isCurrentPrayer(prayer.key);
              const isNext = nextPrayer?.key === prayer.key;
              return (
                <div
                  key={prayer.key}
                  className={`card p-6 text-center relative overflow-hidden transition-all ${
                    isCurrent
                      ? "ring-2 ring-gold-500 bg-gold-50 dark:bg-gold-500/10"
                      : isNext
                      ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : ""
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-2 end-2 badge-gold text-xs">
                      {lang === "ar" ? "الآن" : "Now"}
                    </span>
                  )}
                  {isNext && !isCurrent && (
                    <span className="absolute top-2 end-2 badge-primary text-xs">
                      {lang === "ar" ? "القادمة" : "Next"}
                    </span>
                  )}
                  <div className="text-4xl mb-3">{prayer.icon}</div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1" style={{ fontFamily: "var(--font-amiri)" }}>
                    {prayer.name}
                  </h3>
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400" dir="ltr">
                    {timings[prayer.key as keyof PrayerTimings]}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-body">
            {lang === "ar" ? "تعذر تحميل المواقيت" : "Failed to load times"}
          </div>
        )}

        {/* آية */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="card p-8">
            <p className="quran-text text-2xl md:text-3xl mb-4">
              ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
            </p>
            <p className="text-body text-sm">
              {lang === "ar" ? "سورة النساء — الآية 103" : "An-Nisa — Verse 103"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}