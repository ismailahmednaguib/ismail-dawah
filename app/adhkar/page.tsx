"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";

export default function AdhkarPage() {
  const [c, setC] = useState<Content>(defaultContent);
  const [cat, setCat] = useState("أذكار الصباح");
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => j.content && setC(j.content)).catch(() => {});
  }, []);

  const cats = Array.from(new Set(c.adhkar.map((a) => a.category)));
  const list = c.adhkar.filter((a) => a.category === cat);

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-16 bg-cream-dark min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle>الأذكار والورد اليومي</SectionTitle>

          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {cats.map((k) => (
              <button key={k} onClick={() => setCat(k)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition ${cat === k ? "bg-primary text-gold ring-2 ring-gold/50" : "bg-white text-gray-600 hover:bg-cream"}`}>
                {k}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {list.map((a) => {
              const done = counts[a.id] || 0;
              return (
                <div key={a.id} className="bg-white rounded-xl p-6 shadow-md border-r-4 border-gold text-center">
                  <p className="font-serif text-lg text-gray-700 leading-loose mb-5">{a.text}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setCounts({ ...counts, [a.id]: done + 1 })}
                      className="w-12 h-12 rounded-full bg-gold text-gray-900 text-xl font-black hover:scale-110 transition">
                      +1
                    </button>
                    <span className="font-bold text-primary">{done} / {a.repeat}</span>
                    {done > 0 && (
                      <button onClick={() => setCounts({ ...counts, [a.id]: 0 })} className="text-xs text-red-400 font-bold">
                        تصفير
                      </button>
                    )}
                  </div>
                  {done >= a.repeat && <p className="mt-3 text-sm text-green-600 font-bold">✅ تقبّل الله — أتممت هذا الذكر</p>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}