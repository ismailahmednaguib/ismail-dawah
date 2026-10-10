// components/Footer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

// ============================================================
// الأنواع
// ============================================================

type FooterProps = {
  lang?: Lang;
  settings?: any;
};

// ============================================================
// المكون الرئيسي
// ============================================================

export default function Footer({ lang: langProp, settings }: FooterProps) {
  const pathname = usePathname();
  
  // ✅ استخدام langProp إذا مُرر، أو استخراجه من pathname
  const lang: Lang = langProp || (pathname.split("/")[1] === "en" ? "en" : "ar");
  const isRTL = lang === "ar";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), lang }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  // ============================================================
  // الروابط - مع استخدام المفاتيح الصحيحة من translations.ts
  // ============================================================

  const worshipLinks = [
    { href: `/${lang}/quran`, label: t(lang, "quran") },
    { href: `/${lang}/prayer-times`, label: t(lang, "prayer_times") },
    { href: `/${lang}/adhkar`, label: t(lang, "adhkar") },
    { href: `/${lang}/qibla`, label: t(lang, "qibla") },
    { href: `/${lang}/tasbih`, label: t(lang, "tasbih") },
  ];

  const knowledgeLinks = [
    { href: `/${lang}/fatwa`, label: t(lang, "fatwa") },
    { href: `/${lang}/atheism-response`, label: t(lang, "atheism_response") },
    { href: `/${lang}/doubts`, label: t(lang, "doubts") },
    { href: `/${lang}/prophets-stories`, label: t(lang, "prophets_stories") },
    { href: `/${lang}/inheritance`, label: t(lang, "inheritance") },
  ];

  const dawahLinks = [
    { href: `/${lang}/dawah-guide`, label: t(lang, "dawah_guide") },
    { href: `/${lang}/projects`, label: t(lang, "projects") },
    { href: `/${lang}/khutab`, label: t(lang, "khutab") },
    { href: `/${lang}/live`, label: t(lang, "live") },
    { href: `/${lang}/embrace-islam`, label: t(lang, "embrace_islam") },
  ];

  // نصوص الأعمدة
  const worshipTitle = isRTL ? "العبادات" : "Worship";
  const knowledgeTitle = isRTL ? "العلوم والردود" : "Knowledge & Responses";
  const dawahTitle = isRTL ? "الدعوة" : "Dawah";

  const columns = [
    { title: worshipTitle, links: worshipLinks },
    { title: knowledgeTitle, links: knowledgeLinks },
    { title: dawahTitle, links: dawahLinks },
  ];

  // نصوص النشرة البريدية
  const newsletterTitle = isRTL ? "اشترك في النشرة البريدية" : "Subscribe to our Newsletter";
  const newsletterDesc = isRTL 
    ? "صلك جديد المحتوى الدعوي والدروس والفتاوى أولاً بأول" 
    : "Get the latest Dawah content, lessons, and fatwas as soon as they're published";
  const newsletterPlaceholder = isRTL ? "بريدك الإلكتروني" : "Your email address";
  const newsletterSubscribe = isRTL ? "اشترك" : "Subscribe";
  const newsletterSuccess = isRTL ? "تم الاشتراك بنجاح! شكراً لك." : "Successfully subscribed! Thank you.";
  const newsletterError = isRTL ? "حدث خطأ، يرجى المحاولة مرة أخرى." : "An error occurred, please try again.";

  // نصوص الفوتر
  const aboutText = t(lang, "about");
  const contactText = t(lang, "contact");
  const privacyText = t(lang, "privacy");
  const rightsText = isRTL ? "جميع الحقوق محفوظة" : "All rights reserved";

  return (
    <footer className="mt-24 text-white"
      style={{ background: "linear-gradient(160deg, #083344 0%, #0e7490 60%, #083344 130%)" }}
    >
      {/* ===== النشرة البريدية ===== */}
      <div className="border-b border-white/10">
        <div className="container-page py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-lg"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
                >
                  📬
                </span>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-amiri)" }}>
                  {newsletterTitle}
                </h3>
              </div>
              <p className="leading-relaxed text-primary-100">
                {newsletterDesc}
              </p>
            </div>

            <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletterPlaceholder}
                className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white placeholder-slate-300 outline-none transition-all focus:border-primary-300 focus:bg-white/15"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary whitespace-nowrap disabled:cursor-wait"
              >
                {status === "loading"
                  ? "..."
                  : status === "done"
                  ? "✓ " + (isRTL ? "تم" : "Done")
                  : newsletterSubscribe}
              </button>
            </form>
          </div>

          {/* رسائل الحالة */}
          {status === "done" && (
            <p className="mt-4 text-center text-sm text-primary-200">
              ✓ {newsletterSuccess}
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-center text-sm text-red-300">
              ✗ {newsletterError}
            </p>
          )}
        </div>
      </div>

      {/* ===== الأعمدة ===== */}
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* الشعار والوصف */}
          <div className="col-span-2">
            <Link href={`/${lang}`} className="mb-4 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
                  <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
                </svg>
              </span>
              <span className="text-xl font-bold">
                {isRTL ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib"}
              </span>
            </Link>

            <p className="mb-6 max-w-xs leading-relaxed text-primary-100">
              {isRTL
                ? "منصة دعوية شاملة تجمع القرآن والسنة والعلوم الشرعية وأدوات الدعوة في مكان واحد، بلغات متعددة."
                : "A comprehensive Dawah platform combining Quran, Sunnah, Islamic sciences and Dawah tools in one place, in multiple languages."}
            </p>

            {/* روابط سريعة */}
            <div className="flex gap-3">
              <Link
                href={`/${lang}/about`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
                title={aboutText}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
                title={contactText}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* أعمدة الروابط */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-bold" style={{ color: "#d4af37" }}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-primary-100 transition-colors hover:text-primary-300"
                    >
                      <span className="h-1 w-1 rounded-full bg-gold-500 transition-all group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ===== آية ختامية ===== */}
      <div className="border-t border-white/10">
        <div className="container-page py-8 text-center">
          <p
            className="text-lg text-primary-200 md:text-xl"
            style={{ fontFamily: "var(--font-quran)" }}
          >
            {isRTL
              ? "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾"
              : "\"My Lord, increase me in knowledge\""}
          </p>
          <p className="mt-2 text-xs text-primary-300/70">
            {isRTL ? "سورة طه — الآية 114" : "Surah Taha — Verse 114"}
          </p>
        </div>
      </div>

      {/* ===== الحقوق ===== */}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-xs text-primary-200/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            {isRTL
              ? "إسماعيل أحمد نجيب — " + rightsText
              : "Ismail Ahmed Naguib — " + rightsText}
          </p>
          <div className="flex gap-5">
            <Link href={`/${lang}/about`} className="transition-colors hover:text-primary-300">
              {aboutText}
            </Link>
            <Link href={`/${lang}/contact`} className="transition-colors hover:text-primary-300">
              {contactText}
            </Link>
            <Link href={`/${lang}/privacy`} className="transition-colors hover:text-primary-300">
              {privacyText}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}