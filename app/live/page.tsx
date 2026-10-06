import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "البث والمجالس" };

export default async function LivePage() {
  const c = await getContent();
  const s = c.settings;
  const yt = s.liveUrl.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1] || "";

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton href="/" label="العودة للرئيسية" />
          <SectionTitle>البث والمجالس</SectionTitle>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-t-4 border-gold mb-6 text-center">
            <h3 className="font-serif text-2xl text-primary dark:text-gold mb-4">📡 {s.liveTitle || "البث المباشر"}</h3>
            {yt ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe src={`https://www.youtube.com/embed/${yt}`} className="w-full h-full" allowFullScreen title="البث المباشر" />
              </div>
            ) : s.liveUrl ? (
              <a href={s.liveUrl} target="_blank" rel="noopener" className="inline-block bg-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-light transition">افتح البث على يوتيوب</a>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">لا يوجد بث حاليًا — يُعلن عن البث عبر صفحات الشيخ.</p>
            )}
          </div>

          <div className="bg-primary text-white rounded-2xl p-8 pattern-light text-center">
            <h3 className="font-serif text-2xl text-gold mb-4">🕌 المجلس الأسبوعي</h3>
            {s.meetingDay ? (
              <p className="text-lg leading-relaxed">
                {s.meetingDay} — {s.meetingTime}
                <br />
                <span className="text-white/70 text-sm">📍 {s.meetingPlace}</span>
              </p>
            ) : (
              <p className="text-white/70">يُعلن موعد المجلس لاحقًا.</p>
            )}
            {s.meetingLink && (
              <a href={s.meetingLink} target="_blank" rel="noopener" className="inline-block mt-5 border-2 border-gold text-gold px-6 py-2 rounded-lg font-bold hover:bg-gold hover:text-gray-900 transition">
                🗺️ مكان المجلس على الخريطة
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}