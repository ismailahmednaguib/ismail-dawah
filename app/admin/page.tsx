"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { defaultContent, type Content } from "@/lib/content";
import type { Settings, Photo } from "@/lib/data";
import { languages, type Lang } from "@/lib/i18n";
import { defaultFieldTranslations } from "@/lib/translations";

const sectionsData: Record<string, { slug: string; title: string; description: string }> = {
  "fields": { slug: "fields", title: "العلوم الشرعية", description: "سبعة عشر علماً شرعياً" },
  "fatwa": { slug: "fatwa", title: "الفتاوى الشرعية", description: "إجابات فقهية" },
  "doubts": { slug: "doubts", title: "الرد على الشبهات", description: "ردود علمية" },
  "prayer-guide": { slug: "prayer-guide", title: "تعلم الصلاة", description: "دليل عملي" },
  "embrace-islam": { slug: "embrace-islam", title: "اعتنق الإسلام", description: "رحلتك نحو الهداية" },
  "dawah-guide": { slug: "dawah-guide", title: "دليل الدعاة", description: "كيف تدعو إلى الله" },
  "prophets-stories": { slug: "prophets-stories", title: "قصص الأنبياء", description: "دروس وعبر" },
  "quran": { slug: "quran", title: "المصحف الكريم", description: "اقرأ القرآن كاملاً" },
  "prayer-times": { slug: "prayer-times", title: "مواقيت الصلاة", description: "لكل دول العالم" },
  "qibla": { slug: "qibla", title: "تحديد القبلة", description: "من أي مكان" },
  "zakat": { slug: "zakat", title: "حاسبة الزكاة", description: "احسب زكاتك" },
  "atheism-response": { slug: "atheism-response", title: "الرد على الإلحاد", description: "شبهات وردود" },
  "youth-issues": { slug: "youth-issues", title: "قضايا الشباب", description: "مشاكل وحلول" },
  "khutab": { slug: "khutab", title: "مكتبة الخطب", description: "خطب جمعة" },
  "quran-memorization": { slug: "quran-memorization", title: "كيف تحفظ القرآن", description: "منهج عملي" },
  "ruqyah": { slug: "ruqyah", title: "الرقية الشرعية", description: "آيات وأدعية" },
  "hajj-guide": { slug: "hajj-guide", title: "دليل الحج والعمرة", description: "خطوة بخطوة" },
  "women-fatwas": { slug: "women-fatwas", title: "فتاوى المرأة", description: "قضايا المرأة" },
};

type Tab = "settings" | "general" | "sections" | "appearance" | "live" | "fields" | "lessons" | "videos" | "articles" | "books" | "audio" | "photos" | "schedule" | "fatwas" | "projects" | "news" | "places" | "adhkar" | "translations" | "questions" | "stats" | "notifications";
type Coll = "lessons" | "videos" | "articles" | "audio" | "photos" | "schedule" | "fields" | "books" | "fatwas" | "projects" | "news" | "places" | "adhkar";

const TABS: [Tab, string][] = [
  ["settings", "⚙️ بيانات الشيخ"],
  ["general", "🎨 الإعدادات العامة"],
  ["sections", "🎯 الأقسام"],
  ["appearance", "🎛️ الظهور"],
  ["live", "📡 البث والمجلس"],
  ["fields", "🧭 العلوم"],
  ["lessons", "📖 الدروس"],
  ["videos", "🎬 الفيديوهات"],
  ["articles", "✍️ المقالات"],
  ["books", "📚 الكتب"],
  ["audio", "🎧 الصوتيات"],
  ["photos", "🖼️ الصور"],
  ["schedule", "🗓️ الجدول"],
  ["fatwas", "❓ الفتاوى"],
  ["projects", "🤝 المشاريع"],
  ["news", "🗞️ الأخبار"],
  ["places", "🗺️ الأماكن"],
  ["adhkar", "🤲 الأذكار"],
  ["translations", "🌍 الترجمات"],
  ["questions", "💬 أسئلة الحسابات"],
  ["stats", "📊 الإحصائيات"],
  ["notifications", "🔔 إشعارات"],
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [c, setC] = useState<Content>(defaultContent);
  const [tab, setTab] = useState<Tab>("settings");
  const [msg, setMsg] = useState("");
  const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<any>(null);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifUrl, setNotifUrl] = useState("/ar");
  const [sectionSearch, setSectionSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.user && j.user.role === "admin") {
          setAuthed(true);
          setLoading(false);
          fetch("/api/content", { credentials: "include" })
            .then((r) => r.json())
            .then((j) => { setC(j.content); setLive(j.live); })
            .catch(() => setLive(false));
          fetch("/api/questions/admin", { credentials: "include" })
            .then((r) => r.json())
            .then((j) => setAdminQuestions(j.questions || []))
            .catch(() => {});
        } else {
          router.push("/ar/login");
        }
      })
      .catch(() => router.push("/ar/login"));
  }, [router]);

  useEffect(() => {
    if (authed) {
      fetch("/api/stats", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => setStats(j))
        .catch(() => {});
      fetch("/api/stats/advanced", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => setAdvancedStats(j))
        .catch(() => {});
    }
  }, [authed]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/ar/login");
  };

  const save = async () => {
    setMsg("⏳ جاري الحفظ…");
    const r = await fetch("/api/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: c }),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "✅ تم الحفظ — التغيير ظهر لكل الزوار فورًا" : "❌ " + (j.error || "فشل الحفظ"));
  };

  const setS = (k: keyof Settings, v: unknown) => setC({ ...c, settings: { ...c.settings, [k]: v } });

  const upd = (coll: Coll, i: number, patch: Record<string, unknown>) => {
    const list = (c[coll] as unknown as Record<string, unknown>[]).map((x, xi) => (xi === i ? { ...x, ...patch } : x));
    setC({ ...c, [coll]: list } as Content);
  };

  const del = (coll: Coll, i: number) => {
    const list = (c[coll] as unknown as unknown[]).filter((_, xi) => xi !== i);
    setC({ ...c, [coll]: list } as Content);
  };

  const add = (coll: Coll, item: unknown) => {
    setC({ ...c, [coll]: [item, ...(c[coll] as unknown as unknown[])] } as Content);
  };

  const answerQuestion = async (id: number) => {
    const answer = answers[id];
    if (!answer?.trim()) return;
    setMsg("⏳ جاري إرسال الإجابة…");
    const r = await fetch("/api/questions/admin", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, answer }),
    });
    const j = await r.json();
    if (j.ok) {
      setMsg("✅ تم إرسال الإجابة");
      setAdminQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, answer, status: "answered" } : q)));
    } else {
      setMsg("❌ " + (j.error || "فشل"));
    }
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
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b) => b && resolve(new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })), "image/jpeg", 0.85);
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const uploadFile = async (file: File, kind: "image" | "audio" | "doc"): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", kind === "image" ? await resizeImage(file) : file);
    fd.append("kind", kind);
    const r = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
    const j = await r.json();
    return j.url || null;
  };

  const setTranslation = (slug: string, lang: Lang, field: "name" | "desc", value: string) => {
    const current = c.fieldTranslations || {};
    const updated = {
      ...current,
      [slug]: { ...(current[slug] || {}), [lang]: { ...(current[slug]?.[lang] || defaultFieldTranslations[slug]?.[lang] || { name: "", desc: "" }), [field]: value } },
    };
    setC({ ...c, fieldTranslations: updated });
  };

  const getTranslationValue = (slug: string, lang: Lang, field: "name" | "desc"): string => {
    return c.fieldTranslations?.[slug]?.[lang]?.[field] ?? defaultFieldTranslations[slug]?.[lang]?.[field] ?? "";
  };

  const input = "w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gold focus:outline-none text-sm";
  const label = "block font-bold text-xs mb-1 text-gray-600";
  const itemBox = "border-2 border-gray-100 rounded-lg p-4 grid gap-3";
  const addBtn = "bg-primary text-gold py-3 rounded-lg font-bold hover:opacity-90 transition";
  const delBtn = "text-red-500 text-xs font-bold hover:underline";

  const fieldSelect = (coll: Coll, i: number, current: string) => (
    <select className={input} value={current} onChange={(e) => upd(coll, i, { field: e.target.value })}>
      {c.fields.map((f) => (<option key={f.slug} value={f.slug}>{f.icon} {f.name}</option>))}
    </select>
  );

  if (loading) {
    return (
      <div dir="rtl">
        <Header />
        <main className="py-24 text-center text-gray-500">⏳ جاري التحقق…</main>
        <Footer />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div dir="rtl" className="font-sans">
      <Header />
      <main className="py-12 bg-cream-dark min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {live === false && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">⚠️ قاعدة البيانات مش متصلة</div>
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
                <div><span className={label}>الشهادة الأولى</span><input className={input} value={c.settings.cred1} onChange={(e) => setS("cred1", e.target.value)} /></div>
                <div><span className={label}>الشهادة التانية</span><input className={input} value={c.settings.cred2} onChange={(e) => setS("cred2", e.target.value)} /></div>
                <div>
                  <span className={label}>الاهتمامات (كل سطر اهتمام)</span>
                  <textarea rows={3} className={input} value={c.settings.interests.join("\n")} onChange={(e) => setS("interests", e.target.value.split("\n"))} />
                </div>
                <div>
                  <span className={label}>الصورة الشخصية</span>
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setMsg("⏳ جاري الرفع…"); const u = await uploadFile(f, "image"); if (u) { setS("portraitSrc", u); setMsg("✅ اترفعت"); } else setMsg("❌ فشل"); }} className="text-sm" />
                  {c.settings.portraitSrc && <img src={c.settings.portraitSrc} className="w-24 h-24 object-cover rounded-lg mt-2 border-2 border-gold" />}
                </div>
                <div>
                  <span className={label}>صورة مشاركة الموقع (OG Image)</span>
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setMsg("⏳ جاري الرفع…"); const u = await uploadFile(f, "image"); if (u) { setS("ogImage", u); setMsg("✅ اترفعت"); } else setMsg("❌ فشل"); }} className="text-sm" />
                  {c.settings.ogImage && <img src={c.settings.ogImage} className="w-40 h-24 object-cover rounded-lg mt-2 border-2 border-gold" />}
                </div>
              </>
            )}

            {tab === "general" && (
              <>
                <h2 className="font-serif text-2xl text-primary border-b-2 border-gold pb-2">🎨 الإعدادات العامة</h2>
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold text-blue-900 mb-2">🏠 الصفحة الرئيسية</h3>
                  <div><span className={label}>نص البسملة فوق</span><input className={input} value={c.settings.homeKicker || ""} onChange={(e) => setS("homeKicker", e.target.value)} /></div>
                  <div className="mt-2"><span className={label}>نص الشعار الرئيسي</span><input className={input} value={c.settings.homeHeroText || ""} onChange={(e) => setS("homeHeroText", e.target.value)} /></div>
                </div>
                <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded">
                  <h3 className="font-bold text-purple-900 mb-2">🎨 ألوان الموقع</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <span className={label}>اللون الأساسي</span>
                      <input type="color" value={c.settings.primaryColor || "#0b2e22"} onChange={(e) => setS("primaryColor", e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                    </div>
                    <div>
                      <span className={label}>اللون الذهبي</span>
                      <input type="color" value={c.settings.goldColor || "#c9a227"} onChange={(e) => setS("goldColor", e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                    </div>
                    <div>
                      <span className={label}>لون الخلفية</span>
                      <input type="color" value={c.settings.creamColor || "#f5f1e8"} onChange={(e) => setS("creamColor", e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-bold text-yellow-900 mb-2">🔗 السوشيال ميديا</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><span className={label}>📘 فيسبوك</span><input className={input} value={c.settings.facebookUrl || ""} onChange={(e) => setS("facebookUrl", e.target.value)} /></div>
                    <div><span className={label}>📺 يوتيوب</span><input className={input} value={c.settings.youtubeUrl || ""} onChange={(e) => setS("youtubeUrl", e.target.value)} /></div>
                    <div><span className={label}>✈️ تيليجرام</span><input className={input} value={c.settings.telegramUrl || ""} onChange={(e) => setS("telegramUrl", e.target.value)} /></div>
                    <div><span className={label}>🐦 تويتر/X</span><input className={input} value={c.settings.twitterUrl || ""} onChange={(e) => setS("twitterUrl", e.target.value)} /></div>
                    <div><span className={label}>📷 إنستجرام</span><input className={input} value={c.settings.instagramUrl || ""} onChange={(e) => setS("instagramUrl", e.target.value)} /></div>
                  </div>
                </div>
                <button onClick={save} className={addBtn + " w-full"}>💾 حفظ كل الإعدادات العامة</button>
              </>
            )}

            {tab === "sections" && (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl mb-2">🎯 التحكم في الأقسام الظاهرة</h2>
                  <p className="text-white/80 text-sm">تحكم في الأقسام اللي تظهر في الصفحة الرئيسية + تخصيص الأيقونات والآيات</p>
                </div>

                <div className="mb-4">
                  <input
                    className={input}
                    placeholder="🔍 ابحث عن قسم..."
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  {Object.keys(sectionsData)
                    .filter(slug => 
                      sectionsData[slug].title.includes(sectionSearch) ||
                      slug.includes(sectionSearch.toLowerCase())
                    )
                    .map(slug => {
                      const data = sectionsData[slug];
                      const config = c.settings.sectionConfig?.[slug] || {
                        enabled: true,
                        showVerse: true,
                        showHadith: false,
                        icon: "star",
                        gradient: "from-primary to-primary/80",
                      };

                      const updateConfig = (key: string, value: any) => {
                        const current = c.settings.sectionConfig || {};
                        setS("sectionConfig", {
                          ...current,
                          [slug]: { ...config, [key]: value },
                        });
                      };

                      const toggleEnabled = () => {
                        const current = c.settings.visibleSections || [];
                        if (config.enabled) {
                          setS("visibleSections", current.filter(s => s !== slug));
                        } else {
                          setS("visibleSections", [...current, slug]);
                        }
                        updateConfig("enabled", !config.enabled);
                      };

                      return (
                        <div key={slug} className={`border-2 rounded-xl p-4 transition ${
                          config.enabled ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {config.icon === "mosque" ? "🕌" : 
                                 config.icon === "quran" ? "📖" :
                                 config.icon === "prayer" ? "🤲" :
                                 config.icon === "knowledge" ? "📚" :
                                 config.icon === "fatwa" ? "❓" :
                                 config.icon === "heart" ? "❤️" :
                                 config.icon === "star" ? "⭐" :
                                 config.icon === "crescent" ? "🌙" :
                                 config.icon === "kaaba" ? "🕋" :
                                 config.icon === "light" ? "💡" : "✨"}
                              </span>
                              <div>
                                <h3 className="font-bold text-primary">{data.title}</h3>
                                <p className="text-xs text-gray-500">{data.description}</p>
                              </div>
                            </div>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={toggleEnabled}
                                className="w-5 h-5 accent-gold"
                              />
                              <span className="mr-2 text-sm font-bold">{config.enabled ? "ظاهر" : "مخفي"}</span>
                            </label>
                          </div>

                          {config.enabled && (
                            <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.showVerse}
                                  onChange={(e) => updateConfig("showVerse", e.target.checked)}
                                  className="w-4 h-4 accent-gold"
                                />
                                <span className="text-sm">إظهار الآية</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.showHadith}
                                  onChange={(e) => updateConfig("showHadith", e.target.checked)}
                                  className="w-4 h-4 accent-gold"
                                />
                                <span className="text-sm">إظهار الحديث</span>
                              </label>
                              
                              <div>
                                <span className={label}>الأيقونة</span>
                                <select
                                  className={input}
                                  value={config.icon}
                                  onChange={(e) => updateConfig("icon", e.target.value)}
                                >
                                  <option value="mosque">🕌 مسجد</option>
                                  <option value="quran">📖 قرآن</option>
                                  <option value="prayer">🤲 صلاة</option>
                                  <option value="knowledge">📚 علم</option>
                                  <option value="fatwa">❓ فتوى</option>
                                  <option value="heart">❤️ قلب</option>
                                  <option value="star">⭐ نجمة</option>
                                  <option value="crescent">🌙 هلال</option>
                                  <option value="kaaba">🕋 كعبة</option>
                                  <option value="light">💡 نور</option>
                                </select>
                              </div>

                              <div>
                                <span className={label}>التدرج اللوني</span>
                                <select
                                  className={input}
                                  value={config.gradient}
                                  onChange={(e) => updateConfig("gradient", e.target.value)}
                                >
                                  <option value="from-emerald-600 to-emerald-700">أخضر زمردي</option>
                                  <option value="from-blue-600 to-blue-700">أزرق</option>
                                  <option value="from-purple-600 to-purple-700">بنفسجي</option>
                                  <option value="from-teal-600 to-teal-700">أزرق مخضر</option>
                                  <option value="from-rose-600 to-rose-700">وردي</option>
                                  <option value="from-amber-600 to-amber-700">كهرماني</option>
                                  <option value="from-indigo-600 to-indigo-700">نيلي</option>
                                  <option value="from-green-600 to-green-700">أخضر</option>
                                  <option value="from-cyan-600 to-cyan-700">سماوي</option>
                                  <option value="from-orange-600 to-orange-700">برتقالي</option>
                                  <option value="from-pink-600 to-pink-700">زهري</option>
                                  <option value="from-red-600 to-red-700">أحمر</option>
                                  <option value="from-violet-600 to-violet-700">بنفسجي فاتح</option>
                                  <option value="from-yellow-600 to-yellow-700">أصفر</option>
                                  <option value="from-lime-600 to-lime-700">ليموني</option>
                                  <option value="from-fuchsia-600 to-fuchsia-700">فوشيا</option>
                                  <option value="from-stone-600 to-stone-700">حجري</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <button onClick={save} className={addBtn + " w-full mt-6"}>💾 حفظ التغييرات</button>
              </>
            )}

            {tab === "appearance" && (
              <label className="flex items-center justify-between border-2 border-gray-100 rounded-lg p-4 cursor-pointer">
                <span className="font-bold text-sm">🕌 شريط مواقيت الصلاة + التاريخ الهجري</span>
                <input type="checkbox" checked={Boolean(c.settings.showPrayerBar)} onChange={(e) => setS("showPrayerBar", e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              </label>
            )}

            {tab === "live" && (
              <>
                <div><span className={label}>عنوان البث</span><input className={input} value={c.settings.liveTitle} onChange={(e) => setS("liveTitle", e.target.value)} /></div>
                <div><span className={label}>رابط البث</span><input className={input} value={c.settings.liveUrl} onChange={(e) => setS("liveUrl", e.target.value)} /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><span className={label}>يوم المجلس</span><input className={input} value={c.settings.meetingDay} onChange={(e) => setS("meetingDay", e.target.value)} /></div>
                  <div><span className={label}>وقت المجلس</span><input className={input} value={c.settings.meetingTime} onChange={(e) => setS("meetingTime", e.target.value)} /></div>
                </div>
                <div><span className={label}>مكان المجلس</span><input className={input} value={c.settings.meetingPlace} onChange={(e) => setS("meetingPlace", e.target.value)} /></div>
                <div><span className={label}>رابط الخريطة</span><input className={input} value={c.settings.meetingLink} onChange={(e) => setS("meetingLink", e.target.value)} /></div>
              </>
            )}

            {tab === "fields" && (
              <>
                {c.fields.map((f, i) => (
                  <div key={f.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">علم #{i + 1}</b><button onClick={() => del("fields", i)} className={delBtn}>🗑 حذف</button></div>
                    <div className="grid grid-cols-3 gap-3">
                      <input className={input} value={f.name} onChange={(e) => upd("fields", i, { name: e.target.value })} />
                      <input className={input} value={f.slug} onChange={(e) => upd("fields", i, { slug: e.target.value })} />
                      <input className={input} value={f.icon} onChange={(e) => upd("fields", i, { icon: e.target.value })} />
                    </div>
                    <input className={input} value={f.desc} onChange={(e) => upd("fields", i, { desc: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("fields", { id: Date.now(), slug: "new", name: "علم جديد", icon: "📚", desc: "" })} className={addBtn}>➕ إضافة علم</button>
              </>
            )}

            {tab === "lessons" && (
              <>
                {c.lessons.map((l, i) => (
                  <div key={l.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">درس #{i + 1}</b><button onClick={() => del("lessons", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={l.title} onChange={(e) => upd("lessons", i, { title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={l.category} onChange={(e) => upd("lessons", i, { category: e.target.value })} />
                      {fieldSelect("lessons", i, l.field)}
                    </div>
                    <input className={input} value={l.link} onChange={(e) => upd("lessons", i, { link: e.target.value })} />
                    <textarea rows={2} className={input} value={l.desc} onChange={(e) => upd("lessons", i, { desc: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("lessons", { id: Date.now(), title: "درس جديد", category: "", date: String(new Date().getFullYear()), link: "", desc: "", field: c.fields[0]?.slug || "" })} className={addBtn}>➕ إضافة درس</button>
              </>
            )}

            {tab === "videos" && (
              <>
                {c.videos.map((v, i) => (
                  <div key={v.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">فيديو #{i + 1}</b><button onClick={() => del("videos", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={v.title} onChange={(e) => upd("videos", i, { title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={v.url} onChange={(e) => upd("videos", i, { url: e.target.value })} />
                      {fieldSelect("videos", i, v.field)}
                    </div>
                    <textarea rows={2} className={input} value={v.desc} onChange={(e) => upd("videos", i, { desc: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("videos", { id: Date.now(), title: "فيديو جديد", url: "", desc: "", field: c.fields[0]?.slug || "" })} className={addBtn}>➕ إضافة فيديو</button>
              </>
            )}

            {tab === "articles" && (
              <>
                {c.articles.map((a, i) => (
                  <div key={a.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">مقال #{i + 1}</b><button onClick={() => del("articles", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={a.title} onChange={(e) => upd("articles", i, { title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={a.date} onChange={(e) => upd("articles", i, { date: e.target.value })} />
                      {fieldSelect("articles", i, a.field)}
                    </div>
                    <textarea rows={2} className={input} value={a.excerpt} onChange={(e) => upd("articles", i, { excerpt: e.target.value })} />
                    <textarea rows={6} className={input} value={a.body} onChange={(e) => upd("articles", i, { body: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("articles", { id: Date.now(), title: "مقال جديد", date: new Date().toLocaleDateString("ar-EG"), excerpt: "", body: "", field: c.fields[0]?.slug || "" })} className={addBtn}>➕ كتابة مقال</button>
              </>
            )}

            {tab === "books" && (
              <>
                {c.books.map((b, i) => (
                  <div key={b.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">كتاب #{i + 1}</b><button onClick={() => del("books", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={b.title} onChange={(e) => upd("books", i, { title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      {fieldSelect("books", i, b.field)}
                      <input className={input} value={b.url} onChange={(e) => upd("books", i, { url: e.target.value })} />
                    </div>
                    <textarea rows={2} className={input} value={b.desc} onChange={(e) => upd("books", i, { desc: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("books", { id: Date.now(), title: "كتاب جديد", field: c.fields[0]?.slug || "", url: "", desc: "" })} className={addBtn}>➕ إضافة كتاب</button>
              </>
            )}

            {tab === "audio" && (
              <>
                {c.audio.map((a, i) => (
                  <div key={a.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">مقطع #{i + 1}</b><button onClick={() => del("audio", i)} className={delBtn}>🗑 حذف</button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={a.title} onChange={(e) => upd("audio", i, { title: e.target.value })} />
                      {fieldSelect("audio", i, a.field)}
                    </div>
                    <textarea rows={2} className={input} value={a.desc} onChange={(e) => upd("audio", i, { desc: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("audio", { id: Date.now(), title: "مقطع جديد", url: "", desc: "", field: c.fields[0]?.slug || "" })} className={addBtn}>➕ إضافة مقطع</button>
              </>
            )}

            {tab === "photos" && (
              <>
                <div>
                  <span className={label}>رفع صور جديدة</span>
                  <input type="file" accept="image/*" multiple onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setMsg("⏳ جاري الرفع…");
                    const items: Photo[] = [];
                    for (const f of files) {
                      const u = await uploadFile(f, "image");
                      if (u) items.push({ id: Date.now() + Math.random(), url: u, caption: "", field: c.fields[0]?.slug || "" });
                    }
                    setC((prev) => ({ ...prev, photos: [...items, ...prev.photos] } as Content));
                    setMsg("✅ اترفعت");
                  }} className="text-sm" />
                </div>
                <div><span className={label}>رابط APK</span><input className={input} value={c.settings.appUrl} onChange={(e) => setS("appUrl", e.target.value)} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {c.photos.map((p, i) => (
                    <div key={p.id} className="border-2 border-gray-100 rounded-lg p-3 grid gap-2">
                      <img src={p.url} className="w-full h-40 object-cover rounded-lg" />
                      <input className={input} value={p.caption} onChange={(e) => upd("photos", i, { caption: e.target.value })} />
                      {fieldSelect("photos", i, p.field)}
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
                    <input className={input} value={s.day} onChange={(e) => upd("schedule", i, { day: e.target.value })} />
                    <input className={input} value={s.time} onChange={(e) => upd("schedule", i, { time: e.target.value })} />
                    <input className={input} value={s.topic} onChange={(e) => upd("schedule", i, { topic: e.target.value })} />
                    <input className={input} value={s.place} onChange={(e) => upd("schedule", i, { place: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("schedule", { id: Date.now(), day: "السبت", time: "", topic: "", place: "" })} className={addBtn}>➕ إضافة موعد</button>
              </>
            )}

            {tab === "fatwas" && (
              <>
                {c.fatwas.map((f, i) => (
                  <div key={f.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">فتوى #{i + 1}</b><button onClick={() => del("fatwas", i)} className={delBtn}>🗑 حذف</button></div>
                    <textarea rows={2} className={input} value={f.q} onChange={(e) => upd("fatwas", i, { q: e.target.value })} />
                    <textarea rows={4} className={input} value={f.a} onChange={(e) => upd("fatwas", i, { a: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("fatwas", { id: Date.now(), q: "", a: "" })} className={addBtn}>➕ إضافة فتوى</button>
              </>
            )}

            {tab === "projects" && (
              <>
                {c.projects.map((p, i) => (
                  <div key={p.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">مشروع #{i + 1}</b><button onClick={() => del("projects", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={p.title} onChange={(e) => upd("projects", i, { title: e.target.value })} />
                    <textarea rows={2} className={input} value={p.desc} onChange={(e) => upd("projects", i, { desc: e.target.value })} />
                    <input className={input} value={p.goal} onChange={(e) => upd("projects", i, { goal: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("projects", { id: Date.now(), title: "", desc: "", goal: "" })} className={addBtn}>➕ إضافة مشروع</button>
              </>
            )}

            {tab === "news" && (
              <>
                {c.news.map((n, i) => (
                  <div key={n.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">خبر #{i + 1}</b><button onClick={() => del("news", i)} className={delBtn}>🗑 حذف</button></div>
                    <input className={input} value={n.title} onChange={(e) => upd("news", i, { title: e.target.value })} />
                    <input className={input} value={n.date} onChange={(e) => upd("news", i, { date: e.target.value })} />
                    <textarea rows={4} className={input} value={n.body} onChange={(e) => upd("news", i, { body: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("news", { id: Date.now(), title: "", date: new Date().toLocaleDateString("ar-EG"), body: "" })} className={addBtn}>➕ إضافة خبر</button>
              </>
            )}

            {tab === "places" && (
              <>
                {c.places.map((p, i) => (
                  <div key={p.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">مكان #{i + 1}</b><button onClick={() => del("places", i)} className={delBtn}>🗑 حذف</button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={p.name} onChange={(e) => upd("places", i, { name: e.target.value })} />
                      <input className={input} value={p.area} onChange={(e) => upd("places", i, { area: e.target.value })} />
                    </div>
                    <input className={input} value={p.note} onChange={(e) => upd("places", i, { note: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("places", { id: Date.now(), name: "", area: "", note: "" })} className={addBtn}>➕ إضافة مكان</button>
              </>
            )}

            {tab === "adhkar" && (
              <>
                {c.adhkar.map((a, i) => (
                  <div key={a.id} className={itemBox}>
                    <div className="flex justify-between items-center"><b className="text-sm text-primary">ذكر #{i + 1}</b><button onClick={() => del("adhkar", i)} className={delBtn}>🗑 حذف</button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className={input} value={a.category} onChange={(e) => upd("adhkar", i, { category: e.target.value })} />
                      <input type="number" min={1} className={input} value={a.repeat} onChange={(e) => upd("adhkar", i, { repeat: Number(e.target.value) || 1 })} />
                    </div>
                    <textarea rows={3} className={input} value={a.text} onChange={(e) => upd("adhkar", i, { text: e.target.value })} />
                  </div>
                ))}
                <button onClick={() => add("adhkar", { id: Date.now(), category: "أذكار الصباح", text: "", repeat: 1 })} className={addBtn}>➕ إضافة ذكر</button>
              </>
            )}

            {tab === "translations" && (
              <>
                <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded mb-2">
                  <h2 className="font-bold text-lg text-primary mb-1">🌍 إدارة الترجمات</h2>
                  <p className="text-sm text-gray-600">تحكم في ترجمة أسماء العلوم ووصفها في كل لغة</p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-sm text-primary mb-2">🌐 اللغات المتاحة ({languages.length}):</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <span key={l.code} className="bg-white border border-gold/40 px-3 py-1 rounded-full text-xs font-bold">
                        {l.flag} {l.name}
                      </span>
                    ))}
                  </div>
                </div>
                {c.fields.map((f) => (
                  <details key={f.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-100">
                    <summary className="cursor-pointer font-bold flex items-center gap-2">
                      <span className="text-2xl">{f.icon}</span>
                      <span className="text-primary">{f.name}</span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      {languages.map((l) => (
                        <div key={l.code} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{l.flag}</span>
                            <span className="font-bold text-sm text-primary">{l.name}</span>
                          </div>
                          <div className="grid gap-2">
                            <input className={input} value={getTranslationValue(f.slug, l.code, "name")} onChange={(e) => setTranslation(f.slug, l.code, "name", e.target.value)} placeholder="اسم العلم" />
                            <input className={input} value={getTranslationValue(f.slug, l.code, "desc")} onChange={(e) => setTranslation(f.slug, l.code, "desc", e.target.value)} placeholder="الوصف" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
                <button onClick={save} className={addBtn + " w-full"}>💾 حفظ الترجمات</button>
              </>
            )}

            {tab === "questions" && (
              <>
                <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded mb-4">
                  <p className="text-sm text-amber-800">💬 الأسئلة الخاصة من المستخدمين المسجلين</p>
                </div>
                {adminQuestions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد أسئلة بعد</p>
                ) : (
                  adminQuestions.map((q) => (
                    <div key={q.id} className={itemBox}>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <b className="text-sm text-primary">سؤال #{q.id}</b>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${q.status === "answered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {q.status === "answered" ? "✅ تمت الإجابة" : "⏳ في الانتظار"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">👤 {q.users?.name} — {q.users?.email}</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-bold text-primary">❓ {q.question}</p>
                      </div>
                      {q.status === "answered" ? (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm text-green-800 whitespace-pre-line">{q.answer}</p>
                        </div>
                      ) : (
                        <>
                          <textarea rows={3} className={input} value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="اكتب الإجابة…" />
                          <button onClick={() => answerQuestion(q.id)} className="bg-gold text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold-light transition">إرسال الإجابة</button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {tab === "stats" && (
              <>
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl text-gold mb-2">📊 إحصائيات متقدمة</h2>
                  <p className="text-white/80 text-sm">تحليل شامل لأداء الموقع</p>
                </div>

                <div className="grid sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-blue-500">
                    <p className="text-sm text-gray-500 mb-1">👁️ زيارات اليوم</p>
                    <p className="text-3xl font-bold text-blue-600">{advancedStats?.todayViews || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-green-500">
                    <p className="text-sm text-gray-500 mb-1">📧 مشتركين النشرة</p>
                    <p className="text-3xl font-bold text-green-600">{advancedStats?.subscribers || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-amber-500">
                    <p className="text-sm text-gray-500 mb-1">❓ أسئلة في الانتظار</p>
                    <p className="text-3xl font-bold text-amber-600">{stats?.questions?.pending || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-purple-500">
                    <p className="text-sm text-gray-500 mb-1">👥 إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.users?.total || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                  <h3 className="font-bold text-primary text-lg mb-4">🔥 أكثر الصفحات زيارة (آخر 7 أيام)</h3>
                  {advancedStats?.topPages && advancedStats.topPages.length > 0 ? (
                    <div className="space-y-2">
                      {advancedStats.topPages.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-cream-dark rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-gold text-gray-900 rounded-full grid place-items-center font-bold text-sm">
                              {i + 1}
                            </span>
                            <span className="font-mono text-sm">{p.page}</span>
                          </div>
                          <span className="bg-primary text-gold px-3 py-1 rounded-full text-sm font-bold">
                            {p.count} زيارة
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات بعد</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                  <h3 className="font-bold text-primary text-lg mb-4">🌍 أكثر اللغات استخداماً (آخر 30 يوم)</h3>
                  {advancedStats?.topLanguages && advancedStats.topLanguages.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {advancedStats.topLanguages.map((l: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-cream-dark rounded-lg">
                          <span className="font-bold">{l.lang?.toUpperCase()}</span>
                          <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-bold">
                            {l.count} زيارة
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">لا توجد بيانات بعد</p>
                  )}
                </div>

                {stats && (
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="font-bold text-primary text-lg mb-4">📚 إحصائيات المحتوى</h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">🧭 العلوم</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.fields || 0}</span>
                      </div>
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">📖 الدروس</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.lessons || 0}</span>
                      </div>
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">🎬 الفيديوهات</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.videos || 0}</span>
                      </div>
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">✍️ المقالات</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.articles || 0}</span>
                      </div>
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">📚 الكتب</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.books || 0}</span>
                      </div>
                      <div className="bg-cream-dark rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-bold">❓ الفتاوى</span>
                        <span className="text-xl font-bold text-gold">{stats.content?.fatwas || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "notifications" && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-6 mb-6">
                  <h2 className="font-serif text-2xl mb-2">🔔 إرسال إشعار للمستخدمين</h2>
                  <p className="text-white/80 text-sm">أرسل إشعاراً لكل المستخدمين عند نزول درس جديد أو فتوى مهمة</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                  <div>
                    <span className={label}>عنوان الإشعار</span>
                    <input
                      className={input}
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="مثال: درس جديد في العقيدة"
                    />
                  </div>
                  <div>
                    <span className={label}>نص الإشعار</span>
                    <textarea
                      rows={3}
                      className={input}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="شرح مختصر للدرس أو الفتوى..."
                    />
                  </div>
                  <div>
                    <span className={label}>رابط الصفحة (اختياري)</span>
                    <input
                      className={input}
                      value={notifUrl}
                      onChange={(e) => setNotifUrl(e.target.value)}
                      placeholder="/ar/fields/aqeedah"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!notifTitle || !notifBody) {
                        setMsg("❌ اكتب العنوان والنص");
                        return;
                      }
                      setMsg("⏳ جاري إرسال الإشعار...");
                      const r = await fetch("/api/notifications/send", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: notifTitle, body: notifBody, url: notifUrl }),
                      });
                      const j = await r.json();
                      if (j.ok) {
                        setMsg("✅ تم إرسال الإشعار بنجاح");
                        setNotifTitle("");
                        setNotifBody("");
                        setNotifUrl("/ar");
                      } else {
                        setMsg("❌ " + (j.error || "فشل الإرسال"));
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    🔔 إرسال الإشعار الآن
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}