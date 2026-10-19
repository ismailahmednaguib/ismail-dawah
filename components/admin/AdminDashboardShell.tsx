import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/admin/session';

export default async function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar
        userName={session.fullName ?? session.email}
        roles={session.roles}
      />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
