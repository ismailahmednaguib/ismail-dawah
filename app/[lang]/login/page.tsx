// app/[lang]/login/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import LoginForm from "@/components/auth/LoginForm";

// ============================================================
// UI Text
// ============================================================

const PAGE_UI: Record<string,
  {
    title: string;
    subtitle: string;
    description: string;
    home: string;
  }
> = {
  ar: {
    title: "تسجيل الدخول",
    subtitle: "ادخل إلى حسابك في منصة إسماعيل أحمد نجيب الدعوية",
    description:
      "صفحة تسجيل الدخول الموحدة للمستخدمين والأدمن في منصة إسماعيل أحمد نجيب الدعوية.",
    home: "الرئيسية",
  },
  en: {
    title: "Sign In",
    subtitle: "Sign in to your Ismail Ahmed Naguib Platform account",
    description:
      "Unified sign-in page for users and admins on the Ismail Ahmed Naguib Dawah Platform.",
    home: "Home",
  },
};

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = PAGE_UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/login`,
      languages: {
        ar: "/ar/login",
        en: "/en/login",
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// Page
// ============================================================

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = PAGE_UI[l];
  const isRTL = l === "ar";

  return (
    <main id="main-content" tabIndex={-1}
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-cream-dark dark:bg-gray-900"
    >
      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <LoginForm lang={l} />
      </section>

      <Footer lang={l} />
    </main>
  );
}
