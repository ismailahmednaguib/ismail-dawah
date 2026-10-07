"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

export default function DailyWirdPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [juz, setJuz] = useState(1);
  const [days, setDays] = useState(30);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("wirdProgress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const totalPages = 20 * juz; // 20 صفحة في الجزء
  const pagesPerDay = Math.ceil(totalPages / days);
  const today = new Date().toISOString().split("T")[0];
  const completedToday = Object.entries(progress).filter(([date]) => date === today).length;

  const generatePlan = () => {
    const plan = [];
    for (let day = 1; day <= days; day++) {
      const startPage = (day - 1) * pagesPerDay + 1;
      const endPage = Math.min(day * pagesPerDay, totalPages);
      plan.push({ day, startPage, endPage, juz: Math.ceil(endPage / 20) });
    }
    return plan;
  };

  const plan = generatePlan();

  const markDay = (day: number) => {
    const key = `${today}-day-${day}`;
    const updated = { ...progress, [key]: !progress[key] };
    setProgress(updated);
    localStorage.setItem("wirdProgress", JSON.stringify(updated));
  };

  const totalCompleted = Object.values(progress).filter(Boolean).length;
  const completionRate = Math.round((totalCompleted / plan.length) * 100);

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📖 الورد اليومي للقرآن</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            خطة منتظمة لختم القرآن الكريم
          </p>

          {/* الإعدادات */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
            <h3 className="font-bold text-primary dark:text-gold mb-4">⚙️ إعدادات الورد</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-sm mb-1">عدد الأجزاء</label>
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
                <label className="block font-bold text-sm mb-1">المدة (بالأيام)</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                >
                  {[7, 14, 30, 60, 90].map(d => (
                    <option key={d} value={d}>{d} يوم {d === 30 ? "(شهر)" : d === 7 ? "(أسبوع)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 bg-cream-dark dark:bg-gray-700 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">صفحات اليوم</p>
                  <p className="text-2xl font-bold text-primary dark:text-gold">{pagesPerDay}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">إجمالي الصفحات</p>
                  <p className="text-2xl font-bold text-primary dark:text-gold">{totalPages}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">التقدم</p>
                  <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* الخطة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
            <h3 className="font-bold text-primary dark:text-gold mb-4">📅 خطة القراءة</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {plan.map(p => {
                const key = `${today}-day-${p.day}`;
                const isDone = progress[key];
                return (
                  <div
                    key={p.day}
                    onClick={() => markDay(p.day)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                      isDone ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300" : "bg-cream-dark dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${
                        isDone ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}>
                        {isDone ? "✓" : p.day}
                      </span>
                      <div>
                        <p className="font-bold text-sm">اليوم {p.day}</p>
                        <p className="text-xs text-gray-500">
                          من صفحة {p.startPage} إلى {p.endPage} (الجزء {p.juz})
                        </p>
                      </div>
                    </div>
                    {isDone && <span className="text-green-600 font-bold">✅</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* نصيحة */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mt-6 text-center">
            <p className="font-serif text-xl text-primary dark:text-gold mb-2">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              استعن بالله ولا تنقطع عن وردك ولو بقدر قليل
            </p>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}