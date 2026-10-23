// app/[lang]/forgot-password/page.tsx
// طلب رابط استعادة كلمة المرور.

import { notFound } from "next/navigation";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";
import ForgotPasswordClient from "./ForgotPasswordClient";

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function ForgotPasswordPage({
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
      className="site-page-shell"
    >
      <Header lang={l} />

      <TopBar
        title={isRTL ? "استعادة كلمة المرور" : "Password recovery"}
        titleAs="h1"
        subtitle={
          isRTL
            ? "سنرسل لك رابطًا آمنًا لإعادة التعيين"
            : "We will send you a secure reset link"
        }
        backHref={`/${l}/login`}
        showBookmark={false}
        breadcrumb={[
          { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
          { label: isRTL ? "استعادة كلمة المرور" : "Password recovery" },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          <ForgotPasswordClient lang={l} />
        </div>
      </section>

      <Footer lang={l} />
    </main>
  );
}
