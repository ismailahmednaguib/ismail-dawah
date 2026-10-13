import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ContentListClient from '@/components/admin/ContentListClient';

export const metadata = { title: 'المحتوى | لوحة التحكم' };

export default async function ContentPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-emerald-950">إدارة المحتوى</h1>
        <a
          href="/admin/content/new"
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + محتوى جديد
        </a>
      </div>
      <ContentListClient />
    </div>
  );
}