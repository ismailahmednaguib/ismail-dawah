"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function MapPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setPlaces(j.content?.places || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🗺️"
          title="خريطة الدروس والمساجد"
          subtitle="اعرف أقرب مكان لحضور دروس الشيخ"
          hadith="مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ"
          gradient="from-teal-600 via-teal-700 to-teal-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : places.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">🗺️</span>
                <p className="text-gray-500">لا توجد أماكن مسجلة حالياً</p>
              </div>
            ) : (
              <>
                {/* إحصائيات */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                    <span className="text-4xl mb-2 block">🕌</span>
                    <p className="text-3xl font-bold text-gold">{places.length}</p>
                    <p className="text-sm text-gray-500">مكان للدروس</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                    <span className="text-4xl mb-2 block">📍</span>
                    <p className="text-3xl font-bold text-gold">
                      {Array.from(new Set(places.map(p => p.area))).length}
                    </p>
                    <p className="text-sm text-gray-500">منطقة مختلفة</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                    <span className="text-4xl mb-2 block">📅</span>
                    <p className="text-3xl font-bold text-gold">
                      {new Set(places.map(p => p.day)).size || 7}
                    </p>
                    <p className="text-sm text-gray-500">أيام في الأسبوع</p>
                  </div>
                </div>

                <IslamicSection title="كل الأماكن" icon="📍" subtitle="اضغط على أي مكان لمعرفة التفاصيل">
                  <div className="grid md:grid-cols-2 gap-5">
                    {places.map((p, i) => (
                      <div
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-r-4 border-gold hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl grid place-items-center text-3xl text-white flex-shrink-0">
                            🕌
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-primary dark:text-gold text-lg mb-1">
                              {p.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">📍 {p.area}</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {p.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </IslamicSection>

                {/* تفاصيل المكان المختار */}
                {selected && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="text-center mb-6">
                        <div className="inline-block bg-gradient-to-br from-teal-600 to-teal-700 rounded-full p-4 mb-4">
                          <span className="text-5xl">🕌</span>
                        </div>
                        <h3 className="font-serif text-2xl text-primary dark:text-gold mb-2">
                          {selected.name}
                        </h3>
                        <p className="text-gray-500">📍 {selected.area}</p>
                      </div>

                      <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selected.note}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(selected.name + " " + selected.area)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gold text-gray-900 py-3 rounded-lg font-bold text-center hover:bg-gold-light transition"
                        >
                          🗺️ افتح في خرائط جوجل
                        </a>
                        <button
                          onClick={() => setSelected(null)}
                          className="px-5 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* آية */}
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
                  <p className="font-serif text-2xl md:text-3xl text-gold leading-relaxed mb-3">
                    ﴿إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ﴾
                  </p>
                  <p className="text-white/70">سورة التوبة - الآية 18</p>
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