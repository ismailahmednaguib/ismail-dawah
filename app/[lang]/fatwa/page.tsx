import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function FatwaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.fatwaTitle}</SectionTitle>
          {c.fatwas.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="grid gap-4">
              {c.fatwas.map((f) => (
                <details key={f.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-md border-r-4 border-gold overflow-hidden">
                  <summary className="cursor-pointer px-6 py-4 font-bold text-primary dark:text-white flex justify-between items-center gap-3 list-none">
                    <span>❓ {f.q}</span>
                    <span className="text-gold group-open:rotate-180 transition shrink-0">⌄</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">{f.a}</div>
                </details>
              ))}
            </div>
          )}
          <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            {tr.askPrivate.split("?")[0]}؟ <a className="text-gold font-bold" href={`/${lang}/contact`}>{tr.askPrivate.split("?")[1]?.trim() || tr.messageMe}</a>
          </p>
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}