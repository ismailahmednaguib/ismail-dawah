"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import { t, type Lang } from "@/lib/i18n";

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

type Ayah = {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda?: boolean;
};

const reciters = [
  { id: "ar.alafasy", name: "مشاري العفاسي" },
  { id: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد" },
  { id: "ar.husary", name: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "محمد صديق المنشاوي" },
  { id: "ar.ahmedajamy", name: "أحمد العجمي" },
  { id: "ar.maaboralmajeed", name: "ماهر المعيقلي" },
];

// تحويل الأرقام إلى عربية
const toArabicNum = (num: number): string => {
  const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().split("").map(d => arabicNums[parseInt(d)] || d).join("");
};

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
  const [reciter, setReciter] = useState("ar.alafasy");
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number } | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(j => setSurahs(j.data || []))
      .catch(() => {});
    
    const savedFav = localStorage.getItem("quran-favorites");
    if (savedFav) setFavorites(JSON.parse(savedFav));
    
    const savedLast = localStorage.getItem("quran-last-read");
    if (savedLast) setLastRead(JSON.parse(savedLast));

    const savedReciter = localStorage.getItem("quran-reciter");
    if (savedReciter) setReciter(savedReciter);

    const savedSize = localStorage.getItem("quran-font-size");
    if (savedSize) setFontSize(savedSize as any);
  }, []);

  const loadSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    setShowSidebar(false);
    try {
      const r = await fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`);
      const j = await r.json();
      setAyahs(j.data?.ayahs || []);
      localStorage.setItem("quran-last-read", JSON.stringify({ surah: num, ayah: 1 }));
      setLastRead({ surah: num, ayah: 1 });
    } catch {
      setAyahs([]);
    }
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const playAyah = (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      return;
    }
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayahNumber}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingAyah(ayahNumber);
    }
  };

  const toggleFavorite = (surahNum: number) => {
    const newFav = favorites.includes(surahNum)
      ? favorites.filter(f => f !== surahNum)
      : [...favorites, surahNum];
    setFavorites(newFav);
    localStorage.setItem("quran-favorites", JSON.stringify(newFav));
  };

  const changeFontSize = (size: "small" | "medium" | "large" | "xlarge") => {
    setFontSize(size);
    localStorage.setItem("quran-font-size", size);
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const filteredSurahs = surahs.filter(s =>
    s.name.includes(searchTerm) ||
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.number.toString() === searchTerm
  );

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📖"
          title="المصحف الشريف"
          subtitle="برواية حفص عن عاصم — على رسم مصحف المدينة النبوية"
          verse="إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
          verseSource="سورة الإسراء - الآية 9"
          gradient="from-emerald-800 via-emerald-900 to-emerald-950"
        />

        <audio ref={audioRef} onEnded={() => setPlayingAyah(null)} />

        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {!selectedSurah ? (
              <>
                {/* متابعة القراءة */}
                {lastRead && (
                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white rounded-2xl p-5 shadow-lg mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gold rounded-xl grid place-items-center text-2xl">
                        📖
                      </div>
                      <div>
                        <p className="text-sm text-white/80 mb-1">متابعة القراءة</p>
                        <p className="font-bold text-lg">
                          سورة {surahs.find(s => s.number === lastRead.surah)?.name || lastRead.surah}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => loadSurah(lastRead.surah)}
                      className="bg-gold text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gold-light transition"
                    >
                      متابعة ←
                    </button>
                  </div>
                )}

                {/* بحث */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg mb-6 sticky top-20 z-30">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 ابحث عن سورة بالاسم أو الرقم..."
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-5 py-3 text-lg focus:border-gold focus:outline-none"
                  />
                </div>

                {/* المفضلة */}
                {favorites.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-serif text-xl text-primary dark:text-gold mb-4 flex items-center gap-2">
                      <span>⭐</span>
                      <span>سورك المفضلة ({favorites.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {favorites.map(favNum => {
                        const s = surahs.find(s => s.number === favNum);
                        if (!s) return null;
                        return (
                          <button
                            key={favNum}
                            onClick={() => loadSurah(favNum)}
                            className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl p-4 shadow-md hover:shadow-xl transition hover:-translate-y-1 text-center"
                          >
                            <p className="font-serif text-xl font-bold">{s.name}</p>
                            <p className="text-xs text-white/80 mt-1">{toArabicNum(s.numberOfAyahs)} آية</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* فهرس السور */}
                <div className="mb-4">
                  <h3 className="font-serif text-xl text-primary dark:text-gold mb-4">
                    📖 فهرس سور القرآن الكريم ({filteredSurahs.length} سورة)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredSurahs.map(s => {
                    const isFav = favorites.includes(s.number);
                    return (
                      <div
                        key={s.number}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition group relative overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFavorite(s.number)}
                          className="absolute top-2 left-2 text-xl z-10 hover:scale-125 transition"
                        >
                          {isFav ? "⭐" : "☆"}
                        </button>
                        <button
                          onClick={() => loadSurah(s.number)}
                          className="w-full p-4 text-center"
                        >
                          {/* رقم السورة بشكل مزخرف */}
                          <div className="relative mx-auto w-14 h-14 mb-3">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900 rotate-45 rounded-lg"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {toArabicNum(s.number)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="font-serif text-2xl text-primary dark:text-gold font-bold mb-1">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {toArabicNum(s.numberOfAyahs)} آية • {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* شريط الأدوات العلوي */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-lg sticky top-20 z-30">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={() => { setSelectedSurah(null); setAyahs([]); setPlayingAyah(null); }}
                      className="flex items-center gap-2 bg-cream-dark dark:bg-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gold/20 transition"
                    >
                      <span>←</span>
                      <span>الفهرس</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* القارئ */}
                      <select
                        value={reciter}
                        onChange={(e) => {
                          setReciter(e.target.value);
                          localStorage.setItem("quran-reciter", e.target.value);
                        }}
                        className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:border-gold"
                      >
                        {reciters.map(r => (
                          <option key={r.id} value={r.id}>🎙️ {r.name}</option>
                        ))}
                      </select>

                      {/* حجم الخط */}
                      <div className="flex gap-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        {(["small", "medium", "large", "xlarge"] as const).map(size => (
                          <button
                            key={size}
                            onClick={() => changeFontSize(size)}
                            className={`px-3 py-2 text-sm font-bold transition ${
                              fontSize === size
                                ? "bg-gold text-gray-900"
                                : "bg-cream-dark dark:bg-gray-700 hover:bg-gold/20"
                            }`}
                          >
                            {size === "small" ? "أ" : size === "medium" ? "ب" : size === "large" ? "ج" : "د"}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleFavorite(selectedSurah)}
                        className="text-2xl hover:scale-110 transition"
                      >
                        {favorites.includes(selectedSurah) ? "⭐" : "☆"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* صفحة المصحف */}
                {loading ? (
                  <div className="quran-page text-center py-20">
                    <p className="text-2xl text-gray-500">⏳ جاري التحميل...</p>
                  </div>
                ) : (
                  <div className="quran-page">
                    {/* رأس السورة المزخرف */}
                    <div className="surah-header">
                      <p className="surah-name">سُورَةُ {currentSurah?.name.replace("سُورَةُ ", "")}</p>
                      <p className="surah-info">
                        {currentSurah?.revelationType === "Meccan" ? "مَكِّيَّة" : "مَدَنِيَّة"} • 
                        عَدَدُ آيَاتِهَا {toArabicNum(currentSurah?.numberOfAyahs || 0)}
                      </p>
                    </div>

                    {/* البسملة (ما عدا سورة الفاتحة والتوبة) */}
                    {selectedSurah !== 1 && selectedSurah !== 9 && (
                      <div className="basmala">
                        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                      </div>
                    )}

                    {/* نص الآيات */}
                    <div className={`quran-text size-${fontSize}`}>
                      {ayahs.map((ayah, idx) => {
                        const prevJuz = idx > 0 ? ayahs[idx - 1].juz : null;
                        const isNewJuz = ayah.juz !== prevJuz && idx > 0;
                        
                        return (
                          <span key={ayah.number}>
                            {/* علامة الجزء الجديد */}
                            {isNewJuz && (
                              <span className="juz-marker block my-4">
                                الجُزءُ {toArabicNum(ayah.juz)}
                              </span>
                            )}

                            {/* الآية مع إمكانية الضغط للاستماع */}
                            <span
                              onClick={() => playAyah(ayah.number)}
                              className={`cursor-pointer transition ${
                                playingAyah === ayah.number ? "ayah-playing" : ""
                              }`}
                            >
                              {ayah.text}
                              <span className="ayah-number">
                                {toArabicNum(ayah.numberInSurah)}
                              </span>
                              {ayah.sajda && <span className="sajda-mark">۩</span>}
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    {/* خاتمة السورة */}
                    <div className="text-center mt-8 pt-6 border-t-2 border-gold/30">
                      <p className="font-serif text-2xl text-gold mb-2">
                        صَدَقَ اللَّهُ العَظِيمُ
                      </p>
                      <p className="text-sm text-gray-500">
                        تمت سورة {currentSurah?.name} بحمد الله
                      </p>
                      <div className="flex gap-3 justify-center mt-4">
                        {selectedSurah > 1 && (
                          <button
                            onClick={() => loadSurah(selectedSurah - 1)}
                            className="bg-cream-dark dark:bg-gray-700 px-5 py-2 rounded-lg font-bold hover:bg-gold/20 transition"
                          >
                            → السورة السابقة
                          </button>
                        )}
                        {selectedSurah < 114 && (
                          <button
                            onClick={() => loadSurah(selectedSurah + 1)}
                            className="bg-gold text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-gold-light transition"
                          >
                            السورة التالية ←
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* قائمة التشغيل الحالي */}
                {playingAyah && (
                  <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl border-2 border-gold z-40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          audioRef.current?.pause();
                          setPlayingAyah(null);
                        }}
                        className="w-12 h-12 bg-gold text-gray-900 rounded-full grid place-items-center text-xl hover:bg-gold-light transition"
                      >
                        ⏸️
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary dark:text-gold truncate">
                          {currentSurah?.name} - الآية {toArabicNum(
                            ayahs.find(a => a.number === playingAyah)?.numberInSurah || 0
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reciters.find(r => r.id === reciter)?.name}
                        </p>
                      </div>
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