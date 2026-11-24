import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { getDawahInquiryRetentionCutoff } from '@/lib/dawah-retention';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return NextResponse.json({ ok: false, error: 'غير مصرح' }, { status: 401 });

  const cutoff = getDawahInquiryRetentionCutoff();
  const { data, error } = await getSupabaseAdmin()
    .from('dawah_inquiries')
    .delete()
    .lt('created_at', cutoff.toISOString())
    .select('id');

  if (error) {
    console.error('[DawahRetention] purge error:', error.message);
    return NextResponse.json({ ok: false, error: 'تعذر تنفيذ سياسة الاحتفاظ.' }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    deleted: data?.length ?? 0,
    retentionDays: 90,
    cutoff: cutoff.toISOString(),
  });
}
