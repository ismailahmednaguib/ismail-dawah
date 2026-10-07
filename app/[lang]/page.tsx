import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import IslamicCard from "@/components/IslamicCard";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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
      {/* زخرفة */}
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

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        
        {/* قسم البطل */}
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

            {/* 📚 العلوم الشرعية */}
            <SectionTitle subtitle="منهج علمي متكامل على فهم سلف الأمة">
              📚 {tr.sciences}
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <IslamicCard
                href={`/${lang}/fields`}
                icon="knowledge"
                title={tr.allSciences}
                description="سبعة عشر علماً شرعياً مترجماً إلى ثلاث عشرة لغة، من العقيدة إلى الفقه والأصول"
                verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
                badge={`${c.fields.length} ${tr.item}`}
                gradient="from-emerald-600 to-emerald-700"
              />
            </div>

            {/* 📢 الأقسام الدعوية */}
            <SectionTitle subtitle="نشر العلم والدعوة إلى الله على بصيرة">
              📢 الأقسام الدعوية
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <IslamicCard
                href={`/${lang}/fatwa`}
                icon="fatwa"
                title="الفتاوى الشرعية"
                description="إجابات على الأسئلة الفقهية والعقدية من مصادر موثوقة"
                hadith="مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ"
                badge={`${c.fatwas.length} فتوى`}
                gradient="from-blue-600 to-blue-700"
              />
              
              <IslamicCard
                href={`/${lang}/doubts`}
                icon="light"
                title="الرد على الشبهات"
                description="ردود علمية منهجية على الشبهات المثارة حول الإسلام"
                verse="وَلَا يُؤُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ"
                badge={`${c.doubts.length} شبهة`}
                gradient="from-purple-600 to-purple-700"
              />
              
              <IslamicCard
                href={`/${lang}/prayer-guide`}
                icon="prayer"
                title="تعلم الصلاة"
                description="دليل عملي خطوة بخطوة لتعلم الصلاة الصحيحة"
                hadith="صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي"
                gradient="from-teal-600 to-teal-700"
              />
              
              <IslamicCard
                href={`/${lang}/embrace-islam`}
                icon="heart"
                title="اعتنق الإسلام"
                description="رحلتك نحو الهداية والنور"
                verse="أَفَغَيْرَ دِينِ اللَّهِ يَبْغُونَ"
                gradient="from-rose-600 to-rose-700"
              />
              
              <IslamicCard
                href={`/${lang}/dawah-guide`}
                icon="mosque"
                title="دليل الدعاة"
                description="كيف تدعو إلى الله على بصيرة وحكمة"
                hadith="بَلِّغُوا عَنِّي وَلَوْ آيَةً"
                gradient="from-amber-600 to-amber-700"
              />
              
              <IslamicCard
                href={`/${lang}/prophets-stories`}
                icon="star"
                title="قصص الأنبياء"
                description="دروس وعبر من حياة أنبياء الله ورسله"
                verse="لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ"
                gradient="from-indigo-600 to-indigo-700"
              />
            </div>

            {/* 🛠️ الأدوات الإسلامية */}
            <SectionTitle subtitle="أدوات عملية تعين المسلم على طاعة الله">
              🛠️ الأدوات الإسلامية
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <IslamicCard
                href={`/${lang}/quran`}
                icon="quran"
                title="المصحف الكريم"
                description="اقرأ القرآن الكريم كاملاً برواية حفص عن عاصم"
                verse="إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
                gradient="from-green-600 to-green-700"
              />
              
              <IslamicCard
                href={`/${lang}/prayer-times`}
                icon="mosque"
                title="مواقيت الصلاة"
                description="مواقيت دقيقة لكل دول العالم"
                hadith="إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"
                gradient="from-cyan-600 to-cyan-700"
              />
              
              <IslamicCard
                href={`/${lang}/qibla`}
                icon="kaaba"
                title="تحديد القبلة"
                description="اتجاه القبلة من أي مكان في العالم"
                verse="فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ"
                gradient="from-orange-600 to-orange-700"
              />
              
              <IslamicCard
                href={`/${lang}/zakat`}
                icon="heart"
                title="حاسبة الزكاة"
                description="احسب زكاة أموالك بدقة"
                verse="وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ"
                gradient="from-pink-600 to-pink-700"
              />
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
                      استمتع بكل محتوى الموقع في تطبيق واحد — المصحف، المواقيت، الأذكار، والدروس
                    </p>
                    
                    <div className="flex flex-wrap gap-4 justify-center mb-8">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                        <span className="text-gold">✓</span>
                        <span className="text-sm">يعمل بدون إنترنت</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                        <span className="text-gold">✓</span>
                        <span className="text-sm">إشعارات فورية</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                        <span className="text-gold">✓</span>
                        <span className="text-sm">مجاني تماماً</span>
                      </div>
                    </div>

                    <a
                      href={c.settings.appUrl}
                      download
                      className="inline-flex items-center gap-3 bg-gold text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gold-light hover:scale-105 transition shadow-xl"
                    >
                      <span className="text-2xl">⬇️</span>
                      <span>تحميل التطبيق الآن</span>
                    </a>

                    <p className="text-white/60 text-xs mt-4">
                      📦 ملف APK — متوافق مع جميع أجهزة أندرويد
                    </p>
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