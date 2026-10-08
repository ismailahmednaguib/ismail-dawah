"use client";

import { useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

// ===== بيانات الأذكار =====
type Dhikr = {
  text: string;
  count: number;
  source: string;
};

type AdhkarCategory = {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  adhkar: Dhikr[];
};

const ADHKAR_DATA: AdhkarCategory[] = [
  {
    id: "morning",
    titleAr: "أذكار الصباح",
    titleEn: "Morning Adhkar",
    icon: "🌅",
    adhkar: [
      {
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        count: 1,
        source: "رواه الترمذي",
      },
      {
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        count: 100,
        source: "رواه مسلم",
      },
      {
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 10,
        source: "متفق عليه",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        count: 1,
        source: "رواه ابن ماجه",
      },
      {
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
        source: "رواه الترمذي",
      },
    ],
  },
  {
    id: "evening",
    titleAr: "أذكار المساء",
    titleEn: "Evening Adhkar",
    icon: "🌙",
    adhkar: [
      {
        text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        count: 1,
        source: "رواه الترمذي",
      },
      {
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        count: 3,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        count: 1,
        source: "رواه البخاري",
      },
    ],
  },
  {
    id: "sleep",
    titleAr: "أذكار النوم",
    titleEn: "Sleep Adhkar",
    icon: "🛏️",
    adhkar: [
      {
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        count: 1,
        source: "رواه البخاري",
      },
      {
        text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        count: 3,
        source: "رواه أبو داود",
      },
      {
        text: "سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (34)",
        count: 1,
        source: "متفق عليه",
      },
    ],
  },
  {
    id: "prayer",
    titleAr: "أذكار بعد الصلاة",
    titleEn: "After Prayer Adhkar",
    icon: "🕌",
    adhkar: [
      {
        text: "أَسْتَغْفِرُ اللَّهَ",
        count: 3,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        count: 1,
        source: "رواه مسلم",
      },
      {
        text: "سُبْحَانَ اللَّهِ",
        count: 33,
        source: "رواه مسلم",
      },
      {
        text: "الْحَمْدُ لِلَّهِ",
        count: 33,
        source: "رواه مسلم",
      },
      {
        text: "اللَّهُ أَكْبَرُ",
        count: 33,
        source: "رواه مسلم",
      },
    ],
  },
];

// ===== مكوّن الذكر الواحد مع العداد =====
function DhikrCard({ dhikr, lang }: { dhikr: Dhikr; lang: Lang }) {
  const [currentCount, setCurrentCount] = useState(0);
  const [done, setDone] = useState(false);

  const handleClick = () => {
    if (done) return;
    const newCount = currentCount + 1;
    setCurrentCount(newCount);
    if (newCount >= dhikr.count) {
      setDone(true);
    }
  };

  const progress = Math.min((currentCount / dhikr.count) * 100, 100);

  return (
    <div
      onClick={handleClick}
      className={`card card-interactive p-6 transition-all duration-300 ${
        done ? "opacity-60 border-green-400" : ""
      }`}
    >
      {/* شريط التقدم */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-night-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* نص الذكر */}
      <p className="mb-4 text-lg leading-relaxed text-slate-800 dark:text-slate-100" style={{ fontFamily: "var(--font-amiri)" }}>
        {dhikr.text}
      </p>

      {/* المصدر والعداد */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{dhikr.source}</span>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
            done
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
          }`}
        >
          {done ? "✓" : `${currentCount}/${dhikr.count}`}
        </span>
      </div>
    </div>
  );
}

// ===== المحتوى الرئيسي =====
export default function AdhkarContent({ lang }: { lang: Lang }) {
  const [activeCategory, setActiveCategory] = useState<string>("morning");

  const currentCategory = ADHKAR_DATA.find((c) => c.id === activeCategory)!;

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-16 text-white md:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />
        <div className="container-page relative text-center">
          <span className="mb-4 inline-block text-5xl">🤲</span>
          <h1 className="mb-4 text-4xl font-black md:text-5xl" style={{ fontFamily: "var(--font-amiri)" }}>
            {t(lang, "adhkar.title")}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-primary-100">
            {t(lang, "adhkar.subtitle")}
          </p>
        </div>
      </section>

      {/* التبويبات */}
      <section className="container-page py-10">
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {ADHKAR_DATA.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                  : "bg-white text-slate-600 hover:bg-primary-50 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700"
              }`}
            >
              <span>{category.icon}</span>
              <span>{lang === "ar" ? category.titleAr : category.titleEn}</span>
            </button>
          ))}
        </div>

        {/* الأذكار */}
        <div className="grid gap-4 md:grid-cols-2">
          {currentCategory.adhkar.map((dhikr, index) => (
            <DhikrCard key={`${activeCategory}-${index}`} dhikr={dhikr} lang={lang} />
          ))}
        </div>

        {/* زر الرجوع */}
        <div className="mt-10 text-center">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-night-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={lang === "ar" ? "rotate-180" : ""}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t(lang, "common.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}