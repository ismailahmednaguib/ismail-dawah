"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson, Video, Article, Book, AudioItem, Photo } from "@/lib/data";
import { LessonCard, VideoCard } from "./Cards";

type TabKey = "lessons" | "videos" | "articles" | "books" | "audio" | "photos";

type Props = {
  lessons: Lesson[];
  videos: Video[];
  articles: Article[];
  books: Book[];
  audio: AudioItem[];
  photos: Photo[];
};

const LABELS: Record<TabKey, string> = {
  lessons: "📖 الدروس",
  videos: "🎬 الفيديوهات",
  articles: "📰 المقالات",
  books: "📚 الكتب",
  audio: "🎧 الصوتيات",
  photos: "🖼️ الصور",
};

function Empty() {
  return <p className="text-center text-gray-500 py-16">لا توجد مواد في هذا القسم بعد — تُضاف من لوحة التحكم.</p>;
}

export default function FieldTabs({ lessons, videos, articles, books, audio, photos }: Props) {
  const [tab, setTab] = useState<TabKey>("lessons");
  const counts: Record<TabKey, number> = {
    lessons: lessons.length, videos: videos.length, articles: articles.length,
    books: books.length, audio: audio.length, photos: photos.length,
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap justify-center mb-10">
        {(Object.keys(LABELS) as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${tab === k ? "bg-primary text-gold" : "bg-white text-gray-600 hover:bg-cream-dark"} ${counts[k] === 0 ? "opacity-40" : ""}`}
          >
            {LABELS[k]} ({counts[k]})
          </button>
        ))}
      </div>

      {tab === "lessons" && (lessons.length ? (
        <div className="grid md:grid-cols-3 gap-6">{lessons.map((l) => <LessonCard key={l.id} lesson={l} />)}</div>
      ) : <Empty />)}

      {tab === "videos" && (videos.length ? (
        <div className="grid md:grid-cols-3 gap-6">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      ) : <Empty />)}

      {tab === "articles" && (articles.length ? (
        <div className="grid gap-5 max-w-3xl mx-auto">
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="bg-white rounded-xl p-6 shadow-md border-t-4 border-gold block hover:-translate-y-1 transition">
              <div className="text-xs text-gray-400 mb-2">📅 {a.date}</div>
              <h3 className="font-serif text-xl text-primary mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      ) : <Empty />)}

      {tab === "books" && (books.length ? (
        <div className="grid md:grid-cols-3 gap-6">
          {books.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-6 shadow-md border-t-4 border-gold">
              <h3 className="font-serif text-lg text-primary mb-2">📚 {b.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{b.desc}</p>
              {b.url && <a href={b.url} target="_blank" rel="noopener" className="text-gold font-bold text-sm">تحميل / قراءة ←</a>}
            </div>
          ))}
        </div>
      ) : <Empty />)}

      {tab === "audio" && (audio.length ? (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {audio.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-primary mb-2">🎧 {a.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{a.desc}</p>
              <audio src={a.url} controls className="w-full" />
            </div>
          ))}
        </div>
      ) : <Empty />)}

      {tab === "photos" && (photos.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p) => (
            <img key={p.id} src={p.url} alt={p.caption} className="w-full h-48 object-cover rounded-xl shadow-md" />
          ))}
        </div>
      ) : <Empty />)}
    </div>
  );
}