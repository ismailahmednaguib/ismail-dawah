import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "خريطة الدروس" };

export default async function MapPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          <SectionTitle>خريطة الدروس والمجالس</SectionTitle>
          {c.places.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد أماكن مضافة بعد.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {c.places.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-gold">
                  <h3 className="font-bold text-primary text-lg mb-1">🗺️ {p.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">📍 {p.area}</p>
                  <p className="text-sm text-gray-600 mb-4">{p.note}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + p.area)}`}
                    target="_blank" rel="noopener"
                    className="text-gold font-bold text-sm hover:underline"
                  >
                    افتح على خرائط جوجل ←
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}