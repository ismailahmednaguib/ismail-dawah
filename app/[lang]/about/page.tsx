import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="👤"
          title="عن الشيخ"
          subtitle={c.settings.jobTitle}
          verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          verseSource="سورة طه - الآية 114"
          gradient="from-emerald-600 via-emerald-700 to-emerald-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* البطاقة الشخصية */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg mb-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {c.settings.portraitSrc && (
                  <div className="flex-shrink-0">
                    <img
                      src={c.settings.portraitSrc}
                      alt={c.settings.ownerName}
                      className="w-48 h-48 rounded-full object-cover border-4 border-gold shadow-xl"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-right">
                  <h1 className="font-serif text-4xl text-primary dark:text-gold mb-2">
                    {c.settings.ownerName}
                  </h1>
                  <p className="text-gold font-bold text-lg mb-4">{c.settings.jobTitle}</p>
                  <p className="font-serif text-xl text-primary dark:text-gold italic">
                    {c.settings.motto}
                  </p>
                </div>
              </div>
            </div>

            {/* النبذة */}
            <IslamicSection title="النبذة" icon="📝" subtitle="تعرف على مسيرة الشيخ العلمية والدعوية">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-4">
                {c.settings.bio.map((para, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </IslamicSection>

            {/* الشهادات */}
            {(c.settings.cred1 || c.settings.cred2) && (
              <IslamicSection title="الشهادات العلمية" icon="🎓">
                <div className="grid md:grid-cols-2 gap-4">
                  {c.settings.cred1 && (
                    <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6 shadow-lg">
                      <div className="inline-block bg-gold/20 rounded-full p-3 mb-3">
                        <span className="text-3xl">🎓</span>
                      </div>
                      <p className="text-white/90 leading-relaxed">{c.settings.cred1}</p>
                    </div>
                  )}
                  {c.settings.cred2 && (
                    <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6 shadow-lg">
                      <div className="inline-block bg-gold/20 rounded-full p-3 mb-3">
                        <span className="text-3xl">📚</span>
                      </div>
                      <p className="text-white/90 leading-relaxed">{c.settings.cred2}</p>
                    </div>
                  )}
                </div>
              </IslamicSection>
            )}

            {/* الاهتمامات */}
            {c.settings.interests.length > 0 && (
              <IslamicSection title="مجالات الاهتمام" icon="💎">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {c.settings.interests.map((interest, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition hover:-translate-y-1 border-t-2 border-gold">
                      <p className="text-primary dark:text-gold font-bold">{interest}</p>
                    </div>
                  ))}
                </div>
              </IslamicSection>
            )}

            {/* الإحصائيات */}
            <IslamicSection title="إحصائيات" icon="📊">
              <div className="grid grid-cols-3 gap-4">
                {c.stats.map((s, i) => (
                  <div key={i} className="bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold rounded-2xl p-6 text-center">
                    <p className="font-serif text-4xl text-primary dark:text-gold font-bold mb-2">
                      {s.num}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </IslamicSection>

            {/* آية ختامية */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <p className="font-serif text-2xl md:text-3xl text-gold leading-relaxed mb-3">
                ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ﴾
              </p>
              <p className="text-white/70">سورة هود - الآية 88</p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}