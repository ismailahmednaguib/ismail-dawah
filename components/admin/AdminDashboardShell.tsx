import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/admin/session';

export default async function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) redirect('/admin/login');

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 flex">
      <AdminSidebar
        userName={session.fullName ?? session.email}
        roles={session.roles}
      />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
