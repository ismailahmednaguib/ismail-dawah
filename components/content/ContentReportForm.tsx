'use client';

import { useState, type FormEvent } from 'react';
import type { Lang } from '@/lib/i18n';
import TurnstileWidget from '@/components/security/TurnstileWidget';

type Props = {
  lang: Lang;
  pageUrl: string;
  pageTitle: string;
};

export default function ContentReportForm({ lang, pageUrl, pageTitle }: Props) {
  const isArabic = lang === 'ar';
  const [description, setDescription] = useState('');
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
      const response = await fetch('/api/content/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: pageUrl, page_title: pageTitle, description, email, lang, turnstileToken: token }),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || (isArabic ? 'تعذر إرسال البلاغ.' : 'The report could not be sent.'));
      }
      setDescription('');
      setEmail('');
      setToken(null);
      setResetKey((value) => value + 1);
      setMessage(payload.message || (isArabic ? 'تم استلام البلاغ.' : 'The report has been received.'));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : (isArabic ? 'تعذر إرسال البلاغ.' : 'The report could not be sent.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="mt-10 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 dark:border-night-700 dark:bg-night-800/40 md:p-6">
      <summary className="cursor-pointer list-none font-black text-primary-900 marker:hidden dark:text-white">
        {isArabic ? 'الإبلاغ عن خطأ في النص أو المرجع' : 'Report an issue in the text or source'}
      </summary>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {isArabic
          ? 'أرسل رابط الصفحة ووصفًا مختصرًا. البريد اختياري، ولا تكتب بيانات حساسة.'
          : 'Send the page link and a short description. Email is optional; do not include sensitive information.'}
      </p>
      <form onSubmit={submit} className="mt-4">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={10}
          maxLength={2000}
          required
          rows={4}
          placeholder={isArabic ? 'ما الخطأ أو المرجع الذي يحتاج تصحيحًا؟' : 'What needs correction?'}
          className="input-islamic resize-y"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          maxLength={254}
          placeholder={isArabic ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
          className="input-islamic mt-3"
        />
        <TurnstileWidget lang={lang} onToken={setToken} resetKey={resetKey} className="mt-4" />
        {message && <p role="status" className="mt-4 rounded-xl bg-primary-100 px-4 py-3 text-sm font-bold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary mt-4 disabled:cursor-wait disabled:opacity-60">
          {busy ? (isArabic ? 'جارٍ الإرسال...' : 'Sending...') : (isArabic ? 'إرسال البلاغ' : 'Send report')}
        </button>
      </form>
    </details>
  );
}
