import type { Metadata } from "next";
import type { Settings } from "./data";
import type { Lang } from "./i18n";

export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  lang: Lang;
  keywords?: string[];
}

export function generateSeo(opts: SeoOptions, settings: Settings): Metadata {
  const url = `https://ismailahmednaguib.vercel.app${opts.path}`;
  const image = opts.image || settings.ogImage || "/og-default.jpg";

  return {
    title: `${opts.title} | ${settings.shortName}`,
    description: opts.description,
    keywords: opts.keywords || ["الشيخ إسماعيل", "دروس إسلامية", "فتاوى", "دعوة"],
    authors: [{ name: settings.ownerName }],
    creator: settings.ownerName,
    publisher: settings.shortName,
    metadataBase: new URL("https://ismailahmednaguib.vercel.app"),
    alternates: {
      canonical: opts.path,
      languages: {
        ar: opts.path.replace(/^\/[a-z]{2}/, "/ar"),
        en: opts.path.replace(/^\/[a-z]{2}/, "/en"),
        fr: opts.path.replace(/^\/[a-z]{2}/, "/fr"),
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: settings.shortName,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      locale: opts.lang === "ar" ? "ar_EG" : opts.lang === "en" ? "en_US" : opts.lang,
      type: opts.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
      creator: "@sheikh_ismail",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// JSON-LD للموقع الإسلامي
export function generateJsonLd(type: "website" | "organization" | "person" | "article", data: any) {
  const base = {
    "@context": "https://schema.org",
    "@type": type,
  };

  if (type === "website") {
    return {
      ...base,
      name: data.name,
      description: data.description,
      url: data.url,
      inLanguage: data.lang,
      potentialAction: {
        "@type": "SearchAction",
        target: `${data.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  }

  if (type === "person") {
    return {
      ...base,
      name: data.name,
      jobTitle: data.jobTitle,
      description: data.description,
      image: data.image,
      url: data.url,
      sameAs: data.socialLinks || [],
      knowsAbout: data.interests || [],
    };
  }

  if (type === "organization") {
    return {
      ...base,
      name: data.name,
      url: data.url,
      logo: data.logo,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: data.phone,
        contactType: "customer service",
        email: data.email,
        availableLanguage: ["Arabic", "English"],
      },
    };
  }

  return base;
}