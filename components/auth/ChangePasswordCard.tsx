"use client";

// components/auth/ChangePasswordCard.tsx
// تغيير كلمة المرور للمستخدم المسجّل من صفحة الحساب.

import { useState } from "react";
import Link from "next/link";

type State = "idle" | "saving" | "success" | "error";

type ChangeResponse = {
  ok?: boolean;
  error?: string;
};

export default function ChangePasswordCard({ lang }: { lang: "ar" | "en" }) {
  const isRTL = lang === "ar";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  const copy = isRTL
    ? {
        title: "تغيير كلمة المرور",
        body: "يُنصح بتغيير كلمة المرور دوريًّا. بعد الحفظ ستُغلق كل الجلسات القديمة وتحتاج لتسجيل الدخول من جديد.",
        current: "كلمة المرور الحالية",
        next: "كلمة المرور الجديدة",
        confirm: "تأكيد كلمة المرور الجديدة",
        action: "حفظ كلمة المرور",
        saving: "جارٍ الحفظ…",
        successTitle: "تم تغيير كلمة المرور",
        successBody: "أُغلقت كل الجلسات القديمة. سجّل الدخول بكلمة المرور الجديدة.",
        login: "تسجيل الدخول",
        forgot: "نسيت كلمة المرور الحالية؟",
        mismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
        tooShort: "كلمة المرور الجديدة قصيرة جدًا (٨ أحرف على الأقل).",
        tooLong: "كلمة المرور الجديدة طويلة جدًا.",
        invalidChars: "كلمة المرور يجب أن تحتوي على حرف أو رقم.",
        wrongCurrent: "كلمة المرور الحالية غير صحيحة.",
        same: "كلمة المرور الجديدة مطابقة للحالية. اختر كلمة مختلفة.",
        disabled: "تغيير كلمة المرور غير مفعّل حاليًا. تواصل معنا.",
        notSet: "لا توجد كلمة مرور على هذا الحساب. استخدم استعادة كلمة المرور.",
        expired: "انتهت الجلسة. سجّل الدخول من جديد.",
        inactive: "هذا الحساب موقوف. تواصل معنا.",
        failed: "تعذر حفظ كلمة المرور. حاول لاحقًا.",
      }
    : {
        title: "Change password",
        body: "Changing your password regularly is recommended. Saving will end all existing sessions, so you will need to sign in again.",
        current: "Current password",
        next: "New password",
        confirm: "Confirm new password",
        action: "Save password",
        saving: "Saving…",
        successTitle: "Password changed",
        successBody: "All existing sessions have ended. Sign in with your new password.",
        login: "Sign in",
        forgot: "Forgot your current password?",
        mismatch: "The new passwords do not match.",
        tooShort: "The new password is too short (at least 8 characters).",
        tooLong: "The new password is too long.",
        invalidChars: "Password must contain a letter or a number.",
        wrongCurrent: "The current password is incorrect.",
        same: "The new password matches the current one. Choose a different one.",
        disabled: "Password change is currently disabled. Contact us.",
        notSet: "This account has no password set. Use password recovery.",
        expired: "Your session has expired. Please sign in again.",
        inactive: "This account is suspended. Contact us.",
        failed: "Could not save your password. Please try again later.",
      };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (newPassword !== confirm) {
      setState("error");
      setMessage(copy.mismatch);
      return;
    }

    if (newPassword.length < 8) {
      setState("error");
      setMessage(copy.tooShort);
      return;
    }

    setState("saving");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ChangeResponse;

      if (response.ok && data.ok) {
        setState("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
        return;
      }

      setState("error");

      switch (data.error) {
        case "invalid_current_password":
          setMessage(copy.wrongCurrent);
          break;
        case "same_password":
          setMessage(copy.same);
          break;
        case "password_too_short":
        case "weak_password":
          setMessage(copy.tooShort);
          break;
        case "password_too_long":
          setMessage(copy.tooLong);
          break;
        case "password_invalid_characters":
          setMessage(copy.invalidChars);
          break;
        case "password_change_disabled":
          setMessage(copy.disabled);
          break;
        case "password_not_set":
          setMessage(copy.notSet);
          break;
        case "unauthorized":
          setMessage(copy.expired);
          break;
        case "inactive_account":
          setMessage(copy.inactive);
          break;
        default:
          setMessage(copy.failed);
      }
    } catch {
      setState("error");
      setMessage(copy.failed);
    }
  };

  if (state === "success") {
    return (
      <section className="mb-10" aria-labelledby="change-password-title">
        <div className="card relative overflow-hidden p-6 md:p-8">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1" />
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-primary-800 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none" aria-hidden="true">
                ✅
              </span>
              <div>
                <h2
                  id="change-password-title"
                  className="text-xl font-black leading-relaxed"
                >
                  {copy.successTitle}
                </h2>
                <p className="mt-2 text-sm leading-7">{copy.successBody}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link href={`/${lang}/login`} className="btn-primary justify-center">
              {copy.login}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10" aria-labelledby="change-password-title">
      <div className="card relative overflow-hidden p-6 md:p-8">
        <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

        <h2
          id="change-password-title"
          className="text-2xl font-black text-slate-900 dark:text-white"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          🔑 {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {copy.body}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {copy.current}
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              dir="ltr"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="input-islamic"
            />
          </div>

          <div>
            <label
              htmlFor="change-new-password"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {copy.next}
            </label>
            <input
              id="change-new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="input-islamic"
            />
          </div>

          <div>
            <label
              htmlFor="change-confirm-password"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {copy.confirm}
            </label>
            <input
              id="change-confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              dir="ltr"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="input-islamic"
            />
            {confirm && newPassword !== confirm && (
              <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                ⚠️ {copy.mismatch}
              </p>
            )}
          </div>

          {state === "error" && message && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
              role="alert"
            >
              ❌ {message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={state === "saving"}
              className="btn-primary justify-center disabled:cursor-wait disabled:opacity-70"
            >
              {state === "saving" ? copy.saving : copy.action}
            </button>

            <Link
              href={`/${lang}/forgot-password`}
              className="text-sm font-bold text-primary-700 hover:underline dark:text-primary-300"
            >
              {copy.forgot}
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
