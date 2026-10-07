import { createClient } from "@supabase/supabase-js";
import {
  settings as defaultSettings,
  fields as defaultFields,
  stats as defaultStats,
  lessons as defaultLessons,
  videos as defaultVideos,
  articles as defaultArticles,
  books as defaultBooks,
  audio as defaultAudio,
  photos as defaultPhotos,
  schedule as defaultSchedule,
  fatwas as defaultFatwas,
  projects as defaultProjects,
  news as defaultNews,
  places as defaultPlaces,
  adhkar as defaultAdhkar,
  doubts as defaultDoubts,
  learnSteps as defaultLearnSteps,
  type Settings,
  type Field,
  type Stat,
  type Lesson,
  type Video,
  type Article,
  type Book,
  type AudioItem,
  type Photo,
  type ScheduleItem,
  type Fatwa,
  type Project,
  type NewsItem,
  type Place,
  type Dhikr,
  type Doubt,
  type LearnStep,
} from "./data";

export type Content = {
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
  doubts: Doubt[];
  learnSteps: LearnStep[];
  fieldTranslations?: Record<string, Record<string, { name: string; desc: string }>>;
};

export const defaultContent: Content = {
  settings: defaultSettings,
  fields: defaultFields,
  stats: defaultStats,
  lessons: defaultLessons,
  videos: defaultVideos,
  articles: defaultArticles,
  books: defaultBooks,
  audio: defaultAudio,
  photos: defaultPhotos,
  schedule: defaultSchedule,
  fatwas: defaultFatwas,
  projects: defaultProjects,
  news: defaultNews,
  places: defaultPlaces,
  adhkar: defaultAdhkar,
  doubts: defaultDoubts,
  learnSteps: defaultLearnSteps,
  fieldTranslations: {},
};

let cached: Content | null = null;

export async function getContent(): Promise<Content> {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    cached = defaultContent;
    return cached;
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      cached = defaultContent;
      return cached;
    }

    const raw = data.data as Partial<Content>;

    cached = {
      settings: { ...defaultSettings, ...(raw.settings || {}) },
      fields: Array.isArray(raw.fields) && raw.fields.length > 0 ? raw.fields : defaultFields,
      stats: Array.isArray(raw.stats) && raw.stats.length > 0 ? raw.stats : defaultStats,
      lessons: Array.isArray(raw.lessons) ? raw.lessons : defaultLessons,
      videos: Array.isArray(raw.videos) ? raw.videos : defaultVideos,
      articles: Array.isArray(raw.articles) ? raw.articles : defaultArticles,
      books: Array.isArray(raw.books) ? raw.books : defaultBooks,
      audio: Array.isArray(raw.audio) ? raw.audio : defaultAudio,
      photos: Array.isArray(raw.photos) ? raw.photos : defaultPhotos,
      schedule: Array.isArray(raw.schedule) ? raw.schedule : defaultSchedule,
      fatwas: Array.isArray(raw.fatwas) && raw.fatwas.length > 0 ? raw.fatwas : defaultFatwas,
      projects: Array.isArray(raw.projects) && raw.projects.length > 0 ? raw.projects : defaultProjects,
      news: Array.isArray(raw.news) && raw.news.length > 0 ? raw.news : defaultNews,
      places: Array.isArray(raw.places) && raw.places.length > 0 ? raw.places : defaultPlaces,
      adhkar: Array.isArray(raw.adhkar) && raw.adhkar.length > 0 ? raw.adhkar : defaultAdhkar,
      doubts: Array.isArray(raw.doubts) && raw.doubts.length > 0 ? raw.doubts : defaultDoubts,
      learnSteps: Array.isArray(raw.learnSteps) && raw.learnSteps.length > 0 ? raw.learnSteps : defaultLearnSteps,
      fieldTranslations: raw.fieldTranslations || {},
    };

    return cached;
  } catch (e) {
    console.error("getContent error:", e);
    cached = defaultContent;
    return cached;
  }
}

export function resetCache() {
  cached = null;
}