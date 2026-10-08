"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackButtonCompact } from "./BackButton";
import ShareButtons from "./ShareButtons";
import BookmarkButton from "./BookmarkButton";

interface TopBarCrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  breadcrumb?: TopBarCrumb[];
  backHref?: string;
  showBack?: boolean;
  showShare?: boolean;
  showBookmark?: boolean;
  bookmarkType?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export default function TopBar({
  title,
  subtitle,
  breadcrumb,
  backHref,
  showBack = true,
  showShare = true,
  showBookmark = false,
  bookmarkType = "page",
  actions,
  sticky = true,
  className = "",
}: TopBarProps) {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const isRTL = lang === "ar";

  const [copied, setCopied] = useState(false);

  const resolvedBackHref = backHref || `/${lang}`;

  const bookmarkItem = {
    id: pathname,
    title,
    href: pathname,
    type: bookmarkType,
  };

  const handleMobileShare = async () => {
    if (typeof window === "undefined") return;

    const url = window.location.href;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };

    // 1) نجرب المشاركة الأصلية للمتصفح/الموبايل
    if (typeof nav.share === "function") {
      try {
        await nav.share({
          title,
          text: subtitle || undefined,
          url,
        });
        return;
      } catch {
        // المستخدم ألغى أو المتصفح رفض، نكمل لنسخ الرابط
      }
    }

    // 2) بديل: نسخ الرابط
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // لو النسخ فشل، نسكت عشان ما نكسرش التجربة
    }
  };

  return (
    <div
      className={`
        ${
          sticky
            ? "sticky top-16 z-40 md:top-20"
            : "relative z-30"
        }
        border-b border-primary-100/70 bg-white/85 backdrop-blur-xl
        dark:border-night-700/60 dark:bg-night-900/85
        ${className}
      `}
    >
      <div className="container-page">
        <div className="flex min-h-14 items-center justify-between gap-3 py-3">
          {/* ===== الجهة الأولى: رجوع + عنوان + مسار ===== */}
          <div className="flex min-w-0 items-center gap-3">
            {showBack && (
              <BackButtonCompact
                href={resolvedBackHref}
                className="shrink-0"
              />
            )}

            <div className="min-w-0">
              {breadcrumb && breadcrumb.length > 0 && (
                <nav
                  aria-label="breadcrumb"
                  className="mb-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
                >
                  {breadcrumb.map((crumb, index) => (
                    <Fragment key={`${crumb.label}-${index}`}>
                      {index > 0 && (
                        <span className="text-slate-300 dark:text-slate-600">
                          /
                        </span>
                      )}

                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="transition-colors hover:text-primary-600 dark:hover:text-primary-300"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="max-w-[140px] truncate font-semibold text-slate-700 sm:max-w-none dark:text-slate-200">
                          {crumb.label}
                        </span>
                      )}
                    </Fragment>
                  ))}
                </nav>
              )}

              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                {title}
              </h1>

              {subtitle && (
                <p className="hidden max-w-xl truncate text-xs text-slate-500 sm:block dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* ===== الجهة الثانية: أزرار ===== */}
          <div className="flex shrink-0 items-center gap-2">
            {actions}

            {showShare && (
              <>
                {/* زر مشاركة سريع للموبايل */}
                <button
                  type="button"
                  onClick={handleMobileShare}
                  aria-label={isRTL ? "مشاركة" : "Share"}
                  title={isRTL ? "مشاركة" : "Share"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 bg-white text-primary-700 transition-all duration-200 hover:bg-primary-50 active:scale-95 md:hidden dark:border-night-700 dark:bg-night-800 dark:text-primary-300 dark:hover:bg-night-700"
                >
                  {copied ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  )}
                </button>

                {/* أزرار المشاركة الكاملة للديسكتوب */}
                <div className="hidden md:block">
                  <ShareButtons
                    lang={lang}
                    title={title}
                    text={subtitle}
                    variant="compact"
                    showCopy={true}
                    showNative={true}
                  />
                </div>
              </>
            )}

            {showBookmark && (
              <BookmarkButton
                item={bookmarkItem}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}