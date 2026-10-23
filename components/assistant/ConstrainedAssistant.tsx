'use client';

import { useState } from 'react';
import Link from 'next/link';
import TurnstileWidget from '@/components/security/TurnstileWidget';
import type { Lang } from '@/lib/i18n';
import { renderDesignIcon } from '@/components/ui';

const TURNSTILE_REQUIRED = Boolean(
  (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
);

type Source = {
  id: string;
  title: string;
  type: string;
  href: string;
};

const COPY = {
  ar: {
    title: 'مساعد البحث المقيّد',
    description: 'اسأل عن مادة منشورة في المنصة. سيجيب المساعد من المصادر الظاهرة فقط ويعرضها لك.',
    placeholder: 'اكتب سؤالك عن الإسلام أو موضوع في المكتبة...',
    ask: 'اسأل المساعد',
    loading: 'جارٍ البحث في المصادر...',
    disclaimer: 'الإجابة تعليمية عامة وليست فتوى شخصية. راجع عالمًا مؤهلًا في المسائل الدقيقة.',
    sources: 'المصادر المستخدمة',
    contact: 'تواصل مع داعية',
    error: 'تعذر تشغيل المساعد حاليًا. حاول لاحقًا.',
  },
  en: {
    title: 'Grounded search assistant',
    description: 'Ask about published material on the platform. The assistant answers from the shown sources only.',
    placeholder: 'Ask about Islam or a topic in the library...',
    ask: 'Ask assistant',
    loading: 'Searching published sources...',
    disclaimer: 'General educational information, not a personal fatwa. Consult a qualified scholar for sensitive matters.',
    sources: 'Sources used',
    contact: 'Talk to a daee',
    error: 'The assistant is temporarily unavailable. Please try again later.',
  },
} as const;

export default function ConstrainedAssistant({ lang, enabled }: { lang: Lang; enabled: boolean }) {
  const copy = COPY[lang];
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  if (!enabled) return null;

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim().length < 2 || loading) return;

    if (TURNSTILE_REQUIRED && !turnstileToken) {
      setError(
        lang === 'ar'
          ? 'أكمل التحقق الأمني أولًا.'
          : 'Complete the security check first.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch(`/api/assistant?lang=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      const payload = await response.json().catch(() => ({})) as {
        ok?: boolean;
        answer?: string;
        sources?: Source[];
        error?: string;
      };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || copy.error);
      setAnswer(payload.answer || '');
      setSources(Array.isArray(payload.sources) ? payload.sources : []);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.error);
    } finally {
      setLoading(false);
      // رمز Turnstile يُستهلك مرة واحدة؛ نطلبه من جديد حتى يستطيع الزائر
      // متابعة الأسئلة بعد كل إجابة.
      if (TURNSTILE_REQUIRED) resetTurnstile();
    }
  }

  return (
    <section className="card border-primary-200 bg-primary-50/60 p-6 dark:border-night-700 dark:bg-night-800" aria-labelledby="assistant-title">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-700 text-2xl text-white" aria-hidden="true">{renderDesignIcon("✦", 24)}</span>
        <div className="min-w-0 flex-1">
          <h2 id="assistant-title" className="text-xl font-black text-primary-950 dark:text-white">{copy.title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{copy.description}</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="sr-only" htmlFor="assistant-question">{copy.placeholder}</label>
            <textarea
              id="assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, 500))}
              placeholder={copy.placeholder}
              maxLength={500}
              rows={3}
              className="input-islamic w-full resize-y"
            />
            <TurnstileWidget
              lang={lang}
              onToken={setTurnstileToken}
              resetKey={turnstileResetKey}
              className="flex justify-center"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">{question.length}/500</span>
              <button type="submit" disabled={loading || question.trim().length < 2 || (TURNSTILE_REQUIRED && !turnstileToken)} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? copy.loading : copy.ask}
              </button>
            </div>
          </form>

          {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
          {answer ? (
            <div className="mt-5 rounded-2xl border border-primary-200 bg-white p-5 dark:border-night-700 dark:bg-night-900">
              <p className="whitespace-pre-wrap text-sm leading-8 text-primary-950 dark:text-slate-100">{answer}</p>
              {sources.length > 0 ? (
                <div className="mt-5 border-t border-primary-100 pt-4 dark:border-night-700">
                  <h3 className="text-sm font-black text-primary-900 dark:text-primary-200">{copy.sources}</h3>
                  <ul className="mt-2 space-y-2">
                    {sources.map((source, index) => (
                      <li key={`${source.id}-${index}`}>
                        <Link href={source.href} className="text-sm font-bold text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
                          [{index + 1}] {source.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
            {copy.disclaimer}{' '}
            <Link href={`/${lang}/contact`} className="font-bold text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">{copy.contact}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
