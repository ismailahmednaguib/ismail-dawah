import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldTabs from "@/components/FieldTabs";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContent();
  const f = c.fields.find((x) => x.slug === slug);
  if (!f) return { title: "العلم غير موجود" };
  return {
    title: f.name,
    description: f.desc,
    openGraph: { title: `${f.name} | ${c.settings.shortName}`, description: f.desc },
  };
}
export default async function FieldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getContent();
  const f = c.fields.find((x) => x.slug === slug);

  if (!f) {
    return (
      <>
        <Header settings={c.settings} />
        <main className="py-24 text-center text-gray-500">
          هذا العلم غير موجود — <a href="/" className="text-gold font-bold">الرئيسية</a>
        </main>
        <Footer settings={c.settings} />
      </>
    );
  }

  const byField = <T extends { field: string }>(arr: T[]) => arr.filter((x) => x.field === slug);

  return (
    <>
      <Header settings={c.settings} />
      <main className="min-h-screen bg-cream-dark">
        <section className="relative bg-primary text-white py-14 overflow-hidden pattern-light">
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-[11rem] opacity-10 select-none">{f.icon}</span>
          <div className="relative max-w-4xl mx-auto px-4 text-center fade-up">
            <a href="/" className="text-gold-light text-sm font-bold hover:underline">→ كل العلوم</a>
            <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-1">{f.name}</h1>
            <div className="ornament my-3"><span className="text-xl">✦</span></div>
            <p className="text-white/80 max-w-2xl mx-auto">{f.desc}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <FieldTabs
              lessons={byField(c.lessons)}
              videos={byField(c.videos)}
              articles={byField(c.articles)}
              books={byField(c.books)}
              audio={byField(c.audio)}
              photos={byField(c.photos)}
            />
          </div>
        </section>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}