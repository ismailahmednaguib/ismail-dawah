"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
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
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🕋"
          title="تحديد القبلة"
          subtitle="اتجاه القبلة من أي مكان في العالم"
          verse="فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
          verseSource="سورة البقرة - الآية 144"
          gradient="from-orange-600 via-orange-700 to-orange-800"
        />

        <section className="py-10">
          <div className="max-w-3xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-lg">
                <div className="text-6xl mb-4 animate-pulse">🕋</div>
                <p className="text-gray-500">⏳ جاري تحديد موقعك...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-2xl p-8 text-center">
                <span className="text-5xl mb-3 block">❌</span>
                <p className="text-red-700 dark:text-red-300 font-bold">{error}</p>
              </div>
            ) : (
              <>
                {/* معلومات القبلة */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">اتجاه القبلة من موقعك</p>
                  <p className="text-5xl font-bold text-gold mb-2">{qiblaAngle?.toFixed(2)}°</p>
                  {location && (
                    <p className="text-xs text-gray-400 mt-3">
                      📍 إحداثياتك: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                {/* البوصلة */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                  <div className="relative w-72 h-72 mx-auto my-8">
                    {/* الدائرة الخارجية */}
                    <div className="absolute inset-0 rounded-full border-4 border-gold bg-gradient-to-br from-cream-dark to-cream dark:from-gray-700 dark:to-gray-800 shadow-inner"></div>
                    
                    {/* الدائرة الداخلية */}
                    <div className="absolute inset-8 rounded-full border-2 border-gold/30"></div>
                    
                    {/* الاتجاهات */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 font-bold text-primary dark:text-white text-lg">N</div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-primary dark:text-white text-lg">S</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-primary dark:text-white text-lg">E</div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary dark:text-white text-lg">W</div>

                    {/* سهم القبلة */}
                    <div
                      className="absolute top-1/2 left-1/2 w-2 h-32 bg-gradient-to-t from-gold to-gold-light origin-bottom transition-transform duration-300 rounded-full shadow-lg"
                      style={{
                        transform: `translate(-50%, -100%) rotate(${compassAngle}deg)`,
                      }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl">🕋</div>
                    </div>

                    {/* المركز */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full shadow-lg"></div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-4 mt-6">
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      💡 <strong>تعليمات:</strong> لفّ جهازك حتى تتطابق الكعبة 🕋 مع اتجاه القبلة. السهم الذهبي يشير لاتجاه القبلة.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}