export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import NewMuslimJourneySubscribersClient from '@/components/admin/NewMuslimJourneySubscribersClient';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export const metadata: Metadata = { title: 'رحلة المسلم الجديد | لوحة التحكم' };

export default async function NewMuslimJourneyPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'notifications.manage')) redirect('/admin');
  return <div><AdminPageHeader title="رحلة المسلم الجديد البريدية" description="إدارة المشتركين في الرحلة الاختيارية لأول ٣٠ يومًا." eyebrow="التواصل" /><NewMuslimJourneySubscribersClient /></div>;
}
