"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type HijriDate = {
  day: string;
  month: { ar: string; en: string; number: number };
  year: string;
  weekday: { ar: string; en: string };
};

export default function PrayerBar() {
  const params = useParams();
  const L = (params?.lang || "ar") as Lang;
  const tr = t(L);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [city, setCity] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const savedCity = localStorage.getItem("prayerCity") || "Cairo";
    const savedCountry = localStorage.getItem("prayerCountry") || "Egypt";
    setCity(savedCity);

    // جلب المواقيت
    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${savedCity}&country=${savedCountry}&method=5`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setTimes({
            Fajr: j.data.timings.Fajr,
            Sunrise: j.data.timings.Sunrise,
            Dhuhr: j.data.timings.Dhuhr,
            Asr: j.data.timings.Asr,
            Maghrib: j.data.timings.Maghrib,
            Isha: j.data.timings.Isha,
          });
          setHijri(j.data.date.hijri);
        }
      })
      .catch(() => {});
  }, []);

  // تحديث الساعة كل ثانية
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // حساب الصلاة القادمة
  useEffect(() => {
    if (!times) return;
    const interval = setInterval(() => {
      const now = new Date();
      const prayers = [
        { name: tr.fajr, time: times.Fajr },
        { name: tr.sunrise, time: times.Sunrise },
        { name: tr.dhuhr, time: times.Dhuhr },
        { name: tr.asr, time: times.Asr },
        { name: tr.maghrib, time: times.Maghrib },
        { name: tr.isha, time: times.Isha },
      ];

      let next = prayers[0];
      for (const p of prayers) {
        const [h, m] = p.time.split(":").map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(h, m, 0, 0);
        if (prayerTime > now) {
          next = p;
          break;
        }
        next = prayers[0]; // لو فاتوا كلهم، الصلاة الجاية فجر بكرة
      }

      const [h, m] = next.time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0, 0);
      if (prayerTime < now) prayerTime.setDate(prayerTime.getDate() + 1);

      const diff = prayerTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setNextPrayer({
        name: next.name,
        time: next.time,
        remaining: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [times, tr]);

  if (!times || !hijri) return null;

  const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString(L === "ar" ? "ar-EG" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="sticky top-0 z-40 bg-primary text-white text-xs shadow-md border-b-2 border-gold">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        {/* التاريخ الهجري + الميلادي */}
        <div className="flex items-center gap-3">
          <span className="font-bold">📅 {hijri.weekday[L === "ar" ? "ar" : "en"]} {hijri.day} {hijri.month[L === "ar" ? "ar" : "en"]} {hijri.year}هـ</span>
          <span className="hidden sm:inline text-white/60">|</span>
          <span className="hidden sm:inline text-white/80">{dateStr}</span>
        </div>

        {/* الساعة + المدينة */}
        <div className="flex items-center gap-3">
          <span className="text-white/80">📍 {city}</span>
          <span className="font-mono font-bold text-gold" dir="ltr">{timeStr}</span>
        </div>

        {/* الصلاة القادمة */}
        {nextPrayer && (
          <div className="flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full">
            <span className="font-bold">🕌 {nextPrayer.name}</span>
            <span dir="ltr" className="text-gold-light font-mono">{nextPrayer.time}</span>
            <span className="text-xs opacity-80" dir="ltr">⏱ {nextPrayer.remaining}</span>
          </div>
        )}
      </div>
    </div>
  );
}