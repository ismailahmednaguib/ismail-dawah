"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { defaultContent, type Content } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function ContactPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const [c, setC] = useState<Content>(defaultContent);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const tr = t(lang as Lang);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => j.content && setC(j.content)).catch(() => {});
  }, []);

  const send = (type: "wa" | "mail") => {
    if (!name.trim() || !msg.trim()) { alert(tr.sendRequired); return; }
    const text = `${tr.greetings},\n${tr.iam} ${name}.\n\n${msg}`;
    if (type === "wa") window.open(`https://wa.me/${c.settings.wa}?text=${encodeURIComponent(text)}`, "_blank");
    else window.location.href = `mailto:${c.settings.email}?subject=${encodeURIComponent(tr.from + " " + name)}&body=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Header settings={c.settings} lang={lang as Lang} />
      <main className="py-20 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}`} label={tr.backHome} />
          <SectionTitle>{tr.contact}</SectionTitle>

          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-center">
            <a href={`https://wa.me/${c.settings.wa}`} target="_blank" rel="noopener" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-bold text-primary dark:text-white">{tr.wa}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">+{c.settings.wa}</div>
            </a>
            <a href={`mailto:${c.settings.email}`} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl mb-2">✉️</div>
              <div className="font-bold text-primary dark:text-white">{tr.email}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{c.settings.email}</div>
            </a>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="text-3xl mb-2">📍</div>
              <div className="font-bold text-primary dark:text-white">{tr.location}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{c.settings.address}</div>
            </div>
          </div>

          <form className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md grid gap-4 mb-12" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block font-bold mb-1 text-sm text-primary dark:text-white">{tr.formName}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-gold focus:outline-none" placeholder={tr.formPlaceholderName} />
            </div>
            <div>
              <label className="block font-bold mb-1 text-sm text-primary dark:text-white">{tr.formMessage}</label>
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-gold focus:outline-none" placeholder={tr.formPlaceholderMessage} />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => send("wa")} className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gold-light transition">{tr.sendWa}</button>
              <button type="button" onClick={() => send("mail")} className="border-2 border-gold text-gold dark:text-gold px-6 py-3 rounded-lg font-bold hover:bg-gold hover:text-gray-900 transition">{tr.sendMail}</button>
            </div>
          </form>

          {c.schedule.length > 0 && (
            <>
              <SectionTitle>{tr.scheduleTitle}</SectionTitle>
              <div className="grid gap-4">
                {c.schedule.map((s) => (
                  <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-r-4 border-gold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="font-black text-primary dark:text-gold text-lg min-w-20">{s.day}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary dark:text-white">{s.topic}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">🕐 {s.time} — 📍 {s.place}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer settings={c.settings} lang={lang as Lang} />
    </>
  );
}