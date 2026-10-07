import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import ShareButtons from "@/components/ShareButtons";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DoubtsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.doubts}</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{tr.doubtsDesc}</p>

          {c.doubts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="grid gap-5">
              {c.doubts.map((d) => {
                const q = d.t?.[L]?.q || d.q;
                const a = d.t?.[L]?.a || d.a;
                return (
                  <div key={d.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-r-4 border-gold">
                    <span className="inline-block bg-primary/10 text-primary dark:text-gold text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {d.category}
                    </span>
                    <h3 className="font-bold text-primary dark:text-white text-lg mb-3">❓ {q}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{a}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <ShareButtons title={q} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}