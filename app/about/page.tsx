import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "عن الشيخ" };

export default async function AboutPage() {
  const c = await getContent();

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle>عن الشيخ</SectionTitle>
          <div className="grid md:grid-cols-[1fr_1.6fr] gap-10 items-center">
            <div className="relative aspect-[3/4] rounded-xl border-4 border-gold bg-primary-light grid place-items-center overflow-hidden">
              {c.settings.portraitSrc ? (
                <img src={c.settings.portraitSrc} alt={c.settings.ownerName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-9xl text-gold/30">إ</span>
              )}
            </div>
            <div>
              {c.settings.bio.map((p, i) => (
                <p key={i} className="text-gray-600 text-lg leading-relaxed mb-4">{p}</p>
              ))}
              <div className="grid gap-3 mt-6">
                <div className="bg-cream-dark rounded-lg px-4 py-3 font-semibold">🎓 {c.settings.cred1}</div>
                <div className="bg-cream-dark rounded-lg px-4 py-3 font-semibold">📜 {c.settings.cred2}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {c.settings.interests.map((i) => (
                  <span key={i} className="bg-primary text-gold-light px-4 py-1 rounded-full text-sm font-semibold">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}