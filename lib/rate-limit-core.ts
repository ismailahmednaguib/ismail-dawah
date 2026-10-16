// lib/rate-limit-core.ts
// ============================================================================
// منطق حدّ المعدّل النقي (بلا اعتماديات) — قابل للاختبار وحده.
//
// تُستعمل هذه الوحدة في:
//   • lib/rate-limit.ts  → الطبقة الخادمية (مخزن مشترك + احتياطي في الذاكرة).
//   • tests/*.test.ts    → اختبارات الوحدة (Node test runner المدمج).
// ============================================================================

export type RateDecision = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

export type RateLimitScope =
  | 'admin-login'
  | 'login'
  | 'register'
  | 'questions'
  | 'newsletter'
  | 'analytics'
  | 'verify'
  | 'upload';

export type ScopeConfig = { windowSeconds: number; max: number };

/** الحدود الافتراضية لكل نطاق. تُقرأ من اللوحة وتُعدَّل في `site_settings`. */
export const RATE_LIMIT_DEFAULTS: Record<RateLimitScope, ScopeConfig> = {
  'admin-login': { windowSeconds: 600, max: 10 },
  login: { windowSeconds: 600, max: 20 },
  register: { windowSeconds: 3600, max: 10 },
  questions: { windowSeconds: 3600, max: 10 },
  newsletter: { windowSeconds: 600, max: 20 },
  analytics: { windowSeconds: 60, max: 120 },
  verify: { windowSeconds: 3600, max: 20 },
  upload: { windowSeconds: 3600, max: 30 },
};

export const RATE_LIMIT_SCOPES = Object.keys(
  RATE_LIMIT_DEFAULTS
) as RateLimitScope[];

/** مفتاح التخزين في `site_settings`. */
export const RATE_LIMIT_SETTING_KEY = 'rate_limits';

const MAX_WINDOW_SECONDS = 86_400 * 30;
const MAX_REQUESTS = 100_000;

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  return i > 0 ? i : null;
}

/**
 * يدمج إعدادًا مخزَّنًا (غير موثوق) مع الحدود الافتراضية.
 * أي قيمة تالفة تُتجاهَل ولا تُسقط الإعداد كله.
 */
export function normalizeRateLimitConfig(
  raw: unknown
): Record<RateLimitScope, ScopeConfig> {
  const out = {} as Record<RateLimitScope, ScopeConfig>;

  for (const scope of RATE_LIMIT_SCOPES) {
    out[scope] = { ...RATE_LIMIT_DEFAULTS[scope] };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;

  const source = raw as Record<string, unknown>;

  for (const scope of RATE_LIMIT_SCOPES) {
    const entry = source[scope];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;

    const cfg = entry as Record<string, unknown>;

    const max = toPositiveInt(cfg.max);
    if (max !== null && max <= MAX_REQUESTS) out[scope].max = max;

    const windowSeconds = toPositiveInt(cfg.windowSeconds);
    if (windowSeconds !== null && windowSeconds <= MAX_WINDOW_SECONDS) {
      out[scope].windowSeconds = windowSeconds;
    }
  }

  return out;
}

/** مفتاح موحّد لمخزن الحدود. */
export function rateLimitKey(scope: RateLimitScope, identity: string): string {
  const id = (identity || 'unknown').trim().toLowerCase().slice(0, 190);
  return `${scope}:${id}`;
}

/**
 * يستخرج عنوان IP للعميل من الترويسات، بترتيب الثقة المعتاد خلف الوسائط.
 * يقبل دالة قراءة ترويسة ليبقى مستقلًّا عن Next.js.
 */
export function clientIpFromHeaders(
  getHeader: (name: string) => string | null | undefined
): string {
  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return (
    getHeader('x-real-ip') ||
    getHeader('cf-connecting-ip') ||
    getHeader('x-vercel-forwarded-for') ||
    'unknown'
  );
}

type Bucket = { count: number; resetAt: number };

/**
 * محدد معدّل في الذاكرة — يُستعمل احتياطيًّا إن تعذّر المخزن المشترك،
 * أو محليًّا في التطوير. آمن مع نسخة واحدة فقط (وهذا مقصود).
 */
export class MemoryRateLimiter {
  private readonly now: () => number;

  private store = new Map<string, Bucket>();

  constructor(now?: () => number) {
    this.now = now ?? Date.now;
  }

  consume(key: string, windowSeconds: number, max: number): RateDecision {
    const nowMs = this.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= nowMs) {
      this.store.set(key, { count: 1, resetAt: nowMs + windowSeconds * 1000 });
      return { allowed: true, remaining: Math.max(max - 1, 0), retryAfter: 0 };
    }

    existing.count += 1;

    if (existing.count > max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(Math.ceil((existing.resetAt - nowMs) / 1000), 1),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(max - existing.count, 0),
      retryAfter: 0,
    };
  }

  size(): number {
    return this.store.size;
  }

  /** يحذف السطور المنتهية لتفريغ الذاكرة. */
  sweep(): number {
    const nowMs = this.now();
    let removed = 0;
    for (const [key, bucket] of this.store.entries()) {
      if (bucket.resetAt <= nowMs) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }
}
