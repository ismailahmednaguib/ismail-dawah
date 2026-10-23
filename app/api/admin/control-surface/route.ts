import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuditElement = {
  element_key?: string;
  page?: string;
  kind?: string;
  source?: string;
  source_file?: string;
  line?: number;
  admin_key?: string | null;
  permission?: string | null;
  test?: string | null;
  status?: string;
};

type AuditReport = {
  generatedAt?: string;
  generated_at?: string;
  summary?: Record<string, number>;
  elements?: AuditElement[];
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Vary: 'Cookie',
    },
  });
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return json({ error: 'غير مصرح.' }, 401);
  if (!can(session.roles, 'audit.read')) return json({ error: 'لا تملك صلاحية قراءة سجل سطح الإدارة.' }, 403);

  try {
    const url = new URL(request.url);
    const requestedStatus = url.searchParams.get('status')?.trim() || 'unbound';
    const limitValue = Number(url.searchParams.get('limit') || 25);
    const limit = Number.isFinite(limitValue) ? Math.max(1, Math.min(100, Math.floor(limitValue))) : 25;
    const file = path.join(process.cwd(), 'CONTROL_SURFACE_AUDIT.json');
    const report = JSON.parse(await readFile(file, 'utf8')) as AuditReport;
    const elements = Array.isArray(report.elements) ? report.elements : [];
    const filtered = requestedStatus === 'all'
      ? elements
      : elements.filter((element) => element.status === requestedStatus);

    return json({
      generatedAt: report.generatedAt ?? report.generated_at ?? null,
      summary: report.summary ?? {},
      status: requestedStatus,
      total: filtered.length,
      elements: filtered.slice(0, limit),
    });
  } catch (error) {
    console.error('[AdminControlSurface] GET error:', error);
    return json({ error: 'تعذر قراءة سجل سطح الإدارة. شغّل audit:control-surface أولًا.' }, 500);
  }
}

