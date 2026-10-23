// lib/questions/config.ts
// مفتاح إعدادات أسئلة المستخدمين في `site_settings` — يتحكم به الأدمن.
// الإعداد غير مرتبط بلغة؛ القيمة الواحدة تكفي للغتين.

export const QUESTIONS_SETTING_KEY = 'questions';

export type QuestionsConfig = {
  enabled: boolean;
};

export const DEFAULT_QUESTIONS_CONFIG: QuestionsConfig = {
  enabled: true,
};

/** يطبّع قيمة الإعداد القادمة من قاعدة البيانات أو من اللوحة. */
export function normalizeQuestionsConfig(value: unknown): QuestionsConfig {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof source.enabled === 'boolean'
        ? source.enabled
        : DEFAULT_QUESTIONS_CONFIG.enabled,
  };
}
