import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VideoCard, SectionTitle } from "@/components/Cards";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "المرئيات" };

export default async function VideosPage() {
  const c = await getContent();

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle>المرئيات والمحاضرات</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}