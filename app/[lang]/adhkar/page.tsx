// app/[lang]/adhkar/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import AdhkarContent from "./adhkar-content";

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
    title: "الأذكار",
    subtitle: "أذكار الصباح والمساء والنوم وبعد الصلاة",
    home: "الرئيسية",
    description:
      "مجموعة مختارة من الأذكار الصحيحة من السنة النبوية، مع عدّاد تفاعلي لحفظ وردك اليومي.",
  },
  en: {
    title: "Adhkar",
    subtitle: "Morning, evening, sleep and after-prayer remembrances",
    home: "Home",
    description:
      "A curated collection of authentic adhkar from the Sunnah, with an interactive counter for your daily remembrance routine.",
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
      canonical: `/${l}/adhkar`,
      languages: {
        ar: "/ar/adhkar",
        en: "/en/adhkar",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/adhkar`,
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

export default async function AdhkarPage({
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

      <AdhkarContent lang={l} />
    </main>
  );
}