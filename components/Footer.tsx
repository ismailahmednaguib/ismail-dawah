// components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";
import { mergePagesVisibility, isHrefHidden } from "@/lib/page-sections";
import {
  NAV_TREE,
  applyNavigationConfig,
  navHref,
  navLabel,
} from "@/lib/navigation";

type FooterProps = {
  lang?: Lang;
  settings?: Record<string, unknown> | null;
  /** اخفِ قسم النشرة (مثلاً في الصفحة الرئيسية اللي فيها كارت نشرة خاص بيها) */
  showNewsletter?: boolean;
  /** شيل الهامش العلوي (mt-24) — مفيد لما الصفحة بتنتهي بسكشن ملوّن */
  flushTop?: boolean;
};

type Status = "idle" | "loading" | "done" | "error";

function settingUrl(value: unknown, lang: Lang): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of [lang, "ar", "en"]) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return "";
}

export default function Footer({
  lang: langProp,
  settings,
  showNewsletter = true,
  flushTop = false,
}: FooterProps) {
  const pathname = usePathname() ?? "/";

  const lang: Lang =
    langProp || (pathname.split("/")[1] === "en" ? "en" : "ar");
  const isRTL = lang === "ar";

  const [remoteSettings, setRemoteSettings] = useState<Record<string, unknown> | null>(null);
  const effectiveSettings = remoteSettings ?? settings ?? null;

  const ownerRaw = effectiveSettings?.ownerName;
  const ownerText =
    typeof ownerRaw === "string"
      ? ownerRaw.trim()
      : ownerRaw && typeof ownerRaw === "object"
      ? String((ownerRaw as Record<string, unknown>)[lang] ?? "").trim()
      : "";
  // لا نُسرّب نصًا عربيًا إلى الواجهة الإنجليزية عند غياب ترجمة حقيقية للإعداد.
  const ownerIsArabic = /[\u0600-\u06FF]/.test(ownerText);

  const brandName =
    ownerText.length > 0 && (isRTL || !ownerIsArabic)
      ? ownerText
      : isRTL
      ? SITE_NAME
      : SITE_NAME_EN;

  useEffect(() => {
    let cancelled = false;

    void fetch('/api/site-settings', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.settings && typeof data.settings === 'object') {
          const nextSettings = data.settings as Record<string, unknown>;
          if (Object.keys(nextSettings).length > 0) {
            setRemoteSettings(nextSettings);
          }
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const socialLinks: Array<[string, string]> = ([
    ["Facebook", effectiveSettings?.facebookUrl],
    ["YouTube", effectiveSettings?.youtubeUrl],
    ["Telegram", effectiveSettings?.telegramUrl],
    ["X", effectiveSettings?.twitterUrl],
    ["Instagram", effectiveSettings?.instagramUrl],
  ] as Array<[string, unknown]>).flatMap(([label, value]) => {
    const url = settingUrl(value, lang);
    return /^https?:\/\//i.test(url) ? [[label, url]] : [];
  });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = email.trim();
    if (!value || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, lang }),
      });

      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // الأعمدة تُبنى من هيكل التنقّل (lib/navigation) وتتأثر بإعدادات اللوحة.
  const navTree = applyNavigationConfig(
    (effectiveSettings as Record<string, unknown> | null)?.navigation,
    NAV_TREE
  );

  const columns = (
    [
      { key: "sciences", fallbackTitle: isRTL ? "العلوم الشرعية" : "Sciences" },
      { key: "tools", fallbackTitle: isRTL ? "الأدوات الإسلامية" : "Tools" },
      { key: "about", fallbackTitle: isRTL ? "عن المنصة" : "About" },
    ] as Array<{ key: string; fallbackTitle: string }>
  )
    .map(({ key, fallbackTitle }) => {
      const group = navTree.find((node) => node.key === key);
      const leaves = group ? group.children ?? [group] : [];
      return {
        title: group ? navLabel(group, lang) : fallbackTitle,
        links: leaves.map((child) => ({
          href: `/${lang}${navHref(child)}`,
          label: navLabel(child, lang),
        })),
      };
    })
    .filter((col) => col.links.length > 0);

  const aboutText = t(lang, "about");
  const contactText = t(lang, "contact");
  const privacyText = t(lang, "privacy");
  const termsText = t(lang, "terms");

  // إخفاء روابط الصفحات المخفية من لوحة التحكم.
  const hiddenPages = mergePagesVisibility(
    (effectiveSettings as Record<string, unknown> | null)?.hiddenPages
  );
  const visibleColumns = columns
    .map((col) => ({
      ...col,
      links: col.links.filter((link) => !isHrefHidden(hiddenPages, link.href)),
    }))
    .filter((col) => col.links.length > 0);

  const successMsg = isRTL
    ? "تم الاشتراك بنجاح! شكرًا لك."
    : "Successfully subscribed! Thank you.";
  const errorMsg = isRTL
    ? "حدث خطأ، يرجى المحاولة مرة أخرى."
    : "An error occurred, please try again.";

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className={`${flushTop ? "" : "mt-24"} text-white`}
      style={{
        background:
          "linear-gradient(160deg, #083344 0%, #0e7490 60%, #083344 130%)",
      }}
    >
      {/* ===== النشرة البريدية ===== */}
      {showNewsletter && (
        <div className="border-b border-white/10">
          <div className="container-page py-14">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4, #0e7490)",
                    }}
                  >
                    📬
                  </span>
                  <h2
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {t(lang, "newsletter_title")}
                  </h2>
                </div>
                <p className="leading-relaxed text-primary-100">
                  {t(lang, "newsletter_desc")}
                </p>
              </div>

              <form
                onSubmit={subscribe}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  dir="ltr"
                  autoComplete="email"
                  aria-label={t(lang, "email_placeholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "done" || status === "error") {
                      setStatus("idle");
                    }
                  }}
                  placeholder={t(lang, "email_placeholder")}
                  className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white placeholder-slate-300 outline-none transition-all focus:border-primary-300 focus:bg-white/15"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary whitespace-nowrap disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "loading" ? "..." : t(lang, "subscribe")}
                </button>
              </form>
            </div>

            <div role="status" aria-live="polite" className="min-h-6">
              {status === "done" && (
                <p className="mt-4 text-center text-sm text-primary-200">
                  ✓ {successMsg}
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-center text-sm text-red-300">
                  ✗ {errorMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== الأعمدة ===== */}
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link
              href={`/${lang}`}
              className="mb-4 flex items-center gap-3"
              aria-label={brandName}
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0e7490)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
                  <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
                </svg>
              </span>
              <span className="text-xl font-bold">{brandName}</span>
            </Link>

            <p className="mb-6 max-w-xs leading-relaxed text-primary-100">
              {t(lang, "footer_about_text")}
            </p>

            {/* أزرار أيقونات — aria-label عشان يبقى ليها اسم مفهوم */}
            <div className="flex gap-3">
              <Link
                href={`/${lang}/about`}
                aria-label={aboutText}
                title={aboutText}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </Link>
              <Link
                href={`/${lang}/contact`}
                aria-label={contactText}
                title={contactText}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </Link>
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map(([label, value]) => (
                  <a
                    key={label}
                    href={String(value)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-primary-100 transition hover:bg-gold-500 hover:text-primary-950"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {visibleColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 font-bold" style={{ color: "#d4af37" }}>
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-primary-100 transition-colors hover:text-primary-300"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-gold-500 transition-all group-hover:w-3"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
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
              : "\u201CMy Lord, increase me in knowledge\u201D"}
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
            © {new Date().getFullYear()} {brandName} —{" "}
            {t(lang, "footer_copyright")}
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link
              href={`/${lang}/about`}
              className="transition-colors hover:text-primary-300"
            >
              {aboutText}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="transition-colors hover:text-primary-300"
            >
              {contactText}
            </Link>
            <Link
              href={`/${lang}/privacy`}
              className="transition-colors hover:text-primary-300"
            >
              {privacyText}
            </Link>
            <Link
              href={`/${lang}/terms`}
              className="transition-colors hover:text-primary-300"
            >
              {termsText}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
