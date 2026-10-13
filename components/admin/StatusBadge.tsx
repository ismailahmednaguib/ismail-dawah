// components/admin/StatusBadge.tsx
import type { ContentStatus } from '@/lib/types/content';

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; className: string }
> = {
  draft: { label: 'مسودة', className: 'bg-stone-100 text-stone-600' },
  in_review: { label: 'قيد المراجعة', className: 'bg-amber-100 text-amber-700' },
  published: { label: 'منشور', className: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'مؤرشف', className: 'bg-stone-200 text-stone-500' },
  rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}