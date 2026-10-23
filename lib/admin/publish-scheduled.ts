// lib/admin/publish-scheduled.ts
// نشر المحتوى المجدول الذي حان موعده.
// Server-only: يستخدم مفتاح الخدمة. التحديث شرطي (status='scheduled')
// حتى لا يتكرر النشر عند تزامن أكثر من نسخة من الخادم.

import 'server-only';
import { getSupabaseAdmin, requiresScholarReview } from '@/lib/supabase/admin';

export type PublishDueResult = {
  published: number;
  ids: string[];
  error?: string;
};

function isMissingScheduleFeature(error: unknown): boolean {
  const code = String((error as { code?: unknown })?.code || '');
  const message = String((error as { message?: unknown })?.message || '');

  return (
    code === '42703' ||
    code === '22P02' ||
    /scheduled_at|invalid input value for enum|content_status/i.test(message)
  );
}

/**
 * ينشر حتى `limit` مادة مجدولة حان موعدها.
 * يعيد عدد المواد وأسماء معرّفاتها. لا يستدعي revalidatePath لأن
 * الدالة تُستدعى من مسار عام (قراءة) وقد لا يكون السياق مناسبًا.
 */
export async function publishDueScheduledContent(
  limit = 25
): Promise<PublishDueResult> {
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(limit)));
  const now = new Date();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('content')
      .select(
        'id, scheduled_at, content_type, needs_scholar_review, is_sensitive'
      )
      .eq('status', 'scheduled')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(safeLimit);

    if (error) {
      if (isMissingScheduleFeature(error)) {
        return { published: 0, ids: [] };
      }

      console.error('[ScheduledPublish] lookup error:', error.message);
      return { published: 0, ids: [], error: error.message };
    }

    const ids: string[] = [];
    const auditRows: Array<{ id: string; published_at: string }> = [];

    for (const row of data ?? []) {
      const id = typeof row.id === 'string' ? row.id : '';
      const scheduledAt =
        typeof row.scheduled_at === 'string' ? row.scheduled_at : null;

      if (!id || !scheduledAt) continue;

      // إعادة فحص عند لحظة النشر: قد تتغيّر الحاجة للمراجعة بعد الجدولة.
      // لا نُنشر أبدًا مادة صارت تحتاج مراجعة علمية؛ تبقى مجدولة للمعالجة.
      if (
        requiresScholarReview({
          content_type: row.content_type,
          needs_scholar_review: row.needs_scholar_review,
          is_sensitive: row.is_sensitive,
        })
      ) {
        console.warn(
          `[ScheduledPublish] skipped ${id}: requires scholarly review`
        );
        continue;
      }

      const { data: updated, error: updateError } = await supabase
        .from('content')
        .update({
          status: 'published',
          published_at: scheduledAt,
          scheduled_at: null,
          updated_at: now.toISOString(),
        })
        .eq('id', id)
        .eq('status', 'scheduled')
        .select('id');

      if (updateError) {
        console.error(
          `[ScheduledPublish] update ${id} failed:`,
          updateError.message
        );
        continue;
      }

      // نسخة أخرى من الخادم قد تكون نشرت الصف نفسه؛ لا نعدّه مرتين.
      if (!updated?.length) continue;

      ids.push(id);
      auditRows.push({ id, published_at: scheduledAt });
    }

    if (auditRows.length > 0) {
      await supabase
        .from('audit_log')
        .insert(
          auditRows.map((row) => ({
            user_id: null,
            action: 'publish_scheduled',
            table_name: 'content',
            record_id: row.id,
            new_data: { published_at: row.published_at },
          }))
        )
        .then(
          () => undefined,
          () => undefined
        );
    }

    return { published: ids.length, ids };
  } catch (error) {
    if (isMissingScheduleFeature(error)) {
      return { published: 0, ids: [] };
    }

    console.error('[ScheduledPublish] unexpected error:', error);
    return { published: 0, ids: [] };
  }
}
