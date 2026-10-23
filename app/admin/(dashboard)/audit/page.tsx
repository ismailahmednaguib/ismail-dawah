// app/admin/(dashboard)/audit/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import AuditClient from '@/components/admin/AuditClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';
import { renderDesignIcon } from '@/components/ui';

export const metadata: Metadata = {
  title: 'سجل التدقيق | لوحة التحكم',
};

export default async function AuditPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'audit.read')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-950 dark:text-gold mb-2">
          <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📜", 22)}</span>سجل التدقيق
        </h1>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          تتبع كل التعديلات على المحتوى والإعدادات
        </p>
      </div>
      <AuditClient />
    </div>
  );
}
