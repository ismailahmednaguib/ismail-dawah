"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function ProjectsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setProjects(j.content?.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const gradients = [
    "from-emerald-600 to-emerald-700",
    "from-blue-600 to-blue-700",
    "from-purple-600 to-purple-700",
    "from-amber-600 to-amber-700",
    "from-rose-600 to-rose-700",
    "from-indigo-600 to-indigo-700",
  ];

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🤝"
          title="المشاريع الدعوية"
          subtitle="ساهم معنا في نشر العلم والخير"
          hadith="مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ"
          gradient="from-teal-600 via-teal-700 to-teal-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 mb-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <span className="text-6xl mb-4 block">🌟</span>
                <h2 className="font-serif text-3xl text-gold mb-4">
                  ساهم في صدقة جارية
                </h2>
                <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
                  كل مشروع من هذه المشاريع هو صدقة جارية، وكل مساهمة منك تُكتب في ميزان حسناتك
                  ما دام الناس ينتفعون بها.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : projects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-500">لا توجد مشاريع حالياً</p>
              </div>
            ) : (
              <IslamicSection title={`${projects.length} مشروع`} icon="🎯" subtitle="اختر المشروع الذي تريد المساهمة فيه">
                <div className="grid md:grid-cols-2 gap-6">
                  {projects.map((p, i) => {
                    const gradient = gradients[i % gradients.length];
                    return (
                      <div
                        key={p.id}
                        className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition hover:-translate-y-1 relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative">
                          <div className="inline-block bg-white/20 backdrop-blur rounded-full p-3 mb-4">
                            <span className="text-4xl">🤝</span>
                          </div>
                          <h3 className="font-bold text-2xl mb-3">{p.title}</h3>
                          <p className="text-white/90 leading-relaxed mb-4">{p.desc}</p>
                          
                          <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
                            <p className="text-sm text-white/80 mb-1">الهدف:</p>
                            <p className="font-serif text-2xl font-bold text-gold">{p.goal}</p>
                          </div>

                          <div className="flex gap-3">
                            <a
                              href={`/${lang}/contact`}
                              className="flex-1 bg-white text-gray-900 py-3 rounded-lg font-bold text-center hover:bg-white/90 transition"
                            >
                              💬 ساهم الآن
                            </a>
                            <a
                              href={`/${lang}/contact`}
                              className="px-5 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-lg font-bold hover:bg-white/30 transition"
                            >
                              📞 تواصل
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </IslamicSection>
            )}

            {/* لماذا تساهم */}
            <IslamicSection title="لماذا تساهم معنا؟" icon="💎">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition text-center border-t-4 border-gold">
                  <span className="text-5xl mb-3 block">🌟</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">صدقة جارية</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    أجر مستمر ما دام الناس ينتفعون بالمشروع
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition text-center border-t-4 border-emerald-500">
                  <span className="text-5xl mb-3 block">📚</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">نشر العلم</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    ساهم في نشر العلم الشرعي الصحيح
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition text-center border-t-4 border-blue-500">
                  <span className="text-5xl mb-3 block">🤲</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">شفافية كاملة</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    تقارير دورية عن كل مشروع ومصاريفه
                  </p>
                </div>
              </div>
            </IslamicSection>

            {/* آية */}
            <div className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-3xl p-8 md:p-12 text-center mt-10">
              <p className="font-serif text-2xl md:text-3xl text-primary dark:text-gold leading-relaxed mb-3">
                ﴿مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً﴾
              </p>
              <p className="text-gray-600 dark:text-gray-400">سورة البقرة - الآية 245</p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}