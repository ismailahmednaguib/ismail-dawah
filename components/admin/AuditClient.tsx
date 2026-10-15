// components/admin/AuditClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

interface AuditRow {
  id: number;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: '➕ إنشاء',
  update: '✏️ تعديل',
  delete: '🗑️ حذف',
  publish: '📢 نشر',
  approve: '✅ موافقة',
  reject: '❌ رفض',
  update_roles: '👥 تعديل أدوار',
  update_status: '🔄 تغيير حالة',
};

export default function AuditClient() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?page=${page}`, { credentials: 'include' });
      const json = await res.json();
      setLogs(json.data ?? []);
      setTotalPages(json.total_pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700">
      {loading ? (
        <div className="p-12 text-center text-stone-400">جارٍ التحميل...</div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-stone-400">لا توجد سجلات بعد</div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-gray-700">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg shrink-0">
                {ACTION_LABELS[log.action]?.split(' ')[0] ?? '📝'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-950 dark:text-white">
                  {ACTION_LABELS[log.action] ?? log.action}
                  <span className="text-stone-400 font-normal"> في </span>
                  <code className="text-xs bg-stone-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{log.table_name}</code>
                </p>
                <p className="text-xs text-stone-500 dark:text-gray-400 mt-1">
                  {new Date(log.created_at).toLocaleString('ar-EG')}
                  {log.record_id && <> • المعرف: <code>{log.record_id.slice(0, 8)}...</code></>}
                </p>
                {log.new_data && Object.keys(log.new_data).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-primary-700 dark:text-primary-400 cursor-pointer">
                      عرض التفاصيل
                    </summary>
                    <pre className="mt-1 text-xs bg-stone-50 dark:bg-gray-900 rounded p-2 overflow-x-auto text-stone-600 dark:text-gray-300">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الترقيم */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-stone-200 dark:border-gray-700 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-sm text-stone-600 dark:text-gray-300">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}