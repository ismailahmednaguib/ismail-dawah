import type { Metadata } from "next";

/**
 * بيانات SEO في ملف layout لتُحقن في <head> أثناء العرض الأول.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";

  return {
    title: isAr ? "إعادة تعيين كلمة المرور" : "Reset password",
    description: isAr
      ? "اختر كلمة مرور جديدة لحسابك في منصة اكتشف الإسلام."
      : "Choose a new password for your Discover Islam account.",
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
