import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import TaxonomyManager from '@/components/admin/TaxonomyManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'التصنيفات والوسوم | لوحة التحكم',
};

export default async function TaxonomiesPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'taxonomy.manage')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="التصنيفات والوسوم" description="أنشئ التصنيفات المعتمدة واربطها بالمحتوى من صفحة التعديل." eyebrow="المحتوى" />
      <TaxonomyManager />
    </div>
  );
}
