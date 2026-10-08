import { t, type Lang } from "@/lib/i18n";
import type { Metadata } from "next";
import AdhkarContent from "./adhkar-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang === "en" ? "en" : "ar") as Lang;

  return {
    title: t(l, "adhkar.title"),
    description: t(l, "adhkar.subtitle"),
    alternates: {
      canonical: `/${l}/adhkar`,
    },
  };
}

export default async function AdhkarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (lang === "en" ? "en" : "ar") as Lang;

  return <AdhkarContent lang={l} />;
}