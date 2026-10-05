"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";

export default function AudioPage() {
  const [c, setC] = useState<Content>(defaultContent);
  const [cur, setCur] = useState(-1);
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => j.content && setC(j.content)).catch(() => {});
  }, []);

  const play = (i: number) => {
    setCur(i);
    setTimeout(() => ref.current?.play(), 80);
  };

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20 bg-cream-dark pb-44">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle>المكتبة الصوتية</SectionTitle>
          {!c.settings.showAudio ? (
            <p className="text-center text-gray-500">القسم غير متاح حاليًا</p>
          ) : c.audio.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد مقاطع بعد — أضفها من لوحة التحكم ← 🎧 الصوتيات</p>
          ) : (
            <div className="grid gap-3">
              {c.audio.map((a, i) => (
                <div key={a.id} className={`bg-white rounded-xl p-4 shadow-md flex items-center gap-4 ${cur === i ? "border-2 border-gold" : "border-2 border-transparent"}`}>
                  <button onClick={() => play(i)} className="w-12 h-12 rounded-full bg-gold text-gray-900 text-xl font-bold shrink-0">▶</button>
                  <div className="flex-1">
                    <h3 className="font-bold text-primary">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {cur >= 0 && c.audio[cur] && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-primary text-white px-4 py-3 flex items-center gap-3 shadow-2xl">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate mb-1">🎧 {c.audio[cur].title}</div>
            <audio ref={ref} src={c.audio[cur].url} controls className="w-full h-9" onEnded={() => cur < c.audio.length - 1 && play(cur + 1)} />
          </div>
        </div>
      )}

      <Footer settings={c.settings} />
    </>
  );
}