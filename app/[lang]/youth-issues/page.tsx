import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const issues = [
  { icon: "💔", title: "الحب قبل الزواج", problem: "علاقات عاطفية خارج إطار الزواج تؤدي للذنوب.", solution: "الحب الحقيقي هو ما يُبنى على الحلال. الزواج هو الطريق الشرعي، ومن استعفف أعفّه الله.", ayah: "وَلْيَسْتَعْفِفِ الَّذِينَ لَا يَجِدُونَ نِكَاحًا حَتَّىٰ يُغْنِيَهُمُ اللَّهُ مِن فَضْلِهِ", gradient: "from-rose-600 to-rose-700" },
  { icon: "📱", title: "إدمان السوشيال ميديا", problem: "ساعات طويلة ضائعة، مقارنة بالآخرين، اكتئاب.", solution: "حدد وقتاً معيناً. استخدم الوقت في ما ينفع: حفظ قرآن، قراءة، رياضة.", ayah: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ", gradient: "from-blue-600 to-blue-700" },
  { icon: "🎮", title: "ألعاب الفيديو المفرطة", problem: "تضييع الوقت، إهمال الدراسة، عزلة اجتماعية.", solution: "اللعب ليس حراماً لكن الإفراط فيه ضار. ضع حداً أقصى ساعة يومياً.", ayah: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا", gradient: "from-purple-600 to-purple-700" },
  { icon: "💭", title: "الاكتئاب والقلق", problem: "شعور بالحزن المستمر، فقدان الشغف.", solution: "الاكتئاب مرض يحتاج علاج. ادعُ الله وتوكل عليه، واطلب المساعدة من متخصص.", ayah: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", gradient: "from-indigo-600 to-indigo-700" },
  { icon: "🎓", title: "فقدان الهدف في الحياة", problem: "لا أعرف لماذا أعيش، لا هدف واضح.", solution: "هدفك الأكبر: عبادة الله وعمارة الأرض. اجعل لك أهدافاً قصيرة وواضحة.", ayah: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", gradient: "from-emerald-600 to-emerald-700" },
  { icon: "👥", title: "أصدقاء السوء", problem: "أصدقاء يدفعونك للذنوب والتفاهة.", solution: "اختر أصدقاءك بعناية. الصاحب الصالح يرفعك، وصاحب السوء يضرك.", ayah: "الْأَخِلَّاءُ يَوْمَئِذٍ بَعْضُهُمْ لِبَعْضٍ عَدُوٌّ إِلَّا الْمُتَّقِينَ", gradient: "from-amber-600 to-amber-700" },
  { icon: "💰", title: "الضغط المادي والمقارنة", problem: "أرى أصدقائي في رفاهية وأنا في ضيق.", solution: "الرزق مقسوم، والمقارنة تسرق السعادة. احمد الله على ما عندك.", ayah: "وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ", gradient: "from-orange-600 to-orange-700" },
  { icon: "🎭", title: "الانفصال عن الدين", problem: "أشعر أن الدين لا يناسب عصري.", solution: "الدين صالح لكل زمان. ابحث عن علماء معاصرين يفهمون واقعك.", ayah: "وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ وَهُوَ مُحْسِنٌ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ", gradient: "from-teal-600 to-teal-700" },
];

export default async function YouthIssuesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🧑"
          title="قضايا الشباب المعاصرة"
          subtitle="مشاكل الشباب اليوم وحلولها من منظور إسلامي"
          hadith="نُصِرْتُ بِالشَّبَابِ"
          gradient="from-violet-600 via-violet-700 to-violet-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            <IslamicSection title="القضايا والحلول" icon="💡" subtitle="اختر القضية اللي تهمك">
              <div className="grid md:grid-cols-2 gap-6">
                {issues.map((issue, i) => (
                  <div key={i} className={`bg-gradient-to-br ${issue.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition hover:-translate-y-1`}>
                    <div className="text-center mb-4">
                      <span className="text-5xl">{issue.icon}</span>
                      <h3 className="font-bold text-xl mt-3">{issue.title}</h3>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-3">
                      <h4 className="font-bold text-sm mb-2">⚠️ المشكلة:</h4>
                      <p className="text-white/90 text-sm">{issue.problem}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-3">
                      <h4 className="font-bold text-sm mb-2">✅ الحل:</h4>
                      <p className="text-white/90 text-sm">{issue.solution}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                      <p className="font-serif text-sm text-center">﴿{issue.ayah}﴾</p>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* رسالة للشباب */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-8 mt-10 text-center">
              <h3 className="font-serif text-2xl text-gold mb-4">💬 رسالة للشاب المسلم</h3>
              <p className="leading-relaxed text-lg max-w-3xl mx-auto">
                أنت قوة الأمة ومستقبلها. لا تستهن بنفسك. اجعل شبابك فيما ينفعك في دينك ودنياك.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}