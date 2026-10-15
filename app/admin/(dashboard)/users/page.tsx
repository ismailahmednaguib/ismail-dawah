// app/admin/(dashboard)/users/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/admin/UsersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة المستخدمين | لوحة التحكم',
};

export default async function UsersPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const canManage = session.roles.some(r => ['super_admin', 'admin'].includes(r));
  if (!canManage) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-950 dark:text-gold mb-2">
          👥 إدارة المستخدمين والأدوار
        </h1>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          تحكم في صلاحيات الوصول إلى لوحة التحكم
        </p>
      </div>
      <UsersClient session={session} />
    </div>
  );
}