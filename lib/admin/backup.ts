// lib/admin/backup.ts
// ============================================================================
// النسخ الاحتياطي: جمع المحتوى والإعدادات، رفعه إلى حاوية خاصة، وتطبيق الاحتفاظ.
// Server-only: يستخدم مفتاح الخدمة ولا يُستورد في أي مكوّن عميلي.
// ============================================================================

import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  BACKUP_SETTING_KEY,
  DEFAULT_BACKUP_BUCKET,
  DEFAULT_BACKUP_CONFIG,
  buildBackupPath,
  normalizeBackupConfig,
  selectExpiredBackupNames,
  type BackupConfig,
} from '@/lib/backup-config';

export const BACKUP_CONTENT_TABLES: Record<string, string> = {
  content: '*',
  content_translations: '*',
  taxonomies: '*',
  content_terms: '*',
  content_references: '*',
  content_media: '*',
  content_revisions: '*',
};

export const BACKUP_SETTINGS_TABLES: Record<string, string> = {
  site_settings: '*',
  newsletter_subscribers: '*',
  dawah_journey_subscribers: '*',
  dawah_request_assignments: '*',
};

export const BACKUP_TABLES = {
  content: BACKUP_CONTENT_TABLES,
  settings: BACKUP_SETTINGS_TABLES,
} as const;

export type BackupScope = 'all' | keyof typeof BACKUP_TABLES;

export type BackupPayload = {
  format: 'ismail-dawah-backup';
  version: 2;
  exportedAt: string;
  exportedBy: string | null;
  scope: BackupScope;
  counts: Record<string, number>;
  skippedTables: string[];
  tables: Record<string, unknown[]>;
};

export type BackupFile = {
  name: string;
  size: number | null;
  createdAt: string | null;
};

const PAGE_SIZE = 1_000;
const MAX_ROWS = 50_000;

const BUCKET = (process.env.BACKUP_BUCKET || DEFAULT_BACKUP_BUCKET).trim();
const AUTO_CREATE_BUCKET = process.env.BACKUP_AUTO_CREATE_BUCKET === 'true';

function isMissingTableError(error: unknown): boolean {
  const message = String((error as { message?: unknown })?.message || '');
  return /does not exist|Could not find the table|schema cache|relation .* does not exist/i.test(
    message
  );
}

async function fetchAll(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  table: string,
  select: string
): Promise<unknown[]> {
  const rows: unknown[] = [];

  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`${table}: ${error.message}`);

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

/** يجمع نطاقًا واحدًا أو النطاقين معًا. الجداول غير المنفَّذة تُسجَّل وتُتجاوز. */
export async function collectBackup(
  scope: BackupScope,
  exportedBy: string | null
): Promise<BackupPayload> {
  const supabase = getSupabaseAdmin();
  const tables: Record<string, string> =
    scope === 'all'
      ? { ...BACKUP_CONTENT_TABLES, ...BACKUP_SETTINGS_TABLES }
      : { ...BACKUP_TABLES[scope] };

  const dump: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  const skippedTables: string[] = [];

  for (const [table, select] of Object.entries(tables)) {
    try {
      const rows = await fetchAll(supabase, table, select);
      dump[table] = rows;
      counts[table] = rows.length;
    } catch (error) {
      if (isMissingTableError(error)) {
        dump[table] = [];
        counts[table] = 0;
        skippedTables.push(table);
        continue;
      }

      throw error;
    }
  }

  return {
    format: 'ismail-dawah-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    exportedBy,
    scope,
    counts,
    skippedTables,
    tables: dump,
  };
}

function unwrapSettingValue(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
    return (value as Record<string, unknown>).value;
  }
  return value;
}

/** يقرأ إعداد النسخ من `site_settings`؛ أي خطأ يعيد الإعداد الافتراضي (معطّل). */
export async function readBackupConfig(): Promise<BackupConfig> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('site_settings')
      .select('value')
      .eq('key', BACKUP_SETTING_KEY)
      .eq('lang', 'all')
      .maybeSingle();

    if (error) return { ...DEFAULT_BACKUP_CONFIG };
    return normalizeBackupConfig(unwrapSettingValue(data?.value));
  } catch {
    return { ...DEFAULT_BACKUP_CONFIG };
  }
}

export async function saveBackupConfig(
  config: unknown
): Promise<{ ok: boolean; config: BackupConfig; error?: string }> {
  const normalized = normalizeBackupConfig(config);

  const { error } = await getSupabaseAdmin().from('site_settings').upsert(
    {
      key: BACKUP_SETTING_KEY,
      lang: 'all',
      value: { value: normalized },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key,lang' }
  );

  if (error) {
    return { ok: false, config: normalized, error: error.message };
  }

  return { ok: true, config: normalized };
}

function isBucketMissingError(error: unknown): boolean {
  const message = String((error as { message?: unknown })?.message || '');
  return /bucket.*(not found|does not exist)|not found/i.test(message);
}

/** ينشئ الحاوية فقط إذا سمح المتغير الصريح؛ وإلا يفترض أن migration أنشأها. */
async function ensureBucketExists(): Promise<void> {
  if (!AUTO_CREATE_BUCKET) return;

  try {
    const { error } = await getSupabaseAdmin()
      .storage.createBucket(BUCKET, { public: false });

    if (error && !/already exists/i.test(error.message)) {
      console.warn('[Backup] createBucket:', error.message);
    }
  } catch (error) {
    console.warn('[Backup] createBucket error:', error);
  }
}

export async function listBackupFiles(): Promise<{
  ready: boolean;
  files: BackupFile[];
  error?: string;
}> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .storage.from(BUCKET)
      .list('daily', {
        limit: 1_000,
        sortBy: { column: 'name', order: 'desc' },
      });

    if (error) {
      return {
        ready: false,
        files: [],
        error: isBucketMissingError(error)
          ? 'حاوية النسخ الاحتياطي غير موجودة. نفّذ migration الخاصة بها أولًا.'
          : error.message,
      };
    }

    const files: BackupFile[] = (data ?? [])
      .filter((file) => /^daily\/.+\.json$/.test(`daily/${file.name}`))
      .map((file) => ({
        name: `daily/${file.name}`,
        size:
          typeof file.metadata?.size === 'number'
            ? file.metadata.size
            : null,
        createdAt: file.created_at ?? file.updated_at ?? null,
      }));

    return { ready: true, files };
  } catch (error) {
    return {
      ready: false,
      files: [],
      error: error instanceof Error ? error.message : 'تعذّر فحص حاوية النسخ.',
    };
  }
}

async function uploadBackup(path: string, json: string): Promise<{ ok: boolean; error?: string }> {
  await ensureBucketExists();

  const bytes = new TextEncoder().encode(json);
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, bytes, {
      contentType: 'application/json; charset=utf-8',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return {
      ok: false,
      error: isBucketMissingError(error)
        ? 'حاوية النسخ الاحتياطي غير موجودة. نفّذ migration الخاصة بها أولًا.'
        : error.message,
    };
  }

  return { ok: true };
}

export type RunBackupResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  path?: string;
  counts?: Record<string, number>;
  skippedTables?: string[];
  pruned?: number;
  retentionDays?: number;
  maxFiles?: number;
  error?: string;
};

/**
 * ينشئ نسخة كاملة، يرفعها، ثم يحذف ما تجاوز سياسة الاحتفاظ.
 * `force` يسمح بالتشغيل اليدوي حتى لو كان الجدول اليومي معطّلًا.
 */
export async function runBackup(options: {
  exportedBy: string | null;
  force?: boolean;
}): Promise<RunBackupResult> {
  const config = await readBackupConfig();

  if (!options.force && !config.enabled) {
    return { ok: true, skipped: true, reason: 'backup_disabled' };
  }

  const payload = await collectBackup('all', options.exportedBy);
  const path = buildBackupPath(new Date(payload.exportedAt));
  const uploaded = await uploadBackup(path, JSON.stringify(payload, null, 2));

  if (!uploaded.ok) {
    return { ok: false, error: uploaded.error || 'تعذّر رفع النسخة الاحتياطية.' };
  }

  const listing = await listBackupFiles();
  let pruned = 0;

  if (listing.ready) {
    const expired = selectExpiredBackupNames(
      listing.files.map((file) => file.name),
      new Date(),
      config.retentionDays,
      config.maxFiles
    );

    if (expired.length > 0) {
      const { error } = await getSupabaseAdmin()
        .storage.from(BUCKET)
        .remove(expired);

      if (error) {
        console.warn('[Backup] retention delete error:', error.message);
      } else {
        pruned = expired.length;
      }
    }
  }

  return {
    ok: true,
    path,
    counts: payload.counts,
    skippedTables: payload.skippedTables,
    pruned,
    retentionDays: config.retentionDays,
    maxFiles: config.maxFiles,
  };
}

/** يفحص وجود الحاوية لعرض الحالة في اللوحة. */
export async function probeBackupStorage(): Promise<{
  ready: boolean;
  bucket: string;
  error?: string;
}> {
  const listing = await listBackupFiles();
  return {
    ready: listing.ready,
    bucket: BUCKET,
    error: listing.error,
  };
}
