// components/JsonLd.tsx
// مكوّن البيانات المنظمة (JSON-LD) لتحسين محركات البحث

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              ...item,
            }),
          }}
        />
      ))}
    </>
  );
}

// ===== أنواع البيانات المنظمة =====

// بيانات المنظمة / الموقع
export function OrganizationJsonLd({
  name = "إسماعيل أحمد نجيب",
  url = "https://ismailahmednaguib.vercel.app",
  logo = "https://ismailahmednaguib.vercel.app/icon-512.png",
  description = "منصة دعوية إسلامية شاملة",
}: {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "Organization",
        name,
        url,
        logo,
        description,
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["Arabic", "English"],
        },
      }}
    />
  );
}

// بيانات الموقع الإلكتروني
export function WebSiteJsonLd({
  name = "إسماعيل أحمد نجيب",
  url = "https://ismailahmednaguib.vercel.app",
  lang = "ar",
}: {
  name?: string;
  url?: string;
  lang?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "WebSite",
        name,
        url,
        inLanguage: lang,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/{lang}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// بيانات مقال / محتوى
export function ArticleJsonLd({
  headline,
  description,
  author = "إسماعيل أحمد نجيب",
  datePublished,
  dateModified,
  image,
  url,
  lang = "ar",
}: {
  headline: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  url?: string;
  lang?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "Article",
        headline,
        description,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "إسماعيل أحمد نجيب",
          logo: {
            "@type": "ImageObject",
            url: "https://ismailahmednaguib.vercel.app/icon-512.png",
          },
        },
        datePublished: datePublished || new Date().toISOString(),
        dateModified: dateModified || new Date().toISOString(),
        image,
        url,
        inLanguage: lang,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      }}
    />
  );
}

// بيانات مسار التنقل (Breadcrumbs)
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// بيانات الأسئلة الشائعة (FAQ)
export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

// بيانات تطبيق الويب (PWA)
export function WebApplicationJsonLd({
  name = "إسماعيل أحمد نجيب",
  url = "https://ismailahmednaguib.vercel.app",
  description = "منصة دعوية إسلامية شاملة",
}: {
  name?: string;
  url?: string;
  description?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "WebApplication",
        name,
        url,
        description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        inLanguage: ["ar", "en"],
      }}
    />
  );
}

// بيانات فيديو / بث مباشر
export function VideoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  isLiveBroadcast = false,
}: {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  isLiveBroadcast?: boolean;
}) {
  return (
    <JsonLd
      data={{
        "@type": isLiveBroadcast ? "LiveBroadcast" : "VideoObject",
        name,
        description,
        thumbnailUrl,
        uploadDate: uploadDate || new Date().toISOString(),
        duration,
        contentUrl,
        isLiveBroadcast,
        publisher: {
          "@type": "Organization",
          name: "إسماعيل أحمد نجيب",
          logo: {
            "@type": "ImageObject",
            url: "https://ismailahmednaguib.vercel.app/icon-512.png",
          },
        },
      }}
    />
  );
}

// بيانات حدث / درس
export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location = "Online",
  url,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "Event",
        name,
        description,
        startDate,
        endDate,
        location: {
          "@type": "VirtualLocation",
          name: location,
          url,
        },
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        organizer: {
          "@type": "Organization",
          name: "إسماعيل أحمد نجيب",
        },
      }}
    />
  );
}

// بيانات دورة تعليمية
export function CourseJsonLd({
  name,
  description,
  provider = "إسماعيل أحمد نجيب",
  url,
}: {
  name: string;
  description: string;
  provider?: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@type": "Course",
        name,
        description,
        provider: {
          "@type": "Organization",
          name: provider,
          sameAs: url,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
        },
      }}
    />
  );
}