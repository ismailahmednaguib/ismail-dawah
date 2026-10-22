// ============================================================
// دمج ترجمات التصنيفات (منطق نقي قابل للاختبار)
// ------------------------------------------------------------
// روابط content_terms تشير دائمًا إلى الصف العربي للتصنيف، بينما التصنيف
// نفسه مخزّن صفًّا لكل لغة. نطابق الترجمة بـ slug + kind لأن نفس الـ slug قد
// يتكرّر بين الأنواع (مثل aqeedah بابًا ومجالًا).
// ============================================================

export interface TermLike {
  id: string;
  kind: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  parent_id?: string | null;
  lang?: string | null;
}

function termKey(term: Pick<TermLike, "slug" | "kind">): string {
  return `${term.slug}\u0000${term.kind}`;
}

/**
 * يستبدل اسم كل تصنيف بترجمته في اللغة المطلوبة إن وُجدت.
 * يحافظ على icon/color الأصليين إن كانت الترجمة تفتقدهما، ولا يحذف تصنيفًا
 * بلا ترجمة (حتى لا تنكسر روابط/فلاتر الصفحات).
 */
export function mergeTermTranslations<T extends TermLike>(
  terms: T[],
  translations: TermLike[],
  lang: string
): T[] {
  if (lang === "ar" || terms.length === 0) return terms;

  const byKey = new Map<string, TermLike>();
  for (const translation of translations) {
    byKey.set(termKey(translation), translation);
  }

  return terms.map((term) => {
    const translation = byKey.get(termKey(term));
    if (!translation) return term;

    return {
      ...term,
      id: translation.id,
      name: translation.name,
      lang: translation.lang ?? lang,
      icon: translation.icon ?? term.icon,
      color: translation.color ?? term.color,
    };
  });
}
