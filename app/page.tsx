import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

function Box({ href, icon, title, desc, badge, delay }: { href: string; icon: string; title: string; desc: string; badge: string; delay: number }) {
  return (
    <Link href={href} style={{ animationDelay: `${delay}ms` }}
      className="fade-up group relative bg-white rounded-2xl p-6 text-center shadow-md overflow-hidden border border-black/5 hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-xl transition block">
      <span className="absolute inset-0 pattern-gold opacity-0 group-hover:opacity-100 transition" />
      <span className="relative inline-grid place-items-center w-16 h-16 rounded-full bg-cream-dark border-2 border-gold/50 text-3xl mb-3 group-hover:scale-110 transition">{icon}</span>
      <h2 className="relative font-serif text-xl text-primary font-bold mb-1">{title}</h2>
      <p className="relative text-xs text-gray-500 mb-3 min-h-8">{desc}</p>
      <span className="relative inline-block bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">{badge}</span>
    </Link>
  );
}

export default async function Home() {
  const c = await getContent();

  const count = (slug: string) =>
    c.lessons.filter((x) => x.field === slug).length +
    c.videos.filter((x) => x.field === slug).length +
    c.articles.filter((x) => x.field === slug).length +
    c.books.filter((x) => x.field === slug).length +
    c.audio.filter((x) => x.field === slug).length +
    c.photos.filter((x) => x.field === slug).length;

  return (
    <>
      <Header settings={c.settings} />
      <main className="min-h-screen bg-cream-dark">
        <section className="relative bg-primary text-white py-16 text-center overflow-hidden pattern-light">
          <div className="relative max-w-3xl mx-auto px-4 fade-up">
            <p className="font-serif text-gold-light text-xl mb-3">{c.settings.kicker}</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-2 leading-snug">{c.settings.ownerName}</h1>
            <div className="ornament my-4"><span className="text-2xl">✦</span></div>
            <p className="text-white/80">{c.settings.motto}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {c.fields.map((f, i) => (
                <Box key={f.id} href={`/fields/${f.slug}`} icon={f.icon} title={f.name} desc={f.desc} badge={`${count(f.slug)} مادة`} delay={i * 60} />
              ))}
              <Box href="/about" icon="👤" title="عن الشيخ" desc="السيرة والمؤهلات والمنهج الدعوي" badge="تعرف عليّ" delay={c.fields.length * 60} />
              <Box href="/contact" icon="💬" title="تواصل معي" desc="واتساب وبريد وجدول الدروس" badge="راسلني" delay={(c.fields.length + 1) * 60} />
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}