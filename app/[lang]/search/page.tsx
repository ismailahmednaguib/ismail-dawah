"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

type SearchItem = {
  type: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
  category?: string;
};

export default function SearchPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // جلب كل المحتوى
    Promise.all([
      fetch("/api/content").then(r => r.json()).catch(() => ({ content: null })),
    ]).then(([data]) => {
      const c = data.content;
      if (!c) { setLoading(false); return; }

      const items: SearchItem[] = [];

      // الدروس
      (c.lessons || []).forEach((l: any) => {
        items.push({
          type: "lesson",
          icon: "📖",
          title: l.title,
          desc: l.desc,
          href: `/${lang}/fields/${l.field}`,
          category: l.category,
        });
      });

      // الفيديوهات
      (c.videos || []).forEach((v: any) => {
        items.push({
          type: "video",
          icon: "🎬",
          title: v.title,
          desc: v.desc,
          href: `/${lang}/fields/${v.field}`,
        });
      });

      // المقالات
      (c.articles || []).forEach((a: any) => {
        items.push({
          type: "article",
          icon: "✍️",
          title: a.title,
          desc: a.excerpt,
          href: `/${lang}/fields/${a.field}`,
          category: a.date,
        });
      });

      // الكتب
      (c.books || []).forEach((b: any) => {
        items.push({
          type: "book",
          icon: "📚",
          title: b.title,
          desc: b.desc,
          href: `/${lang}/fields/${b.field}`,
        });
      });

      // الصوتيات
      (c.audio || []).forEach((a: any) => {
        items.push({
          type: "audio",
          icon: "🎧",
          title: a.title,
          desc: a.desc,
          href: `/${lang}/fields/${a.field}`,
        });
      });

      // الفتاوى
      (c.fatwas || []).forEach((f: any) => {
        items.push({
          type: "fatwa",
          icon: "❓",
          title: f.q,
          desc: f.a.slice(0, 150) + "...",
          href: `/${lang}/fatwa`,
        });
      });

      // الشبهات
      (c.doubts || []).forEach((d: any) => {
        items.push({
          type: "doubt",
          icon: "⚔️",
          title: d.q,
          desc: d.a.slice(0, 150) + "...",
          href: `/${lang}/doubts`,
          category: d.category,
        });
      });

      setAllItems(items);
      setLoading(false);
    });
  }, [lang]);

  const filteredItems = allItems.filter(item => {
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(query.toLowerCase()));
    
    const matchesFilter = filter === "all" || item.type === filter;
    
    return matchesQuery && matchesFilter;
  });

  const filters = [
    { id: "all", label: "الكل", count: allItems.length },
    { id: "lesson", label: "📖 الدروس", count: allItems.filter(i => i.type === "lesson").length },
    { id: "fatwa", label: "❓ الفتاوى", count: allItems.filter(i => i.type === "fatwa").length },
    { id: "article", label: "✍️ المقالات", count: allItems.filter(i => i.type === "article").length },
    { id: "video", label: "🎬 الفيديوهات", count: allItems.filter(i => i.type === "video").length },
    { id: "book", label: "📚 الكتب", count: allItems.filter(i => i.type === "book").length },
    { id: "doubt", label: "⚔️ الشبهات", count: allItems.filter(i => i.type === "doubt").length },
  ];

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🔍"
          title="البحث في الموقع"
          subtitle="ابحث في كل المحتوى: دروس، فتاوى، مقالات، كتب، صوتيات"
          verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          verseSource="سورة طه - الآية 114"
          gradient="from-blue-600 via-blue-700 to-blue-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* شريط البحث */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="🔍 اكتب كلمة البحث..."
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-2xl px-6 py-4 text-lg focus:border-gold focus:outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold text-2xl"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* الفلاتر */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                      filter === f.id
                        ? "bg-gold text-gray-900"
                        : "bg-cream-dark dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gold/20"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* النتائج */}
            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري تحميل المحتوى...</p>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-lg">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {query ? "لا توجد نتائج للبحث" : "ابدأ الكتابة للبحث في كل المحتوى"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  ✅ تم العثور على <strong className="text-gold">{filteredItems.length}</strong> نتيجة
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredItems.slice(0, 50).map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition border-r-4 border-gold hover:border-gold-light"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-primary dark:text-gold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.desc}</p>
                          {item.category && (
                            <span className="inline-block mt-2 text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredItems.length > 50 && (
                  <p className="text-center text-sm text-gray-500 mt-6">
                    يعرض 50 من {filteredItems.length} نتيجة
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}