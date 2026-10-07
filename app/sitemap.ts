import type { MetadataRoute } from "next";
import { languages } from "@/lib/i18n";
import { fields } from "@/lib/data";

const BASE = "https://ismailahmednaguib.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/contact", "/fatwa", "/live", "/projects", "/news", "/map", "/adhkar", "/doubts", "/learn", "/search"];

  const entries: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    for (const page of pages) {
      entries.push({
        url: `${BASE}/${lang.code}${page}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page === "" ? 1 : 0.7,
      });
    }
    for (const field of fields) {
      entries.push({
        url: `${BASE}/${lang.code}/fields/${field.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}