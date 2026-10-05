"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { defaultContent, type Content } from "@/lib/content";
import type { Settings } from "@/lib/data";

type Tab = "settings" | "lessons" | "videos" | "schedule";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [c, setC] = useState<Content>(defaultContent);
  const [tab, setTab] = useState<Tab>("settings");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => { setC(j.content); setLive(j.live); })
      .catch(() => setLive(false));
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
    setMsg(
      r.ok
        ? "✅ تم الحفظ — التغيير ظهر لكل الزوار فورًا"
        : "❌ " + (j.error || "فشل الحفظ — كود " + r.status)
    );
  };

  const setS = (k: keyof Settings, v: string) => setC({ ...c, settings: { ...c.settings, [k]: v } });

      const resizeImage = (file: File, max = 1200): Promise<File> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (b) =>
              b &&
              resolve(
                new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })
              ),
            "image/jpeg",
            0.85
          );
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const uploadPortrait = async (file: File) => {
    setMsg("⏳ جاري تجهيز الصورة ورفعها للسحابة…");
    try {
      const small = await resizeImage(file);
      const fd = new FormData();
      fd.append("file", small);
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-key": key },
        body: fd,
      });
      const j = await r.json();
      if (j.url) {
        setS("portraitSrc", j.url);
        setMsg("✅ الصورة اترفعت على السحابة — اضغط «حفظ ونشر فوري» عشان تثبت");
      } else {
        setMsg("❌ " + (j.error || "فشل الرفع لسبب غير معروف"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال — تأكد إن السيرفر شغال");
    }
  };
  const input = "w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gold focus:outline-none text-sm";
  const label = "block font-bold text-xs mb-1 text-gray-600";

  return (
    <>
      <Header settings={c.settings} />
      <main className="py-12 bg-cream-dark min-h-screen">
        <div className="max-w-4xl mx-auto px-4">

          {!authed ? (
            <div className="bg-white rounded-xl p-10 shadow-md border-t-4 border-gold max-w-md mx-auto text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="font-serif text-2xl text-primary mb-6">لوحة تحكم المالك</h1>
              <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className={input + " text-center mb-4"} placeholder="كلمة المرور" />
              <button onClick={login} className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition">
                دخول
              </button>
              {msg && <p className="text-sm text-red-600 mt-3">{msg}</p>}
            </div>
          ) : (
            <>
              {live === false && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                  ⚠️ قاعدة البيانات مش متصلة — تأكد من ملف .env.local ومن إنشاء الجدول في Supabase، ثم أعد تشغيل السيرفر.
                </div>
              )}

              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-serif text-3xl text-primary">⚙️ لوحة التحكم</h1>
                <div className="flex gap-2">
                  <button onClick={save} className="bg-gold text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-light transition">💾 حفظ ونشر فوري</button>
                  <button onClick={logout} className="border-2 border-gray-300 px-4 py-2 rounded-lg font-bold text-gray-500 hover:border-red-400 hover:text-red-500 transition">خروج</button>
                </div>
              </div>
              {msg && <p className="mb-4 font-bold text-sm">{msg}</p>}

              <div className="flex gap-2 mb-6 flex-wrap">
                {([["settings", "⚙️ البيانات"], ["lessons", "📖 الدروس"], ["videos", "🎬 الفيديوهات"], ["schedule", "🗓️ الجدول"]] as [Tab, string][]).map(([id, t]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`px-5 py-2 rounded-lg font-bold text-sm transition ${tab === id ? "bg-primary text-gold" : "bg-white text-gray-600 hover:bg-cream-dark"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md grid gap-4">
                {tab === "settings" && (
                  <>
                    <div><span className={label}>اسم الشيخ الكامل</span><input className={input} value={c.settings.ownerName} onChange={(e) => setS("ownerName", e.target.value)} /></div>
                    <div><span className={label}>الاسم المختصر (اللوجو)</span><input className={input} value={c.settings.shortName} onChange={(e) => setS("shortName", e.target.value)} /></div>
                    <div><span className={label}>المسمى الوظيفي</span><input className={input} value={c.settings.jobTitle} onChange={(e) => setS("jobTitle", e.target.value)} /></div>
                    <div><span className={label}>الشعار (المقولة)</span><input className={input} value={c.settings.motto} onChange={(e) => setS("motto", e.target.value)} /></div>
                    <div><span className={label}>النبذة (كل سطر فقرة)</span><textarea rows={4} className={input} value={c.settings.bio.join("\n")} onChange={(e) => setS("bio", e.target.value.split("\n") as never)} /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><span className={label}>رقم واتساب (دولي بدون +)</span><input className={input} value={c.settings.wa} onChange={(e) => setS("wa", e.target.value)} /></div>
                      <div><span className={label}>البريد الإلكتروني</span><input className={input} value={c.settings.email} onChange={(e) => setS("email", e.target.value)} /></div>
                    </div>
                    <div><span className={label}>العنوان / الدولة</span><input className={input} value={c.settings.address} onChange={(e) => setS("address", e.target.value)} /></div>
                    <div>
                      <span className={label}>الصورة الشخصية (رفع من جهازك)</span>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPortrait(e.target.files[0])} className="text-sm" />
                      {c.settings.portraitSrc && <img src={c.settings.portraitSrc} alt="معاينة" className="w-24 h-24 object-cover rounded-lg mt-2 border-2 border-gold" />}
                    </div>
                  </>
                )}

                {tab === "lessons" && (
                  <>
                    {c.lessons.map((l, i) => (
                      <div key={l.id} className="border-2 border-gray-100 rounded-lg p-4 grid gap-3">
                        <div className="flex justify-between items-center">
                          <b className="text-sm text-primary">درس #{i + 1}</b>
                          <button onClick={() => setC({ ...c, lessons: c.lessons.filter((_, x) => x !== i) })} className="text-red-500 text-xs font-bold hover:underline">🗑 حذف</button>
                        </div>
                        <input className={input} value={l.title} placeholder="العنوان" onChange={(e) => setC({ ...c, lessons: c.lessons.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x) })} />
                        <div className="grid grid-cols-2 gap-3">
                          <input className={input} value={l.category} placeholder="التصنيف" onChange={(e) => setC({ ...c, lessons: c.lessons.map((x, xi) => xi === i ? { ...x, category: e.target.value } : x) })} />
                          <input className={input} value={l.link} placeholder="رابط الاستماع (اختياري)" onChange={(e) => setC({ ...c, lessons: c.lessons.map((x, xi) => xi === i ? { ...x, link: e.target.value } : x) })} />
                        </div>
                        <textarea rows={2} className={input} value={l.desc} placeholder="الوصف" onChange={(e) => setC({ ...c, lessons: c.lessons.map((x, xi) => xi === i ? { ...x, desc: e.target.value } : x) })} />
                      </div>
                    ))}
                    <button onClick={() => setC({ ...c, lessons: [{ id: Date.now(), title: "درس جديد", category: "عقيدة", date: String(new Date().getFullYear()), link: "", desc: "" }, ...c.lessons] })}
                      className="bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition">➕ إضافة درس</button>
                  </>
                )}

                {tab === "videos" && (
                  <>
                    {c.videos.map((v, i) => (
                      <div key={v.id} className="border-2 border-gray-100 rounded-lg p-4 grid gap-3">
                        <div className="flex justify-between items-center">
                          <b className="text-sm text-primary">فيديو #{i + 1}</b>
                          <button onClick={() => setC({ ...c, videos: c.videos.filter((_, x) => x !== i) })} className="text-red-500 text-xs font-bold hover:underline">🗑 حذف</button>
                        </div>
                        <input className={input} value={v.title} placeholder="العنوان" onChange={(e) => setC({ ...c, videos: c.videos.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x) })} />
                        <input className={input} value={v.url} placeholder="رابط يوتيوب" onChange={(e) => setC({ ...c, videos: c.videos.map((x, xi) => xi === i ? { ...x, url: e.target.value } : x) })} />
                        <textarea rows={2} className={input} value={v.desc} placeholder="الوصف" onChange={(e) => setC({ ...c, videos: c.videos.map((x, xi) => xi === i ? { ...x, desc: e.target.value } : x) })} />
                      </div>
                    ))}
                    <button onClick={() => setC({ ...c, videos: [{ id: Date.now(), title: "فيديو جديد", url: "", desc: "" }, ...c.videos] })}
                      className="bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition">➕ إضافة فيديو</button>
                  </>
                )}

                {tab === "schedule" && (
                  <>
                    {c.schedule.map((s, i) => (
                      <div key={s.id} className="border-2 border-gray-100 rounded-lg p-4 grid grid-cols-2 gap-3">
                        <div className="flex justify-between items-center col-span-2">
                          <b className="text-sm text-primary">موعد #{i + 1}</b>
                          <button onClick={() => setC({ ...c, schedule: c.schedule.filter((_, x) => x !== i) })} className="text-red-500 text-xs font-bold hover:underline">🗑 حذف</button>
                        </div>
                        <input className={input} value={s.day} placeholder="اليوم" onChange={(e) => setC({ ...c, schedule: c.schedule.map((x, xi) => xi === i ? { ...x, day: e.target.value } : x) })} />
                        <input className={input} value={s.time} placeholder="الوقت" onChange={(e) => setC({ ...c, schedule: c.schedule.map((x, xi) => xi === i ? { ...x, time: e.target.value } : x) })} />
                        <input className={input} value={s.topic} placeholder="الموضوع" onChange={(e) => setC({ ...c, schedule: c.schedule.map((x, xi) => xi === i ? { ...x, topic: e.target.value } : x) })} />
                        <input className={input} value={s.place} placeholder="المكان" onChange={(e) => setC({ ...c, schedule: c.schedule.map((x, xi) => xi === i ? { ...x, place: e.target.value } : x) })} />
                      </div>
                    ))}
                    <button onClick={() => setC({ ...c, schedule: [...c.schedule, { id: Date.now(), day: "السبت", time: "", topic: "", place: "" }] })}
                      className="bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition">➕ إضافة موعد</button>
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