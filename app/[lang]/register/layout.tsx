import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang !== "en";
  const title = isAr ? "إنشاء حساب" : "Create Account";
  const description = isAr
    ? "أنشئ حسابك لمتابعة تقدمك وحفظ المحتوى."
    : "Create your account to track progress and save content.";

  return {
    title,
    description,
    alternates: { canonical: `/${lang}/register` },
    robots: { index: false, follow: true },
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
