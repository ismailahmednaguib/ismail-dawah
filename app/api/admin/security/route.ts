// app/api/admin/security/route.ts
// التحكم في حدود المعدّل من اللوحة (تُخزَّن في site_settings فتُطبَّق فورًا).
import { NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  RATE_LIMIT_DEFAULTS,
  RATE_LIMIT_SCOPES,
  RATE_LIMIT_SETTING_KEY,
  invalidateRateLimitConfigCache,
  normalizeRateLimitConfig,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCOPE_LABELS: Record<string, string> = {
  'admin-login': 'دخول لوحة التحكم',
  login: 'دخول المستخدمين',
  register: 'إنشاء حساب',
  questions: 'إرسال سؤال',
  newsletter: 'الاشتراك في النشرة',
  analytics: 'أحداث التحليلات',
  verify: 'روابط التحقق',
  upload: 'رفع الملفات',
};

type SharedProbe = 'ready' | 'missing' | 'unknown';

/** يتحقق هل جدول rate_limits/الدالة منفَّذان على قاعدة الإنتاج. */
async function probeSharedStore(): Promise<SharedProbe> {
  try {
    const { error } = await getSupabaseAdmin()
      .from('rate_limits')
      .select('key', { head: true, count: 'exact' })
      .limit(1);

    if (!error) return 'ready';
    if (/does not exist|schema cache/i.test(error.message)) return 'missing';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'audit.read')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية العرض' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', RATE_LIMIT_SETTING_KEY)
    .eq('lang', 'all')
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    scopes: RATE_LIMIT_SCOPES.map((scope) => ({
      scope,
      label: SCOPE_LABELS[scope] ?? scope,
    })),
    defaults: RATE_LIMIT_DEFAULTS,
    config: normalizeRateLimitConfig(data?.value ?? null),
    updatedAt: data?.updated_at ?? null,
    sharedStore: await probeSharedStore(),
    canEdit: can(session.roles, 'settings.manage'),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'settings.manage')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية التعديل' }, { status: 403 });
  }

  let payload: { config?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'جسم الطلب غير صالح' }, { status: 400 });
  }

  // التنقية تقبل القيم الصحيحة فقط وتتجاهل التالفة (لا تُسقط الإعداد كله)
  const config = normalizeRateLimitConfig(payload?.config);

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('site_settings').upsert(
    {
      key: RATE_LIMIT_SETTING_KEY,
      lang: 'all',
      value: config,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key,lang' }
  );

  if (error) {
    return NextResponse.json(
      { error: 'تعذّر حفظ الإعدادات', details: error.message },
      { status: 500 }
    );
  }

  invalidateRateLimitConfigCache();

  await supabase
    .from('audit_log')
    .insert({
      user_id: session.userId,
      action: 'update',
      table_name: 'site_settings',
      new_data: { key: RATE_LIMIT_SETTING_KEY, value: config },
    })
    .then(
      () => undefined,
      () => undefined
    );

  return NextResponse.json({ ok: true, config });
}
