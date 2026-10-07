import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  const sortedSteps = [...c.learnSteps].sort((a, b) => a.order - b.order);

  const gradients = [
    "from-emerald-600 to-emerald-700",
    "from-blue-600 to-blue-700",
    "from-purple-600 to-purple-700",
    "from-amber-600 to-amber-700",
    "from-rose-600 to-rose-700",
    "from-indigo-600 to-indigo-700",
    "from-teal-600 to-teal-700",
    "from-pink-600 to-pink-700",
  ];

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🎓"
          title="مسار التعلم"
          subtitle="خطة مرتبة لطالب العلم من البداية إلى الاحتراف"
          hadith="مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ"
          gradient="from-indigo-600 via-indigo-700 to-indigo-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-10 border-r-4 border-gold">
              <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4">🌟 كيف تبدأ رحلة العلم؟</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                طلب العلم فريضة على كل مسلم، لكن يحتاج إلى منهج مرتب حتى لا يتيه الطالب في بحر العلوم.
                هذا المسار مصمم ليأخذك من البداية خطوة بخطوة، لتبني أساساً قوياً ثم تتعمق في التخصص.
              </p>
              <div className="bg-gold/10 border-r-4 border-gold rounded-lg p-4">
                <p className="font-serif text-lg text-primary dark:text-gold">
                  «تَعَلَّمُوا الْعِلْمَ وَتَعَلَّمُوا لِلْعِلْمِ السَّكِينَةَ وَالْوَقَارَ»
                </p>
              </div>
            </div>

            {/* الخطوات */}
            <IslamicSection title="خطوات المسار" icon="📚" subtitle={`${sortedSteps.length} مراحل مرتبة`}>
              <div className="space-y-6">
                {sortedSteps.map((step, i) => {
                  const gradient = gradients[i % gradients.length];
                  const field = c.fields.find(f => f.slug === step.field);
                  
                  return (
                    <Link
                      key={step.id}
                      href={`/${lang}/fields/${step.field}`}
                      className={`group relative bg-gradient-to-br ${gradient} text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 block overflow-hidden`}
                    >
                      {/* زخرفة */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      
                      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* رقم الخطوة */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl grid place-items-center">
                            <span className="font-serif text-4xl font-bold">{step.order}</span>
                          </div>
                        </div>

                        {/* المحتوى */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-3xl">{field?.icon || "📚"}</span>
                            <h3 className="font-serif text-2xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-white/90 text-lg leading-relaxed mb-3">
                            {step.desc}
                          </p>
                          {field && (
                            <span className="inline-block bg-white/20 backdrop-blur text-white text-sm px-3 py-1 rounded-full font-bold">
                              {field.icon} {field.name}
                            </span>
                          )}
                        </div>

                        {/* سهم */}
                        <div className="flex-shrink-0">
                          <span className="text-4xl group-hover:translate-x-2 transition-transform">←</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </IslamicSection>

            {/* نصائح */}
            <IslamicSection title="نصائح لطالب العلم" icon="💡">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-r-4 border-gold">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">🎯 الإخلاص</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    اجعل طلبك للعلم لله وحده، لا للرياء ولا للسمعة. فالعلم عبادة، والعبادة لا تُقبل إلا بإخلاص.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-r-4 border-emerald-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">⏳ التدرج</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    لا تستعجل، ابدأ بالأساسيات ثم تدرج. من أراد العلم جملة فاتته جملة.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-r-4 border-blue-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">📝 التقييد</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    اكتب ما تتعلمه، فالعلم صيد والكتابة قيده. قيّد العلم بالحفظ والكتابة.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-r-4 border-purple-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">🤲 العمل</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    العلم بلا عمل كالشجرة بلا ثمر. اعمل بما تعلمت قبل أن تتعلم المزيد.
                  </p>
                </div>
              </div>
            </IslamicSection>

            {/* آية ختامية */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <p className="font-serif text-2xl md:text-3xl text-gold leading-relaxed mb-3">
                ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾
              </p>
              <p className="text-white/70">سورة طه - الآية 114</p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}