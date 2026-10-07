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
    title: "النية والطهارة",
    desc: "انوِ الصلاة في قلبك، وتأكد من طهارتك (الوضوء) وطهارة ثوبك ومكانك.",
    icon: "💧",
    details: [
      "النية محلها القلب، ولا يُشترط التلفظ بها",
      "الوضوء شرط لصحة الصلاة",
      "يجب أن يكون الثوب والبدن والمكان طاهراً",
      "استقبال القبلة شرط أساسي"
    ],
    gradient: "from-blue-600 to-blue-700",
  },
  {
    num: 2,
    title: "تكبيرة الإحرام",
    desc: "قف مستقبلاً القبلة، وارفع يديك حذو منكبيك، وكبّر قائلاً: الله أكبر.",
    icon: "🤲",
    details: [
      "ارفع يديك حذو منكبيك أو حذو أذنيك",
      "قل: الله أكبر",
      "انظر إلى موضع سجودك",
      "ضع يدك اليمنى على اليسرى فوق صدرك"
    ],
    gradient: "from-emerald-600 to-emerald-700",
  },
  {
    num: 3,
    title: "دعاء الاست opening والفاتحة",
    desc: "اقرأ دعاء الاستفتاح، ثم استعذ بالله، ثم اقرأ الفاتحة.",
    icon: "📖",
    details: [
      "دعاء الاستفتاح: سبحانك اللهم وبحمدك...",
      "قل: أعوذ بالله من الشيطان الرجيم",
      "اقرأ الفاتحة كاملة",
      "قل: آمين بعد الفاتحة"
    ],
    gradient: "from-purple-600 to-purple-700",
  },
  {
    num: 4,
    title: "الركوع",
    desc: "كبّر وانحنِ حتى تطمئن راكعاً، وسبّح ثلاثاً: سبحان ربي العظيم.",
    icon: "🙇",
    details: [
      "كبّر وأنت نازل للركوع",
      "ضع يديك على ركبتيك",
      "اجعل ظهرك مستوياً",
      "قل: سبحان ربي العظيم (3 مرات)"
    ],
    gradient: "from-amber-600 to-amber-700",
  },
  {
    num: 5,
    title: "الرفع من الركوع",
    desc: "ارفع من الركوع قائلاً: سمع الله لمن حمده، ثم: ربنا ولك الحمد.",
    icon: "🧍",
    details: [
      "قل وأنت رافع: سمع الله لمن حمده",
      "قف معتدلاً تماماً",
      "قل: ربنا ولك الحمد حمداً كثيراً طيباً مباركاً فيه",
      "اطل القيام قليلاً"
    ],
    gradient: "from-rose-600 to-rose-700",
  },
  {
    num: 6,
    title: "السجود",
    desc: "اسجد على سبعة أعضاء، وسبّح: سبحان ربي الأعلى ثلاثاً.",
    icon: "🤲",
    details: [
      "اسجد على 7 أعضاء: الجبهة مع الأنف، الكفين، الركبتين، أطراف القدمين",
      "قل: سبحان ربي الأعلى (3 مرات)",
      "ادعُ الله في السجود بما شئت",
      "السجود أقرب ما يكون العبد من ربه"
    ],
    gradient: "from-indigo-600 to-indigo-700",
  },
  {
    num: 7,
    title: "الجلسة بين السجدتين",
    desc: "ارفع من السجود وجلس مفترشاً، وقل: رب اغفر لي.",
    icon: "🧎",
    details: [
      "اجلس مفترشاً رجلك اليسرى وانصب اليمنى",
      "قل: رب اغفر لي، رب اغفر لي",
      "ضع يديك على فخذيك",
      "اطل الجلسة قليلاً"
    ],
    gradient: "from-teal-600 to-teal-700",
  },
  {
    num: 8,
    title: "التشهد والتسليم",
    desc: "في آخر الصلاة، اقرأ التشهد والصلاة الإبراهيمية، ثم سلّم يميناً وشمالاً.",
    icon: "☮️",
    details: [
      "اقرأ التشهد: التحيات لله...",
      "اقرأ الصلاة الإبراهيمية: اللهم صل على محمد...",
      "ادعُ الله بما شئت قبل التسليم",
      "سلّم: السلام عليكم ورحمة الله (يميناً ثم يساراً)"
    ],
    gradient: "from-pink-600 to-pink-700",
  },
];

const prayers = [
  { name: "الفجر", rakat: 2, sunnah: "ركعتان قبلها", icon: "🌅", time: "من طلوع الفجر إلى شروق الشمس" },
  { name: "الظهر", rakat: 4, sunnah: "4 قبلها + 2 بعدها", icon: "☀️", time: "من زوال الشمس إلى وقت العصر" },
  { name: "العصر", rakat: 4, sunnah: "لا سنة راتبة", icon: "🌤️", time: "من دخول وقته إلى اصفرار الشمس" },
  { name: "المغرب", rakat: 3, sunnah: "ركعتان بعدها", icon: "🌇", time: "من غروب الشمس إلى مغيب الشفق" },
  { name: "العشاء", rakat: 4, sunnah: "ركعتان بعدها + وتر", icon: "🌙", time: "من مغيب الشفق إلى نصف الليل" },
];

export default async function PrayerGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🕌"
          title="تعلم الصلاة"
          subtitle="دليل عملي خطوة بخطوة لأداء الصلاة الصحيحة"
          hadith="صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي"
          gradient="from-teal-600 via-teal-700 to-teal-800"
        />

        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 mb-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <span className="text-6xl mb-4 block">🕌</span>
                <h2 className="font-serif text-2xl text-gold mb-3">الصلاة عماد الدين</h2>
                <p className="text-white/90 max-w-3xl mx-auto leading-relaxed">
                  الصلاة هي الركن الثاني من أركان الإسلام، وأول ما يُحاسب عليه العبد يوم القيامة.
                  هذا الدليل يأخذك خطوة بخطوة لتتعلم الصلاة كما كان يصلي النبي ﷺ.
                </p>
              </div>
            </div>

            {/* الصلوات الخمس */}
            <IslamicSection title="الصلوات الخمس" icon="🕐" subtitle="مواقيت وعدد ركعات كل صلاة">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {prayers.map((p, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition border-t-4 border-gold">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{p.icon}</span>
                      <div>
                        <h3 className="font-bold text-primary dark:text-gold text-xl">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.time}</p>
                      </div>
                    </div>
                    <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">عدد الركعات:</span>
                        <span className="font-bold text-2xl text-gold">{p.rakat}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>السنن الرواتب:</strong> {p.sunnah}
                    </p>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* خطوات الصلاة */}
            <IslamicSection title="خطوات الصلاة" icon="📋" subtitle="8 خطوات لأداء الصلاة صحيحة">
              <div className="space-y-5">
                {steps.map((s) => (
                  <div key={s.num} className={`bg-gradient-to-br ${s.gradient} text-white rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl grid place-items-center flex-shrink-0">
                          <span className="text-3xl">{s.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gold text-gray-900 w-8 h-8 rounded-full grid place-items-center font-bold text-sm">
                              {s.num}
                            </span>
                            <h3 className="font-serif text-xl font-bold">{s.title}</h3>
                          </div>
                          <p className="text-white/90">{s.desc}</p>
                        </div>
                      </div>

                      {/* التفاصيل */}
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4">
                        <h4 className="font-bold text-gold mb-2 text-sm">📝 التفاصيل:</h4>
                        <ul className="space-y-2">
                          {s.details.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                              <span className="text-gold mt-0.5">✓</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* شروط الصلاة */}
            <IslamicSection title="شروط صحة الصلاة" icon="✅">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-emerald-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">🕋 قبل الصلاة</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>الإسلام والعقل والبلوغ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>دخول الوقت</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>الطهارة من الحدث</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>طهارة الثوب والبدن والمكان</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>ستر العورة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>استقبال القبلة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>النية</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-red-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">⚠️ مبطلات الصلاة</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>الكلام العمد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>الضحك</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>الأكل والشرب</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>كثرة الحركة لغير ضرورة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>الالتفات بلا حاجة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <span>انتقاض الطهارة</span>
                    </li>
                  </ul>
                </div>
              </div>
            </IslamicSection>

            {/* آية */}
            <div className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-3xl p-8 md:p-12 text-center mt-10">
              <p className="font-serif text-2xl md:text-3xl text-primary dark:text-gold leading-relaxed mb-3">
                ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾
              </p>
              <p className="text-gray-600 dark:text-gray-400">سورة النساء - الآية 103</p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}