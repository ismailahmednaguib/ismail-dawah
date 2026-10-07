"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import { t, type Lang } from "@/lib/i18n";

type Surah = { number: number; name: string; englishName: string; numberOfAyahs: number; revelationType: string };
type Ayah = { number: number; text: string; numberInSurah: number };

export default function QuranPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(j => setSurahs(j.data || []))
      .catch(() => {});
  }, []);

  const loadSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    try {
      const r = await fetch(`https://api.alquran.cloud/v1/surah/${num}`);
      const j = await r.json();
      setAyahs(j.data?.ayahs || []);
    } catch {
      setAyahs([]);
    }
    setLoading(false);
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const filteredSurahs = surahs.filter(s =>
    s.name.includes(searchTerm) || s.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📖"
          title="المصحف الكريم"
          subtitle="اقرأ القرآن الكريم كاملاً برواية حفص عن عاصم"
          verse="إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
          verseSource="سورة الإسراء - الآية 9"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            {!selectedSurah ? (
              <>
                {/* بحث */}
                <div className="mb-8">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 ابحث عن سورة..."
                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 text-lg focus:border-gold focus:outline-none shadow-md"
                  />
                </div>

                {/* قائمة السور */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredSurahs.map(s => (
                    <button
                      key={s.number}
                      onClick={() => loadSurah(s.number)}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center hover:bg-gold hover:text-gray-900 transition shadow-md hover:shadow-xl group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-10 h-10 bg-gold/20 text-gold rounded-full grid place-items-center font-bold text-sm group-hover:bg-white/20 group-hover:text-white">
                          {s.number}
                        </span>
                        <span className="text-xs text-gray-400">{s.numberOfAyahs} آية</span>
                      </div>
                      <div className="font-serif font-bold text-primary dark:text-gold group-hover:text-gray-900 text-lg">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-800">
                        {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* معلومات السورة */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 text-center shadow-lg">
                  <h2 className="font-serif text-4xl text-primary dark:text-gold mb-2">{currentSurah?.name}</h2>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span>سورة رقم {selectedSurah}</span>
                    <span>•</span>
                    <span>{currentSurah?.numberOfAyahs} آية</span>
                    <span>•</span>
                    <span>{currentSurah?.revelationType === "Meccan" ? "مكية" : "مدنية"}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedSurah(null); setAyahs([]); }}
                    className="mt-4 text-sm text-gold font-bold hover:underline"
                  >
                    ← العودة لقائمة السور
                  </button>
                </div>

                {/* محتوى السورة */}
                {loading ? (
                  <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg leading-loose text-xl font-serif">
                    {selectedSurah !== 1 && selectedSurah !== 9 && (
                      <p className="text-center text-3xl text-gold mb-8 font-serif border-b-2 border-gold/30 pb-6">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    )}
                    <div className="space-y-6">
                      {ayahs.map(a => (
                        <p key={a.number} className="text-primary dark:text-white inline">
                          {a.text}{" "}
                          <span className="inline-block bg-gold/20 text-gold px-3 py-1 rounded-full text-xs mx-1 font-sans">
                            {a.numberInSurah}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}