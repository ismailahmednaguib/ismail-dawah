// app/admin/(dashboard)/translations/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import TranslationsClient from '@/components/admin/TranslationsClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';

export const metadata: Metadata = {
  title: 'إدارة الترجمات | لوحة التحكم',
};

export default async function TranslationsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'content.read')) redirect('/admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-950 dark:text-gold mb-2">
          ◈ إدارة الترجمات
        </h1>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          ترجم المحتوى إلى لغات متعددة وتتبع حالة كل ترجمة
        </p>
      </div>
      <TranslationsClient session={session} />
    </div>
  );
}
