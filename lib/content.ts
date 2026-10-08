// lib/content.ts
// نظام إدارة المحتوى — CRUD + أنواع + كاش

import { createClient } from "@supabase/supabase-js";

// ===== عميل Supabase =====
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface Article extends ContentBase {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  reading_time: number;
}

export interface Fatwa extends ContentBase {
  question: string;
  answer: string;
  scholar: string | null;
  category: string;
  tags: string[];
}

export interface NewsItem extends ContentBase {
  title: string;
  excerpt: string;
  body: string;
  source: string | null;
  cover_image: string | null;
  tags: string[];
}

export interface Khutba extends ContentBase {
  title: string;
  excerpt: string;
  body: string;
  khutba_date: string | null;
  duration_minutes: number | null;
  audio_url: string | null;
  tags: string[];
}

export interface Doubt extends ContentBase {
  title: string;
  doubt_text: string;
  response_text: string;
  category: string;
  severity: "low" | "medium" | "high";
  tags: string[];
}

export interface ProphetStory extends ContentBase {
  title: string;
  prophet_name: string;
  body: string;
  order_number: number;
  lessons: string[];
  tags: string[];
}

export interface DawahField extends ContentBase {
  title: string;
  description: string;
  body: string;
  icon: string | null;
  priority: number;
  related_fields: string[];
}

export interface DawahProject extends ContentBase {
  title: string;
  description: string;
  body: string;
  status_project: "active" | "completed" | "planned";
  funding_goal: number | null;
  funding_current: number | null;
  cover_image: string | null;
  tags: string[];
}

// ===== الاتحاد العام لكل أنواع المحتوى =====
export type ContentItem =
  | Article
  | Fatwa
  | NewsItem
  | Khutba
  | Doubt
  | ProphetStory
  | DawahField
  | DawahProject;

// ===== دوال مساعدة عامة =====

/**
 * جلب المحتوى حسب النوع
 */
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
  const {
    lang = "ar",
    status = "published",
    limit = 20,
    offset = 0,
    orderBy = "published_at",
    ascending = false,
  } = options;

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", type)
    .eq("lang", lang)
    .eq("status", status)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`Error fetching ${type} content:`, error);
    return [];
  }

  return data || [];
}

/**
 * جلب محتوى واحد بالـ slug
 */
export async function getContentBySlug(
  type: ContentType,
  slug: string,
  lang: string = "ar"
): Promise<ContentBase | null> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", type)
    .eq("slug", slug)
    .eq("lang", lang)
    .single();

  if (error) {
    console.error(`Error fetching ${type} by slug "${slug}":`, error);
    return null;
  }

  return data;
}

/**
 * جلب محتوى واحد بالـ ID
 */
export async function getContentById(id: string): Promise<ContentBase | null> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching content by id "${id}":`, error);
    return null;
  }

  return data;
}

/**
 * البحث في المحتوى
 */
export async function searchContent(
  query: string,
  options: {
    type?: ContentType;
    lang?: string;
    limit?: number;
  } = {}
): Promise<ContentBase[]> {
  const { type, lang = "ar", limit = 20 } = options;

  let dbQuery = supabase
    .from("content")
    .select("*")
    .eq("status", "published")
    .eq("lang", lang)
    .limit(limit);

  if (type) {
    dbQuery = dbQuery.eq("type", type);
  }

  // البحث بالعنوان أو المحتوى
  dbQuery = dbQuery.or(
    `title.ilike.%${query}%,excerpt.ilike.%${query}%,body.ilike.%${query}%`
  );

  const { data, error } = await dbQuery;

  if (error) {
    console.error("Error searching content:", error);
    return [];
  }

  return data || [];
}

/**
 * إنشاء محتوى جديد
 */
export async function createContent(
  content: Omit<ContentBase, "id" | "created_at" | "updated_at" | "views">
): Promise<ContentBase | null> {
  const { data, error } = await supabase
    .from("content")
    .insert([content])
    .select()
    .single();

  if (error) {
    console.error("Error creating content:", error);
    return null;
  }

  return data;
}

/**
 * تحديث محتوى موجود
 */
export async function updateContent(
  id: string,
  updates: Partial<ContentBase>
): Promise<ContentBase | null> {
  const { data, error } = await supabase
    .from("content")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating content "${id}":`, error);
    return null;
  }

  return data;
}

/**
 * حذف محتوى
 */
export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase.from("content").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting content "${id}":`, error);
    return false;
  }

  return true;
}

/**
 * زيادة عدد المشاهدات
 */
export async function incrementViews(id: string): Promise<void> {
  await supabase.rpc("increment_content_views", { content_id: id });
}

/**
 * جلب أحدث المحتوى (للرئيسية)
 */
export async function getLatestContent(
  lang: string = "ar",
  limit: number = 6
): Promise<ContentBase[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("status", "published")
    .eq("lang", lang)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest content:", error);
    return [];
  }

  return data || [];
}

/**
 * جلب المحتوى الأكثر مشاهدة
 */
export async function getPopularContent(
  lang: string = "ar",
  limit: number = 6
): Promise<ContentBase[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("status", "published")
    .eq("lang", lang)
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching popular content:", error);
    return [];
  }

  return data || [];
}

/**
 * جلب إحصائيات المحتوى
 */
export async function getContentStats(): Promise<{
  total: number;
  byType: Record<ContentType, number>;
  byStatus: Record<ContentStatus, number>;
} | null> {
  const { data, error } = await supabase.from("content").select("type, status");

  if (error) {
    console.error("Error fetching content stats:", error);
    return null;
  }

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const item of data || []) {
    byType[item.type] = (byType[item.type] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  }

  return {
    total: data?.length || 0,
    byType: byType as Record<ContentType, number>,
    byStatus: byStatus as Record<ContentStatus, number>,
  };
}

/**
 * جلب المحتوى حسب التصنيف
 */
export async function getContentByCategory(
  type: ContentType,
  category: string,
  lang: string = "ar"
): Promise<ContentBase[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("type", type)
    .eq("lang", lang)
    .eq("status", "published")
    .contains("category", [category])
    .order("published_at", { ascending: false });

  if (error) {
    console.error(`Error fetching ${type} by category "${category}":`, error);
    return [];
  }

  return data || [];
}

/**
 * جلب المحتوى حسب الوسم
 */
export async function getContentByTag(
  tag: string,
  options: { type?: ContentType; lang?: string } = {}
): Promise<ContentBase[]> {
  const { type, lang = "ar" } = options;

  let dbQuery = supabase
    .from("content")
    .select("*")
    .eq("status", "published")
    .eq("lang", lang)
    .contains("tags", [tag])
    .order("published_at", { ascending: false });

  if (type) {
    dbQuery = dbQuery.eq("type", type);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error(`Error fetching content by tag "${tag}":`, error);
    return [];
  }

  return data || [];
}

// ===== كاش بسيط في الذاكرة =====
const contentCache = new Map<string, { data: unknown; expires: number }>();

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 دقائق

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
  contentCache.set(key, {
    data,
    expires: Date.now() + (ttl || DEFAULT_CACHE_TTL),
  });
}

export function invalidateContentCache(pattern?: string): void {
  if (!pattern) {
    contentCache.clear();
    return;
  }
  for (const key of contentCache.keys()) {
    if (key.includes(pattern)) {
      contentCache.delete(key);
    }
  }
}