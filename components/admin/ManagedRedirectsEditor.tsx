'use client';

import { useMemo } from 'react';
import {
  normalizeManagedRedirects,
  type ManagedRedirect,
} from '@/lib/managed-redirects';

type Props = {
  value: unknown;
  onChange: (value: ManagedRedirect[]) => void;
};

export default function ManagedRedirectsEditor({ value, onChange }: Props) {
  const redirects = useMemo(() => normalizeManagedRedirects(value), [value]);

  const update = (index: number, patch: Partial<ManagedRedirect>) => {
    onChange(redirects.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4">
      {redirects.length === 0 ? (
        <p className="rounded-xl border border-cream-200 bg-cream-50 p-4 text-sm leading-7 text-stone-600">
          لا توجد تحويلات مُدارة. أضف رابطًا قديمًا ووجهته الجديدة عند تغيير أي مسار.
        </p>
      ) : null}

      {redirects.map((redirect, index) => (
        <div key={`${redirect.source}-${index}`} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-primary-800">الرابط القديم</span>
              <input
                value={redirect.source}
                onChange={(event) => update(index, { source: event.target.value })}
                className="input-islamic w-full"
                dir="ltr"
                placeholder="/ar/learn/lesson/old-slug"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-primary-800">الوجهة الجديدة</span>
              <input
                value={redirect.destination}
                onChange={(event) => update(index, { destination: event.target.value })}
                className="input-islamic w-full"
                dir="ltr"
                placeholder="/ar/learn/lesson/new-slug"
              />
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-primary-800">
                <input
                  type="checkbox"
                  checked={redirect.enabled}
                  onChange={(event) => update(index, { enabled: event.target.checked })}
                  className="h-4 w-4 accent-primary-700"
                />
                مفعّل
              </label>
              <button
                type="button"
                onClick={() => onChange(redirects.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
              >
                حذف
              </button>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-6 text-stone-500">
            تحويل 301 داخلي دائم. لا تُقبل الروابط الخارجية، ولا يمكن إنشاء حلقة تحويل.
          </p>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...redirects, { source: '', destination: '', statusCode: 301, enabled: true }])}
        className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-black text-primary-800 hover:bg-primary-100"
      >
        + إضافة تحويل 301
      </button>
    </div>
  );
}
