"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const doubts = [
  {
    q: "من خلق الله؟",
    a: "هذا سؤال فاسد في أصله. الله هو الخالق الذي لم يُخلق، وهو الأول الذي ليس قبله شيء. لو قلنا إن الله له خالق، لاحتاج خالقه إلى خالق، وهكذا إلى ما لا نهاية، وهو مستحيل. فلا بد من خالق أول غير مخلوق، وهو الله.",
    icon: "🤔"
  },
  {
    q: "لماذا يوجد الشر في العالم؟",
    a: "الشر نسبي وليس مطلقاً. والله خلق الخير والشر لحكمة: الابتلاء والاختبار. بدون الشر لن يُعرف الخير، وبدون المرض لن تُعرف نعمة الصحة. والله حكيم لا يخلق شيئاً عبثاً، والشر الجزئي قد يكون فيه خير كلي لا نراه.",
    icon: "⚖️"
  },
  {
    q: "إذا كان الله رحيماً، فلماذا يعذب الناس؟",
    a: "رحمة الله وسعت كل شيء، لكن رحمته لا تنافي عدله. من رفض الله وعصاه واستكبر، فمن عدل الله أن يجازيه. والله لا يعذب إلا بعد إقامة الحجة وإرسال الرسل. والعذاب الأخروي جزاء عادل لمن اختار الكفر بعد البيان.",
    icon: "❤️"
  },
  {
    q: "العلم يفسر كل شيء، فلا حاجة للدين",
    a: "العلم يفسر 'كيف' تعمل الأشياء، لكنه لا يجيب على 'لماذا' وجدت. العلم يخبرك أن الكون بدأ من الانفجار العظيم، لكن من الذي أوجده؟ ولماذا؟ هذه أسئلة فلسفية لا يجيب عليها العلم، بل الدين.",
    icon: "🔬"
  },
  {
    q: "لماذا أنزل الله كتباً مختلفة؟",
    a: "الرسالة واحدة: التوحيد. لكن الشرائع تختلف باختلاف الزمان والمكان. كل نبي جاء لقومه بشريعة تناسبهم. والقرآن هو الرسالة الخاتمة المناسبة لكل زمان ومكان.",
    icon: "📚"
  },
  {
    q: "التطور يثبت أن الإنسان جاء من القرد",
    a: "نظرية التطور مجرد فرضية علمية لم تُثبت بشكل قاطع، وكثير من العلماء يعترضون عليها. وحتى لو صحّت في بعض الكائنات، فالإنسان له قصة خاصة في القرآن: خلقه الله بيده ونفخ فيه من روحه.",
    icon: "🧬"
  },
  {
    q: "لماذا الله لا يظهر لنا؟",
    a: "لو ظهر الله لنا لسقط الاختبار، وآمن كل الناس اضطراراً لا اختياراً. الحياة دار ابتلاء، والإيمان بالغيب هو المحك. والله أظهر آياته في الكون والقرآن والفطرة، فمن طلبه بصدق وجده.",
    icon: "👁️"
  },
  {
    q: "الأديان كلها صنع البشر",
    a: "لو كانت الأديان من صنع البشر لكانت متناقضة ومتغيرة. لكن رسالة التوحيد واحدة في كل الأديان السماوية. والقرآن تحدى البشر أن يأتوا بمثله فعجزوا، فلو كان من عند غير الله لكان فيه اختلاف كثير.",
    icon: "🌍"
  },
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>⚔️ الرد على الإلحاد</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            ردود علمية وعقلية على شبهات الملحدين
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            «وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا»
          </p>

          <div className="space-y-3">
            {doubts.map((d, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full p-5 text-right flex items-center gap-3 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                >
                  <span className="text-3xl">{d.icon}</span>
                  <span className="font-bold text-primary dark:text-gold flex-1">{d.q}</span>
                  <span className="text-gold text-2xl">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {d.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-primary text-white rounded-2xl p-6 mt-10 text-center">
            <h3 className="font-serif text-2xl text-gold mb-3">💎 نصيحة مهمة</h3>
            <p className="leading-relaxed">
              الإيمان فطرة في كل إنسان، والشبهات كالسحاب لا تلبث أن تنقشع. من طلب الحق بصدق وجده. ولا تجادلهم إلا بالتي هي أحسن.
            </p>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}