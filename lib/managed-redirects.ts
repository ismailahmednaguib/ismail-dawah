/**
 * Safe, owner-managed internal redirects.
 *
 * Redirects live in the shared site settings, but this module deliberately
 * accepts internal paths only. External destinations and redirect loops are
 * rejected before anything can reach middleware or the public site.
 */

export const MAX_MANAGED_REDIRECTS = 100;

export type ManagedRedirect = {
  source: string;
  destination: string;
  statusCode: 301;
  enabled: boolean;
};

export type ManagedRedirectValidation = {
  redirects: ManagedRedirect[];
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Normalize a path while rejecting absolute/external URLs and fragments. */
export function normalizeInternalPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw || raw.length > 1_000 || !raw.startsWith('/') || raw.startsWith('//')) return null;
  if (/[\u0000-\u001f\u007f#]/.test(raw)) return null;

  try {
    const parsed = new URL(raw, 'https://internal.invalid');
    if (parsed.origin !== 'https://internal.invalid' || parsed.hash) return null;
    const path = `${parsed.pathname}${parsed.search}`;
    return path === '/' ? path : path.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function normalizeRow(value: unknown): ManagedRedirect | null {
  if (!isRecord(value)) return null;
  const source = normalizeInternalPath(value.source);
  const destination = normalizeInternalPath(value.destination);
  if (!source || !destination) return null;

  return {
    source,
    destination,
    statusCode: 301,
    enabled: value.enabled !== false,
  };
}

function sourcePath(value: string): string {
  try {
    return new URL(value, 'https://internal.invalid').pathname;
  } catch {
    return value.split('?')[0] || '/';
  }
}

/**
 * Normalize, de-duplicate, and reject loops. Invalid rows are reported so an
 * admin save can show an actionable message instead of silently losing data.
 */
export function validateManagedRedirects(value: unknown): ManagedRedirectValidation {
  const raw = Array.isArray(value) ? value : [];
  const redirects: ManagedRedirect[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < Math.min(raw.length, MAX_MANAGED_REDIRECTS); index += 1) {
    const row = raw[index];
    const normalized = normalizeRow(row);
    if (!normalized) {
      errors.push(`التحويل رقم ${index + 1} يحتوي مسارًا داخليًا غير صالح.`);
      continue;
    }
    if (normalized.source === normalized.destination) {
      errors.push(`التحويل رقم ${index + 1} يحوّل الرابط إلى نفسه.`);
      continue;
    }
    if (seen.has(normalized.source)) {
      errors.push(`الرابط المصدر مكرر: ${normalized.source}`);
      continue;
    }
    seen.add(normalized.source);
    redirects.push(normalized);
  }

  if (raw.length > MAX_MANAGED_REDIRECTS) {
    errors.push(`لا يمكن حفظ أكثر من ${MAX_MANAGED_REDIRECTS} تحويلًا.`);
  }

  const destinations = new Map(redirects.map((redirect) => [sourcePath(redirect.source), redirect.destination]));
  for (const redirect of redirects) {
    const visited = new Set<string>([sourcePath(redirect.source)]);
    let next = sourcePath(redirect.destination);
    while (destinations.has(next)) {
      if (visited.has(next)) {
        errors.push(`يوجد مسار تحويل دائري يبدأ من ${redirect.source}.`);
        break;
      }
      visited.add(next);
      next = sourcePath(destinations.get(next) || next);
    }
  }

  return { redirects, errors: [...new Set(errors)] };
}

export function normalizeManagedRedirects(value: unknown): ManagedRedirect[] {
  return validateManagedRedirects(value).redirects;
}

/**
 * Resolve an incoming URL path. A source without a query matches any query
 * and preserves it when the destination does not define its own query.
 */
export function resolveManagedRedirect(
  requestPath: string,
  value: unknown
): ManagedRedirect | null {
  const incoming = normalizeInternalPath(requestPath);
  if (!incoming) return null;

  const incomingUrl = new URL(incoming, 'https://internal.invalid');
  const redirects = normalizeManagedRedirects(value);
  for (const redirect of redirects) {
    if (!redirect.enabled) continue;
    const sourceUrl = new URL(redirect.source, 'https://internal.invalid');
    const exact = Boolean(sourceUrl.search);
    if (exact ? incoming !== redirect.source : sourceUrl.pathname !== incomingUrl.pathname) continue;

    let destination = redirect.destination;
    const destinationUrl = new URL(destination, 'https://internal.invalid');
    if (!destinationUrl.search && incomingUrl.search) {
      destination += incomingUrl.search;
    }

    return { ...redirect, destination };
  }

  return null;
}
