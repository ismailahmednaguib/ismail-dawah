// app/[lang]/tasbih/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import TasbihContent from "./tasbih-content";

const META: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
  }
> = {
  ar: {
    title: "المسبحة الإلكترونية",
    subtitle: "سبّح، حمد، كبّر، واستغفر بعدّاد تفاعلي",
    home: "الرئيسية",
    description:
      "مسبحة إلكترونية إسلامية بسيطة وعدّاد تفاعلي لأذكار التسبيح والتهليل والاستغفار والصلاة على النبي ﷺ.",
  },
  en: {
    title: "Digital Tasbih",
    subtitle: "Interactive counter for dhikr and tasbih",
    home: "Home",
    description:
      "A simple Islamic digital tasbih with an interactive counter for dhikr, tahleel, istighfar, and sending blessings upon the Prophet ﷺ.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const m = META[l];

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `/${l}/tasbih`,
      languages: {
        ar: "/ar/tasbih",
        en: "/en/tasbih",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/tasbih`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: m.title,
      description: m.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function TasbihPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const m = META[l];

  return (
    <main>
      <TopBar
        title={m.title}
        subtitle={m.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: m.home,
            href: `/${l}`,
          },
          {
            label: m.title,
          },
        ]}
      />

      <TasbihContent lang={l} />
    </main>
  );
}