// app/[lang]/login/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import type { Lang } from "@/lib/i18n";

// ============================================================
// نصوص الواجهة
// ============================================================

type UILang = {
  home: string;
  loginTitle: string;
  registerTitle: string;
  subtitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  loginButton: string;
  registerButton: string;
  loading: string;
  noAccount: string;
  hasAccount: string;
  registerNow: string;
  loginNow: string;
  benefitsTitle: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  benefit4: string;
  benefit5: string;
  successMessage: string;
  errorMessage: string;
  connectionError: string;
  redirecting: string;
  safeTitle: string;
  safeDesc: string;
  verse: string;
  verseSource: string;
  safeCount: string;
  fastCount: string;
  freeCount: string;
  syncCount: string;
  relatedTitle: string;
  accountPage: string;
  accountPageDesc: string;
  bookmarksPage: string;
  bookmarksPageDesc: string;
  contactPage: string;
  contactPageDesc: string;
  privacyPage: string;
  privacyPageDesc: string;
  showPassword: string;
  hidePassword: string;
  termsAgree: string;
  termsLink: string;
  privacyLink: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    home: "الرئيسية",
    loginTitle: "تسجيل الدخول",
    registerTitle: "إنشاء حساب جديد",
    subtitle: "انضم إلى مجتمع منصة إسماعيل أحمد نجيب الدعوية",
    name: "الاسم",
    namePlaceholder: "اسمك الكريم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    loginButton: "تسجيل الدخول",
    registerButton: "إنشاء حساب",
    loading: "جاري...",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    registerNow: "سجل الآن",
    loginNow: "سجل دخول",
    benefitsTitle: "فوائد التسجيل",
    benefit1: "اسأل الشيخ أسئلة خاصة",
    benefit2: "احفظ تقدمك في التعلم والأذكار",
    benefit3: "احفظ صفحاتك المفضلة",
    benefit4: "استلم إشعارات بالمحتوى الجديد",
    benefit5: "مزامنة بياناتك بين الأجهزة",
    successMessage: "تم بنجاح!",
    errorMessage: "حدث خطأ",
    connectionError: "خطأ في الاتصال",
    redirecting: "جاري التحويل...",
    safeTitle: "حسابك آمن ومحمي",
    safeDesc: "نستخدم تشفيراً متقدماً لحماية بياناتك ولا نشاركها مع أي طرف ثالث.",
    verse: "﴿ إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ﴾",
    verseSource: "سورة الحجرات — الآية 10",
    safeCount: "آمن 100%",
    fastCount: "سريع",
    freeCount: "مجاني",
    syncCount: "مزامنة",
    relatedTitle: "صفحات ذات صلة",
    accountPage: "حسابي",
    accountPageDesc: "إدارة حسابك وإعداداتك.",
    bookmarksPage: "المفضلة",
    bookmarksPageDesc: "صفحاتك المحفوظة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للدعم والمساعدة.",
    privacyPage: "سياسة الخصوصية",
    privacyPageDesc: "كيف نحمي بياناتك.",
    showPassword: "إظهار",
    hidePassword: "إخفاء",
    termsAgree: "بالتسجيل، أنت توافق على",
    termsLink: "الشروط والأحكام",
    privacyLink: "سياسة الخصوصية",
  },
  en: {
    home: "Home",
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    subtitle: "Join the Ismail Ahmed Naguib Dawah Platform community",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    loginButton: "Sign In",
    registerButton: "Create Account",
    loading: "Loading...",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerNow: "Register now",
    loginNow: "Sign in",
    benefitsTitle: "Benefits of Registration",
    benefit1: "Ask the Sheikh private questions",
    benefit2: "Save your learning and adhkar progress",
    benefit3: "Save your favorite pages",
    benefit4: "Receive notifications about new content",
    benefit5: "Sync your data across devices",
    successMessage: "Success!",
    errorMessage: "An error occurred",
    connectionError: "Connection error",
    redirecting: "Redirecting...",
    safeTitle: "Your Account is Safe and Protected",
    safeDesc: "We use advanced encryption to protect your data and never share it with third parties.",
    verse: "\"The believers are but brothers, so make settlement between your brothers.\"",
    verseSource: "Surah Al-Hujurat — Verse 10",
    safeCount: "100% Safe",
    fastCount: "Fast",
    freeCount: "Free",
    syncCount: "Sync",
    relatedTitle: "Related Pages",
    accountPage: "My Account",
    accountPageDesc: "Manage your account and settings.",
    bookmarksPage: "Bookmarks",
    bookmarksPageDesc: "Your saved pages.",
    contactPage: "Contact Us",
    contactPageDesc: "For support and help.",
    privacyPage: "Privacy Policy",
    privacyPageDesc: "How we protect your data.",
    showPassword: "Show",
    hidePassword: "Hide",
    termsAgree: "By registering, you agree to our",
    termsLink: "Terms & Conditions",
    privacyLink: "Privacy Policy",
  },
};

// ============================================================
// المكون الرئيسي
// ============================================================

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const ui = UI[L];

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

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
        setMsg({ type: "success", text: `✅ ${ui.successMessage} ${ui.redirecting}` });
        setTimeout(() => router.push(`/${lang}/account`), 1000);
      } else {
        setMsg({ type: "error", text: `❌ ${j.error || ui.errorMessage}` });
      }
    } catch {
      setMsg({ type: "error", text: `❌ ${ui.connectionError}` });
    }
    setLoading(false);
  };

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: mode === "login" ? ui.loginTitle : ui.registerTitle,
    description: ui.subtitle,
    inLanguage: L,
    url: `/${L}/login`,
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={L} />

      <TopBar
        title={mode === "login" ? ui.loginTitle : ui.registerTitle}
        subtitle={ui.subtitle}
        backHref={`/${L}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${L}` },
          { label: mode === "login" ? ui.loginTitle : ui.registerTitle },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-10 dark:border-primary-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #4f46e5, #0e7490)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </div>

            <span className="badge-primary mb-3">
              🔐 {isRTL ? "منطقة المستخدم" : "User Area"}
            </span>

            <h1
              className="mb-3 text-2xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {mode === "login" ? ui.loginTitle : ui.registerTitle}
            </h1>

            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.subtitle}
            </p>

            {/* آية كريمة */}
            <div className="mt-6 rounded-2xl border border-gold-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
              <p
                className="mb-1 text-lg font-black text-gold-700 md:text-xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon="🔒" label={ui.safeCount} color="primary" />
          <StatCard icon="⚡" label={ui.fastCount} color="gold" />
          <StatCard icon="✨" label={ui.freeCount} color="primary" />
          <StatCard icon="🔄" label={ui.syncCount} color="gold" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          {/* ===== نموذج التسجيل/الدخول ===== */}
          <div className="card p-6 md:p-8">
            {/* التبويبات */}
            <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-night-800">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                🔐 {ui.loginTitle}
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                  mode === "register"
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                ✨ {ui.registerTitle}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* الاسم - فقط في التسجيل */}
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.name}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-islamic"
                    placeholder={ui.namePlaceholder}
                  />
                </div>
              )}

              {/* البريد الإلكتروني */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-islamic"
                  placeholder={ui.emailPlaceholder}
                  dir="ltr"
                />
              </div>

              {/* كلمة المرور */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-islamic !pe-12"
                    placeholder={ui.passwordPlaceholder}
                    dir="ltr"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-slate-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300"
                    tabIndex={-1}
                  >
                    {showPassword ? ui.hidePassword : ui.showPassword}
                  </button>
                </div>
              </div>

              {/* تذكرني + نسيت كلمة المرور (تسجيل الدخول فقط) */}
              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    {ui.rememberMe}
                  </label>

                  <Link
                    href={`/${L}/contact`}
                    className="text-sm font-bold text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
                  >
                    {ui.forgotPassword}
                  </Link>
                </div>
              )}

              {/* الشروط والأحكام (التسجيل فقط) */}
              {mode === "register" && (
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.termsAgree}{" "}
                  <Link href={`/${L}/terms`} className="font-bold text-primary-700 hover:underline dark:text-primary-300">
                    {ui.termsLink}
                  </Link>{" "}
                  {isRTL ? "و" : "and"}{" "}
                  <Link href={`/${L}/privacy`} className="font-bold text-primary-700 hover:underline dark:text-primary-300">
                    {ui.privacyLink}
                  </Link>
                </p>
              )}

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

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25"
                    : "bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg shadow-gold-500/25"
                } disabled:cursor-wait disabled:opacity-70`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="31.4 31.4"
                      />
                    </svg>
                    {ui.loading}
                  </span>
                ) : mode === "login" ? (
                  <span className="inline-flex items-center gap-2">
                    🔐 {ui.loginButton}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    ✨ {ui.registerButton}
                  </span>
                )}
              </button>
            </form>

            {/* التبديل بين الوضعين */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {mode === "login" ? ui.noAccount : ui.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="font-black text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-300 dark:hover:text-primary-200"
                >
                  {mode === "login" ? ui.registerNow : ui.loginNow}
                </button>
              </p>
            </div>
          </div>

          {/* ===== العمود الجانبي ===== */}
          <div className="space-y-6">
            {/* فوائد التسجيل */}
            <div className="card p-6">
              <h3
                className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                🌟 {ui.benefitsTitle}
              </h3>
              <ul className="space-y-3">
                {[ui.benefit1, ui.benefit2, ui.benefit3, ui.benefit4, ui.benefit5].map(
                  (benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-black text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                        ✓
                      </span>
                      <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {benefit}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* الأمان */}
            <div className="card border-primary-200 bg-primary-50/40 p-6 dark:border-primary-900/30 dark:bg-primary-950/15">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                  🔒
                </span>
                <div>
                  <h3
                    className="mb-2 text-lg font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {ui.safeTitle}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {ui.safeDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-12">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${L}/account`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                👤
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.accountPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.accountPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/bookmarks`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🔖
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.bookmarksPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.bookmarksPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/privacy`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🔒
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.privacyPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.privacyPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={L} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: "primary" | "gold";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-4 text-center">
      <div className="mb-1 flex justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-sm font-black ${colorClasses[color]}`}>{label}</p>
    </div>
  );
}