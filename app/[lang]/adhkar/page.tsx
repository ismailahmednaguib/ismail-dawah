"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AdhkarPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const [c, setC] = useState<Content>(defaultContent);
  const [cat, setCat] = useState(c.adhkar[0]?.category || "");
  const [counts, setCounts] = useState<Record<number, number>>({});
  const tr = t(lang as Lang);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => {
      if (j.content) {
        setC(j.content);
        if (j.content.adhkar[0]) setCat(j.content.adhkar[0].category);
      }
    }).catch(() => {});
  }, []);

  const cats = Array.from(new Set(c.adhkar.map((a) => a.category)));
  const list = c.adhkar.filter((a) => a.category === cat);

  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.adhkarTitle}</SectionTitle>

          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {cats.map((k) => (
              <button key={k} onClick={() => setCat(k)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition ${cat === k ? "bg-primary text-gold ring-2 ring-gold/50" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-cream dark:hover:bg-gray-700"}`}>
                {k}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {list.map((a) => {
              const done = counts[a.id] || 0;
              return (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-gold text-center">
                  <p className="font-serif text-lg text-gray-700 dark:text-gray-200 leading-loose mb-5">{a.text}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setCounts({ ...counts, [a.id]: done + 1 })}
                      className="w-12 h-12 rounded-full bg-gold text-gray-900 text-xl font-black hover:scale-110 transition">
                      +1
                    </button>
                    <span className="font-bold text-primary dark:text-gold">{done} / {a.repeat}</span>
                    {done > 0 && (
                      <button onClick={() => setCounts({ ...counts, [a.id]: 0 })} className="text-xs text-red-400 font-bold">
                        0
                      </button>
                    )}
                  </div>
                  {done >= a.repeat && <p className="mt-3 text-sm text-green-600 font-bold">✅</p>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}