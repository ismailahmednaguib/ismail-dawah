export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import QuestionsClient from '@/components/admin/QuestionsClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'أسئلة الزوار | لوحة التحكم',
};

export default async function QuestionsPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'questions.manage')) redirect('/admin');

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black text-primary-950">أسئلة الزوار</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            راجع الأسئلة الواردة واكتب الإجابات من نفس لوحة التحكم.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
          صندوق المتابعة
        </span>
      </div>
      <QuestionsClient />
    </div>
  );
}
