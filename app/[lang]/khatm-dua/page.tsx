import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const duas = [
  { title: "دعاء ختم القرآن (1)", text: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.", num: 1 },
  { title: "دعاء ختم القرآن (2)", text: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.", num: 2 },
  { title: "دعاء ختم القرآن (3)", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.", num: 3 },
  { title: "دعاء ختم القرآن (4)", text: "اللَّهُمَّ اجْعَلْ خَيْرَ الْعُمُرِ آخِرَهُ، وَخَيْرَ الْعَمَلِ خَوَاتِمَهُ، وَخَيْرَ الْأَيَّامِ يَوْمَ أَلْقَاكَ فِيهِ. اللَّهُمَّ إِنَّا نَسْأَلُكَ حُسْنَ الْخَاتِمَةِ.", num: 4 },
  { title: "دعاء ختم القرآن (5)", text: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.", num: 5 },
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

            <IslamicSection title="الأدعية" icon="🤲" subtitle="اقرأها بيقين وحضور قلب">
              <div className="space-y-6">
                {duas.map((d, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-r-4 border-gold hover:shadow-2xl transition">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="w-12 h-12 bg-gold text-gray-900 rounded-full grid place-items-center font-bold text-xl flex-shrink-0">
                        {d.num}
                      </span>
                      <h3 className="font-bold text-primary dark:text-gold text-xl pt-2">{d.title}</h3>
                    </div>
                    <p className="font-serif text-xl leading-loose text-primary dark:text-white pr-16">
                      {d.text}
                    </p>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-2xl p-8 mt-10 text-center">
              <h3 className="font-serif text-2xl text-primary dark:text-gold mb-4">💎 نصيحة</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                ادعُ هذه الأدعية بقلب حاضر، وتيقّن الإجابة. وخير ما يُختم به القرآن هو الدعاء والتوبة والاستغفار.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}