// components/admin/ReviewQueueClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AdminSession } from '@/lib/admin/session';
import type { IconComponent } from '@/lib/icons';
import {
  AlertIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DuaHandsIcon,
  FileTextIcon,
  MosqueIcon,
  RefreshIcon,
  ShieldIcon,
} from '@/lib/icons';

interface ReviewItem {
  id: string;
  content_id: string;
  submitted_by: string | null;
  assigned_to: string | null;
  status: 'pending' | 'approved' | 'changes_requested';
  scholar_notes: string | null;
  created_at: string;
  content_title?: string;
  content_type?: string;
  is_sensitive?: boolean;
  needs_scholar_review?: boolean;
}

const TYPE_LABELS: Record<string, { label: string; icon: IconComponent }> = {
  article: { label: 'مقال', icon: FileTextIcon },
  lesson: { label: 'درس', icon: BookOpenIcon },
  book: { label: 'كتاب', icon: BookOpenIcon },
  fatwa: { label: 'فتوى', icon: ShieldIcon },
  khutbah: { label: 'خطبة', icon: MosqueIcon },
  hadith: { label: 'حديث', icon: BookOpenIcon },
  duaa: { label: 'دعاء', icon: DuaHandsIcon },
  research: { label: 'بحث', icon: FileTextIcon },
};

export default function ReviewQueueClient({ session }: { session: AdminSession }) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notesDialog, setNotesDialog] = useState<{
    show: boolean;
    itemId: string;
    action: 'approve' | 'reject';
  }>({ show: false, itemId: '', action: 'approve' });
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === 'pending' ? '?status=pending' : '';
      const res = await fetch(`/api/admin/review${qs}`, { credentials: 'include' });
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (itemId: string, contentId: string, action: 'approve' | 'reject', scholarNotes: string) => {
    setActionLoading(itemId);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, content_id: contentId, action, notes: scholarNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setNotesDialog({ show: false, itemId: '', action: 'approve' });
      setNotes('');
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const canReview = session.roles.some(r => ['super_admin', 'admin', 'scholar_reviewer'].includes(r));

  return (
    <div className="space-y-4">
      {/* الفلاتر */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'pending'
              ? 'bg-amber-500 text-white'
              : 'bg-white dark:bg-gray-800 text-stone-600 dark:text-gray-300 border border-stone-200 dark:border-gray-700'
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><ClockIcon size={15} aria-hidden="true" /> في الانتظار</span>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-primary-700 text-white'
              : 'bg-white dark:bg-gray-800 text-stone-600 dark:text-gray-300 border border-stone-200 dark:border-gray-700'
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><FileTextIcon size={15} aria-hidden="true" /> الكل</span>
        </button>
      </div>

      {/* القائمة */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">جارٍ التحميل...</div>
      ) : items.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <CheckCircleIcon className="mx-auto mb-3 text-primary-600" size={38} aria-hidden="true" />
          <p className="text-stone-500 dark:text-gray-400">لا يوجد محتوى في طابور المراجعة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`admin-card border-2 p-5 ${
                item.is_sensitive
                  ? 'border-red-200 dark:border-red-900'
                  : 'border-stone-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {item.is_sensitive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        <span className="inline-flex items-center gap-1"><AlertIcon size={13} aria-hidden="true" /> حساس</span>
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : item.status === 'approved'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {item.status === 'pending' ? <ClockIcon size={13} aria-hidden="true" /> : item.status === 'approved' ? <CheckCircleIcon size={13} aria-hidden="true" /> : <RefreshIcon size={13} aria-hidden="true" />}
                        {item.status === 'pending' ? 'في الانتظار' : item.status === 'approved' ? 'تمت الموافقة' : 'يحتاج تعديلات'}
                      </span>
                    </span>
                  </div>
                  <h3 className="font-bold text-primary-950 dark:text-white">
                    {item.content_title ?? '(بدون عنوان)'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-gray-400 mt-1">
                    النوع:{' '}
                    {TYPE_LABELS[item.content_type ?? ''] ? (() => {
                      const TypeIcon = TYPE_LABELS[item.content_type ?? ''].icon;
                      return <span className="inline-flex items-center gap-1"><TypeIcon size={13} aria-hidden="true" />{TYPE_LABELS[item.content_type ?? ''].label}</span>;
                    })() : item.content_type}
                    {' • '}
                    قُدِّم: {new Date(item.created_at).toLocaleDateString('ar-EG')}
                  </p>
                  {item.scholar_notes && (
                    <p className="text-sm text-stone-600 dark:text-gray-300 mt-2 bg-stone-50 dark:bg-gray-700 rounded p-2">
                      <span className="inline-flex items-start gap-1"><FileTextIcon className="mt-0.5 shrink-0" size={14} aria-hidden="true" /> {item.scholar_notes}</span>
                    </p>
                  )}
                </div>

                {canReview && item.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotesDialog({ show: true, itemId: item.id, action: 'approve' })}
                      disabled={actionLoading === item.id}
                      className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50"
                    >
                      <span className="inline-flex items-center gap-1.5"><CheckCircleIcon size={15} aria-hidden="true" /> موافقة</span>
                    </button>
                    <button
                      onClick={() => setNotesDialog({ show: true, itemId: item.id, action: 'reject' })}
                      disabled={actionLoading === item.id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                    >
                      <span className="inline-flex items-center gap-1.5"><AlertIcon size={15} aria-hidden="true" /> طلب تعديلات</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة الملاحظات */}
      {notesDialog.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-primary-950 dark:text-gold mb-3">
              <span className="inline-flex items-center gap-1.5">
                {notesDialog.action === 'approve' ? <CheckCircleIcon size={18} aria-hidden="true" /> : <AlertIcon size={18} aria-hidden="true" />}
                {notesDialog.action === 'approve' ? 'الموافقة على المحتوى' : 'طلب تعديلات'}
              </span>
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={notesDialog.action === 'approve' ? 'ملاحظات المراجع (اختياري)...' : 'اشرح التعديلات المطلوبة...'}
              className="w-full border border-stone-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-stone-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => { setNotesDialog({ show: false, itemId: '', action: 'approve' }); setNotes(''); }}
                className="px-4 py-2 border border-stone-300 dark:border-gray-600 rounded-lg text-sm text-stone-600 dark:text-gray-300"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const item = items.find(i => i.id === notesDialog.itemId);
                  if (item) doAction(item.id, item.content_id, notesDialog.action, notes);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  notesDialog.action === 'approve' ? 'bg-primary-700 hover:bg-primary-800' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
