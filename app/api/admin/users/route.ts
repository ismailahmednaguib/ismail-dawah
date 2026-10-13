// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const canManage = session.roles.some(r => ['super_admin', 'admin'].includes(r));
  if (!canManage) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const canManage = session.roles.some(r => ['super_admin', 'admin'].includes(r));
  if (!canManage) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await req.json();
  const { user_id, roles, is_active } = body;
  const supabase = getSupabaseAdmin();

  const updateData: Record<string, any> = {};
  if (roles) updateData.roles = roles;
  if (typeof is_active === 'boolean') updateData.is_active = is_active;

  const { error } = await supabase
    .from('user_roles')
    .update(updateData)
    .eq('user_id', user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // تسجيل في سجل التدقيق
  await supabase.from('audit_log').insert({
    user_id: session.userId,
    action: 'update_roles',
    table_name: 'user_roles',
    record_id: user_id,
    new_data: updateData,
  });

  return NextResponse.json({ success: true });
}