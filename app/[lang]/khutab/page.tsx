"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
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
    icon: "🌿"
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
    icon: "👨‍👩‍👧"
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
    icon: "✅"
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
    icon: "📚"
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
    icon: "🕌"
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
    icon: "🕊️"
  },
];

export default function KhutabPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🎤 مكتبة الخطب</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            خطب جمعة جاهزة للأئمة والدعاة
          </p>

          {selected === null ? (
            <div className="grid md:grid-cols-2 gap-5">
              {khutab.map((k, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-right shadow-md hover:shadow-xl transition border border-transparent hover:border-gold"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{k.icon}</span>
                    <div>
                      <span className="inline-block bg-primary text-gold text-xs px-2 py-0.5 rounded-full mb-1">{k.category}</span>
                      <h3 className="font-bold text-lg text-primary dark:text-gold">{k.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{k.intro}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gold font-bold hover:underline mb-6"
              >
                ← العودة للقائمة
              </button>

              <div className="text-center mb-6 pb-6 border-b-2 border-gold/30">
                <span className="text-6xl mb-3 block">{khutab[selected].icon}</span>
                <h2 className="font-serif text-3xl text-primary dark:text-gold">{khutab[selected].title}</h2>
                <span className="inline-block bg-primary text-gold text-xs px-3 py-1 rounded-full mt-2">
                  {khutab[selected].category}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-primary dark:text-gold mb-2">🎯 المقدمة:</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{khutab[selected].intro}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-primary dark:text-gold mb-3">📋 عناصر الخطبة:</h3>
                <ul className="space-y-2">
                  {khutab[selected].points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold font-bold">{i + 1}.</span>
                      <span className="text-gray-700 dark:text-gray-300">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary text-white rounded-xl p-5">
                <h3 className="font-bold text-gold mb-2">🤲 الخاتمة:</h3>
                <p className="leading-relaxed">{khutab[selected].khatima}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}