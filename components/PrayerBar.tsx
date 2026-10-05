"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/data";

export default function PrayerBar({ settings }: { settings: Settings }) {
  const [times, setTimes] = useState<Record<string, string> | null>(null);
  const [city, setCity] = useState("…");
  const [hijri, setHijri] = useState("");

  useEffect(() => {
    try {
      setHijri(new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(new Date()));
    } catch {}

    const load = async (lat: number, lon: number, cityName: string) => {
      try {
        const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`);
        const j = await r.json();
        if (j.code === 200) {
          const t = j.data.timings;
          setTimes({ الفجر: t.Fajr.slice(0, 5), الشروق: t.Sunrise.slice(0, 5), الظهر: t.Dhuhr.slice(0, 5), العصر: t.Asr.slice(0, 5), المغرب: t.Maghrib.slice(0, 5), العشاء: t.Isha.slice(0, 5) });
          setCity(cityName);
        }
      } catch {}
    };

    const cached = localStorage.getItem("pb-loc");
    if (cached) { const p = JSON.parse(cached); load(p.lat, p.lon, p.city); return; }
    if (!navigator.geolocation) { load(30.04, 31.24, "القاهرة"); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      let name = "موقعك";
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`);
        const j = await r.json();
        name = j.address?.city || j.address?.town || j.address?.state || "موقعك";
      } catch {}
      localStorage.setItem("pb-loc", JSON.stringify({ lat: latitude, lon: longitude, city: name }));
      load(latitude, longitude, name);
    }, () => load(30.04, 31.24, "القاهرة"), { timeout: 8000 });
  }, []);

  if (!settings.showPrayerBar) return null;

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  let nextName = "";
  if (times) {
    for (const [name, val] of Object.entries(times)) {
      const [h, m] = val.split(":").map(Number);
      if (h * 60 + m > nowMin) { nextName = name; break; }
    }
  }

  return (
    <div className="bg-primary-light text-white text-xs md:text-sm py-2 px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <span className="font-bold text-gold-light">📅 {hijri}</span>
      <span className="opacity-80">🕌 {city}</span>
      {times && Object.entries(times).map(([name, val]) => (
        <span key={name} className={name === nextName ? "bg-gold text-gray-900 font-bold px-2 py-0.5 rounded-full" : "opacity-90"}>
          {name} {val}
        </span>
      ))}
    </div>
  );
}