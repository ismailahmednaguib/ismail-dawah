"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { defaultContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

type Surah = { number: number; name: string; englishName: string; numberOfAyahs: number };
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📖 المصحف الكريم</SectionTitle>

          {!selectedSurah ? (
            <>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن سورة..."
                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-5 py-3 mb-6 focus:border-gold focus:outline-none"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredSurahs.map(s => (
                  <button
                    key={s.number}
                    onClick={() => loadSurah(s.number)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center hover:bg-gold hover:text-gray-900 transition shadow-md"
                  >
                    <div className="text-xs text-gray-400 mb-1">{s.number}</div>
                    <div className="font-serif font-bold text-primary dark:text-gold">{s.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.numberOfAyahs} آية</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 text-center shadow-md">
                <h2 className="font-serif text-3xl text-primary dark:text-gold mb-2">{currentSurah?.name}</h2>
                <p className="text-sm text-gray-500">سورة رقم {selectedSurah} - {currentSurah?.numberOfAyahs} آية</p>
                <button
                  onClick={() => { setSelectedSurah(null); setAyahs([]); }}
                  className="mt-4 text-sm text-gold font-bold hover:underline"
                >
                  ← العودة لقائمة السور
                </button>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md leading-loose text-lg font-serif">
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <p className="text-center text-2xl text-gold mb-6 font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  )}
                  <div className="space-y-4">
                    {ayahs.map(a => (
                      <p key={a.number} className="text-primary dark:text-white inline">
                        {a.text} <span className="inline-block bg-gold/20 text-gold px-2 py-0.5 rounded-full text-xs mx-1">{a.numberInSurah}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}