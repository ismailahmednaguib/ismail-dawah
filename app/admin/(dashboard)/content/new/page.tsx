import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';

export const metadata = { title: 'محتوى جديد | لوحة التحكم' };

export default async function NewContentPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-emerald-950 mb-6">
        إنشاء محتوى جديد
      </h1>
      <ContentForm />
    </div>
  );
}