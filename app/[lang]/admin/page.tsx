import { redirect } from 'next/navigation';

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * توافق مع حزمة admin-kit التي تستخدم مسارًا محليًا للوحة التحكم.
 * نظام الإدارة الفعلي في المشروع مركزي تحت /admin ويحافظ على جلسة وصلاحيات
 * مخصصة؛ لذلك نعيد التوجيه بدل إنشاء لوحة ثانية بنظام مصادقة مختلف.
 */
export default async function LocalizedAdminEntry({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  redirect('/admin');
}
