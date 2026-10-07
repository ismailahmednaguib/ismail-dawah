"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const doubts = [
  { q: "من خلق الله؟", a: "سؤال فاسد في أصله. الله هو الخالق الذي لم يُخلق، وهو الأول الذي ليس قبله شيء. لو قلنا إن الله له خالق، لاحتاج خالقه إلى خالق، وهكذا إلى ما لا نهاية، وهو مستحيل. فلا بد من خالق أول غير مخلوق.", icon: "🤔" },
  { q: "لماذا يوجد الشر في العالم؟", a: "الشر نسبي وليس مطلقاً. والله خلق الخير والشر لحكمة: الابتلاء والاختبار. بدون الشر لن يُعرف الخير، وبدون المرض لن تُعرف نعمة الصحة. والله حكيم لا يخلق شيئاً عبثاً.", icon: "⚖️" },
  { q: "إذا كان الله رحيماً، فلماذا يعذب الناس؟", a: "رحمة الله وسعت كل شيء، لكن رحمته لا تنافي عدله. من رفض الله وعصاه واستكبر، فمن عدل الله أن يجازيه. والله لا يعذب إلا بعد إقامة الحجة وإرسال الرسل.", icon: "❤️" },
  { q: "العلم يفسر كل شيء، فلا حاجة للدين", a: "العلم يفسر 'كيف' تعمل الأشياء، لكنه لا يجيب على 'لماذا' وجدت. العلم يخبرك أن الكون بدأ من الانفجار العظيم، لكن من الذي أوجده؟ ولماذا؟", icon: "🔬" },
  { q: "التطور يثبت أن الإنسان جاء من القرد", a: "نظرية التطور مجرد فرضية علمية لم تُثبت بشكل قاطع. وحتى لو صحّت في بعض الكائنات، فالإنسان له قصة خاصة في القرآن: خلقه الله بيده ونفخ فيه من روحه.", icon: "🧬" },
  { q: "لماذا الله لا يظهر لنا؟", a: "لو ظهر الله لنا لسقط الاختبار، وآمن كل الناس اضطراراً لا اختياراً. الحياة دار ابتلاء، والإيمان بالغيب هو المحك. والله أظهر آياته في الكون والقرآن والفطرة.", icon: "👁️" },
  { q: "الأديان كلها صنع البشر", a: "لو كانت الأديان من صنع البشر لكانت متناقضة. لكن رسالة التوحيد واحدة في كل الأديان السماوية. والقرآن تحدى البشر أن يأتوا بمثله فعجزوا.", icon: "🌍" },
  { q: "كيف نثبت وجود الله؟", a: "بالفطرة والعقل معاً. كل محدوث لا بد له من محدث، والكون حادث فلا بد له من خالق. وهذا برهان عقلي قطعي.", icon: "💡" },
];

export default function AtheismResponsePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="⚔️"
          title="الرد على الإلحاد"
          subtitle="ردود علمية وعقلية على شبهات الملحدين"
          verse="وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا"
          verseSource="سورة الإسراء - الآية 85"
          gradient="from-red-600 via-red-700 to-red-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            <IslamicSection title="الشبهات والرد عليها" icon="💭" subtitle="اضغط على أي شبهة لقراءة الرد">
              <div className="space-y-4">
                {doubts.map((d, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full p-6 text-right flex items-center gap-4 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                    >
                      <span className="text-4xl">{d.icon}</span>
                      <span className="font-bold text-primary dark:text-gold flex-1 text-lg">{d.q}</span>
                      <span className="text-gold text-3xl">{open === i ? "−" : "+"}</span>
                    </button>
                    {open === i && (
                      <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          {d.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 mt-10 text-center">
              <h3 className="font-serif text-2xl text-gold mb-4">💎 نصيحة مهمة</h3>
              <p className="leading-relaxed text-lg max-w-3xl mx-auto">
                الإيمان فطرة في كل إنسان، والشبهات كالسحاب لا تلبث أن تنقشع. من طلب الحق بصدق وجده. ولا تجادلهم إلا بالتي هي أحسن.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}