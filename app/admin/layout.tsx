// في ملف app/admin/layout.tsx أو app/admin/page.tsx
export const dynamic = 'force-dynamic';
// =====================================================
// التخطيط المحمي للوحة التحكم
// =====================================================
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/session';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // استثناء: صفحة تسجيل الدخول لا تحتاج حماية
  // (التحقق من المسار الحالي غير متاح هنا، لذا نحمي كل شيء
  //  ونترك /admin/login يملك تخطيطه الخاص بدون هذا الملف)

  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 flex">
      <AdminSidebar
        userName={session.fullName ?? session.email}
        roles={session.roles}
      />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}