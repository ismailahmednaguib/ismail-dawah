// app/admin/(dashboard)/quality/page.tsx
// جودة المحتوى: طابور مراجعة الترجمات + فحص آلي للحقول والمصادر.
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import QualityPanel from './quality-panel';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'جودة المحتوى | لوحة التحكم',
};

export default async function QualityPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!can(session.roles, 'content.read')) redirect('/admin');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="جودة المحتوى والمراجعة"
        description="طابور الترجمات الآلية التي تنتظر مراجعة بشرية، مع فحص آلي للحقول الفارغة والمتون القصيرة والمصادر."
        eyebrow="المحتوى"
      />

      <QualityPanel />
    </div>
  );
}
