// components/Newsletter.tsx
"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type NewsletterProps = {
  lang: Lang;
};

type Status = "idle" | "loading" | "done" | "error";

export default function Newsletter({ lang }: NewsletterProps) {
  const isRTL = lang === "ar";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = email.trim();
    if (!value || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, lang }),
      });

      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const buttonLabel =
    status === "loading"
      ? isRTL
        ? "جارٍ الإرسال..."
        : "Sending..."
      : status === "done"
      ? "✓ " + t(lang, "subscribed")
      : t(lang, "subscribe");

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="card p-8 md:p-10">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #0e7490)",
              }}
            >
              📬
            </span>
            <h2
              className="text-2xl font-bold text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {t(lang, "newsletter_title")}
            </h2>
          </div>

          {/* ✅ كان "صلك" — النص الصحيح من translations.ts */}
          <p className="leading-relaxed text-slate-500 dark:text-slate-400">
            {t(lang, "newsletter_desc")}
          </p>
        </div>

        <div>
          <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              dir="ltr"
              autoComplete="email"
              aria-label={t(lang, "email_placeholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "done" || status === "error") {
                  setStatus("idle");
                }
              }}
              placeholder={t(lang, "email_placeholder")}
              className="input-islamic flex-1"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary whitespace-nowrap disabled:cursor-wait disabled:opacity-70"
            >
              {buttonLabel}
            </button>
          </form>

          <div role="status" aria-live="polite" className="min-h-6">
            {status === "done" && (
              <p className="mt-3 animate-fade-in text-sm text-primary-600 dark:text-primary-400">
                {isRTL
                  ? "✓ تم الاشتراك بنجاح! ستصلك أحدث المحتويات على بريدك."
                  : "✓ Subscribed successfully! You'll receive the latest content."}
              </p>
            )}
            {status === "error" && (
              <p className="mt-3 animate-fade-in text-sm text-red-600 dark:text-red-400">
                {isRTL
                  ? "✗ حدث خطأ، حاول مرة أخرى."
                  : "✗ Something went wrong, please try again."}
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            🔒{" "}
            {isRTL
              ? "لن نشارك بريدك مع أي طرف ثالث، ويمكنك الإلغاء في أي وقت."
              : "We will never share your email with third parties, and you can unsubscribe anytime."}
          </p>
        </div>
      </div>
    </div>
  );
}