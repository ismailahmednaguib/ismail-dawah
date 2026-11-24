export type ContentReportStatus = 'new' | 'triaged' | 'resolved' | 'ignored';

export type ContentReportInput = {
  pageUrl: string;
  pageTitle: string;
  description: string;
  email: string | null;
  lang: 'ar' | 'en';
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, maxLength)
    : '';
}

function normalizeInternalReportPath(value: unknown): string {
  const path = cleanText(value, 1_000);
  if (!path || !path.startsWith('/') || path.startsWith('//') || /[\u0000-\u001F\u007F#]/.test(path)) return '';
  try {
    const parsed = new URL(path, 'https://internal.invalid');
    if (parsed.origin !== 'https://internal.invalid' || parsed.hash) return '';
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return '';
  }
}

export function normalizeContentReportInput(value: unknown):
  | { ok: true; value: ContentReportInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'بيانات البلاغ غير صالحة.' };
  }

  const body = value as Record<string, unknown>;
  const pageUrl = normalizeInternalReportPath(body.page_url);
  const pageTitle = cleanText(body.page_title, 240);
  const description = cleanText(body.description, 2_000);
  const rawEmail = cleanText(body.email, 254);
  const lang = body.lang === 'en' ? 'en' : 'ar';

  if (!pageUrl || !/^\/(?:ar|en)(?:\/|$)/.test(pageUrl)) {
    return { ok: false, error: 'رابط الصفحة غير صالح.' };
  }
  if (!pageTitle) return { ok: false, error: 'عنوان الصفحة مطلوب.' };
  if (description.length < 10) return { ok: false, error: 'اكتب وصفًا من 10 أحرف على الأقل.' };
  if (rawEmail && !EMAIL_RE.test(rawEmail)) return { ok: false, error: 'البريد الإلكتروني غير صحيح.' };

  return {
    ok: true,
    value: {
      pageUrl,
      pageTitle,
      description,
      email: rawEmail || null,
      lang,
    },
  };
}

export function normalizeContentReportStatus(value: unknown): ContentReportStatus {
  return value === 'triaged' || value === 'resolved' || value === 'ignored' ? value : 'new';
}
