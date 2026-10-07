"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const adhkarOptions = [
  { text: "سُبْحَانَ اللَّهِ", translation: "Glory be to Allah", target: 33, icon: "✨" },
  { text: "الْحَمْدُ لِلَّهِ", translation: "Praise be to Allah", target: 33, icon: "🌟" },
  { text: "اللَّهُ أَكْبَرُ", translation: "Allah is the Greatest", target: 34, icon: "💫" },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ", translation: "There is no god but Allah", target: 100, icon: "☝️" },
  { text: "أَسْتَغْفِرُ اللَّهَ", translation: "I seek forgiveness", target: 100, icon: "🤲" },
  { text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", translation: "O Allah, bless Muhammad", target: 100, icon: "🌙" },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", translation: "Glory and praise to Allah", target: 100, icon: "⭐" },
  { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", translation: "No power except with Allah", target: 100, icon: "💪" },
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
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("tasbihTotal");
    if (saved) setTotal(Number(saved));
  }, []);

  const current = adhkarOptions[selected];

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    const newTotal = total + 1;
    const newSession = sessionTotal + 1;
    setTotal(newTotal);
    setSessionTotal(newSession);
    localStorage.setItem("tasbihTotal", String(newTotal));

    if (vibrate && navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (newCount === current.target) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    }
  };

  const reset = () => setCount(0);
  const resetTotal = () => {
    if (confirm("هل تريد تصفير الإجمالي؟")) {
      setTotal(0);
      setSessionTotal(0);
      localStorage.setItem("tasbihTotal", "0");
    }
  };

  const progress = Math.min(100, (count / current.target) * 100);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📿"
          title="التسبيح الرقمي"
          subtitle="سبحة إلكترونية مع اهتزاز وإحصائيات"
          hadith="أَحَبُّ الْكَلَامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ"
          gradient="from-purple-600 via-purple-700 to-purple-800"
        />

        <section className="py-10">
          <div className="max-w-3xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* اختيار الذكر */}
            <IslamicSection title="اختر الذكر" icon="📿">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {adhkarOptions.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelected(i); setCount(0); }}
                    className={`p-4 rounded-xl text-center transition ${
                      selected === i
                        ? "bg-gold text-gray-900 shadow-lg scale-105"
                        : "bg-white dark:bg-gray-800 text-primary dark:text-white hover:bg-gold/20 shadow-md"
                    }`}
                  >
                    <div className="text-3xl mb-2">{d.icon}</div>
                    <p className="font-bold text-sm">{d.text.slice(0, 15)}...</p>
                    <p className="text-xs opacity-75 mt-1">{d.target} مرة</p>
                  </button>
                ))}
              </div>
            </IslamicSection>

            {/* الذكر الحالي */}
            <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 shadow-2xl my-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="relative text-center">
                <div className="inline-block bg-gold/20 backdrop-blur rounded-full p-4 mb-4">
                  <span className="text-6xl">{current.icon}</span>
                </div>
                <p className="font-serif text-4xl md:text-5xl text-gold leading-relaxed mb-3">
                  {current.text}
                </p>
                <p className="text-white/80 text-sm">{current.translation}</p>
                <p className="text-white/60 text-xs mt-2">الهدف: {current.target} مرة</p>
              </div>
            </div>

            {/* العداد */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              {/* الرقم الحالي */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">العدد الحالي</p>
                <p className="text-8xl md:text-9xl font-bold text-gold mb-2">
                  {count}
                </p>
                <p className="text-gray-500">من {current.target}</p>
              </div>

              {/* شريط التقدم */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gold to-gold-light h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* زر العد الرئيسي */}
              <button
                onClick={increment}
                className="w-full h-40 bg-gradient-to-br from-gold to-gold-light text-gray-900 rounded-3xl font-bold text-3xl shadow-2xl active:scale-95 transition mb-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative">
                  <span className="text-5xl block mb-2">📿</span>
                  <span>اضغط للعد</span>
                </div>
              </button>

              {/* الأزرار الثانوية */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={reset}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 py-4 rounded-xl font-bold hover:bg-red-100 transition"
                >
                  🔄 تصفير العداد
                </button>
                <button
                  onClick={() => setVibrate(!vibrate)}
                  className={`py-4 rounded-xl font-bold transition ${
                    vibrate
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {vibrate ? "📳 اهتزاز مفعّل" : "🔇 اهتزاز معطّل"}
                </button>
              </div>

              {/* إحصائيات الجلسة */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">إجمالي اليوم</p>
                  <p className="text-2xl font-bold text-gold">{sessionTotal}</p>
                </div>
                <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">الإجمالي الكلي</p>
                  <p className="text-2xl font-bold text-primary dark:text-gold">
                    {total.toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>

              <button
                onClick={resetTotal}
                className="w-full mt-4 text-xs text-red-500 hover:underline"
              >
                تصفير الإجمالي الكلي
              </button>
            </div>

            {/* أحاديث عن فضل الذكر */}
            <IslamicSection title="فضل الذكر" icon="🌟">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-5 shadow-lg">
                  <p className="font-serif text-lg leading-relaxed mb-3">
                    «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ»
                  </p>
                  <p className="text-xs text-white/80">رواه البخاري</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg">
                  <p className="font-serif text-lg leading-relaxed mb-3">
                    «أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»
                  </p>
                  <p className="text-xs text-white/80">رواه البخاري</p>
                </div>
              </div>
            </IslamicSection>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}