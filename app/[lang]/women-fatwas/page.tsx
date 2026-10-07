"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

const fatwas = [
  {
    category: "الصلاة",
    q: "هل تصلي المرأة في المسجد؟",
    a: "نعم، يجوز للمرأة أن تصلي في المسجد، ولا يجوز منعها. قال ﷺ: «لا تَمْنَعُوا إماءَ اللهِ مساجدَ اللهِ». لكن صلاتها في بيتها أفضل لها، وهذا من رحمة الإسلام بها وتيسيره عليها.",
    icon: "🕌",
    verse: "وَأَنْ أَقِيمُوا الصَّلَاةَ"
  },
  {
    category: "الصلاة",
    q: "هل يجوز للمرأة أن تؤم النساء؟",
    a: "نعم، يجوز للمرأة أن تؤم النساء في الصلاة، وتقف في وسطهن لا في المقدمة. وقد أمت عائشة رضي الله عنها النساء. وهذا خاص بالنساء فقط.",
    icon: "👩",
  },
  {
    category: "الحيض",
    q: "ماذا تفعل الحائض في رمضان؟",
    a: "الحائض تفطر في رمضان وتقضي الأيام التي أفطرتها بعد رمضان. ولا تصلي ولا تصوم ولا تقرأ القرآن من المصحف أثناء الحيض، لكن تذكر الله وتدعو وتستمع للقرآن.",
    icon: "🌙",
  },
  {
    category: "الحيض",
    q: "هل يجوز للحائض قراءة القرآن عن ظهر قلب؟",
    a: "اختلف العلماء، والراجح جواز القراءة عن ظهر قلب (بدون مس المصحف) للحاجة، كالمعلمة والطالبة. أما من غير حاجة فالأحوط الترك.",
    icon: "📖",
  },
  {
    category: "الحجاب",
    q: "ما هو الحجاب الشرعي؟",
    a: "الحجاب الشرعي أن يغطي جميع بدن المرأة، لا يكون شفافاً ولا ضيقاً، ولا يكون زينة في نفسه، ولا يشبه لباس الرجال ولا لباس الكافرات. وهو فريضة على كل مسلمة بالغة.",
    icon: "👗",
    verse: "يَا أَيُّهَا النَّبِيُّ قُل لِّأَزْوَاجِكَ وَبَنَاتِكَ وَنِسَاءِ الْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَابِيبِهِنَّ"
  },
  {
    category: "الحجاب",
    q: "هل الوجه والكفان عورة؟",
    a: "اختلف العلماء: فالجمهور على أنهما ليسا بعورة ويجوز كشفهما، وذهب بعض العلماء إلى وجوب تغطيتهما. الأحوط والأبرأ للذمة التغطية خاصة في زمن الفتنة.",
    icon: "👤",
  },
  {
    category: "الزواج",
    q: "هل يجوز للمرأة أن تشترط العمل في عقد الزواج؟",
    a: "نعم، يجوز للمرأة أن تشترط في عقد الزواج أن تعمل، أو أن لا يمنعها الزوج من الدراسة، ونحو ذلك. والمسلمون على شروطهم ما لم يحلوا حراماً أو يحرموا حلالاً.",
    icon: "💍",
  },
  {
    category: "الزواج",
    q: "هل يجوز للمرأة أن تطلب الطلاق؟",
    a: "نعم، يجوز لها أن تطلب الخلع إذا كرهت الزوج أو خافت أن لا تقيم حدود الله. والخلع فسخ بعوض، ولا يجوز لها طلب الطلاق من غير سبب شرعي.",
    icon: "⚖️",
    hadith: "أَيُّمَا امْرَأَةٍ سَأَلَتْ زَوْجَهَا طَلَاقًا فِي غَيْرِ مَا بَأْسٍ فَحَرَامٌ عَلَيْهَا رَائِحَةُ الْجَنَّةِ"
  },
  {
    category: "العمل",
    q: "هل يجوز للمرأة أن تعمل؟",
    a: "نعم، يجوز للمرأة العمل بشروط: أن يكون العمل مشروعاً، لا اختلاط محرم، ولا خلوة، ولا سفر بلا محرم، ولا ترك لواجباتها. والأصل قرارها في البيت.",
    icon: "💼",
    verse: "وَقَرْنَ فِي بُيُوتِكُنَّ"
  },
  {
    category: "العمل",
    q: "هل يجوز للمرأة أن تسافر بلا محرم؟",
    a: "الراجح من أقوال العلماء أن السفر الذي يقصر فيه الصلاة لا يجوز بلا محرم. أما السفر القصير (داخل المدينة) فلا حرج فيه. وهذا حفظ للمرأة وصون لها.",
    icon: "✈️",
  },
];

export default function WomenFatwasPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const categories = ["all", ...Array.from(new Set(fatwas.map(f => f.category)))];
  
  const filtered = fatwas.filter(f => {
    const matchesCategory = filter === "all" || f.category === filter;
    const matchesSearch = !search || 
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryColors: Record<string, string> = {
    "الصلاة": "from-blue-600 to-blue-700",
    "الحيض": "from-rose-600 to-rose-700",
    "الحجاب": "from-purple-600 to-purple-700",
    "الزواج": "from-pink-600 to-pink-700",
    "العمل": "from-emerald-600 to-emerald-700",
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="👩"
          title="فتاوى المرأة المسلمة"
          subtitle="إجابات على أهم الأسئلة الفقهية الخاصة بالمرأة"
          verse="وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ"
          verseSource="سورة التوبة - الآية 71"
          gradient="from-pink-600 via-pink-700 to-pink-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-3xl p-8 mb-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <span className="text-6xl mb-4 block">🌸</span>
                <h2 className="font-serif text-2xl text-gold mb-3">أختاه المسلمة</h2>
                <p className="text-white/90 max-w-2xl mx-auto">
                  هذه مجموعة من الفتاوى المهمة التي تهم كل امرأة مسلمة في عبادتها وحياتها اليومية.
                  اختاري القسم الذي يهمك وابحثي عن إجابتك.
                </p>
              </div>
            </div>

            {/* البحث */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 ابحثي في الفتاوى..."
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-3 focus:border-gold focus:outline-none"
              />
            </div>

            {/* الفلاتر */}
            <div className="flex gap-2 mb-8 flex-wrap">
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
                  {c === "all" ? "🌸 الكل" : c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-gray-500">لا توجد نتائج للبحث</p>
              </div>
            ) : (
              <IslamicSection title={`${filtered.length} فتوى`} icon="📜" subtitle="اضغطي على أي فتوى لقراءة الإجابة">
                <div className="space-y-4">
                  {filtered.map((f, i) => {
                    const originalIndex = fatwas.indexOf(f);
                    const gradient = categoryColors[f.category] || "from-gray-600 to-gray-700";
                    return (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
                        <button
                          onClick={() => setOpen(open === originalIndex ? null : originalIndex)}
                          className="w-full p-6 text-right flex items-start gap-4 hover:bg-cream-dark dark:hover:bg-gray-700 transition"
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-full grid place-items-center text-2xl flex-shrink-0`}>
                            {f.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`bg-gradient-to-br ${gradient} text-white text-xs px-2 py-1 rounded-full font-bold`}>
                                {f.category}
                              </span>
                            </div>
                            <p className="font-bold text-primary dark:text-gold text-lg mb-1">{f.q}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{f.a}</p>
                          </div>
                          <span className="text-gold text-2xl flex-shrink-0">
                            {open === originalIndex ? "−" : "+"}
                          </span>
                        </button>
                        {open === originalIndex && (
                          <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
                            <div className="bg-pink-50 dark:bg-pink-900/20 border-r-4 border-pink-500 rounded-lg p-4 mb-3">
                              <p className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-2">💡 الإجابة:</p>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {f.a}
                              </p>
                            </div>
                            {f.verse && (
                              <div className="bg-gold/10 border-r-4 border-gold rounded-lg p-3 mb-2">
                                <p className="font-serif text-primary dark:text-gold">﴿{f.verse}﴾</p>
                              </div>
                            )}
                            {f.hadith && (
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-r-4 border-emerald-500 rounded-lg p-3">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">«{f.hadith}»</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </IslamicSection>
            )}

            {/* تنبيه */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-6 mt-8">
              <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                ⚠️ <strong>تنبيه:</strong> هذه الفتاوى على المذهب السائد، وفي بعض المسائل خلاف بين العلماء. يُنصح بالرجوع لعالم ثقة في المسائل الخاصة.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}