import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "أخبار ونشاطات" };

export default async function NewsPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href="/" label="العودة للرئيسية" />
          <SectionTitle>أخبار ونشاطات الشيخ</SectionTitle>
          {c.news.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">لا توجد أخبار بعد.</p>
          ) : (
            <div className="grid gap-5">
              {c.news.map((n) => (
                <article key={n.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-gold">
                  <div className="text-xs text-gray-400 mb-2">📅 {n.date}</div>
                  <h3 className="font-serif text-xl text-primary dark:text-gold mb-3">📰 {n.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed">{n.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}