'use client';

import { useState, type FormEvent } from 'react';
import type { ContentMedia } from '@/lib/types/content';

type MediaType = ContentMedia['type'];

const MEDIA_TYPES: { value: MediaType; label: string; uploadKind: string }[] = [
  { value: 'audio', label: 'صوت', uploadKind: 'audio' },
  { value: 'video', label: 'فيديو', uploadKind: 'video' },
  { value: 'pdf', label: 'ملف PDF', uploadKind: 'doc' },
  { value: 'image', label: 'صورة', uploadKind: 'image' },
];

function mediaLabel(type: MediaType) {
  return MEDIA_TYPES.find((item) => item.value === type)?.label ?? type;
}

export default function ContentMediaEditor({
  contentId,
  initialMedia,
  canEdit,
}: {
  contentId: string;
  initialMedia?: ContentMedia[];
  canEdit: boolean;
}) {
  const [media, setMedia] = useState<ContentMedia[]>(initialMedia ?? []);
  const [type, setType] = useState<MediaType>('audio');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const addMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError('');
    try {
      let finalUrl = url.trim();
      let storagePath: string | undefined;
      let mimeType: string | undefined;
      let sizeBytes: number | undefined;

      if (file) {
        const selected = MEDIA_TYPES.find((item) => item.value === type);
        const form = new FormData();
        form.append('file', file);
        form.append('kind', selected?.uploadKind ?? 'doc');
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadJson = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || !uploadJson.url) {
          throw new Error(uploadJson.error ?? 'فشل رفع الملف');
        }
        finalUrl = uploadJson.url;
        storagePath = uploadJson.path;
        mimeType = uploadJson.mime;
        sizeBytes = uploadJson.size;
      }

      if (!finalUrl) throw new Error('أدخل رابطًا أو اختر ملفًا');

      const response = await fetch(`/api/admin/content/${contentId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          url: finalUrl,
          storage_path: storagePath,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          title,
          alt_text: altText,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? 'فشل حفظ الوسيط');

      setMedia((current) => [...current, json.media]);
      setUrl('');
      setTitle('');
      setAltText('');
      setFile(null);
      const input = document.getElementById(`media-file-${contentId}`) as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الوسيط');
    } finally {
      setSaving(false);
    }
  };

  const removeMedia = async (item: ContentMedia) => {
    if (!canEdit || !item.id || !window.confirm('هل تريد حذف هذا الوسيط؟')) return;
    setRemoving(item.id);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/content/${contentId}/media/${item.id}`,
        { method: 'DELETE' }
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? 'فشل حذف الوسيط');
      setMedia((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حذف الوسيط');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className="card space-y-4">
      <div>
        <h3 className="font-bold text-primary-950">الوسائط</h3>
        <p className="mt-1 text-sm text-primary-700/70">
          أضف صوتًا أو فيديو أو ملفًا أو صورة مرتبطة بالمحتوى.
        </p>
      </div>

      {canEdit && (
        <form onSubmit={addMedia} className="space-y-3 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-primary-950">
              النوع
              <select value={type} onChange={(event) => setType(event.target.value as MediaType)} className="input-islamic mt-1">
                {MEDIA_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-primary-950">
              ملف من الجهاز
              <input
                id={`media-file-${contentId}`}
                type="file"
                accept={type === 'image' ? 'image/*' : type === 'audio' ? 'audio/*' : type === 'pdf' ? 'application/pdf' : 'video/*'}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="input-islamic mt-1 p-2 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-primary-950">
            أو رابط مباشر
            <input value={url} onChange={(event) => setUrl(event.target.value)} dir="ltr" placeholder="https://..." className="input-islamic mt-1 text-left" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-primary-950">
              العنوان
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-islamic mt-1" />
            </label>
            <label className="text-sm font-medium text-primary-950">
              وصف الصورة البديل
              <input value={altText} onChange={(event) => setAltText(event.target.value)} className="input-islamic mt-1" />
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'جارٍ الحفظ...' : 'إضافة الوسيط'}
          </button>
        </form>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {media.length === 0 ? (
        <p className="text-sm text-primary-700/60">لا توجد وسائط مرتبطة بهذا المحتوى.</p>
      ) : (
        <ul className="space-y-2">
          {media.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-primary-100 p-3 text-sm">
              <span className="badge-primary">{mediaLabel(item.type)}</span>
              <span className="min-w-0 flex-1 truncate text-primary-900">{item.title || item.url}</span>
              {canEdit && (
                <button type="button" onClick={() => removeMedia(item)} disabled={removing === item.id} className="text-xs text-red-700 hover:underline">
                  {removing === item.id ? 'جارٍ الحذف...' : 'حذف'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
