export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NewsletterSubscribersClient from '@/components/admin/NewsletterSubscribersClient';
import DawahJourneySubscribersClient from '@/components/admin/DawahJourneySubscribersClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = { title: 'مشتركو النشرة | لوحة التحكم' };

export default async function NewsletterPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'notifications.manage')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="مشتركو النشرة البريدية" description="راجع المشتركين وأوقف أو أعد تفعيل الاشتراك من مكان واحد." eyebrow="التواصل" />
      <NewsletterSubscribersClient />
      <div className="mt-8"><DawahJourneySubscribersClient /></div>
    </div>
  );
}
