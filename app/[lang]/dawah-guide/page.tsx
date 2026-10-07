import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const steps = [
  { icon: "🎯", title: "الإخلاص", desc: "اجعل دعوتك لله وحده، لا للرياء ولا للسمعة.", ayah: "قُلْ هَٰذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ", num: 1, gradient: "from-emerald-600 to-emerald-700" },
  { icon: "📚", title: "العلم", desc: "ادعُ على بصيرة. لا تتكلم فيما لا تعلم.", ayah: "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ", num: 2, gradient: "from-blue-600 to-blue-700" },
  { icon: "💝", title: "الرفق واللين", desc: "خاطب الناس بالحسنى والرفق.", ayah: "فَقُولَا لَهُ قَوْلًا لَّيِّنًا لَّعَلَّهُ يَتَذَكَّرُ أَوْ يَخْشَىٰ", num: 3, gradient: "from-pink-600 to-pink-700" },
  { icon: "🤝", title: "الحكمة", desc: "خاطب كل قوم بما يناسبهم.", ayah: "ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ", num: 4, gradient: "from-amber-600 to-amber-700" },
  { icon: "🌱", title: "التدرج", desc: "ابدأ بالأهم فالأهم: التوحيد، ثم الفرائض، ثم النوافل.", ayah: "فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ", num: 5, gradient: "from-green-600 to-green-700" },
  { icon: "👤", title: "القدوة الحسنة", desc: "كن قدوة قبل أن تكون داعية.", ayah: "لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ", num: 6, gradient: "from-indigo-600 to-indigo-700" },
  { icon: "⏳", title: "الصبر", desc: "الدعوة تحتاج صبراً طويلاً.", ayah: "فَاصْبِرْ كَمَا صَبَرَ أُولُو الْعَزْمِ مِنَ الرُّسُلِ", num: 7, gradient: "from-red-600 to-red-700" },
  { icon: "🤲", title: "الدعاء", desc: "ادعُ الله أن يهدي الناس على يدك.", ayah: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", num: 8, gradient: "from-purple-600 to-purple-700" },
];

export default async function DawahGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📢"
          title="دليل الدعاة إلى الله"
          subtitle="منهج عملي لكل من يريد أن يكون داعية إلى الله"
          hadith="مَنْ دَعَا إِلَى هُدًى كَانَ لَهُ مِنَ الْأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ"
          gradient="from-amber-600 via-amber-700 to-amber-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* فضل الدعوة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 mb-10 text-center shadow-lg">
              <p className="font-serif text-2xl text-gold mb-3">فضل الدعوة إلى الله</p>
              <p className="text-xl leading-relaxed max-w-3xl mx-auto">
                «مَنْ دَعَا إِلَى هُدًى كَانَ لَهُ مِنَ الْأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ، لَا يَنْقُصُ ذَلِكَ مِنْ أُجُورِهِمْ شَيْئًا»
              </p>
              <p className="text-sm text-gold-light mt-3">رواه مسلم</p>
            </div>

            <IslamicSection title="خطوات الدعوة الناجحة" icon="🎯" subtitle="8 خطوات أساسية لكل داعية">
              <div className="grid md:grid-cols-2 gap-6">
                {steps.map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition hover:-translate-y-1`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full grid place-items-center">
                          <span className="text-3xl">{s.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-white/30 w-7 h-7 rounded-full grid place-items-center font-bold text-sm">{s.num}</span>
                          <h3 className="font-bold text-xl">{s.title}</h3>
                        </div>
                        <p className="text-white/90 mb-3">{s.desc}</p>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                          <p className="font-serif text-sm">﴿{s.ayah}﴾</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* نصيحة ذهبية */}
            <div className="bg-gold/10 border-2 border-gold rounded-2xl p-8 mt-10 text-center">
              <h3 className="font-serif text-2xl text-primary dark:text-gold mb-4">🌟 نصيحة ذهبية</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">
                لا تحتقر أي عمل دعوي، ولو كان كلمة واحدة. ربما تكون سبباً في هداية إنسان، فيكتب الله لك أجره وأجر ذريته من بعده إلى يوم القيامة.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}