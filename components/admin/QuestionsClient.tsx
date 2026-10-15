"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type QuestionStatus = 'all' | 'pending' | 'answered';

type QuestionRow = {
  id: string;
  question: string;
  answer: string | null;
  status: string | null;
  createdAt: string | null;
  answeredAt: string | null;
  userName: string | null;
  userEmail: string | null;
};

type ApiQuestion = {
  id?: string | number;
  question?: unknown;
  answer?: unknown;
  status?: unknown;
  created_at?: unknown;
  answered_at?: unknown;
  users?: { name?: unknown; email?: unknown } | null;
};

function toQuestionRow(value: ApiQuestion): QuestionRow | null {
  const id = String(value.id ?? '').trim();
  const question = typeof value.question === 'string' ? value.question.trim() : '';

  if (!id || !question) return null;

  return {
    id,
    question,
    answer: typeof value.answer === 'string' ? value.answer : null,
    status: typeof value.status === 'string' ? value.status : null,
    createdAt: typeof value.created_at === 'string' ? value.created_at : null,
    answeredAt: typeof value.answered_at === 'string' ? value.answered_at : null,
    userName: typeof value.users?.name === 'string' ? value.users.name : null,
    userEmail: typeof value.users?.email === 'string' ? value.users.email : null,
  };
}

function formatDate(value: string | null): string {
  if (!value) return 'بدون تاريخ';

  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusLabel(status: string | null): string {
  return status === 'answered' ? 'تمت الإجابة' : 'بانتظار الرد';
}

export default function QuestionsClient() {
  const [status, setStatus] = useState<QuestionStatus>('pending');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/questions/admin?status=${status}&page=1&limit=100`,
        { credentials: 'include', cache: 'no-store' }
      );
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        questions?: ApiQuestion[];
      };

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/ar/login';
        return;
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'تعذر تحميل الأسئلة.');
      }

      const nextQuestions = (payload.questions || [])
        .map(toQuestionRow)
        .filter((item): item is QuestionRow => Boolean(item));

      setQuestions(nextQuestions);
      setDrafts((current) => {
        const next = { ...current };
        for (const item of nextQuestions) {
          if (!(item.id in next)) next[item.id] = item.answer || '';
        }
        return next;
      });
    } catch (loadError) {
      console.error('[QuestionsClient] load error:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل الأسئلة.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const pendingCount = useMemo(
    () => questions.filter((item) => item.status !== 'answered').length,
    [questions]
  );

  async function answerQuestion(question: QuestionRow) {
    const answer = (drafts[question.id] || '').trim();

    if (!answer) {
      setError('اكتب الإجابة قبل الحفظ.');
      return;
    }

    setSavingId(question.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch('/api/questions/admin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, answer }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/ar/login';
        return;
      }

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || 'تعذر حفظ الإجابة.');
      }

      setNotice(payload.message || 'تم حفظ الإجابة بنجاح.');
      if (status === 'pending') {
        setQuestions((current) => current.filter((item) => item.id !== question.id));
      } else {
        setQuestions((current) =>
          current.map((item) =>
            item.id === question.id
              ? { ...item, answer, status: 'answered', answeredAt: new Date().toISOString() }
              : item
          )
        );
      }
    } catch (saveError) {
      console.error('[QuestionsClient] save error:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الإجابة.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ['pending', 'معلقة'],
          ['answered', 'تمت الإجابة'],
          ['all', 'كل الأسئلة'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-2xl border p-4 text-right transition ${
              status === value
                ? 'border-primary-700 bg-primary-950 text-white shadow-card'
                : 'border-cream-200 bg-white text-primary-950 hover:border-primary-300'
            }`}
          >
            <span className="text-sm font-bold">{label}</span>
            {value === 'pending' ? (
              <strong className="mt-1 block text-2xl font-black">{pendingCount}</strong>
            ) : (
              <span className="mt-1 block text-xs opacity-70">تصفية القائمة</span>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => void loadQuestions()} className="font-black underline">
            إعادة المحاولة
          </button>
        </div>
      ) : null}
      {notice ? <p className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm font-bold text-primary-800">{notice}</p> : null}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-cream-100" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-black text-primary-950">لا توجد أسئلة في هذا القسم</p>
          <p className="mt-2 text-sm text-stone-500">عندما يرسل الزوار أسئلة جديدة ستظهر هنا مباشرة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-cream-100 pb-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${question.status === 'answered' ? 'bg-primary-50 text-primary-700' : 'bg-gold-50 text-gold-800'}`}>
                      {statusLabel(question.status)}
                    </span>
                    <span className="text-xs text-stone-400">{formatDate(question.createdAt)}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-base font-bold leading-8 text-primary-950">{question.question}</p>
                </div>
                <div className="text-xs text-stone-500 md:text-left">
                  <p>{question.userName || 'زائر'}</p>
                  {question.userEmail ? <p dir="ltr">{question.userEmail}</p> : null}
                </div>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-black text-primary-900">الإجابة</span>
                <textarea
                  value={drafts[question.id] || ''}
                  onChange={(event) => setDrafts((current) => ({ ...current, [question.id]: event.target.value }))}
                  rows={5}
                  maxLength={10000}
                  placeholder="اكتب إجابة واضحة ومراجعة علميًا..."
                  className="w-full resize-y rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm leading-7 text-primary-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <span className="text-xs text-stone-400">{(drafts[question.id] || '').length.toLocaleString('ar-EG')} / 10,000</span>
                <button
                  type="button"
                  onClick={() => void answerQuestion(question)}
                  disabled={savingId === question.id}
                  className="rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-primary-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {savingId === question.id ? 'جارٍ الحفظ...' : question.status === 'answered' ? 'تحديث الإجابة' : 'حفظ ونشر الإجابة'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
