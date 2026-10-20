"use client";

// app/[lang]/reset-password/ResetPasswordClient.tsx
// يستهلك رمز الاستعادة ويضع كلمة مرور جديدة، ثم يطلب تسجيل الدخول من جديد.

import { useState } from "react";
import Link from "next/link";

type State =
  | "idle"
  | "saving"
  | "success"
  | "missing"
  | "invalid"
  | "expired"
  | "unavailable"
  | "inactive"
  | "error";

type ResetResponse = {
  ok?: boolean;
  error?: string;
};

export default function ResetPasswordClient({
  lang,
  token,
}: {
  lang: "ar" | "en";
  token: string;
}) {
  const isRTL = lang === "ar";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>(token ? "idle" : "missing");
  const [message, setMessage] = useState("");

  const copy = isRTL
    ? {
        title: "اختر كلمة مرور جديدة",
        body: "٨ أحرف على الأقل. بعد الحفظ ستُغلق كل الجلسات القديمة وتحتاج لتسجيل الدخول من جديد.",
        password: "كلمة المرور الجديدة",
        confirm: "تأكيد كلمة المرور",
        action: "حفظ كلمة المرور",
        saving: "جارٍ الحفظ…",
        mismatch: "كلمتا المرور غير متطابقتين.",
        tooShort: "كلمة المرور قصيرة جدًا (٨ أحرف على الأقل).",
        tooLong: "كلمة المرور طويلة جدًا.",
        invalidChars: "كلمة المرور يجب أن تحتوي على حرف أو رقم.",
        missingTitle: "رابط غير مكتمل",
        missingBody: "لم نجد رمز الاستعادة في الرابط. افتح الرابط من البريد كما هو.",
        invalidTitle: "رابط غير صالح",
        invalidBody: "قد يكون الرابط قد استُخدم من قبل أو نُسخ ناقصًا.",
        expiredTitle: "انتهت صلاحية الرابط",
        expiredBody: "صلاحية الرابط ساعة واحدة. اطلب رابطًا جديدًا.",
        unavailableTitle: "الاستعادة غير متاحة مؤقتًا",
        unavailableBody: "لم يكتمل إعداد الخدمة بعد. حاول لاحقًا أو تواصل معنا.",
        inactiveTitle: "الحساب غير مفعّل",
        inactiveBody: "هذا الحساب موقوف. تواصل معنا لإعادة تفعيله.",
        errorTitle: "تعذر حفظ كلمة المرور",
        errorBody: "حدث خطأ غير متوقع. حاول مرة أخرى بعد قليل.",
        successTitle: "تم تغيير كلمة المرور بنجاح",
        successBody: "سجّل الدخول الآن بكلمة المرور الجديدة.",
        login: "تسجيل الدخول",
        request: "طلب رابط جديد",
        home: "العودة للرئيسية",
      }
    : {
        title: "Choose a new password",
        body: "At least 8 characters. Saving will end all existing sessions, so you will need to sign in again.",
        password: "New password",
        confirm: "Confirm password",
        action: "Save password",
        saving: "Saving…",
        mismatch: "Passwords do not match.",
        tooShort: "Password is too short (at least 8 characters).",
        tooLong: "Password is too long.",
        invalidChars: "Password must contain a letter or a number.",
        missingTitle: "Incomplete link",
        missingBody: "The reset token is missing. Open the link from the email as-is.",
        invalidTitle: "Invalid link",
        invalidBody: "It may have been used already or copied incompletely.",
        expiredTitle: "This link has expired",
        expiredBody: "Reset links are valid for one hour. Request a new one.",
        unavailableTitle: "Password recovery is temporarily unavailable",
        unavailableBody: "The service is not fully configured yet. Try again later or contact us.",
        inactiveTitle: "Account inactive",
        inactiveBody: "This account is suspended. Contact us to reactivate it.",
        errorTitle: "Could not save your password",
        errorBody: "An unexpected error occurred. Please try again shortly.",
        successTitle: "Your password has been changed",
        successBody: "Sign in now with your new password.",
        login: "Sign in",
        request: "Request a new link",
        home: "Back to home",
      };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setState("error");
      setMessage(copy.mismatch);
      return;
    }

    if (password.length < 8) {
      setState("error");
      setMessage(copy.tooShort);
      return;
    }

    setState("saving");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json().catch(() => ({}))) as ResetResponse;

      if (response.ok && data.ok) {
        setState("success");
        return;
      }

      switch (data.error) {
        case "invalid_token":
          setState("invalid");
          break;
        case "expired_token":
          setState("expired");
          break;
        case "reset_unavailable":
          setState("unavailable");
          break;
        case "inactive_account":
          setState("inactive");
          break;
        case "password_too_short":
        case "weak_password":
          setState("error");
          setMessage(copy.tooShort);
          break;
        case "password_too_long":
          setState("error");
          setMessage(copy.tooLong);
          break;
        case "password_invalid_characters":
          setState("error");
          setMessage(copy.invalidChars);
          break;
        default:
          setState("error");
          setMessage(copy.errorBody);
      }
    } catch {
      setState("error");
      setMessage(copy.errorBody);
    }
  };

  const blocked: Partial<Record<State, { title: string; body: string; tone: string; icon: string }>> = {
    missing: {
      title: copy.missingTitle,
      body: copy.missingBody,
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200",
      icon: "⚠️",
    },
    invalid: {
      title: copy.invalidTitle,
      body: copy.invalidBody,
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200",
      icon: "⚠️",
    },
    expired: {
      title: copy.expiredTitle,
      body: copy.expiredBody,
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200",
      icon: "⌛",
    },
    unavailable: {
      title: copy.unavailableTitle,
      body: copy.unavailableBody,
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200",
      icon: "🛠️",
    },
    inactive: {
      title: copy.inactiveTitle,
      body: copy.inactiveBody,
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-200",
      icon: "⛔",
    },
  };

  const blockedState = blocked[state];

  if (state === "success") {
    return (
      <div className="card overflow-hidden p-6 md:p-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden="true">
              ✅
            </span>
            <div>
              <h1 className="text-xl font-black leading-relaxed">{copy.successTitle}</h1>
              <p className="mt-2 text-sm leading-7">{copy.successBody}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${lang}/login`} className="btn-primary justify-center">
            {copy.login}
          </Link>
          <Link href={`/${lang}`} className="btn-outline justify-center">
            {copy.home}
          </Link>
        </div>
      </div>
    );
  }

  if (blockedState) {
    return (
      <div className="card overflow-hidden p-6 md:p-8">
        <div className={`rounded-2xl border p-5 ${blockedState.tone}`} role="alert">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden="true">
              {blockedState.icon}
            </span>
            <div>
              <h1 className="text-xl font-black leading-relaxed">{blockedState.title}</h1>
              <p className="mt-2 text-sm leading-7">{blockedState.body}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${lang}/forgot-password`} className="btn-primary justify-center">
            {copy.request}
          </Link>
          <Link href={`/${lang}/login`} className="btn-outline justify-center">
            {copy.login}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-6 md:p-8">
      <h1
        className="text-2xl font-black text-slate-900 dark:text-white"
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {copy.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {copy.body}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {copy.password}
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            dir="ltr"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-islamic"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {copy.confirm}
          </label>
          <input
            id="confirm-new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            dir="ltr"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="input-islamic"
          />
          {confirm && password !== confirm && (
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

        <button
          type="submit"
          disabled={state === "saving"}
          className="btn-primary w-full justify-center !py-4 text-lg disabled:cursor-wait disabled:opacity-70"
        >
          {state === "saving" ? copy.saving : copy.action}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href={`/${lang}/login`}
          className="font-bold text-primary-700 hover:underline dark:text-primary-300"
        >
          {copy.login}
        </Link>
      </p>
    </div>
  );
}
