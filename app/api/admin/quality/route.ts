// app/api/admin/quality/route.ts
// جودة المحتوى: ملخّص آلي + طابور مراجعة الترجمات (اعتماد/إلغاء) من اللوحة.
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { can } from '@/lib/admin/permissions';
import { getAdminSession } from '@/lib/admin/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CITATION_PATTERNS = [
  'قال تعالى',
  'قال الله',
  'قال رسول الله',
  'قال رسول',
  'قال النبي',
  'قال ﷺ',
  'صلى الله عليه وسلم',
  'رواه البخاري',
  'رواه مسلم',
  'أخرجه',
  'في الصحيحين',
];
const SHORT_BODY = 220;
const MAX_ROWS = 60;

type Row = {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  body: string | null;
  is_machine_translated: boolean;
  is_reviewed: boolean;
  reviewed_at: string | null;
  updated_at: string | null;
};

type CitationTranslation = {
  id: string;
  content_id: string;
  lang: string;
  slug: string;
  title: string;
  body: string | null;
};

type FatwaRow = {
  id: string;
  reviewer_id: string | null;
  content_translations?: Array<{ lang: string; title: string; slug: string }> | null;
};

function countMatches(text: string | null, needles: string[]): number {
  if (!text) return 0;
  let total = 0;
  for (const needle of needles) {
    let index = text.indexOf(needle);
    while (index !== -1) {
      total += 1;
      index = text.indexOf(needle, index + needle.length);
    }
  }
  return total;
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'content.read')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية العرض' }, { status: 403 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get('filter') ?? 'pending';

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('content_translations')
    .select(
      'id, content_id, lang, slug, title, body, is_machine_translated, is_reviewed, reviewed_at, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(MAX_ROWS);

  if (filter === 'pending') {
    query = query.eq('is_machine_translated', true).eq('is_reviewed', false);
  } else if (filter === 'reviewed') {
    query = query.eq('is_reviewed', true);
  } else if (filter === 'machine') {
    query = query.eq('is_machine_translated', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'تعذّر قراءة الترجمات', details: error.message },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as Row[];

  const counts = {
    returned: rows.length,
    missingBody: rows.filter((r) => !r.body || !r.body.trim()).length,
    shortBody: rows.filter((r) => r.body && r.body.trim().length > 0 && r.body.trim().length < SHORT_BODY)
      .length,
  };

  // إحصاء عام على كل الترجمات (لعرض شريط التقدّم)
  const [pendingCount, machineCount, reviewedCount, totalCount] = await Promise.all([
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_machine_translated', true)
      .eq('is_reviewed', false),
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_machine_translated', true),
    supabase
      .from('content_translations')
      .select('id', { head: true, count: 'exact' })
      .eq('is_reviewed', true),
    supabase.from('content_translations').select('id', { head: true, count: 'exact' }),
  ]);

  const { data: citationData } = await supabase
    .from('content_translations')
    .select('id, content_id, lang, slug, title, body, content:content_id!inner(status)')
    .eq('content.status', 'published')
    .in('lang', ['ar', 'en'])
    .order('updated_at', { ascending: false })
    .limit(2000);

  const citationTranslations = (citationData ?? []) as CitationTranslation[];
  const citationIds = [...new Set(citationTranslations.map((row) => row.content_id).filter(Boolean))];
  const { data: referenceData } = citationIds.length > 0
    ? await supabase.from('content_references').select('content_id, verified').in('content_id', citationIds)
    : { data: [] as Array<{ content_id: string; verified: boolean }> };

  const referenceCounts = new Map<string, { total: number; verified: number }>();
  for (const reference of referenceData ?? []) {
    const current = referenceCounts.get(reference.content_id) ?? { total: 0, verified: 0 };
    current.total += 1;
    if (reference.verified) current.verified += 1;
    referenceCounts.set(reference.content_id, current);
  }

  const citations = citationTranslations
    .map((row) => {
      const counts = referenceCounts.get(row.content_id) ?? { total: 0, verified: 0 };
      return {
        id: row.id,
        contentId: row.content_id,
        lang: row.lang,
        slug: row.slug,
        title: row.title,
        mentions: countMatches(`${row.title ?? ''}\n${row.body ?? ''}`, CITATION_PATTERNS),
        references: counts.total,
        verifiedReferences: counts.verified,
      };
    })
    .filter((row) => row.mentions > 0 && row.verifiedReferences === 0)
    .sort((a, b) => b.mentions - a.mentions);

  const stats = {
    pending: pendingCount.count ?? 0,
    machine: machineCount.count ?? 0,
    reviewed: reviewedCount.count ?? 0,
    total: totalCount.count ?? 0,
  };

  // تغطية المراجعة العلمية للفتاوى المنشورة: المراجع المعتمد + المرجع الموثّق.
  const { data: fatwaRows } = await supabase
    .from('content')
    .select('id, reviewer_id, content_translations(lang, title, slug)')
    .eq('content_type', 'fatwa')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(2000);

  const publishedFatwas = (fatwaRows ?? []) as FatwaRow[];
  const fatwaIds = publishedFatwas.map((row) => row.id);
  const { data: fatwaReferenceRows } = fatwaIds.length > 0
    ? await supabase
        .from('content_references')
        .select('content_id, verified')
        .in('content_id', fatwaIds)
    : { data: [] as Array<{ content_id: string; verified: boolean }> };

  const fatwaReferenceCounts = new Map<string, { total: number; verified: number }>();
  for (const reference of fatwaReferenceRows ?? []) {
    const current = fatwaReferenceCounts.get(reference.content_id) ?? { total: 0, verified: 0 };
    current.total += 1;
    if (reference.verified) current.verified += 1;
    fatwaReferenceCounts.set(reference.content_id, current);
  }

  const fatwaReview = {
    total: publishedFatwas.length,
    reviewed: publishedFatwas.filter((row) => Boolean(row.reviewer_id)).length,
    unreviewed: publishedFatwas.filter((row) => !row.reviewer_id).length,
    withReferences: publishedFatwas.filter((row) => (fatwaReferenceCounts.get(row.id)?.total ?? 0) > 0).length,
    withVerifiedReferences: publishedFatwas.filter(
      (row) => (fatwaReferenceCounts.get(row.id)?.verified ?? 0) > 0
    ).length,
  };

  const unreviewedFatwas = publishedFatwas
    .filter((row) => !row.reviewer_id)
    .slice(0, 50)
    .map((row) => {
      const translations = row.content_translations ?? [];
      const translation = translations.find((item) => item.lang === 'ar') ?? translations[0];
      const refs = fatwaReferenceCounts.get(row.id) ?? { total: 0, verified: 0 };
      return {
        id: row.id,
        title: translation?.title ?? 'بلا عنوان',
        slug: translation?.slug ?? '',
        references: refs.total,
        verifiedReferences: refs.verified,
      };
    });

  return NextResponse.json({
    ok: true,
    filter,
    counts,
    stats,
    fatwaReview,
    unreviewedFatwas,
    citations,
    rows,
    canReview: can(session.roles, 'content.update'),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  if (!can(session.roles, 'content.update')) {
    return NextResponse.json({ error: 'ليس لديك صلاحية المراجعة' }, { status: 403 });
  }

  let payload: { id?: unknown; action?: unknown; note?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'جسم الطلب غير صالح' }, { status: 400 });
  }

  const id = typeof payload.id === 'string' ? payload.id : '';
  const rawAction = typeof payload.action === 'string' ? payload.action : '';

  if (!id) {
    return NextResponse.json({ error: 'طلب غير مكتمل' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // اعتماد علمي مباشر لفتوى منشورة (دون تغيير حالتها أو إخفائها).
  if (rawAction === 'approve-fatwa') {
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, content_type, status, reviewer_id, content_translations(lang, slug)')
      .eq('id', id)
      .maybeSingle();

    if (contentError) {
      return NextResponse.json(
        { error: 'تعذّر قراءة الفتوى', details: contentError.message },
        { status: 500 }
      );
    }
    if (!content) return NextResponse.json({ error: 'الفتوى غير موجودة' }, { status: 404 });
    if (content.content_type !== 'fatwa' || content.status !== 'published') {
      return NextResponse.json(
        { error: 'الاعتماد العلمي المباشر متاح للفتاوى المنشورة فقط' },
        { status: 409 }
      );
    }
    if (content.reviewer_id) {
      return NextResponse.json({ ok: true, id, alreadyReviewed: true });
    }

    const { count: verifiedReferences, error: referenceError } = await supabase
      .from('content_references')
      .select('id', { head: true, count: 'exact' })
      .eq('content_id', id)
      .eq('verified', true);

    if (referenceError) {
      return NextResponse.json(
        { error: 'تعذّر قراءة مراجع الفتوى', details: referenceError.message },
        { status: 500 }
      );
    }
    if (!verifiedReferences) {
      return NextResponse.json(
        { error: 'أضف مرجعًا معتمدًا واحدًا على الأقل قبل الاعتماد العلمي.' },
        { status: 409 }
      );
    }

    const baseUpdate = {
      reviewer_id: session.userId,
      updated_by: session.userId,
    };
    let { error: updateError } = await supabase
      .from('content')
      .update({ ...baseUpdate, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    // reviewed_at عمود اختياري أُضيف في migration لاحق؛ لا نُفشل الاعتماد إن لم يكن مُنفَّذًا.
    if (updateError && /reviewed_at/i.test(updateError.message)) {
      ({ error: updateError } = await supabase.from('content').update(baseUpdate).eq('id', id));
    }

    if (updateError) {
      return NextResponse.json(
        { error: 'تعذّر تسجيل الاعتماد العلمي', details: updateError.message },
        { status: 500 }
      );
    }

    await supabase
      .from('audit_log')
      .insert({
        user_id: session.userId,
        action: 'approve',
        table_name: 'content',
        record_id: id,
        new_data: { note: 'اعتماد علمي لفتوى منشورة' },
      })
      .then(
        () => undefined,
        () => undefined
      );

    // صفحات الفتاوى مبنية مسبقًا (SSG)؛ نُبطلها ليظهر الاعتماد للزائر فورًا.
    const translations = Array.isArray(content.content_translations)
      ? (content.content_translations as Array<{ lang?: string; slug?: string }>)
      : [];
    for (const lang of ['ar', 'en']) {
      revalidatePath(`/${lang}/fatwa`);
    }
    for (const translation of translations) {
      if (translation.lang && translation.slug) {
        revalidatePath(`/${translation.lang}/learn/fatwa/${translation.slug}`);
      }
    }

    return NextResponse.json({ ok: true, id, reviewed: true });
  }

  const action = rawAction === 'approve' ? 'approve' : rawAction === 'unapprove' ? 'unapprove' : '';

  if (!action) {
    return NextResponse.json({ error: 'طلب غير مكتمل' }, { status: 400 });
  }

  const approve = action === 'approve';

  const base = {
    is_reviewed: approve,
    reviewed_by: approve ? session.userId : null,
  };

  let { error } = await supabase
    .from('content_translations')
    .update({ ...base, reviewed_at: approve ? new Date().toISOString() : null })
    .eq('id', id);

  // إن لم يُنفَّذ عمود reviewed_at بعد، نكتفي بالحقول الأساسية
  if (error && /reviewed_at/i.test(error.message)) {
    ({ error } = await supabase.from('content_translations').update(base).eq('id', id));
  }

  if (error) {
    return NextResponse.json(
      { error: 'تعذّر تحديث حالة المراجعة', details: error.message },
      { status: 500 }
    );
  }

  await supabase
    .from('audit_log')
    .insert({
      user_id: session.userId,
      action: approve ? 'approve' : 'update',
      table_name: 'content_translations',
      record_id: id,
      new_data: { is_reviewed: approve, note: typeof payload.note === 'string' ? payload.note : null },
    })
    .then(
      () => undefined,
      () => undefined
    );

  return NextResponse.json({ ok: true, id, isReviewed: approve });
}
