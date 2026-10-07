import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/setup-admin"],
      },
    ],
    sitemap: "https://ismailahmednaguib.vercel.app/sitemap.xml",
    host: "https://ismailahmednaguib.vercel.app",
  };
}