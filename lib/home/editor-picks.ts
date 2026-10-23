// lib/home/editor-picks.ts
// ============================================================
// مختارات المحرر في الصفحة الرئيسية.
// ------------------------------------------------------------
// تُحفظ في إعداد واحد غير مترجم (`editorPicks`) بالصيغة:
//   type:slug
// سطر لكل مادة. نفس القائمة تُستخدم في اللغتين؛ ويُبحث عن
// الترجمة المطلوبة لكل مادة، فلا تظهر مادة بلا ترجمة إنجليزية
// في الصفحة الإنجليزية.
//
// هذا الملف نقي (بلا استيرادات) ليُستخدم في الخادم والعميل
// وفي اختبارات الوحدة.
// ============================================================

export const EDITOR_PICK_TYPES = [
  'article',
  'lesson',
  'course',
  'book',
  'fatwa',
  'khutbah',
  'audio',
  'video',
  'hadith',
  'duaa',
  'story',
  'research',
  'faq',
] as const;

export type EditorPickType = (typeof EDITOR_PICK_TYPES)[number];

export type EditorPick = {
  type: EditorPickType;
  slug: string;
};

export const MAX_EDITOR_PICKS = 9;

const ALLOWED_TYPES = new Set<string>(EDITOR_PICK_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeType(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSlug(value: string): string {
  return value.trim();
}

/**
 * يحوّل قيمة الإعداد إلى قائمة مختارات صالحة.
 *
 * يقبل:
 *   • نصًّا: سطر لكل مادة بصيغة `type:slug`.
 *   • مصفوفة من النصوص أو الكائنات `{ type, slug }`.
 *   • كائنًا قديمًا `{ ar, en }` (يُفضّل العربي) للتوافق مع
 *     أي قيمة محفوظة قبل إضافة المفتاح إلى القيم غير المترجمة.
 *
 * يتجاهل الأسطر الفارغة والتعليقات (تبدأ بـ `#`) والأنواع غير
 * المدعومة والتكرار، ويحتفظ بالترتيب ويقصّ عند ٩ مواد.
 */
export function parseEditorPicks(value: unknown): EditorPick[] {
  if (isRecord(value)) {
    if (typeof value.ar === 'string') return parseEditorPicks(value.ar);
    if (typeof value.en === 'string') return parseEditorPicks(value.en);
    return [];
  }

  const entries: unknown[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : [];

  const picks: EditorPick[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (picks.length >= MAX_EDITOR_PICKS) break;

    let rawType = '';
    let rawSlug = '';

    if (typeof entry === 'string') {
      const line = entry.trim();
      if (!line || line.startsWith('#')) continue;

      const separator = line.indexOf(':');
      if (separator <= 0) continue;

      rawType = line.slice(0, separator);
      rawSlug = line.slice(separator + 1);
    } else if (
      isRecord(entry) &&
      typeof entry.type === 'string' &&
      typeof entry.slug === 'string'
    ) {
      rawType = entry.type;
      rawSlug = entry.slug;
    } else {
      continue;
    }

    const type = normalizeType(rawType);
    const slug = normalizeSlug(rawSlug);

    if (!ALLOWED_TYPES.has(type)) continue;
    if (!slug) continue;
    if (/[\u0000-\u001F\u007F]/.test(slug)) continue;

    const key = `${type}:${slug}`;
    if (seen.has(key)) continue;

    seen.add(key);
    picks.push({ type: type as EditorPickType, slug });
  }

  return picks;
}
