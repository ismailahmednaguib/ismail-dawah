// app/[lang]/qibla/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import QiblaContent from "./qibla-content";

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
    title: "اتجاه القبلة",
    subtitle: "اعرف اتجاه القبلة بدقة حسب موقعك الحالي",
    home: "الرئيسية",
    description:
      "بوصلة اتجاه القبلة الإسلامية: اعرف زاوية القبلة والمسافة إلى مكة المكرمة حسب موقعك الجغرافي، مع دعم تحديد الموقع والإدخال اليدوي.",
  },
  en: {
    title: "Qibla Direction",
    subtitle: "Find the exact Qibla direction from your location",
    home: "Home",
    description:
      "Islamic Qibla compass: get the precise Qibla bearing and distance to Makkah based on your geographic location, with geolocation and manual input support.",
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
      canonical: `/${l}/qibla`,
      languages: {
        ar: "/ar/qibla",
        en: "/en/qibla",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/qibla`,
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

export default async function QiblaPage({
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

      <QiblaContent lang={l} />
    </main>
  );
}