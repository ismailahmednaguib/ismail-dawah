// app/[lang]/prayer-times/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import PrayerTimesContent from "./prayer-times-content";

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
    title: "مواقيت الصلاة",
    subtitle: "اعرف مواقيت الصلاة حسب موقعك الحالي",
    home: "الرئيسية",
    description:
      "صفحة مواقيت الصلاة اليومية: الفجر، الشروق، الظهر، العصر، المغرب، والعشاء، مع تحديد الوقت المتبقي للصلاة القادمة حسب موقعك الجغرافي.",
  },
  en: {
    title: "Prayer Times",
    subtitle: "Get daily prayer times based on your location",
    home: "Home",
    description:
      "Daily Islamic prayer times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha, with countdown to the next prayer based on your geographic location.",
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
      canonical: `/${l}/prayer-times`,
      languages: {
        ar: "/ar/prayer-times",
        en: "/en/prayer-times",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/prayer-times`,
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

export default async function PrayerTimesPage({
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

      <PrayerTimesContent lang={l} />
    </main>
  );
}