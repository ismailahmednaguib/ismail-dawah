import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "عن الشيخ" };

export default async function AboutPage() {
  const c = await getContent();

  return (
    <>
      <Header settings={c.settings} />
      <main className="bg-cream-dark min-h-screen">
        <section className="relative bg-primary text-white py-14 text-center overflow-hidden pattern-light">
          <div className="relative max-w-3xl mx-auto px-4 fade-up">
            <h1 className="font-serif text-4xl md:text-5xl mb-2">عن الشيخ</h1>
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
                <p key={i} className="text-gray-600 text-lg leading-relaxed mb-4">{p}</p>
              ))}
              <div className="grid gap-3 mt-6">
                <div className="bg-white rounded-xl px-5 py-4 font-semibold shadow-md border-r-4 border-gold">🎓 {c.settings.cred1}</div>
                <div className="bg-white rounded-xl px-5 py-4 font-semibold shadow-md border-r-4 border-gold">📜 {c.settings.cred2}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {c.settings.interests.map((i) => (
                  <span key={i} className="bg-primary text-gold-light px-4 py-1.5 rounded-full text-sm font-semibold">{i}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {c.stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-8 shadow-md border-b-4 border-gold">
                <div className="font-serif text-5xl text-gold mb-2">{s.num}</div>
                <div className="text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}