"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  type: string;
  icon: string;
  addedAt: string;
};

export default function BookmarksPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const remove = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm("هل تريد حذف كل المفضلة؟")) {
      setBookmarks([]);
      localStorage.setItem("bookmarks", "[]");
    }
  };

  const types = ["all", ...Array.from(new Set(bookmarks.map(b => b.type)))];
  
  const filtered = bookmarks.filter(b => {
    const matchesType = filter === "all" || b.type === filter;
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="⭐"
          title="المفضلة"
          subtitle="صفحاتك المحفوظة للرجوع إليها بسهولة"
          hadith="الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ"
          gradient="from-amber-600 via-amber-700 to-amber-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {bookmarks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-lg">
                <span className="text-7xl mb-4 block">📭</span>
                <h2 className="font-serif text-2xl text-primary dark:text-gold mb-3">
                  لا توجد عناصر في المفضلة
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  اضغط على ⭐ في أي صفحة لإضافتها هنا
                </p>
                <Link
                  href={`/${lang}`}
                  className="inline-block bg-gold text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gold-light transition"
                >
                  🏠 العودة للرئيسية
                </Link>
              </div>
            ) : (
              <>
                {/* الإحصائيات */}
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-3xl font-bold text-gold">{bookmarks.length}</p>
                    <p className="text-xs text-gray-500">إجمالي المحفوظات</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-3xl font-bold text-gold">{types.length - 1}</p>
                    <p className="text-xs text-gray-500">نوع مختلف</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
                    <p className="text-3xl font-bold text-gold">
                      {bookmarks[0] ? new Date(bookmarks[0].addedAt).toLocaleDateString("ar-EG", { month: "short" }) : "-"}
                    </p>
                    <p className="text-xs text-gray-500">آخر إضافة</p>
                  </div>
                </div>

                {/* البحث */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-4">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث في المفضلة..."
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl px-4 py-2 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* الفلاتر */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {types.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                        filter === type
                          ? "bg-gold text-gray-900"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold/20"
                      }`}
                    >
                      {type === "all" ? "⭐ الكل" : type}
                    </button>
                  ))}
                </div>

                {/* العنوان + حذف */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl text-primary dark:text-gold">
                    {filtered.length} عنصر
                  </h2>
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-500 font-bold hover:underline"
                  >
                    🗑️ حذف الكل
                  </button>
                </div>

                {/* القائمة */}
                <div className="grid md:grid-cols-2 gap-3">
                  {filtered.map(b => (
                    <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl transition border-r-4 border-gold flex items-center gap-3">
                      <span className="text-4xl">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={b.url}
                          className="font-bold text-primary dark:text-gold hover:underline block truncate"
                        >
                          {b.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">
                            {b.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(b.addedAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => remove(b.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* نصيحة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 text-center shadow-2xl mt-10">
              <p className="font-serif text-xl text-gold mb-3">
                «مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ»
              </p>
              <p className="text-white/70 text-sm">رواه مسلم</p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}