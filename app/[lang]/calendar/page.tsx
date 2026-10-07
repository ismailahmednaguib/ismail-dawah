"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

type IslamicEvent = { title: string; hijri: string; gregorian: string; icon: string };

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

    Promise.all([
      fetch(`https://api.aladhan.com/v1/gpirayerToHijri/${d}-${m}-${y}`).catch(() => null),
      fetch(`https://api.aladhan.com/v1/hijriToGpirayer/1447-03-15`).catch(() => null),
    ]).then(async ([hijriRes]) => {
      if (hijriRes) {
        const j = await hijriRes.json();
        setHijriDate(j.data?.hijri);
        setGregorianDate(j.data?.gregorian);
      }
      setLoading(false);
    });
  }, []);

  const events: IslamicEvent[] = [
    { title: "رأس السنة الهجرية", hijri: "1 محرم", gregorian: "يختلف سنويًا", icon: "🌙" },
    { title: "المولد النبوي الشريف", hijri: "12 ربيع الأول", gregorian: "يختلف سنويًا", icon: "🌟" },
    { title: "الإسراء والمعراج", hijri: "27 رجب", gregorian: "يختلف سنويًا", icon: "✨" },
    { title: "بداية شهر رمضان", hijri: "1 رمضان", gregorian: "يختلف سنويًا", icon: "🌙" },
    { title: "ليلة القدر", hijri: "27 رمضان (تقريبًا)", gregorian: "يختلف سنويًا", icon: "⭐" },
    { title: "عيد الفطر", hijri: "1 شوال", gregorian: "يختلف سنويًا", icon: "🎉" },
    { title: "يوم عرفة", hijri: "9 ذو الحجة", gregorian: "يختلف سنويًا", icon: "🕋" },
    { title: "عيد الأضحى", hijri: "10 ذو الحجة", gregorian: "يختلف سنويًا", icon: "🐑" },
  ];

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📅 التقويم الهجري والميلادي</SectionTitle>

          {loading ? (
            <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
          ) : (
            <>
              {/* التواريخ الحالية */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-center">
                  <p className="text-sm text-gray-500 mb-2">{tr.hijriDate}</p>
                  <p className="font-serif text-3xl text-primary dark:text-gold mb-1">
                    {hijriDate?.day} {hijriDate?.month?.ar} {hijriDate?.year}
                  </p>
                  <p className="text-sm text-gray-400">{hijriDate?.weekday?.ar}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-center">
                  <p className="text-sm text-gray-500 mb-2">{tr.gregorianDate}</p>
                  <p className="font-serif text-3xl text-primary dark:text-gold mb-1">
                    {gregorianDate?.day} {gregorianDate?.month?.en} {gregorianDate?.year}
                  </p>
                  <p className="text-sm text-gray-400">{gregorianDate?.weekday?.en}</p>
                </div>
              </div>

              {/* الأحداث الإسلامية */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
                <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4 text-center">
                  🌟 المناسبات الإسلامية
                </h2>
                <div className="space-y-3">
                  {events.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                      <span className="text-2xl">{e.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-primary dark:text-white">{e.title}</p>
                        <p className="text-xs text-gray-500">📅 {e.hijri}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}