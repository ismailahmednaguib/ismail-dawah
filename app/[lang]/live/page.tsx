import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📡"
          title="البث المباشر والمجالس"
          subtitle="تابع دروس الشيخ ومجالسه الأسبوعية"
          hadith="مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ"
          gradient="from-red-600 via-red-700 to-red-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* البث المباشر */}
            {c.settings.liveUrl && (
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-3xl p-8 shadow-xl mb-10 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📡</span>
                  <h2 className="font-serif text-3xl text-white mb-3">{c.settings.liveTitle}</h2>
                  <a
                    href={c.settings.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-red-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition shadow-xl"
                  >
                    <span className="text-2xl">▶️</span>
                    <span>شاهد البث المباشر</span>
                  </a>
                </div>
              </div>
            )}

            {/* المجلس الأسبوعي */}
            <IslamicSection title="المجلس الأسبوعي" icon="🕌" subtitle="موعد ثابت كل أسبوع">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="inline-block bg-gold/20 rounded-full p-4 mb-3">
                      <span className="text-4xl">📅</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">اليوم</p>
                    <p className="font-bold text-primary dark:text-gold text-lg">{c.settings.meetingDay}</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-gold/20 rounded-full p-4 mb-3">
                      <span className="text-4xl">🕐</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">الوقت</p>
                    <p className="font-bold text-primary dark:text-gold text-lg">{c.settings.meetingTime}</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-gold/20 rounded-full p-4 mb-3">
                      <span className="text-4xl">📍</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">المكان</p>
                    <p className="font-bold text-primary dark:text-gold text-lg">{c.settings.meetingPlace}</p>
                  </div>
                </div>

                {c.settings.meetingLink && (
                  <a
                    href={c.settings.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gold text-gray-900 py-4 rounded-xl font-bold text-center hover:bg-gold-light transition"
                  >
                    🗺️ عرض الموقع على الخريطة
                  </a>
                )}
              </div>
            </IslamicSection>

            {/* جدول الدروس الأسبوعي */}
            {c.schedule.length > 0 && (
              <IslamicSection title="جدول الدروس الأسبوعي" icon="🗓️">
                <div className="grid md:grid-cols-2 gap-4">
                  {c.schedule.map((s) => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition border-r-4 border-gold">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📅</span>
                        <div>
                          <p className="font-bold text-primary dark:text-gold">{s.day}</p>
                          <p className="text-sm text-gray-500">{s.time}</p>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2">{s.topic}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">📍 {s.place}</p>
                    </div>
                  ))}
                </div>
              </IslamicSection>
            )}

            {/* آية */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <p className="font-serif text-2xl md:text-3xl text-gold leading-relaxed mb-3">
                ﴿وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ﴾
              </p>
              <p className="text-white/70">سورة الذاريات - الآية 55</p>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}