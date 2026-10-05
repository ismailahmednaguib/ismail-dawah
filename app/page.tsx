import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const c = await getContent();

  const count = (slug: string) =>
    c.lessons.filter((x) => x.field === slug).length +
    c.videos.filter((x) => x.field === slug).length +
    c.articles.filter((x) => x.field === slug).length +
    c.books.filter((x) => x.field === slug).length +
    c.audio.filter((x) => x.field === slug).length +
    c.photos.filter((x) => x.field === slug).length;

  const box = "group bg-white rounded-2xl p-6 text-center shadow-md border-b-4 border-gold hover:-translate-y-1.5 hover:shadow-xl transition block";

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="font-serif text-gold text-xl mb-2">{c.settings.kicker}</p>
            <h1 className="font-serif text-4xl md:text-5xl text-primary mb-3 leading-snug">{c.settings.ownerName}</h1>
            <p className="text-gray-600">{c.settings.motto}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {c.fields.map((f) => (
              <Link key={f.id} href={`/fields/${f.slug}`} className={box}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h2 className="font-serif text-xl text-primary font-bold mb-1">{f.name}</h2>
                <p className="text-xs text-gray-500 mb-3">{f.desc}</p>
                <span className="inline-block bg-cream-dark text-primary text-xs font-bold px-3 py-1 rounded-full">{count(f.slug)} مادة</span>
              </Link>
            ))}

            <Link href="/about" className={box}>
              <div className="text-4xl mb-3">👤</div>
              <h2 className="font-serif text-xl text-primary font-bold mb-1">عن الشيخ</h2>
              <p className="text-xs text-gray-500 mb-3">السيرة والمؤهلات والمنهج الدعوي</p>
              <span className="inline-block bg-cream-dark text-primary text-xs font-bold px-3 py-1 rounded-full">تعرف عليّ</span>
            </Link>

            <Link href="/contact" className={box}>
              <div className="text-4xl mb-3">💬</div>
              <h2 className="font-serif text-xl text-primary font-bold mb-1">تواصل معي</h2>
              <p className="text-xs text-gray-500 mb-3">واتساب وبريد وجدول الدروس</p>
              <span className="inline-block bg-cream-dark text-primary text-xs font-bold px-3 py-1 rounded-full">راسلني</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}