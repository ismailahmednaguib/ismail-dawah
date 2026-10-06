import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);

  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="bg-cream-dark dark:bg-gray-900 min-h-screen">
        <section className="relative bg-primary text-white py-14 text-center overflow-hidden pattern-light">
          <div className="relative max-w-3xl mx-auto px-4 fade-up">
            <h1 className="font-serif text-4xl md:text-5xl mb-2">{tr.aboutMe}</h1>
            <div className="ornament my-3"><span className="text-xl">✦</span></div>
            <p className="text-white/80">{c.settings.jobTitle}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-[1fr_1.7fr] gap-10 items-start">
            <div className="relative">
              <div className="absolute -inset-3 pattern-gold rounded-3xl" />
              <div className="relative aspect-[3/4] rounded-2xl border-4 border-gold bg-primary-light grid place-items-center overflow-hidden">
                {c.settings.portraitSrc ? (
                  <img src={c.settings.portraitSrc} alt={c.settings.ownerName} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="font-serif text-9xl text-gold/30">إ</span>
                )}
              </div>
            </div>
            <div>
              {c.settings.bio.map((p, i) => (
                <p key={i} className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">{p}</p>
              ))}
              <div className="grid gap-3 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-4 font-semibold shadow-md border-r-4 border-gold">🎓 {c.settings.cred1}</div>
                <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-4 font-semibold shadow-md border-r-4 border-gold">📜 {c.settings.cred2}</div>
              </div>
              <div className="mt-6">
                <h3 className="font-bold text-primary dark:text-gold mb-3">{tr.myInterests}</h3>
                <div className="flex flex-wrap gap-2">
                  {c.settings.interests.map((i) => (
                    <span key={i} className="bg-primary text-gold-light px-4 py-1.5 rounded-full text-sm font-semibold">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {c.stats.length > 0 && (
          <section className="pb-16">
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {c.stats.map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border-b-4 border-gold">
                  <div className="font-serif text-5xl text-gold mb-2">{s.num}</div>
                  <div className="text-gray-600 dark:text-gray-300">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}