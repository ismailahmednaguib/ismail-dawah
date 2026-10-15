// app/admin/(dashboard)/users/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/admin/UsersClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';

export const metadata: Metadata = {
  title: 'إدارة المستخدمين | لوحة التحكم',
};

export default async function UsersPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'users.manage')) redirect('/admin');

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
