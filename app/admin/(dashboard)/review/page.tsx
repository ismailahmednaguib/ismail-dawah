// app/admin/(dashboard)/review/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ReviewQueueClient from '@/components/admin/ReviewQueueClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';

export const metadata: Metadata = {
  title: 'المراجعة العلمية | لوحة التحكم',
};

export default async function ReviewPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'review.approve')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-950 dark:text-gold mb-2">
          🔍 طابور المراجعة العلمية
        </h1>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          المحتوى الحساس والشرعي يحتاج موافقة مراجع علمي قبل النشر
        </p>
      </div>
      <ReviewQueueClient session={session} />
    </div>
  );
}
