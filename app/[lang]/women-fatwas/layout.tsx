import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";
  const title = isAr ? "فتاوى النساء" : "Women's Fatwas";
  const description = isAr
    ? "فتاوى وأحكام شرعية تخص المرأة المسلمة في العبادة والأسرة والمعاملات."
    : "Rulings and fatwas concerning Muslim women in worship, family and transactions.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/women-fatwas`,
      languages: { ar: "/ar/women-fatwas", en: "/en/women-fatwas" },
    },
    openGraph: { title, description, url: `/${lang}/women-fatwas`, type: "website" },
  };
}

export default function WomenFatwasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
