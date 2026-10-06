import { settings, fields, stats, lessons, videos, articles, books, audio, photos, schedule, fatwas, projects, news, places, adhkar } from "./data";
import type { Settings, Field, Stat, Lesson, Video, Article, Book, AudioItem, Photo, ScheduleItem, Fatwa, Project, NewsItem, Place, Dhikr } from "./data";

export interface Content {
  settings: Settings;
  fields: Field[];
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
  stats: Stat[];
  fieldTranslations?: Record<string, Record<string, { name: string; desc: string }>>;
}

export const defaultContent: Content = {
  settings,
  fields,
  lessons,
  videos,
  articles,
  books,
  audio,
  photos,
  schedule,
  fatwas,
  projects,
  news,
  places,
  adhkar,
  stats,
  fieldTranslations: {},
};

export async function getContent(): Promise<Content> {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    const j = await r.json();
    if (j?.content) {
      // دمج البيانات من Supabase مع defaultContent
      return { 
        ...defaultContent, 
        ...j.content,
        settings: { ...defaultContent.settings, ...j.content.settings },
      };
    }
    return defaultContent;
  } catch {
    return defaultContent;
  }
}