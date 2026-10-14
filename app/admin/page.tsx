// app/admin/page.tsx
export const dynamic = 'force-dynamic';

import AdminPanel from './AdminPanel';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';

export default function AdminPage() {
  return (
    <AdminDashboardShell>
      <AdminPanel />
    </AdminDashboardShell>
  );
}
