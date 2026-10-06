import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const now = new Date();

  const base = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const fields = c.fields.map((f) => ({
    url: `${SITE_URL}/fields/${f.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.9,
  }));

  const articles = c.articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.id}`, lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  return [...base, ...fields, ...articles] as MetadataRoute.Sitemap;
}