// app/api/admin/translations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import {
  getTranslationMatrix,
  getTranslation,
  upsertTranslation,
  markTranslationReviewed,
  getTranslationStats,
  copyOriginalAsDraft,
} from '@/lib/translations/service';
import type { LanguageCode } from '@/lib/translations/types';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    // إحصائيات
    if (action === 'stats') {
      const stats = await getTranslationStats();
      return NextResponse.json(stats);
    }

    // ترجمة واحدة
    if (action === 'single') {
      const contentId = searchParams.get('content_id')!;
      const lang = searchParams.get('lang')! as LanguageCode;
      const translation = await getTranslation(contentId, lang);
      return NextResponse.json({ translation });
    }

    // المصفوفة الافتراضية
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') ?? undefined;
    const { data, total } = await getTranslationMatrix(page, 20, search);

    return NextResponse.json({
      data,
      total,
      page,
      total_pages: Math.ceil(total / 20),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const canTranslate = session.roles.some(r =>
    ['super_admin', 'admin', 'editor', 'translator'].includes(r)
  );
  if (!canTranslate) {
    return NextResponse.json({ error: 'ليس لديك صلاحية الترجمة' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    // إنشاء/تحديث ترجمة
    if (action === 'upsert') {
      const { content_id, lang, translation } = body;
      const result = await upsertTranslation(content_id, lang, translation, session.userId);
      return NextResponse.json({ success: true, translation: result });
    }

    // مراجعة ترجمة
    if (action === 'mark_reviewed') {
      const { content_id, lang } = body;
      const canReview = session.roles.some(r =>
        ['super_admin', 'admin', 'scholar_reviewer'].includes(r)
      );
      if (!canReview) {
        return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });
      }
      await markTranslationReviewed(content_id, lang, session.userId);
      return NextResponse.json({ success: true });
    }

    // نسخ الأصل كمسودة
    if (action === 'copy_original') {
      const { content_id, target_lang } = body;
      const result = await copyOriginalAsDraft(content_id, target_lang, session.userId);
      return NextResponse.json({ success: true, translation: result });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}