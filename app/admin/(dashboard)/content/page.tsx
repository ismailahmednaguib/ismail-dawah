import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ContentListClient from '@/components/admin/ContentListClient';
import ContentImportPanel from '@/components/admin/ContentImportPanel';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata = { title: 'المحتوى | لوحة التحكم' };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'content.read')) redirect('/admin');

  const { type } = await searchParams;
  const initialType = typeof type === 'string' ? type : '';
  const canCreate = can(session.roles, 'content.create');

  return (
    <div>
      <AdminPageHeader
        title="إدارة المحتوى"
        description="أنشئ المواد، راجع حالتها، وحدد ما يظهر للزوار من مكان واحد."
        eyebrow="المحتوى"
        actions={
          <Link href="/admin/content/new" className="btn-primary">
            محتوى جديد
          </Link>
        }
      />
      {canCreate && <ContentImportPanel />}
      <ContentListClient key={initialType || 'all'} initialType={initialType} />
    </div>
  );
}
