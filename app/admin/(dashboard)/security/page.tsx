// app/admin/(dashboard)/security/page.tsx
// مركز الأمان: ترويسات الحماية + حدود المعدّل المشتركة + تدقيق RLS والمفاتيح.
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import SecurityPanel from './security-panel';

export const metadata: Metadata = {
  title: 'الأمان | لوحة التحكم',
};

const HEADERS_TABLE: { key: string; value: string; why: string }[] = [
  { key: 'Content-Security-Policy', value: "default-src 'self' …", why: 'يمنع حقن سكربتات أو إطارات خارجية' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000', why: 'يفرض HTTPS على كل الزيارات' },
  { key: 'X-Frame-Options', value: 'DENY', why: 'يمنع تأطير الموقع (Clickjacking)' },
  { key: 'X-Content-Type-Options', value: 'nosniff', why: 'يمنع تفسير الملفات بنوع مخالف' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin', why: 'لا تسرّب الروابط الكاملة للجهات الأخرى' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()', why: 'يعطّل الأذونات غير المستخدمة' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin', why: 'يعزل نافذة الموقع عن غيرها' },
];

const HARDENING: { item: string; state: string; detail: string }[] = [
  {
    item: 'أخطاء البناء',
    state: 'مفعَّل',
    detail: 'أخطاء TypeScript وESLint تُفشل البناء (next.config.ts) — لا تُنشر نسخة معطوبة صامتة.',
  },
  {
    item: 'حدّ المعدّل',
    state: 'مشترك',
    detail: 'دالة consume_rate_limit الذرّية في Postgres، مع احتياطي في الذاكرة لا يُعطّل الخدمة.',
  },
  {
    item: 'صلاحيات الجداول (RLS)',
    state: 'مفحوص آليًّا',
    detail: 'يُفحص بالمفتاح العام نفسه الذي يملكه أي زائر — النتيجة أدناه مباشرة.',
  },
  {
    item: 'تسريب المفاتيح',
    state: 'مفحوص',
    detail: 'npm run qa:secrets يفحص الكود والمكوّنات العميلية بحثًا عن مفتاح الخدمة.',
  },
  {
    item: 'مصادقة اللوحة',
    state: 'محمي',
    detail: 'كل مسار إداري يتحقق من الجلسة والدور قبل التنفيذ (getAdminSession + الصلاحيات).',
  },
  {
    item: 'سجل التدقيق',
    state: 'مفعَّل',
    detail: 'كل تعديل حسّاس (مراجعة · إعدادات · محتوى) يُسجَّل في audit_log بمعرّف المستخدم.',
  },
];

/** جداول يجب ألّا يقرأها الزائر المجهول. */
const PRIVATE_TABLES = [
  'admin_users',
  'admin_login_attempts',
  'user_roles',
  'users',
  'audit_log',
  'activity_log',
  'page_views',
  'analytics_events',
  'site_settings',
  'review_queue',
  'newsletter_subscribers',
  'dawah_journey_subscribers',
  'dawah_request_assignments',
  'learner_content_progress',
  'user_favorites',
  'user_questions',
  'media_library',
  'rate_limits',
  'notifications',
  'push_subscriptions',
  'bookmarks',
  'user_downloads',
] as const;

type RlsState = 'leaking' | 'open' | 'blocked' | 'missing' | 'error';
type RlsRow = { table: string; state: RlsState; rows: number };

/**
 * فحص حقيقي من الخادم بالمفتاح العام: هل يستطيع زائر مجهول قراءة الجداول الخاصة؟
 * هذا أقوى من مراجعة السياسات نظريًّا — لأنه يقيس النتيجة الفعلية.
 */
async function probeRls(): Promise<RlsRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return [];

  return Promise.all(
    PRIVATE_TABLES.map(async (table): Promise<RlsRow> => {
      try {
        const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
          headers: {
            apikey: anon,
            Authorization: `Bearer ${anon}`,
            Prefer: 'count=exact',
          },
          cache: 'no-store',
        });

        if (res.status === 404) return { table, state: 'missing', rows: 0 };
        if (res.status !== 200 && res.status !== 206) return { table, state: 'blocked', rows: 0 };

        const total = Number((res.headers.get('content-range') || '').split('/')[1] ?? '0');
        return { table, state: total > 0 ? 'leaking' : 'open', rows: total };
      } catch {
        return { table, state: 'error', rows: 0 };
      }
    })
  );
}

const RLS_LABELS: Record<RlsState, string> = {
  leaking: '✖ مكشوف وبه بيانات',
  open: '⚠ قابل للقراءة (فارغ الآن)',
  blocked: '✔ محجوب',
  missing: '✔ غير موجود',
  error: '؟ تعذّر الفحص',
};

export default async function SecurityPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!can(session.roles, 'audit.read')) redirect('/admin');

  const rls = await probeRls();
  const leaking = rls.filter((row) => row.state === 'leaking');
  const open = rls.filter((row) => row.state === 'open');

  return (
    <div className="space-y-6">
      <header className="card p-5">
        <h1 className="text-xl font-bold">🛡️ مركز الأمان</h1>
        <p className="mt-1 text-sm opacity-80">
          ترويسات الحماية المُطبَّقة على الموقع كله، وحدود المعدّل التي تتحكم بها من هنا مباشرةً.
        </p>
      </header>

      <section className="card overflow-hidden">
        <h2 className="border-b border-black/5 p-4 text-base font-bold dark:border-white/10">
          ترويسات الحماية المُطبَّقة
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-xs dark:bg-white/5">
              <tr>
                <th className="p-3 text-right">الترويسة</th>
                <th className="p-3 text-right">القيمة</th>
                <th className="p-3 text-right">الفائدة</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {HEADERS_TABLE.map((row) => (
                <tr key={row.key} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-3 font-mono text-xs" dir="ltr">{row.key}</td>
                  <td className="p-3 font-mono text-xs opacity-70" dir="ltr">{row.value}</td>
                  <td className="p-3">{row.why}</td>
                  <td className="p-3 text-primary-700 dark:text-primary-400">✔ مفعَّل</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SecurityPanel />

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold">صلاحيات الجداول — فحص مباشر</h2>
            <p className="text-xs opacity-70">
              يُفحص بالمفتاح العام نفسه الذي يملكه أي زائر. المصدر:
              <code dir="ltr"> npm run qa:rls</code>
            </p>
          </div>
          {(leaking.length > 0 || open.length > 0) && (
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-300">
              {leaking.length} مكشوف ببيانات · {open.length} قابل للقراءة
            </span>
          )}
          {leaking.length === 0 && open.length === 0 && (
            <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-700 dark:text-primary-300">
              ✔ لا جدول خاص مكشوف
            </span>
          )}
        </div>

        {(leaking.length > 0 || open.length > 0) && (
          <div className="border-b border-red-500/20 bg-red-500/10 p-4 text-sm text-red-800 dark:text-red-200">
            <p className="font-bold">إجراء مطلوب فورًا</p>
            <p className="mt-1">
              نفّذ <code dir="ltr">supabase/migrations/20261017_rls_hardening.sql</code> في SQL
              Editor بلوحة Supabase، ثم أعد تحميل هذه الصفحة. حتى ذلك الحين، أي زائر يملك مفتاح
              الموقع العام يستطيع قراءة هذه الجداول.
            </p>
          </div>
        )}

        <ul className="grid gap-x-6 text-sm sm:grid-cols-2">
          {rls.map((row) => (
            <li
              key={row.table}
              className="flex items-center justify-between gap-3 border-t border-black/5 px-4 py-2 dark:border-white/10"
            >
              <span className="font-mono text-xs" dir="ltr">
                {row.table}
              </span>
              <span
                className={
                  row.state === 'leaking'
                    ? 'text-xs font-bold text-red-700 dark:text-red-400'
                    : row.state === 'open'
                      ? 'text-xs text-amber-600 dark:text-amber-400'
                      : 'text-xs opacity-70'
                }
              >
                {RLS_LABELS[row.state]}
                {row.state === 'leaking' ? ` (${row.rows})` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-black/5 p-4 text-base font-bold dark:border-white/10">
          تحصينات قائمة
        </h2>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {HARDENING.map((row) => (
            <li key={row.item} className="flex flex-wrap items-start gap-3 p-4">
              <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-bold text-primary-700 dark:text-primary-300">
                {row.state}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{row.item}</p>
                <p className="text-xs opacity-75">{row.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 text-sm">
        <h2 className="text-base font-bold">تدقيق دوري (من الطرفية)</h2>
        <p className="mt-1 opacity-80">
          هذه الأوامر تُشغَّل عند كل إصدار؛ نتائجها مرجع موثّق في <code dir="ltr">AUDIT.md</code>.
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs" dir="ltr">
          <li><code>npm run qa:secrets</code> — فحص تسرّب المفاتيح</li>
          <li><code>npm run qa:rls</code> — صلاحيات الجداول بالمفتاح العام</li>
          <li><code>npm run qa:citations</code> — فحص المصادر الشرعية</li>
          <li><code>npm run verify</code> — الأنواع + اختبارات الوحدة + البناء</li>
          <li><code>npm audit --omit=dev</code> — ثغرات الاعتماديات</li>
        </ul>
      </section>
    </div>
  );
}
