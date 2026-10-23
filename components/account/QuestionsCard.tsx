"use client";

// components/account/QuestionsCard.tsx
// نموذج «أسئلتي» للمستخدم المسجّل: إرسال سؤال ومتابعة الرد.
// لا يظهر إلا داخل صفحة الحساب بعد التحقق من الجلسة.

import Link from "next/link";
import { useEffect, useState } from "react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import {
  formatQuestionDate,
  normalizeQuestions,
  questionStatusKind,
  type QuestionView,
} from "@/lib/questions/client";
import type { Lang } from "@/lib/i18n";
import { renderDesignIcon } from "@/components/ui";

const MIN_QUESTION_LENGTH = 10;
const MAX_QUESTION_LENGTH = 2_000;

const TURNSTILE_REQUIRED = Boolean(
  (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim()
);

const COPY = {
  ar: {
    title: "أسئلتي",
    subtitle: "أرسل سؤالك وتابع الرد عليه من فريق الدعوة.",
    label: "سؤالك",
    placeholder: "اكتب سؤالك بوضوح، واذكر ما يساعد على الإجابة...",
    submit: "إرسال السؤال",
    sending: "جارٍ إرسال السؤال...",
    privacy: "لا تضع بيانات شخصية حساسة.",
    listTitle: "الأسئلة السابقة",
    loading: "جارٍ تحميل أسئلتك...",
    empty: "لم ترسل أي سؤال بعد.",
    loadError: "تعذر تحميل الأسئلة. حاول لاحقًا.",
    submitError: "تعذر إرسال السؤال. حاول لاحقًا.",
    success: "تم إرسال سؤالك بنجاح.",
    tooShort: "اكتب سؤالًا من ١٠ أحرف على الأقل.",
    security: "أكمل التحقق الأمني أولًا.",
    sessionExpired: "انتهت الجلسة. سجّل الدخول من جديد.",
    tooMany: "عدد المحاولات كثير. حاول بعد قليل.",
    refresh: "تحديث",
    retry: "إعادة المحاولة",
    signIn: "تسجيل الدخول",
    answer: "الرد",
    statusAnswered: "تم الرد",
    statusPending: "بانتظار الرد",
    statusClosed: "مغلق",
  },
  en: {
    title: "My questions",
    subtitle: "Send a question and follow up on the answer from the dawah team.",
    label: "Your question",
    placeholder: "Write your question clearly and include what helps answer it...",
    submit: "Send question",
    sending: "Sending your question...",
    privacy: "Do not include sensitive personal data.",
    listTitle: "Previous questions",
    loading: "Loading your questions...",
    empty: "You have not sent any questions yet.",
    loadError: "Could not load your questions. Please try again later.",
    submitError: "Could not send your question. Please try again later.",
    success: "Your question was sent successfully.",
    tooShort: "Write a question of at least 10 characters.",
    security: "Complete the security check first.",
    sessionExpired: "Your session expired. Please sign in again.",
    tooMany: "Too many attempts. Please try again shortly.",
    refresh: "Refresh",
    retry: "Try again",
    signIn: "Sign in",
    answer: "Answer",
    statusAnswered: "Answered",
    statusPending: "Awaiting answer",
    statusClosed: "Closed",
  },
} as const;

type Notice = { type: "success" | "error"; text: string } | null;

export default function QuestionsCard({ lang }: { lang: Lang }) {
  const copy = COPY[lang];

  const [questions, setQuestions] = useState<QuestionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
  };

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      setNeedsLogin(false);

      try {
        const response = await fetch("/api/questions?status=all&limit=20", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!active) return;

        if (response.status === 401) {
          setLoadError(copy.sessionExpired);
          setNeedsLogin(true);
          return;
        }

        if (!response.ok) {
          setLoadError(copy.loadError);
          return;
        }

        const data = (await response.json().catch(() => null)) as {
          questions?: unknown;
        } | null;

        if (!active) return;

        setQuestions(normalizeQuestions(data?.questions));
      } catch {
        if (active) setLoadError(copy.loadError);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [refreshKey, copy]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = question.trim();

    if (value.length < MIN_QUESTION_LENGTH) {
      setNotice({ type: "error", text: copy.tooShort });
      return;
    }

    if (TURNSTILE_REQUIRED && !turnstileToken) {
      setNotice({ type: "error", text: copy.security });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: value,
          web: true,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      if (response.status === 401) {
        setNotice({ type: "error", text: copy.sessionExpired });
        setNeedsLogin(true);
        return;
      }

      if (response.status === 429) {
        setNotice({ type: "error", text: copy.tooMany });
        return;
      }

      if (!response.ok) {
        setNotice({ type: "error", text: copy.submitError });
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
      } | null;

      if (!data?.ok) {
        setNotice({ type: "error", text: copy.submitError });
        return;
      }

      setQuestion("");
      setNotice({ type: "success", text: copy.success });
      setRefreshKey((key) => key + 1);
    } catch {
      setNotice({ type: "error", text: copy.submitError });
    } finally {
      setSubmitting(false);
      // رمز Turnstile صالح لمرة واحدة، حتى بعد النجاح.
      if (TURNSTILE_REQUIRED) resetTurnstile();
    }
  }

  return (
    <section aria-labelledby="account-questions-title" className="mb-10">
      <div className="card relative overflow-hidden p-6 md:p-8">
        <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
            {renderDesignIcon("💬", 24)}
          </span>
          <div className="min-w-0">
            <h2
              id="account-questions-title"
              className="text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {copy.subtitle}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6">
          <label
            htmlFor="account-question"
            className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            {copy.label}
          </label>

          <textarea
            id="account-question"
            name="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.placeholder}
            rows={4}
            maxLength={MAX_QUESTION_LENGTH}
            minLength={MIN_QUESTION_LENGTH}
            required
            disabled={submitting}
            aria-describedby="account-question-hint"
            className="input-islamic w-full resize-y"
          />

          <div
            id="account-question-hint"
            className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <span>{copy.privacy}</span>
            <span dir="ltr">
              {question.length}/{MAX_QUESTION_LENGTH}
            </span>
          </div>

          <TurnstileWidget
            lang={lang}
            onToken={setTurnstileToken}
            resetKey={turnstileResetKey}
            className="mt-4 flex justify-center"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={
                submitting ||
                question.trim().length < MIN_QUESTION_LENGTH ||
                (TURNSTILE_REQUIRED && !turnstileToken)
              }
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? copy.sending : copy.submit}
            </button>

            {notice && (
              <p
                role={notice.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={
                  notice.type === "success"
                    ? "text-sm font-bold text-primary-700 dark:text-primary-300"
                    : "text-sm font-bold text-red-700 dark:text-red-400"
                }
              >
                {notice.text}
              </p>
            )}
          </div>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {copy.listTitle}
            </h3>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading}
              className="text-sm font-bold text-primary-700 hover:underline disabled:cursor-wait disabled:opacity-50 dark:text-primary-300"
            >
              {copy.refresh}
            </button>
          </div>

          {loadError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
            >
              <p>{loadError}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="font-bold underline"
                >
                  {copy.retry}
                </button>
                {needsLogin && (
                  <Link
                    href={`/${lang}/login`}
                    className="font-bold underline"
                  >
                    {copy.signIn}
                  </Link>
                )}
              </div>
            </div>
          )}

          {loading && questions.length === 0 && (
            <p
              role="status"
              className="mt-4 text-sm text-slate-500 dark:text-slate-400"
            >
              {copy.loading}
            </p>
          )}

          {!loading && !loadError && questions.length === 0 && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {copy.empty}
            </p>
          )}

          {questions.length > 0 && (
            <ul className="mt-4 space-y-4" aria-busy={loading}>
              {questions.map((item) => {
                const kind = questionStatusKind(item.status);
                const statusLabel =
                  kind === "answered"
                    ? copy.statusAnswered
                    : kind === "pending"
                      ? copy.statusPending
                      : copy.statusClosed;
                const statusClass =
                  kind === "answered"
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                    : kind === "pending"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
                const createdAt = formatQuestionDate(item.createdAt, lang);

                return (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                        {item.question}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {createdAt && (
                      <time
                        dateTime={item.createdAt || undefined}
                        className="mt-2 block text-xs text-slate-500 dark:text-slate-400"
                      >
                        {createdAt}
                      </time>
                    )}

                    {item.answer && (
                      <div className="mt-4 rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
                        <p className="text-xs font-black text-primary-800 dark:text-primary-200">
                          {copy.answer}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
