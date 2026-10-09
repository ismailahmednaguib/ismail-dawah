// app/[lang]/quran-memorization/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import MemorizationPlan from "./MemorizationPlan";

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
    title: "خطة حفظ القرآن",
    subtitle: "نظّم وردك اليومي من الحفظ والمراجعة",
    home: "الرئيسية",
    description:
      "خطة عملية لحفظ القرآن الكريم: اختر السورة، حدد هدفك اليومي من الآيات، وتابع تقدمك مع عدّاد تفاعلي وإحصائيات يومية.",
  },
  en: {
    title: "Quran Memorization Plan",
    subtitle: "Organize your daily portion of memorization and revision",
    home: "Home",
    description:
      "A practical plan for memorizing the Quran: choose a surah, set your daily ayah goal, and track your progress with an interactive counter and statistics.",
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
      canonical: `/${l}/quran-memorization`,
      languages: {
        ar: "/ar/quran-memorization",
        en: "/en/quran-memorization",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${l}/quran-memorization`,
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

export default async function QuranMemorizationPage({
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

      <MemorizationPlan lang={l} />
    </main>
  );
}