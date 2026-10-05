import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FieldTabs from "@/components/FieldTabs";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

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
      <main className="py-16 bg-cream-dark min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-5xl mb-3">{f.icon}</div>
            <h1 className="font-serif text-4xl text-primary mb-2">{f.name}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{f.desc}</p>
            <a href="/" className="inline-block mt-4 text-sm text-gold font-bold hover:underline">→ كل العلوم</a>
          </div>
          <FieldTabs
            lessons={byField(c.lessons)}
            videos={byField(c.videos)}
            articles={byField(c.articles)}
            books={byField(c.books)}
            audio={byField(c.audio)}
            photos={byField(c.photos)}
          />
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}