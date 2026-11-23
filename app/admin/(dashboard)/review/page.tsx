// app/admin/(dashboard)/review/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ReviewQueueClient from '@/components/admin/ReviewQueueClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'المراجعة العلمية | لوحة التحكم',
};

export default async function ReviewPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'review.approve')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="طابور المراجعة العلمية" description="المحتوى الحساس والشرعي يحتاج موافقة مراجع علمي قبل النشر." eyebrow="المحتوى" />
      <ReviewQueueClient session={session} />
    </div>
  );
}
