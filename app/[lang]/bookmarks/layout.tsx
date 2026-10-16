import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";
  const title = isAr ? "الإشارات المرجعية" : "Bookmarks";
  const description = isAr
    ? "المحتوى الذي حفظته للرجوع إليه لاحقًا."
    : "Content you saved for later.";

  return {
    title,
    description,
    alternates: { canonical: `/${lang}/bookmarks` },
    // صفحة شخصية: لا نريد فهرستها.
    robots: { index: false, follow: true },
  };
}

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
