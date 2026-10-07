"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function DailyWirdPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [juz, setJuz] = useState(30);
  const [days, setDays] = useState(30);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("wirdProgress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const totalPages = 20 * juz;
  const pagesPerDay = Math.ceil(totalPages / days);
  const today = new Date().toISOString().split("T")[0];

  const plan = Array.from({ length: days }, (_, day) => ({
    day: day + 1,
    startPage: day * pagesPerDay + 1,
    endPage: Math.min((day + 1) * pagesPerDay, totalPages),
    juz: Math.ceil(((day + 1) * pagesPerDay) / 20),
  }));

  const markDay = (day: number) => {
    const key = `${today}-day-${day}`;
    const updated = { ...progress, [key]: !progress[key] };
    setProgress(updated);
    localStorage.setItem("wirdProgress", JSON.stringify(updated));
  };

  const totalCompleted = Object.values(progress).filter(Boolean).length;
  const completionRate = Math.round((totalCompleted / plan.length) * 100);

  const plans = [
    { name: "ختم القرآن كاملاً", juz: 30, days: 30, icon: "🌟" },
    { name: "ختم في شهرين", juz: 30, days: 60, icon: "📖" },
    { name: "جزء عم", juz: 1, days: 30, icon: "✨" },
    { name: "5 أجزاء", juz: 5, days: 30, icon: "🎯" },
  ];

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📖"
          title="الورد اليومي للقرآن"
          subtitle="خطط لختم القرآن الكريم بانتظام"
          verse="إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
          verseSource="سورة الإسراء - الآية 9"
          gradient="from-emerald-600 via-emerald-700 to-emerald-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-gold mb-1">{completionRate}%</p>
                <p className="text-sm text-gray-500">التقدم</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-gold mb-1">{totalCompleted}</p>
                <p className="text-sm text-gray-500">يوم مكتمل</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-gold mb-1">{pagesPerDay}</p>
                <p className="text-sm text-gray-500">صفحة/يوم</p>
              </div>
            </div>

            {/* خطط سريعة */}
            <IslamicSection title="خطط سريعة" icon="🎯" subtitle="اختر خطة تناسبك">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {plans.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setJuz(p.juz); setDays(p.days); }}
                    className={`p-4 rounded-xl text-center transition ${
                      juz === p.juz && days === p.days
                        ? "bg-gold text-gray-900 shadow-lg"
                        : "bg-white dark:bg-gray-800 text-primary dark:text-white hover:bg-gold/20 shadow-md"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{p.icon}</span>
                    <p className="font-bold text-sm mb-1">{p.name}</p>
                    <p className="text-xs opacity-75">{p.juz} جزء / {p.days} يوم</p>
                  </button>
                ))}
              </div>
            </IslamicSection>

            {/* تخصيص الخطة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg my-8">
              <h3 className="font-bold text-primary dark:text-gold mb-4">⚙️ تخصيص الخطة</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2">عدد الأجزاء</label>
                  <select
                    value={juz}
                    onChange={(e) => setJuz(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                  >
                    {[1, 5, 10, 15, 20, 30].map(j => (
                      <option key={j} value={j}>{j} {j === 30 ? "(القرآن كامل)" : "أجزاء"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-sm mb-2">المدة (بالأيام)</label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                  >
                    {[7, 14, 30, 60, 90, 180].map(d => (
                      <option key={d} value={d}>{d} يوم</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* الخطة اليومية */}
            <IslamicSection title="خطة القراءة" icon="📅" subtitle={`${days} يوم — ${pagesPerDay} صفحة يومياً`}>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {plan.map(p => {
                  const key = `${today}-day-${p.day}`;
                  const isDone = progress[key];
                  return (
                    <div
                      key={p.day}
                      onClick={() => markDay(p.day)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition ${
                        isDone 
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" 
                          : "bg-white dark:bg-gray-800 hover:bg-gold/10 shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-full grid place-items-center font-bold ${
                          isDone ? "bg-white/20" : "bg-gold/20 text-gold"
                        }`}>
                          {isDone ? "✓" : p.day}
                        </span>
                        <div>
                          <p className="font-bold">اليوم {p.day}</p>
                          <p className={`text-xs ${isDone ? "text-white/80" : "text-gray-500"}`}>
                            صفحات {p.startPage}-{p.endPage} (الجزء {p.juz})
                          </p>
                        </div>
                      </div>
                      {isDone && <span className="text-2xl">✅</span>}
                    </div>
                  );
                })}
              </div>
            </IslamicSection>

            {/* حديث */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 text-center shadow-2xl mt-8">
              <p className="font-serif text-xl text-gold leading-relaxed mb-2">
                «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
              </p>
              <p className="text-white/70 text-sm">رواه البخاري</p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}