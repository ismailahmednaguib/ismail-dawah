"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function AdhkarPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [adhkar, setAdhkar] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setAdhkar(j.content?.adhkar || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(adhkar.map((a) => a.category))];
  const filteredAdhkar = category === "all" ? adhkar : adhkar.filter((a) => a.category === category);

  const increment = (id: number, max: number) => {
    const current = counters[id] || 0;
    if (current < max) {
      setCounters({ ...counters, [id]: current + 1 });
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  const resetCounter = (id: number) => {
    setCounters({ ...counters, [id]: 0 });
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🤲"
          title="الأذكار والأدعية"
          subtitle="وردك اليومي من الأذكار المباركة"
          verse="أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
          verseSource="سورة الرعد - الآية 28"
          gradient="from-purple-600 via-purple-700 to-purple-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* الفلاتر */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                    category === c
                      ? "bg-gold text-gray-900"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold/20"
                  }`}
                >
                  {c === "all" ? "📿 الكل" : c}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : (
              <IslamicSection title={`${filteredAdhkar.length} ذكر`} icon="✨">
                <div className="space-y-4">
                  {filteredAdhkar.map((a) => {
                    const count = counters[a.id] || 0;
                    const isComplete = count >= a.repeat;
                    return (
                      <div
                        key={a.id}
                        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md transition ${
                          isComplete ? "border-2 border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full font-bold">
                            {a.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {count} / {a.repeat}
                          </span>
                        </div>
                        <p className="font-serif text-xl text-primary dark:text-white leading-loose mb-4">
                          {a.text}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => increment(a.id, a.repeat)}
                            disabled={isComplete}
                            className={`flex-1 py-3 rounded-lg font-bold transition ${
                              isComplete
                                ? "bg-green-500 text-white"
                                : "bg-gold text-gray-900 hover:bg-gold-light"
                            }`}
                          >
                            {isComplete ? "✅ تم" : "📿 عدّ"}
                          </button>
                          <button
                            onClick={() => resetCounter(a.id)}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 transition"
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </IslamicSection>
            )}

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 text-center shadow-2xl mt-10">
              <p className="font-serif text-2xl text-gold mb-3">
                «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ»
              </p>
              <p className="text-white/80">سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ</p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}