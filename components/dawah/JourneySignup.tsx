"use client";

import { FormEvent, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Props = { lang: Lang; enabled: boolean };

const COPY = {
  ar: {
    title: "رحلة بريدية اختيارية من 7 أيام",
    desc: "رسالة قصيرة كل يوم تساعدك على استكشاف المواد بهدوء. لا تحتاج إلى إنشاء حساب، ويمكنك إلغاء الاشتراك في أي رسالة.",
    email: "بريدك الإلكتروني",
    consent: "أوافق على استلام رحلة الأيام السبعة ويمكنني إلغاء الاشتراك لاحقًا.",
    submit: "ابدأ الرحلة",
    loading: "جارٍ الاشتراك...",
    success: "تم الاشتراك. ستصلك أول رسالة قريبًا.",
    unavailable: "الرحلة غير متاحة حاليًا.",
    generic: "تعذر الاشتراك حاليًا. حاول لاحقًا.",
  },
  en: {
    title: "Optional 7-day email journey",
    desc: "One short email a day to help you explore the material gently. No account is required, and every email includes an unsubscribe link.",
    email: "Your email address",
    consent: "I agree to receive the seven-day journey and understand I can unsubscribe later.",
    submit: "Start the journey",
    loading: "Subscribing...",
    success: "You are subscribed. Your first email will arrive soon.",
    unavailable: "The journey is not available right now.",
    generic: "Subscription failed temporarily. Please try again later.",
  },
} as const;

export default function JourneySignup({ lang, enabled }: Props) {
  const copy = COPY[lang];
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!enabled) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/dawah/journey/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, consent }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || copy.generic);
      setStatus("success");
      setMessage(payload.message || copy.success);
      setEmail("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : copy.generic);
    }
  }

  return (
    <section className="card border-gold-200 bg-gold-50/60 p-6 dark:border-gold-900/40 dark:bg-gold-950/15" aria-labelledby="journey-signup-title">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40" aria-hidden="true">✉️</span>
        <div className="min-w-0 flex-1">
          <h2 id="journey-signup-title" className="text-xl font-black text-primary-950 dark:text-white">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-200">{copy.desc}</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="journey-email">{copy.email}</label>
              <input id="journey-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} autoComplete="email" dir="ltr" className="input-islamic min-w-0 flex-1" />
              <button type="submit" disabled={status === "loading" || !consent} className="btn-gold shrink-0 disabled:cursor-not-allowed disabled:opacity-50">{status === "loading" ? copy.loading : copy.submit}</button>
            </div>
            <label className="flex items-start gap-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-primary-700" />
              <span>{copy.consent}</span>
            </label>
          </form>
          {message && <p role="status" className={`mt-3 text-sm font-bold ${status === "error" ? "text-red-700 dark:text-red-300" : "text-primary-700 dark:text-primary-300"}`}>{message}</p>}
        </div>
      </div>
    </section>
  );
}
