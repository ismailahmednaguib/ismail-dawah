import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.about}</SectionTitle>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border-t-4 border-gold">
            {c.settings.bio.map((p, i) => (
              <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">🎓 {c.settings.cred1}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">📚 {c.settings.cred2}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}