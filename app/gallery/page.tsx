import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "معرض الصور" };

export default async function GalleryPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20 bg-cream-dark">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle>معرض الصور</SectionTitle>
          {!c.settings.showGallery ? (
            <p className="text-center text-gray-500">القسم غير متاح حاليًا</p>
          ) : c.photos.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد صور بعد — ارفعها من لوحة التحكم ← 🖼️ الصور</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {c.photos.map((p) => (
                <figure key={p.id} className="relative group overflow-hidden rounded-xl shadow-md">
                  <img src={p.url} alt={p.caption} className="w-full h-56 object-cover group-hover:scale-105 transition duration-500" />
                  {p.caption && (
                    <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-sm p-3">{p.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}