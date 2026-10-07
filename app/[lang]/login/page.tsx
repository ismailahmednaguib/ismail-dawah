"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { t, type Lang } from "@/lib/i18n";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { name, email, password };

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();

      if (r.ok) {
        setMsg("✅ تم بنجاح! جاري التحويل...");
        setTimeout(() => router.push(`/${lang}/account`), 1000);
      } else {
        setMsg("❌ " + (j.error || "حدث خطأ"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setLoading(false);
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="🔐"
          title={mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          subtitle="انضم إلينا واسأل الشيخ خصوصياً"
          hadith="الْمُسْلِمُ أَخُو الْمُسْلِمِ"
          gradient="from-indigo-600 via-indigo-700 to-indigo-800"
        />

        <section className="py-10">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              {/* التبويبات */}
              <div className="flex gap-2 mb-6 bg-cream-dark dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${
                    mode === "login" ? "bg-gold text-gray-900" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  🔐 تسجيل الدخول
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${
                    mode === "register" ? "bg-gold text-gray-900" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  ✨ حساب جديد
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">الاسم</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                      placeholder="اسمك الكريم"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                    placeholder="••••••••"
                    dir="ltr"
                    minLength={6}
                  />
                </div>

                {msg && (
                  <div className={`p-3 rounded-lg text-sm font-bold ${
                    msg.startsWith("✅") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}>
                    {msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gold-light transition disabled:opacity-50"
                >
                  {loading ? "⏳ جاري..." : mode === "login" ? "🔐 دخول" : "✨ إنشاء حساب"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                  <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="text-gold font-bold mr-2 hover:underline"
                  >
                    {mode === "login" ? "سجل الآن" : "سجل دخول"}
                  </button>
                </p>
              </div>
            </div>

            {/* فوائد التسجيل */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mt-6">
              <h3 className="font-serif text-xl text-primary dark:text-gold mb-4">🌟 فوائد التسجيل:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">اسأل الشيخ أسئلة خاصة</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">احفظ تقدمك في التعلم</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">احفظ صفحاتك المفضلة</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">استلم إشعارات بالمحتوى الجديد</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}