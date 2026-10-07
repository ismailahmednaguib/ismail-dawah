"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
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

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>⭐ المفضلة</SectionTitle>

          {bookmarks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                لا توجد عناصر في المفضلة
              </p>
              <p className="text-sm text-gray-400">
                اضغط على ⭐ في أي صفحة لإضافتها هنا
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  {bookmarks.length} عنصر محفوظ
                </p>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-500 font-bold hover:underline"
                >
                  🗑 حذف الكل
                </button>
              </div>

              <div className="space-y-3">
                {bookmarks.map(b => (
                  <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md flex items-center gap-3">
                    <span className="text-4xl">{b.icon}</span>
                    <div className="flex-1">
                      <Link
                        href={b.url}
                        className="font-bold text-primary dark:text-gold hover:underline block"
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {b.type} • {new Date(b.addedAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(b.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}