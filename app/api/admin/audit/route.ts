// app/api/admin/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const canView = session.roles.some(r => ['super_admin', 'admin'].includes(r));
  if (!canView) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;

  const supabase = getSupabaseAdmin();

  const { data, error, count } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    total_pages: Math.ceil((count ?? 0) / perPage),
  });
}