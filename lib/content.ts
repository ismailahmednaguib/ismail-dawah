import { settings, fields, stats, lessons, videos, articles, books, audio, photos, schedule, fatwas, projects, news, places, adhkar } from "./data";
import type { Settings, Field, Stat, Lesson, Video, Article, Book, AudioItem, Photo, ScheduleItem, Fatwa, Project, NewsItem, Place, Dhikr } from "./data";

export interface Content {
  settings: Settings;
  fields: Field[];
  stats: Stat[];
  lessons: Lesson[];
  videos: Video[];
  articles: Article[];
  books: Book[];
  audio: AudioItem[];
  photos: Photo[];
  schedule: ScheduleItem[];
  fatwas: Fatwa[];
  projects: Project[];
  news: NewsItem[];
  places: Place[];
  adhkar: Dhikr[];
}

export const defaultContent: Content = { settings, fields, stats, lessons, videos, articles, books, audio, photos, schedule, fatwas, projects, news, places, adhkar };

export async function getContent(): Promise<Content> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return defaultContent;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("site_content").select("data").eq("id", 1).maybeSingle();
    if (error || !data) return defaultContent;
    const saved = data.data as Partial<Content>;
    return {
      settings: { ...defaultContent.settings, ...(saved.settings || {}) },
      fields: saved.fields ?? defaultContent.fields,
      stats: saved.stats ?? defaultContent.stats,
      lessons: saved.lessons ?? defaultContent.lessons,
      videos: saved.videos ?? defaultContent.videos,
      articles: saved.articles ?? defaultContent.articles,
      books: saved.books ?? defaultContent.books,
      audio: saved.audio ?? defaultContent.audio,
      photos: saved.photos ?? defaultContent.photos,
      schedule: saved.schedule ?? defaultContent.schedule,
      fatwas: saved.fatwas ?? defaultContent.fatwas,
      projects: saved.projects ?? defaultContent.projects,
      news: saved.news ?? defaultContent.news,
      places: saved.places ?? defaultContent.places,
      adhkar: saved.adhkar ?? defaultContent.adhkar,
    };
  } catch {
    return defaultContent;
  }
}