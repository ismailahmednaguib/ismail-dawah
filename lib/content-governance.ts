export type GovernanceLocalized = { ar: string; en: string };

export type ContentGovernanceSettings = {
  methodology: GovernanceLocalized;
  reviewPolicy: GovernanceLocalized;
  sourcePolicy: GovernanceLocalized;
  reviewers: string[];
  responseSlaHours: number;
  inquiryRetentionDays: number;
  checklist: {
    source: boolean;
    citation: boolean;
    scholarlyReview: boolean;
    languageReview: boolean;
    limitations: boolean;
    errorReports: boolean;
  };
};

export const DEFAULT_CONTENT_GOVERNANCE: ContentGovernanceSettings = {
  methodology: {
    ar: '',
    en: '',
  },
  reviewPolicy: {
    ar: '',
    en: '',
  },
  sourcePolicy: {
    ar: '',
    en: '',
  },
  reviewers: [],
  responseSlaHours: 48,
  inquiryRetentionDays: 90,
  checklist: {
    source: true,
    citation: true,
    scholarlyReview: true,
    languageReview: true,
    limitations: true,
    errorReports: true,
  },
};

function cleanText(value: unknown, fallback: string, max = 8_000): string {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max) || fallback;
}

function cleanLocalized(value: unknown, fallback: GovernanceLocalized): GovernanceLocalized {
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    ar: cleanText(record.ar, fallback.ar),
    en: cleanText(record.en, fallback.en),
  };
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeContentGovernance(raw: unknown): ContentGovernanceSettings {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
  const checklist = source.checklist && typeof source.checklist === 'object' && !Array.isArray(source.checklist)
    ? source.checklist as Record<string, unknown>
    : {};
  const responseSlaHours = Number(source.responseSlaHours);
  const inquiryRetentionDays = Number(source.inquiryRetentionDays);
  const reviewers = Array.isArray(source.reviewers)
    ? source.reviewers
      .map((item) => cleanText(item, '', 240))
      .filter(Boolean)
      .slice(0, 50)
    : [];

  return {
    methodology: cleanLocalized(source.methodology, DEFAULT_CONTENT_GOVERNANCE.methodology),
    reviewPolicy: cleanLocalized(source.reviewPolicy, DEFAULT_CONTENT_GOVERNANCE.reviewPolicy),
    sourcePolicy: cleanLocalized(source.sourcePolicy, DEFAULT_CONTENT_GOVERNANCE.sourcePolicy),
    reviewers,
    responseSlaHours: Number.isFinite(responseSlaHours)
      ? Math.min(Math.max(Math.trunc(responseSlaHours), 1), 720)
      : DEFAULT_CONTENT_GOVERNANCE.responseSlaHours,
    inquiryRetentionDays: Number.isFinite(inquiryRetentionDays)
      ? Math.min(Math.max(Math.trunc(inquiryRetentionDays), 1), 730)
      : DEFAULT_CONTENT_GOVERNANCE.inquiryRetentionDays,
    checklist: {
      source: bool(checklist.source, DEFAULT_CONTENT_GOVERNANCE.checklist.source),
      citation: bool(checklist.citation, DEFAULT_CONTENT_GOVERNANCE.checklist.citation),
      scholarlyReview: bool(checklist.scholarlyReview, DEFAULT_CONTENT_GOVERNANCE.checklist.scholarlyReview),
      languageReview: bool(checklist.languageReview, DEFAULT_CONTENT_GOVERNANCE.checklist.languageReview),
      limitations: bool(checklist.limitations, DEFAULT_CONTENT_GOVERNANCE.checklist.limitations),
      errorReports: bool(checklist.errorReports, DEFAULT_CONTENT_GOVERNANCE.checklist.errorReports),
    },
  };
}

export function governanceText(value: GovernanceLocalized, lang: 'ar' | 'en'): string {
  // لا نسرّب العربية إلى واجهة English؛ النص غير المترجم يبقى مخفيًا حتى
  // يراجعه المحرر ويضيف النسخة المطلوبة.
  return value[lang] || '';
}
