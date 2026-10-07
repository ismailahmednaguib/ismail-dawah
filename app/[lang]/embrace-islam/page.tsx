import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const sections = [
  {
    icon: "🌟",
    title: "ما هو الإسلام؟",
    body: "الإسلام هو الاستسلام لله بالتوحيد، والانقياد له بالطاعة، والبراءة من الشرك وأهله. وهو الدين الذي ارتضاه الله للبشرية، وأرسل به جميع الأنبياء.",
  },
  {
    icon: "🕌",
    title: "أركان الإسلام الخمسة",
    body: "1. شهادة أن لا إله إلا الله وأن محمدًا رسول الله.\n2. إقام الصلاة.\n3. إيتاء الزكاة.\n4. صوم رمضان.\n5. حج البيت لمن استطاع إليه سبيلًا.",
  },
  {
    icon: "💫",
    title: "كيف تعتنق الإسلام؟",
    body: "تنطق بالشهادتين بصدق وإخلاص: «أشهد أن لا إله إلا الله، وأشهد أن محمدًا رسول الله». وبذلك تدخل في الإسلام، وتبدأ حياة جديدة مع الله.",
  },
  {
    icon: "🤲",
    title: "ماذا بعد الإسلام؟",
    body: "تعلم الصلاة وأداها، واقرأ القرآن، وتعرف على تعاليم الإسلام تدريجيًا. ونحن هنا لمساعدتك في كل خطوة.",
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>اعتنق الإسلام</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            مرحبًا بك في رحلتك نحو الهداية
          </p>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold">
                <h3 className="font-bold text-primary dark:text-gold text-xl mb-3">
                  {s.icon} {s.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>

          {/* دعوة للتواصل */}
          <div className="mt-10 bg-primary text-white rounded-2xl p-8 text-center pattern-light">
            <h3 className="font-serif text-2xl text-gold mb-3">هل أنت مستعد؟</h3>
            <p className="text-white/80 mb-6">تواصل مع الشيخ مباشرة وسيساعدك في كل خطوة</p>
            <a
              href={`https://wa.me/${c.settings.wa}?text=${encodeURIComponent("السلام عليكم، أريد أن أتعلم عن الإسلام")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-light transition"
            >
              💬 تواصل عبر واتساب
            </a>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}