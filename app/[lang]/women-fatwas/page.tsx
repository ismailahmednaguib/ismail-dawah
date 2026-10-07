"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

const fatwas = [
  {
    category: "الصلاة",
    q: "هل تصلي المرأة في المسجد؟",
    a: "نعم، يجوز للمرأة أن تصلي في المسجد، ولا يجوز منعها. قال ﷺ: «لا تَمْنَعُوا إماءَ اللهِ مساجدَ اللهِ». لكن صلاتها في بيتها أفضل لها.",
    icon: "🕌"
  },
  {
    category: "الصلاة",
    q: "هل يجوز للمرأة أن تؤم النساء؟",
    a: "نعم، يجوز للمرأة أن تؤم النساء في الصلاة، وتقف في وسطهن لا في المقدمة. وقد أمت عائشة رضي الله عنها النساء.",
    icon: "👩"
  },
  {
    category: "الحيض",
    q: "ماذا تفعل الحائض في رمضان؟",
    a: "الحائض تفطر في رمضان وتقضي الأيام التي أفطرتها بعد رمضان. ولا تصلي ولا تصوم ولا تقرأ القرآن من المصحف أثناء الحيض، لكن تذكر الله وتدعو.",
    icon: "🌙"
  },
  {
    category: "الحيض",
    q: "هل يجوز للحائض قراءة القرآن عن ظهر قلب؟",
    a: "اختلف العلماء، والراجح جواز القراءة عن ظهر قلب (بدون مس المصحف) للحاجة، كالمعلمة والطالبة. أما من غير حاجة فالأحوط الترك.",
    icon: "📖"
  },
  {
    category: "الحجاب",
    q: "ما هو الحجاب الشرعي؟",
    a: "الحجاب الشرعي أن يغطي جميع بدن المرأة، لا يكون شفافاً ولا ضيقاً، ولا يكون زينة في نفسه، ولا يشبه لباس الرجال ولا لباس الكافرات.",
    icon: "👗"
  },
  {
    category: "الحجاب",
    q: "هل الوجه والكفان عورة؟",
    a: "اختلف العلماء: فالجمهور على أنهما ليسا بعورة ويجوز كشفهما، وذهب بعض العلماء إلى وجوب تغطيتهما. الأحوط والأبرأ للذمة التغطية.",
    icon: "👤"
  },
  {
    category: "الزواج",
    q: "هل يجوز للمرأة أن تشترط العمل في عقد الزواج؟",
    a: "نعم، يجوز للمرأة أن تشترط في عقد الزواج أن تعمل، أو أن لا يمنعها الزوج من الدراسة، ونحو ذلك. والمسلمون على شروطهم.",
    icon: "💍"
  },
  {
    category: "الزواج",
    q: "هل يجوز للمرأة أن تطلب الطلاق؟",
    a: "نعم، يجوز لها أن تطلب الخلع إذا كرهت الزوج أو خافت أن لا تقيم حدود الله. والخلع فسخ بعوض، ولا يجوز لها طلب الطلاق من غير سبب شرعي.",
    icon: "⚖️"
  },
  {
    category: "العمل",
    q: "هل يجوز للمرأة أن تعمل؟",
    a: "نعم، يجوز للمرأة العمل بشروط: أن يكون العمل مشروعاً، لا اختلاط محرم، ولا خلوة، ولا سفر بلا محرم، ولا ترك لواجباتها. والأصل قرارها في البيت.",
    icon: "💼"
  },
  {
    category: "العمل",
    q: "هل يجوز للمرأة أن تسافر بلا محرم؟",
    a: "الراجح من أقوال العلماء أن السفر الذي يقصر فيه الصلاة لا يجوز بلا محرم. أما السفر القصير (داخل المدينة) فلا حرج فيه.",
    icon: "✈️"
  },
];

const categories = ["الكل", "الصلاة", "الحيض", "الحجاب", "الزواج", "العمل"];

export default function WomenFatwasPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [filter, setFilter] = useState("الكل");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = filter === "الكل" ? fatwas : fatwas.filter(f => f.category === filter);

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>👩 فتاوى المرأة المسلمة</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            إجابات على أهم الأسئلة الفقهية الخاصة بالمرأة
          </p>

          {/* الفلاتر */}
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                  filter === c ? "bg-gold text-gray-900" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* الفتاوى */}
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const originalIndex = fatwas.indexOf(f);
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                  <button
                    onClick={() => setOpen(open === originalIndex ? null : originalIndex)}
                    className="w-full p-5 text-right flex items-center gap-3 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                  >
                    <span className="text-3xl">{f.icon}</span>
                    <div className="flex-1">
                      <span className="inline-block bg-primary text-gold text-xs px-2 py-0.5 rounded-full mb-1">{f.category}</span>
                      <p className="font-bold text-primary dark:text-gold">{f.q}</p>
                    </div>
                    <span className="text-gold text-2xl">{open === originalIndex ? "−" : "+"}</span>
                  </button>
                  {open === originalIndex && (
                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-5 mt-8">
            <p className="text-amber-900 dark:text-amber-100 text-sm leading-relaxed">
              ⚠️ هذه الفتاوى على المذهب السائد، وفي بعض المسائل خلاف بين العلماء. يُنصح بالرجوع لعالم ثقة في المسائل الخاصة.
            </p>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}