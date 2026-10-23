'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  buildContentImportTemplate,
  CONTENT_IMPORT_FORMAT,
  CONTENT_IMPORT_VERSION,
} from '@/lib/content-import';

type Issue = {
  index: number;
  path: string;
  message: string;
};

type Report = {
  ok: boolean;
  total: number;
  valid: number;
  errors: Issue[];
  warnings: Issue[];
};

type ApplyResult = {
  ok?: boolean;
  report?: Report;
  created?: Array<{ index: number; id: string; translations: number }>;
  errors?: Issue[];
  message?: string;
};

function downloadTemplate() {
  const blob = new Blob(
    [JSON.stringify(buildContentImportTemplate(), null, 2)],
    { type: 'application/json;charset=utf-8' }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ismail-dawah-content-import-template.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ContentImportPanel() {
  const router = useRouter();
  const [documentValue, setDocumentValue] = useState<unknown>(null);
  const [fileName, setFileName] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [applyIssues, setApplyIssues] = useState<Issue[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  async function readFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setReport(null);
    setApplyIssues([]);
    setMessage('');
    setError('');

    try {
      setDocumentValue(JSON.parse(await file.text()));
    } catch {
      setDocumentValue(null);
      setError('تعذّر قراءة الملف. اختر ملف JSON صالحًا.');
    }
  }

  async function request(mode: 'preview' | 'apply') {
    if (!documentValue || working) return;
    setWorking(true);
    setMessage('');
    setApplyIssues([]);
    setError('');

    try {
      const response = await fetch('/api/admin/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, document: documentValue }),
      });
      const data = (await response.json()) as ApplyResult;

      if (data.report) setReport(data.report);
      if (mode === 'apply' && data.errors) setApplyIssues(data.errors);
      if (!response.ok && mode === 'preview') {
        throw new Error('فشل التحقق؛ راجع قائمة الأخطاء.');
      }
      if (!response.ok && mode === 'apply' && response.status !== 207) {
        throw new Error(data.message || 'لم يتم تطبيق الاستيراد.');
      }

      if (mode === 'apply') {
        setMessage(data.message || 'تم تنفيذ الاستيراد.');
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'خطأ غير متوقع.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-900/60 dark:bg-primary-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-primary-950 dark:text-primary-100">استيراد محتوى مضبوط</h2>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-stone-600 dark:text-stone-300">
            ارفع ملفًا بصيغة المنصة، عاين الأخطاء والروابط المكررة أولًا، ثم طبّقه كمسودات.
            لا يتيح الاستيراد النشر المباشر ولا يتجاوز المراجعة الشرعية.
          </p>
        </div>
        <button type="button" onClick={downloadTemplate} className="btn-outline text-xs">
          تنزيل القالب
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="btn-outline cursor-pointer text-sm">
          اختيار ملف JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => void readFile(event.target.files?.[0])}
          />
        </label>
        <span className="text-xs text-stone-600 dark:text-stone-300">
          {fileName || `الصيغة: ${CONTENT_IMPORT_FORMAT} v${CONTENT_IMPORT_VERSION}`}
        </span>
        <button
          type="button"
          onClick={() => void request('preview')}
          disabled={!documentValue || working}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {working ? 'جارٍ الفحص…' : 'فحص ومعاينة'}
        </button>
        <button
          type="button"
          onClick={() => void request('apply')}
          disabled={!report?.ok || working}
          className="rounded-lg border border-amber-600 px-3 py-2 text-sm font-bold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-200"
        >
          تطبيق كمسودات
        </button>
      </div>

      {report && (
        <div className="mt-4 space-y-3 text-xs leading-6" role="status">
          <p className={report.ok ? 'text-primary-800 dark:text-primary-200' : 'text-red-800 dark:text-red-200'}>
            {report.ok
              ? `الفحص ناجح: ${report.valid} مادة جاهزة للاستيراد.`
              : `الفحص يحتاج تصحيحًا: ${report.errors.length} خطأ.`}
          </p>
          {report.errors.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950/30 dark:text-red-200">
              {report.errors.slice(0, 20).map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}
          {report.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {report.warnings.slice(0, 20).map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && <p className="mt-3 rounded-lg bg-primary-100 p-3 text-xs text-primary-900 dark:bg-primary-900/30 dark:text-primary-100">{message}</p>}
      {applyIssues.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-xs leading-6 text-red-800 dark:bg-red-950/30 dark:text-red-200" role="alert">
          {applyIssues.slice(0, 20).map((issue, index) => (
            <li key={`${issue.path}-${index}`}>
              {issue.path}: {issue.message}
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
    </section>
  );
}
