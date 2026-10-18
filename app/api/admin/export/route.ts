// ============================================================================
// /api/admin/export
// نسخة احتياطية كاملة (JSON) لمحتوى المنصة وإعداداتها.
//
// GET → تنزيل ملف JSON يحتوي كل الجداول الأساسية.
//       ?scope=content   المحتوى والتصنيفات فقط
//       ?scope=settings  الإعدادات فقط
//       (بلا معامل = الكل)
//
// الصلاحية: مدير أو مدير أعلى فقط.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasAnyRole } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// الجداول المشمولة في النسخة، مع الأعمدة المطلوبة
const CONTENT_TABLES: Record<string, string> = {
  content: '*',
  content_translations: '*',
  taxonomies: '*',
  content_terms: '*',
  content_references: '*',
  content_media: '*',
};

const SETTINGS_TABLES: Record<string, string> = {
  site_settings: '*',
  dawah_journey_subscribers: '*',
  dawah_request_assignments: '*',
};

const PAGE_SIZE = 1000;
const MAX_ROWS = 50_000;

/**
 * يجلب كل صفوف جدول مع تخطّي حدّ PostgREST (1000 صف في الطلب الواحد).
 */
async function fetchAll(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  table: string,
  select: string
): Promise<unknown[]> {
  const rows: unknown[] = [];

  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`${table}: ${error.message}`);

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();

  if (!session || !hasAnyRole(session, ['super_admin', 'admin'])) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const scope = new URL(req.url).searchParams.get('scope') ?? 'all';

  const tables: Record<string, string> = {};
  if (scope === 'all' || scope === 'content') Object.assign(tables, CONTENT_TABLES);
  if (scope === 'all' || scope === 'settings') Object.assign(tables, SETTINGS_TABLES);

  if (Object.keys(tables).length === 0) {
    return NextResponse.json({ error: 'نطاق غير معروف' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const dump: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};

    for (const [table, select] of Object.entries(tables)) {
      const rows = await fetchAll(supabase, table, select);
      dump[table] = rows;
      counts[table] = rows.length;
    }

    const payload = {
      format: 'ismail-dawah-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      exportedBy: session.userId,
      scope,
      counts,
      tables: dump,
    };

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `ismail-dawah-${scope}-${stamp}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
