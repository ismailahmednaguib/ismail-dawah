// components/auth/LoginForm.tsx
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Lang } from "@/lib/i18n";

// ============================================================
// Settings
// ============================================================

/**
 * إذا لا تريد إتاحة التسجيل للزوار، اجعلها false.
 */
const ALLOW_REGISTER = true;

// ============================================================
// Types
// ============================================================

type Mode = "login" | "register";

type Message = {
  type: "success" | "error";
  text: string;
} | null;

type Labels = {
  loginTitle: string;
  registerTitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  rememberMe: string;
  forgotPassword: string;
  loginButton: string;
  registerButton: string;
  loading: string;
  success: string;
  redirecting: string;
  errorDefault: string;
  connectionError: string;
  endpointNotFound: string;
  noAccount: string;
  hasAccount: string;
  registerNow: string;
  loginNow: string;
  termsAgree: string;
  termsLink: string;
  privacyLink: string;
};

// ============================================================
// Labels
// ============================================================

const LABELS: Record<string, Labels> = {
  ar: {
    loginTitle: "تسجيل الدخول",
    registerTitle: "إنشاء حساب",
    name: "الاسم",
    namePlaceholder: "اسمك الكريم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    showPassword: "إظهار",
    hidePassword: "إخفاء",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    loginButton: "دخول",
    registerButton: "إنشاء حساب",
    loading: "جارٍ التحقق...",
    success: "تم بنجاح!",
    redirecting: "جاري التحويل...",
    errorDefault: "حدث خطأ أثناء العملية.",
    connectionError: "خطأ في الاتصال بالخادم.",
    endpointNotFound: "endpoint غير موجود. تأكد من ملفات API.",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    registerNow: "سجل الآن",
    loginNow: "سجل دخول",
    termsAgree: "بالتسجيل، أنت توافق على",
    termsLink: "الشروط والأحكام",
    privacyLink: "سياسة الخصوصية",
  },
  en: {
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    showPassword: "Show",
    hidePassword: "Hide",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    loginButton: "Sign In",
    registerButton: "Create Account",
    loading: "Checking...",
    success: "Success!",
    redirecting: "Redirecting...",
    errorDefault: "Something went wrong.",
    connectionError: "Connection error.",
    endpointNotFound: "Endpoint not found. Check API routes.",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerNow: "Register now",
    loginNow: "Sign in",
    termsAgree: "By registering, you agree to our",
    termsLink: "Terms & Conditions",
    privacyLink: "Privacy Policy",
  },
};

// ============================================================
// Component
// ============================================================

export default function LoginForm({ lang }: { lang: Lang }) {
  const t = LABELS[lang] ?? LABELS.ar;

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setMessage({
        type: "error",
        text: t.errorDefault,
      });
      setLoading(false);
      return;
    }

    if (mode === "register" && !cleanName) {
      setMessage({
        type: "error",
        text: t.errorDefault,
      });
      setLoading(false);
      return;
    }

    const endpoint = mode === "login" ? "/api/login" : "/api/register";

    const body =
      mode === "login"
        ? {
            email: cleanEmail,
            password,
            lang,
            rememberMe,
          }
        : {
            name: cleanName,
            email: cleanEmail,
            password,
            lang,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        const redirect =
          data.redirect ||
          (data.role === "admin"
            ? `/${lang}/admin`
            : `/${lang}/account`);

        setMessage({
          type: "success",
          text: data.verificationSent
            ? `✓ ${
                lang === "ar"
                  ? "تم إنشاء الحساب. أرسلنا رابط تفعيل إلى بريدك الإلكتروني."
                  : "Account created. We sent a verification link to your email."
              }`
            : `✓ ${t.success} ${t.redirecting}`,
        });

        window.setTimeout(() => {
          window.location.href = redirect;
        }, 450);

        return;
      }

      const errorMessage =
        data.message ||
        data.error ||
        (res.status === 404
          ? t.endpointNotFound
          : res.status === 409
          ? mode === "register"
            ? "هذا البريد الإلكتروني مسجل بالفعل."
            : t.errorDefault
          : t.errorDefault);

      setMessage({
        type: "error",
        text: `❌ ${errorMessage}`,
      });
    } catch (error) {
      console.error("[LoginForm] submit error:", error);
      setMessage({
        type: "error",
        text: `❌ ${t.connectionError}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="card p-6 md:p-8">
        {/* Tabs */}
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
            🔐 {t.loginTitle}
          </button>

          {ALLOW_REGISTER ? (
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                mode === "register"
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              ✨ {t.registerTitle}
            </button>
          ) : null}
        </div>

        {/* Message */}
        {message ? (
          <div
            className={`mb-4 rounded-xl p-4 text-sm font-bold ${
              message.type === "success"
                ? "border border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-300"
                : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
            }`}
            aria-live="polite"
          >
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && ALLOW_REGISTER ? (
            <div>
              <label
                htmlFor="login-name"
                className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                {t.name}
              </label>

              <input
                id="login-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-islamic w-full"
                placeholder={t.namePlaceholder}
                autoComplete="name"
              />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {t.email}
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-islamic w-full"
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              dir="ltr"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {t.password}
            </label>

            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-islamic w-full !pe-16"
                placeholder={t.passwordPlaceholder}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                dir="ltr"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 end-3 flex items-center text-xs font-bold text-slate-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300"
                tabIndex={-1}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? t.hidePassword : t.showPassword}
              </button>
            </div>
          </div>

          {mode === "login" ? (
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                {t.rememberMe}
              </label>

              <Link
                href={`/${lang}/contact`}
                className="text-sm font-bold text-primary-700 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
              >
                {t.forgotPassword}
              </Link>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t.termsAgree}{" "}
              <Link
                href={`/${lang}/terms`}
                className="font-bold text-primary-700 hover:underline dark:text-primary-300"
              >
                {t.termsLink}
              </Link>{" "}
              {lang === "ar" ? "و" : "and"}{" "}
              <Link
                href={`/${lang}/privacy`}
                className="font-bold text-primary-700 hover:underline dark:text-primary-300"
              >
                {t.privacyLink}
              </Link>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-4 text-lg font-black text-white transition-all disabled:cursor-wait disabled:opacity-70 ${
              mode === "login"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25"
                : "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 shadow-lg shadow-gold-500/25"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
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
                {t.loading}
              </span>
            ) : mode === "login" ? (
              <span className="inline-flex items-center gap-2">
                🔐 {t.loginButton}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                ✨ {t.registerButton}
              </span>
            )}
          </button>
        </form>

        {ALLOW_REGISTER ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {mode === "login" ? t.noAccount : t.hasAccount}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-black text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-300 dark:hover:text-primary-200"
              >
                {mode === "login" ? t.registerNow : t.loginNow}
              </button>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
