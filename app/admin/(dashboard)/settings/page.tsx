import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SiteSettingsClient from '@/components/admin/SiteSettingsClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'إعدادات المنصة | لوحة التحكم',
};

export default async function SettingsPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'settings.manage')) redirect('/admin');

  return <SiteSettingsClient />;
}
