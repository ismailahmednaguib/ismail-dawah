"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const khutab = [
  {
    title: "خطبة عن التقوى",
    category: "أخلاق",
    intro: "فاتقوا الله حق تقاته ولا تموتن إلا وأنتم مسلمون. التقوى أن تجعل بينك وبين غضب الله وقاية.",
    points: [
      "التقوى وصية الله للأولين والآخرين",
      "ثمار التقوى في الدنيا والآخرة",
      "علامات المتقين في القرآن",
      "كيف نحقق التقوى في حياتنا اليومية"
    ],
    khatima: "اللهم اجعلنا من المتقين، واحشرنا في زمرتهم يوم الدين.",
    icon: "🌿",
    gradient: "from-emerald-600 to-emerald-700",
    verse: "وَلَقَدْ وَصَّيْنَا الَّذِينَ أُوتُوا الْكِتَابَ مِن قَبْلِكُمْ وَإِيَّاكُمْ أَنِ اتَّقُوا اللَّهَ"
  },
  {
    title: "خطبة عن بر الوالدين",
    category: "أسرة",
    intro: "﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾ بر الوالدين من أعظم الطاعات.",
    points: [
      "فضل بر الوالدين في القرآن والسنة",
      "عقوق الوالدين من أكبر الكبائر",
      "كيف نبر الوالدين في حياتهما وبعد مماتهما",
      "قصص من بر الصحابة بآبائهم"
    ],
    khatima: "اللهم ارحم والدينا كما ربونا صغارا، واغفر لهم وارحمهم.",
    icon: "👨‍👩‍👧",
    gradient: "from-rose-600 to-rose-700",
    verse: "وَبِالْوَالِدَيْنِ إِحْسَانًا"
  },
  {
    title: "خطبة عن الصدق",
    category: "أخلاق",
    intro: "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ﴾ الصدق منجاة، والكذب مهلكة.",
    points: [
      "الصدق طريق الجنة",
      "أنواع الصدق: مع الله، مع الناس، مع النفس",
      "آفات الكذب وعواقبه",
      "الصادقون في القرآن والسنة"
    ],
    khatima: "اللهم اجعلنا من الصادقين، وثبتنا على الحق حتى نلقاك.",
    icon: "✅",
    gradient: "from-blue-600 to-blue-700",
    verse: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ"
  },
  {
    title: "خطبة عن فضل العلم",
    category: "علم",
    intro: "﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾ العلم فريضة على كل مسلم.",
    points: [
      "فضل طلب العلم في الإسلام",
      "أنواع العلوم: شرعية ودنيوية",
      "آداب طالب العلم",
      "العلماء ورثة الأنبياء"
    ],
    khatima: "اللهم علمنا ما ينفعنا، وانفعنا بما علمتنا، وزدنا علماً.",
    icon: "📚",
    gradient: "from-indigo-600 to-indigo-700",
    verse: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ"
  },
  {
    title: "خطبة عن الصلاة",
    category: "عبادات",
    intro: "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾ الصلاة عمود الدين.",
    points: [
      "فضل الصلاة وأهميتها",
      "حكم تارك الصلاة",
      "كيف نخشع في الصلاة",
      "الصلاة نور وبرهان ونجاة"
    ],
    khatima: "اللهم أعنا على ذكرك وشكرك وحسن عبادتك.",
    icon: "🕌",
    gradient: "from-amber-600 to-amber-700",
    verse: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ"
  },
  {
    title: "خطبة عن التوبة",
    category: "توبة",
    intro: "﴿وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ﴾ باب التوبة مفتوح.",
    points: [
      "الله يفرح بتوبة عبده",
      "شروط التوبة النصوح",
      "قصص التائبين في القرآن",
      "لا تيأس من رحمة الله"
    ],
    khatima: "اللهم تب علينا إنك أنت التواب الرحيم.",
    icon: "🕊️",
    gradient: "from-purple-600 to-purple-700",
    verse: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ"
  },
];

export default function KhutabPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(khutab.map(k => k.category)))];
  const filteredKhutab = filter === "all" ? khutab : khutab.filter(k => k.category === filter);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🎤"
          title="مكتبة الخطب"
          subtitle="خطب جمعة جاهزة للأئمة والدعاة"
          hadith="خَيْرُ الْحَدِيثِ كِتَابُ اللَّهِ، وَخَيْرُ الْهَدْيِ هَدْيُ مُحَمَّدٍ ﷺ"
          gradient="from-amber-600 via-amber-700 to-amber-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 mb-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <span className="text-6xl mb-4 block">🎤</span>
                <h2 className="font-serif text-2xl text-gold mb-3">خدمة للأئمة والدعاة</h2>
                <p className="text-white/90 max-w-2xl mx-auto">
                  مجموعة من الخطب المنهجية الجاهزة، يمكنك استخدامها أو الاستلهام منها في خطبك. كل خطبة متكاملة بعناصرها وخاتمتها.
                </p>
              </div>
            </div>

            {selected === null ? (
              <>
                {/* الفلاتر */}
                <div className="flex gap-2 mb-8 flex-wrap justify-center">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      className={`px-5 py-2 rounded-full font-bold text-sm transition ${
                        filter === c
                          ? "bg-gold text-gray-900"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold/20"
                      }`}
                    >
                      {c === "all" ? "📚 الكل" : c}
                    </button>
                  ))}
                </div>

                {/* قائمة الخطب */}
                <IslamicSection title={`${filteredKhutab.length} خطبة`} icon="📜" subtitle="اختر الخطبة لعرض تفاصيلها">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredKhutab.map((k, i) => (
                      <button
                        key={i}
                        onClick={() => setSelected(khutab.indexOf(k))}
                        className={`group relative bg-gradient-to-br ${k.gradient} text-white rounded-2xl p-6 text-right shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-4xl">{k.icon}</span>
                            <span className="bg-white/20 backdrop-blur text-xs px-2 py-1 rounded-full font-bold">
                              {k.category}
                            </span>
                          </div>
                          <h3 className="font-serif text-xl font-bold mb-2">{k.title}</h3>
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">{k.intro}</p>
                          <div className="bg-white/20 backdrop-blur rounded-lg p-2 mb-3">
                            <p className="font-serif text-xs">﴿{k.verse.slice(0, 50)}...﴾</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/20">
                            <span className="text-xs text-white/80">{k.points.length} عناصر</span>
                            <span className="text-sm font-bold group-hover:translate-x-2 transition-transform">
                              عرض الخطبة ←
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </IslamicSection>
              </>
            ) : (
              // تفاصيل الخطبة
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-gold font-bold hover:underline mb-6"
                >
                  ← العودة لقائمة الخطب
                </button>

                <div className="text-center mb-8 pb-8 border-b-2 border-gold/30">
                  <span className="text-6xl mb-4 block">{khutab[selected].icon}</span>
                  <h2 className="font-serif text-3xl md:text-4xl text-primary dark:text-gold mb-3">
                    {khutab[selected].title}
                  </h2>
                  <span className="inline-block bg-gold/20 text-gold text-sm px-4 py-1 rounded-full font-bold">
                    {khutab[selected].category}
                  </span>
                </div>

                {/* المقدمة */}
                <div className="bg-cream-dark dark:bg-gray-700 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-primary dark:text-gold text-xl mb-3">🎯 المقدمة:</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {khutab[selected].intro}
                  </p>
                  <div className="bg-gold/10 border-r-4 border-gold rounded-lg p-4 mt-4">
                    <p className="font-serif text-lg text-primary dark:text-gold">
                      ﴿{khutab[selected].verse}﴾
                    </p>
                  </div>
                </div>

                {/* العناصر */}
                <div className="mb-8">
                  <h3 className="font-bold text-primary dark:text-gold text-xl mb-4">📋 عناصر الخطبة:</h3>
                  <div className="space-y-3">
                    {khutab[selected].points.map((p, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-cream-dark dark:bg-gray-700 rounded-xl">
                        <span className="w-10 h-10 bg-gold text-gray-900 rounded-full grid place-items-center font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 pt-2">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* الخاتمة */}
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6">
                  <h3 className="font-bold text-gold text-xl mb-3">🤲 الخاتمة:</h3>
                  <p className="font-serif text-lg leading-relaxed">
                    {khutab[selected].khatima}
                  </p>
                </div>

                {/* مشاركة */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: khutab[selected].title,
                          text: khutab[selected].intro,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="flex-1 bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition"
                  >
                    📤 مشاركة الخطبة
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-cream-dark dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gold/20 transition"
                  >
                    🖨️ طباعة
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}