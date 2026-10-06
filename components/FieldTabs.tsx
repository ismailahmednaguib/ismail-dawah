"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { Lesson, Video, Article, Book, AudioItem, Photo } from "@/lib/data";

type Tab = "lessons" | "videos" | "articles" | "books" | "audio" | "photos";

export default function FieldTabs({
  lessons, videos, articles, books, audio, photos, lang,
}: {
  lessons: Lesson[]; videos: Video[]; articles: Article[]; books: Book[]; audio: AudioItem[]; photos: Photo[];
  lang: Lang;
}) {
  const tr = t(lang);
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "lessons", label: tr.lessons, count: lessons.length },
    { id: "videos", label: tr.videos, count: videos.length },
    { id: "articles", label: tr.articles, count: articles.length },
    { id: "books", label: tr.books, count: books.length },
    { id: "audio", label: tr.audio, count: audio.length },
    { id: "photos", label: tr.photos, count: photos.length },
  ];
  const [active, setActive] = useState<Tab>("lessons");

  return (
    <div>
      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setActive(tb.id)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition ${active === tb.id ? "bg-primary text-gold ring-2 ring-gold/50" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-cream dark:hover:bg-gray-700"}`}>
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {active === "lessons" && lessons.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold">
            <h3 className="font-bold text-primary dark:text-white mb-1">{x.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{x.category} • {x.date}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{x.desc}</p>
            {x.link && <a href={x.link} target="_blank" rel="noopener" className="text-gold text-sm font-bold">{tr.readMore} ←</a>}
          </div>
        ))}
        {active === "videos" && videos.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold">
            <h3 className="font-bold text-primary dark:text-white mb-1">{x.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{x.desc}</p>
            {x.url && <a href={x.url} target="_blank" rel="noopener" className="text-gold text-sm font-bold">▶</a>}
          </div>
        ))}
        {active === "articles" && articles.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold">
            <h3 className="font-bold text-primary dark:text-white mb-1">{x.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{x.date}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{x.excerpt}</p>
          </div>
        ))}
        {active === "books" && books.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold">
            <h3 className="font-bold text-primary dark:text-white mb-1">{x.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{x.desc}</p>
            {x.url && <a href={x.url} target="_blank" rel="noopener" className="text-gold text-sm font-bold">📖</a>}
          </div>
        ))}
        {active === "audio" && audio.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold">
            <h3 className="font-bold text-primary dark:text-white mb-1">{x.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{x.desc}</p>
            {x.url && <a href={x.url} target="_blank" rel="noopener" className="text-gold text-sm font-bold">🎧</a>}
          </div>
        ))}
        {active === "photos" && photos.map((x) => (
          <div key={x.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow border-r-4 border-gold text-center">
            <img src={x.url} alt={x.caption} className="w-full rounded-lg mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">{x.caption}</p>
          </div>
        ))}
        {((active === "lessons" && !lessons.length) || (active === "videos" && !videos.length) || (active === "articles" && !articles.length) || (active === "books" && !books.length) || (active === "audio" && !audio.length) || (active === "photos" && !photos.length)) && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">{tr.noData}</p>
        )}
      </div>
    </div>
  );
}