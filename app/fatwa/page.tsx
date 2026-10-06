import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "فتاوى وأسئلة الزوار" };

export default async function FatwaPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle>فتاوى وأسئلة الزوار</SectionTitle>
          {c.fatwas.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد فتاوى بعد — تُضاف من لوحة التحكم.</p>
          ) : (
            <div className="grid gap-4">
              {c.fatwas.map((f) => (
                <details key={f.id} className="group bg-white rounded-xl shadow-md border-r-4 border-gold overflow-hidden">
                  <summary className="cursor-pointer px-6 py-4 font-bold text-primary flex justify-between items-center gap-3 list-none">
                    <span>❓ {f.q}</span>
                    <span className="text-gold group-open:rotate-180 transition shrink-0">⌄</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{f.a}</div>
                </details>
              ))}
            </div>
          )}
          <p className="text-center mt-8 text-sm text-gray-500">
            سؤالك خاص؟ <a className="text-gold font-bold" href="/contact">راسل الشيخ مباشرة</a>
          </p>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}