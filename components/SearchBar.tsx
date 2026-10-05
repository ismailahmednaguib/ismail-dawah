"use client";

import { useEffect, useState } from "react";
import { defaultContent, type Content } from "@/lib/content";

export default function SearchBar() {
  const [c, setC] = useState<Content>(defaultContent);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => j.content && setC(j.content)).catch(() => {});
  }, []);

  const t = q.trim();
  const results = t
    ? [
        ...c.lessons.filter((l) => (l.title + l.category + l.desc).includes(t)).map((l) => ({ href: "/lessons", t: "📖 " + l.title })),
        ...c.videos.filter((v) => (v.title + v.desc).includes(t)).map((v) => ({ href: "/videos", t: "🎬 " + v.title })),
        ...c.articles.filter((a) => (a.title + a.excerpt + a.body).includes(t)).map((a) => ({ href: "/articles/" + a.id, t: "📰 " + a.title })),
        ...c.audio.filter((a) => a.title.includes(t)).map((a) => ({ href: "/audio", t: "🎧 " + a.title })),
      ].slice(0, 7)
    : [];

  return (
    <div className="relative hidden md:block">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="🔍 ابحث…"
        className="w-40 lg:w-52 border-2 border-gray-200 rounded-full px-4 py-1.5 text-sm focus:border-gold focus:outline-none bg-white"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.map((r, i) => (
            <a key={i} href={r.href} className="block px-4 py-2.5 text-sm hover:bg-cream-dark">{r.t}</a>
          ))}
        </div>
      )}
    </div>
  );
}