"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const steps = [
  { day: "اليوم 1", title: "يوم التروية", place: "منى", icon: "🏕️", actions: ["الإحرام من الميقات", "التوجه إلى منى", "المبيت في منى"] },
  { day: "اليوم 2", title: "يوم عرفة", place: "عرفات", icon: "⛰️", actions: ["التوجه إلى عرفة", "الجمع بين الظهر والعصر", "الوقوف بعرفة والدعاء"] },
  { day: "اليوم 2", title: "ليلة مزدلفة", place: "مزدلفة", icon: "🌙", actions: ["التوجه إلى مزدلفة", "الجمع بين المغرب والعشاء", "المبيت وجمع الحصى"] },
  { day: "اليوم 3", title: "يوم النحر", place: "منى", icon: "🐑", actions: ["رمي جمرة العقبة", "الحلق أو التقصير", "ذبح الهدي", "طواف الإفاضة"] },
  { day: "الأيام 4-6", title: "أيام التشريق", place: "منى", icon: "🕌", actions: ["المبيت في منى", "رمي الجمرات الثلاث", "الدعاء والذكر"] },
  { day: "اليوم الأخير", title: "طواف الوداع", place: "المسجد الحرام", icon: "🕋", actions: ["طواف الوداع 7 أشواط", "شرب ماء زمزم", "الدعاء بالقبول"] },
];

export default function HajjGuidePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🕋"
          title="دليل الحج والعمرة"
          subtitle="خطوة بخطوة لأداء مناسك الحج"
          hadith="مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ"
          gradient="from-stone-600 via-stone-700 to-stone-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            {/* مؤشر التقدم */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-12 h-12 rounded-full font-bold transition ${
                    currentStep === i
                      ? "bg-gold text-gray-900 scale-110 shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-cream-dark"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* الخطوة الحالية */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-t-4 border-gold">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{steps[currentStep].icon}</div>
                <p className="text-sm text-gold font-bold mb-1">{steps[currentStep].day}</p>
                <h3 className="font-serif text-3xl text-primary dark:text-gold mb-2">{steps[currentStep].title}</h3>
                <p className="text-gray-500">📍 {steps[currentStep].place}</p>
              </div>

              <div className="border-t-2 border-gold/30 pt-6">
                <h4 className="font-bold text-primary dark:text-gold mb-4">📝 الأعمال:</h4>
                <ul className="space-y-3">
                  {steps[currentStep].actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gold/20 text-gold rounded-full grid place-items-center font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 pt-1">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="bg-gray-200 dark:bg-gray-700 px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  ← السابق
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  التالي →
                </button>
              </div>
            </div>

            {/* نصيحة */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-6 mt-8">
              <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                ⚠️ <strong>تنبيه:</strong> يُستحب تعلم المناسك من عالم ثقة قبل السفر، وسؤال المختصين أثناء الحج.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}