"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

export default function QiblaPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      try {
        const r = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
        const j = await r.json();
        setQiblaAngle(j.data?.direction || 0);
      } catch {
        setError("فشل في جلب اتجاه القبلة");
      }
      setLoading(false);
    }, () => {
      setError("فشل في الحصول على الموقع");
      setLoading(false);
    });

    // استخدام DeviceOrientationEvent للبوصلة
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) setDeviceHeading(e.alpha);
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const compassAngle = qiblaAngle !== null ? (qiblaAngle - deviceHeading + 360) % 360 : 0;

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🧭 تحديد القبلة</SectionTitle>

          {loading ? (
            <p className="text-center text-gray-500 py-10">⏳ جاري تحديد موقعك...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-10">❌ {error}</p>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md text-center">
              <p className="text-sm text-gray-500 mb-2">اتجاه القبلة من موقعك</p>
              <p className="text-3xl font-bold text-gold mb-6">{qiblaAngle?.toFixed(2)}°</p>

              {/* بوصلة */}
              <div className="relative w-64 h-64 mx-auto my-8">
                <div className="absolute inset-0 rounded-full border-4 border-gold bg-cream-dark dark:bg-gray-700"></div>
                <div className="absolute inset-4 rounded-full border-2 border-gold/30"></div>
                {/* اتجاه القبلة */}
                <div
                  className="absolute top-1/2 left-1/2 w-1 h-24 bg-gold origin-bottom transition-transform duration-300"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${compassAngle}deg)`,
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">🕋</div>
                </div>
                {/* الشمال */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-primary dark:text-white">N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-primary dark:text-white">S</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-primary dark:text-white">E</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-primary dark:text-white">W</div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                💡 لفّ جهازك حتى تتطابق الكعبة 🕋 مع اتجاه القبلة
              </p>

              {location && (
                <p className="text-xs text-gray-400 mt-4">
                  📍 موقعك: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}