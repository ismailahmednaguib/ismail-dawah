export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NewsletterSubscribersClient from '@/components/admin/NewsletterSubscribersClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'مشتركو النشرة | لوحة التحكم' };

export default async function NewsletterPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'notifications.manage')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary-950">مشتركو النشرة البريدية</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">راجع المشتركين وأوقف أو أعد تفعيل الاشتراك من مكان واحد.</p>
      </div>
      <NewsletterSubscribersClient />
    </div>
  );
}
