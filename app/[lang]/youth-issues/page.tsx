import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const issues = [
  {
    icon: "💔",
    title: "الحب قبل الزواج",
    problem: "علاقات عاطفية خارج إطار الزواج تؤدي للذنوب وضياع البركة.",
    solution: "الحب الحقيقي هو ما يُبنى على الحلال. الزواج هو الطريق الشرعي، ومن استعفف أعفّه الله. الصبر على الحلال خير من متعة حرام.",
    ayah: "﴿وَلْيَسْتَعْفِفِ الَّذِينَ لَا يَجِدُونَ نِكَاحًا حَتَّىٰ يُغْنِيَهُمُ اللَّهُ مِن فَضْلِهِ﴾"
  },
  {
    icon: "📱",
    title: "إدمان السوشيال ميديا",
    problem: "ساعات طويلة ضائعة، مقارنة بالآخرين، اكتئاب وقلق.",
    solution: "حدد وقتاً معيناً، واتبع قاعدة 'قبل أن تنشر، اسأل: هل ينفعني هذا في ديني أو دنياي؟'. استخدم الوقت في ما ينفع: حفظ قرآن، قراءة، رياضة.",
    ayah: "﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ﴾"
  },
  {
    icon: "🎮",
    title: "ألعاب الفيديو المفرطة",
    problem: "تضييع الوقت، إهمال الدراسة، عزلة اجتماعية.",
    solution: "اللعب ليس حراماً لكن الإفراط فيه ضار. ضع حداً أقصى ساعة يومياً، واختر الألعاب النافعة التي تطور مهاراتك.",
    ayah: "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾"
  },
  {
    icon: "💭",
    title: "الاكتئاب والقلق",
    problem: "شعور بالحزن المستمر، فقدان الشغف، أفكار سلبية.",
    solution: "الاكتئاب مرض يحتاج علاج. ادعُ الله وتوكل عليه، واطلب المساعدة من متخصص. الذكر والصلاة والدواء معاً. أنت لست وحدك.",
    ayah: "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾"
  },
  {
    icon: "🎓",
    title: "فقدان الهدف في الحياة",
    problem: "لا أعرف لماذا أعيش، لا هدف واضح.",
    solution: "هدفك الأكبر: عبادة الله وعمارة الأرض. اجعل لك أهدافاً قصيرة: حفظ جزء من القرآن، تعلم مهارة، خدمة الناس.",
    ayah: "﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ﴾"
  },
  {
    icon: "👥",
    title: "أصدقاء السوء",
    problem: "أصدقاء يدفعونك للذنوب والتفاهة.",
    solution: "اختر أصدقاءك بعناية. الصاحب الصالح يرفعك، وصاحب السوء يضرك. النبي ﷺ شبّه الجليس الصالح بحامل المسك.",
    ayah: "﴿الْأَخِلَّاءُ يَوْمَئِذٍ بَعْضُهُمْ لِبَعْضٍ عَدُوٌّ إِلَّا الْمُتَّقِينَ﴾"
  },
  {
    icon: "💰",
    title: "الضغط المادي والمقارنة",
    problem: "أرى أصدقائي في رفاهية وأنا في ضيق.",
    solution: "الرزق مقسوم، والمقارنة تسرق السعادة. احمد الله على ما عندك، واسعَ بلا حسد. كثير من الأغنياء يتمنون ما عندك من صحة وإيمان.",
    ayah: "﴿وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ﴾"
  },
  {
    icon: "🎭",
    title: "الانفصال عن الدين",
    problem: "أشعر أن الدين لا يناسب عصري.",
    solution: "الدين صالح لكل زمان. المشكلة في فهمنا لا في الدين نفسه. ابحث عن علماء معاصرين يفهمون واقعك. جرّب الصلاة بصدق ستشعر بالفرق.",
    ayah: "﴿وَمَن يُسْلِمْ وَجْهَهُ إِلَى اللَّهِ وَهُوَ مُحْسِنٌ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ﴾"
  },
];

export default async function YouthIssuesPage({ params }: { params: Promise<{ lang: string }> }) {
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
          <SectionTitle>🧑 قضايا الشباب المعاصرة</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            مشاكل الشباب اليوم وحلولها من منظور إسلامي
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {issues.map((issue, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-t-4 border-gold">
                <div className="text-center mb-4">
                  <span className="text-5xl">{issue.icon}</span>
                  <h3 className="font-bold text-xl text-primary dark:text-gold mt-2">{issue.title}</h3>
                </div>

                <div className="mb-3">
                  <h4 className="font-bold text-red-600 text-sm mb-1">⚠️ المشكلة:</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{issue.problem}</p>
                </div>

                <div className="mb-3">
                  <h4 className="font-bold text-green-600 text-sm mb-1">✅ الحل:</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{issue.solution}</p>
                </div>

                <div className="bg-cream-dark dark:bg-gray-700 rounded-lg p-3 mt-4">
                  <p className="font-serif text-primary dark:text-gold text-sm text-center">{issue.ayah}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary text-white rounded-2xl p-6 mt-10 text-center pattern-light">
            <h3 className="font-serif text-2xl text-gold mb-3">💬 رسالة للشاب المسلم</h3>
            <p className="leading-relaxed">
              أنت قوة الأمة ومستقبلها. لا تستهن بنفسك. النبي ﷺ قال: «نُصِرْتُ بِالشَّبَابِ». اجعل شبابك فيما ينفعك في دينك ودنياك.
            </p>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}