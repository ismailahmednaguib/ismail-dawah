import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const steps = [
  { num: "1", title: "النية والإخلاص", desc: "اجعل حفظك للقرآن لله، لا للرياء. واحتسب الأجر عند الله.", icon: "🎯" },
  { num: "2", title: "اختر الوقت المناسب", desc: "أفضل وقت للحفظ بعد الفجر أو قبل النوم، حيث يكون الذهن صافياً.", icon: "⏰" },
  { num: "3", title: "اختر المكان الهادئ", desc: "مكان بعيد عن الضوضاء والتشتت. المسجد أفضل مكان.", icon: "🏛️" },
  { num: "4", title: "استمع أولاً", desc: "استمع للآيات من قارئ متقن (كالحصري أو المنشاوي) لتصحح النطق.", icon: "🎧" },
  { num: "5", title: "افهم المعنى", desc: "اقرأ التفسير الميسر قبل الحفظ، الفهم يثبت الحفظ.", icon: "📖" },
  { num: "6", title: "كرر كثيراً", desc: "كرر الآية 20 مرة على الأقل. التكرار سر الحفظ.", icon: "🔄" },
  { num: "7", title: "اربط الآيات", desc: "اربط الآية ببعدها، واحفظ الصفحة كاملة قبل الانتقال.", icon: "🔗" },
  { num: "8", title: "المراجعة الدائمة", desc: "راجع ما حفظته يومياً. بدون المراجعة يذهب الحفظ.", icon: "📚" },
];

const tips = [
  { icon: "📅", title: "ورد يومي ثابت", desc: "احفظ صفحة واحدة يومياً = ختم الحفظ في سنة" },
  { icon: "🕌", title: "صلِ بما تحفظ", desc: "اقرأ ما حفظته في السنن الرواتب والقيام" },
  { icon: "👥", title: "ابحث عن رفيق", desc: "صاحب يحفظ معك ويسمع لك ويحفزك" },
  { icon: "📝", title: "سجّل تقدمك", desc: "اكتب ما تحفظه كل يوم لترى إنجازك" },
  { icon: "🤲", title: "أكثر من الدعاء", desc: "اللهم يسر لي حفظ كتابك" },
  { icon: "🚫", title: "ابتعد عن المعاصي", desc: "المعاصي تمحو الحفظ وتمحق البركة" },
];

const plans = [
  { name: "خطة السنة", duration: "12 شهر", daily: "صفحة واحدة", juz: "30 جزء", level: "متوسط" },
  { name: "خطة السنتين", duration: "24 شهر", daily: "نصف صفحة", juz: "30 جزء", level: "مبتدئ" },
  { name: "خطة 6 أشهر", duration: "6 أشهر", daily: "صفحتين", juz: "30 جزء", level: "متقدم" },
  { name: "خطة حفظ جزء عم", duration: "شهران", daily: "وجه واحد", juz: "جزء واحد", level: "مبتدئ" },
];

export default async function QuranMemorizationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📚 كيف تحفظ القرآن</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            «وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ»
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            منهج عملي لحفظ القرآن الكريم وإتقانه
          </p>

          {/* فضل الحفظ */}
          <div className="bg-primary text-white rounded-2xl p-6 mb-10 text-center pattern-light">
            <p className="font-serif text-xl text-gold mb-2">فضل حفظ القرآن</p>
            <p className="text-lg leading-relaxed">
              قال ﷺ: «يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا»
            </p>
            <p className="text-sm text-gold-light mt-2">رواه الترمذي</p>
          </div>

          {/* خطوات الحفظ */}
          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-6 text-center">🎯 خطوات الحفظ الناجح</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border-r-4 border-gold">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-primary dark:text-gold text-lg mb-1">
                      <span className="inline-block w-7 h-7 bg-gold text-gray-900 rounded-full text-sm grid place-items-center ml-2">{s.num}</span>
                      {s.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* نصائح ذهبية */}
          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-6 text-center">💎 نصائح ذهبية</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {tips.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md text-center hover:shadow-xl transition">
                <div className="text-4xl mb-3">{t.icon}</div>
                <h3 className="font-bold text-primary dark:text-gold mb-2">{t.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* خطط الحفظ */}
          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-6 text-center">📅 خطط الحفظ</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {plans.map((p, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-gold">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-primary dark:text-gold">{p.name}</h3>
                  <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full font-bold">{p.level}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-xs text-gray-500">المدة</p>
                    <p className="font-bold text-primary dark:text-white">{p.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">اليومي</p>
                    <p className="font-bold text-primary dark:text-white">{p.daily}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الإجمالي</p>
                    <p className="font-bold text-primary dark:text-white">{p.juz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* تحذير */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-5">
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ تنبيه مهم:</h3>
            <p className="text-amber-900 dark:text-amber-100 text-sm leading-relaxed">
              الحفظ بلا فهم ولا عمل كشجرة بلا ثمر. اقرأ تفسير ما تحفظ، واعمل بما تعلمت، واجعل القرآن منهج حياة لا مجرد كلمات تردد.
            </p>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}