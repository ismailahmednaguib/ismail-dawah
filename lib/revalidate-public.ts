import { revalidatePath } from 'next/cache';

/**
 * بعد أي تعديل على المحتوى من لوحة التحكم، نُبطل صفحات القوائم والرئيسية
 * حتى لا تنتظر دورة ISR القصيرة. صفحات المادة نفسها تُقرأ وقت الطلب.
 */
const PUBLIC_LIST_PATHS = [
  '',
  '/learn',
  '/fatwa',
  '/articles',
  '/hadith',
  '/faq',
  '/khutab',
  '/prophets-stories',
  '/calendar',
] as const;

export function revalidatePublicContent(): void {
  for (const lang of ['ar', 'en'] as const) {
    for (const path of PUBLIC_LIST_PATHS) {
      revalidatePath(`/${lang}${path}`);
    }
  }
}
