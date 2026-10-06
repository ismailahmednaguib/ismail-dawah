import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.contact}</SectionTitle>
          <div className="grid gap-4">
            <a href={`https://wa.me/${c.settings.wa}`} target="_blank" rel="noopener" className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-r-4 border-gold flex items-center gap-4 hover:shadow-lg transition">
              <span className="text-2xl">💬</span>
              <span>
                <div className="font-bold text-primary dark:text-white">WhatsApp</div>
                <div className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">+{c.settings.wa}</div>
              </span>
            </a>
            <a href={`mailto:${c.settings.email}`} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-r-4 border-gold flex items-center gap-4 hover:shadow-lg transition">
              <span className="text-2xl">✉️</span>
              <span>
                <div className="font-bold text-primary dark:text-white">Email</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{c.settings.email}</div>
              </span>
            </a>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-r-4 border-gold flex items-center gap-4">
              <span className="text-2xl">📍</span>
              <span>
                <div className="font-bold text-primary dark:text-white">{c.settings.address}</div>
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}