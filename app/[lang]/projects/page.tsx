import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.projectsTitle}</SectionTitle>
          {c.projects.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {c.projects.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-gold flex flex-col">
                  <h3 className="font-serif text-xl text-primary dark:text-gold mb-2">🤝 {p.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{p.desc}</p>
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">🎯 {tr.goal}: {p.goal}</div>
                  <a
                    href={`https://wa.me/${c.settings.wa}?text=${encodeURIComponent("السلام عليكم، أرغب في المشاركة في مشروع: " + p.title)}`}
                    target="_blank" rel="noopener"
                    className="block text-center bg-primary text-gold py-2.5 rounded-lg font-bold hover:opacity-90 transition"
                  >
                    {tr.participate}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}