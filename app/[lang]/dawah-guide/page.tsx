import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const steps = [
  { icon: "🎯", title: "الإخلاص", desc: "اجعل دعوتك لله وحده، لا للرياء ولا للسمعة. قال تعالى: ﴿قُلْ هَٰذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ﴾" },
  { icon: "📚", title: "العلم", desc: "ادعُ على بصيرة. لا تتكلم فيما لا تعلم. تعلم العقيدة والفقه قبل أن تدعو غيرك." },
  { icon: "💝", title: "الرفق واللين", desc: "قال تعالى لموسى وهارون: ﴿فَقُولَا لَهُ قَوْلًا لَّيِّنًا لَّعَلَّهُ يَتَذَكَّرُ أَوْ يَخْشَىٰ﴾" },
  { icon: "🤝", title: "الحكمة", desc: "﴿ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ﴾ - خاطب كل قوم بما يناسبهم." },
  { icon: "🌱", title: "التدرج", desc: "ابدأ بالأهم فالأهم: التوحيد، ثم الفرائض، ثم النوافل. كما فعل النبي ﷺ مع معاذ." },
  { icon: "👤", title: "القدوة الحسنة", desc: "كن قدوة قبل أن تكون داعية. الناس يتأثرون بالأفعال أكثر من الأقوال." },
  { icon: "⏳", title: "الصبر", desc: "الدعوة تحتاج صبراً. نوح عليه السلام دعا قومه 950 سنة!" },
  { icon: "🤲", title: "الدعاء", desc: "ادعُ الله أن يهدي الناس على يدك. الهداية بيد الله وحده." },
];

const methods = [
  { title: "الدعوة الفردية", desc: "جلسة مع شخص واحد، تناقشه وتوجهه. أنفع أنواع الدعوة.", icon: "👤" },
  { title: "الدعوة العامة", desc: "الدروس والمحاضرات والخطب. تصل لعدد أكبر.", icon: "🎤" },
  { title: "الدعوة الإلكترونية", desc: "مقاطع قصيرة، منشورات، رسائل واتساب.", icon: "📱" },
  { title: "الدعوة بالحال", desc: "أخلاقك وتعاملك وابتسامتك دعوة صامتة.", icon: "😊" },
  { title: "الدعوة بالهدية", desc: "أهدِ مصحفاً أو كتاباً أو تسبيحة مع كلمة طيبة.", icon: "🎁" },
  { title: "الدعوة بالصدقة", desc: "تصدق عن غيرك واهدِه الثواب، مع رسالة لطيفة.", icon: "💰" },
];

export default async function DawahGuidePage({ params }: { params: Promise<{ lang: string }> }) {
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
          <SectionTitle>📢 دليل الدعاة إلى الله</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            «قُلْ هَٰذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ عَلَىٰ بَصِيرَةٍ»
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            منهج عملي لكل من يريد أن يكون داعية إلى الله
          </p>

          <div className="bg-primary text-white rounded-2xl p-6 mb-8 text-center pattern-light">
            <p className="font-serif text-2xl text-gold mb-2">فضل الدعوة</p>
            <p className="text-lg leading-relaxed">
              قال ﷺ: «مَنْ دَعَا إِلَى هُدًى كَانَ لَهُ مِنَ الْأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ، لَا يَنْقُصُ ذَلِكَ مِنْ أُجُورِهِمْ شَيْئًا»
            </p>
            <p className="text-sm text-gold-light mt-2">رواه مسلم</p>
          </div>

          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4 text-center">🎯 خطوات الدعوة الناجحة</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border-r-4 border-gold">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-primary dark:text-gold text-lg mb-1">{i + 1}. {s.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4 text-center">🛠️ طرق الدعوة</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {methods.map((m, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition">
                <div className="text-center">
                  <div className="text-5xl mb-3">{m.icon}</div>
                  <h3 className="font-bold text-primary dark:text-gold mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gold/10 border-2 border-gold rounded-2xl p-6 text-center">
            <h3 className="font-serif text-xl text-primary dark:text-gold mb-3">🌟 نصيحة ذهبية</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              لا تحتقر أي عمل دعوي، ولو كان كلمة واحدة. ربما تكون سبباً في هداية إنسان، فيكتب الله لك أجره وأجر ذريته من بعده إلى يوم القيامة.
            </p>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}