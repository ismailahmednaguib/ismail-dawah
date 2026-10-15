'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ContentProgressControlProps {
  contentId: string;
  lang: 'ar' | 'en';
}

type Progress = {
  completed_at: string | null;
  last_position_seconds: number;
};

export default function ContentProgressControl({
  contentId,
  lang,
}: ContentProgressControlProps) {
  const isArabic = lang === 'ar';
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ready, setReady] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/learn/progress?content_id=${encodeURIComponent(contentId)}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (response.status === 401) {
          if (!cancelled) setRequiresLogin(true);
          return null;
        }
        if (!response.ok) throw new Error('progress_fetch_failed');
        return (await response.json()) as { progress?: Progress | null };
      })
      .then((payload) => {
        if (!cancelled && payload) setProgress(payload.progress ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  async function toggleCompleted() {
    setBusy(true);
    setError(false);

    try {
      const completed = !progress?.completed_at;
      const response = await fetch('/api/learn/progress', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId, completed }),
      });

      if (response.status === 401) {
        setRequiresLogin(true);
        return;
      }
      if (!response.ok) throw new Error('progress_save_failed');

      const payload = (await response.json()) as { progress?: Progress };
      setProgress(payload.progress ?? null);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="card mt-8 p-4" aria-busy="true">
        <div className="h-5 w-48 animate-pulse rounded bg-primary-100 dark:bg-primary-900/40" />
      </div>
    );
  }

  if (requiresLogin) {
    return (
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-stone-600 dark:text-gray-300">
          {isArabic
            ? 'سجّل الدخول لحفظ تقدمك في هذا الدرس.'
            : 'Sign in to save your progress in this lesson.'}
        </p>
        <Link href={`/${lang}/login`} className="btn-outline whitespace-nowrap">
          {isArabic ? 'تسجيل الدخول' : 'Sign in'}
        </Link>
      </div>
    );
  }

  return (
    <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-semibold text-primary-950 dark:text-white">
          {progress?.completed_at
            ? isArabic
              ? 'تم حفظ إنجازك لهذا الدرس.'
              : 'This lesson is marked complete.'
            : isArabic
              ? 'تابع تقدمك في مسار التعلم.'
              : 'Keep your learning path up to date.'}
        </p>
        {error && (
          <p className="mt-1 text-sm text-red-700 dark:text-red-300" role="alert">
            {isArabic ? 'تعذر حفظ التقدم الآن.' : 'Progress could not be saved right now.'}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={toggleCompleted}
        disabled={busy}
        className="btn-primary whitespace-nowrap disabled:opacity-60"
      >
        {busy
          ? isArabic
            ? 'جارٍ الحفظ…'
            : 'Saving…'
          : progress?.completed_at
            ? isArabic
              ? 'إلغاء الإنجاز'
              : 'Mark incomplete'
            : isArabic
              ? 'تحديد كمكتمل'
              : 'Mark as complete'}
      </button>
    </div>
  );
}
