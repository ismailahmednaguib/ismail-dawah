"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { defaultContent, type Content } from "@/lib/content";
import type { Settings } from "@/lib/data";

type Tab = "settings" | "appearance" | "lessons" | "videos" | "articles" | "audio" | "photos" | "schedule";

const TABS: [Tab, string][] = [
  ["settings", "⚙️ البيانات"],
  ["appearance", "🎛️ الأقسام"],
  ["lessons", "📖 الدروس"],
  ["videos", "🎬 الفيديوهات"],
  ["articles", "📰 المقالات"],
  ["audio", "🎧 الصوتيات"],
  ["photos", "🖼️ الصور"],
  ["schedule", "🗓️ الجدول"],
];

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [c, setC] = useState<Content>(defaultContent);
  const [tab, setTab] = useState<Tab>("settings");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((j) => { setC(j.content); setLive(j.live); }).catch(() => setLive(false));
    const saved = sessionStorage.getItem("adminKey");
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  const login = async () => {
    const r = await fetch("/api/verify?key=" + encodeURIComponent(key));
    const j = await r.json();
    if (j.ok) { sessionStorage.setItem("adminKey", key); setAuthed(true); setMsg(""); }
    else setMsg("❌ كلمة المرور غير صحيحة");
  };

  const logout = () => { sessionStorage.removeItem("adminKey"); setAuthed(false); };

  const save = async () => {
    setMsg("⏳ جاري الحفظ…");
    const r = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ content: c }),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "✅ تم الحفظ — التغيير ظهر لكل الزوار فورًا" : "❌ " + (j.error || "فشل الحفظ — كود " + r.status));
  };

  const setS = (k: keyof Settings, v: unknown) => setC({ ...c, settings: { ...c.settings, [k]: v } });

  const upd = (coll: "lessons" | "videos" | "articles" | "audio" | "photos" | "schedule", i: number, patch: Record<string, unknown>) => {
    const list = (c[coll] as unknown as Record<string, unknown>[]).map((x, xi) => (xi === i ? { ...x, ...patch } : x));
    setC({ ...c, [coll]: list } as Content);
  };

  const del = (coll: "lessons" | "videos" | "articles" | "audio" | "photos" | "schedule", i: number) => {
    const list = (c[coll] as unknown as unknown[]).filter((_, xi) => xi !== i);
    setC({ ...c, [coll]: list } as Content);
  };

  const add = (coll: "lessons" | "videos" | "articles" | "audio" | "photos" | "schedule", item: unknown) => {
    setC({ ...c, [coll]: [item, ...(c[coll] as unknown as unknown[])] } as Content);
  };

  const resizeImage = (file: File, max = 1400): Promise<File> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b) => b && resolve(new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })), "image/jpeg", 0.85);
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const uploadFile = async (file: File, kind: "image" | "audio"): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", kind === "image" ? await resizeImage(file) : file);
    fd.append("kind", kind);
    const r = await fetch("/api/upload", { method: "POST", headers: { "x-admin-key": key }, body: fd });
    const j = await r.json();
    return j.url || null;
  };

  const input = "w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gold focus:outline-none text-sm";
  const label = "block font-bold text-xs mb-1 text-gray-600";
  const itemBox = "border-2 border-gray-100 rounded-lg p-4 grid gap-3";
  const addBtn = "bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition";
  const delBtn = "text-red-500 text-xs font-bold hover:underline";

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-12 bg-cream-dark min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {!authed ? (
            <div className="bg-white rounded-xl p-10 shadow-md border-t-4 border-gold max-w-md mx-auto text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="font-serif text-2xl text-primary mb-6">لوحة تحكم المالك</h1>
              <input type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} className={input + " text-center mb-4"} placeholder="كلمة المرور" />
              <button onClick={login} className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition">دخول</button>
              {msg && <p className="text-sm text-red-600 mt-3">{msg}</p>}
            </div>
          ) : (
            <>
              {live === false && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">⚠️ قاعدة البيانات مش متصلة — راجع متغيرات البيئة.</div>
              )}

              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-serif text-3xl text-primary">⚙️ لوحة التحكم الشاملة</h1>
                <div className="flex gap-2">
                  <button onClick={save} className="bg-gold text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-light transition">💾 حفظ ونشر فوري</button>
                  <button onClick={logout} className="border-2 border-gray-300 px-4 py-2 rounded-lg font-bold text-gray-500 hover:border-red-400 hover:text-red-500 transition">خروج</button>
                </div>
              </div>
              {msg && <p className="mb-4 font-bold text-sm">{msg}</p>}

              <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map(([id, t]) => (
                  <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${tab === id ? "bg-primary text-gold" : "bg-white text-gray-600 hover:bg-cream-dark"}`}>{t}</button>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md grid gap-4">
                {tab === "settings" && (
                  <>
                    <div><span className={label}>اسم الشيخ الكامل</span><input className={input} value={c.settings.ownerName} onChange={(e) => setS("ownerName", e.target.value)} /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><span className={label}>الاسم المختصر</span><input className={input} value={c.settings.shortName} onChange={(e) => setS("shortName", e.target.value)} /></div>
                      <div><span className={label}>المسمى الوظيفي</span><input className={input} value={c.settings.jobTitle} onChange={(e) => setS("jobTitle", e.target.value)} /></div>
                    </div>
                    <div><span className={label}>الشعار</span><input className={input} value={c.settings.motto} onChange={(e) => setS("motto", e.target.value)} /></div>
                    <div><span className={label}>النبذة (كل سطر فقرة)</span><textarea rows={4} className={input} value={c.settings.bio.join("\n")} onChange={(e) => setS("bio", e.target.value.split("\n"))} /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><span className={label}>واتساب (دولي بدون +)</span><input className={input} value={c.settings.wa} onChange={(e) => setS("wa", e.target.value)} /></div>
                      <div><span className={label}>البريد</span><input className={input} value={c.settings.email} onChange={(e) => setS("email", e.target.value)} /></div>
                    </div>
                    <div><span className={label}>العنوان</span><input className={input} value={c.settings.address} onChange={(e) => setS("address", e.target.value)} /></div>
                    <div>
                      <span className={label}>الصورة الشخصية</span>
                      <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setMsg("⏳ جاري الرفع…"); const u = await uploadFile(f, "image"); if (u) { setS("portraitSrc", u); setMsg("✅ اترفعت — اضغط حفظ ونشر"); } else setMsg("❌ فشل الرفع"); }} className="text-sm" />
                      {c.settings.portraitSrc && <img src={c.settings.portraitSrc} alt="معاينة" className="w-24 h-24 object-cover rounded-lg mt-2 border-2 border-gold" />}
                    </div>
                  </>
                )}

                {tab === "appearance" && (
                  <>
                    {([["showPrayerBar", "🕌 شريط مواقيت الصلاة + التاريخ الهجري"], ["showArticles", "📰 قسم المقالات"], ["showAudio", "🎧 المكتبة الصوتية"], ["showGallery", "🖼️ معرض الصور"]] as [keyof Settings, string][]).map(([k, t]) => (
                      <label key={String(k)} className="flex items-center justify-between border-2 border-gray-100 rounded-lg p-4 cursor-pointer">
                        <span className="font-bold text-sm">{t}</span>
                        <input type="checkbox" checked={Boolean(c.settings[k])} onChange={(e) => setS(k, e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                      </label>
                    ))}
                    <p className="text-xs text-gray-500">الأقسام دي هتظهر أو تختفي من الموقع كله بضغطة واحدة بعد الحفظ.</p>
                  </>
                )}

                {tab === "lessons" && (
                  <>
                    {c.lessons.map((l, i) => (
                      <div key={l.id} className={itemBox}>
                        <div className="flex justify-between items-center"><b className="text-sm text-primary">درس #{i + 1}</b><button onClick={() => del("lessons", i)} className={delBtn}>🗑 حذف</button></div>
                        <input className={input} value={l.title} placeholder="العنوان" onChange={(e) => upd("lessons", i, { title: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                          <input className={input} value={l.category} placeholder="التصنيف" onChange={(e) => upd("lessons", i, { category: e.target.value })} />
                          <input className={input} value={l.link} placeholder="رابط الاستماع" onChange={(e) => upd("lessons", i, { link: e.target.value })} />
                        </div>
                        <textarea rows={2} className={input} value={l.desc} placeholder="الوصف" onChange={(e) => upd("lessons", i, { desc: e.target.value })} />
                      </div>
                    ))}
                    <button onClick={() => add("lessons", { id: Date.now(), title: "درس جديد", category: "عقيدة", date: String(new Date().getFullYear()), link: "", desc: "" })} className={addBtn}>➕ إضافة درس</button>
                  </>
                )}

                {tab === "videos" && (
                  <>
                    {c.videos.map((v, i) => (
                      <div key={v.id} className={itemBox}>
                        <div className="flex justify-between items-center"><b className="text-sm text-primary">فيديو #{i + 1}</b><button onClick={() => del("videos", i)} className={delBtn}>🗑 حذف</button></div>
                        <input className={input} value={v.title} placeholder="العنوان" onChange={(e) => upd("videos", i, { title: e.target.value })} />
                        <input className={input} value={v.url} placeholder="رابط يوتيوب" onChange={(e) => upd("videos", i, { url: e.target.value })} />
                        <textarea rows={2} className={input} value={v.desc} placeholder="الوصف" onChange={(e) => upd("videos", i, { desc: e.target.value })} />
                      </div>
                    ))}
                    <button onClick={() => add("videos", { id: Date.now(), title: "فيديو جديد", url: "", desc: "" })} className={addBtn}>➕ إضافة فيديو</button>
                  </>
                )}

                {tab === "articles" && (
                  <>
                    {c.articles.map((a, i) => (
                      <div key={a.id} className={itemBox}>
                        <div className="flex justify-between items-center"><b className="text-sm text-primary">مقال #{i + 1}</b><button onClick={() => del("articles", i)} className={delBtn}>🗑 حذف</button></div>
                        <input className={input} value={a.title} placeholder="عنوان المقال" onChange={(e) => upd("articles", i, { title: e.target.value })} />
                        <input className={input} value={a.date} placeholder="التاريخ (مثال: 15 يناير 2024)" onChange={(e) => upd("articles", i, { date: e.target.value })} />
                        <textarea rows={2} className={input} value={a.excerpt} placeholder="مقتطف مختصر يظهر في البطاقة" onChange={(e) => upd("articles", i, { excerpt: e.target.value })} />
                        <textarea rows={6} className={input} value={a.body} placeholder="نص المقال كاملًا (سطر فاضي = فقرة جديدة)" onChange={(e) => upd("articles", i, { body: e.target.value })} />
                      </div>
                    ))}
                    <button onClick={() => add("articles", { id: Date.now(), title: "مقال جديد", date: new Date().toLocaleDateString("ar-EG"), excerpt: "", body: "" })} className={addBtn}>➕ كتابة مقال</button>
                  </>
                )}

                {tab === "audio" && (
                  <>
                    {c.audio.map((a, i) => (
                      <div key={a.id} className={itemBox}>
                        <div className="flex justify-between items-center"><b className="text-sm text-primary">مقطع #{i + 1}</b><button onClick={() => del("audio", i)} className={delBtn}>🗑 حذف</button></div>
                        <input className={input} value={a.title} placeholder="العنوان" onChange={(e) => upd("audio", i, { title: e.target.value })} />
                        <div>
                          <span className={label}>رفع MP3 من جهازك</span>
                          <input type="file" accept="audio/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setMsg("⏳ جاري رفع المقطع…"); const u = await uploadFile(f, "audio"); if (u) { upd("audio", i, { url: u }); setMsg("✅ المقطع اترفع — اضغط حفظ ونشر"); } else setMsg("❌ فشل الرفع"); }} className="text-sm" />
                          {a.url && <audio src={a.url} controls className="w-full mt-2" />}
                        </div>
                        <textarea rows={2} className={input} value={a.desc} placeholder="الوصف" onChange={(e) => upd("audio", i, { desc: e.target.value })} />
                      </div>
                    ))}
                    <button onClick={() => add("audio", { id: Date.now(), title: "مقطع جديد", url: "", desc: "" })} className={addBtn}>➕ إضافة مقطع</button>
                    <p className="text-xs text-gray-500">💡 للصوتيات الكبيرة (فوق 4MB) ارفعها على archive.org وحط الرابط مباشرة في حقل الرابط بعد ما نضيفه، أو اصغر حجم الملف.</p>
                  </>
                )}

                {tab === "photos" && (
                  <>
                    <div>
                      <span className={label}>رفع صور جديدة (ممكن أكتر من واحدة مرة واحدة)</span>
                      <input type="file" accept="image/*" multiple onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        setMsg("⏳ جاري رفع " + files.length + " صورة…");
                        const items = [];
                        for (const f of files) {
                          const u = await uploadFile(f, "image");
                          if (u) items.push({ id: Date.now() + Math.random(), url: u, caption: "" });
                        }
                        setC((prev) => ({ ...prev, photos: [...items, ...prev.photos] } as Content));
                        setMsg("✅ اترفعت الصور — اضغط حفظ ونشر");
                      }} className="text-sm" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {c.photos.map((p, i) => (
                        <div key={p.id} className="border-2 border-gray-100 rounded-lg p-3 grid gap-2">
                          <img src={p.url} alt={p.caption} className="w-full h-40 object-cover rounded-lg" />
                          <input className={input} value={p.caption} placeholder="تعليق الصورة" onChange={(e) => upd("photos", i, { caption: e.target.value })} />
                          <button onClick={() => del("photos", i)} className={delBtn}>🗑 حذف</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {tab === "schedule" && (
                  <>
                    {c.schedule.map((s, i) => (
                      <div key={s.id} className={itemBox + " grid-cols-2"}>
                        <div className="flex justify-between items-center col-span-2"><b className="text-sm text-primary">موعد #{i + 1}</b><button onClick={() => del("schedule", i)} className={delBtn}>🗑 حذف</button></div>
                        <input className={input} value={s.day} placeholder="اليوم" onChange={(e) => upd("schedule", i, { day: e.target.value })} />
                        <input className={input} value={s.time} placeholder="الوقت" onChange={(e) => upd("schedule", i, { time: e.target.value })} />
                        <input className={input} value={s.topic} placeholder="الموضوع" onChange={(e) => upd("schedule", i, { topic: e.target.value })} />
                        <input className={input} value={s.place} placeholder="المكان" onChange={(e) => upd("schedule", i, { place: e.target.value })} />
                      </div>
                    ))}
                    <button onClick={() => add("schedule", { id: Date.now(), day: "السبت", time: "", topic: "", place: "" })} className={addBtn}>➕ إضافة موعد</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer settings={c.settings} />
    </>
  );
}