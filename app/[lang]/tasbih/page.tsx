"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const adhkarOptions = [
  { text: "سُبْحَانَ اللَّهِ", target: 33, translation: "Glory be to Allah" },
  { text: "الْحَمْدُ لِلَّهِ", target: 33, translation: "Praise be to Allah" },
  { text: "اللَّهُ أَكْبَرُ", target: 34, translation: "Allah is the Greatest" },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100, translation: "There is no god but Allah" },
  { text: "أَسْتَغْفِرُ اللَّهَ", target: 100, translation: "I seek forgiveness from Allah" },
  { text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100, translation: "O Allah, bless Muhammad" },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100, translation: "Glory and praise to Allah" },
  { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 100, translation: "No power except with Allah" },
];

export default function TasbihPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [vibrate, setVibrate] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("tasbihTotal");
    if (saved) setTotal(Number(saved));
  }, []);

  const current = adhkarOptions[selected];

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    const newTotal = total + 1;
    setTotal(newTotal);
    localStorage.setItem("tasbihTotal", String(newTotal));

    if (vibrate && navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (newCount === current.target) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
      setTimeout(() => {
        if (confirm("✅ أكملت الذكر! هل تريد البدء من جديد؟")) {
          setCount(0);
        }
      }, 100);
    }
  };

  const reset = () => {
    if (confirm("هل تريد تصفير العداد؟")) {
      setCount(0);
    }
  };

  const resetTotal = () => {
    if (confirm("هل تريد تصفير الإجمالي؟")) {
      setTotal(0);
      localStorage.setItem("tasbihTotal", "0");
    }
  };

  return (
    <>
      <Header lang={L} />
      <main className="py-10 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📿 التسبيح الرقمي</SectionTitle>

          {/* اختيار الذكر */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-4">
            <h3 className="font-bold text-primary dark:text-gold mb-3">اختر الذكر:</h3>
            <div className="grid grid-cols-2 gap-2">
              {adhkarOptions.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelected(i); setCount(0); }}
                  className={`p-3 rounded-xl text-sm font-bold transition ${
                    selected === i
                      ? "bg-gold text-gray-900"
                      : "bg-cream-dark dark:bg-gray-700 text-primary dark:text-white hover:bg-gold/20"
                  }`}
                >
                  {d.text.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* الذكر الحالي */}
          <div className="bg-primary text-white rounded-2xl p-8 shadow-xl mb-4 text-center">
            <p className="font-serif text-4xl md:text-5xl leading-relaxed mb-2">
              {current.text}
            </p>
            <p className="text-sm text-gold-light">{current.translation}</p>
            <p className="text-xs text-white/60 mt-2">الهدف: {current.target}</p>
          </div>

          {/* العداد */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-center">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">الحالي</p>
              <p className="text-7xl font-bold text-gold">{count}</p>
              <p className="text-sm text-gray-500 mt-1">من {current.target}</p>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-gold h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (count / current.target) * 100)}%` }}
              />
            </div>

            {/* زر العد */}
            <button
              onClick={increment}
              className="w-full h-32 bg-gradient-to-br from-gold to-gold-light text-gray-900 rounded-2xl font-bold text-2xl shadow-lg active:scale-95 transition mb-4"
            >
              📿 اضغط للعد
            </button>

            {/* خيارات */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={reset}
                className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 py-2 rounded-lg font-bold text-sm"
              >
                🔄 تصفير
              </button>
              <button
                onClick={() => setVibrate(!vibrate)}
                className={`flex-1 py-2 rounded-lg font-bold text-sm ${
                  vibrate
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {vibrate ? "📳 اهتزاز" : "🔇 صامت"}
              </button>
            </div>

            {/* الإجمالي */}
            <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 mt-4">
              <p className="text-xs text-gray-500 mb-1">إجمالي التسبيحات</p>
              <p className="text-3xl font-bold text-primary dark:text-gold">
                {total.toLocaleString("ar-EG")}
              </p>
              <button
                onClick={resetTotal}
                className="text-xs text-red-500 hover:underline mt-2"
              >
                تصفير الإجمالي
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}