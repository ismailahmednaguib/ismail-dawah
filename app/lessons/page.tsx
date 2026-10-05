import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LessonCard, SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "الدروس" };

export default async function LessonsPage() {
  const c = await getContent();
  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20 bg-cream-dark">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle>الدروس والمحاضرات</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.lessons.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}