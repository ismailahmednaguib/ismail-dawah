import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "المقالات" };

export default async function ArticlesPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <SectionTitle>المقالات</SectionTitle>
          {!c.settings.showArticles ? (
            <p className="text-center text-gray-500">القسم غير متاح حاليًا</p>
          ) : (
            <div className="grid gap-6">
              {c.articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="bg-white rounded-xl p-6 shadow-md border-t-4 border-gold hover:-translate-y-1 transition block">
                  <div className="text-xs text-gray-400 mb-2">📅 {a.date}</div>
                  <h3 className="font-serif text-2xl text-primary mb-3">{a.title}</h3>
                  <p className="text-gray-600 text-sm">{a.excerpt}</p>
                  <span className="text-gold font-bold text-sm mt-3 inline-block">اقرأ المقال ←</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}