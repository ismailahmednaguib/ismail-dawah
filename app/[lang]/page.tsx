import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function Box({ href, icon, title, desc, badge, delay }: { href: string; icon: string; title: string; desc: string; badge: string; delay: number }) {
  return (
    <Link href={href} style={{ animationDelay: `${delay}ms` }}
      className="fade-up group relative bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-md overflow-hidden border border-black/5 dark:border-white/10 hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-xl transition block">
      <span className="absolute inset-0 pattern-gold opacity-0 group-hover:opacity-100 transition" />
      <span className="relative inline-grid place-items-center w-16 h-16 rounded-full bg-cream-dark dark:bg-gray-700 border-2 border-gold/50 text-3xl mb-3 group-hover:scale-110 transition">{icon}</span>
      <h2 className="relative font-serif text-xl text-primary dark:text-gold font-bold mb-1">{title}</h2>
      <p className="relative text-xs text-gray-500 dark:text-gray-400 mb-3 min-h-8">{desc}</p>
      <span className="relative inline-block bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">{badge}</span>
    </Link>
  );
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);

  const count = (slug: string) =>
    c.lessons.filter((x) => x.field === slug).length +
    c.videos.filter((x) => x.field === slug).length +
    c.articles.filter((x) => x.field === slug).length +
    c.books.filter((x) => x.field === slug).length +
    c.audio.filter((x) => x.field === slug).length +
    c.photos.filter((x) => x.field === slug).length;

  let d = 0;
  const next = () => (d++ * 50);

  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
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
              {c.fields.map((f) => (
                <Box key={f.id} href={`/${lang}/fields/${f.slug}`} icon={f.icon} title={f.name} desc={f.desc} badge={`${count(f.slug)} ${tr.item}`} delay={next()} />
              ))}
              <Box href={`/${lang}/fatwa`} icon="❓" title={tr.boxFatwaTitle} desc={tr.boxFatwaDesc} badge={`${c.fatwas.length} ${tr.fatwa}`} delay={next()} />
              <Box href={`/${lang}/live`} icon="📡" title={tr.boxLiveTitle} desc={tr.boxLiveDesc} badge={tr.followUs} delay={next()} />
              <Box href={`/${lang}/projects`} icon="🤝" title={tr.boxProjectsTitle} desc={tr.boxProjectsDesc} badge={`${c.projects.length} ${tr.project}`} delay={next()} />
              <Box href={`/${lang}/news`} icon="📰" title={tr.boxNewsTitle} desc={tr.boxNewsDesc} badge={`${c.news.length} ${tr.newsItem}`} delay={next()} />
              <Box href={`/${lang}/map`} icon="🗺️" title={tr.boxMapTitle} desc={tr.boxMapDesc} badge={`${c.places.length} ${tr.place}`} delay={next()} />
              <Box href={`/${lang}/adhkar`} icon="🤲" title={tr.boxAdhkarTitle} desc={tr.boxAdhkarDesc} badge={tr.yourDailyWird} delay={next()} />
              <Box href={`/${lang}/about`} icon="👤" title={tr.boxAboutTitle} desc={tr.boxAboutDesc} badge={tr.knowMe} delay={next()} />
              <Box href={`/${lang}/contact`} icon="💬" title={tr.boxContactTitle} desc={tr.boxContactDesc} badge={tr.messageMe} delay={next()} />
            </div>
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}