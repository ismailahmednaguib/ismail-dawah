import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ScheduleRow, SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "جدول الدروس" };

export default async function SchedulePage() {
  const c = await getContent();

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20 bg-cream-dark">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle>جدول الدروس الأسبوعي</SectionTitle>
          <div className="grid gap-4">
            {c.schedule.map((s) => (
              <ScheduleRow key={s.id} item={s} />
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            ✦ أي تغيير في الجدول بيتم إعلانه عبر صفحات الشيخ الرسمية
          </p>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}