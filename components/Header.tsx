// components/Header.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";

// ============================================================
// Types
// ============================================================

type HeaderProps = {
  lang?: Lang;
  settings?: Record<string, unknown> | null;
};

// ============================================================
// Path helpers
// ============================================================

/**
 * Regex آمن للتعرف على بادئة اللغة.
 *
 * يقبل:
 * - /ar
 * - /ar/...
 * - /en
 * - /en/...
 *
 * ولا يخطئ مع:
 * - /archive
 * - /english
 */
const LANG_PATH_REGEX = /^\/(ar|en)(?=\/|$)/;

function normalizePath(path: string | null | undefined): string {
  let p = String(path ?? "/").trim();

  if (!p) {
    p = "/";
  }

  if (!p.startsWith("/")) {
    p = `/${p}`;
  }

  // منع الـ double slash
  p = p.replace(/\/{2,}/g, "/");

  // إزالة الشرطة الأخيرة إلا للجذر
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }

  return p || "/";
}

function getPathWithoutLang(path: string): string {
  const normalized = normalizePath(path);
  const withoutLang = normalized.replace(LANG_PATH_REGEX, "");
  return withoutLang || "/";
}

function getLangFromPath(path: string): Lang {
  const normalized = normalizePath(path);
  const match = normalized.match(LANG_PATH_REGEX);
  return match?.[1] === "en" ? "en" : "ar";
}

function localizedPath(lang: Lang, pathWithoutLang: string): string {
  const normalized = normalizePath(pathWithoutLang);

  if (normalized === "/") {
    return `/${lang}`;
  }

  return `/${lang}${normalized}`;
}

function getText(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

// ============================================================
// Component
// ============================================================

export default function Header({ lang: langProp, settings }: HeaderProps) {
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);

  const normalizedPathname = useMemo(
    () => normalizePath(pathname),
    [pathname]
  );

  const lang = useMemo<Lang>(
    () => langProp || getLangFromPath(normalizedPathname),
    [langProp, normalizedPathname]
  );

  const isRTL = lang === "ar";

  const pathWithoutLang = useMemo(
    () => getPathWithoutLang(normalizedPathname),
    [normalizedPathname]
  );

  const otherLang: Lang = isRTL ? "en" : "ar";

  const switchHref = useMemo(
    () => localizedPath(otherLang, pathWithoutLang),
    [otherLang, pathWithoutLang]
  );

  const brandName = getText(
    settings?.ownerName,
    isRTL ? "إسماعيل أحمد نجيب" : "Ismail Ahmed Naguib"
  );

  const brandTagline = getText(
    settings?.motto,
    isRTL ? "منصة دعوية شاملة" : "Complete Dawah Platform"
  );

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // ==========================================================
  // Scroll effect
  // ==========================================================

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ==========================================================
  // Theme initialization / sync
  // ==========================================================

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const html = document.documentElement;

      if (stored === "dark") {
        html.classList.add("dark");
      } else if (stored === "light") {
        html.classList.remove("dark");
      }

      setDark(html.classList.contains("dark"));
    } catch {
      setDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  // ==========================================================
  // Close menus on route change + sync theme class
  // ==========================================================

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setDark(document.documentElement.classList.contains("dark"));
  }, [pathname]);

  // ==========================================================
  // Escape key closes menus
  // ==========================================================

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // ==========================================================
  // Click outside closes mega menu
  // ==========================================================

  useEffect(() => {
    if (!megaOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!megaRef.current) {
        return;
      }

      if (!megaRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [megaOpen]);

  // ==========================================================
  // Lock body scroll when mobile menu is open
  // ==========================================================

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  // ==========================================================
  // Theme toggle
  // ==========================================================

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const nextDark = !html.classList.contains("dark");

    html.classList.toggle("dark", nextDark);
    setDark(nextDark);

    try {
      localStorage.setItem("theme", nextDark ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, []);

  // ==========================================================
  // Active link helper
  // ==========================================================

  const isActiveHref = useCallback(
    (href: string) => {
      const target = localizedPath(lang, href);
      const normalizedTarget = normalizePath(target);

      // الصفحة الرئيسية تكون نشطة فقط على /ar أو /en
      if (normalizedTarget === `/${lang}`) {
        return normalizedPathname === normalizedTarget;
      }

      // بقية الأقسام تكون نشطة أيضًا على المسارات الفرعية
      return (
        normalizedPathname === normalizedTarget ||
        normalizedPathname.startsWith(`${normalizedTarget}/`)
      );
    },
    [lang, normalizedPathname]
  );

  // ==========================================================
  // Navigation data
  // ==========================================================

  const NAV = useMemo(
    () =>
      isRTL
        ? [
            { href: "", label: "الرئيسية" },
            { href: "/quran", label: "القرآن" },
            { href: "/adhkar", label: "الأذكار" },
            { href: "/prayer-times", label: "مواقيت الصلاة" },
            { href: "/fatwa", label: "الفتاوى" },
            { href: "/live", label: "البث المباشر" },
          ]
        : [
            { href: "", label: "Home" },
            { href: "/quran", label: "Quran" },
            { href: "/adhkar", label: "Adhkar" },
            { href: "/prayer-times", label: "Prayer Times" },
            { href: "/fatwa", label: "Fatwa" },
            { href: "/live", label: "Live" },
          ],
    [isRTL]
  );

  const MENU = useMemo(
    () =>
      isRTL
        ? [
            {
              title: "العبادات",
              items: [
                { href: "/prayer-guide", label: "دليل الصلاة" },
                { href: "/hajj-guide", label: "دليل الحج" },
                { href: "/zakat", label: "الزكاة" },
                { href: "/daily-wird", label: "الورد اليومي" },
                { href: "/quran-memorization", label: "حفظ القرآن" },
              ],
            },
            {
              title: "العلوم والردود",
              items: [
                { href: "/atheism-response", label: "الرد على الإلحاد" },
                { href: "/doubts", label: "الشبهات" },
                { href: "/prophets-stories", label: "قصص الأنبياء" },
                { href: "/inheritance", label: "المواريث" },
                { href: "/learn", label: "تعلّم" },
              ],
            },
            {
              title: "الدعوة",
              items: [
                { href: "/dawah-guide", label: "دليل الدعوة" },
                { href: "/fields", label: "المجالات الدعوية" },
                { href: "/projects", label: "المشاريع" },
                { href: "/khutab", label: "الخطب" },
                { href: "/embrace-islam", label: "ادخل الإسلام" },
              ],
            },
            {
              title: "أدوات",
              items: [
                { href: "/qibla", label: "اتجاه القبلة" },
                { href: "/tasbih", label: "المسبحة" },
                { href: "/calendar", label: "التقويم الهجري" },
                { href: "/ruqyah", label: "الرقية الشرعية" },
                { href: "/search", label: "البحث" },
              ],
            },
          ]
        : [
            {
              title: "Worship",
              items: [
                { href: "/prayer-guide", label: "Prayer Guide" },
                { href: "/hajj-guide", label: "Hajj Guide" },
                { href: "/zakat", label: "Zakat" },
                { href: "/daily-wird", label: "Daily Wird" },
                { href: "/quran-memorization", label: "Quran Memorization" },
              ],
            },
            {
              title: "Knowledge",
              items: [
                { href: "/atheism-response", label: "Atheism Response" },
                { href: "/doubts", label: "Doubts" },
                { href: "/prophets-stories", label: "Prophets Stories" },
                { href: "/inheritance", label: "Inheritance" },
                { href: "/learn", label: "Learn" },
              ],
            },
            {
              title: "Dawah",
              items: [
                { href: "/dawah-guide", label: "Dawah Guide" },
                { href: "/fields", label: "Dawah Fields" },
                { href: "/projects", label: "Projects" },
                { href: "/khutab", label: "Khutbahs" },
                { href: "/embrace-islam", label: "Embrace Islam" },
              ],
            },
            {
              title: "Tools",
              items: [
                { href: "/qibla", label: "Qibla" },
                { href: "/tasbih", label: "Tasbih" },
                { href: "/calendar", label: "Hijri Calendar" },
                { href: "/ruqyah", label: "Ruqyah" },
                { href: "/search", label: "Search" },
              ],
            },
          ],
    [isRTL]
  );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <header
      role="banner"
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 py-3 md:h-20">
          {/* الشعار */}
          <Link
            href={localizedPath(lang, "")}
            className="flex shrink-0 items-center gap-3"
            aria-label={brandName}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0e7490)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 3a9 9 0 1 0 9 9c0-1.5-.4-3-1.2-4.2A7 7 0 0 1 12 3z" />
                <circle cx="17" cy="6" r="1.5" fill="#d4af37" />
              </svg>
            </span>

            <span className="hidden sm:block">
              <span className="block font-black leading-tight text-primary-900 dark:text-white">
                {brandName}
              </span>
              <span className="block text-xs font-semibold text-primary-600 dark:text-primary-300">
                {brandTagline}
              </span>
            </span>
          </Link>

          {/* روابط الديسكتوب */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={isRTL ? "التنقل الرئيسي" : "Main navigation"}
          >
            {NAV.map((item) => {
              const active = isActiveHref(item.href);

              return (
                <Link
                  key={item.href || "home"}
                  href={localizedPath(lang, item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-all ${
                    active
                      ? "bg-primary-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-night-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* قائمة المزيد */}
            <div className="relative" ref={megaRef}>
              <button
                type="button"
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((prev) => !prev)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                aria-controls="mega-menu"
                className="flex cursor-pointer items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-night-800"
              >
                {isRTL ? "المزيد" : "More"}

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                  focusable="false"
                  className={`transition-transform ${
                    megaOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {megaOpen && (
                <div
                  id="mega-menu"
                  className={`absolute top-full mt-2 grid w-[min(640px,calc(100vw-2rem))] grid-cols-4 gap-4 rounded-3xl border border-primary-100 bg-white p-6 shadow-2xl animate-fade-in dark:border-night-700 dark:bg-night-800 ${
                    isRTL ? "left-0" : "right-0"
                  }`}
                >
                  {MENU.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-xs font-black tracking-wide text-gold-500">
                        {group.title}
                      </p>

                      <div className="flex flex-col gap-1">
                        {group.items.map((it) => {
                          const active = isActiveHref(it.href);

                          return (
                            <Link
                              key={it.href}
                              href={localizedPath(lang, it.href)}
                              aria-current={active ? "page" : undefined}
                              className={`py-1 text-sm font-semibold transition-colors ${
                                active
                                  ? "text-primary-700 dark:text-primary-200"
                                  : "text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300"
                              }`}
                            >
                              {it.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* الأدوات */}
          <div className="flex items-center gap-2">
            <Link
              href={localizedPath(lang, "/search")}
              aria-label={isRTL ? "بحث" : "Search"}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-night-800"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                dark
                  ? isRTL
                    ? "التبديل إلى الوضع الفاتح"
                    : "Switch to light mode"
                  : isRTL
                  ? "التبديل إلى الوضع الداكن"
                  : "Switch to dark mode"
              }
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-night-800"
            >
              {dark ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>

            <Link
              href={switchHref}
              aria-label={
                isRTL
                  ? "التبديل إلى الإنجليزية"
                  : "Switch to Arabic"
              }
              className="hidden h-10 items-center gap-1.5 rounded-xl border-2 border-primary-200 px-3.5 text-sm font-black text-primary-700 transition-all hover:border-primary-500 hover:bg-primary-500 hover:text-white dark:border-night-700 dark:text-primary-300 sm:flex"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
              </svg>

              {otherLang.toUpperCase()}
            </Link>

            <Link
              href={localizedPath(lang, "/account")}
              className="btn-primary hidden !px-5 !py-2.5 text-sm md:inline-flex"
            >
              {isRTL ? "حسابي" : "Account"}
            </Link>

            {/* زر الموبايل */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={
                mobileOpen
                  ? isRTL
                    ? "إغلاق القائمة"
                    : "Close menu"
                  : isRTL
                  ? "فتح القائمة"
                  : "Open menu"
              }
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-night-800 lg:hidden"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
                focusable="false"
              >
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="glass max-h-[80vh] overflow-y-auto border-t border-primary-100 animate-slide-up dark:border-night-700 lg:hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {NAV.map((item) => {
              const active = isActiveHref(item.href);

              return (
                <Link
                  key={item.href || "home"}
                  href={localizedPath(lang, item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 font-bold transition-colors ${
                    active
                      ? "bg-primary-500 text-white"
                      : "text-slate-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-night-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {MENU.map((group) => (
              <div key={group.title} className="mt-3">
                <p className="mb-1 px-4 text-xs font-black text-gold-500">
                  {group.title}
                </p>

                {group.items.map((it) => {
                  const active = isActiveHref(it.href);

                  return (
                    <Link
                      key={it.href}
                      href={localizedPath(lang, it.href)}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-primary-50 text-primary-700 dark:bg-night-800 dark:text-primary-200"
                          : "text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-night-800"
                      }`}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            ))}

            <Link
              href={switchHref}
              className="mt-3 rounded-xl border-2 border-primary-300 px-4 py-3 text-center font-black text-primary-700 transition-colors hover:bg-primary-500 hover:text-white dark:border-night-700 dark:text-primary-300 dark:hover:bg-night-800"
            >
              {otherLang === "ar" ? "العربية" : "English"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}