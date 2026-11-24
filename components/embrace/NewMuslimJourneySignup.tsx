'use client';

import { useState, type FormEvent } from 'react';
import type { Lang } from '@/lib/i18n';

const COPY = {
  ar: { title: 'رحلة بريدية اختيارية لأول 30 يومًا', desc: 'رسالة قصيرة كل 48 ساعة تساعدك على تثبيت البداية. الخطة متاحة كاملة بلا بريد، والبريد لا يُستخدم إلا لهذه الرحلة ويمكن إلغاؤها في أي وقت.', email: 'البريد الإلكتروني', consent: 'أوافق على استلام رسائل رحلة المسلم الجديد ويمكنني إلغاء الاشتراك لاحقًا.', submit: 'اشترك اختياريًا', loading: 'جارٍ الاشتراك...', success: 'تم الاشتراك. ستصلك الرسالة الأولى قريبًا.', generic: 'تعذر الاشتراك حاليًا. حاول لاحقًا.' },
  en: { title: 'Optional first-30-days email journey', desc: 'One short email every 48 hours to help you build a steady beginning. The full plan is available without email; email is used only for this journey and can be cancelled anytime.', email: 'Email address', consent: 'I agree to receive the new Muslim journey and understand I can unsubscribe later.', submit: 'Subscribe optionally', loading: 'Subscribing...', success: 'You are subscribed. The first message will arrive soon.', generic: 'Subscription failed temporarily. Please try again later.' },
} as const;

export default function NewMuslimJourneySignup({ lang, enabled }: { lang: Lang; enabled: boolean }) {
  const copy = COPY[lang];
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  if (!enabled) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('loading'); setMessage('');
    try {
      const response = await fetch('/api/new-muslim/journey/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, lang, consent }) });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || copy.generic);
      setState('success'); setMessage(payload.message || copy.success); setEmail(''); setConsent(false);
    } catch (error) { setState('error'); setMessage(error instanceof Error ? error.message : copy.generic); }
  }

  return (
    <section className="card mb-10 border-primary-200 bg-primary-50/60 p-6 dark:border-primary-800/50 dark:bg-primary-950/20" aria-labelledby="new-muslim-journey-email-title">
      <h2 id="new-muslim-journey-email-title" className="text-xl font-black text-primary-950 dark:text-white">{copy.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-200">{copy.desc}</p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="new-muslim-journey-email" className="sr-only">{copy.email}</label>
          <input id="new-muslim-journey-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-islamic min-w-0 flex-1" dir="ltr" placeholder={copy.email} autoComplete="email" />
          <button type="submit" disabled={state === 'loading' || !consent} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{state === 'loading' ? copy.loading : copy.submit}</button>
        </div>
        <label className="flex items-start gap-2 text-xs leading-6 text-slate-600 dark:text-slate-300"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-primary-700" /><span>{copy.consent}</span></label>
      </form>
      {message && <p role="status" className={`mt-3 text-sm font-bold ${state === 'error' ? 'text-red-700 dark:text-red-300' : 'text-primary-700 dark:text-primary-300'}`}>{message}</p>}
    </section>
  );
}
