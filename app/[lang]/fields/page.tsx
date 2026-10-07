import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { getFieldTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function AllFieldsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  const count = (slug: string) =>
    c.lessons.filter((x) => x.field === slug).length +
    c.videos.filter((x) => x.field === slug).length +
    c.articles.filter((x) => x.field === slug).length +
    c.books.filter((x) => x.field === slug).length +
    c.audio.filter((x) => x.field === slug).length +
    c.photos.filter((x) => x.field === slug).length;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>📚 {tr.allSciences}</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">{tr.allSciencesDesc}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {c.fields.map((f) => {
              const ft = getFieldTranslation(f.slug, L, { name: f.name, desc: f.desc }, c.fieldTranslations);
              return (
                <Link
                  key={f.id}
                  href={`/${lang}/fields/${f.slug}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-md overflow-hidden border border-black/5 dark:border-white/10 hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-xl transition"
                >
                  <span className="absolute inset-0 pattern-gold opacity-0 group-hover:opacity-100 transition" />
                  <span className="relative inline-grid place-items-center w-16 h-16 rounded-full bg-cream-dark dark:bg-gray-700 border-2 border-gold/50 text-3xl mb-3 group-hover:scale-110 transition">
                    {f.icon}
                  </span>
                  <h2 className="relative font-serif text-xl text-primary dark:text-gold font-bold mb-1">{ft.name}</h2>
                  <p className="relative text-xs text-gray-500 dark:text-gray-400 mb-3 min-h-8">{ft.desc}</p>
                  <span className="relative inline-block bg-primary text-gold-light text-xs font-bold px-3 py-1 rounded-full">
                    {count(f.slug)} {tr.item}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}