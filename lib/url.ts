// lib/url.ts
// ============================================================================
// أدوات بناء الروابط المطلقة.
//
// معرّفات المحتوى العربية تُكتب في قواعد البيانات نصًّا عربيًّا صريحًا، وهي غير
// صالحة خامًا في <loc> بخريطة الموقع ولا في <link> بخلاصة RSS، ولا تطابق
// الرابط القانوني (canonical) المُرمَّز في الصفحة. لذلك نُرمّزها هنا.
// ============================================================================

/** يعيد الرابط مُرمَّزًا (percent-encoding) مع الحفاظ على بنيته. */
export function encodeUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

/** يبني رابطًا مطلقًا لمادة محتوى. */
export function contentUrl(
  baseUrl: string,
  lang: string,
  contentType: string,
  slug: string
): string {
  return encodeUrl(
    `${baseUrl.replace(/\/+$/, '')}/${lang}/learn/${contentType}/${slug}`
  );
}
