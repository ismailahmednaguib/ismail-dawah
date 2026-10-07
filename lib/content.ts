import { createClient } from "@supabase/supabase-js";
import {
  settings, fields, stats, lessons, videos, articles, books, audio, photos,
  schedule, fatwas, projects, news, places, adhkar, doubts, learnSteps,
} from "./data";
import type {
  Settings, Field, Stat, Lesson, Video, Article, Book, AudioItem, Photo,
  ScheduleItem, Fatwa, Project, NewsItem, Place, Dhikr, Doubt, LearnStep,
} from "./data";

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
  doubts: Doubt[];
  learnSteps: LearnStep[];
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
  doubts,
  learnSteps,
  fieldTranslations: {},
};

export async function getContent(): Promise<Content> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (url && serviceKey) {
    try {
      const supabase = createClient(url, serviceKey);
      const { data, error } = await supabase
        .from("site_content")
        .select("data")
        .eq("id", 1)
        .maybeSingle();

      if (!error && data?.data) {
        const saved = data.data as Partial<Content>;
        return {
          ...defaultContent,
          ...saved,
          settings: { ...defaultContent.settings, ...saved.settings },
          fieldTranslations: saved.fieldTranslations || {},
        };
      }
    } catch (e) {
      console.error("getContent error:", e);
    }
  }

  return defaultContent;
}