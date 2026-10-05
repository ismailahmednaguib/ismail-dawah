"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";

export default function ContactPage() {
  const [c, setC] = useState<Content>(defaultContent);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => j.content && setC(j.content)).catch(() => {});
  }, []);

  const send = (type: "wa" | "mail") => {
    if (!name.trim() || !msg.trim()) { alert("اكتب اسمك ورسالتك أولًا"); return; }
    const text = `السلام عليكم ورحمة الله،\nأنا ${name}.\n\n${msg}`;
    if (type === "wa") window.open(`https://wa.me/${c.settings.wa}?text=${encodeURIComponent(text)}`, "_blank");
    else window.location.href = `mailto:${c.settings.email}?subject=${encodeURIComponent("رسالة من " + name)}&body=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle>تواصل معي</SectionTitle>

          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-center">
            <a href={`https://wa.me/${c.settings.wa}`} target="_blank" rel="noopener" className="bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-bold">واتساب</div>
              <div className="text-sm text-gray-500" dir="ltr">+{c.settings.wa}</div>
            </a>
            <a href={`mailto:${c.settings.email}`} className="bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl mb-2">✉️</div>
              <div className="font-bold">البريد</div>
              <div className="text-sm text-gray-500">{c.settings.email}</div>
            </a>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-2">📍</div>
              <div className="font-bold">الموقع</div>
              <div className="text-sm text-gray-500">{c.settings.address}</div>
            </div>
          </div>

          <form className="bg-white rounded-xl p-6 shadow-md grid gap-4 mb-12" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block font-bold mb-1 text-sm">الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none" placeholder="اسمك الكريم" />
            </div>
            <div>
              <label className="block font-bold mb-1 text-sm">رسالتك</label>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none" placeholder="اكتب رسالتك أو سؤالك…" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => send("wa")} className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gold-light transition">💬 إرسال عبر واتساب</button>
              <button type="button" onClick={() => send("mail")} className="border-2 border-gold text-gold px-6 py-3 rounded-lg font-bold hover:bg-gold hover:text-gray-900 transition">✉️ إرسال عبر البريد</button>
            </div>
          </form>

          {c.schedule.length > 0 && (
            <>
              <SectionTitle>جدول الدروس الأسبوعي</SectionTitle>
              <div className="grid gap-4">
                {c.schedule.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl p-5 shadow-md border-r-4 border-gold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="font-black text-primary text-lg min-w-20">{s.day}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{s.topic}</h4>
                      <p className="text-sm text-gray-500">🕐 {s.time} — 📍 {s.place}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}