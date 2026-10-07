"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const ruqyahVerses = [
  { title: "سورة الفاتحة", text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿1﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿2﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿3﴾ مَالِكِ يَوْمِ الدِّينِ ﴿4﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿5﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿6﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿7﴾", repeat: 7 },
  { title: "آية الكرسي", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", repeat: 3 },
  { title: "سورة الإخلاص", text: "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿1﴾ اللَّهُ الصَّمَدُ ﴿2﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿3﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿4﴾", repeat: 3 },
  { title: "سورة الفلق", text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿1﴾ مِن شَرِّ مَا خَلَقَ ﴿2﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿3﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿4﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿5﴾", repeat: 3 },
  { title: "سورة الناس", text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿1﴾ مَلِكِ النَّاسِ ﴿2﴾ إِلَٰهِ النَّاسِ ﴿3﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿4﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿5﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿6﴾", repeat: 3 },
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
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🕯️"
          title="الرقية الشرعية"
          subtitle="آيات وأدعية من القرآن والسنة للشفاء والحماية"
          verse="وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ"
          verseSource="سورة الإسراء - الآية 82"
          gradient="from-fuchsia-600 via-fuchsia-700 to-fuchsia-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            {/* شروط الرقية */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6 mb-8 shadow-lg">
              <h3 className="font-serif text-2xl text-gold mb-4">📋 شروط الرقية الصحيحة:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span>أن تكون بكلام الله أو بأسمائه أو صفاته</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span>أن تكون بالعربية أو بما يُعرف معناه</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span>الاعتقاد أن الرقية لا تؤثر بذاتها بل بإذن الله</span>
                </li>
              </ul>
            </div>

            {/* آيات الرقية */}
            <IslamicSection title="آيات الرقية" icon="📖" subtitle="اقرأ بيقين ותתם بصدق">
              <div className="space-y-6">
                {ruqyahVerses.map((v, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-r-4 border-gold hover:shadow-xl transition">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl text-primary dark:text-gold">{v.title}</h3>
                      <span className="bg-gold/20 text-gold text-sm px-3 py-1 rounded-full font-bold">
                        {v.repeat} مرات
                      </span>
                    </div>
                    <p className="font-serif text-2xl text-gray-800 dark:text-white leading-loose mb-4" dir="rtl">
                      {v.text}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">القرأة:</span>
                        <span className="font-bold text-gold">{counters[i] || 0} / {v.repeat}</span>
                      </div>
                      <button
                        onClick={() => increment(i, v.repeat)}
                        className="bg-gold text-gray-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gold-light transition"
                      >
                        قرأت ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* أدعية الحماية */}
            <IslamicSection title="أذكار الحماية" icon="🤲" subtitle="حافظ عليها صباحاً ومساءً">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition">
                  <p className="font-serif text-lg text-primary dark:text-gold leading-relaxed mb-2">
                    أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ
                  </p>
                  <p className="text-xs text-gray-500">3 مرات صباحاً ومساءً</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition">
                  <p className="font-serif text-lg text-primary dark:text-gold leading-relaxed mb-2">
                    بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ
                  </p>
                  <p className="text-xs text-gray-500">3 مرات صباحاً ومساءً</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition md:col-span-2">
                  <p className="font-serif text-lg text-primary dark:text-gold leading-relaxed mb-2">
                    حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ
                  </p>
                  <p className="text-xs text-gray-500">7 مرات</p>
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