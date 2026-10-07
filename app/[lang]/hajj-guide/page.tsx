"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const steps = [
  { day: "اليوم 1", title: "يوم التروية (8 ذو الحجة)", place: "منى", icon: "🏕️",
    actions: ["الإحرام من الميقات", "التوجه إلى منى", "صلاة الظهر والعصر والمغرب والعشاء والفجر قصراً", "المبيت في منى"] },
  { day: "اليوم 2", title: "يوم عرفة (9 ذو الحجة)", place: "عرفات", icon: "⛰️",
    actions: ["التوجه إلى عرفة بعد الشروق", "الجمع بين الظهر والعصر قصراً", "الوقوف بعرفة والدعاء حتى الغروب", "أهم ركن في الحج: «الحج عرفة»"] },
  { day: "اليوم 2", title: "ليلة مزدلفة", place: "مزدلفة", icon: "🌙",
    actions: ["التوجه إلى مزدلفة بعد غروب الشمس", "الجمع بين المغرب والعشاء", "المبيت في مزدلفة", "جمع الحصى للرمي (7 حصيات)"] },
  { day: "اليوم 3", title: "يوم النحر (10 ذو الحجة)", place: "منى", icon: "🐑",
    actions: ["رمي جمرة العقبة بـ 7 حصيات", "الحلق أو التقصير (التحلل الأول)", "ذبح الهدي", "طواف الإفاضة والسعي"] },
  { day: "الأيام 4-6", title: "أيام التشريق (11-13 ذو الحجة)", place: "منى", icon: "🕌",
    actions: ["المبيت في منى", "رمي الجمرات الثلاث كل يوم بعد الزوال", "الدعاء والذكر", "المبيت في منى"] },
  { day: "اليوم الأخير", title: "طواف الوداع", place: "المسجد الحرام", icon: "🕋",
    actions: ["طواف الوداع 7 أشواط", "صلاة ركعتي الطواف", "شرب ماء زمزم", "الدعاء بالقبول والعودة"] },
];

const rules = [
  "الإحرام من الميقات",
  "الوقوف بعرفة",
  "طواف الإفاضة",
  "السعي بين الصفا والمروة",
  "الحلق أو التقصير",
  "المبيت بمزدلفة",
  "رمي الجمرات",
  "طواف الوداع"
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🕋 دليل الحج والعمرة</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            «مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ»
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            خطوة بخطوة لأداء مناسك الحج
          </p>

          <div className="bg-primary text-white rounded-2xl p-6 mb-8">
            <h3 className="font-serif text-xl text-gold mb-3">📋 أركان الحج:</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-6 text-center">🗺️ مراحل الحج</h2>

          {/* مؤشر التقدم */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-10 h-10 rounded-full font-bold transition ${
                  currentStep === i
                    ? "bg-gold text-gray-900 scale-110"
                    : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-cream-dark"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* الخطوة الحالية */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md mb-6 border-t-4 border-gold">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{steps[currentStep].icon}</div>
              <p className="text-sm text-gold font-bold mb-1">{steps[currentStep].day}</p>
              <h3 className="font-serif text-2xl text-primary dark:text-gold mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-500">📍 {steps[currentStep].place}</p>
            </div>

            <div className="border-t-2 border-gold/30 pt-4">
              <h4 className="font-bold text-primary dark:text-gold mb-3">📝 الأعمال:</h4>
              <ul className="space-y-2">
                {steps[currentStep].actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold font-bold mt-0.5">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                ← السابق
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="bg-gold text-gray-900 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                التالي →
              </button>
            </div>
          </div>

          <div className="bg-gold/10 border-2 border-gold rounded-2xl p-6 text-center">
            <p className="font-serif text-xl text-primary dark:text-gold mb-2">
              «خُذُوا عَنِّي مَنَاسِكَكُمْ»
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              يُستحب تعلم المناسك من عالم ثقة قبل السفر، وسؤال المختصين أثناء الحج.
            </p>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}