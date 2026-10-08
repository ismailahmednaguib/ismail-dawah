"use client";

import { useState } from "react";

interface NewsletterProps {
  lang: string;
}

export default function Newsletter({ lang }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), lang }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="card p-8 md:p-10">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
            >
              📬
            </span>
            <h3
              className="text-2xl font-bold text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {lang === "ar" ? "اشترك في النشرة البريدية" : "Subscribe to Newsletter"}
            </h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === "ar"
              ? "صلك جديد المحتوى الدعوي والدروس والفتاوى أولاً بأول"
              : "Get the latest dawah content, lessons and fatwas delivered to your inbox"}
          </p>
        </div>

        <div>
          <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === "ar" ? "بريدك الإلكتروني" : "Your email address"}
              className="input-islamic flex-1"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary whitespace-nowrap"
            >
              {status === "loading"
                ? lang === "ar" ? "جارٍ الإرسال..." : "Sending..."
                : status === "done"
                ? lang === "ar" ? "✓ تم الاشتراك" : "✓ Subscribed"
                : lang === "ar" ? "اشترك" : "Subscribe"}
            </button>
          </form>

          {/* رسائل الحالة */}
          {status === "done" && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400 animate-fade-in">
              {lang === "ar"
                ? "✓ تم الاشتراك بنجاح! هتوصلك أحدث المحتويات على بريدك."
                : "✓ Subscribed successfully! You'll receive the latest content."}
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {lang === "ar"
                ? "✗ حدث خطأ، حاول مرة أخرى."
                : "✗ Something went wrong, please try again."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}