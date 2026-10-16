// app/admin/(dashboard)/quality/page.tsx
// جودة المحتوى: طابور مراجعة الترجمات + فحص آلي للحقول والمصادر.
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import QualityPanel from './quality-panel';

export const metadata: Metadata = {
  title: 'جودة المحتوى | لوحة التحكم',
};

export default async function QualityPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!can(session.roles, 'content.read')) redirect('/admin');

  return (
    <div className="space-y-6">
      <header className="card p-5">
        <h1 className="text-xl font-bold">✦ جودة المحتوى والمراجعة</h1>
        <p className="mt-1 text-sm opacity-80">
          طابور الترجمات الآلية التي تنتظر مراجعة بشرية، مع فحص آلي للحقول الفارغة والمتون
          القصيرة والنصوص الشرعية التي تحتاج مصدرًا موثّقًا.
        </p>
      </header>

      <QualityPanel />
    </div>
  );
}
