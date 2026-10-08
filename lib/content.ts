// lib/content.ts
// نظام إدارة المحتوى — آمن للبناء (Lazy Client)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ===== عميل Supabase بشكل Lazy =====
let contentClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!contentClient) {
    contentClient = createClient(url, anonKey);
  }
  return contentClient;
}

// Proxy آمن — لا ينهار وقت Build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// ===== أنواع المحتوى =====
export type ContentType =
  | "article"
  | "fatwa"
  | "news"
  | "khutba"
  | "lesson"
  | "doubt"
  | "atheism_response"
  | "youth_issue"
  | "women_fatwa"
  | "prophet_story"
  | "field"
  | "project";

export type ContentStatus = "draft" | "published" | "archived";

export interface ContentBase {
  id: string;
  type: ContentType;
  slug: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
  views: number;
  lang: string;
  translations?: Record<string, string>;
}

// ===== دوال مساعدة =====
export async function getContentByType(
  type: ContentType,
  options: {
    lang?: string;
    status?: ContentStatus;
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
  } = {}
): Promise<ContentBase[]> {
  const { lang = "ar", status = "published", limit = 20, offset = 0, orderBy = "published_at", ascending = false } = options;

  try {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("type", type)
      .eq("lang", lang)
      .eq("status", status)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getContentBySlug(type: ContentType, slug: string, lang = "ar"): Promise<ContentBase | null> {
  try {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("type", type)
      .eq("slug", slug)
      .eq("lang", lang)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getContentById(id: string): Promise<ContentBase | null> {
  try {
    const { data, error } = await supabase.from("content").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function searchContent(
  query: string,
  options: { type?: ContentType; lang?: string; limit?: number } = {}
): Promise<ContentBase[]> {
  const { type, lang = "ar", limit = 20 } = options;
  try {
    let dbQuery = supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("lang", lang)
      .limit(limit);
    if (type) dbQuery = dbQuery.eq("type", type);
    dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,body.ilike.%${query}%`);
    const { data, error } = await dbQuery;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function createContent(
  content: Omit<ContentBase, "id" | "created_at" | "updated_at" | "views">
): Promise<ContentBase | null> {
  try {
    const { data, error } = await supabase.from("content").insert([content]).select().single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateContent(id: string, updates: Partial<ContentBase>): Promise<ContentBase | null> {
  try {
    const { data, error } = await supabase
      .from("content")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("content").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function getLatestContent(lang = "ar", limit = 6): Promise<ContentBase[]> {
  return getContentByType("article", { lang, limit });
}

export async function getPopularContent(lang = "ar", limit = 6): Promise<ContentBase[]> {
  try {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("status", "published")
      .eq("lang", lang)
      .order("views", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getContentStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
} | null> {
  try {
    const { data, error } = await supabase.from("content").select("type, status");
    if (error) return null;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const item of data || []) {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    }
    return { total: data?.length || 0, byType, byStatus };
  } catch {
    return null;
  }
}

// ===== كاش بسيط =====
const contentCache = new Map<string, { data: unknown; expires: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export function getCachedContent<T>(key: string): T | null {
  const cached = contentCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expires) {
    contentCache.delete(key);
    return null;
  }
  return cached.data as T;
}

export function setCachedContent(key: string, data: unknown, ttl?: number): void {
  contentCache.set(key, { data, expires: Date.now() + (ttl || DEFAULT_CACHE_TTL) });
}

export function invalidateContentCache(pattern?: string): void {
  if (!pattern) {
    contentCache.clear();
    return;
  }
  for (const key of contentCache.keys()) {
    if (key.includes(pattern)) contentCache.delete(key);
  }
}

// ===== طبقة توافق للصفحات القديمة =====
export const defaultContent: any = {
  site: {
    name: "إسماعيل أحمد نجيب",
    nameEn: "Ismail Ahmed Naguib",
    tagline: "منصة دعوية شاملة",
    description: "منصة إسلامية شاملة تجمع القرآن والسنة والعلوم الشرعية وأدوات الدعوة في مكان واحد",
    url: "https://ismailahmednaguib.vercel.app",
  },
  about: { title: "من نحن", subtitle: "تعرف على المنصة وصاحبها", body: "" },
  contact: { title: "تواصل معنا", subtitle: "نسعد بتواصلك" },
  fields: [],
  projects: [],
  khutab: [],
  fatwa: [],
  news: [],
  live: [],
  learn: [],
  dawahGuide: { title: "دليل الدعوة", subtitle: "كيف تكون داعية ناجحًا", body: "" },
  prayerGuide: { title: "دليل الصلاة", subtitle: "تعلّم الصلاة الصحيحة خطوة بخطوة", body: "" },
  hajjGuide: { title: "دليل الحج والعمرة", subtitle: "من الإحرام حتى التحلل", body: "" },
  zakat: { title: "حاسبة الزكاة", subtitle: "زكاة المال والذهب والعروض", body: "" },
  inheritance: { title: "علم المواريث", subtitle: "تقسيم التركات شرعًا", body: "" },
  prophets: [],
  memorization: { title: "حفظ القرآن", subtitle: "خطة عملية للحفظ والمراجعة", body: "" },
  ruqyah: { title: "الرقية الشرعية", subtitle: "آيات وأدعية الرقية", body: "" },
  dailyWird: { title: "الورد اليومي", subtitle: "برنامجك اليومي من القرآن والذكر", body: "" },
  khatmDua: { title: "ختمة الدعاء", subtitle: "شارك في ختمة دعاء جماعية", body: "" },
  youthIssues: [],
  womenFatwas: [],
  embraceIslam: { title: "ادخل الإسلام", subtitle: "لغير المسلمين والمهتمين", body: "" },
  atheismResponse: [],
  doubts: [],
};

const contentKeyAliases: Record<string, string> = {
  about: "about",
  fields: "fields",
  field: "fields",
  projects: "projects",
  project: "projects",
  khutab: "khutab",
  khutbah: "khutab",
  fatwa: "fatwa",
  fatwas: "fatwa",
  news: "news",
  live: "live",
  learn: "learn",
  dawahGuide: "dawahGuide",
  "dawah-guide": "dawahGuide",
  prayerGuide: "prayerGuide",
  "prayer-guide": "prayerGuide",
  hajjGuide: "hajjGuide",
  "hajj-guide": "hajjGuide",
  zakat: "zakat",
  inheritance: "inheritance",
  prophets: "prophets",
  prophetsStories: "prophets",
  "prophets-stories": "prophets",
  memorization: "memorization",
  quranMemorization: "memorization",
  "quran-memorization": "memorization",
  ruqyah: "ruqyah",
  dailyWird: "dailyWird",
  "daily-wird": "dailyWird",
  khatmDua: "khatmDua",
  "khatm-dua": "khatmDua",
  youthIssues: "youthIssues",
  "youth-issues": "youthIssues",
  womenFatwas: "womenFatwas",
  embraceIslam: "embraceIslam",
  "embrace-islam": "embraceIslam",
  atheismResponse: "atheismResponse",
  "atheism-response": "atheismResponse",
  doubts: "doubts",
};

export async function getContent(...args: any[]): Promise<any> {
  if (args.length === 0) return defaultContent;

  const first = args[0];
  const second = args[1];
  const third = args[2];

  if (typeof first === "string") {
    const alias = contentKeyAliases[first] || first;
    if (alias in defaultContent) return defaultContent[alias];
  }

  if (typeof first === "string" && typeof second === "string") {
    return getContentBySlug(first as ContentType, second, typeof third === "string" ? third : "ar");
  }

  if (typeof first === "string") {
    return getContentByType(first as ContentType, {
      lang: typeof second === "string" ? second : "ar",
    });
  }

  return defaultContent;
}