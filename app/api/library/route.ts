// app/api/library/route.ts
// ============================================================
// واجهة قراءة عامة (قراءة فقط) للمحتوى المنشور من CMS.
// تُستخدم من مكوّنات العميل التي لا تستطيع القراءة من الخادم مباشرة.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPublicList, getPublicTaxonomies } from '@/lib/learn/public';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lang = sp.get('lang') === 'en' ? 'en' : 'ar';

  try {
    const kind = sp.get('kind');
    if (kind) {
      const data = await getPublicTaxonomies(lang, kind);
      return NextResponse.json({ data });
    }

    const type = sp.get('type') || 'article';
    const limit = Number(sp.get('limit') || 60);
    const taxonomy = sp.get('taxonomy') || undefined;
    const order = sp.get('order') === 'manual' ? 'manual' : 'newest';
    const search = sp.get('q') || undefined;

    const data = await getPublicList(lang, type, {
      limit: Number.isFinite(limit) ? limit : 60,
      taxonomySlug: taxonomy,
      order,
      search,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[api/library]', error);
    return NextResponse.json({ data: [], error: 'failed' }, { status: 500 });
  }
}
