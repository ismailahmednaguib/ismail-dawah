// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // ===== فحص القفل =====
  useEffect(() => {
    if (lockedUntil) {
      const remaining = lockedUntil - Date.now();
      if (remaining > 0) {
        const timer = setTimeout(() => setLockedUntil(null), remaining);
        return () => clearTimeout(timer);
      } else {
        setLockedUntil(null);
        setAttempts(0);
      }
    }
  }, [lockedUntil]);

  const remainingSeconds = lockedUntil
    ? Math.ceil((lockedUntil - Date.now()) / 1000)
    : 0;

  const submit = async () => {
    setMsg(null);

    // فحص القفل
    if (lockedUntil && Date.now() < lockedUntil) {
      setMsg({
        type: "error",
        text: `⏳ تم قفل الحساب مؤقتاً. حاول بعد ${remainingSeconds} ثانية.`,
      });
      return;
    }

    // Honeypot check
    if (website.trim()) {
      // Bot detected - pretend success but do nothing
      setMsg({ type: "success", text: "✓ جاري التحويل..." });
      return;
    }

    // Validation
    if (!email.trim() || !password) {
      setMsg({ type: "error", text: "❌ البريد الإلكتروني وكلمة المرور مطلوبان" });
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg({ type: "error", text: "❌ صيغة البريد الإلكتروني غير صحيحة" });
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const j = await r.json();

      if (j.ok) {
        setMsg({ type: "success", text: "✓ تم تسجيل الدخول بنجاح، جاري التحويل..." });
        setTimeout(() => router.push("/admin"), 800);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // قفل بعد 5 محاولات فاشلة
        if (newAttempts >= 5) {
          const lockTime = Date.now() + 60000; // 60 ثانية
          setLockedUntil(lockTime);
          setMsg({
            type: "error",
            text: "🔒 تم قفل الحساب لمدة 60 ثانية بسبب محاولات كثيرة فاشلة.",
          });
          setAttempts(0);
        } else {
          setMsg({
            type: "error",
            text: `❌ ${j.error || "بيانات الدخول غير صحيحة"} (${newAttempts}/5)`,
          });
        }
      }
    } catch {
      setMsg({ type: "error", text: "❌ خطأ في الاتصال بالخادم. تحقق من الإنترنت." });
    }
    setLoading(false);
  };

  return (
    <main
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-cream-dark dark:bg-gray-900 flex items-center justify-center px-4 py-12"
    >
      {/* خلفية زخرفية */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #0e7490 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* رابط العودة */}
        <Link
          href="/ar"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          العودة للرئيسية
        </Link>

        {/* البطاقة الرئيسية */}
        <div className="card relative overflow-hidden border-t-4 border-gold-500 p-8 shadow-2xl">
          {/* شارة الأدمن */}
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </span>
            </div>

            <h1
              className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🔑 لوحة الإدارة
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              دخول خاص بصاحب الموقع والمشرفين فقط
            </p>
          </div>

          {/* النموذج */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-4"
          >
            {/* Honeypot - مخفي للبشر مرئي للبوتات */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  dir="ltr"
                  autoComplete="email"
                  disabled={loading || !!lockedUntil}
                  className="input-islamic !ps-12 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  disabled={loading || !!lockedUntil}
                  className="input-islamic !ps-12 !pe-12 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || !!lockedUntil}
                  className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-slate-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300 disabled:opacity-50"
                  tabIndex={-1}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* رسالة الحالة */}
            {msg && (
              <div
                className={`rounded-xl p-4 text-sm font-bold ${
                  msg.type === "success"
                    ? "border border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300"
                    : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* تحذير القفل */}
            {lockedUntil && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-bold text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
                🔒 الحساب مقفل لمدة {remainingSeconds} ثانية
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading || !!lockedUntil}
              className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-4 text-lg font-black text-gray-900 shadow-lg shadow-gold-500/25 transition-all hover:from-gold-600 hover:to-gold-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="31.4 31.4"
                    />
                  </svg>
                  جاري الدخول...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  تسجيل الدخول
                </span>
              )}
            </button>
          </form>

          {/* تذييل */}
          <div className="mt-6 border-t border-slate-100 pt-6 text-center dark:border-night-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              🔒 محمي بتشفير SSL • جميع المحاولات مُسجّلة
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} منصة إسماعيل أحمد نجيب
            </p>
          </div>
        </div>

        {/* تنبيه أمني */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ⚠️ هذه الصفحة للمشرفين فقط. جميع محاولات الدخول مسجلة.
          </p>
        </div>
      </div>
    </main>
  );
}