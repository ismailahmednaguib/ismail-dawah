/**
 * مفاتيح الإعدادات التي لا تُخزَّن لكل لغة.
 *
 * بعض هذه القيم كائنات مركّبة (مثل pageSections) وبعضها منطقي (مثل
 * publicApiEnabled). يجب ألا تُلفّ في { ar, en } وإلا صارت القيمة المنطقية
 * كائنًا truthy في الواجهة، فيظهر الخيار مفعّلًا دائمًا.
 */
export const NON_LOCALIZED_SETTING_KEYS = new Set([
  'pageSections',
  'sectionTitles',
  'sectionOrder',
  'hiddenPages',
  'navigation',
  'editorPicks',
  'dawahJourney',
  'assistant',
  'playStoreUrl',
  'emailVerification',
  'passwordReset',
  'passwordChange',
  'questions',
  'showPrayerBar',
  'prayerTools',
  'tools',
  'theme',
  'redirects',
  'publicApiEnabled',
]);

export function isNonLocalizedSetting(key: string): boolean {
  return NON_LOCALIZED_SETTING_KEYS.has(key);
}
