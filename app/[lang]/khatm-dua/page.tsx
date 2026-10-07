import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const duas = [
  {
    title: "دعاء ختم القرآن (1)",
    text: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.",
  },
  {
    title: "دعاء ختم القرآن (2)",
    text: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.",
  },
  {
    title: "دعاء ختم القرآن (3)",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.",
  },
  {
    title: "دعاء ختم القرآن (4)",
    text: "اللَّهُمَّ اجْعَلْ خَيْرَ الْعُمُرِ آخِرَهُ، وَخَيْرَ الْعَمَلِ خَوَاتِمَهُ، وَخَيْرَ الْأَيَّامِ يَوْمَ أَلْقَاكَ فِيهِ. اللَّهُمَّ إِنَّا نَسْأَلُكَ حُسْنَ الْخَاتِمَةِ.",
  },
  {
    title: "دعاء ختم القرآن (5)",
    text: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
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
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>✨ أدعية ختم القرآن</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
            مجموعة من الأدعية المأثورة عند ختم القرآن الكريم
          </p>

          <div className="space-y-5">
            {duas.map((d, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold">
                <h3 className="font-bold text-primary dark:text-gold text-lg mb-3">{d.title}</h3>
                <p className="font-serif text-xl leading-loose text-primary dark:text-white">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}