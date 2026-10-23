// app/admin/(dashboard)/backup/page.tsx
// نسخة احتياطية / تصدير كامل لبيانات المنصة.
export const dynamic = 'force-dynamic';

import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { can } from '@/lib/admin/permissions';
import { BACKUP_CONTENT_TABLES, BACKUP_SETTINGS_TABLES } from '@/lib/admin/backup';
import type { Metadata } from 'next';
import BackupPanel from './backup-panel';

export const metadata: Metadata = {
  title: 'النسخ الاحتياطي | لوحة التحكم',
};

const CONTENT_TABLES = Object.keys(BACKUP_CONTENT_TABLES);
const SETTINGS_TABLES = Object.keys(BACKUP_SETTINGS_TABLES);

const LABELS: Record<string, string> = {
  content: 'عناصر المحتوى',
  content_translations: 'الترجمات',
  taxonomies: 'التصنيفات',
  content_terms: 'ربط المحتوى بالتصنيفات',
  content_references: 'المراجع الشرعية',
  content_media: 'الوسائط',
  content_revisions: 'سجل نسخ المحتوى',
  site_settings: 'إعدادات المنصة',
  newsletter_subscribers: 'مشتركو النشرة',
  dawah_journey_subscribers: 'مشتركو رحلة غير المسلمين',
  dawah_request_assignments: 'توزيع طلبات الحوار',
};

async function countRows(table: string): Promise<number | null> {
  const { count, error } = await getSupabaseAdmin()
    .from(table)
    .select('*', { count: 'exact', head: true });
  return error ? null : (count ?? 0);
}

export default async function BackupPage() {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'settings.manage')) redirect('/admin');

  const allTables = [...CONTENT_TABLES, ...SETTINGS_TABLES];
  const counts = await Promise.all(allTables.map((t) => countRows(t)));
  const rows = allTables.map((table, i) => ({ table, count: counts[i] }));

  const total = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-primary-950 dark:text-gold">
          💾 النسخ الاحتياطي والتصدير
        </h1>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          تنزيل نسخة كاملة من المحتوى والإعدادات بصيغة JSON — تُستخدم للنسخ الاحتياطي
          أو للترحيل بين البيئات.
        </p>
      </div>

      <div className="mb-6">
        <BackupPanel />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ table, count }) => (
          <div
            key={table}
            className="rounded-xl border border-stone-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-xs font-semibold text-stone-500 dark:text-gray-400">
              {LABELS[table] ?? table}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-950 dark:text-gold">
              {count === null ? '—' : count.toLocaleString('ar-EG')}
            </p>
            <p className="mt-1 text-[11px] text-stone-400" dir="ltr">
              {table}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-bold text-primary-950 dark:text-gold">
          تنزيل النسخة
        </h2>

        <p className="mb-4 text-sm text-stone-600 dark:text-gray-300">
          إجمالي الصفوف القابلة للتصدير:{' '}
          <span className="font-bold">{total.toLocaleString('ar-EG')}</span> صفًا.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="/api/admin/export?scope=all"
            download
            className="rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800"
          >
            ⬇ نسخة كاملة (محتوى + إعدادات)
          </a>
          <a
            href="/api/admin/export?scope=content"
            download
            className="rounded-xl border border-primary-300 px-5 py-2.5 text-sm font-bold text-primary-800 transition hover:bg-primary-50 dark:border-gray-600 dark:text-primary-100 dark:hover:bg-gray-700"
          >
            ⬇ المحتوى والتصنيفات فقط
          </a>
          <a
            href="/api/admin/export?scope=settings"
            download
            className="rounded-xl border border-primary-300 px-5 py-2.5 text-sm font-bold text-primary-800 transition hover:bg-primary-50 dark:border-gray-600 dark:text-primary-100 dark:hover:bg-gray-700"
          >
            ⬇ الإعدادات فقط
          </a>
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          التصدير للقراءة فقط ولا يعدّل أي بيانات. تُحفظ النسخة على جهازك، ولمنع
          تسريبها لا تشاركها مع غير المسؤولين.
        </p>
      </div>
    </div>
  );
}
