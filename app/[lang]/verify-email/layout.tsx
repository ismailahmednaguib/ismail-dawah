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
    title: isAr ? "تفعيل البريد الإلكتروني" : "Verify your email",
    description: isAr
      ? "أكّد بريدك الإلكتروني لتفعيل حسابك في منصة إسماعيل أحمد نجيب الدعوية."
      : "Confirm your email address to activate your Ismail Ahmed Naguib Dawah Platform account.",
    robots: { index: false, follow: false },
  };
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
