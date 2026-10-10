// app/[lang]/register/page.tsx
"use client";

import { useState, useMemo } from "react";
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
  title: string;
  subtitle: string;
  home: string;
  description: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  registerButton: string;
  loading: string;
  hasAccount: string;
  loginLink: string;
  benefitsTitle: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  benefit4: string;
  benefit5: string;
  showPassword: string;
  hidePassword: string;
  passwordStrength: string;
  weak: string;
  medium: string;
  strong: string;
  veryStrong: string;
  successMessage: string;
  errorMessage: string;
  connectionError: string;
  passwordMismatch: string;
  termsAgree: string;
  termsLink: string;
  privacyLink: string;
  safeTitle: string;
  safeDesc: string;
  verse: string;
  verseSource: string;
  relatedTitle: string;
  loginPage: string;
  loginPageDesc: string;
  accountPage: string;
  accountPageDesc: string;
  privacyPage: string;
  privacyPageDesc: string;
  contactPage: string;
  contactPageDesc: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "إنشاء حساب جديد",
    subtitle: "انضم إلى مجتمع منصة إسماعيل أحمد نجيب الدعوية",
    home: "الرئيسية",
    description:
      "أنشئ حساباً مجانياً في منصة إسماعيل أحمد نجيب لسؤال الشيخ مباشرة، تتبع تقدمك في الحفظ والأذكار، وحفظ صفحاتك المفضلة.",
    name: "الاسم",
    namePlaceholder: "اسمك الكريم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    password: "كلمة المرور",
    passwordPlaceholder: "6 أحرف على الأقل",
    confirmPassword: "تأكيد كلمة المرور",
    registerButton: "إنشاء حساب",
    loading: "جاري التسجيل...",
    hasAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    benefitsTitle: "فوائد التسجيل",
    benefit1: "اسأل الشيخ أسئلة خاصة مباشرة",
    benefit2: "تتبع تقدمك في حفظ القرآن والأذكار",
    benefit3: "احفظ صفحاتك المفضلة",
    benefit4: "استلم إشعارات بالمحتوى الجديد",
    benefit5: "مزامنة بياناتك بين الأجهزة",
    showPassword: "إظهار",
    hidePassword: "إخفاء",
    passwordStrength: "قوة كلمة المرور",
    weak: "ضعيفة",
    medium: "متوسطة",
    strong: "قوية",
    veryStrong: "قوية جداً",
    successMessage: "تم إنشاء الحساب بنجاح! جاري التحويل...",
    errorMessage: "حدث خطأ في التسجيل",
    connectionError: "خطأ في الاتصال",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    termsAgree: "بالتسجيل، أنت توافق على",
    termsLink: "الشروط والأحكام",
    privacyLink: "سياسة الخصوصية",
    safeTitle: "حسابك آمن ومحمي",
    safeDesc: "نستخدم تشفيراً متقدماً لحماية بياناتك ولا نشاركها مع أي طرف ثالث.",
    verse: "﴿ إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ﴾",
    verseSource: "سورة الحجرات — الآية 10",
    relatedTitle: "صفحات ذات صلة",
    loginPage: "تسجيل الدخول",
    loginPageDesc: "أدخل إلى حسابك الموجود.",
    accountPage: "حسابي",
    accountPageDesc: "إدارة حسابك وإعداداتك.",
    privacyPage: "سياسة الخصوصية",
    privacyPageDesc: "كيف نحمي بياناتك.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للدعم والمساعدة.",
  },
  en: {
    title: "Create New Account",
    subtitle: "Join the Ismail Ahmed Naguib Dawah Platform community",
    home: "Home",
    description:
      "Create a free account on the Ismail Ahmed Naguib Platform to ask the Sheikh directly, track your memorization progress, and save your favorite pages.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm Password",
    registerButton: "Create Account",
    loading: "Registering...",
    hasAccount: "Already have an account?",
    loginLink: "Sign In",
    benefitsTitle: "Benefits of Registration",
    benefit1: "Ask the Sheikh private questions directly",
    benefit2: "Track your Quran and adhkar progress",
    benefit3: "Save your favorite pages",
    benefit4: "Receive notifications about new content",
    benefit5: "Sync your data across devices",
    showPassword: "Show",
    hidePassword: "Hide",
    passwordStrength: "Password Strength",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    veryStrong: "Very Strong",
    successMessage: "Account created successfully! Redirecting...",
    errorMessage: "Registration error occurred",
    connectionError: "Connection error",
    passwordMismatch: "Passwords do not match",
    termsAgree: "By registering, you agree to our",
    termsLink: "Terms & Conditions",
    privacyLink: "Privacy Policy",
    safeTitle: "Your Account is Safe and Protected",
    safeDesc: "We use advanced encryption to protect your data and never share it with third parties.",
    verse: "\"The believers are but brothers, so make settlement between your brothers.\"",
    verseSource: "Surah Al-Hujurat — Verse 10",
    relatedTitle: "Related Pages",
    loginPage: "Sign In",
    loginPageDesc: "Access your existing account.",
    accountPage: "My Account",
    accountPageDesc: "Manage your account and settings.",
    privacyPage: "Privacy Policy",
    privacyPageDesc: "How we protect your data.",
    contactPage: "Contact Us",
    contactPageDesc: "For support and help.",
  },
};

// ============================================================
// دالة حساب قوة كلمة المرور
// ============================================================

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
}

// ============================================================
// المكون الرئيسي
// ============================================================

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const isRTL = L === "ar";
  const ui = UI[L];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const strengthLabel = useMemo(() => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return ui.weak;
    if (passwordStrength === 3) return ui.medium;
    if (passwordStrength === 4) return ui.strong;
    return ui.veryStrong;
  }, [passwordStrength, ui]);

  const strengthColor = useMemo(() => {
    if (passwordStrength === 0) return "bg-slate-200 dark:bg-night-700";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-amber-500";
    if (passwordStrength === 4) return "bg-primary-500";
    return "bg-green-500";
  }, [passwordStrength]);

  const submit = async () => {
    setMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setMsg({ type: "error", text: "❌ " + (isRTL ? "كل الحقول مطلوبة" : "All fields are required") });
      return;
    }

    if (password !== confirmPassword) {
      setMsg({ type: "error", text: "❌ " + ui.passwordMismatch });
      return;
    }

    if (password.length < 6) {
      setMsg({ type: "error", text: "❌ " + (isRTL ? "كلمة المرور قصيرة جداً" : "Password is too short") });
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg({ type: "success", text: "✅ " + ui.successMessage });
        setTimeout(() => router.push(`/${lang}/account`), 1500);
      } else {
        setMsg({ type: "error", text: "❌ " + (j.error || ui.errorMessage) });
      }
    } catch {
      setMsg({ type: "error", text: "❌ " + ui.connectionError });
    }
    setLoading(false);
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <Header lang={L} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${L}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${L}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          {/* ===== Hero محسّن ===== */}
          <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-10 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
            <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-5 flex justify-center">
                <span
                  className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </span>
              </div>

              <span className="badge-gold mb-3">
                ✨ {isRTL ? "انضم إلينا" : "Join Us"}
              </span>

              <h1
                className="mb-3 text-3xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.title}
              </h1>

              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.description}
              </p>

              {/* آية كريمة */}
              <div className="mt-6 rounded-2xl border border-gold-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gold-800 dark:bg-night-800/80">
                <p
                  className="mb-1 text-lg font-black text-gold-700 dark:text-gold-300"
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

          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            {/* ===== نموذج التسجيل ===== */}
            <div className="card p-6 md:p-8">
              <div className="space-y-4">
                {/* الاسم */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.name}
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={ui.namePlaceholder}
                    className="input-islamic"
                    autoComplete="name"
                  />
                </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ui.emailPlaceholder}
                    className="input-islamic"
                    dir="ltr"
                    autoComplete="email"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={ui.passwordPlaceholder}
                      className="input-islamic !pe-12"
                      dir="ltr"
                      minLength={6}
                      autoComplete="new-password"
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

                  {/* مؤشر قوة كلمة المرور */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400">
                          {ui.passwordStrength}
                        </span>
                        <span
                          className={`font-black ${
                            passwordStrength <= 2
                              ? "text-red-600 dark:text-red-400"
                              : passwordStrength === 3
                              ? "text-amber-600 dark:text-amber-400"
                              : passwordStrength === 4
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-night-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* تأكيد كلمة المرور */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={ui.passwordPlaceholder}
                    className="input-islamic"
                    dir="ltr"
                    minLength={6}
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                      ⚠️ {ui.passwordMismatch}
                    </p>
                  )}
                </div>

                {/* الشروط والأحكام */}
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

                {/* زر التسجيل */}
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-4 text-lg font-black text-white shadow-lg shadow-gold-500/25 transition-all hover:from-gold-600 hover:to-gold-700 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
                      </svg>
                      {ui.loading}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      ✨ {ui.registerButton}
                    </span>
                  )}
                </button>

                {/* التبديل لتسجيل الدخول */}
                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  {ui.hasAccount}{" "}
                  <Link
                    href={`/${L}/login`}
                    className="font-black text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-300 dark:hover:text-primary-200"
                  >
                    {ui.loginLink}
                  </Link>
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
          <div className="mt-10">
            <h2
              className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🔗 {ui.relatedTitle}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href={`/${L}/login`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🔐</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.loginPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.loginPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${L}/account`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">👤</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.accountPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.accountPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${L}/privacy`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🔒</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.privacyPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.privacyPageDesc}
                  </p>
                </div>
              </Link>

              <Link href={`/${L}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📬</span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                    {ui.contactPage}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {ui.contactPageDesc}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={L} />
    </main>
  );
}