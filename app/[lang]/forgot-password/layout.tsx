import type { Metadata } from "next";

/**
 * بيانات SEO في ملف layout لتُحقن في <head> أثناء العرض الأول،
 * بدلًا من تدفّقها داخل <body> كما يحدث عندما تُعرَّف في الصفحة الديناميكية.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";

  return {
    title: isAr ? "نسيت كلمة المرور" : "Forgot password",
    description: isAr
      ? "اطلب رابطًا آمنًا لاستعادة كلمة مرور حسابك في منصة إسماعيل أحمد نجيب الدعوية."
      : "Request a secure password reset link for your Ismail Ahmed Naguib Dawah Platform account.",
    robots: { index: false, follow: false },
  };
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
