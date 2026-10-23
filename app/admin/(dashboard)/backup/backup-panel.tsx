"use client";

// app/admin/(dashboard)/backup/backup-panel.tsx
// إعداد النسخة اليومية + تشغيل يدوي + عرض آخر النسخ.

import { useCallback, useEffect, useState } from "react";

type BackupConfig = {
  enabled: boolean;
  retentionDays: number;
  maxFiles: number;
};

type BackupFile = {
  name: string;
  size: number | null;
  createdAt: string | null;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  config?: BackupConfig;
  bucket?: string;
  storageReady?: boolean;
  storageError?: string | null;
  files?: BackupFile[];
  latest?: BackupFile | null;
};

type RunResponse = {
  ok?: boolean;
  error?: string;
  path?: string;
  counts?: Record<string, number>;
  skippedTables?: string[];
  pruned?: number;
  retentionDays?: number;
  maxFiles?: number;
};

function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value < 1_024) return `${value} B`;
  if (value < 1_024 * 1_024) return `${(value / 1_024).toFixed(1)} KB`;
  return `${(value / (1_024 * 1_024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

export default function BackupPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [config, setConfig] = useState<BackupConfig>({
    enabled: false,
    retentionDays: 14,
    maxFiles: 30,
  });
  const [bucket, setBucket] = useState("backups");
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/backup", { cache: "no-store" });
      const data: ApiResponse = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "تعذّر تحميل حالة النسخ الاحتياطي");
      }

      if (data.config) setConfig(data.config);
      setBucket(data.bucket || "backups");
      setStorageReady(Boolean(data.storageReady));
      setStorageError(data.storageError ?? null);
      setFiles(data.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data: ApiResponse = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "تعذّر الحفظ");
      }

      if (data.config) setConfig(data.config);
      setMessage("تم حفظ إعداد النسخ الاحتياطي.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  async function runNow() {
    setRunning(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/backup/run", { method: "POST" });
      const data: RunResponse = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "تعذّر إنشاء النسخة");
      }

      const total = Object.values(data.counts ?? {}).reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0
      );
      const skipped = data.skippedTables?.length
        ? ` · جداول متجاوزة: ${data.skippedTables.join(" · ")}`
        : "";

      setMessage(
        `تم إنشاء النسخة (${total} صفًا)${skipped}${
          data.pruned ? ` · حُذفت ${data.pruned} نسخة قديمة` : ""
        }.`
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setRunning(false);
    }
  }

  const totalSize = files.reduce((sum, file) => sum + (file.size ?? 0), 0);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4 dark:border-white/10">
        <div>
          <h2 className="text-base font-bold">النسخ التلقائي إلى التخزين</h2>
          <p className="mt-1 text-xs opacity-70">
            نسخة يومية كاملة إلى حاوية خاصة، مع سياسة احتفاظ. التشغيل اليدوي متاح دائمًا.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            storageReady
              ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
              : "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
          }`}
        >
          {storageReady ? "الحاوية جاهزة" : "الحاوية غير جاهزة"}
        </span>
      </div>

      <div className="space-y-5 p-4">
        {loading ? (
          <p className="text-sm opacity-70">جارٍ تحميل الحالة…</p>
        ) : (
          <>
            {storageError && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                {storageError}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
                <p className="text-xs opacity-70">الحاوية</p>
                <p className="mt-1 font-mono text-sm" dir="ltr">
                  {bucket}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
                <p className="text-xs opacity-70">آخر نسخة</p>
                <p className="mt-1 text-sm font-bold">
                  {formatDate(files[0]?.createdAt ?? null)}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
                <p className="text-xs opacity-70">المعروض من النسخ</p>
                <p className="mt-1 text-sm font-bold">
                  {files.length} · {formatBytes(totalSize)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-start gap-3 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10 md:col-span-3">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      enabled: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-primary-700"
                />
                <span>
                  <span className="block font-bold">تفعيل النسخة اليومية</span>
                  <span className="mt-1 block text-xs leading-6 opacity-70">
                    يستدعي Vercel المسار المحمي مرة يوميًا. التشغيل اليدوي يعمل حتى عند التعطيل.
                  </span>
                </span>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold opacity-70">
                  أيام الاحتفاظ
                </span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.retentionDays}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      retentionDays: Number(event.target.value),
                    }))
                  }
                  className="input-islamic w-full"
                  dir="ltr"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold opacity-70">
                  أقصى عدد نسخ
                </span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.maxFiles}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      maxFiles: Number(event.target.value),
                    }))
                  }
                  className="input-islamic w-full"
                  dir="ltr"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={save}
                disabled={saving || running}
                className="btn-primary disabled:cursor-wait disabled:opacity-70"
              >
                {saving ? "جارٍ الحفظ…" : "حفظ الإعداد"}
              </button>
              <button
                type="button"
                onClick={runNow}
                disabled={running || saving || !storageReady}
                className="btn-outline disabled:cursor-wait disabled:opacity-70"
              >
                {running ? "جارٍ إنشاء النسخة…" : "إنشاء نسخة الآن"}
              </button>
            </div>

            {message && (
              <p className="rounded-xl bg-primary-50 p-3 text-xs leading-6 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100">
                {message}
              </p>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </p>
            )}

            {files.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs opacity-70">
                    <tr>
                      <th className="p-2 text-right">النسخة</th>
                      <th className="p-2 text-right">التاريخ</th>
                      <th className="p-2 text-right">الحجم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.name} className="border-t border-black/5 dark:border-white/10">
                        <td className="p-2 font-mono text-[11px]" dir="ltr">
                          {file.name}
                        </td>
                        <td className="p-2 text-xs">{formatDate(file.createdAt)}</td>
                        <td className="p-2 text-xs">{formatBytes(file.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
