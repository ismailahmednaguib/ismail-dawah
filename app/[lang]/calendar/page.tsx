"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

type IslamicEvent = { title: string; hijri: string; icon: string; desc: string };

export default function CalendarPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [hijriDate, setHijriDate] = useState<any>(null);
  const [gregorianDate, setGregorianDate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();

    fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setHijriDate(j.data.hijri);
          setGregorianDate(j.data.gregorian);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const events: IslamicEvent[] = [
    { title: "رأس السنة الهجرية", hijri: "1 محرم", icon: "🌙", desc: "بداية عام هجري جديد" },
    { title: "المولد النبوي الشريف", hijri: "12 ربيع الأول", icon: "🌟", desc: "ذكرى مولد النبي ﷺ" },
    { title: "الإسراء والمعراج", hijri: "27 رجب", icon: "✨", desc: "رحلة النبي ﷺ الليلية" },
    { title: "بداية شهر رمضان", hijri: "1 رمضان", icon: "🌙", desc: "شهر الصيام والقيام" },
    { title: "ليلة القدر", hijri: "27 رمضان", icon: "⭐", desc: "خير من ألف شهر" },
    { title: "عيد الفطر", hijri: "1 شوال", icon: "🎉", desc: "فرحة المسلمين بإتمام الصيام" },
    { title: "يوم عرفة", hijri: "9 ذو الحجة", icon: "🕋", desc: "أفضل أيام السنة" },
    { title: "عيد الأضحى", hijri: "10 ذو الحجة", icon: "🐑", desc: "عيد النحر والتضحية" },
  ];

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📅"
          title="التقويم الهجري والميلادي"
          subtitle="تابع التاريخ الهجري والمناسبات الإسلامية"
          verse="إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا"
          verseSource="سورة التوبة - الآية 36"
          gradient="from-indigo-600 via-indigo-700 to-indigo-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : (
              <>
                {/* التواريخ الحالية */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 shadow-lg">
                    <p className="text-white/80 mb-2">📅 التاريخ الهجري</p>
                    <p className="font-serif text-4xl text-gold mb-2">
                      {hijriDate?.day} {hijriDate?.month?.ar}
                    </p>
                    <p className="text-2xl text-white/90">{hijriDate?.year} هـ</p>
                    <p className="text-sm text-white/70 mt-2">{hijriDate?.weekday?.ar}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-r-4 border-gold">
                    <p className="text-gray-500 mb-2">📆 التاريخ الميلادي</p>
                    <p className="font-serif text-4xl text-primary dark:text-gold mb-2">
                      {gregorianDate?.day} {gregorianDate?.month?.en}
                    </p>
                    <p className="text-2xl text-gray-700 dark:text-gray-300">{gregorianDate?.year}</p>
                    <p className="text-sm text-gray-500 mt-2">{gregorianDate?.weekday?.en}</p>
                  </div>
                </div>

                {/* المناسبات الإسلامية */}
                <IslamicSection title="المناسبات الإسلامية" icon="🌟" subtitle="أهم الأحداث في التاريخ الهجري">
                  <div className="grid md:grid-cols-2 gap-4">
                    {events.map((e, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition border-r-4 border-gold">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{e.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-primary dark:text-gold text-lg mb-1">{e.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{e.desc}</p>
                            <span className="inline-block bg-gold/20 text-gold text-xs px-3 py-1 rounded-full font-bold">
                              📅 {e.hijri}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </IslamicSection>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}