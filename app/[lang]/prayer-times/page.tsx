"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

type Timings = { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };

const COUNTRIES = [
  { name: "Egypt", ar: "مصر", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"] },
  { name: "Saudi Arabia", ar: "السعودية", cities: ["Makkah", "Madinah", "Riyadh", "Jeddah", "Dammam"] },
  { name: "United Arab Emirates", ar: "الإمارات", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  { name: "Jordan", ar: "الأردن", cities: ["Amman", "Irbid", "Zarqa"] },
  { name: "Morocco", ar: "المغرب", cities: ["Casablanca", "Rabat", "Marrakech"] },
  { name: "Algeria", ar: "الجزائر", cities: ["Algiers", "Oran", "Constantine"] },
  { name: "Tunisia", ar: "تونس", cities: ["Tunis", "Sfax", "Sousse"] },
  { name: "Turkey", ar: "تركيا", cities: ["Istanbul", "Ankara", "Izmir"] },
  { name: "Pakistan", ar: "باكستان", cities: ["Karachi", "Lahore", "Islamabad"] },
  { name: "Indonesia", ar: "إندونيسيا", cities: ["Jakarta", "Surabaya", "Bandung"] },
  { name: "Malaysia", ar: "ماليزيا", cities: ["Kuala Lumpur", "Penang"] },
  { name: "Nigeria", ar: "نيجيريا", cities: ["Lagos", "Kano", "Abuja"] },
  { name: "Somalia", ar: "الصومال", cities: ["Mogadishu", "Hargeisa"] },
  { name: "Bangladesh", ar: "بنغلاديش", cities: ["Dhaka", "Chittagong"] },
  { name: "United Kingdom", ar: "بريطانيا", cities: ["London", "Manchester", "Birmingham"] },
  { name: "USA", ar: "أمريكا", cities: ["New York", "Los Angeles", "Chicago"] },
];

export default function PrayerTimesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [country, setCountry] = useState(localStorage.getItem("prayerCountry") || "Egypt");
  const [city, setCity] = useState(localStorage.getItem("prayerCity") || "Cairo");
  const [timings, setTimings] = useState<Timings | null>(null);
  const [hijriDate, setHijriDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.name === country);

  const fetchTimes = async (c: string, ci: string) => {
    setLoading(true);
    try {
      const r = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${ci}&country=${c}&method=5`);
      const j = await r.json();
      if (j.data) {
        setTimings({
          Fajr: j.data.timings.Fajr,
          Sunrise: j.data.timings.Sunrise,
          Dhuhr: j.data.timings.Dhuhr,
          Asr: j.data.timings.Asr,
          Maghrib: j.data.timings.Maghrib,
          Isha: j.data.timings.Isha,
        });
        setHijriDate(`${j.data.date.hijri.day} ${j.data.date.hijri.month.ar} ${j.data.date.hijri.year}هـ`);
        localStorage.setItem("prayerCountry", c);
        localStorage.setItem("prayerCity", ci);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTimes(country, city); }, []);

  const useGPSTimes = () => {
    if (!navigator.geolocation) return alert("المتصفح لا يدعم تحديد الموقع");
    setUseGPS(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setLoading(true);
      try {
        const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=5`);
        const j = await r.json();
        if (j.data) {
          setTimings({
            Fajr: j.data.timings.Fajr,
            Sunrise: j.data.timings.Sunrise,
            Dhuhr: j.data.timings.Dhuhr,
            Asr: j.data.timings.Asr,
            Maghrib: j.data.timings.Maghrib,
            Isha: j.data.timings.Isha,
          });
          setHijriDate(`${j.data.date.hijri.day} ${j.data.date.hijri.month.ar} ${j.data.date.hijri.year}هـ`);
        }
      } catch {}
      setLoading(false);
      setUseGPS(false);
    });
  };

  const prayerList = timings ? [
    { ar: "الفجر", en: "Fajr", time: timings.Fajr, icon: "🌅" },
    { ar: "الشروق", en: "Sunrise", time: timings.Sunrise, icon: "☀️" },
    { ar: "الظهر", en: "Dhuhr", time: timings.Dhuhr, icon: "🌞" },
    { ar: "العصر", en: "Asr", time: timings.Asr, icon: "🌤️" },
    { ar: "المغرب", en: "Maghrib", time: timings.Maghrib, icon: "🌇" },
    { ar: "العشاء", en: "Isha", time: timings.Isha, icon: "🌙" },
  ] : [];

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🕌 مواقيت الصلاة</SectionTitle>

          {/* اختيار الدولة والمدينة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">{tr.selectCountry}</label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    const c = COUNTRIES.find(x => x.name === e.target.value);
                    if (c) {
                      setCity(c.cities[0]);
                      fetchTimes(e.target.value, c.cities[0]);
                    }
                  }}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-gold"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.name} value={c.name}>{lang === "ar" ? c.ar : c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">{tr.selectCity}</label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    fetchTimes(country, e.target.value);
                  }}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:border-gold"
                >
                  {selectedCountry?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={useGPSTimes}
              disabled={useGPS}
              className="w-full bg-gold text-gray-900 py-2 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
            >
              {useGPS ? "⏳ جاري تحديد الموقع..." : "📍 استخدام موقعي الحالي"}
            </button>
          </div>

          {/* المواقيت */}
          {loading ? (
            <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
          ) : timings ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">📍 {city}, {selectedCountry?.ar}</p>
                <p className="font-serif text-xl text-gold mt-1">{hijriDate}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {prayerList.map(p => (
                  <div key={p.en} className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-1">{p.icon}</div>
                    <div className="font-bold text-primary dark:text-gold">{lang === "ar" ? p.ar : p.en}</div>
                    <div className="text-2xl font-mono font-bold mt-2" dir="ltr">{p.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}