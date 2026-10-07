"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function QuranMemorizationPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [juz, setJuz] = useState(30);
  const [days, setDays] = useState(30);

  const plans = [
    { name: "خطة البركة (سنة كاملة)", duration: "12 شهر", daily: "صفحة واحدة", level: "مبتدئ", icon: "🌱", gradient: "from-emerald-600 to-emerald-700", desc: "مناسبة لمن يريد الحفظ مع العمل والثبات" },
    { name: "خنة السنة", duration: "12 شهر", daily: "صفحة واحدة", level: "متوسط", icon: "⚡", gradient: "from-blue-600 to-blue-700", desc: "الخطة الأكثر شعبية — متوازنة وعملية" },
    { name: "خطة العزيمة (6 أشهر)", duration: "6 أشهر", daily: "صفحتين", level: "متقدم", icon: "🔥", gradient: "from-red-600 to-red-700", desc: "لمن لديه وقت وعزيمة قوية" },
    { name: "خطة التحدي (3 أشهر)", duration: "3 أشهر", daily: "4 صفحات", level: "محترف", icon: "💪", gradient: "from-purple-600 to-purple-700", desc: "لطلاب العلم والمتفرغين للحفظ" },
    { name: "خطة جزء عم", duration: "شهران", daily: "وجه واحد", level: "مبتدئ", icon: "🌟", gradient: "from-amber-600 to-amber-700", desc: "ابدأ بجزء عم ثم أكمل" },
  ];

  const steps = [
    { num: 1, icon: "🎯", title: "النية والإخلاص", desc: "اجعل حفظك للقرآن لله وحده، لا للرياء ولا للسمعة." },
    { num: 2, icon: "⏰", title: "اختر الوقت المناسب", desc: "أفضل وقت للحفظ بعد الفجر أو قبل النوم، حيث يكون الذهن صافياً." },
    { num: 3, icon: "🏛️", title: "اختر المكان الهادئ", desc: "مكان بعيد عن الضوضاء والتشتت. المسجد أفضل مكان." },
    { num: 4, icon: "🎧", title: "استمع أولاً", desc: "استمع للآيات من قارئ متقن (كالحصري أو المنشاوي) لتصحح النطق." },
    { num: 5, icon: "📖", title: "افهم المعنى", desc: "اقرأ التفسير الميسر قبل الحفظ، الفهم يثبت الحفظ." },
    { num: 6, icon: "🔄", title: "كرر كثيراً", desc: "كرر الآية 20 مرة على الأقل. التكرار سر الحفظ." },
    { num: 7, icon: "🔗", title: "اربط الآيات", desc: "اربط الآية ببعدها، واحفظ الصفحة كاملة قبل الانتقال." },
    { num: 8, icon: "📚", title: "المراجعة الدائمة", desc: "راجع ما حفظته يومياً. بدون المراجعة يذهب الحفظ." },
  ];

  const tips = [
    { icon: "📅", title: "ورد يومي ثابت", desc: "احفظ صفحة واحدة يومياً = ختم الحفظ في سنة" },
    { icon: "🕌", title: "صلِ بما تحفظ", desc: "اقرأ ما حفظته في السنن الرواتب والقيام" },
    { icon: "👥", title: "ابحث عن رفيق", desc: "صاحب يحفظ معك ويسمع لك ويحفزك" },
    { icon: "📝", title: "سجّل تقدمك", desc: "اكتب ما تحفظه كل يوم لترى إنجازك" },
    { icon: "🤲", title: "أكثر من الدعاء", desc: "اللهم يسر لي حفظ كتابك" },
    { icon: "🚫", title: "ابتعد عن المعاصي", desc: "المعاصي تمحو الحفظ وتمحق البركة" },
  ];

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📚"
          title="كيف تحفظ القرآن"
          subtitle="منهج عملي لحفظ القرآن الكريم وإتقانه"
          verse="وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
          verseSource="سورة القمر - الآية 17"
          gradient="from-green-600 via-green-700 to-green-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* فضل الحفظ */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 mb-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <span className="text-6xl mb-4 block">🌟</span>
                <h2 className="font-serif text-2xl text-gold mb-4">فضل حفظ القرآن</h2>
                <p className="font-serif text-xl leading-relaxed max-w-3xl mx-auto mb-2">
                  «يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا»
                </p>
                <p className="text-sm text-gold-light">رواه الترمذي</p>
              </div>
            </div>

            {/* خطوات الحفظ */}
            <IslamicSection title="خطوات الحفظ الناجح" icon="🎯" subtitle="8 خطوات مجربة للحفظ الثابت">
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map((s) => (
                  <div key={s.num} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition border-r-4 border-gold">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gold text-gray-900 rounded-full grid place-items-center">
                          <span className="text-2xl">{s.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full font-bold">
                            خطوة {s.num}
                          </span>
                          <h3 className="font-bold text-primary dark:text-gold">{s.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* خطط الحفظ */}
            <IslamicSection title="اختر خطة الحفظ" icon="📅" subtitle="5 خطط تناسب مستويات مختلفة">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPlan(i)}
                    className={`bg-gradient-to-br ${p.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer relative overflow-hidden ${selectedPlan === i ? "ring-4 ring-gold" : ""}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{p.icon}</span>
                        <span className="bg-white/20 backdrop-blur text-xs px-2 py-1 rounded-full font-bold">
                          {p.level}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-2">{p.name}</h3>
                      <p className="text-white/90 text-sm mb-4">{p.desc}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                          <p className="text-xs text-white/80">المدة</p>
                          <p className="font-bold">{p.duration}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                          <p className="text-xs text-white/80">اليومي</p>
                          <p className="font-bold">{p.daily}</p>
                        </div>
                      </div>
                      <div className="text-center pt-3 border-t border-white/20">
                        <span className="text-sm font-bold">
                          {selectedPlan === i ? "✓ الخطة المختارة" : "اختر هذه الخطة"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* نصائح ذهبية */}
            <IslamicSection title="نصائح ذهبية" icon="💎" subtitle="6 نصائح من تجربة الحفاظ">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tips.map((t, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition text-center">
                    <span className="text-5xl mb-3 block">{t.icon}</span>
                    <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">{t.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* تحذير */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-2xl p-6 mt-10">
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 text-lg">⚠️ تنبيه مهم:</h3>
              <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                الحفظ بلا فهم ولا عمل كشجرة بلا ثمر. اقرأ تفسير ما تحفظ، واعمل بما تعلمت، واجعل القرآن منهج حياة لا مجرد كلمات تردد.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}