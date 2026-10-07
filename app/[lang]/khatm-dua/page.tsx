import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const duas = [
  {
    num: 1,
    title: "دعاء الختم الأول",
    text: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.",
    source: "دعاء مأثور",
    gradient: "from-emerald-600 to-emerald-700"
  },
  {
    num: 2,
    title: "دعاء الختم الثاني",
    text: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.",
    source: "رواه مسلم",
    gradient: "from-blue-600 to-blue-700"
  },
  {
    num: 3,
    title: "دعاء الختم الثالث",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.",
    source: "دعاء جامع",
    gradient: "from-purple-600 to-purple-700"
  },
  {
    num: 4,
    title: "دعاء الختم الرابع",
    text: "اللَّهُمَّ اجْعَلْ خَيْرَ الْعُمُرِ آخِرَهُ، وَخَيْرَ الْعَمَلِ خَوَاتِمَهُ، وَخَيْرَ الْأَيَّامِ يَوْمَ أَلْقَاكَ فِيهِ. اللَّهُمَّ إِنَّا نَسْأَلُكَ حُسْنَ الْخَاتِمَةِ.",
    source: "دعاء مأثور",
    gradient: "from-rose-600 to-rose-700"
  },
  {
    num: 5,
    title: "دعاء الختم الخامس",
    text: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
    source: "سورة البقرة 127-128",
    gradient: "from-amber-600 to-amber-700"
  },
  {
    num: 6,
    title: "دعاء ختم شامل",
    text: "اللَّهُمَّ اجْعَلْنَا مِمَّنْ يَقُومُ بِالْقُرْآنِ، وَيَعْمَلُ بِهِ، وَيَتْلُوهُ حَقَّ تِلَاوَتِهِ، آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، عَلَى وَجْهٍ يُرْضِيكَ عَنَّا يَا رَبَّ الْعَالَمِينَ.",
    source: "دعاء العلماء",
    gradient: "from-indigo-600 to-indigo-700"
  },
];

export default async function KhatmDuaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="✨"
          title="أدعية ختم القرآن"
          subtitle="مجموعة من الأدعية المأثورة عند ختم القرآن الكريم"
          verse="رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ"
          verseSource="سورة البقرة - الآية 127"
          gradient="from-rose-600 via-rose-700 to-rose-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 mb-10 text-center shadow-2xl">
              <span className="text-6xl mb-4 block">🤲</span>
              <h2 className="font-serif text-2xl text-gold mb-3">لحظة مباركة</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                ختم القرآن من أعظم المنح الربانية، ويُستحب الدعاء عند الختم، 
                فهذه لحظة استجابة عظيمة. اختر من هذه الأدعية ما شئت وادعُ الله بقلب حاضر.
              </p>
            </div>

            {/* الأدعية */}
            <IslamicSection title={`${duas.length} أدعية`} icon="📜" subtitle="اختر الدعاء وادعُ به بقلب خاشع">
              <div className="space-y-6">
                {duas.map((d) => (
                  <div key={d.num} className={`bg-gradient-to-br ${d.gradient} text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-12 h-12 bg-gold text-gray-900 rounded-full grid place-items-center font-bold text-xl">
                          {d.num}
                        </span>
                        <h3 className="font-serif text-xl font-bold">{d.title}</h3>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur rounded-xl p-5 mb-4">
                        <p className="font-serif text-xl leading-loose">
                          {d.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">📚 {d.source}</span>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: d.title, text: d.text });
                            } else if (navigator.clipboard) {
                              navigator.clipboard.writeText(d.text);
                              alert("تم نسخ الدعاء");
                            }
                          }}
                          className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/30 transition"
                        >
                          📋 نسخ الدعاء
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* آداب ختم القرآن */}
            <IslamicSection title="آداب ختم القرآن" icon="💎">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">🌟 عند الختم</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-gold">✓</span>
                      <span>ادعُ الله بخشوع وحضور قلب</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">✓</span>
                      <span>استقبل القبلة إن أمكن</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">✓</span>
                      <span>ادعُ لنفسك وللمسلمين</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">✓</span>
                      <span>اجمع أهلك للدعاء (إن أمكن)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-emerald-500">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">🔄 بعد الختم</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>ابدأ ختمة جديدة فوراً</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>احمد الله على التوفيق</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>اعزم على العمل بما تعلمت</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>علّم غيرك ما تعلمت</span>
                    </li>
                  </ul>
                </div>
              </div>
            </IslamicSection>

            {/* آية */}
            <div className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-3xl p-8 md:p-12 text-center mt-10">
              <p className="font-serif text-2xl md:text-3xl text-primary dark:text-gold leading-relaxed mb-3">
                ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾
              </p>
              <p className="text-gray-600 dark:text-gray-400">سورة طه - الآية 114</p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}