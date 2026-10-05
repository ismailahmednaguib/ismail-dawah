import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LessonCard, SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const c = await getContent();

  return (
    <>
      <Header settings={c.settings} />
      <main>
        <section className="relative bg-primary text-white py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.15),transparent_70%)]" />
          <div className="relative max-w-4xl mx-auto px-4">
            <p className="font-serif text-gold-light text-xl mb-4">{c.settings.kicker}</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-4 leading-snug">{c.settings.ownerName}</h1>
            <p className="text-lg text-white/80 mb-6">{c.settings.jobTitle}</p>
            <p className="font-serif text-2xl text-gold italic mb-8">{c.settings.motto}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/lessons" className="bg-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-light transition">
                تصفَّح الدروس
              </Link>
              <Link href="/contact" className="border-2 border-gold text-gold px-8 py-3 rounded-lg font-bold hover:bg-gold hover:text-gray-900 transition">
                تواصل معي
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-primary-light text-white py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {c.stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-5xl text-gold mb-2">{s.num}</div>
                <div className="text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-cream-dark">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle>أحدث الدروس</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.lessons.slice(0, 3).map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/lessons" className="inline-block border-2 border-gold text-gold px-8 py-3 rounded-lg font-bold hover:bg-gold hover:text-gray-900 transition">
                عرض كل الدروس ←
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}