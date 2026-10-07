"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Settings } from "@/lib/data";
import { t, languages, type Lang } from "@/lib/i18n";

export default function TopBar({ settings }: { settings?: Settings }) {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [currentPrayer, setCurrentPrayer] = useState("");
  const [prayerTime, setPrayerTime] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const city = localStorage.getItem("prayerCity") || "Cairo";
    const country = localStorage.getItem("prayerCountry") || "Egypt";

    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`)
      .then(r => r.json())
      .then(j => {
        if (!j.data) return;
        const timings = j.data.timings;
        const prayers = [
          { name: tr.fajr, time: timings.Fajr },
          { name: tr.sunrise, time: timings.Sunrise },
          { name: tr.dhuhr, time: timings.Dhuhr },
          { name: tr.asr, time: timings.Asr },
          { name: tr.maghrib, time: timings.Maghrib },
          { name: tr.isha, time: timings.Isha },
        ];

        const updateCountdown = () => {
          const now = new Date();
          let nextPrayer = prayers[0];
          for (const p of prayers) {
            const [h, m] = p.time.split(" ")[0].split(":").map(Number);
            const pt = new Date();
            pt.setHours(h, m, 0, 0);
            if (pt > now) {
              nextPrayer = p;
              break;
            }
          }
          setCurrentPrayer(nextPrayer.name);
          setPrayerTime(nextPrayer.time);
          const [h, m] = nextPrayer.time.split(" ")[0].split(":").map(Number);
          const pt = new Date();
          pt.setHours(h, m, 0, 0);
          if (pt < now) pt.setDate(pt.getDate() + 1);
          const diff = pt.getTime() - now.getTime();
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          setCountdown(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
      })
      .catch(() => {});
  }, [tr]);

  return (
    <div className="bg-primary text-white text-xs py-1.5 border-b border-gold/30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gold">🕌 {currentPrayer}</span>
          <span className="font-mono" dir="ltr">{prayerTime}</span>
          <span className="text-gold-light" dir="ltr">⏱ {countdown}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${lang}/prayer-times`} className="hover:text-gold transition">
            {tr.prayerTimes}
          </Link>
          <span className="text-white/30">|</span>
          <Link href={`/${lang}/calendar`} className="hover:text-gold transition">
            📅 {tr.calendar}
          </Link>
        </div>
      </div>
    </div>
  );
}