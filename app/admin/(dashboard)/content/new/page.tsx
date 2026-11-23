import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata = { title: 'محتوى جديد | لوحة التحكم' };

export default async function NewContentPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'content.create')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="إنشاء محتوى جديد" description="أدخل المادة ومعلوماتها الأساسية قبل إرسالها للمراجعة أو النشر." eyebrow="المحتوى" />
      <ContentForm />
    </div>
  );
}
