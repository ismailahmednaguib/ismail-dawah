const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'hr',
]);

const BLOCKED_BLOCKS = /<\s*(script|style|iframe|object|embed|form|meta|link|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

/**
 * تنقية HTML الذي يكتبه المحرر قبل عرضه للعامة.
 * نسمح بتنسيق النص فقط، ونزيل السمات والروابط والعناصر القابلة للتنفيذ.
 */
export function sanitizeRichTextHtml(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .slice(0, 200_000)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(BLOCKED_BLOCKS, '')
    .replace(
      /<\s*(\/?)\s*([a-z0-9]+)(?:\s[^>]*)?>/gi,
      (_match, closing: string, rawTag: string) => {
        const tag = rawTag.toLowerCase();
        return ALLOWED_TAGS.has(tag) ? `<${closing ? '/' : ''}${tag}>` : '';
      }
    );
}
