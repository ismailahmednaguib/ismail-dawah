import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/admin/session';
import { getSiteSettings } from '@/lib/content';
import { readSettingText } from '@/lib/settings-text';
import { SITE_NAME } from '@/lib/site';
import { themeCssVariables } from '@/lib/theme-settings';

export default async function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) redirect('/ar/login');

  const settings = await getSiteSettings();
  const siteName = readSettingText(settings.ownerName, 'ar', SITE_NAME);

  return (
    <div
      dir="rtl"
      className="admin-shell flex min-h-screen flex-col lg:flex-row"
      style={themeCssVariables(settings.theme) as React.CSSProperties}
    >
      <AdminSidebar
        userName={session.fullName ?? session.email}
        roles={session.roles}
        siteName={siteName}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="admin-main min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8"
      >
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
