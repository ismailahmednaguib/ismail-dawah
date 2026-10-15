import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';
import { can } from '@/lib/admin/permissions';

export const metadata = { title: 'محتوى جديد | لوحة التحكم' };

export default async function NewContentPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'content.create')) redirect('/admin');

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-950 mb-6">
        إنشاء محتوى جديد
      </h1>
      <ContentForm />
    </div>
  );
}
