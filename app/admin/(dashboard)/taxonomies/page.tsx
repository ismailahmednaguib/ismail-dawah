import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'التصنيفات والوسوم | لوحة التحكم',
};

export default async function TaxonomiesPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!can(session.roles, 'taxonomy.manage')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-950">🏷️ التصنيفات والوسوم</h1>
        <p className="mt-2 text-sm text-stone-500">
          أنشئ التصنيفات المعتمدة واربطها بالمحتوى من صفحة التعديل.
        </p>
      </div>
      <TaxonomyManager />
    </div>
  );
}
