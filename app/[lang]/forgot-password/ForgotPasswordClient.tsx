"use client";

// app/[lang]/forgot-password/ForgotPasswordClient.tsx

import { useState } from "react";
import Link from "next/link";

type State = "idle" | "sending" | "sent" | "error";

type ForgotResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export default function ForgotPasswordClient({ lang }: { lang: "ar" | "en" }) {
  const isRTL = lang === "ar";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  const copy = isRTL
    ? {
        title: "نسيت كلمة المرور؟",
        body: "أدخل بريدك المسجّل، وسنرسل لك رابطًا صالحًا لمدة ساعة لإعادة تعيين كلمة المرور.",
        label: "البريد الإلكتروني",
        placeholder: "example@email.com",
        action: "أرسل رابط الاستعادة",
        sending: "جارٍ الإرسال…",
        sentTitle: "تحقّق من بريدك",
        sentBody:
          "إذا كان البريد مسجّلًا فسيصلك رابط إعادة التعيين خلال دقائق. تحقّق من مجلد المهملات أيضًا.",
        invalidEmail: "صيغة البريد الإلكتروني غير صحيحة.",
        notConfigured: "خدمة البريد غير مهيأة على الخادم حاليًا. تواصل معنا.",
        disabled: "استعادة كلمة المرور غير مفعّلة حاليًا. تواصل معنا.",
        failed: "تعذر إرسال الطلب. حاول لاحقًا.",
        back: "العودة لتسجيل الدخول",
      }
    : {
        title: "Forgot your password?",
        body: "Enter your registered email and we will send a reset link valid for one hour.",
        label: "Email address",
        placeholder: "example@email.com",
        action: "Send reset link",
        sending: "Sending…",
        sentTitle: "Check your inbox",
        sentBody:
          "If the email is registered, a reset link will arrive within minutes. Check your spam folder too.",
        invalidEmail: "The email format is invalid.",
        notConfigured: "Email delivery is not configured on the server yet. Contact us.",
        disabled: "Password recovery is currently disabled. Contact us.",
        failed: "Could not send the request. Please try again later.",
        back: "Back to sign in",
      };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });

      const data = (await response.json().catch(() => ({}))) as ForgotResponse;

      if (response.ok && data.ok) {
        setState("sent");
        setMessage(data.message || copy.sentBody);
        return;
      }

      setState("error");

      switch (data.error) {
        case "invalid_email":
          setMessage(copy.invalidEmail);
          break;
        case "email_not_configured":
          setMessage(copy.notConfigured);
          break;
        case "reset_disabled":
          setMessage(copy.disabled);
          break;
        default:
          setMessage(copy.failed);
      }
    } catch {
      setState("error");
      setMessage(copy.failed);
    }
  };

  if (state === "sent") {
    return (
      <div className="card overflow-hidden p-6 md:p-8">
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-primary-800 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden="true">
              ✉️
            </span>
            <div>
              <h2 className="text-xl font-black leading-relaxed">{copy.sentTitle}</h2>
              <p className="mt-2 text-sm leading-7">{message || copy.sentBody}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${lang}/login`} className="btn-primary justify-center">
            {copy.back}
          </Link>
          <Link href={`/${lang}`} className="btn-outline justify-center">
            {isRTL ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-6 md:p-8">
      <h2
        className="text-2xl font-black text-slate-900 dark:text-white"
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {copy.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {copy.body}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="recovery-email"
            className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {copy.label}
          </label>
          <input
            id="recovery-email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.placeholder}
            className="input-islamic"
          />
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
          disabled={state === "sending"}
          className="btn-primary w-full justify-center !py-4 text-lg disabled:cursor-wait disabled:opacity-70"
        >
          {state === "sending" ? copy.sending : copy.action}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href={`/${lang}/login`}
          className="font-bold text-primary-700 hover:underline dark:text-primary-300"
        >
          {copy.back}
        </Link>
      </p>
    </div>
  );
}
