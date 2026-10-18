export type AssistantConfig = {
  enabled: boolean;
  model: string;
  maxSources: number;
};

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  enabled: false,
  model: 'gpt-4o-mini',
  maxSources: 5,
};

function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max);
}

function normalizeMaxSources(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_ASSISTANT_CONFIG.maxSources;
  return Math.min(Math.max(Math.trunc(number), 1), 8);
}

export function normalizeAssistantConfig(raw: unknown): AssistantConfig {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
  const model = cleanText(source.model, 80).replace(/[^a-zA-Z0-9._:/-]/g, '');

  return {
    enabled: source.enabled === true,
    model: model || DEFAULT_ASSISTANT_CONFIG.model,
    maxSources: normalizeMaxSources(source.maxSources),
  };
}
