import { settings, stats, lessons, videos, schedule, articles, audio, photos } from "./data";
import type { Settings, Stat, Lesson, Video, ScheduleItem, Article, AudioItem, Photo } from "./data";

export interface Content {
  settings: Settings;
  stats: Stat[];
  lessons: Lesson[];
  videos: Video[];
  schedule: ScheduleItem[];
  articles: Article[];
  audio: AudioItem[];
  photos: Photo[];
}

export const defaultContent: Content = { settings, stats, lessons, videos, schedule, articles, audio, photos };

export async function getContent(): Promise<Content> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return defaultContent;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return defaultContent;
    const saved = data.data as Partial<Content>;
    return {
      settings: { ...defaultContent.settings, ...(saved.settings || {}) },
      stats: saved.stats ?? defaultContent.stats,
      lessons: saved.lessons ?? defaultContent.lessons,
      videos: saved.videos ?? defaultContent.videos,
      schedule: saved.schedule ?? defaultContent.schedule,
      articles: saved.articles ?? defaultContent.articles,
      audio: saved.audio ?? defaultContent.audio,
      photos: saved.photos ?? defaultContent.photos,
    };
  } catch {
    return defaultContent;
  }
}