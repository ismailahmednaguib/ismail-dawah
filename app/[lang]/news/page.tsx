import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.newsTitle}</SectionTitle>
          {c.news.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="grid gap-5">
              {c.news.map((n) => (
                <article key={n.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-gold">
                  <div className="text-xs text-gray-400 mb-2">📅 {n.date}</div>
                  <h3 className="font-serif text-xl text-primary dark:text-gold mb-3">📰 {n.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed">{n.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}