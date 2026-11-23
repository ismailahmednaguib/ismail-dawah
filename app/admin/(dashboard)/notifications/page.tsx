export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NotificationsClient from '@/components/admin/NotificationsClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'الإشعارات | لوحة التحكم',
};

export default async function NotificationsPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'notifications.manage')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="إرسال إشعار" description="أرسل تنبيهًا فوريًا للمشتركين وسجّل العملية في التدقيق." eyebrow="التواصل" />
      <NotificationsClient />
    </div>
  );
}
