"use client";

import { useState } from 'react';

type SendResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  sent?: number;
  failed?: number;
  deactivated?: number;
  skipped?: number;
  total?: number;
  dry_run?: boolean;
};

export default function NotificationsClient() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SendResponse | null>(null);

  async function sendNotification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url: url || undefined }),
      });
      const payload = (await response.json().catch(() => ({}))) as SendResponse;

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/ar/login';
        return;
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'تعذر إرسال الإشعار.');
      }

      setResult(payload);
    } catch (sendError) {
      console.error('[NotificationsClient] send error:', sendError);
      setError(sendError instanceof Error ? sendError.message : 'تعذر إرسال الإشعار.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <form onSubmit={sendNotification} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5">
          <label>
            <span className="mb-2 block text-sm font-black text-primary-900">عنوان الإشعار</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
              placeholder="مثال: درس جديد متاح الآن"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-primary-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <span className="mt-1 block text-xs text-stone-400">{title.length} / 120</span>
          </label>

          <label>
            <span className="mb-2 block text-sm font-black text-primary-900">نص الإشعار</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={250}
              required
              rows={5}
              placeholder="اكتب الرسالة المختصرة التي ستظهر للمشتركين"
              className="w-full resize-y rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm leading-7 text-primary-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <span className="mt-1 block text-xs text-stone-400">{body.length} / 250</span>
          </label>

          <label>
            <span className="mb-2 block text-sm font-black text-primary-900">رابط الفتح (اختياري)</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              type="url"
              placeholder="https://example.com/ar/learn"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-primary-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              dir="ltr"
            />
            <span className="mt-1 block text-xs text-stone-400">يُسمح برابط الموقع أو النطاقات المضافة في إعدادات الإشعارات.</span>
          </label>
        </div>

        {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}

        <button
          type="submit"
          disabled={sending || !title.trim() || !body.trim()}
          className="mt-6 w-full rounded-xl bg-primary-700 px-5 py-3 text-sm font-black text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'جارٍ الإرسال...' : 'إرسال للمشتركين'}
        </button>
      </form>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-primary-800 bg-primary-950 p-6 text-white shadow-card">
          <p className="text-xs font-bold text-gold-300">معاينة</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="font-black text-gold-200">{title.trim() || 'عنوان الإشعار'}</p>
            <p className="mt-2 text-sm leading-7 text-primary-100">{body.trim() || 'سيظهر نص الإشعار هنا قبل الإرسال.'}</p>
          </div>
          <p className="mt-4 text-xs leading-6 text-primary-200">الإرسال يعتمد على وجود اشتراكات Web Push فعالة ومفاتيح VAPID في بيئة الإنتاج.</p>
        </div>

        {result ? (
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-sm text-primary-900">
            <p className="font-black">{result.message || 'اكتملت العملية.'}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <span className="rounded-xl bg-white p-3"><strong className="block text-xl">{result.sent ?? 0}</strong>أُرسل</span>
              <span className="rounded-xl bg-white p-3"><strong className="block text-xl">{result.total ?? 0}</strong>الإجمالي</span>
              <span className="rounded-xl bg-white p-3"><strong className="block text-xl">{result.failed ?? 0}</strong>فشل</span>
              <span className="rounded-xl bg-white p-3"><strong className="block text-xl">{result.deactivated ?? 0}</strong>غير فعال</span>
            </div>
            {result.dry_run ? <p className="mt-3 text-xs font-bold text-gold-800">الوضع التجريبي مفعّل حاليًا.</p> : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
