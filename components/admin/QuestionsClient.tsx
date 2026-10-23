"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type QuestionStatus = 'all' | 'pending' | 'answered';
type AssignmentStatus = 'unassigned' | 'assigned' | 'in_progress' | 'waiting' | 'resolved';

type AssignmentDraft = {
  requestId: string;
  language: 'ar' | 'en';
  status: AssignmentStatus;
  assignedTo: string;
  notes: string;
};

type Responder = { userId: string; name: string };

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

type ApiAssignment = {
  request_id?: unknown;
  language?: unknown;
  status?: unknown;
  assigned_to?: unknown;
  notes?: unknown;
};

type ApiResponder = { userId?: unknown; name?: unknown };

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

const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  unassigned: 'غير موزع',
  assigned: 'موزع',
  in_progress: 'قيد المتابعة',
  waiting: 'بانتظار الزائر',
  resolved: 'مغلق',
};

function normalizeAssignment(value: ApiAssignment): AssignmentDraft | null {
  const requestId = typeof value.request_id === 'string' ? value.request_id : '';
  if (!requestId) return null;
  const status = typeof value.status === 'string' && Object.prototype.hasOwnProperty.call(ASSIGNMENT_STATUS_LABELS, value.status)
    ? value.status as AssignmentStatus
    : 'unassigned';
  return {
    requestId,
    language: value.language === 'en' ? 'en' : 'ar',
    status,
    assignedTo: typeof value.assigned_to === 'string' ? value.assigned_to : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
  };
}

export default function QuestionsClient() {
  const [status, setStatus] = useState<QuestionStatus>('pending');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, AssignmentDraft>>({});
  const [responders, setResponders] = useState<Responder[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [assignmentError, setAssignmentError] = useState('');
  const [savingAssignmentId, setSavingAssignmentId] = useState<string | null>(null);
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

  const loadAssignments = useCallback(async () => {
    setAssignmentLoading(true);
    setAssignmentError('');
    try {
      const response = await fetch('/api/admin/dawah-assignments', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({})) as {
        ok?: boolean;
        error?: string;
        assignments?: ApiAssignment[];
        responders?: ApiResponder[];
      };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر تحميل توزيع المتابعة.');
      const next: Record<string, AssignmentDraft> = {};
      for (const item of payload.assignments || []) {
        const normalized = normalizeAssignment(item);
        if (normalized) next[normalized.requestId] = normalized;
      }
      setAssignments(next);
      setResponders((payload.responders || [])
        .filter((item): item is { userId: string; name: string } => typeof item.userId === 'string' && typeof item.name === 'string')
        .map((item) => ({ userId: item.userId, name: item.name })));
    } catch (loadError) {
      console.error('[QuestionsClient] assignments load error:', loadError);
      setAssignmentError(loadError instanceof Error ? loadError.message : 'تعذر تحميل توزيع المتابعة.');
    } finally {
      setAssignmentLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

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

  function getAssignment(questionId: string): AssignmentDraft {
    return assignments[questionId] || {
      requestId: questionId,
      language: 'ar',
      status: 'unassigned',
      assignedTo: '',
      notes: '',
    };
  }

  function updateAssignment(questionId: string, patch: Partial<AssignmentDraft>) {
    setAssignments((current) => ({
      ...current,
      [questionId]: { ...getAssignment(questionId), ...patch },
    }));
  }

  async function saveAssignment(questionId: string) {
    const assignment = getAssignment(questionId);
    setSavingAssignmentId(questionId);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/dawah-assignments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; error?: string; assignment?: ApiAssignment };
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'تعذر حفظ توزيع المتابعة.');
      const normalized = payload.assignment ? normalizeAssignment(payload.assignment) : assignment;
      if (normalized) setAssignments((current) => ({ ...current, [questionId]: normalized }));
      setNotice('تم حفظ توزيع طلب المتابعة.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ توزيع المتابعة.');
    } finally {
      setSavingAssignmentId(null);
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
      {assignmentError ? <p className="rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm font-bold text-gold-900">{assignmentError}</p> : null}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-cream-100" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="admin-card border-dashed border-cream-300 p-10 text-center">
          <p className="text-lg font-black text-primary-950">لا توجد أسئلة في هذا القسم</p>
          <p className="mt-2 text-sm text-stone-500">عندما يرسل الزوار أسئلة جديدة ستظهر هنا مباشرة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="admin-card p-5 md:p-6">
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

              {!assignmentLoading && !assignmentError ? (
                <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/50 p-4 dark:border-night-700 dark:bg-night-800">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-primary-950 dark:text-white">توزيع متابعة الحوار</h3>
                    <span className="text-xs text-stone-500">لا يظهر هذا القسم للزائر</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-xs font-bold text-stone-600">
                      اللغة
                      <select value={getAssignment(question.id).language} onChange={(event) => updateAssignment(question.id, { language: event.target.value === 'en' ? 'en' : 'ar' })} className="input-islamic mt-1 w-full">
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-stone-600">
                      المسؤول
                      <select value={getAssignment(question.id).assignedTo} onChange={(event) => updateAssignment(question.id, { assignedTo: event.target.value, status: event.target.value ? 'assigned' : 'unassigned' })} className="input-islamic mt-1 w-full">
                        <option value="">غير موزع</option>
                        {responders.map((responder) => <option key={responder.userId} value={responder.userId}>{responder.name}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-bold text-stone-600">
                      الحالة
                      <select value={getAssignment(question.id).status} onChange={(event) => updateAssignment(question.id, { status: event.target.value as AssignmentStatus })} className="input-islamic mt-1 w-full">
                        {(Object.keys(ASSIGNMENT_STATUS_LABELS) as AssignmentStatus[]).map((value) => <option key={value} value={value}>{ASSIGNMENT_STATUS_LABELS[value]}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 text-xs font-bold text-stone-600">
                      ملاحظات الفريق
                      <textarea value={getAssignment(question.id).notes} onChange={(event) => updateAssignment(question.id, { notes: event.target.value.slice(0, 3000) })} rows={2} className="input-islamic mt-1 w-full resize-y" placeholder="خطوة المتابعة أو اللغة المطلوبة..." />
                    </label>
                    <button type="button" onClick={() => void saveAssignment(question.id)} disabled={savingAssignmentId === question.id} className="btn-primary shrink-0 disabled:cursor-wait disabled:opacity-60">
                      {savingAssignmentId === question.id ? 'جارٍ الحفظ...' : 'حفظ التوزيع'}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
