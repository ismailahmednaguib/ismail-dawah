// components/admin/ContentListClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ContentType, ContentStatus } from '@/lib/types/content';
import StatusBadge from '@/components/admin/StatusBadge';

const TYPE_LABELS: Record<ContentType, string> = {
  article: 'مقال',
  lesson: 'درس',
  course: 'دورة',
  course_lesson: 'درس دورة',
  book: 'كتاب',
  research: 'بحث',
  fatwa: 'فتوى',
  khutbah: 'خطبة',
  audio: 'صوت',
  video: 'فيديو',
  hadith: 'حديث',
  duaa: 'دعاء',
  story: 'قصة',
  faq: 'سؤال',
  event: 'فعالية',
  page: 'صفحة',
  profile: 'ترجمة عالِم',
};

interface ListItem {
  id: string;
  content_type: ContentType;
  status: ContentStatus;
  title: string | null;
  slug: string | null;
  updated_at: string;
  views: number;
}

export default function ContentListClient() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (search) qs.set('search', search);
      if (typeFilter) qs.set('type', typeFilter);

      const res = await fetch(`/api/admin/content?${qs}`);
      const json = await res.json();
      setItems(json.data ?? []);
      setTotalPages(json.total_pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
      {/* شريط الفلاتر */}
      <div className="p-4 border-b border-stone-200 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 ابحث بالعنوان..."
          className="flex-1 min-w-[200px] border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">كل الأنواع</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-stone-500 border-b border-stone-200">
              <th className="px-4 py-3 font-medium">العنوان</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">آخر تعديل</th>
              <th className="px-4 py-3 font-medium">مشاهدات</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  جارٍ التحميل...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  لا يوجد محتوى بعد. ابدأ بإنشاء أول محتوى! 📝
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-stone-100 hover:bg-stone-50"
                >
                  <td className="px-4 py-3 font-medium text-primary-950">
                    {item.title ?? '(بدون عنوان)'}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {TYPE_LABELS[item.content_type]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {new Date(item.updated_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{item.views}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/content/${item.id}`}
                      className="text-primary-700 hover:underline text-xs"
                    >
                      تعديل
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-stone-200 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
          >
            السابق
          </button>
          <span className="text-sm text-stone-600">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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