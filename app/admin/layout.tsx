// التخطيط المشترك لا يحمي المسارات؛ الحماية موجودة في صفحات لوحة التحكم.
// مسار /admin/login يحوّل إلى صفحة الدخول الموحدة.
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
