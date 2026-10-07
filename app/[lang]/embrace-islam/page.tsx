import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const steps = [
  {
    num: 1,
    title: "الشهادتان",
    desc: "أن تشهد أن لا إله إلا الله وأن محمداً رسول الله",
    text: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ",
    icon: "🕌",
    gradient: "from-emerald-600 to-emerald-700",
  },
  {
    num: 2,
    title: "الإيمان بالله",
    desc: "أن تؤمن بالله وحده لا شريك له، الخالق الرازق المدبر",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    icon: "✨",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    num: 3,
    title: "الإيمان بالملائكة",
    desc: "أن تؤمن بوجود الملائكة وأنهم عباد مكرمون",
    text: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ",
    icon: "👼",
    gradient: "from-purple-600 to-purple-700",
  },
  {
    num: 4,
    title: "الإيمان بالكتب",
    desc: "أن تؤمن بكل الكتب السماوية وأن القرآن هو الخاتم",
    text: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
    icon: "📖",
    gradient: "from-green-600 to-green-700",
  },
  {
    num: 5,
    title: "الإيمان بالرسل",
    desc: "أن تؤمن بكل الأنبياء من آدم إلى محمد ﷺ",
    text: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    icon: "🌟",
    gradient: "from-amber-600 to-amber-700",
  },
  {
    num: 6,
    title: "الإيمان باليوم الآخر",
    desc: "أن تؤمن بيوم القيامة والحساب والجنة والنار",
    text: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ",
    icon: "⚖️",
    gradient: "from-red-600 to-red-700",
  },
];

export default async function EmbraceIslamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🌟"
          title="اعتنق الإسلام"
          subtitle="رحلتك نحو الهداية والنور تبدأ من هنا"
          verse="أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ وَلَهُ أَسْلَمَ مَن فِي السَّمَاوَاتِ وَالْأَرْضِ"
          verseSource="سورة آل عمران - الآية 83"
          gradient="from-rose-600 via-rose-700 to-rose-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* رسالة ترحيب */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 mb-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <span className="text-6xl mb-4 block">🤲</span>
                <h2 className="font-serif text-3xl md:text-4xl text-gold mb-4">
                  مرحباً بك في رحلتك نحو الهداية
                </h2>
                <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
                  الإسلام ليس مجرد دين، بل هو منهج حياة كامل يهديك إلى الحق والسعادة في الدنيا والآخرة.
                  الله سبحانه يحب التوابين ويفرح بتوبة عبده فرحاً شديداً.
                </p>
              </div>
            </div>

            {/* ما هو الإسلام */}
            <IslamicSection title="ما هو الإسلام؟" icon="🕌" subtitle="معنى الإسلام وأركانه">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
                  <strong className="text-primary dark:text-gold">الإسلام</strong> يعني الاستسلام لله تعالى بالتوحيد، والانقياد له بالطاعة، والبراءة من الشرك وأهله.
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
                  وهو الدين الذي ارتضاه الله للبشرية جمعاء، وختم به الأديان، وأرسل به نبيه محمداً ﷺ رحمة للعالمين.
                </p>
                <div className="bg-gold/10 border-r-4 border-gold rounded-lg p-4 mt-6">
                  <p className="font-serif text-xl text-primary dark:text-gold">
                    ﴿إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ﴾
                  </p>
                  <p className="text-sm text-gray-500 mt-1">سورة آل عمران - الآية 19</p>
                </div>
              </div>
            </IslamicSection>

            {/* كيف تدخل الإسلام */}
            <IslamicSection title="كيف تدخل الإسلام؟" icon="✨" subtitle="خطوة واحدة فقط: نطق الشهادتين">
              <div className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-3xl p-8 md:p-12 text-center">
                <span className="text-6xl mb-4 block">🕌</span>
                <h3 className="font-serif text-2xl text-primary dark:text-gold mb-6">
                  انطق الشهادتين بقلب صادق
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
                  <p className="font-serif text-3xl text-primary dark:text-gold leading-loose mb-4">
                    أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ
                  </p>
                  <p className="font-serif text-3xl text-primary dark:text-gold leading-loose">
                    وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ
                  </p>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  بمجرد نطقك لهاتين الشهادتين بقلب صادق ويقين، تصبح مسلماً وتُغفر لك كل ذنوبك السابقة.
                </p>
              </div>
            </IslamicSection>

            {/* أركان الإيمان */}
            <IslamicSection title="أركان الإيمان الستة" icon="🌟" subtitle="ما يجب أن تؤمن به">
              <div className="grid md:grid-cols-2 gap-5">
                {steps.map((s) => (
                  <div key={s.num} className={`bg-gradient-to-br ${s.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition hover:-translate-y-1`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full grid place-items-center font-bold text-xl">
                          {s.num}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">{s.icon}</span>
                          <h3 className="font-bold text-xl">{s.title}</h3>
                        </div>
                        <p className="text-white/90 mb-3">{s.desc}</p>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                          <p className="font-serif text-sm">﴿{s.text}﴾</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* فوائد الإسلام */}
            <IslamicSection title="ماذا يكسبك الإسلام؟" icon="💎">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition border-t-4 border-gold">
                  <span className="text-5xl mb-3 block">🕊️</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">السكينة والطمأنينة</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition border-t-4 border-emerald-500">
                  <span className="text-5xl mb-3 block">🌟</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">الهداية والنور</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    الله ينورك بنور الإيمان ويهديك للصراط المستقيم
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition border-t-4 border-purple-500">
                  <span className="text-5xl mb-3 block">🏡</span>
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">الأخوة الحقيقية</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    تصبح جزءاً من أمة عظيمة تجمعها المحبة في الله
                  </p>
                </div>
              </div>
            </IslamicSection>

            {/* تواصل */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <span className="text-6xl mb-4 block">🤝</span>
              <h3 className="font-serif text-3xl text-gold mb-4">
                هل أنت مستعد للخطوة الأولى؟
              </h3>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
                نحن هنا لمساعدتك في رحلتك. تواصل معنا وسنرشدك خطوة بخطوة.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href={`/${lang}/contact`}
                  className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition shadow-xl"
                >
                  💬 تواصل معنا
                </a>
                <a
                  href={`/${lang}/about`}
                  className="bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition"
                >
                  👤 تعرف على الشيخ
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}