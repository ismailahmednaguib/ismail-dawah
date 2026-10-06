import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MapPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.mapTitle}</SectionTitle>
          {c.places.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{tr.noData}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {c.places.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-gold">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-1">🗺️ {p.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">📍 {p.area}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{p.note}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + p.area)}`}
                    target="_blank" rel="noopener"
                    className="text-gold font-bold text-sm hover:underline"
                  >
                    {tr.openMaps} ←
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