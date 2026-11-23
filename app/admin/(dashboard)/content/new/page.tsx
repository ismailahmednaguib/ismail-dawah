import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import ContentForm from '@/components/admin/ContentForm';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import type { ContentType } from '@/lib/types/content';

export const metadata = { title: 'محتوى جديد | لوحة التحكم' };

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'content.create')) redirect('/admin');

  const { type } = await searchParams;
  const allowedTypes: ContentType[] = ['article', 'lesson', 'course', 'book', 'research', 'fatwa', 'khutbah', 'hadith', 'duaa', 'story', 'faq', 'event', 'audio', 'video', 'page', 'profile'];
  const initialType = allowedTypes.includes(type as ContentType) ? (type as ContentType) : 'article';

  return (
    <div>
      <AdminPageHeader title="إنشاء محتوى جديد" description="أدخل المادة ومعلوماتها الأساسية قبل إرسالها للمراجعة أو النشر." eyebrow="المحتوى" />
      <ContentForm initialType={initialType} />
    </div>
  );
}
