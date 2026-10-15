// app/admin/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import AdminPanel from './AdminPanel';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');

  return (
    <AdminDashboardShell>
      <AdminPanel
        canManageSettings={can(session.roles, 'settings.manage')}
        canManageNotifications={can(session.roles, 'notifications.manage')}
      />
    </AdminDashboardShell>
  );
}
