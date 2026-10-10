"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Lang = "ar" | "en";

type NotFoundCopy = {
  documentTitle: string;
  title: string;
  subtitle: string;
  verse: string;
  translation?: string;
  source: string;
  homeIcon: string;
  home: string;
  searchIcon: string;
  search: string;
  footer: string;
  homeHref: string;
  searchHref: string;
};

const COPY: Record<Lang, NotFoundCopy> = {
  ar: {
    documentTitle: "الصفحة غير موجودة | إسماعيل أحمد نجيب",
    title: "الصفحة غير موجودة",
    subtitle: "ربما تم نقل الصفحة أو حذفها أو تغيير رابطها.",
    verse: "﴿ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ﴾",
    source: "سورة آل عمران — الآية 159",
    homeIcon: "🏠",
    home: "الصفحة الرئيسية",
    searchIcon: "🔍",
    search: "البحث في الموقع",
    footer: "منصة إسماعيل أحمد نجيب الدعوية",
    homeHref: "/ar",
    searchHref: "/ar/search",
  },
  en: {
    documentTitle: "Page Not Found | Ismail Ahmed Naguib",
    title: "Page Not Found",
    subtitle: "This page may have been moved, deleted, or renamed.",
    verse: "﴿ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ﴾",
    translation: "“When you have decided, then rely upon Allah.”",
    source: "Quran 3:159",
    homeIcon: "🏠",
    home: "Home",
    searchIcon: "🔍",
    search: "Search",
    footer: "Ismail Ahmed Naguib Dawah Platform",
    homeHref: "/en",
    searchHref: "/en/search",
  },
};

export default function NotFound() {
  const pathname = usePathname();

  const lang: Lang = pathname?.startsWith("/en") ? "en" : "ar";
  const t = COPY[lang];

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  return (
    <main
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-night-950 px-4 py-16 text-white"
    >
      {/* خلفية متدرجة */}
      <div
        className="absolute inset-0 bg-gradient-hero opacity-95"
        aria-hidden="true"
      />

      {/* خط ذهبي علوي */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
        aria-hidden="true"
      />

      {/* توهجات زخرفية */}
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-80 w-80 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in text-center">
        {/* أيقونة المسجد */}
        <div
          className="mx-auto mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full border border-gold-400/30 bg-gold-500/15 text-6xl shadow-xl"
          aria-hidden="true"
        >
          🕌
        </div>

        {/* رقم 404 */}
        <h1 className="font-amiri text-7xl font-black leading-none text-gold-400 sm:text-8xl md:text-9xl">
          404
        </h1>

        <div className="mx-auto mt-6 mb-6 h-px w-32 bg-gold-400/50" />

        {/* العنوان */}
        <h2 className="font-amiri text-3xl font-bold sm:text-4xl">
          {t.title}
        </h2>

        <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">
          {t.subtitle}
        </p>

        {/* الآية */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
          <p
            className="font-quran text-xl leading-loose text-gold-300 sm:text-2xl"
            dir="rtl"
            lang="ar"
          >
            {t.verse}
          </p>

          {t.translation ? (
            <p
              className="mt-2 text-sm leading-relaxed text-white/70"
              dir="ltr"
              lang="en"
            >
              {t.translation}
            </p>
          ) : null}

          <p className="mt-3 text-xs text-white/60">{t.source}</p>
        </section>

        {/* الأزرار */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={t.homeHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-8 py-3 font-bold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-xl"
          >
            <span aria-hidden="true">{t.homeIcon}</span>
            <span>{t.home}</span>
          </Link>

          <Link
            href={t.searchHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            <span aria-hidden="true">{t.searchIcon}</span>
            <span>{t.search}</span>
          </Link>
        </div>

        {/* الفوتر */}
        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
          {t.footer}
        </p>
      </div>
    </main>
  );
}