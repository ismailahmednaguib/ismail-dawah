// التخطيط المشترك لا يحمي المسارات؛ الحماية موجودة في صفحات لوحة التحكم
// حتى تبقى /admin/login قابلة للوصول.
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
