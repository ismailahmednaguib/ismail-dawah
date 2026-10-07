import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import IslamicCard from "@/components/IslamicCard";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SectionData = {
  slug: string;
  title: string;
  description: string;
  verse?: string;
  hadith?: string;
  badge?: string;
};

const sectionsData: Record<string, SectionData> = {
  "fields": { slug: "fields", title: "العلوم الشرعية", description: "سبعة عشر علماً شرعياً مترجماً إلى ثلاث عشرة لغة", verse: "وَقُل رَّبِّ زِدْنِي عِلْمًا" },
  "fatwa": { slug: "fatwa", title: "الفتاوى الشرعية", description: "إجابات على الأسئلة الفقهية والعقدية", hadith: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ" },
  "doubts": { slug: "doubts", title: "الرد على الشبهات", description: "ردود علمية منهجية على الشبهات المثارة", verse: "وَلَا يُؤُودُهُ حِفْظُهُمَا" },
  "prayer-guide": { slug: "prayer-guide", title: "تعلم الصلاة", description: "دليل عملي خطوة بخطوة", hadith: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي" },
  "embrace-islam": { slug: "embrace-islam", title: "اعتنق الإسلام", description: "رحلتك نحو الهداية والنور", verse: "أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ" },
  "dawah-guide": { slug: "dawah-guide", title: "دليل الدعاة", description: "كيف تدعو إلى الله على بصيرة", hadith: "بَلِّغُوا عَنِّي وَلَوْ آيَةً" },
  "prophets-stories": { slug: "prophets-stories", title: "قصص الأنبياء", description: "دروس وعبر من حياة الأنبياء", verse: "لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ" },
  "atheism-response": { slug: "atheism-response", title: "الرد على الإلحاد", description: "شبهات الملحدين والرد عليها" },
  "youth-issues": { slug: "youth-issues", title: "قضايا الشباب", description: "مشاكل وحلول معاصرة" },
  "khutab": { slug: "khutab", title: "مكتبة الخطب", description: "خطب جمعة جاهزة", hadith: "خَيْرُ الْحَدِيثِ كِتَابُ اللَّهِ" },
  "quran-memorization": { slug: "quran-memorization", title: "كيف تحفظ القرآن", description: "منهج عملي للحفظ", verse: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ" },
  "ruqyah": { slug: "ruqyah", title: "الرقية الشرعية", description: "آيات وأدعية للشفاء", verse: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ" },
  "hajj-guide": { slug: "hajj-guide", title: "دليل الحج والعمرة", description: "خطوة بخطوة", hadith: "خُذُوا عَنِّي مَنَاسِكَكُمْ" },
  "women-fatwas": { slug: "women-fatwas", title: "فتاوى المرأة", description: "قضايا المرأة المسلمة" },
};

const toolsData = [
  { slug: "quran", icon: "📖", title: "المصحف الكريم", desc: "اقرأ القرآن كاملاً", verse: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ", gradient: "from-green-600 to-green-700" },
  { slug: "prayer-times", icon: "🕌", title: "مواقيت الصلاة", desc: "لكل دول العالم", hadith: "الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا", gradient: "from-cyan-600 to-cyan-700" },
  { slug: "qibla", icon: "🕋", title: "تحديد القبلة", desc: "من أي مكان", verse: "فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ", gradient: "from-orange-600 to-orange-700" },
  { slug: "calendar", icon: "📅", title: "التقويم الهجري", desc: "هجري وميلادي", gradient: "from-indigo-600 to-indigo-700" },
  { slug: "zakat", icon: "💰", title: "حاسبة الزكاة", desc: "احسب زكاتك بدقة", verse: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ", gradient: "from-pink-600 to-pink-700" },
  { slug: "inheritance", icon: "📊", title: "حاسبة المواريث", desc: "قسمة التركات", gradient: "from-amber-600 to-amber-700" },
  { slug: "daily-wird", icon: "📚", title: "الورد اليومي", desc: "خطة لختم القرآن", gradient: "from-emerald-600 to-emerald-700" },
  { slug: "tasbih", icon: "📿", title: "التسبيح الرقمي", desc: "عداد تفاعلي", gradient: "from-purple-600 to-purple-700" },
  { slug: "khatm-dua", icon: "✨", title: "أدعية ختم القرآن", desc: "أدعية مأثورة", gradient: "from-rose-600 to-rose-700" },
  { slug: "bookmarks", icon: "⭐", title: "المفضلة", desc: "صفحاتك المحفوظة", gradient: "from-yellow-600 to-yellow-700" },
];

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8 mt-12 first:mt-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <h2 className="font-serif text-3xl text-primary dark:text-gold font-bold whitespace-nowrap">{children}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
      {subtitle && (
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">{subtitle}</p>
      )}
    </div>
  );
}

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

  const visibleSections = c.settings.visibleSections || [];
  const sectionConfig = c.settings.sectionConfig || {};

  const visibleCards = visibleSections
    .filter(slug => {
      const config = sectionConfig[slug];
      return config?.enabled !== false;
    })
    .map(slug => {
      const data = sectionsData[slug];
      const config = sectionConfig[slug] || {};
      if (!data) return null;
      return {
        href: `/${lang}/${slug}`,
        icon: config.icon || "star",
        title: config.customTitle || data.title,
        description: config.customDesc || data.description,
        verse: config.showVerse !== false ? data.verse : undefined,
        hadith: config.showHadith !== false ? data.hadith : undefined,
        gradient: config.gradient || "from-primary to-primary/80",
      };
    })
    .filter(Boolean);

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
            <p className="font-serif text-gold-light text-2xl mb-4">{c.settings.kicker}</p>
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

            {/* 🛠️ الأدوات الإسلامية (مباشرة في الرئيسية) */}
            <SectionTitle subtitle="أدوات عملية تعين المسلم على طاعة الله">
              🛠️ الأدوات الإسلامية
            </SectionTitle>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
              {toolsData.map((tool, i) => (
                <Link
                  key={i}
                  href={`/${lang}/${tool.slug}`}
                  className={`group relative bg-gradient-to-br ${tool.gradient} rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
                  <div className="relative">
                    <div className="text-4xl mb-2">{tool.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{tool.title}</h3>
                    <p className="text-white/90 text-sm mb-2">{tool.desc}</p>
                    {tool.verse && (
                      <p className="text-xs text-white/80 font-serif italic">﴿{tool.verse}﴾</p>
                    )}
                    {tool.hadith && (
                      <p className="text-xs text-white/80 italic">«{tool.hadith}»</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* 📚 الأقسام الدعوية */}
            <SectionTitle subtitle="استكشف محتوى الموقع الدعوي والعلمي">
              📚 أقسام الموقع
            </SectionTitle>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {visibleCards.map((card, i) => (
                <IslamicCard
                  key={i}
                  href={card!.href}
                  icon={card!.icon}
                  title={card!.title}
                  description={card!.description}
                  verse={card!.verse}
                  hadith={card!.hadith}
                  gradient={card!.gradient}
                />
              ))}
            </div>

            {/* 📱 تحميل التطبيق */}
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
                      حمّل التطبيق على موبايلك
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                      استمتع بكل محتوى الموقع في تطبيق واحد
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

        {/* 📧 النشرة البريدية */}
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