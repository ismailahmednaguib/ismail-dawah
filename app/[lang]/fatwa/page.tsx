"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function FatwaPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [fatwas, setFatwas] = useState<any[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setFatwas(j.content?.fatwas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const filteredFatwas = fatwas.filter((f) =>
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="❓"
          title="الفتاوى الشرعية"
          subtitle={`${fatwas.length} فتوى في مختلف المجالات`}
          hadith="مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ"
          gradient="from-blue-600 via-blue-700 to-blue-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* بحث */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-8">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 ابحث في الفتاوى..."
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:border-gold focus:outline-none"
              />
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : filteredFatwas.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-gray-500">
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد فتاوى بعد"}
                </p>
              </div>
            ) : (
              <IslamicSection title={`الفتاوى (${filteredFatwas.length})`} icon="📜">
                <div className="space-y-4">
                  {filteredFatwas.map((f, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                      <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full p-6 text-right flex items-start gap-4 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                      >
                        <span className="text-3xl flex-shrink-0">❓</span>
                        <div className="flex-1">
                          <p className="font-bold text-primary dark:text-gold text-lg mb-1">{f.q}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{f.a}</p>
                        </div>
                        <span className="text-gold text-2xl flex-shrink-0">{open === i ? "−" : "+"}</span>
                      </button>
                      {open === i && (
                        <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {f.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </IslamicSection>
            )}

            {/* تنبيه */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-6 mt-8">
              <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                ⚠️ <strong>تنبيه:</strong> هذه الفتاوى عامة، وفي المسائل الخاصة يُنصح بالرجوع لعالم ثقة يفهم ظروفك الخاصة.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}