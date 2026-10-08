// lib/icons.tsx
// مكتبة الأيقونات — SVG مدمجة بدون مكتبات خارجية

import React from "react";

// ===== النوع الأساسي للأيقونات =====
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// المكوّن الأساسي اللي بيبني كل الأيقونات
function BaseIcon({
  size = 24,
  className = "",
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

// ============================================================
// 🕌 أيقونات إسلامية
// ============================================================

export function MosqueIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M12 2c-1.5 2-4 3.5-4 6v2h8V8c0-2.5-2.5-4-4-6z" />
      <path d="M4 10h16v10H4z" />
      <path d="M2 20h20" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </BaseIcon>
  );
}

export function QuranIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7" />
      <path d="M9 11h7" />
    </BaseIcon>
  );
}

export function PrayerRugIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="4" y="6" width="16" height="14" rx="1" />
      <path d="M12 6v14" />
      <path d="M8 10c0-2 2-3 4-3s4 1 4 3" />
      <path d="M4 20l2-2" />
      <path d="M20 20l-2-2" />
    </BaseIcon>
  );
}

export function TasbihIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <circle cx="12" cy="21" r="1.5" fill="currentColor" />
      <circle cx="3" cy="12" r="1.5" fill="currentColor" />
      <circle cx="21" cy="12" r="1.5" fill="currentColor" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" />
    </BaseIcon>
  );
}

export function QiblaIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M12 12l4-4" strokeWidth={2.5} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </BaseIcon>
  );
}

export function KaabaIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="5" y="5" width="14" height="14" rx="1" />
      <path d="M5 9h14" />
      <path d="M12 5v4" />
    </BaseIcon>
  );
}

export function DuaHandsIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M7 21c-2 0-3-1-3-3v-7c0-1 .5-2 1.5-2.5L8 7" />
      <path d="M17 21c2 0 3-1 3-3v-7c0-1-.5-2-1.5-2.5L16 7" />
      <path d="M12 3v6" />
      <path d="M9 5c0-1 1.5-2 3-2s3 1 3 2" />
    </BaseIcon>
  );
}

export function CrescentMoonIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </BaseIcon>
  );
}

export function StarIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </BaseIcon>
  );
}

// ============================================================
// 🧭 أيقونات التنقل
// ============================================================

export function HomeIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </BaseIcon>
  );
}

export function SearchIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </BaseIcon>
  );
}

export function MenuIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </BaseIcon>
  );
}

export function CloseIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </BaseIcon>
  );
}

export function ArrowLeftIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </BaseIcon>
  );
}

export function ArrowRightIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </BaseIcon>
  );
}

export function ArrowUpIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </BaseIcon>
  );
}

export function ChevronDownIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </BaseIcon>
  );
}

export function ChevronUpIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polyline points="18 15 12 9 6 15" />
    </BaseIcon>
  );
}

// ============================================================
// 👤 أيقونات المستخدم
// ============================================================

export function UserIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </BaseIcon>
  );
}

export function UsersIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </BaseIcon>
  );
}

export function UserPlusIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </BaseIcon>
  );
}

export function LogInIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </BaseIcon>
  );
}

export function LogOutIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </BaseIcon>
  );
}

// ============================================================
// ⚙️ أيقونات عامة
// ============================================================

export function SettingsIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </BaseIcon>
  );
}

export function CalendarIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </BaseIcon>
  );
}

export function ClockIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </BaseIcon>
  );
}

export function MapPinIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </BaseIcon>
  );
}

export function PhoneIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </BaseIcon>
  );
}

export function MailIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </BaseIcon>
  );
}

export function HeartIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </BaseIcon>
  );
}

export function BookmarkIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </BaseIcon>
  );
}

export function ShareIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </BaseIcon>
  );
}

export function CopyIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </BaseIcon>
  );
}

export function CheckIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </BaseIcon>
  );
}

export function InfoIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </BaseIcon>
  );
}

export function AlertIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </BaseIcon>
  );
}

export function SunIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </BaseIcon>
  );
}

export function MoonIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </BaseIcon>
  );
}

export function GlobeIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </BaseIcon>
  );
}

// ============================================================
// 📱 أيقونات السوشيال ميديا
// ============================================================

export function FacebookIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </BaseIcon>
  );
}

export function TwitterIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </BaseIcon>
  );
}

export function YoutubeIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </BaseIcon>
  );
}

export function InstagramIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </BaseIcon>
  );
}

export function WhatsappIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </BaseIcon>
  );
}

export function TelegramIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </BaseIcon>
  );
}

export function TikTokIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </BaseIcon>
  );
}

// ============================================================
// 🎬 أيقونات الميديا
// ============================================================

export function PlayIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </BaseIcon>
  );
}

export function PauseIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </BaseIcon>
  );
}

export function VolumeIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </BaseIcon>
  );
}

export function MicIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </BaseIcon>
  );
}

export function VideoIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </BaseIcon>
  );
}

export function LiveIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <BaseIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    </BaseIcon>
  );
}

// ============================================================
// 🗺️ خريطة الأيقونات — للاستخدام الديناميكي
// ============================================================

export const iconMap: Record<string, React.ComponentType<IconProps>> = {
  // إسلامية
  mosque: MosqueIcon,
  quran: QuranIcon,
  prayerRug: PrayerRugIcon,
  tasbih: TasbihIcon,
  qibla: QiblaIcon,
  kaaba: KaabaIcon,
  duaHands: DuaHandsIcon,
  crescent: CrescentMoonIcon,
  star: StarIcon,

  // تنقل
  home: HomeIcon,
  search: SearchIcon,
  menu: MenuIcon,
  close: CloseIcon,
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  arrowUp: ArrowUpIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,

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
  info: InfoIcon,
  alert: AlertIcon,
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeIcon,

  // سوشيال
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  telegram: TelegramIcon,
  tiktok: TikTokIcon,

  // ميديا
  play: PlayIcon,
  pause: PauseIcon,
  volume: VolumeIcon,
  mic: MicIcon,
  video: VideoIcon,
  live: LiveIcon,
};

// دالة للحصول على أيقونة بالاسم
export function getIcon(name: string): React.ComponentType<IconProps> | null {
  return iconMap[name] || null;
}

// مكوّن ديناميكي لعرض أيقونة بالاسم
export function Icon({
  name,
  size = 24,
  className = "",
  ...props
}: IconProps & { name: string }) {
  const IconComponent = getIcon(name);
  if (!IconComponent) {
    return null;
  }
  return <IconComponent size={size} className={className} {...props} />;
}