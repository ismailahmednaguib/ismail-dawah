"use client";

import { useEffect, useState } from "react";

type PrayerTimes = {
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string; Maghrib: string; Isha: string;
};

export default function TopBar() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState("");
  const [gregDate, setGregDate] = useState("");
  const [city, setCity] = useState("القاهرة");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const savedCity = localStorage.getItem("prayerCity") || "Cairo";
    const savedCountry = localStorage.getItem("prayerCountry") || "Egypt";
    const savedCityAr = localStorage.getItem("prayerCityAr") || "القاهرة";
    setCity(savedCityAr);

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
          setHijriDate(`${j.data.date.hijri.day} ${j.data.date.hijri.month.ar} ${j.data.date.hijri.year}هـ`);
          setGregDate(`${j.data.date.gregorian.day} ${j.data.date.gregorian.month.en} ${j.data.date.gregorian.year}`);
        }
      })
      .catch(() => {});
  }, []);

  // تحديث الساعة كل ثانية
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // حساب الصلاة القادمة والعداد
  useEffect(() => {
    if (!times) return;
    const prayers = [
      { name: "الفجر", time: times.Fajr },
      { name: "الشروق", time: times.Sunrise },
      { name: "الظهر", time: times.Dhuhr },
      { name: "العصر", time: times.Asr },
      { name: "المغرب", time: times.Maghrib },
      { name: "العشاء", time: times.Isha },
    ];

    const update = () => {
      const now = new Date();
      let next = prayers[0];
      for (const p of prayers) {
        const [h, m] = p.time.split(" ")[0].split(":").map(Number);
        const pt = new Date();
        pt.setHours(h, m, 0, 0);
        if (pt > now) { next = p; break; }
      }
      setNextPrayer(next);

      const [h, m] = next.time.split(" ")[0].split(":").map(Number);
      const pt = new Date();
      pt.setHours(h, m, 0, 0);
      if (pt <= now) pt.setDate(pt.getDate() + 1);

      const diff = pt.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [times]);

  const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="bg-primary text-white text-xs py-2 border-b-2 border-gold/50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-3 flex-wrap">
        {/* التاريخ الهجري + الميلادي */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-gold/20 text-gold-light px-2 py-0.5 rounded font-bold">📅 {hijriDate}</span>
          <span className="hidden sm:inline text-white/60">|</span>
          <span className="hidden sm:inline text-white/80">{gregDate}</span>
        </div>

        {/* الساعة + المدينة */}
        <div className="flex items-center gap-2">
          <span className="text-white/80">📍 {city}</span>
          <span className="font-mono font-bold text-gold bg-black/20 px-2 py-0.5 rounded" dir="ltr">🕐 {timeStr}</span>
        </div>

        {/* الصلاة القادمة + العداد */}
        {nextPrayer && (
          <div className="flex items-center gap-2 bg-gold text-gray-900 px-3 py-1 rounded-full font-bold">
            <span>🕌 {nextPrayer.name}</span>
            <span className="font-mono" dir="ltr">{nextPrayer.time}</span>
            <span className="bg-gray-900 text-gold px-2 py-0.5 rounded-full text-xs font-mono" dir="ltr">
              ⏱ {countdown}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}