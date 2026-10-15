export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NotificationsClient from '@/components/admin/NotificationsClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'الإشعارات | لوحة التحكم',
};

export default async function NotificationsPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'notifications.manage')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary-950">إرسال إشعار</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          أرسل تنبيهًا فوريًا للمشتركين في إشعارات الموقع وسجّل العملية في التدقيق.
        </p>
      </div>
      <NotificationsClient />
    </div>
  );
}
