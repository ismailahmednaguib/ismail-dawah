// app/api/admin/backup/route.ts
// إعداد النسخ الاحتياطي اليومي + حالة الحاوية وآخر النسخ.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import {
  listBackupFiles,
  probeBackupStorage,
  readBackupConfig,
  saveBackupConfig,
} from '@/lib/admin/backup';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { BACKUP_SETTING_KEY } from '@/lib/backup-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authorize() {
  const session = await getAdminSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }),
    };
  }

  if (!can(session.roles, 'settings.manage')) {
    return {
      session: null,
      response: NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 }),
    };
  }

  return { session, response: null };
}

export async function GET() {
  const auth = await authorize();
  if (auth.response) return auth.response;

  const [config, listing, storage] = await Promise.all([
    readBackupConfig(),
    listBackupFiles(),
    probeBackupStorage(),
  ]);

  const latest = listing.files[0] ?? null;

  return NextResponse.json({
    ok: true,
    config,
    bucket: storage.bucket,
    storageReady: storage.ready,
    storageError: storage.error ?? null,
    files: listing.files.slice(0, 10),
    latest,
    canEdit: true,
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (auth.response) return auth.response;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'جسم الطلب غير صالح' }, { status: 400 });
  }

  const config = body && typeof body === 'object' && 'config' in body
    ? (body as { config?: unknown }).config
    : body;

  const result = await saveBackupConfig(config);

  if (!result.ok) {
    return NextResponse.json(
      { error: 'تعذّر حفظ إعداد النسخ الاحتياطي.', details: result.error },
      { status: 500 }
    );
  }

  await getSupabaseAdmin()
    .from('audit_log')
    .insert({
      user_id: auth.session.userId,
      action: 'update',
      table_name: 'site_settings',
      new_data: { key: BACKUP_SETTING_KEY, value: result.config },
    })
    .then(
      () => undefined,
      () => undefined
    );

  return NextResponse.json({ ok: true, config: result.config });
}
