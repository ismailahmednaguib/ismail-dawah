import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const L = lang as Lang;

  const sorted = [...c.learnSteps].sort((a, b) => a.order - b.order);

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.learn}</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">{tr.learnDesc}</p>

          {sorted.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="space-y-4">
              {sorted.map((s) => {
                const title = s.t?.[L]?.title || s.title;
                const desc = s.t?.[L]?.desc || s.desc;
                return (
                  <Link
                    key={s.id}
                    href={`/${lang}/fields/${s.field}`}
                    className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-transparent hover:border-gold hover:shadow-lg transition"
                  >
                    <span className="flex-shrink-0 w-12 h-12 bg-primary text-gold rounded-full grid place-items-center font-black text-xl">
                      {s.order}
                    </span>
                    <div>
                      <h3 className="font-bold text-primary dark:text-white text-lg">{title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{desc}</p>
                      <span className="inline-block mt-2 text-gold text-sm font-bold">{tr.readMore} ←</span>
                    </div>
                  </Link>
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