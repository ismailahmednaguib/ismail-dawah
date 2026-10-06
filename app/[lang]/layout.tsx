import TopBar from "@/components/TopBar";
import { getDir, languages } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!languages.some(l => l.code === lang)) return {};
  const c = await getContent();
  return {
    title: {
      default: c.settings.ownerName,
      template: `%s | ${c.settings.shortName}`,
    },
    description: c.settings.motto,
    alternates: {
      languages: Object.fromEntries(languages.map(l => [l.code, `/${l.code}`])),
    },
    openGraph: {
      type: "website",
      siteName: c.settings.ownerName,
      title: c.settings.ownerName,
      description: c.settings.motto,
      images: c.settings.ogImage ? [c.settings.ogImage] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!languages.some(l => l.code === lang)) notFound();
  const dir = getDir(lang as Lang);
  return (
    <div lang={lang} dir={dir}>
      <TopBar />
      {children}
    </div>
  );
}