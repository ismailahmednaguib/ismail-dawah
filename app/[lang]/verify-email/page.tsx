// app/[lang]/verify-email/page.tsx
// صفحة استقبال رابط التفعيل — تقرأ الرمز من الرابط ثم يستهلكه العميل عبر POST.

import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";
import VerifyEmailClient from "./VerifyEmailClient";

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const isRTL = l === "ar";

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
          <Suspense fallback={null}>
            <VerifyEmailClient lang={l} />
          </Suspense>
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}
