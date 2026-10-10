// app/[lang]/quran/[id]/SurahPlayer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Ayah = {
  number: number;
  numberInSurah: number;
  audioUrl: string;
  text: string;
};

type UILang = {
  playAll: string;
  pause: string;
  resume: string;
  previous: string;
  next: string;
  repeat: string;
  repeatAll: string;
  repeatNone: string;
  speed: string;
  currentAyah: string;
  of: string;
  nowPlaying: string;
  download: string;
  downloading: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    playAll: "تشغيل السورة",
    pause: "إيقاف مؤقت",
    resume: "متابعة",
    previous: "السابقة",
    next: "التالية",
    repeat: "تكرار",
    repeatAll: "تكرار الكل",
    repeatNone: "بدون تكرار",
    speed: "السرعة",
    currentAyah: "الآية الحالية",
    of: "من",
    nowPlaying: "قيد التشغيل",
    download: "تحميل السورة",
    downloading: "جاري التحميل...",
  },
  en: {
    playAll: "Play Surah",
    pause: "Pause",
    resume: "Resume",
    previous: "Previous",
    next: "Next",
    repeat: "Repeat",
    repeatAll: "Repeat All",
    repeatNone: "No Repeat",
    speed: "Speed",
    currentAyah: "Current Ayah",
    of: "of",
    nowPlaying: "Now Playing",
    download: "Download Surah",
    downloading: "Downloading...",
  },
};

export default function SurahPlayer({
  ayahs,
  lang,
  surahName,
  reciterName,
}: {
  ayahs: Ayah[];
  lang: Lang;
  surahName: string;
  reciterName: string;
}) {
  const ui = UI[lang];
  const isRTL = lang === "ar";
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [isDownloading, setIsDownloading] = useState(false);

  const currentAyah = ayahs[currentIndex];

  // ===== تشغيل/إيقاف =====
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  // ===== التالي/السابق =====
  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= ayahs.length - 1) {
        if (repeatMode === "all") return 0;
        return prev;
      }
      return prev + 1;
    });
  }, [ayahs.length, repeatMode]);

  const playPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        if (repeatMode === "all") return ayahs.length - 1;
        return 0;
      }
      return prev - 1;
    });
  }, [ayahs.length, repeatMode]);

  // ===== عند انتهاء الآية =====
  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      audioRef.current?.play();
    } else {
      playNext();
    }
  }, [repeatMode, playNext]);

  // ===== تغيير الآية =====
  useEffect(() => {
    if (!audioRef.current || !currentAyah) return;
    audioRef.current.src = currentAyah.audioUrl;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    // Scroll للآية الحالية
    const el = document.getElementById(`ayah-${currentAyah.numberInSurah}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary-500", "ring-offset-2");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary-500", "ring-offset-2");
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ===== تغيير السرعة =====
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // ===== تنسيق الوقت =====
  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ===== تحميل السورة كاملة =====
  const downloadSurah = async () => {
    setIsDownloading(true);
    try {
      // تحميل أول 5 آيات كعينة (لتجنب استهلاك bandwidth كبير)
      for (let i = 0; i < Math.min(5, ayahs.length); i++) {
        const res = await fetch(ayahs[i].audioUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${surahName}-${i + 1}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch {
      // تجاهل
    } finally {
      setIsDownloading(false);
    }
  };

  const repeatModeIcon =
    repeatMode === "none" ? "🔁" : repeatMode === "one" ? "🔂" : "🔁";
  const repeatModeLabel =
    repeatMode === "none"
      ? ui.repeatNone
      : repeatMode === "one"
      ? ui.repeat
      : ui.repeatAll;

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "none") return "all";
      if (prev === "all") return "one";
      return "none";
    });
  };

  const cycleSpeed = () => {
    setPlaybackRate((prev) => {
      if (prev === 0.75) return 1;
      if (prev === 1) return 1.25;
      if (prev === 1.25) return 1.5;
      if (prev === 1.5) return 2;
      return 0.75;
    });
  };

  return (
    <div className="card sticky top-20 z-40 mb-8 overflow-hidden border-2 border-primary-300 bg-white shadow-2xl dark:border-primary-800 dark:bg-night-900">
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setIsPlaying(false)}
      />

      <div className="gradient-primary h-1.5 w-full" />

      <div className="p-5 md:p-6">
        {/* معلومات التشغيل */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400">
              🎵 {ui.nowPlaying}
            </p>
            <p
              className="truncate text-lg font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {surahName} — {isRTL ? "آية" : "Ayah"}{" "}
              {currentAyah?.numberInSurah ?? 0}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {reciterName}
            </p>
          </div>

          <button
            onClick={downloadSurah}
            disabled={isDownloading}
            className="shrink-0 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition-all hover:bg-primary-100 disabled:opacity-50 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-300"
            aria-label={ui.download}
          >
            {isDownloading ? "⏳" : "⬇️"}
          </button>
        </div>

        {/* شريط التقدم */}
        <div className="mb-4">
          <div className="relative h-2 w-full cursor-pointer rounded-full bg-slate-200 dark:bg-night-700">
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Seek"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>
              {ui.currentAyah}: {currentIndex + 1} {ui.of} {ayahs.length}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={cycleRepeat}
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all hover:bg-slate-100 dark:hover:bg-night-800"
            aria-label={repeatModeLabel}
            title={repeatModeLabel}
          >
            {repeatModeIcon}
          </button>

          <button
            onClick={playPrevious}
            disabled={currentIndex === 0 && repeatMode !== "all"}
            className="flex h-12 w-12 items-center justify-center rounded-full text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-30 dark:text-slate-200 dark:hover:bg-night-800"
            aria-label={ui.previous}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isRTL ? "" : "rotate-180"}
            >
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
            aria-label={isPlaying ? ui.pause : ui.playAll}
          >
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={isRTL ? "rotate-180" : ""}
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={playNext}
            disabled={currentIndex === ayahs.length - 1 && repeatMode !== "all"}
            className="flex h-12 w-12 items-center justify-center rounded-full text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-30 dark:text-slate-200 dark:hover:bg-night-800"
            aria-label={ui.next}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isRTL ? "rotate-180" : ""}
            >
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <button
            onClick={cycleSpeed}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-night-800"
            aria-label={ui.speed}
            title={`${ui.speed}: ${playbackRate}x`}
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}