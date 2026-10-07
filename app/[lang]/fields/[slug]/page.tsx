import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { getFieldTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function FieldPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const c = await getContent();
  const L = lang as Lang;
  const tr = t(L);

  const field = c.fields.find((f) => f.slug === slug);
  if (!field) {
    return (
      <>
        <Header settings={c.settings} lang={L} />
        <main className="py-24 text-center text-gray-500">العلم غير موجود</main>
        <Footer settings={c.settings} lang={L} />
      </>
    );
  }

  const ft = getFieldTranslation(slug, L, { name: field.name, desc: field.desc }, c.fieldTranslations);

  const lessons = c.lessons.filter((x) => x.field === slug);
  const videos = c.videos.filter((x) => x.field === slug);
  const articles = c.articles.filter((x) => x.field === slug);
  const books = c.books.filter((x) => x.field === slug);
  const audio = c.audio.filter((x) => x.field === slug);
  const photos = c.photos.filter((x) => x.field === slug);

  const totalItems = lessons.length + videos.length + articles.length + books.length + audio.length + photos.length;

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        {/* Hero */}
        <PageHero
          icon={field.icon}
          title={ft.name}
          subtitle={ft.desc}
          verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          verseSource="سورة طه - الآية 114"
        />

        {/* إحصائيات سريعة */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{lessons.length}</p>
                <p className="text-xs text-gray-500 mt-1">📖 درس</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{videos.length}</p>
                <p className="text-xs text-gray-500 mt-1">🎬 فيديو</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{articles.length}</p>
                <p className="text-xs text-gray-500 mt-1">✍️ مقال</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{books.length}</p>
                <p className="text-xs text-gray-500 mt-1">📚 كتاب</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{audio.length}</p>
                <p className="text-xs text-gray-500 mt-1">🎧 صوتية</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary dark:text-gold">{photos.length}</p>
                <p className="text-xs text-gray-500 mt-1">🖼️ صورة</p>
              </div>
            </div>
          </div>
        </section>

        {/* الدروس */}
        {lessons.length > 0 && (
          <IslamicSection title="الدروس" icon="📖" subtitle={`${lessons.length} درس في ${ft.name}`}>
            <div className="grid md:grid-cols-2 gap-4">
              {lessons.map((l) => (
                <div key={l.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition border-r-4 border-gold">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">{l.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{l.desc}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-cream-dark dark:bg-gray-700 px-2 py-1 rounded">{l.category}</span>
                    <span className="text-gray-500">{l.date}</span>
                  </div>
                  {l.link && (
                    <a href={l.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-gold font-bold text-sm hover:underline">
                      شاهد الدرس ←
                    </a>
                  )}
                </div>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* الفيديوهات */}
        {videos.length > 0 && (
          <IslamicSection title="الفيديوهات" icon="🎬" subtitle={`${videos.length} فيديو`}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary to-primary/80 rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition">
                    <span className="text-6xl">▶️</span>
                  </div>
                  <h3 className="font-bold text-primary dark:text-gold mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{v.desc}</p>
                </a>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* المقالات */}
        {articles.length > 0 && (
          <IslamicSection title="المقالات" icon="✍️" subtitle={`${articles.length} مقال`}>
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map((a) => (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition">
                  <h3 className="font-bold text-primary dark:text-gold text-lg mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{a.excerpt}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* الكتب */}
        {books.length > 0 && (
          <IslamicSection title="الكتب" icon="📚" subtitle={`${books.length} كتاب`}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition group"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition">
                    <span className="text-6xl">📚</span>
                  </div>
                  <h3 className="font-bold text-primary dark:text-gold mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{b.desc}</p>
                </a>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* الصوتيات */}
        {audio.length > 0 && (
          <IslamicSection title="الصوتيات" icon="🎧" subtitle={`${audio.length} مقطع`}>
            <div className="grid md:grid-cols-2 gap-4">
              {audio.map((a) => (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
                  <h3 className="font-bold text-primary dark:text-gold mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{a.desc}</p>
                  {a.url && <audio src={a.url} controls className="w-full" />}
                </div>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* الصور */}
        {photos.length > 0 && (
          <IslamicSection title="الصور" icon="🖼️" subtitle={`${photos.length} صورة`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover hover:scale-110 transition" />
                </div>
              ))}
            </div>
          </IslamicSection>
        )}

        {/* لا يوجد محتوى */}
        {totalItems === 0 && (
          <IslamicSection title="لا يوجد محتوى بعد" icon="📭">
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                سيتم إضافة محتوى في هذا العلم قريباً بإذن الله
              </p>
            </div>
          </IslamicSection>
        )}
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}