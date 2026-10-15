import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import { getContentFull } from '@/lib/admin/content-service';
import ContentEditClient from '@/components/admin/ContentEditClient';

export const metadata = { title: 'تعديل المحتوى | لوحة التحكم' };

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const content = await getContentFull(id);
  if (!content) redirect('/admin/content');

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-950 mb-6">
        تعديل المحتوى
      </h1>
      <ContentEditClient content={content} />
    </div>
  );
}
