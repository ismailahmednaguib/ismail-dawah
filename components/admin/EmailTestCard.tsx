"use client";

// components/admin/EmailTestCard.tsx
// حالة مزوّد البريد وإرسال رسالة تجريبية من إعدادات المنصة.

import { useEffect, useState, type FormEvent } from "react";

type ProviderKind = "smtp" | "resend" | "none";

type ProviderStatus = {
  kind: ProviderKind;
  configured: boolean;
  from: string | null;
  smtpHost: string | null;
  adminEmail?: string;
};

type Feedback = { type: "success" | "error"; text: string } | null;

const EMPTY_STATUS: ProviderStatus = {
  kind: "none",
  configured: false,
  from: null,
  smtpHost: null,
};

export default function EmailTestCard() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/email/test", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as Partial<
          ProviderStatus & { ok?: boolean; error?: string }
        >;

        if (!active) return;

        if (response.ok && data.ok) {
          setStatus({
            kind: data.kind ?? "none",
            configured: Boolean(data.configured),
            from: data.from ?? null,
            smtpHost: data.smtpHost ?? null,
            adminEmail: data.adminEmail,
          });

          if (typeof data.adminEmail === "string") {
            setTo((current) => current || data.adminEmail!);
          }
        } else {
          setStatus(EMPTY_STATUS);
        }
      })
      .catch(() => {
        if (active) setStatus(EMPTY_STATUS);
      });

    return () => {
      active = false;
    };
  }, []);

  const sendTest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setSending(true);

    try {
      const response = await fetch("/api/admin/email/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim() }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        to?: string;
      };

      if (response.ok && data.ok) {
        setFeedback({
          type: "success",
          text: `تم إرسال بريد تجريبي إلى ${data.to || to}. راجع الوارد والمهمل (Spam).`,
        });
        return;
      }

      if (response.status === 429) {
        setFeedback({
          type: "error",
          text: "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.",
        });
        return;
      }

      switch (data.error) {
        case "email_provider_not_configured":
          setFeedback({
            type: "error",
            text: "مزوّد البريد غير مضبوط في بيئة الخادم. أضف متغيرات SMTP أو Resend ثم أعد التشغيل/النشر.",
          });
          break;
        case "invalid_email":
          setFeedback({ type: "error", text: "اكتب بريدًا إلكترونيًا صالحًا." });
          break;
        case "unauthorized":
        case "forbidden":
          setFeedback({
            type: "error",
            text: "انتهت الجلسة أو لا تملك صلاحية الإعدادات. أعد تحميل الصفحة.",
          });
          break;
        default:
          setFeedback({
            type: "error",
            text: "فشل الإرسال. راجع سجلات الخادم (بيانات SMTP أو صلاحية المفتاح).",
          });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "تعذر الاتصال بالخادم. حاول لاحقًا.",
      });
    } finally {
      setSending(false);
    }
  };

  const badge =
    status?.kind === "smtp"
      ? {
          label: "SMTP",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        }
      : status?.kind === "resend"
        ? {
            label: "Resend",
            className: "border-sky-200 bg-sky-50 text-sky-700",
          }
        : {
            label: "غير مضبوط",
            className: "border-red-200 bg-red-50 text-red-700",
          };

  return (
    <div className="mt-4 rounded-xl border border-gold-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-primary-950">
          اختبار إرسال البريد
        </h3>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${badge.className}`}
        >
          {status ? badge.label : "جارٍ الفحص…"}
        </span>
      </div>

      <p className="mt-1 text-xs leading-6 text-stone-500">
        يرسل رسالة فعلية للتأكد من عمل المزوّد. لا تُعرض المفاتيح أو كلمات
        المرور هنا.
      </p>

      {status?.from && (
        <p className="mt-2 break-all text-xs text-stone-500" dir="ltr">
          From: {status.from}
        </p>
      )}

      {status?.smtpHost && (
        <p className="mt-1 break-all text-xs text-stone-500" dir="ltr">
          SMTP: {status.smtpHost}
        </p>
      )}

      {status?.configured ? (
        <form onSubmit={sendTest} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="email-test-to" className="sr-only">
            البريد المستلم
          </label>
          <input
            id="email-test-to"
            type="email"
            required
            dir="ltr"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="your@email.com"
            className="input-islamic flex-1"
          />
          <button
            type="submit"
            disabled={sending}
            className="btn-primary justify-center whitespace-nowrap disabled:cursor-wait disabled:opacity-70"
          >
            {sending ? "جارٍ الإرسال…" : "إرسال بريد تجريبي"}
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
          أضف <code dir="ltr">SMTP_HOST</code> و<code dir="ltr">SMTP_USER</code>{" "}
          و<code dir="ltr">SMTP_PASS</code> (أو{" "}
          <code dir="ltr">RESEND_API_KEY</code> و<code dir="ltr">EMAIL_FROM</code>
          ) في بيئة الخادم، ثم أعد التشغيل أو انشر من جديد.
        </p>
      )}

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mt-3 rounded-lg border p-3 text-xs font-bold leading-6 ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.type === "success" ? "✅ " : "❌ "}
          {feedback.text}
        </p>
      )}
    </div>
  );
}
