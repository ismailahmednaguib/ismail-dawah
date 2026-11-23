'use client';

import { useState, type FormEvent } from 'react';
import type { Lang } from '@/lib/i18n';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function AskMuslimForm({ lang, pageSlug }: { lang: Lang; pageSlug: string }) {
  const isArabic = lang === 'ar';
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/dawah/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, email, lang, page_slug: pageSlug, turnstileToken: token }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || (isArabic ? 'تعذر إرسال السؤال.' : 'The question could not be sent.'));
      setQuestion('');
      setEmail('');
      setToken(null);
      setResetKey((value) => value + 1);
      setMessage(payload.message || (isArabic ? 'تم استلام سؤالك.' : 'Your question has been received.'));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : (isArabic ? 'تعذر إرسال السؤال.' : 'The question could not be sent.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 dark:border-night-700 dark:bg-night-800/50 md:p-6">
      <h2 className="text-xl font-black text-primary-950 dark:text-white">
        {isArabic ? 'أرسل سؤالك' : 'Send your question'}
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {isArabic ? 'البريد اختياري. لا تكتب بيانات حساسة أو ما يعرّف بشخص آخر.' : 'Email is optional. Do not include sensitive information or identify another person.'}
      </p>
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        minLength={10}
        maxLength={2000}
        required
        rows={5}
        placeholder={isArabic ? 'اكتب سؤالك بوضوح...' : 'Write your question clearly...'}
        className="input-islamic mt-5 min-h-32 resize-y"
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder={isArabic ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
        className="input-islamic mt-3"
      />
      <TurnstileWidget lang={lang} onToken={setToken} resetKey={resetKey} className="mt-4" />
      {message && <p role="status" className="mt-4 rounded-xl bg-primary-100 px-4 py-3 text-sm font-bold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary mt-5 disabled:cursor-wait disabled:opacity-60">
        {busy ? (isArabic ? 'جارٍ الإرسال...' : 'Sending...') : (isArabic ? 'إرسال السؤال' : 'Send question')}
      </button>
    </form>
  );
}
