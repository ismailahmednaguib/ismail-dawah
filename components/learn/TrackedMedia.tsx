'use client';

import { useEffect, useRef, useState } from 'react';

type MediaKind = 'audio' | 'video';

interface TrackedMediaProps {
  contentId: string;
  kind: MediaKind;
  src: string;
  lang: 'ar' | 'en';
}

type ProgressResponse = {
  progress?: {
    last_position_seconds: number;
    completed_at: string | null;
  } | null;
};

const SAVE_INTERVAL_SECONDS = 8;

export default function TrackedMedia({
  contentId,
  kind,
  src,
  lang,
}: TrackedMediaProps) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const lastSavedAt = useRef(0);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resumeAt, setResumeAt] = useState(0);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [resumeReady, setResumeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/learn/progress?content_id=${encodeURIComponent(contentId)}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (response.status === 401) {
          if (!cancelled) setRequiresLogin(true);
          return null;
        }
        if (!response.ok) throw new Error('progress_fetch_failed');
        return (await response.json()) as ProgressResponse;
      })
      .then((payload) => {
        if (!cancelled) setResumeAt(Math.max(0, payload?.progress?.last_position_seconds ?? 0));
      })
      .catch(() => {
        // The media remains playable if progress is temporarily unavailable.
      })
      .finally(() => {
        if (!cancelled) setResumeReady(true);
      });

    return () => {
      cancelled = true;
      if (pendingSave.current) clearTimeout(pendingSave.current);
    };
  }, [contentId]);

  useEffect(() => {
    if (!resumeReady || !mediaRef.current || resumeAt <= 0) return;

    const media = mediaRef.current;
    const applyResume = () => {
      if (Number.isFinite(media.duration) && resumeAt < media.duration - 2) {
        media.currentTime = resumeAt;
      }
      media.removeEventListener('loadedmetadata', applyResume);
    };

    if (media.readyState >= 1) applyResume();
    else media.addEventListener('loadedmetadata', applyResume);

    return () => media.removeEventListener('loadedmetadata', applyResume);
  }, [resumeAt, resumeReady]);

  async function saveProgress(positionSeconds: number, completed = false) {
    if (requiresLogin || !Number.isFinite(positionSeconds)) return;

    try {
      const response = await fetch('/api/learn/progress', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          position_seconds: Math.max(0, Math.floor(positionSeconds)),
          completed,
        }),
      });

      if (response.status === 401) setRequiresLogin(true);
    } catch {
      // Playback should never be interrupted by a progress request.
    }
  }

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLMediaElement>) {
    const position = event.currentTarget.currentTime;
    if (position - lastSavedAt.current < SAVE_INTERVAL_SECONDS) return;

    lastSavedAt.current = position;
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(() => {
      void saveProgress(position);
    }, 500);
  }

  const commonProps = {
    controls: true,
    preload: 'metadata' as const,
    src,
    onTimeUpdate: handleTimeUpdate,
    onEnded: (event: React.SyntheticEvent<HTMLMediaElement>) => {
      void saveProgress(event.currentTarget.currentTime, true);
    },
  };

  return (
    <div>
      {kind === 'audio' ? (
        <audio {...commonProps} ref={(node) => { mediaRef.current = node; }} className="w-full" />
      ) : (
        <video {...commonProps} ref={(node) => { mediaRef.current = node; }} className="w-full rounded-xl" />
      )}
      {resumeReady && resumeAt > 0 && !requiresLogin && (
        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {lang === 'ar'
            ? `سيُستأنف من موضعك السابق (${Math.floor(resumeAt / 60)}:${String(Math.floor(resumeAt % 60)).padStart(2, '0')})`
            : `Resuming from your previous position (${Math.floor(resumeAt / 60)}:${String(Math.floor(resumeAt % 60)).padStart(2, '0')})`}
        </p>
      )}
    </div>
  );
}
