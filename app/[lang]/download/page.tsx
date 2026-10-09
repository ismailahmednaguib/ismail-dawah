// app/[lang]/download/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

export const dynamic = "force-static";

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  androidApp: string;
  betaNotice: string;
  fileName: string;
  version: string;
  fileSize: string;
  requirements: string;
  platform: string;
  downloadApk: string;
  directLink: string;
  backHome: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  note4: string;
};

const DIRECT_APK_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ??
  "https://fwzasbyojjxycxvuvleo.supabase.co/storage/v1/object/public/site/app/ismail-dawah.apk";

const PROXY_DOWNLOAD_URL = "/api/download/android";

const FILE_NAME = "ismail-dawah.apk";
const VERSION = "0.1.0-beta";
const FILE_SIZE = "5–6 MB";
const REQUIREMENTS = "Android 8.0+";

const UI: Record<Lang, UILang> = {
  ar: {
    title: "تحميل التطبيق",
    subtitle: "حمّل نسخة أندرويد من منصة إسماعيل أحمد نجيب",
    home: "الرئيسية",
    description:
      "صفحة تحميل تطبيق منصة إسماعيل أحمد نجيب الدعوية لأجهزة أندرويد. التطبيق يفتح المنصة كتطبيق مستقل على هاتفك.",
    androidApp: "تطبيق أندرويد",
    betaNotice: "نسخة تجريبية",
    fileName: "اسم الملف",
    version: "الإصدار",
    fileSize: "حجم الملف",
    requirements: "المتطلبات",
    platform: "المنصة",
    downloadApk: "تحميل APK",
    directLink: "رابط التحميل المباشر",
    backHome: "العودة للرئيسية",
    noteTitle: "ملاحظات مهمة",
    note1:
      "هذا الملف لتطبيق أندرويد فقط، ولا يعمل على iPhone أو iPad.",
    note2:
      "بعد التحميل، قد يطلب منك الهاتف السماح بتثبيت التطبيقات من مصادر غير معروفة، وهذا طبيعي عند تثبيت APK خارج Google Play.",
    note3:
      "لو كان عندك نسخة قديمة مثبتة، يُفضّل حذفها أولًا ثم تثبيت النسخة الجديدة إذا ظهر خطأ في التوقيع.",
    note4:
      "هذه نسخة تجريبية، وقد يتم تحديثها بإذن الله بإصدارات أفضل.",
  },
  en: {
    title: "Download App",
    subtitle: "Download the Android app for Ismail Ahmed Naguib Platform",
    home: "Home",
    description:
      "Download page for the Ismail Ahmed Naguib Dawah Platform Android app. The app opens the platform as a standalone application on your phone.",
    androidApp: "Android App",
    betaNotice: "Beta Version",
    fileName: "File name",
    version: "Version",
    fileSize: "File size",
    requirements: "Requirements",
    platform: "Platform",
    downloadApk: "Download APK",
    directLink: "Direct download link",
    backHome: "Back to Home",
    noteTitle: "Important notes",
    note1:
      "This file is for Android only and does not work on iPhone or iPad.",
    note2:
      "After downloading, your phone may ask you to allow installation from unknown sources. This is normal when installing an APK outside Google Play.",
    note3:
      "If you have an older version installed, it is recommended to remove it first and then install the new version if a signature error appears.",
    note4:
      "This is a beta version and may be updated with better releases, inshaAllah.",
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
      canonical: `/${l}/download`,
      languages: {
        ar: "/ar/download",
        en: "/en/download",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/download`,
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

export default async function DownloadPage({
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isRTL ? "منصة إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib Platform",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Android",
    softwareVersion: VERSION,
    downloadUrl: DIRECT_APK_URL,
    description: ui.description,
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

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
            <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
              <span className="badge-primary">
                📱 {ui.androidApp}
              </span>

              <span className="badge-gold">
                🧪 {ui.betaNotice}
              </span>
            </div>

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

        {/* ===== بطاقة التحميل ===== */}
        <div className="card mb-8 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
              <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {ui.fileName}
              </p>

              <p className="break-all text-lg font-black text-slate-900 dark:text-white">
                {FILE_NAME}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
              <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {ui.version}
              </p>

              <p className="text-lg font-black text-slate-900 dark:text-white">
                {VERSION}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
              <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {ui.fileSize}
              </p>

              <p className="text-lg font-black text-slate-900 dark:text-white">
                {FILE_SIZE}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
              <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {ui.requirements}
              </p>

              <p className="text-lg font-black text-slate-900 dark:text-white">
                {REQUIREMENTS}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PROXY_DOWNLOAD_URL}
              download={FILE_NAME}
              className="btn-primary"
            >
              ⬇️ {ui.downloadApk}
            </a>

            <Link href={`/${l}`} className="btn-outline">
              {ui.backHome}
            </Link>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRTL ? "متوفر لأندرويد فقط" : "Available for Android only"}
          </p>
        </div>

        {/* ===== ملاحظات ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <h2
            className="mb-5 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3, ui.note4].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center">
            <a
              href={DIRECT_APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-primary-700 underline dark:text-primary-300"
            >
              {ui.directLink}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}