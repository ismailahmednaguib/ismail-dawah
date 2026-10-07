"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const prophets = [
  { name: "آدم عليه السلام", icon: "🌱", story: "أبو البشرية، خلقه الله بيده ونفخ فيه من روحه، وأسجد له الملائكة. أكل من الشجرة فتاب الله عليه.", lesson: "التوبة باب مفتوح، والله يحب التوابين." },
  { name: "نوح عليه السلام", icon: "🚢", story: "أول رسول إلى أهل الأرض، دعا قومه 950 سنة فلم يؤمن إلا قليل. صنع السفينة ونجّاه الله من الطوفان.", lesson: "الصبر على الدعوة، وعدم اليأس." },
  { name: "إبراهيم عليه السلام", icon: "🕋", story: "خليل الرحمن، حطّم الأصنام، وأُلقي في النار فكانت برداً وسلاماً. بنى الكعبة مع ابنه إسماعيل.", lesson: "التوحيد الخالص، والتسليم لأمر الله." },
  { name: "موسى عليه السلام", icon: "📜", story: "كليم الله، نشأ في قصر فرعون. كلّمه الله في الوادي المقدس، وأرسله إلى فرعون. أنزل الله عليه التوراة.", lesson: "الثقة بنصر الله، مهما كان العدو قوياً." },
  { name: "عيسى عليه السلام", icon: "✨", story: "ولد من أم بلا أب بمعجزة، تكلّم في المهد، وأحيا الموتى بإذن الله. رفعه الله إليه.", lesson: "قدرة الله على كل شيء." },
  { name: "يوسف عليه السلام", icon: "👑", story: "أحسن القصص. حسده إخوته فألقوه في البئر، ثم أصبح عزيز مصر بعد ابتلاءات طويلة.", lesson: "العفة والصبر والعاقبة للمتقين." },
  { name: "أيوب عليه السلام", icon: "🤲", story: "نبي صبور، ابتلاه الله في ماله وأهله وجسده سنين طويلة، فلم يزد على الصبر والدعاء.", lesson: "الصبر على البلاء." },
  { name: "محمد ﷺ", icon: "🌙", story: "خاتم الأنبياء وسيد المرسلين، بُعث رحمة للعالمين. نزل عليه القرآن، وهاجر إلى المدينة.", lesson: "الأسوة الحسنة في كل شيء." },
];

export default function ProphetsStoriesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📖"
          title="قصص الأنبياء"
          subtitle="دروس وعبر من حياة أنبياء الله ورسله"
          verse="لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِّأُولِي الْأَلْبَابِ"
          verseSource="سورة يوسف - الآية 111"
          gradient="from-indigo-600 via-indigo-700 to-indigo-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            {selected === null ? (
              <IslamicSection title="اختر نبيًا" icon="⭐" subtitle="اضغط على أي نبي لقراءة قصته">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {prophets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:border-gold border-2 border-transparent hover:shadow-xl transition hover:-translate-y-1 group"
                    >
                      <div className="text-5xl mb-3 group-hover:scale-110 transition">{p.icon}</div>
                      <p className="font-serif font-bold text-primary dark:text-gold">{p.name}</p>
                    </button>
                  ))}
                </div>
              </IslamicSection>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-gold font-bold hover:underline mb-6"
                >
                  ← العودة للقائمة
                </button>
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4">{prophets[selected].icon}</div>
                  <h2 className="font-serif text-4xl text-primary dark:text-gold">{prophets[selected].name}</h2>
                </div>
                <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-6 mb-6 border-r-4 border-gold">
                  <h3 className="font-bold text-primary dark:text-gold mb-3">📖 القصة:</h3>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">{prophets[selected].story}</p>
                </div>
                <div className="bg-gold/10 border-r-4 border-gold rounded-xl p-6">
                  <h3 className="font-bold text-primary dark:text-gold mb-3">💎 الدرس المستفاد:</h3>
                  <p className="text-gray-700 dark:text-gray-200 text-lg">{prophets[selected].lesson}</p>
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