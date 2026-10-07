"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const prophets = [
  { name: "آدم عليه السلام", icon: "🌱", story: "أبو البشرية، خلقه الله بيده ونفخ فيه من روحه، وأسجد له الملائكة. أكل من الشجرة فتاب الله عليه. عاش في الأرض وزوجته حواء، وعلمه الله الأسماء كلها.", lesson: "التوبة باب مفتوح، والله يحب التوابين." },
  { name: "نوح عليه السلام", icon: "🚢", story: "أول رسول إلى أهل الأرض، دعا قومه 950 سنة فلم يؤمن إلا قليل. صنع السفينة بأمر الله، ونجّاه الله ومن معه من الطوفان الذي أغرق الكافرين.", lesson: "الصبر على الدعوة، وعدم اليأس من هداية الناس." },
  { name: "إبراهيم عليه السلام", icon: "🕋", story: "خليل الرحمن، حطّم الأصنام، وأُلقي في النار فكانت برداً وسلاماً. ابتُلي بذبح ابنه إسماعيل ففداه الله بذبح عظيم. بنى الكعبة مع ابنه.", lesson: "التوحيد الخالص، والتسليم لأمر الله." },
  { name: "موسى عليه السلام", icon: "📜", story: "كليم الله، نشأ في قصر فرعون، ثم هرب إلى مدين. كلّمه الله في الوادي المقدس، وأرسله إلى فرعون. أخرج بني إسرائيل من مصر، وأنزل الله عليه التوراة.", lesson: "الثقة بنصر الله، مهما كان العدو قوياً." },
  { name: "عيسى عليه السلام", icon: "✨", story: "ولد من أم بلا أب بمعجزة، تكلّم في المهد، وأحيا الموتى بإذن الله. أنزل الله عليه الإنجيل. رفعه الله إليه، وسينزل في آخر الزمان ليحكم بشريعة الإسلام.", lesson: "قدرة الله على كل شيء، وأن عيسى عبد الله ورسوله." },
  { name: "يوسف عليه السلام", icon: "👑", story: "أحسن القصص. حسده إخوته فألقوه في البئر، ثم بيع عبداً في مصر. راودته امرأة العزيز عن نفسه فعصم الله. سُجن ظلماً، ثم أصبح عزيز مصر.", lesson: "العفة والصبر والعاقبة للمتقين." },
  { name: "أيوب عليه السلام", icon: "🤲", story: "نبي صبور، ابتلاه الله في ماله وأهله وجسده سنين طويلة، فلم يزد على الصبر والدعاء. نادى ربه: «أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ» فشفاه الله.", lesson: "الصبر على البلاء، وعدم الشكوى إلا لله." },
  { name: "داود عليه السلام", icon: "🎵", story: "نبي وملك، أنزل الله عليه الزبور. قتل جالوت وهو شاب، وألان الله له الحديد يصنع منه الدروع. كان يصوم يوماً ويفطر يوماً، وهو أحب الصيام إلى الله.", lesson: "الجمع بين العبادة والعمل، وشكر النعمة." },
  { name: "سليمان عليه السلام", icon: "👑", story: "ابن داود، ملكه الله ملكاً لم ينبغ لأحد من بعده. سخر الله له الريح والجن والطير. كان يفهم لغة الحيوانات. قال: «رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ».", lesson: "الشكر على النعمة، واستخدامها في طاعة الله." },
  { name: "محمد ﷺ", icon: "🌙", story: "خاتم الأنبياء وسيد المرسلين، بُعث رحمة للعالمين. نزل عليه القرآن، وهاجر من مكة إلى المدينة، وفتح مكة، وحجّ حجة الوداع. توفي عن 63 سنة بعد أن بلّغ الرسالة.", lesson: "الأسوة الحسنة في كل شيء، والرحمة بالعالمين." },
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📖 قصص الأنبياء</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            «وَكُلًّا نَّقُصُّ عَلَيْكَ مِنْ أَنبَاءِ الرُّسُلِ مَا نُثَبِّتُ بِهِ فُؤَادَكَ»
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            دروس وعبر من حياة أنبياء الله ورسله
          </p>

          {selected === null ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {prophets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center hover:border-gold border-2 border-transparent hover:shadow-lg transition"
                >
                  <div className="text-4xl mb-2">{p.icon}</div>
                  <p className="font-bold text-primary dark:text-gold text-sm">{p.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gold font-bold hover:underline mb-4"
              >
                ← العودة للقائمة
              </button>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{prophets[selected].icon}</div>
                <h2 className="font-serif text-3xl text-primary dark:text-gold">{prophets[selected].name}</h2>
              </div>
              <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-5 mb-4">
                <h3 className="font-bold text-primary dark:text-gold mb-2">📖 القصة:</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{prophets[selected].story}</p>
              </div>
              <div className="bg-gold/10 border-r-4 border-gold rounded-xl p-4">
                <h3 className="font-bold text-primary dark:text-gold mb-2">💎 الدرس المستفاد:</h3>
                <p className="text-gray-700 dark:text-gray-200">{prophets[selected].lesson}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}