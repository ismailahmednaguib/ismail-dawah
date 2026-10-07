"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import Link from "next/link";

export default function SearchPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const [c, setC] = useState<Content>(defaultContent);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => j.content && setC(j.content))
      .catch(() => {});
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.trim().toLowerCase();
    const out: { type: string; title: string; href: string }[] = [];

    c.fields.forEach((f) => {
      if ((f.name + " " + f.desc).toLowerCase().includes(term)) {
        out.push({ type: "📚", title: f.name, href: `/${lang}/fields/${f.slug}` });
      }
    });
    c.lessons.forEach((l) => {
      const title = l.t?.[L]?.title || l.title;
      if ((title + " " + l.desc).toLowerCase().includes(term)) {
        out.push({ type: "📖", title, href: `/${lang}/fields/${l.field}` });
      }
    });
    c.videos.forEach((v) => {
      const title = v.t?.[L]?.title || v.title;
      if ((title + " " + v.desc).toLowerCase().includes(term)) {
        out.push({ type: "🎬", title, href: `/${lang}/fields/${v.field}` });
      }
    });
    c.articles.forEach((a) => {
      const title = a.t?.[L]?.title || a.title;
      if ((title + " " + a.excerpt + " " + a.body).toLowerCase().includes(term)) {
        out.push({ type: "✍️", title, href: `/${lang}/articles/${a.id}` });
      }
    });
    c.fatwas.forEach((f) => {
      const qText = f.t?.[L]?.q || f.q;
      if ((qText + " " + f.a).toLowerCase().includes(term)) {
        out.push({ type: "❓", title: qText, href: `/${lang}/fatwa` });
      }
    });
    c.doubts.forEach((d) => {
      const qText = d.t?.[L]?.q || d.q;
      if ((qText + " " + d.a).toLowerCase().includes(term)) {
        out.push({ type: "⚔️", title: qText, href: `/${lang}/doubts` });
      }
    });
    c.news.forEach((n) => {
      const title = n.t?.[L]?.title || n.title;
      if ((title + " " + n.body).toLowerCase().includes(term)) {
        out.push({ type: "🗞️", title, href: `/${lang}/news` });
      }
    });
    c.books.forEach((b) => {
      const title = b.t?.[L]?.title || b.title;
      if ((title + " " + b.desc).toLowerCase().includes(term)) {
        out.push({ type: "📕", title, href: `/${lang}/fields/${b.field}` });
      }
    });

    return out.slice(0, 50);
  }, [q, c, lang, L]);

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.search}</SectionTitle>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr.searchPlaceholder}
            autoFocus
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-5 py-4 text-lg focus:border-gold focus:outline-none mb-8"
          />

          {q.trim() && results.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">{tr.noResults}</p>
          )}

          <div className="space-y-3">
            {results.map((r, i) => (
              <Link
                key={i}
                href={r.href}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg border border-transparent hover:border-gold transition"
              >
                <span className="text-2xl">{r.type}</span>
                <span className="font-bold text-primary dark:text-white">{r.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}