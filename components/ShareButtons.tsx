"use client";

import { useEffect, useMemo, useState } from "react";

type ShareLang = "ar" | "en";

interface ShareButtonsProps {
  /**
   * الرابط المراد مشاركته.
   * لو مش هتحدده، المكوّن هيستخدم رابط الصفحة الحالية في المتصفح.
   */
  url?: string;

  /**
   * عنوان المشاركة
   */
  title: string;

  /**
   * نص إضافي تحت العنوان
   */
  text?: string;

  /**
   * اللغة
   */
  lang?: ShareLang;

  /**
   * شكل الأزرار
   * - icons: أيقونات فقط
   * - buttons: أزرار بالنص
   * - compact: أيقونات صغيرة
   */
  variant?: "icons" | "buttons" | "compact";

  /**
   * إظهار زر النسخ
   */
  showCopy?: boolean;

  /**
   * إظهار المشاركة الأصلية للمتصفح لو مدعومة
   */
  showNative?: boolean;

  className?: string;
}

const LABELS: Record<ShareLang, Record<string, string>> = {
  ar: {
    native: "مشاركة",
    whatsapp: "واتساب",
    facebook: "فيسبوك",
    x: "إكس",
    telegram: "تيليجرام",
    linkedin: "لينكدإن",
    email: "بريد",
    copy: "نسخ الرابط",
    copied: "تم النسخ ✓",
    share: "شارك",
  },
  en: {
    native: "Share",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    x: "X",
    telegram: "Telegram",
    linkedin: "LinkedIn",
    email: "Email",
    copy: "Copy Link",
    copied: "Copied ✓",
    share: "Share",
  },
};

function buildShareBody(title: string, text: string, url: string) {
  return [title, text, url].filter(Boolean).join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    if (typeof document === "undefined") return false;

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    return successful;
  } catch {
    return false;
  }
}

function openPopup(href: string) {
  if (typeof window === "undefined") return;

  window.open(
    href,
    "_blank",
    "noopener,noreferrer,width=640,height=560"
  );
}

/* ===== أيقونات SVG مدمجة ===== */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function NativeShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

export default function ShareButtons({
  url,
  title,
  text = "",
  lang = "ar",
  variant = "icons",
  showCopy = true,
  showNative = true,
  className = "",
}: ShareButtonsProps) {
  const [resolvedUrl, setResolvedUrl] = useState(url || "");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const labels = LABELS[lang] || LABELS.ar;
  const isRTL = lang === "ar";

  useEffect(() => {
    if (url) {
      setResolvedUrl(url);
      return;
    }

    if (typeof window !== "undefined") {
      setResolvedUrl(window.location.href);
    }
  }, [url]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };

    if (typeof nav.share === "function") {
      if (typeof nav.canShare === "function") {
        setCanNativeShare(
          nav.canShare({
            title,
            text,
            url: resolvedUrl || undefined,
          })
        );
      } else {
        setCanNativeShare(true);
      }
    }
  }, [resolvedUrl, text, title]);

  const shareBody = useMemo(
    () => buildShareBody(title, text, resolvedUrl),
    [resolvedUrl, text, title]
  );

  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(shareBody);
  const encodedUrl = encodeURIComponent(resolvedUrl);

  const platforms = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      href?: string;
      color: string;
      icon: React.ReactNode;
      onClick?: () => void;
      isAnchor?: boolean;
    }> = [];

    if (showNative && canNativeShare) {
      items.push({
        id: "native",
        label: labels.native,
        color: "#0ea5e9",
        icon: <NativeShareIcon />,
        onClick: async () => {
          const nav = navigator as Navigator & {
            share?: (data: ShareData) => Promise<void>;
          };

          if (!nav.share) return;

          try {
            await nav.share({
              title,
              text,
              url: resolvedUrl || undefined,
            });
          } catch {
            // المستخدم ألغى المشاركة أو حصل خطأ بسيط
          }
        },
      });
    }

    items.push(
      {
        id: "whatsapp",
        label: labels.whatsapp,
        href: `https://wa.me/?text=${encodedBody}`,
        color: "#25D366",
        icon: <WhatsAppIcon />,
        isAnchor: true,
      },
      {
        id: "facebook",
        label: labels.facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: "#1877F2",
        icon: <FacebookIcon />,
        isAnchor: true,
      },
      {
        id: "x",
        label: labels.x,
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        color: "#000000",
        icon: <XIcon />,
        isAnchor: true,
      },
      {
        id: "telegram",
        label: labels.telegram,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        color: "#229ED9",
        icon: <TelegramIcon />,
        isAnchor: true,
      },
      {
        id: "linkedin",
        label: labels.linkedin,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        color: "#0A66C2",
        icon: <LinkedInIcon />,
        isAnchor: true,
      },
      {
        id: "email",
        label: labels.email,
        href: `mailto:?subject=${encodedTitle}&body=${encodedBody}`,
        color: "#64748b",
        icon: <EmailIcon />,
        isAnchor: true,
      }
    );

    if (showCopy) {
      items.push({
        id: "copy",
        label: copied ? labels.copied : labels.copy,
        color: copied ? "#16a34a" : "#0891b2",
        icon: copied ? <CheckIcon /> : <CopyIcon />,
        onClick: async () => {
          if (!resolvedUrl) return;

          const success = await copyText(resolvedUrl);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        },
      });
    }

    return items;
  }, [
    canNativeShare,
    copied,
    encodedBody,
    encodedTitle,
    encodedUrl,
    labels,
    resolvedUrl,
    showCopy,
    showNative,
    text,
    title,
  ]);

  if (!resolvedUrl) {
    return null;
  }

  const containerClass =
    variant === "buttons"
      ? `flex flex-wrap gap-3 ${className}`
      : variant === "compact"
      ? `flex flex-wrap gap-2 ${className}`
      : `flex flex-wrap gap-3 ${className}`;

  return (
    <div className={containerClass} dir={isRTL ? "rtl" : "ltr"}>
      {platforms.map((platform) => {
        const baseButtonClass =
          variant === "buttons"
            ? "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            : variant === "compact"
            ? "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            : "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95";

        const style = {
          backgroundColor: `${platform.color}15`,
          color: platform.color,
          border: `1px solid ${platform.color}30`,
        };

        if (platform.isAnchor && platform.href) {
          return (
            <a
              key={platform.id}
              href={platform.href}
              target={platform.id === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={platform.label}
              title={platform.label}
              className={baseButtonClass}
              style={style}
              onClick={(e) => {
                if (platform.id !== "email") {
                  e.preventDefault();
                  openPopup(platform.href!);
                }
              }}
            >
              {platform.icon}
              {variant === "buttons" && <span>{platform.label}</span>}
            </a>
          );
        }

        return (
          <button
            key={platform.id}
            type="button"
            aria-label={platform.label}
            title={platform.label}
            className={`${baseButtonClass} cursor-pointer`}
            style={style}
            onClick={platform.onClick}
          >
            {platform.icon}
            {variant === "buttons" && <span>{platform.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * alias سريع لو حبيت تستعمل اسم مفرد
 */
export const ShareButton = ShareButtons;