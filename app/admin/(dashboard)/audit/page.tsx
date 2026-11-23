// app/admin/(dashboard)/audit/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import AuditClient from '@/components/admin/AuditClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'سجل التدقيق | لوحة التحكم',
};

export default async function AuditPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'audit.read')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="سجل التدقيق" description="تتبع كل التعديلات على المحتوى والإعدادات" eyebrow="الإدارة" />
      <AuditClient />
    </div>
  );
}
