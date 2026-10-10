// lib/icons.tsx
// مكتبة الأيقونات — SVG مدمجة بدون مكتبات خارجية
// محسّنة للوصولية، الأنواع، الدعم الديناميكي، والتوافق مع Next.js / React.

import React from "react";

// ============================================================
// الأنواع الأساسية
// ============================================================

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  /**
   * حجم الأيقونة بالبكسل أو أي قيمة CSS مقبولة.
   * افتراضيًا 24.
   */
  size?: number | string;

  /**
   * عنوان نصي للأيقونة.
   * إذا وُجد، تصبح الأيقونة ذات معنى وتُعرض كـ <title> داخل SVG.
   */
  title?: string;
}

export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

// ============================================================
// المكوّن الأساسي لكل الأيقونات
// ============================================================

const IconBase = React.forwardRef<
  SVGSVGElement,
  IconProps & { children?: React.ReactNode }
>(({ size = 24, className = "", title, children, ...props }, ref) => {
  const accessibleName = Boolean(
    title ||
      (props as Record<string, unknown>)["aria-label"] ||
      (props as Record<string, unknown>)["aria-labelledby"]
  );

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={accessibleName ? "img" : undefined}
      aria-hidden={accessibleName ? undefined : true}
      focusable="false"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
});

IconBase.displayName = "IconBase";

// ============================================================
// مصنع الأيقونات لتقليل التكرار
// ============================================================

function createIcon(displayName: string, children: React.ReactNode): IconComponent {
  const Component = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <IconBase ref={ref} {...props}>
      {children}
    </IconBase>
  ));

  Component.displayName = displayName;

  return Component;
}

// ============================================================
// 🕌 أيقونات إسلامية
// ============================================================

export const MosqueIcon = createIcon(
  "MosqueIcon",
  <>
    <path d="M12 2c-1.5 2-4 3.5-4 6v2h8V8c0-2.5-2.5-4-4-6z" />
    <path d="M4 10h16v10H4z" />
    <path d="M2 20h20" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </>
);

export const QuranIcon = createIcon(
  "QuranIcon",
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 7h7" />
    <path d="M9 11h7" />
  </>
);

export const BookOpenIcon = createIcon(
  "BookOpenIcon",
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>
);

export const PrayerRugIcon = createIcon(
  "PrayerRugIcon",
  <>
    <rect x="4" y="6" width="16" height="14" rx="1" />
    <path d="M12 6v14" />
    <path d="M8 10c0-2 2-3 4-3s4 1 4 3" />
    <path d="M4 20l2-2" />
    <path d="M20 20l-2-2" />
  </>
);

export const TasbihIcon = createIcon(
  "TasbihIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    <circle cx="12" cy="21" r="1.5" fill="currentColor" />
    <circle cx="3" cy="12" r="1.5" fill="currentColor" />
    <circle cx="21" cy="12" r="1.5" fill="currentColor" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="18" cy="6" r="1" fill="currentColor" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
  </>
);

export const QiblaIcon = createIcon(
  "QiblaIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M12 12l4-4" strokeWidth={2.5} />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </>
);

export const KaabaIcon = createIcon(
  "KaabaIcon",
  <>
    <rect x="5" y="5" width="14" height="14" rx="1" />
    <path d="M5 9h14" />
    <path d="M12 5v4" />
  </>
);

export const DuaHandsIcon = createIcon(
  "DuaHandsIcon",
  <>
    <path d="M7 21c-2 0-3-1-3-3v-7c0-1 .5-2 1.5-2.5L8 7" />
    <path d="M17 21c2 0 3-1 3-3v-7c0-1-.5-2-1.5-2.5L16 7" />
    <path d="M12 3v6" />
    <path d="M9 5c0-1 1.5-2 3-2s3 1 3 2" />
  </>
);

export const CrescentMoonIcon = createIcon(
  "CrescentMoonIcon",
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
);

export const StarIcon = createIcon(
  "StarIcon",
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);

export const SparklesIcon = createIcon(
  "SparklesIcon",
  <>
    <path d="M12 3l1.9 5.8L20 10.7l-5.1 3.7L16.8 21 12 17.3 7.2 21l1.9-6.6L4 10.7l6.1-1.9z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M19 17v4" />
    <path d="M17 19h4" />
  </>
);

// ============================================================
// 🧭 أيقونات التنقل
// ============================================================

export const HomeIcon = createIcon(
  "HomeIcon",
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>
);

export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </>
);

export const MenuIcon = createIcon(
  "MenuIcon",
  <>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);

export const CloseIcon = createIcon(
  "CloseIcon",
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const ArrowLeftIcon = createIcon(
  "ArrowLeftIcon",
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>
);

export const ArrowRightIcon = createIcon(
  "ArrowRightIcon",
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);

export const ArrowUpIcon = createIcon(
  "ArrowUpIcon",
  <>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </>
);

export const ArrowDownIcon = createIcon(
  "ArrowDownIcon",
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </>
);

export const ChevronDownIcon = createIcon(
  "ChevronDownIcon",
  <polyline points="6 9 12 15 18 9" />
);

export const ChevronUpIcon = createIcon(
  "ChevronUpIcon",
  <polyline points="18 15 12 9 6 15" />
);

export const ChevronLeftIcon = createIcon(
  "ChevronLeftIcon",
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRightIcon = createIcon(
  "ChevronRightIcon",
  <polyline points="9 18 15 12 9 6" />
);

export const ExternalLinkIcon = createIcon(
  "ExternalLinkIcon",
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>
);

export const LinkIcon = createIcon(
  "LinkIcon",
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
);

// ============================================================
// 👤 أيقونات المستخدم
// ============================================================

export const UserIcon = createIcon(
  "UserIcon",
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

export const UsersIcon = createIcon(
  "UsersIcon",
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const UserPlusIcon = createIcon(
  "UserPlusIcon",
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </>
);

export const LogInIcon = createIcon(
  "LogInIcon",
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </>
);

export const LogOutIcon = createIcon(
  "LogOutIcon",
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

// ============================================================
// ⚙️ أيقونات عامة
// ============================================================

export const SettingsIcon = createIcon(
  "SettingsIcon",
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
);

export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);

export const ClockIcon = createIcon(
  "ClockIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const MapPinIcon = createIcon(
  "MapPinIcon",
  <>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const PhoneIcon = createIcon(
  "PhoneIcon",
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
);

export const MailIcon = createIcon(
  "MailIcon",
  <>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </>
);

export const HeartIcon = createIcon(
  "HeartIcon",
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
);

export const BookmarkIcon = createIcon(
  "BookmarkIcon",
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
);

export const ShareIcon = createIcon(
  "ShareIcon",
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);

export const CopyIcon = createIcon(
  "CopyIcon",
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);

export const CheckIcon = createIcon(
  "CheckIcon",
  <polyline points="20 6 9 17 4 12" />
);

export const CheckCircleIcon = createIcon(
  "CheckCircleIcon",
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>
);

export const InfoIcon = createIcon(
  "InfoIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const AlertIcon = createIcon(
  "AlertIcon",
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

export const HelpCircleIcon = createIcon(
  "HelpCircleIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

export const SunIcon = createIcon(
  "SunIcon",
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>
);

export const MoonIcon = createIcon(
  "MoonIcon",
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
);

export const GlobeIcon = createIcon(
  "GlobeIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </>
);

export const LanguageIcon = createIcon(
  "LanguageIcon",
  <>
    <path d="M5 8h14" />
    <path d="M7 4h10" />
    <path d="M12 8v12" />
    <path d="M9 20h6" />
    <path d="M16 12l4 8" />
    <path d="M20 12l-4 8" />
  </>
);

export const RefreshIcon = createIcon(
  "RefreshIcon",
  <>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </>
);

export const RotateCwIcon = createIcon(
  "RotateCwIcon",
  <>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </>
);

export const RotateCcwIcon = createIcon(
  "RotateCcwIcon",
  <>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </>
);

export const LoaderIcon = createIcon(
  "LoaderIcon",
  <>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </>
);

// ============================================================
// 🛡️ أيقونات الأمان والصلاحيات
// ============================================================

export const LockIcon = createIcon(
  "LockIcon",
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
);

export const UnlockIcon = createIcon(
  "UnlockIcon",
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </>
);

export const ShieldIcon = createIcon(
  "ShieldIcon",
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
);

export const ShieldCheckIcon = createIcon(
  "ShieldCheckIcon",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </>
);

export const EyeIcon = createIcon(
  "EyeIcon",
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const EyeOffIcon = createIcon(
  "EyeOffIcon",
  <>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>
);

export const KeyIcon = createIcon(
  "KeyIcon",
  <>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </>
);

// ============================================================
// 📁 أيقونات الملفات والإجراءات
// ============================================================

export const FileIcon = createIcon(
  "FileIcon",
  <>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </>
);

export const FileTextIcon = createIcon(
  "FileTextIcon",
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>
);

export const DownloadIcon = createIcon(
  "DownloadIcon",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);

export const UploadIcon = createIcon(
  "UploadIcon",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </>
);

export const TrashIcon = createIcon(
  "TrashIcon",
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>
);

export const EditIcon = createIcon(
  "EditIcon",
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>
);

export const PlusIcon = createIcon(
  "PlusIcon",
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const MinusIcon = createIcon(
  "MinusIcon",
  <line x1="5" y1="12" x2="19" y2="12" />
);

export const FilterIcon = createIcon(
  "FilterIcon",
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
);

export const SortIcon = createIcon(
  "SortIcon",
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </>
);

export const SaveIcon = createIcon(
  "SaveIcon",
  <>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </>
);

export const SendIcon = createIcon(
  "SendIcon",
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>
);

export const BellIcon = createIcon(
  "BellIcon",
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>
);

// ============================================================
// 📱 أيقونات السوشيال ميديا
// ============================================================

export const FacebookIcon = createIcon(
  "FacebookIcon",
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
);

/**
 * أيقونة تويتر القديمة للطائر.
 * تُركت للتوافق مع الكود القديم.
 * للأفضل استخدم XIcon.
 */
export const TwitterIcon = createIcon(
  "TwitterIcon",
  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
);

export const XIcon = createIcon(
  "XIcon",
  <path
    fill="currentColor"
    stroke="none"
    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  />
);

export const YoutubeIcon = createIcon(
  "YoutubeIcon",
  <>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </>
);

export const InstagramIcon = createIcon(
  "InstagramIcon",
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>
);

export const WhatsappIcon = createIcon(
  "WhatsappIcon",
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
);

export const TelegramIcon = createIcon(
  "TelegramIcon",
  <>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </>
);

export const TikTokIcon = createIcon(
  "TikTokIcon",
  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
);

export const GithubIcon = createIcon(
  "GithubIcon",
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
);

export const LinkedinIcon = createIcon(
  "LinkedinIcon",
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>
);

export const SnapchatIcon = createIcon(
  "SnapchatIcon",
  <path d="M12 22s-4.5-1.5-6.5-4.5C3.5 14.5 4 12 4 10c0-3 2-5 4-5 1 0 2 .5 3 1.5C12 5.5 13 5 14 5c2 0 4 2 4 5 0 2 .5 4.5-1.5 7.5C14.5 20.5 12 22 12 22z" />
);

// ============================================================
// 🎬 أيقونات الميديا
// ============================================================

export const PlayIcon = createIcon(
  "PlayIcon",
  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
);

export const PauseIcon = createIcon(
  "PauseIcon",
  <>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" />
  </>
);

export const StopIcon = createIcon(
  "StopIcon",
  <rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor" />
);

export const VolumeIcon = createIcon(
  "VolumeIcon",
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </>
);

export const VolumeXIcon = createIcon(
  "VolumeXIcon",
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>
);

export const MicIcon = createIcon(
  "MicIcon",
  <>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </>
);

export const VideoIcon = createIcon(
  "VideoIcon",
  <>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </>
);

export const LiveIcon = createIcon(
  "LiveIcon",
  <>
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </>
);

export const HeadphonesIcon = createIcon(
  "HeadphonesIcon",
  <>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </>
);

// ============================================================
// 🗺️ خريطة الأيقونات — للاستخدام الديناميكي
// ============================================================

const iconDefinitions = {
  // إسلامية
  mosque: MosqueIcon,
  quran: QuranIcon,
  bookOpen: BookOpenIcon,
  prayerRug: PrayerRugIcon,
  tasbih: TasbihIcon,
  qibla: QiblaIcon,
  kaaba: KaabaIcon,
  duaHands: DuaHandsIcon,
  crescent: CrescentMoonIcon,
  star: StarIcon,
  sparkles: SparklesIcon,

  // تنقل
  home: HomeIcon,
  search: SearchIcon,
  menu: MenuIcon,
  close: CloseIcon,
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  arrowUp: ArrowUpIcon,
  arrowDown: ArrowDownIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  externalLink: ExternalLinkIcon,
  link: LinkIcon,

  // مستخدم
  user: UserIcon,
  users: UsersIcon,
  userPlus: UserPlusIcon,
  login: LogInIcon,
  logout: LogOutIcon,

  // عامة
  settings: SettingsIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  mapPin: MapPinIcon,
  phone: PhoneIcon,
  mail: MailIcon,
  heart: HeartIcon,
  bookmark: BookmarkIcon,
  share: ShareIcon,
  copy: CopyIcon,
  check: CheckIcon,
  checkCircle: CheckCircleIcon,
  info: InfoIcon,
  alert: AlertIcon,
  helpCircle: HelpCircleIcon,
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeIcon,
  language: LanguageIcon,
  refresh: RefreshIcon,
  rotateCw: RotateCwIcon,
  rotateCcw: RotateCcwIcon,
  loader: LoaderIcon,

  // أمان
  lock: LockIcon,
  unlock: UnlockIcon,
  shield: ShieldIcon,
  shieldCheck: ShieldCheckIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  key: KeyIcon,

  // ملفات وإجراءات
  file: FileIcon,
  fileText: FileTextIcon,
  download: DownloadIcon,
  upload: UploadIcon,
  trash: TrashIcon,
  edit: EditIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  filter: FilterIcon,
  sort: SortIcon,
  save: SaveIcon,
  send: SendIcon,
  bell: BellIcon,

  // سوشيال
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  x: XIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  telegram: TelegramIcon,
  tiktok: TikTokIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  snapchat: SnapchatIcon,

  // ميديا
  play: PlayIcon,
  pause: PauseIcon,
  stop: StopIcon,
  volume: VolumeIcon,
  volumeX: VolumeXIcon,
  mic: MicIcon,
  video: VideoIcon,
  live: LiveIcon,
  headphones: HeadphonesIcon,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconDefinitions;

export const iconMap: Record<IconName, IconComponent> = iconDefinitions;

// ============================================================
// دوال مساعدة
// ============================================================

function toCamelCase(value: string): string {
  return value
    .replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) =>
      chr ? chr.toUpperCase() : ""
    )
    .replace(/^(.)/, (chr) => chr.toLowerCase());
}

/**
 * الحصول على مكوّن أيقونة بالاسم.
 *
 * يدعم:
 * - الاسم المباشر: "quran"
 * - camelCase: "bookOpen"
 * - kebab-case: "book-open"
 * - snake_case: "book_open"
 */
export function getIcon(name: string): IconComponent | null {
  const direct = (iconMap as Record<string, IconComponent | undefined>)[name];
  if (direct) {
    return direct;
  }

  const camel = toCamelCase(name);
  return (iconMap as Record<string, IconComponent | undefined>)[camel] ?? null;
}

/**
 * قائمة أسماء الأيقونات المتاحة.
 */
export function listIconNames(): IconName[] {
  return Object.keys(iconDefinitions) as IconName[];
}

/**
 * التحقق من وجود اسم أيقونة.
 */
export function hasIcon(name: string): boolean {
  return getIcon(name) !== null;
}

// ============================================================
// مكوّن ديناميكي لعرض أيقونة بالاسم
// ============================================================

export interface DynamicIconProps extends IconProps {
  name: IconName | (string & {});
  fallback?: IconName | null;
}

export const Icon = React.forwardRef<SVGSVGElement, DynamicIconProps>(
  ({ name, fallback = null, ...props }, ref) => {
    const IconComponent = getIcon(name) || (fallback ? getIcon(fallback) : null);

    if (!IconComponent) {
      return null;
    }

    return <IconComponent ref={ref} {...props} />;
  }
);

Icon.displayName = "Icon";

// ============================================================
// تصدير افتراضي للتوافق
// ============================================================

const icons = {
  IconBase,
  createIcon,

  MosqueIcon,
  QuranIcon,
  BookOpenIcon,
  PrayerRugIcon,
  TasbihIcon,
  QiblaIcon,
  KaabaIcon,
  DuaHandsIcon,
  CrescentMoonIcon,
  StarIcon,
  SparklesIcon,

  HomeIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  LinkIcon,

  UserIcon,
  UsersIcon,
  UserPlusIcon,
  LogInIcon,
  LogOutIcon,

  SettingsIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  CheckCircleIcon,
  InfoIcon,
  AlertIcon,
  HelpCircleIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  LanguageIcon,
  RefreshIcon,
  RotateCwIcon,
  RotateCcwIcon,
  LoaderIcon,

  LockIcon,
  UnlockIcon,
  ShieldIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,

  FileIcon,
  FileTextIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
  MinusIcon,
  FilterIcon,
  SortIcon,
  SaveIcon,
  SendIcon,
  BellIcon,

  FacebookIcon,
  TwitterIcon,
  XIcon,
  YoutubeIcon,
  InstagramIcon,
  WhatsappIcon,
  TelegramIcon,
  TikTokIcon,
  GithubIcon,
  LinkedinIcon,
  SnapchatIcon,

  PlayIcon,
  PauseIcon,
  StopIcon,
  VolumeIcon,
  VolumeXIcon,
  MicIcon,
  VideoIcon,
  LiveIcon,
  HeadphonesIcon,

  iconMap,
  getIcon,
  hasIcon,
  listIconNames,
  Icon,
};

export default icons;