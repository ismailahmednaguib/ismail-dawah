// app/[lang]/verify-email/page.tsx
// صفحة استقبال رابط التفعيل — تقرأ الرمز من الرابط ثم يستهلكه العميل عبر POST.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";
import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ar" ? "تفعيل البريد الإلكتروني" : "Verify your email",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage({
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
        title={isRTL ? "تفعيل البريد" : "Email verification"}
        titleAs="h1"
        subtitle={
          isRTL
            ? "خطوة واحدة لتفعيل حسابك"
            : "One step to activate your account"
        }
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
          { label: isRTL ? "تفعيل البريد" : "Email verification" },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          <VerifyEmailClient lang={l} token={token} />
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}
