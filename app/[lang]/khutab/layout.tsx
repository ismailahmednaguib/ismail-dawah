import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";
  const title = isAr ? "الخطب والمحاضرات" : "Khutbahs & Lectures";
  const description = isAr
    ? "خطب الجمعة والمحاضرات الدعوية والعلمية من منصة اكتشف الإسلام."
    : "Friday sermons and scholarly Dawah lectures from the Discover Islam platform.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/khutab`,
      languages: { ar: "/ar/khutab", en: "/en/khutab" },
    },
    openGraph: { title, description, url: `/${lang}/khutab`, type: "website" },
  };
}

export default function KhutabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
