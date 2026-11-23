import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { getContentFull } from '@/lib/admin/content-service';
import ContentEditClient from '@/components/admin/ContentEditClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata = { title: 'تعديل المحتوى | لوحة التحكم' };

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  const { id } = await params;
  const content = await getContentFull(id);
  if (!content) redirect('/admin/content');

  return (
    <div>
      <AdminPageHeader title="تعديل المحتوى" description="راجع النصوص والترجمات والمراجع وحالة النشر قبل الحفظ." eyebrow="المحتوى" />
      <ContentEditClient
        content={content}
        canEdit={can(session.roles, 'content.update')}
        canReview={can(session.roles, 'review.approve')}
      />
    </div>
  );
}
