"use client";

// app/[lang]/verify-email/VerifyEmailClient.tsx
// يستدعي مسار التحقق مرة واحدة ويعرض النتيجة بلغة الصفحة.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Status =
  | "checking"
  | "success"
  | "already"
  | "invalid"
  | "expired"
  | "unavailable"
  | "error"
  | "missing";

type VerifyResponse = {
  ok?: boolean;
  alreadyVerified?: boolean;
  error?: string;
};

export default function VerifyEmailClient({ lang }: { lang: "ar" | "en" }) {
  const isRTL = lang === "ar";
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "checking" : "missing");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json().catch(() => ({}))) as VerifyResponse;

        if (cancelled) return;

        if (response.ok && data.ok) {
          setStatus(data.alreadyVerified ? "already" : "success");
          return;
        }

        switch (data.error) {
          case "expired_token":
            setStatus("expired");
            break;
          case "verification_unavailable":
            setStatus("unavailable");
            break;
          case "invalid_token":
            setStatus("invalid");
            break;
          default:
            setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const copy = isRTL
    ? {
        checkingTitle: "جارٍ تفعيل بريدك…",
        checkingBody: "لحظات قليلة ولا تغلق الصفحة.",
        successTitle: "تم تفعيل بريدك بنجاح",
        successBody: "حسابك مؤكَّد الآن، ويمكنك متابعة رحلتك التعليمية.",
        alreadyTitle: "بريدك مفعّل بالفعل",
        alreadyBody: "لا حاجة لأي خطوة إضافية.",
        missingTitle: "رابط غير مكتمل",
        missingBody: "لم نجد رمز التفعيل في الرابط. افتح الرابط من البريد كما هو.",
        invalidTitle: "رابط غير صالح",
        invalidBody: "قد يكون الرابط قد استُخدم من قبل أو نُسخ ناقصًا.",
        expiredTitle: "انتهت صلاحية الرابط",
        expiredBody: "صلاحية الرابط ٢٤ ساعة. اطلب رابطًا جديدًا من صفحة حسابك.",
        unavailableTitle: "التحقق غير متاح مؤقتًا",
        unavailableBody: "لم يكتمل إعداد الخدمة بعد. حاول لاحقًا أو تواصل معنا.",
        errorTitle: "تعذر إتمام التفعيل",
        errorBody: "حدث خطأ غير متوقع. حاول مرة أخرى بعد قليل.",
        account: "الذهاب إلى حسابي",
        resend: "طلب رابط جديد",
        home: "العودة للرئيسية",
        contact: "تواصل معنا",
      }
    : {
        checkingTitle: "Verifying your email…",
        checkingBody: "This only takes a moment. Please keep this page open.",
        successTitle: "Your email is verified",
        successBody: "Your account is confirmed. You can continue learning.",
        alreadyTitle: "Your email is already verified",
        alreadyBody: "No further action is needed.",
        missingTitle: "Incomplete link",
        missingBody: "The verification token is missing. Open the link from the email as-is.",
        invalidTitle: "Invalid link",
        invalidBody: "It may have been used already or copied incompletely.",
        expiredTitle: "This link has expired",
        expiredBody: "Links are valid for 24 hours. Request a new one from your account page.",
        unavailableTitle: "Verification is temporarily unavailable",
        unavailableBody: "The service is not fully configured yet. Try again later or contact us.",
        errorTitle: "We could not verify your email",
        errorBody: "An unexpected error occurred. Please try again shortly.",
        account: "Go to my account",
        resend: "Request a new link",
        home: "Back to home",
        contact: "Contact us",
      };

  const content: Record<Status, { title: string; body: string; tone: string; icon: string }> = {
    checking: {
      title: copy.checkingTitle,
      body: copy.checkingBody,
      tone: "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-200",
      icon: "⏳",
    },
    success: {
      title: copy.successTitle,
      body: copy.successBody,
      tone: "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-200",
      icon: "✅",
    },
    already: {
      title: copy.alreadyTitle,
      body: copy.alreadyBody,
      tone: "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800/40 dark:bg-primary-950/20 dark:text-primary-200",
      icon: "✅",
    },
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
    error: {
      title: copy.errorTitle,
      body: copy.errorBody,
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-200",
      icon: "❌",
    },
  };

  const state = content[status];
  const isDone = status === "success" || status === "already";
  const isBroken =
    status === "missing" ||
    status === "invalid" ||
    status === "expired" ||
    status === "unavailable" ||
    status === "error";

  return (
    <div className="card overflow-hidden p-6 md:p-8">
      <div className={`rounded-2xl border p-5 ${state.tone}`} role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden="true">
            {status === "checking" ? (
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            ) : (
              state.icon
            )}
          </span>

          <div className="min-w-0">
            <h2 className="text-xl font-black leading-relaxed">{state.title}</h2>
            <p className="mt-2 text-sm leading-7">{state.body}</p>
          </div>
        </div>
      </div>

      {status !== "checking" && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {isDone ? (
            <Link href={`/${lang}/account`} className="btn-primary justify-center">
              {copy.account}
            </Link>
          ) : null}

          {isBroken ? (
            <>
              <Link href={`/${lang}/account`} className="btn-primary justify-center">
                {copy.resend}
              </Link>
              <Link href={`/${lang}/login`} className="btn-outline justify-center">
                {copy.account}
              </Link>
            </>
          ) : null}

          <Link href={`/${lang}`} className="btn-outline justify-center">
            {copy.home}
          </Link>

          <Link href={`/${lang}/contact`} className="btn-outline justify-center">
            {copy.contact}
          </Link>
        </div>
      )}
    </div>
  );
}
