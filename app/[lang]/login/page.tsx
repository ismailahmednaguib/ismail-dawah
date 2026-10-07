"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { defaultContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const c = defaultContent;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMsg("");
    if (!email.trim() || !password) {
      setMsg("❌ الإيميل وكلمة المرور مطلوبين");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (j.ok) {
        // حسب الـ role، نوجه المستخدم للمكان الصح
        if (j.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push(`/${lang}/account`);
        }
      } else {
        setMsg("❌ " + (j.error || "خطأ في الدخول"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setLoading(false);
  };

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border-t-4 border-gold">
            <h1 className="font-serif text-3xl text-primary dark:text-gold text-center mb-2">🔑 تسجيل الدخول</h1>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
              مرحبًا بعودتك
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="كلمة المرور"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
                />
              </div>

              {msg && <p className="text-sm text-red-500 text-center">{msg}</p>}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
              >
                {loading ? "⏳ جاري الدخول…" : "تسجيل الدخول"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                مش عندك حساب؟{" "}
                <Link href={`/${lang}/register`} className="text-gold font-bold hover:underline">
                  إنشاء حساب
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}