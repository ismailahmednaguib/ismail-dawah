"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const ruqyahVerses = [
  { title: "سورة الفاتحة", text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿1﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿2﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿3﴾ مَالِكِ يَوْمِ الدِّينِ ﴿4﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿5﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿6﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿7﴾", repeat: "7 مرات" },
  { title: "آية الكرسي", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", repeat: "3 مرات" },
  { title: "سورة الإخلاص", text: "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿1﴾ اللَّهُ الصَّمَدُ ﴿2﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿3﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿4﴾", repeat: "3 مرات" },
  { title: "سورة الفلق", text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿1﴾ مِن شَرِّ مَا خَلَقَ ﴿2﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿3﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿4﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿5﴾", repeat: "3 مرات" },
  { title: "سورة الناس", text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿1﴾ مَلِكِ النَّاسِ ﴿2﴾ إِلَٰهِ النَّاسِ ﴿3﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿4﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿5﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿6﴾", repeat: "3 مرات" },
  { title: "آيات إبطال السحر", text: "وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِيَ تَلْقَفُ مَا يَأْفِكُونَ ﴿117﴾ فَوَقَعَ الْحَقُّ وَبَطَلَ مَا كَانُوا يَعْمَلُونَ ﴿118﴾ فَغُلِبُوا هُنَالِكَ وَانقَلَبُوا صَاغِرِينَ ﴿119﴾", repeat: "3 مرات" },
];

const adhkar = [
  { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", repeat: "3 مرات صباحاً ومساءً" },
  { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", repeat: "3 مرات صباحاً ومساءً" },
  { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", repeat: "7 مرات" },
];

export default function RuqyahPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [counters, setCounters] = useState<Record<number, number>>({});

  const increment = (i: number, max: number) => {
    const current = counters[i] || 0;
    if (current < max) setCounters({ ...counters, [i]: current + 1 });
  };

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🕯️ الرقية الشرعية</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            «وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ»
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            آيات وأدعية من القرآن والسنة للشفاء والحماية
          </p>

          <div className="bg-primary text-white rounded-2xl p-6 mb-8">
            <h3 className="font-serif text-xl text-gold mb-3">📋 شروط الرقية الصحيحة:</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ أن تكون بكلام الله أو بأسمائه أو صفاته</li>
              <li>✅ أن تكون بالعربية أو بما يُعرف معناه</li>
              <li>✅ الاعتقاد أن الرقية لا تؤثر بذاتها بل بإذن الله</li>
            </ul>
          </div>

          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4">📖 آيات الرقية</h2>
          <div className="space-y-4 mb-10">
            {ruqyahVerses.map((v, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-primary dark:text-gold text-lg">{v.title}</h3>
                  <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full font-bold">{v.repeat}</span>
                </div>
                <p className="font-serif text-xl text-gray-800 dark:text-white leading-loose mb-4" dir="rtl">
                  {v.text}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    القرأت: {counters[i] || 0} / {parseInt(v.repeat)}
                  </span>
                  <button
                    onClick={() => increment(i, parseInt(v.repeat))}
                    className="bg-gold text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold-light transition"
                  >
                    قرأت ✓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4">🤲 أذكار الحماية</h2>
          <div className="space-y-3">
            {adhkar.map((a, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
                <p className="font-serif text-lg text-primary dark:text-gold leading-relaxed mb-2">{a.text}</p>
                <p className="text-xs text-gray-500">{a.repeat}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}