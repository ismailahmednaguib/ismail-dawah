// app/[lang]/reset-password/page.tsx
// صفحة استقبال رابط الاستعادة — تقرأ الرمز ثم يستهلكه العميل عبر POST.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور | Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const isRTL = l === "ar";
  const query = await searchParams;
  const rawToken = query?.token;
  const token =
    typeof rawToken === "string"
      ? rawToken
      : Array.isArray(rawToken)
        ? rawToken[0] ?? ""
        : "";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-cream-dark dark:bg-gray-900"
    >
      <Header lang={l} />

      <TopBar
        title={isRTL ? "إعادة تعيين كلمة المرور" : "Reset password"}
        titleAs="h1"
        subtitle={
          isRTL ? "اختر كلمة مرور جديدة قوية" : "Choose a new strong password"
        }
        backHref={`/${l}/login`}
        showBookmark={false}
        breadcrumb={[
          { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
          { label: isRTL ? "إعادة تعيين كلمة المرور" : "Reset password" },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          <ResetPasswordClient lang={l} token={token} />
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}
