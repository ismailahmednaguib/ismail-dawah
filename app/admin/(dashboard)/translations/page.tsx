// app/admin/(dashboard)/translations/page.tsx
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import TranslationsClient from '@/components/admin/TranslationsClient';
import type { Metadata } from 'next';
import { can } from '@/lib/admin/permissions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = {
  title: 'إدارة الترجمات | لوحة التحكم',
};

export default async function TranslationsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');

  if (!can(session.roles, 'content.read')) redirect('/admin');

  return (
    <div>
      <AdminPageHeader title="إدارة الترجمات" description="ترجم المحتوى إلى لغات متعددة وتتبع حالة كل ترجمة." eyebrow="المحتوى" />
      <TranslationsClient session={session} />
    </div>
  );
}
