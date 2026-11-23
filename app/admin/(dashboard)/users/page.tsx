// app/admin/(dashboard)/users/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/admin/UsersClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'إدارة المستخدمين | لوحة التحكم',
};

export default async function UsersPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'users.manage')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="إدارة المستخدمين والأدوار" description="تحكم في صلاحيات الوصول إلى لوحة التحكم." eyebrow="الإدارة" />
      <UsersClient session={session} />
    </div>
  );
}
