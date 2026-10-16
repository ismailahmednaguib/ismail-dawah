// lib/params.ts
// ============================================================================
// فكّ ترميز بارامترات المسار الديناميكية.
//
// في هذا الإصدار من Next.js لا يُفكّ ترميز مقاطع المسار الديناميكية، فيصل
// البارامتر مشفَّرًا كما هو في الرابط (مثال: "lesson-quran-%D8%AA%D9%81%D8%B3").
// ولأن معرّفات المحتوى العربية مخزّنة في قاعدة البيانات نصًّا عربيًّا صريحًا،
// فإن البحث بها دون فكّ الترميز يفشل ويُنتج 404.
//
// الدالة آمنة في الحالتين:
//   • إن وصل البارامتر مشفَّرًا → يُفكّ ترميزه.
//   • إن وصل مفكوكًا (نسخة أخرى من Next، أو معرّف لاتيني) → يُعاد كما هو.
// كما تُعيد القيمة الأصلية إن كان الترميز تالفًا بدل أن ترمي خطئًا.
// ============================================================================

const PERCENT_ENCODED = /%[0-9A-Fa-f]{2}/;

/** يفكّ ترميز بارامتر مسار واحد (slug · id · type). */
export function decodeParam(value: string): string {
  if (!value || !PERCENT_ENCODED.test(value)) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** يفكّ ترميز عدة بارامترات مرة واحدة. */
export function decodeParams<T extends Record<string, string>>(params: T): T {
  const out = {} as Record<string, string>;
  for (const [key, value] of Object.entries(params)) {
    out[key] = typeof value === 'string' ? decodeParam(value) : value;
  }
  return out as T;
}
