"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AppRole } from '@/lib/types/content';
import { can, highestRole } from '@/lib/admin/permissions';

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'مدير عام',
  admin: 'مدير',
  editor: 'محرر',
  scholar_reviewer: 'مراجع علمي',
  translator: 'مترجم',
  contributor: 'مساهم',
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  show: boolean;
}

export default function AdminSidebar({
  userName,
  roles,
}: {
  userName: string;
  roles: AppRole[];
}) {
  const router = useRouter();
  const items: NavItem[] = [
    { href: '/admin', label: 'لوحة المعلومات', icon: '📊', show: true },
    { href: '/admin/content', label: 'المحتوى', icon: '📝', show: can(roles, 'content.read') },
    { href: '/admin/translations', label: 'الترجمات', icon: '🌐', show: can(roles, 'content.read') },
    { href: '/admin/review', label: 'المراجعة العلمية', icon: '🔍', show: can(roles, 'review.approve') },
    { href: '/admin/users', label: 'المستخدمون', icon: '👥', show: can(roles, 'users.manage') },
    { href: '/admin/audit', label: 'سجل التدقيق', icon: '📜', show: can(roles, 'audit.read') },
  ];

  const role = highestRole(roles);

  return (
    <aside className="w-64 bg-primary-950 text-white flex flex-col shrink-0">
      {/* الرأس */}
      <div className="p-5 border-b border-primary-800">
        <h1 className="font-bold text-lg text-amber-300">
          أكاديمية إسماعيل
        </h1>
        <p className="text-xs text-primary-200 mt-1">لوحة التحكم</p>
      </div>

      {/* معلومات المستخدم */}
      <div className="px-5 py-4 border-b border-primary-800">
        <p className="text-sm font-medium">{userName}</p>
        <span className="inline-block mt-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
          {ROLE_LABELS[role]}
        </span>
      </div>

      {/* القائمة */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items
          .filter((i) => i.show)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:bg-primary-800 transition-colors text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
      </nav>

      {/* خروج */}
      <div className="p-3 border-t border-primary-800">
        <button
          onClick={() => {
            void fetch('/api/admin/logout', { method: 'POST' }).finally(() => {
              router.push('/admin/login');
            });
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:bg-red-900/50 transition-colors text-sm"
        >
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
