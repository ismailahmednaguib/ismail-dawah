'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertIcon, CheckCircleIcon, CopyIcon, KeyIcon, ShieldCheckIcon } from '@/lib/icons';

type Status = {
  available?: boolean;
  configured?: boolean;
  enabled?: boolean;
  canManage?: boolean;
  encryptionKeyConfigured?: boolean;
};

export default function MfaPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/mfa', { cache: 'no-store' });
      const data = (await response.json()) as Status & { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || 'تعذر قراءة الإعدادات');
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر قراءة إعدادات التحقق الثنائي');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function request(action: 'begin' | 'enable' | 'disable') {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...(code ? { code } : {}) }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        secret?: string;
        otpauthUrl?: string;
        enabled?: boolean;
      };
      if (!response.ok || !data.ok) throw new Error(data.error || 'تعذر تنفيذ الإجراء');

      if (action === 'begin') {
        setSecret(data.secret || '');
        setOtpauthUrl(data.otpauthUrl || '');
        setStatus((current) => ({ ...current, configured: true }));
        setMessage('تم إنشاء سر جديد. أضفه في تطبيق Authenticator ثم أدخل الرمز للتفعيل.');
      } else {
        setCode('');
        setSecret('');
        setOtpauthUrl('');
        setMessage(action === 'enable' ? 'تم تفعيل التحقق الثنائي لهذا الحساب.' : 'تم تعطيل التحقق الثنائي.');
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تنفيذ الإجراء');
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage('تم النسخ.');
    } catch {
      setError('تعذر النسخ تلقائيًا؛ انسخ النص يدويًا.');
    }
  }

  if (loading) return <section className="card p-5 text-sm opacity-70">جارٍ تحميل التحقق الثنائي…</section>;
  if (!status) return null;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 p-4 dark:border-white/10">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <ShieldCheckIcon size={19} aria-hidden="true" /> التحقق الثنائي للأدمن
          </h2>
          <p className="mt-1 text-xs opacity-70">
            استخدم تطبيق Authenticator لإضافة طبقة حماية ثانية بعد كلمة المرور.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.enabled ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
          {status.enabled ? 'مفعّل' : 'غير مفعّل'}
        </span>
      </div>

      {message && <p className="flex items-center gap-2 border-b border-primary-500/20 bg-primary-500/10 px-4 py-3 text-sm text-primary-700 dark:text-primary-300"><CheckCircleIcon size={17} aria-hidden="true" />{message}</p>}
      {error && <p className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"><AlertIcon size={17} aria-hidden="true" />{error}</p>}

      {!status.available ? (
        <div className="p-4 text-sm">
          <p className="font-bold">Migration التحقق الثنائي غير مطبّقة بعد.</p>
          <p className="mt-1 text-xs opacity-75">نفّذ <code dir="ltr">supabase/migrations/20261027_admin_mfa.sql</code> ثم أعد تحميل الصفحة.</p>
        </div>
      ) : !status.canManage ? (
        <p className="p-4 text-sm opacity-75">العرض متاح للمديرين، والتعديل متاح للمدير العام فقط.</p>
      ) : (
        <div className="space-y-4 p-4">
          {!status.enabled && !secret && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/5 p-4 dark:bg-white/5">
              <div>
                <p className="font-bold">بدء إعداد Authenticator</p>
                <p className="mt-1 text-xs opacity-70">سيظهر سر الإعداد مرة واحدة في هذه الشاشة.</p>
              </div>
              <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => void request('begin')} disabled={busy}>
                <KeyIcon size={16} aria-hidden="true" /> إنشاء إعداد
              </button>
            </div>
          )}

          {secret && (
            <div className="space-y-3 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4">
              <p className="font-bold">أضف الحساب إلى تطبيق Authenticator</p>
              <p className="text-xs opacity-75">إن لم تستخدم QR، أدخل المفتاح اليدوي التالي:</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-black/5 px-3 py-2 text-sm tracking-[0.18em] dark:bg-white/10" dir="ltr">{secret}</code>
                <button type="button" className="btn-secondary inline-flex items-center gap-1 text-xs" onClick={() => void copy(secret)}><CopyIcon size={14} aria-hidden="true" /> نسخ</button>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer font-bold">رابط otpauth لمن يملك QR generator</summary>
                <div className="mt-2 flex gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-lg bg-black/5 p-2 dark:bg-white/10" dir="ltr">{otpauthUrl}</code>
                  <button type="button" className="btn-secondary h-fit" onClick={() => void copy(otpauthUrl)} aria-label="نسخ رابط الإعداد" title="نسخ"><CopyIcon size={14} aria-hidden="true" /></button>
                </div>
              </details>
            </div>
          )}

          {!status.enabled && status.configured && (
            <div className="space-y-2">
              <label htmlFor="admin-mfa-code" className="block text-sm font-bold">أدخل رمز التطبيق لتأكيد التفعيل</label>
              <div className="flex flex-wrap gap-2">
                <input id="admin-mfa-code" className="input-islamic w-40" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" dir="ltr" />
                <button type="button" className="btn-primary" disabled={busy || code.length !== 6} onClick={() => void request('enable')}>تفعيل التحقق</button>
              </div>
            </div>
          )}

          {status.enabled && (
            <div className="space-y-2">
              <label htmlFor="admin-mfa-disable-code" className="block text-sm font-bold">للتعطيل، أدخل رمز التطبيق الحالي</label>
              <div className="flex flex-wrap gap-2">
                <input id="admin-mfa-disable-code" className="input-islamic w-40" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" dir="ltr" />
                <button type="button" className="btn-secondary" disabled={busy || code.length !== 6} onClick={() => void request('disable')}>تعطيل التحقق</button>
              </div>
            </div>
          )}

          {!status.encryptionKeyConfigured && <p className="text-xs text-amber-700 dark:text-amber-300">تنبيه: يفضّل ضبط <code dir="ltr">ADMIN_MFA_ENCRYPTION_KEY</code> مستقلًا عن سر الجلسة قبل الإنتاج.</p>}
        </div>
      )}
    </section>
  );
}
