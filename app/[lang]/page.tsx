import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import IslamicCard from "@/components/IslamicCard";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// الأقسام + الأدوات في مصفوفة واحدة
const allSections = [
  // 📚 الأقسام العلمية والدعوية
  { slug: "fields", icon: "knowledge", title: "العلوم الشرعية", desc: "17 علماً شرعياً مترجماً لـ 13 لغة", verse: "وَقُل رَّبِّ زِدْنِي عِلْمًا", gradient: "from-emerald-600 to-emerald-700" },
  { slug: "fatwa", icon: "fatwa", title: "الفتاوى الشرعية", desc: "إجابات فقهية وعقدية", hadith: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", gradient: "from-blue-600 to-blue-700" },
  { slug: "doubts", icon: "light", title: "الرد على الشبهات", desc: "ردود علمية منهجية", gradient: "from-purple-600 to-purple-700" },
  
  // 🛠️ الأدوات الإسلامية
  { slug: "quran", icon: "quran", title: "المصحف الكريم", desc: "اقرأ القرآن كاملاً", verse: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ", gradient: "from-green-600 to-green-700" },
  { slug: "prayer-times", icon: "mosque", title: "مواقيت الصلاة", desc: "لكل دول العالم", hadith: "الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا", gradient: "from-cyan-600 to-cyan-700" },
  { slug: "qibla", icon: "kaaba", title: "تحديد القبلة", desc: "من أي مكان", verse: "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ", gradient: "from-orange-600 to-orange-700" },
  { slug: "zakat", icon: "heart", title: "حاسبة الزكاة", desc: "احسب زكاتك بدقة", verse: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ", gradient: "from-pink-600 to-pink-700" },
  
  // 📢 محتوى دعوي
  { slug: "dawah-guide", icon: "mosque", title: "دليل الدعاة", desc: "كيف تدعو إلى الله", hadith: "بَلِّغُوا عَنِّي وَلَوْ آيَةً", gradient: "from-amber-600 to-amber-700" },
  { slug: "prophets-stories", icon: "star", title: "قصص الأنبياء", desc: "دروس وعبر", verse: "لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ", gradient: "from-indigo-600 to-indigo-700" },
  { slug: "prayer-guide", icon: "prayer", title: "تعلم الصلاة", desc: "خطوة بخطوة", hadith: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي", gradient: "from-teal-600 to-teal-700" },
  { slug: "ruqyah", icon: "heart", title: "الرقية الشرعية", desc: "آيات وأدعية للشفاء", verse: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ", gradient: "from-fuchsia-600 to-fuchsia-700" },
  
  // 🧮 أدوات عملية
  { slug: "inheritance", icon: "star", title: "حاسبة المواريث", desc: "قسمة التركات", gradient: "from-yellow-600 to-yellow-700" },
  { slug: "daily-wird", icon: "quran", title: "الورد اليومي", desc: "خطة لختم القرآن", verse: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ", gradient: "from-lime-600 to-lime-700" },
  { slug: "tasbih", icon: "star", title: "التسبيح الرقمي", desc: "عداد تفاعلي", gradient: "from-violet-600 to-violet-700" },
  { slug: "calendar", icon: "star", title: "التقويم الهجري", desc: "هجري وميلادي", verse: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا", gradient: "from-stone-600 to-stone-700" },
  
  // 🎯 محتوى متخصص
  { slug: "atheism-response", icon: "light", title: "الرد على الإلحاد", desc: "شبهات وردود", gradient: "from-red-600 to-red-700" },
  { slug: "youth-issues", icon: "heart", title: "قضايا الشباب", desc: "مشاكل وحلول", gradient: "from-rose-600 to-rose-700" },
  { slug: "women-fatwas", icon: "heart", title: "فتاوى المرأة", desc: "قضايا المرأة المسلمة", gradient: "from-pink-500 to-pink-600" },
  { slug: "khutab", icon: "mosque", title: "مكتبة الخطب", desc: "خطب جمعة جاهزة", hadith: "خَيْرُ الْحَدِيثِ كِتَابُ اللَّهِ", gradient: "from-amber-700 to-amber-800" },
  
  // 🕋 مناسك
  { slug: "hajj-guide", icon: "kaaba", title: "دليل الحج والعمرة", desc: "خطوة بخطوة", hadith: "خُذُوا عَنِّي مَنَاسِكَكُمْ", gradient: "from-stone-700 to-stone-800" },
  { slug: "embrace-islam", icon: "heart", title: "اعتنق الإسلام", desc: "رحلتك نحو الهداية", verse: "أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ", gradient: "from-rose-700 to-rose-800" },
  { slug: "quran-memorization", icon: "quran", title: "كيف تحفظ القرآن", desc: "منهج عملي", gradient: "from-green-700 to-green-800" },
  { slug: "khatm-dua", icon: "star", title: "أدعية ختم القرآن", desc: "أدعية مأثورة", gradient: "from-rose-600 to-rose-700" },
  { slug: "bookmarks", icon: "star", title: "المفضلة", desc: "صفحاتك المحفوظة", gradient: "from-yellow-500 to-yellow-600" },
];

function HeroVerse({ verse, source }: { verse: string; source: string }) {
  return (
    <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden mb-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="relative">
        <div className="inline-block bg-gold/20 rounded-full p-4 mb-6">
          <span className="text-6xl">📖</span>
        </div>
        <p className="font-serif text-3xl md:text-4xl text-gold leading-relaxed mb-4">
          ﴿{verse}﴾
        </p>
        <p className="text-white/80 text-lg">{source}</p>
      </div>
    </div>
  );
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  // فلترة الأقسام حسب الإعدادات
  const visibleSections = c.settings.visibleSections || allSections.map(s => s.slug);
  const sectionConfig = c.settings.sectionConfig || {};

  const visibleCards = allSections
    .filter(s => {
      const config = sectionConfig[s.slug];
      // لو مش في الإعدادات، اعرضه افتراضياً
      if (!config) return true;
      return config.enabled !== false;
    })
    .map(s => {
      const config = sectionConfig[s.slug] || {};
      return {
        href: `/${lang}/${s.slug}`,
        icon: config.icon || s.icon,
        title: config.customTitle || s.title,
        description: config.customDesc || s.desc,
        verse: config.showVerse !== false ? s.verse : undefined,
        hadith: config.showHadith !== false ? s.hadith : undefined,
        gradient: config.gradient || s.gradient,
      };
    });

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        
        {/* Hero */}
        <section className="relative bg-primary text-white py-20 text-center overflow-hidden">
          <div className="absolute inset-0 pattern-light opacity-10"></div>
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="inline-block bg-gold/20 rounded-full p-3 mb-6">
              <span className="text-5xl">✨</span>
            </div>
            <p className="font-serif text-gold-light text-2xl mb-4">ismail-dawah</p>
            <h1 className="font-serif text-5xl md:text-6xl mb-4 leading-tight">{c.settings.ownerName}</h1>
            <div className="ornament my-6"><span className="text-3xl">✦</span></div>
            <p className="text-white/90 text-xl max-w-2xl mx-auto leading-relaxed">
              {c.settings.motto}
            </p>
            <p className="text-white/70 text-sm mt-4">{c.settings.jobTitle}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">

            {/* آية الافتتاح */}
            <HeroVerse 
              verse="قُلْ هَٰذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ عَلَىٰ بَصِيرَةٍ"
              source="سورة يوسف - الآية 108"
            />

            {/* كل الأقسام + الأدوات في Grid موحد */}
            <div className="mb-8 text-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <h2 className="font-serif text-3xl text-primary dark:text-gold font-bold whitespace-nowrap">
                  🌟 كل المحتوى في مكان واحد
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                أقسام دعوية + أدوات إسلامية ({visibleCards.length} قسم وأداة)
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
              {visibleCards.map((card, i) => (
                <IslamicCard
                  key={i}
                  href={card.href}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  verse={card.verse}
                  hadith={card.hadith}
                  gradient={card.gradient}
                />
              ))}
            </div>

            {/* تحميل التطبيق */}
            {c.settings.appUrl && (
              <section className="mb-16">
                <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <div className="inline-block bg-gold/20 rounded-full p-4 mb-6">
                      <span className="text-6xl">📱</span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-gold mb-4">
                      حمّل تطبيق ismail-dawah
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                      كل محتوى الموقع في تطبيق واحد على موبايلك
                    </p>
                    <a
                      href={c.settings.appUrl}
                      download
                      className="inline-flex items-center gap-3 bg-gold text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gold-light hover:scale-105 transition shadow-xl"
                    >
                      <span className="text-2xl">⬇️</span>
                      <span>تحميل التطبيق الآن</span>
                    </a>
                  </div>
                </div>
              </section>
            )}

          </div>
        </section>

        {/* النشرة البريدية */}
        <section className="py-16 bg-gradient-to-br from-cream-dark to-cream dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <Newsletter />
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}