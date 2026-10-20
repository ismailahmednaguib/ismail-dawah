"use client";

// components/auth/EmailVerificationBanner.tsx
// يظهر في صفحة الحساب عندما يكون البريد غير مفعّل، ويسمح بإعادة إرسال الرابط.

import { useState } from "react";

type BannerState = "idle" | "sending" | "sent" | "error";

type ResendResponse = {
  ok?: boolean;
  alreadyVerified?: boolean;
  error?: string;
  retryAfterSeconds?: number;
};

export default function EmailVerificationBanner({
  lang,
  email,
}: {
  lang: "ar" | "en";
  email: string;
}) {
  const isRTL = lang === "ar";
  const [state, setState] = useState<BannerState>("idle");
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const copy = isRTL
    ? {
        title: "بريدك الإلكتروني غير مفعّل بعد",
        body: `أرسلنا رابط تفعيل إلى ${email}. افتح الرابط لتأكيد الحساب.`,
        action: "إعادة إرسال الرابط",
        sending: "جارٍ الإرسال…",
        sent: "تم إرسال رابط جديد. تحقّق من بريدك (ومجلد المهملات).",
        cooldown: (seconds: number) =>
          `انتظر ${seconds} ثانية قبل طلب رابط جديد.`,
        unauthorized: "سجّل الدخول من جديد ثم أعد المحاولة.",
        notConfigured: "خدمة البريد غير مهيأة على الخادم حاليًا. تواصل معنا.",
        unavailable: "ميزة التفعيل غير مفعّلة بعد. تواصل معنا.",
        failed: "تعذر إرسال الرابط. حاول لاحقًا.",
        dismiss: "إخفاء",
      }
    : {
        title: "Your email is not verified yet",
        body: `We sent a verification link to ${email}. Open it to confirm your account.`,
        action: "Resend the link",
        sending: "Sending…",
        sent: "A new link was sent. Check your inbox (and spam folder).",
        cooldown: (seconds: number) =>
          `Please wait ${seconds} seconds before requesting another link.`,
        unauthorized: "Please sign in again and retry.",
        notConfigured: "Email delivery is not configured on the server yet. Contact us.",
        unavailable: "Verification is not enabled yet. Contact us.",
        failed: "Could not send the link. Please try again later.",
        dismiss: "Dismiss",
      };

  const resend = async () => {
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });

      const data = (await response.json().catch(() => ({}))) as ResendResponse;

      if (response.ok && data.ok) {
        if (data.alreadyVerified) {
          setDismissed(true);
          return;
        }

        setState("sent");
        setMessage(copy.sent);
        return;
      }

      setState("error");

      switch (data.error) {
        case "cooldown":
          setMessage(copy.cooldown(Math.max(1, Number(data.retryAfterSeconds) || 60)));
          break;
        case "unauthorized":
          setMessage(copy.unauthorized);
          break;
        case "email_not_configured":
          setMessage(copy.notConfigured);
          break;
        case "verification_unavailable":
          setMessage(copy.unavailable);
          break;
        default:
          setMessage(copy.failed);
      }
    } catch {
      setState("error");
      setMessage(copy.failed);
    }
  };

  return (
    <div
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-100"
      role="status"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden="true">
            ✉️
          </span>

          <div className="min-w-0">
            <p className="text-base font-black leading-relaxed">{copy.title}</p>
            <p className="mt-1 text-sm leading-7">{copy.body}</p>

            {message && (
              <p
                className={`mt-2 text-sm font-bold ${
                  state === "sent"
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-xs font-bold text-amber-700 underline-offset-4 hover:underline dark:text-amber-300"
        >
          {copy.dismiss}
        </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-70"
        >
          {state === "sending" ? copy.sending : copy.action}
        </button>
      </div>
    </div>
  );
}
