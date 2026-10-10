// lib/content.ts
// ⚠️ Server-only: لا تستورده داخل Client Components.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Types
// ============================================================

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
  type?: ContentType;
  slug?: string;
  status?: ContentStatus;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  author_id?: string | null;
  views?: number;
  lang?: string;
  t?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

export interface ContentItem extends ContentBase {
  id: string;
  t: Record<string, Record<string, unknown>>;
}

export interface ContentData extends Record<string, any> {
  settings: Record<string, any>;
  fields: ContentItem[];
  lessons: ContentItem[];
  videos: ContentItem[];
  articles: ContentItem[];
  books: ContentItem[];
  audio: ContentItem[];
  photos: ContentItem[];
  schedule: ContentItem[];
  fatwas: ContentItem[];
  projects: ContentItem[];
  news: ContentItem[];
  places: ContentItem[];
  adhkar: ContentItem[];
  doubts: ContentItem[];
}

export type CollectionName =
  | "fields"
  | "lessons"
  | "videos"
  | "articles"
  | "books"
  | "audio"
  | "photos"
  | "schedule"
  | "fatwas"
  | "projects"
  | "news"
  | "places"
  | "adhkar"
  | "doubts";

// ============================================================
// Constants
// ============================================================

const COLLECTIONS: CollectionName[] = [
  "fields",
  "lessons",
  "videos",
  "articles",
  "books",
  "audio",
  "photos",
  "schedule",
  "fatwas",
  "projects",
  "news",
  "places",
  "adhkar",
  "doubts",
];

const COLLECTION_SET = new Set<string>(COLLECTIONS);

/**
 * خرائط توافق للأسماء القديمة.
 */
const CONTENT_ALIASES: Record<string, CollectionName | "settings"> = {
  // singular/plural
  field: "fields",
  fields: "fields",

  lesson: "lessons",
  lessons: "lessons",

  video: "videos",
  videos: "videos",

  article: "articles",
  articles: "articles",

  book: "books",
  books: "books",

  audio: "audio",
  audios: "audio",

  photo: "photos",
  photos: "photos",

  schedule: "schedule",
  schedules: "schedule",

  fatwa: "fatwas",
  fatwas: "fatwas",

  project: "projects",
  projects: "projects",

  news: "news",
  new: "news",

  place: "places",
  places: "places",

  adhkar: "adhkar",
  adhkars: "adhkar",

  doubt: "doubts",
  doubts: "doubts",

  // old naming
  prophets: "doubts", // لو عندك جدول prophets منفصل، ضعه هنا بدل doubts
  prophetsStories: "doubts",
  "prophets-stories": "doubts",

  youthIssues: "doubts",
  "youth-issues": "doubts",

  womenFatwas: "fatwas",
  atheismResponse: "doubts",
  "atheism-response": "doubts",

  khutab: "lessons",
  khutbah: "lessons",

  live: "news",
  learn: "lessons",

  site: "settings",
  settings: "settings",
};

const LOCALIZABLE_FIELDS = [
  "title",
  "name",
  "desc",
  "description",
  "text",
  "q",
  "a",
  "caption",
  "category",
  "topic",
  "place",
  "area",
  "note",
  "excerpt",
  "body",
  "question",
  "answer",
];

// ============================================================
// Env helpers
// ============================================================

function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ""
  );
}

function getServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const CACHE_TTL_MS = positiveNumber(
  process.env.CONTENT_CACHE_TTL_MS,
  60_000
);

const NO_CACHE = process.env.CONTENT_NO_CACHE === "true";

const MAX_ITEMS_PER_COLLECTION = positiveNumber(
  process.env.CONTENT_MAX_ITEMS_PER_COLLECTION,
  5_000
);

/**
 * مصدر المحتوى الأساسي:
 * - db: الجداول المنفصلة هي الأساس، وsite_content للاحتياطي/الإعدادات.
 * - site: site_content هو الأساس، والجداول للاحتياطي.
 * - merge: يدمج بينهما مع الحفاظ على قيم site_content غير الفارغة.
 *
 * التوصية لموقعك:
 * - إذا كانت لوحة الأدمن تعدّل الجداول مباشرة: db
 * - إذا كانت تعدّل site_content فقط: site
 * - إذا كنت تنتقل تدريجيًا: merge
 */
const CONTENT_PRIMARY = (
  process.env.CONTENT_PRIMARY || "db"
).toLowerCase();

// ============================================================
// Supabase client
// ============================================================

let cachedClient: SupabaseClient | null = null;

export function createContentClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getSupabaseUrl();
  const serviceKey = getServiceKey();
  const anonKey = getAnonKey();

  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}

/**
 * للتوافق مع الكود القديم الذي كان يستورد supabase من lib/content.
 * ⚠️ هذا client السيرفر فقط.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = createContentClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// ============================================================
// Simple cache
// ============================================================

type CacheEntry = {
  data: unknown;
  expires: number;
};

const contentCache = new Map<string, CacheEntry>();

export function getCachedContent<T>(key: string): T | null {
  if (NO_CACHE) return null;

  const cached = contentCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    contentCache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCachedContent(key: string, data: unknown, ttl?: number): void {
  if (NO_CACHE) return;

  contentCache.set(key, {
    data,
    expires: Date.now() + (ttl || CACHE_TTL_MS),
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

// ============================================================
// Utility helpers
// ============================================================

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const id = value.trim();
    if (id && id.length <= 128) {
      return id;
    }
  }

  return null;
}

function idForQuery(id: string): string | number {
  if (/^\d+$/.test(id)) {
    const num = Number(id);
    if (Number.isSafeInteger(num)) {
      return num;
    }
  }

  return id;
}

function normalizeItem(raw: unknown): ContentItem | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const id = normalizeId(
    raw.id ?? raw.slug ?? raw.key ?? raw.uid ?? raw._id
  );

  if (!id) {
    return null;
  }

  const item: ContentItem = {
    ...raw,
    id,
    t: isPlainObject(raw.t) ? (raw.t as Record<string, Record<string, unknown>>) : {},
  };

  return item;
}

function normalizeArray(value: unknown): ContentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeItem)
    .filter((item): item is ContentItem => Boolean(item));
}

function normalizeSettings(value: unknown): Record<string, any> {
  if (isPlainObject(value)) {
    return value as Record<string, any>;
  }

  return {};
}

function deepMergeObjects(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  depth = 0
): Record<string, unknown> {
  if (depth > 4) {
    return { ...target, ...source };
  }

  const output: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    const existing = output[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      output[key] = deepMergeObjects(existing, value, depth + 1);
    } else {
      output[key] = value;
    }
  }

  return output;
}

function mergePreservingSite(
  siteItem: ContentItem,
  dbItem: ContentItem
): ContentItem {
  const merged: ContentItem = { ...siteItem };

  for (const [key, value] of Object.entries(dbItem)) {
    if (key === "t") {
      merged.t = deepMergeObjects(
        isPlainObject(merged.t) ? merged.t : {},
        isPlainObject(value) ? (value as Record<string, unknown>) : {}
      ) as Record<string, Record<string, unknown>>;
      continue;
    }

    const currentValue = (merged as any)[key];

    if (
      currentValue === undefined ||
      currentValue === null ||
      currentValue === ""
    ) {
      (merged as any)[key] = value;
    }
  }

  return merged;
}

function mergeItemsById(
  siteItems: ContentItem[],
  dbItems: ContentItem[]
): ContentItem[] {
  const map = new Map<string, ContentItem>();

  for (const item of siteItems) {
    map.set(item.id, item);
  }

  for (const dbItem of dbItems) {
    const existing = map.get(dbItem.id);

    if (existing) {
      map.set(dbItem.id, mergePreservingSite(existing, dbItem));
    } else {
      map.set(dbItem.id, dbItem);
    }
  }

  return Array.from(map.values());
}

function localizeItem(item: ContentItem, lang: string): ContentItem {
  const translation = item.t?.[lang];

  if (!isPlainObject(translation)) {
    return item;
  }

  const localized: ContentItem = { ...item };

  for (const field of LOCALIZABLE_FIELDS) {
    const value = translation[field];

    if (typeof value === "string" && value.trim()) {
      (localized as any)[field] = value;
    } else if (typeof value === "number") {
      (localized as any)[field] = String(value);
    }
  }

  return localized;
}

function localizeContent(content: ContentData, lang: string): ContentData {
  const localized: ContentData = { ...content };

  for (const collection of COLLECTIONS) {
    localized[collection] = (content[collection] || []).map((item) =>
      localizeItem(item, lang)
    );
  }

  return localized;
}

function sanitizeSearchQuery(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[%,()\[\]{}:;|&!^~*?+]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function getTextValue(item: ContentItem, field: string): string {
  const value = (item as any)[field];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function scoreItem(item: ContentItem, terms: string[]): number {
  let score = 0;

  const searchableFields = [
    "title",
    "name",
    "question",
    "answer",
    "body",
    "excerpt",
    "description",
    "desc",
    "text",
    "caption",
    "category",
    "topic",
  ];

  for (const field of searchableFields) {
    const value = getTextValue(item, field).toLowerCase();

    if (!value) {
      continue;
    }

    for (const term of terms) {
      if (!term) continue;

      if (value.includes(term)) {
        score += field === "title" || field === "name" || field === "question" ? 3 : 1;
      }
    }
  }

  return score;
}

// ============================================================
// DB fetchers
// ============================================================

async function fetchSiteContent(): Promise<Record<string, unknown> | null> {
  try {
    const client = createContentClient();

    const { data, error } = await client
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const parsed = (data as any).data;

    return isPlainObject(parsed) ? parsed : null;
  } catch (error) {
    console.warn("[Content] Failed to fetch site_content:", error);
    return null;
  }
}

async function fetchCollection(name: CollectionName): Promise<ContentItem[]> {
  const client = createContentClient();

  const attempts: Array<() => any> = [
    () =>
      client
        .from(name)
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(MAX_ITEMS_PER_COLLECTION),

    () =>
      client
        .from(name)
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(MAX_ITEMS_PER_COLLECTION),

    () =>
      client
        .from(name)
        .select("*")
        .order("published_at", { ascending: false })
        .limit(MAX_ITEMS_PER_COLLECTION),

    () =>
      client
        .from(name)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(MAX_ITEMS_PER_COLLECTION),

    () =>
      client
        .from(name)
        .select("*")
        .limit(MAX_ITEMS_PER_COLLECTION),
  ];

  for (const attempt of attempts) {
    try {
      const result = (await attempt()) as {
        data?: unknown[];
        error?: any;
      };

      if (!result.error) {
        return normalizeArray(result.data);
      }

      const message = String(result.error?.message || "");

      const isMissingTable =
        /does not exist/i.test(message) ||
        /Could not find the table/i.test(message) ||
        /relation/i.test(message);

      if (isMissingTable) {
        return [];
      }

      const isMissingColumn =
        /column .* does not exist/i.test(message) ||
        /Could not find the column/i.test(message) ||
        /status/i.test(message) ||
        /published_at/i.test(message) ||
        /created_at/i.test(message);

      if (isMissingColumn) {
        continue;
      }

      console.error(`[Content] fetchCollection(${name}) error:`, result.error);
      return [];
    } catch (error) {
      console.error(`[Content] fetchCollection(${name}) exception:`, error);
    }
  }

  return [];
}

// ============================================================
// Core loader
// ============================================================

async function loadContent(options: { lang?: string } = {}): Promise<ContentData> {
  const lang = typeof options.lang === "string" ? options.lang.trim() : "";
  const cacheKey = `content:${lang || "raw"}`;

  const cached = getCachedContent<ContentData>(cacheKey);
  if (cached) {
    return cached;
  }

  const site = await fetchSiteContent();

  const base: ContentData = {
    settings: normalizeSettings(site?.settings || site?.site),
    fields: [],
    lessons: [],
    videos: [],
    articles: [],
    books: [],
    audio: [],
    photos: [],
    schedule: [],
    fatwas: [],
    projects: [],
    news: [],
    places: [],
    adhkar: [],
    doubts: [],
  };

  const siteArrays: Partial<Record<CollectionName, ContentItem[]>> = {};

  for (const name of COLLECTIONS) {
    const value = site?.[name];
    if (Array.isArray(value)) {
      siteArrays[name] = normalizeArray(value);
    }
  }

  if (CONTENT_PRIMARY === "site") {
    for (const name of COLLECTIONS) {
      const fromSite = siteArrays[name];

      if (fromSite && fromSite.length > 0) {
        base[name] = fromSite;
      } else {
        base[name] = await fetchCollection(name);
      }
    }
  } else {
    const dbResults = await Promise.all(
      COLLECTIONS.map((name) => fetchCollection(name))
    );

    for (let i = 0; i < COLLECTIONS.length; i += 1) {
      const name = COLLECTIONS[i];
      const dbItems = dbResults[i] || [];
      const siteItems = siteArrays[name] || [];

      if (CONTENT_PRIMARY === "merge") {
        base[name] = mergeItemsById(siteItems, dbItems);
      } else {
        // db
        base[name] = dbItems.length > 0 ? dbItems : siteItems;
      }
    }
  }

  const finalContent = lang ? localizeContent(base, lang) : base;

  setCachedContent(cacheKey, finalContent);

  return finalContent;
}

// ============================================================
// Public API
// ============================================================

export async function getContent(options?: { lang?: string }): Promise<ContentData>;
export async function getContent(key: string): Promise<any>;
export async function getContent(
  type: string,
  slug: string,
  lang?: string
): Promise<ContentItem | null>;
export async function getContent(...args: any[]): Promise<any> {
  // getContent()
  if (args.length === 0) {
    return loadContent();
  }

  const first = args[0];

  // getContent({ lang: "ar" })
  if (isPlainObject(first)) {
    return loadContent(first as { lang?: string });
  }

  // getContent("articles") or getContent("article")
  if (typeof first === "string" && args.length === 1) {
    const alias = CONTENT_ALIASES[first] || first;
    const all = await loadContent();

    if (alias === "settings") {
      return all.settings;
    }

    if (alias in all) {
      return (all as any)[alias];
    }

    return [];
  }

  // getContent("article", "slug", "ar")
  if (typeof first === "string" && typeof args[1] === "string") {
    const type = first;
    const slug = args[1];
    const lang = typeof args[2] === "string" ? args[2] : undefined;

    const collection = (CONTENT_ALIASES[type] || type) as CollectionName;
    const all = await loadContent(lang ? { lang } : undefined);
    const items = (all as any)[collection] || [];

    return (
      items.find(
        (item: ContentItem) =>
          item.slug === slug ||
          item.id === slug ||
          String(item.id) === String(slug)
      ) || null
    );
  }

  return loadContent();
}

export async function getContentByType(
  type: ContentType | string,
  options: {
    lang?: string;
    status?: ContentStatus;
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
  } = {}
): Promise<ContentItem[]> {
  const collection = (CONTENT_ALIASES[type] || type) as CollectionName;
  const all = await loadContent(options.lang ? { lang: options.lang } : undefined);

  let items = (all as any)[collection] || [];

  if (options.status) {
    items = items.filter((item: ContentItem) => item.status === options.status);
  }

  const offset = Number(options.offset || 0);
  const limit = Number(options.limit || items.length);

  return items.slice(offset, offset + limit);
}

export async function getContentBySlug(
  type: ContentType | string,
  slug: string,
  lang = "ar"
): Promise<ContentItem | null> {
  return getContent(type, slug, lang);
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const cleanId = normalizeId(id);
  if (!cleanId) return null;

  const all = await loadContent();

  for (const collection of COLLECTIONS) {
    const items = (all as any)[collection] || [];
    const found = items.find((item: ContentItem) => item.id === cleanId);

    if (found) {
      return found;
    }
  }

  return null;
}

export async function searchContent(
  query: string,
  options: {
    type?: ContentType | string;
    lang?: string;
    limit?: number;
  } = {}
): Promise<ContentItem[]> {
  const cleanQuery = sanitizeSearchQuery(query);

  if (!cleanQuery) {
    return [];
  }

  const limit = positiveNumber(String(options.limit), 20);
  const lang = options.lang || "ar";

  const all = await loadContent({ lang });

  const terms = cleanQuery
    .toLowerCase()
    .split(" ")
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const collections: CollectionName[] = options.type
    ? [((CONTENT_ALIASES[options.type] || options.type) as CollectionName)]
    : COLLECTIONS;

  const results: Array<ContentItem & { __score: number }> = [];

  for (const collection of collections) {
    const items = (all as any)[collection] || [];

    for (const item of items) {
      const score = scoreItem(item, terms);

      if (score > 0) {
        results.push({
          ...item,
          __score: score,
        });
      }
    }
  }

  results.sort((a, b) => b.__score - a.__score);

  return results.slice(0, limit).map(({ __score, ...item }) => item);
}

export async function getLatestContent(lang = "ar", limit = 6): Promise<ContentItem[]> {
  const items = await getContentByType("article", { lang, limit });
  return items;
}

export async function getPopularContent(lang = "ar", limit = 6): Promise<ContentItem[]> {
  const items = await getContentByType("article", { lang });

  return [...items]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, limit);
}

export async function getContentStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
} | null> {
  try {
    const all = await loadContent();

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    let total = 0;

    for (const collection of COLLECTIONS) {
      const items = (all as any)[collection] || [];
      byType[collection] = items.length;
      total += items.length;

      for (const item of items) {
        const status = String(item.status || "published");
        byStatus[status] = (byStatus[status] || 0) + 1;
      }
    }

    return {
      total,
      byType,
      byStatus,
    };
  } catch (error) {
    console.error("[Content] getContentStats error:", error);
    return null;
  }
}

// ============================================================
// Admin helpers
// ============================================================

function assertCollection(collection: string): void {
  if (!COLLECTION_SET.has(collection) && collection !== "content") {
    throw new Error(`Collection not allowed: ${collection}`);
  }
}

export async function adminCreateContentItem(
  collection: CollectionName | "content",
  payload: Record<string, unknown>
): Promise<ContentItem | null> {
  assertCollection(collection);

  const client = createContentClient();

  const { data, error } = await client
    .from(collection)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error(`[Content] adminCreateContentItem(${collection}) error:`, error);
    return null;
  }

  invalidateContentCache();

  return normalizeItem(data);
}

export async function adminUpdateContentItem(
  collection: CollectionName | "content",
  id: string,
  updates: Record<string, unknown>
): Promise<ContentItem | null> {
  assertCollection(collection);

  const cleanId = normalizeId(id);
  if (!cleanId) return null;

  const client = createContentClient();

  const { data, error } = await client
    .from(collection)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idForQuery(cleanId))
    .select("*")
    .single();

  if (error) {
    console.error(`[Content] adminUpdateContentItem(${collection}) error:`, error);
    return null;
  }

  invalidateContentCache();

  return normalizeItem(data);
}

export async function adminDeleteContentItem(
  collection: CollectionName | "content",
  id: string
): Promise<boolean> {
  assertCollection(collection);

  const cleanId = normalizeId(id);
  if (!cleanId) return false;

  const client = createContentClient();

  const { error } = await client
    .from(collection)
    .delete()
    .eq("id", idForQuery(cleanId));

  if (error) {
    console.error(`[Content] adminDeleteContentItem(${collection}) error:`, error);
    return false;
  }

  invalidateContentCache();

  return true;
}

/**
 * تحديث ترجمة حقل واحد داخل عمود t.
 * مفيد لو أردت استخدامه من لوحة الأدمن بدل تكرار المنطق.
 */
export async function adminUpdateContentTranslation(params: {
  collection: CollectionName;
  id: string;
  lang: string;
  field: string;
  value: string;
}): Promise<boolean> {
  assertCollection(params.collection);

  const cleanId = normalizeId(params.id);
  const lang = params.lang.trim().toLowerCase();
  const field = params.field.trim().toLowerCase();
  const value = typeof params.value === "string" ? params.value : "";

  if (!cleanId || !lang || !field) {
    return false;
  }

  const client = createContentClient();

  const current = await client
    .from(params.collection)
    .select("id, t")
    .eq("id", idForQuery(cleanId))
    .maybeSingle();

  if (current.error || !current.data) {
    console.error("[Content] translation fetch error:", current.error);
    return false;
  }

  const t = isPlainObject((current.data as any).t)
    ? ((current.data as any).t as Record<string, Record<string, unknown>>)
    : {};

  const nextT = {
    ...t,
    [lang]: {
      ...(t[lang] || {}),
      [field]: value,
    },
  };

  const { error } = await client
    .from(params.collection)
    .update({
      t: nextT,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idForQuery(cleanId));

  if (error) {
    console.error("[Content] translation update error:", error);
    return false;
  }

  invalidateContentCache();

  return true;
}

// ============================================================
// Backward-compatible wrappers
// ============================================================

export async function createContent(
  content: Omit<ContentBase, "id" | "created_at" | "updated_at" | "views"> &
    Record<string, unknown>
): Promise<ContentItem | null> {
  const type = String((content as any).type || "article");
  const collection = (CONTENT_ALIASES[type] || "content") as CollectionName | "content";

  return adminCreateContentItem(collection, content as Record<string, unknown>);
}

export async function updateContent(
  id: string,
  updates: Partial<ContentBase> & Record<string, unknown>
): Promise<ContentItem | null> {
  return adminUpdateContentItem("content", id, updates as Record<string, unknown>);
}

export async function deleteContent(id: string): Promise<boolean> {
  return adminDeleteContentItem("content", id);
}

// ============================================================
// Fallback content for very old code
// ============================================================

export const defaultContent: ContentData = {
  settings: {},
  fields: [],
  lessons: [],
  videos: [],
  articles: [],
  books: [],
  audio: [],
  photos: [],
  schedule: [],
  fatwas: [],
  projects: [],
  news: [],
  places: [],
  adhkar: [],
  doubts: [],
};