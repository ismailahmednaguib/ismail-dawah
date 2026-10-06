import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import FieldTabs from "@/components/FieldTabs";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { getFieldTranslation } from "@/lib/translations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const c = await getContent();
  const f = c.fields.find((x) => x.slug === slug);
  if (!f) return { title: "404" };
  const ft = getFieldTranslation(slug, lang as Lang, { name: f.name, desc: f.desc }, c.fieldTranslations);
  return {
    title: ft.name,
    description: ft.desc,
    openGraph: { title: `${ft.name} | ${c.settings.shortName}`, description: ft.desc },
  };
}

export default async function FieldPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const c = await getContent();
  const tr = t(lang as Lang);
  const f = c.fields.find((x) => x.slug === slug);

  if (!f) notFound();

  const ft = getFieldTranslation(slug, lang as Lang, { name: f.name, desc: f.desc }, c.fieldTranslations);
  const byField = <T extends { field: string }>(arr: T[]) => arr.filter((x) => x.field === slug);

  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <section className="relative bg-primary text-white py-14 overflow-hidden pattern-light">
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-[11rem] opacity-10 select-none">{f.icon}</span>
          <div className="relative max-w-4xl mx-auto px-4 text-center fade-up">
            <h1 className="font-serif text-4xl md:text-5xl mb-1">{ft.name}</h1>
            <div className="ornament my-3"><span className="text-xl">✦</span></div>
            <p className="text-white/80 max-w-2xl mx-auto">{ft.desc}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.backHome} />
            <FieldTabs
              lessons={byField(c.lessons)}
              videos={byField(c.videos)}
              articles={byField(c.articles)}
              books={byField(c.books)}
              audio={byField(c.audio)}
              photos={byField(c.photos)}
              lang={lang as Lang}
            />
          </div>
        </section>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}