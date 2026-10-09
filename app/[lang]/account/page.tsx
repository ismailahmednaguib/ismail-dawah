// app/[lang]/account/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

type AccountUI = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  login: string;
  loginDesc: string;
  register: string;
  registerDesc: string;
  bookmarks: string;
  bookmarksDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
};

const UI: Record<Lang, AccountUI> = {
  ar: {
    title: "الحساب",
    subtitle: "تسجيل الدخول وإنشاء الحساب والمتابعة",
    home: "الرئيسية",
    description:
      "صفحة الحساب في منصة إسماعيل أحمد نجيب الدعوية. يمكنك تسجيل الدخول أو إنشاء حساب جديد لحفظ المفضلة ومتابعة التقدم.",
    login: "تسجيل الدخول",
    loginDesc: "ادخل إلى حسابك إذا كان لديك حساب مسبقًا.",
    register: "إنشاء حساب",
    registerDesc: "أنشئ حسابًا جديدًا لحفظ المفضلة ومتابعة التقدم.",
    bookmarks: "المفضلة",
    bookmarksDesc: "راجع العناصر التي حفظتها سابقًا.",
    noteTitle: "ملاحظة",
    note1:
      "هذه الصفحة نسخة مبسطة وآمنة للبناء، ويمكن تطويرها لاحقًا لتصبح لوحة حساب كاملة.",
    note2:
      "لو واجهت مشكلة في تسجيل الدخول، تواصل معنا عبر صفحة تواصل معنا.",
  },
  en: {
    title: "Account",
    subtitle: "Sign in, register, and track progress",
    home: "Home",
    description:
      "Account page for the Ismail Ahmed Naguib Dawah Platform. You can sign in or create a new account to save bookmarks and track progress.",
    login: "Sign In",
    loginDesc: "Enter your account if you already have one.",
    register: "Create Account",
    registerDesc: "Create a new account to save bookmarks and track progress.",
    bookmarks: "Bookmarks",
    bookmarksDesc: "Review items you saved earlier.",
    noteTitle: "Notice",
    note1:
      "This page is a simplified safe build version and can be developed later into a full account dashboard.",
    note2:
      "If you face a sign-in issue, contact us through the Contact Us page.",
  },
};

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
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/account`,
      languages: {
        ar: "/ar/account",
        en: "/en/account",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/account`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              👤 {isRTL ? "منطقة المستخدم" : "User Area"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>
          </div>
        </div>

        {/* ===== بطاقات الحساب ===== */}
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href={`/${l}/login`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7"
          >
            <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                🔐
              </span>

              <div className="min-w-0">
                <h2
                  className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.login}
                </h2>

                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.loginDesc}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
              {isRTL ? "فتح صفحة الدخول" : "Open sign in"}

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          <Link
            href={`/${l}/register`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7"
          >
            <div className="gradient-gold absolute inset-x-0 top-0 h-1" />

            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
                ✨
              </span>

              <div className="min-w-0">
                <h2
                  className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-gold-700 dark:text-white dark:group-hover:text-gold-300"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {ui.register}
                </h2>

                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                  {ui.registerDesc}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-gold-700 dark:text-gold-300">
              {isRTL ? "إنشاء حساب جديد" : "Create new account"}

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          <Link
            href={`/${l}/bookmarks`}
            className="card card-interactive group relative overflow-hidden p-6 md:p-7 md:col-span-2"
          >
            <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                  🔖
                </span>

                <div className="min-w-0">
                  <h2
                    className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {ui.bookmarks}
                  </h2>

                  <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {ui.bookmarksDesc}
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                {isRTL ? "عرض المفضلة" : "View bookmarks"}

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        {/* ===== ملاحظة ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h2
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h2>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${l}/contact`} className="btn-primary">
                  {isRTL ? "تواصل معنا" : "Contact Us"}
                </Link>

                <Link href={`/${l}`} className="btn-outline">
                  {ui.home}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}