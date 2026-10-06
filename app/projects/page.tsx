import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "مشاريع دعوية" };

export default async function ProjectsPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <BackButton href="/" label="العودة للرئيسية" />
          <SectionTitle>مشاريع دعوية — شارك في الأجر</SectionTitle>
          {c.projects.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">لا توجد مشاريع حاليًا.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {c.projects.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-gold flex flex-col">
                  <h3 className="font-serif text-xl text-primary dark:text-gold mb-2">🤝 {p.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{p.desc}</p>
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">🎯 الهدف: {p.goal}</div>
                  <a
                    href={`https://wa.me/${c.settings.wa}?text=${encodeURIComponent("السلام عليكم، أرغب في المشاركة في مشروع: " + p.title)}`}
                    target="_blank" rel="noopener"
                    className="block text-center bg-primary text-gold py-2.5 rounded-lg font-bold hover:opacity-90 transition"
                  >
                    شارك في الأجر
                  </a>
                </div>
              ))}
            </div>
          )}
          <p className="text-center mt-10 font-serif text-lg text-gray-500 dark:text-gray-400">
            «مَنْ جَهَّزَ غَازِيًا فِي سَبِيلِ اللَّهِ فَقَدْ غَزَا» متفق عليه
          </p>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}