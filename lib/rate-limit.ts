// lib/rate-limit.ts
// ============================================================================
// حدّ المعدّل المشترك — يعمل عبر كل نسخ الخادم.
//
// الطبقة الأولى: دالة `consume_rate_limit` في Postgres (ذرّية، تعمل مع أي عدد
// من النسخ). الطبقة الثانية: محدد في الذاكرة يعمل احتياطيًّا إن تعذّر المخزن
// المشترك أو لم تُنفَّذ migration بعد — فالسلوك لا يتعطّل أبدًا.
//
// الحدود تُقرأ من `site_settings` (المفتاح `rate_limits`) فتتحكّم فيها اللوحة.
// ============================================================================

import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  MemoryRateLimiter,
  RATE_LIMIT_SETTING_KEY,
  clientIpFromHeaders,
  normalizeRateLimitConfig,
  rateLimitKey,
  type RateDecision,
  type RateLimitScope,
  type ScopeConfig,
} from '@/lib/rate-limit-core';

export type { RateDecision, RateLimitScope, ScopeConfig };
export {
  RATE_LIMIT_DEFAULTS,
  RATE_LIMIT_SCOPES,
  RATE_LIMIT_SETTING_KEY,
  normalizeRateLimitConfig,
} from '@/lib/rate-limit-core';

const CONFIG_TTL_MS = 60_000;
const SWEEP_EVERY = 200;

const memory = new MemoryRateLimiter();

let configCache: { at: number; config: Record<RateLimitScope, ScopeConfig> } | null =
  null;
let callCount = 0;

async function loadConfig(): Promise<Record<RateLimitScope, ScopeConfig>> {
  const now = Date.now();
  if (configCache && now - configCache.at < CONFIG_TTL_MS) {
    return configCache.config;
  }

  let config = normalizeRateLimitConfig(null);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('site_settings')
      .select('value')
      .eq('key', RATE_LIMIT_SETTING_KEY)
      .eq('lang', 'all')
      .maybeSingle();

    if (!error && data?.value) config = normalizeRateLimitConfig(data.value);
  } catch {
    // إعداد مفقود أو جدول غير متاح → الحدود الافتراضية
  }

  configCache = { at: now, config };
  return config;
}

/** يُصفّر الذاكرة المؤقتة للإعدادات (يُستدعى بعد تعديلها من اللوحة). */
export function invalidateRateLimitConfigCache(): void {
  configCache = null;
}

function scheduleSharedSweep(): void {
  callCount += 1;
  if (callCount % SWEEP_EVERY !== 0) return;

  void (async () => {
    try {
      await getSupabaseAdmin().rpc('sweep_rate_limits');
    } catch {
      // لا يهم: التنظيف تحسين لا وظيفة
    }
  })();
}

async function consumeShared(
  key: string,
  config: ScopeConfig
): Promise<RateDecision | null> {
  try {
    const { data, error } = await getSupabaseAdmin().rpc('consume_rate_limit', {
      p_key: key,
      p_window_seconds: config.windowSeconds,
      p_max: config.max,
    });

    if (error) return null;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== 'boolean') return null;

    return {
      allowed: row.allowed,
      remaining: Number(row.remaining ?? 0),
      retryAfter: Number(row.retry_after ?? 0),
    };
  } catch {
    return null;
  }
}

export type RateLimitCheck = {
  decision: RateDecision;
  source: 'shared' | 'memory';
  headers: Record<string, string>;
};

/**
 * يفحص الطلب مقابل نطاق محدّد.
 *
 * - `identities`: معرّفات إضافية تُحسب عليها الحدود (مثل البريد الإلكتروني).
 * - عند تجاوز أي معرّف تُرفض كل المحاولة ويُعاد أكبر وقت انتظار.
 */
export async function checkRateLimit(
  req: Request,
  scope: RateLimitScope,
  identities: string[] = []
): Promise<RateLimitCheck> {
  const config = await loadConfig();
  const scopeConfig = config[scope];

  const ids = [clientIpFromHeaders((n) => req.headers.get(n)), ...identities].filter(
    (id): id is string => typeof id === 'string' && id.length > 0
  );

  let source: 'shared' | 'memory' = 'shared';
  let allowed = true;
  let minRemaining = scopeConfig.max;
  let retryAfter = 0;

  for (const id of ids) {
    const key = rateLimitKey(scope, id);

    let decision = await consumeShared(key, scopeConfig);

    if (!decision) {
      source = 'memory';
      decision = memory.consume(key, scopeConfig.windowSeconds, scopeConfig.max);
    }

    minRemaining = Math.min(minRemaining, decision.remaining);

    if (!decision.allowed) {
      allowed = false;
      retryAfter = Math.max(retryAfter, decision.retryAfter);
    }
  }

  scheduleSharedSweep();

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(scopeConfig.max),
    'X-RateLimit-Remaining': String(Math.max(minRemaining, 0)),
  };

  if (!allowed) {
    headers['Retry-After'] = String(retryAfter || scopeConfig.windowSeconds);
  }

  return {
    decision: { allowed, remaining: Math.max(minRemaining, 0), retryAfter },
    source,
    headers,
  };
}

/**
 * غلاف مختصر: يعيد استجابة ٤٢٩ جاهزة عند التجاوز، أو null للمتابعة.
 * الاستجابة تحمل ترويسات الحدود دائمًا كي تُظهرها الواجهة.
 */
export async function rateLimitGuard(
  req: Request,
  scope: RateLimitScope,
  options: {
    identities?: string[];
    message?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<Response | null> {
  const check = await checkRateLimit(req, scope, options.identities ?? []);

  if (check.decision.allowed) return null;

  const res = new Response(
    JSON.stringify({
      ok: false,
      error: options.message ?? 'عدد المحاولات كثير جدًا. حاول لاحقًا.',
      retryAfter: check.decision.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        ...options.headers,
        ...check.headers,
      },
    }
  );

  return res;
}
