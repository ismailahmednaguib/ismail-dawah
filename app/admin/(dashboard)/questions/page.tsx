export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import QuestionsClient from '@/components/admin/QuestionsClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'أسئلة الزوار | لوحة التحكم',
};

export default async function QuestionsPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'questions.manage')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="أسئلة الزوار" description="راجع الأسئلة الواردة واكتب الإجابات من نفس لوحة التحكم." eyebrow="التواصل" />
      <QuestionsClient />
    </div>
  );
}
