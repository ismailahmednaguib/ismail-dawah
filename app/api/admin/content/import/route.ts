import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import { createContent, deleteContent, getSupabaseAdmin } from '@/lib/supabase/admin';
import { upsertTranslation } from '@/lib/translations/service';
import { revalidatePublicContent } from '@/lib/revalidate-public';
import {
  validateContentImport,
  sanitizeImportedBody,
  type ContentImportItem,
  type ContentImportIssue,
} from '@/lib/content-import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'خطأ غير متوقع أثناء الاستيراد.';
}

function requestDocument(body: unknown): { mode: 'preview' | 'apply'; document: unknown } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { mode: 'preview', document: body };
  }

  const record = body as Record<string, unknown>;
  return {
    mode: record.mode === 'apply' ? 'apply' : 'preview',
    document: 'document' in record ? record.document : body,
  };
}

async function findExistingSlugs(items: ContentImportItem[]): Promise<ContentImportIssue[]> {
  const pairs = items.flatMap((item, itemIndex) =>
    item.translations.map((translation) => ({
      itemIndex,
      lang: translation.lang,
      slug: translation.slug,
    }))
  );
  const slugs = [...new Set(pairs.map((pair) => pair.slug))];
  if (!slugs.length) return [];

  const { data, error } = await getSupabaseAdmin()
    .from('content_translations')
    .select('lang, slug')
    .in('slug', slugs);

  if (error) throw new Error(`تعذّر فحص الروابط الموجودة: ${error.message}`);

  const existing = new Set(
    (data ?? []).map((row) => `${String(row.lang)}:${String(row.slug)}`)
  );

  return pairs.flatMap((pair) =>
    existing.has(`${pair.lang}:${pair.slug}`)
      ? [{
          index: pair.itemIndex,
          path: `items[${pair.itemIndex}].translations`,
          message: `الرابط ${pair.slug} موجود مسبقًا للغة ${pair.lang}؛ لم يُستبدل أي محتوى.`,
        }]
      : []
  );
}

async function applyItem(item: ContentImportItem, userId: string) {
  const primary = item.translations.find((translation) => translation.lang === item.lang_original)
    ?? item.translations[0];

  if (!primary) throw new Error('لا توجد ترجمة صالحة للمادة.');

  const content = await createContent(
    {
      content_type: item.content_type,
      lang_original: item.lang_original,
      audience: item.audience,
      age_groups: item.age_groups,
      levels: item.levels,
      madhhabs: item.madhhabs,
      parent_id: item.parent_id,
      sort_order: item.sort_order,
      needs_scholar_review: item.needs_scholar_review,
      is_sensitive: item.is_sensitive,
      translation: {
        lang: primary.lang,
        slug: primary.slug,
        title: primary.title,
        summary: primary.summary,
        body: sanitizeImportedBody(primary.body),
        meta_title: primary.meta_title,
        meta_description: primary.meta_description,
      },
    },
    userId
  );

  try {
    for (const translation of item.translations) {
      if (translation.lang === primary.lang) continue;
      await upsertTranslation(
        content.id,
        translation.lang,
        {
          slug: translation.slug,
          title: translation.title,
          summary: translation.summary,
          body: sanitizeImportedBody(translation.body),
          meta_title: translation.meta_title,
          meta_description: translation.meta_description,
        },
        userId
      );
    }
  } catch (error) {
    try {
      await deleteContent(content.id, userId);
    } catch {
      // يظهر الخطأ الأصلي؛ لا نخفي فشل التنظيف إن احتاج المالك إلى فحص السجل.
    }
    throw error;
  }

  return content;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !can(session.roles, 'content.create')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_IMPORT_BYTES) {
    return NextResponse.json(
      { error: `حجم ملف الاستيراد يتجاوز ${MAX_IMPORT_BYTES / (1024 * 1024)} ميجابايت.` },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { error: `حجم ملف الاستيراد يتجاوز ${MAX_IMPORT_BYTES / (1024 * 1024)} ميجابايت.` },
        { status: 413 }
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'ملف JSON غير صالح.' }, { status: 400 });
  }

  const { mode, document } = requestDocument(body);
  const report = validateContentImport(document);

  if (report.ok) {
    try {
      const existingIssues = await findExistingSlugs(report.items);
      report.errors.push(...existingIssues);
      report.ok = report.errors.length === 0;
      if (!report.ok) report.valid = 0;
    } catch (error) {
      return NextResponse.json({ error: errorMessage(error), report }, { status: 500 });
    }
  }

  if (mode === 'preview') {
    return NextResponse.json(
      { ok: report.ok, mode, report },
      { status: report.ok ? 200 : 422 }
    );
  }

  if (!report.ok) {
    return NextResponse.json(
      { ok: false, mode, report, error: 'فشل التحقق؛ لم تُطبَّق أي مادة.' },
      { status: 422 }
    );
  }

  const created: Array<{ index: number; id: string; translations: number }> = [];
  const errors: ContentImportIssue[] = [];

  for (const [index, item] of report.items.entries()) {
    try {
      const content = await applyItem(item, session.userId);
      created.push({ index, id: content.id, translations: item.translations.length });
    } catch (error) {
      errors.push({ index, path: `items[${index}]`, message: errorMessage(error) });
    }
  }

  if (created.length > 0) revalidatePublicContent();

  return NextResponse.json(
    {
      ok: errors.length === 0,
      mode,
      created,
      errors,
      message:
        errors.length === 0
          ? `تم استيراد ${created.length} مادة كمسودة.`
          : `تم استيراد ${created.length} مادة، وتعذّر استيراد ${errors.length} مادة.`,
    },
    { status: errors.length === 0 ? 200 : 207 }
  );
}
