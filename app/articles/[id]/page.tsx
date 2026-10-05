import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getContent();
  const a = c.articles.find((x) => String(x.id) === id);

  if (!a) {
    return (
      <>
        <Header settings={c.settings} />
        <main className="py-24 text-center text-gray-500">المقال غير موجود</main>
        <Footer settings={c.settings} />
      </>
    );
  }

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16">
        <article className="max-w-3xl mx-auto px-4">
          <div className="text-sm text-gray-400 mb-3">📅 {a.date}</div>
          <h1 className="font-serif text-4xl text-primary mb-6 leading-snug">{a.title}</h1>
          <div className="bg-white rounded-xl p-8 shadow-md leading-loose text-lg text-gray-700">
            {a.body.split("\n\n").map((p, i) => (
              <p key={i} className="mb-5">{p}</p>
            ))}
          </div>
          <div className="mt-10">
            <p className="text-center font-bold mb-3 text-primary">شارك المقال:</p>
            <ShareButtons title={a.title} />
          </div>
        </article>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}