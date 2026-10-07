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

export default function DoubtsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [doubts, setDoubts] = useState<any[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setDoubts(j.content?.doubts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(doubts.map((d) => d.category)))];
  const filteredDoubts = filter === "all" ? doubts : doubts.filter((d) => d.category === filter);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="⚔️"
          title="الرد على الشبهات"
          subtitle="ردود علمية منهجية على الشبهات المثارة حول الإسلام"
          verse="وَلَا يُؤُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ"
          verseSource="سورة البقرة - الآية 255"
          gradient="from-purple-600 via-purple-700 to-purple-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border-r-4 border-gold">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                الشبهات كالسحاب الصيفية، لا تلبث أن تنقشع. والإيمان القوي المبني على العلم هو الحصن الحصين للمسلم. هنا نرد على أهم الشبهات المثارة حول الإسلام بأسلوب علمي منهجي.
              </p>
            </div>

            {/* الفلاتر */}
            {categories.length > 1 && (
              <div className="flex gap-2 mb-8 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                      filter === c
                        ? "bg-gold text-gray-900"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold/20"
                    }`}
                  >
                    {c === "all" ? "📚 الكل" : c}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : filteredDoubts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-500">لا توجد شبهات في هذه الفئة</p>
              </div>
            ) : (
              <IslamicSection title={`${filteredDoubts.length} شبهة`} icon="💭" subtitle="اضغط على أي شبهة لقراءة الرد">
                <div className="space-y-4">
                  {filteredDoubts.map((d, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
                      <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full p-6 text-right flex items-start gap-4 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                      >
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full grid place-items-center text-2xl flex-shrink-0">
                          ❓
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full font-bold">
                              {d.category}
                            </span>
                          </div>
                          <p className="font-bold text-primary dark:text-gold text-lg mb-1">{d.q}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{d.a}</p>
                        </div>
                        <span className="text-gold text-2xl flex-shrink-0">{open === i ? "−" : "+"}</span>
                      </button>
                      {open === i && (
                        <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
                          <div className="bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500 rounded-lg p-4">
                            <p className="text-sm font-bold text-green-700 dark:text-green-300 mb-2">💡 الرد:</p>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                              {d.a}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </IslamicSection>
            )}

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <span className="text-6xl mb-4 block">💎</span>
              <h3 className="font-serif text-2xl text-gold mb-4">نصيحة مهمة</h3>
              <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
                لا تخض في الشبهات بلا علم، ولا تكثر من القراءة فيها إلا بقصد الرد والبيان. والإيمان القوي المبني على اليقين هو خير حصن من الشبهات والشهوات.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}