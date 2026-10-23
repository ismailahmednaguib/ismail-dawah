// components/ui/index.tsx
// ============================================================
// نظام تصميم موحّد (Design System) — مكوّنات مشتركة لكل صفحات الموقع.
// كل المكوّنات هنا Server-safe (بدون hooks) وتستخدم كلاسات التصميم القائمة
// (container-page / card / section-title / btn-primary ...) لضمان نسق واحد.
// ============================================================

import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { Icon, iconMap, type IconName } from "@/lib/icons";

const ICON_ALIASES: Record<string, IconName> = {
  "📖": "quran",
  "📚": "bookOpen",
  "🕌": "mosque",
  "⚖️": "scale",
  "⚖": "scale",
  "🔔": "bell",
  "💡": "sparkles",
  "✨": "sparkles",
  "✦": "sparkles",
  "🔗": "link",
  "📍": "mapPin",
  "🎯": "target",
  "🧭": "qibla",
  "🤲": "duaHands",
  "📿": "tasbih",
  "🕋": "kaaba",
  "🕐": "clock",
  "⏱️": "clock",
  "🛠️": "settings",
  "⚙️": "settings",
  "⚙": "settings",
  "📅": "calendar",
  "🌙": "crescent",
  "❤️": "heart",
  "🛡️": "shieldCheck",
  "🔒": "lock",
  "🔐": "lock",
  "❓": "helpCircle",
  "ℹ️": "info",
  "✓": "checkCircle",
  "🚫": "shield",
  "⏹️": "stop",
  "📜": "fileText",
  "🧾": "fileText",
  "✍️": "edit",
  "📱": "download",
  "▶️": "play",
  "🎧": "headphones",
  "🗂️": "folder",
  "🏠": "home",
  "🗺️": "mapPin",
  "🆕": "sparkles",
  "📭": "mail",
  "🍪": "info",
  "🧒": "user",
  "👥": "users",
  "🏛️": "globe",
  "🏡": "home",
  "🧳": "folder",
  "🔥": "sparkles",
  "👑": "star",
  "✂️": "settings",
  "⛺": "folder",
  "🏜️": "mapPin",
  "🪨": "target",
  "🐑": "heart",
  "💈": "settings",
  "🚢": "globe",
  "🌊": "globe",
  "🐋": "globe",
  "🎮": "play",
  "💭": "helpCircle",
  "🎭": "sparkles",
  "💔": "heart",
  "🎉": "sparkles",
  "👋": "user",
  "⚔️": "scale",
  "📢": "send",
  "📡": "live",
  "🔬": "search",
  "🧮": "scale",
  "📥": "download",
  "👤": "user",
  "🌟": "star",
  "🌅": "sun",
  "🌄": "sun",
  "🌌": "star",
  "💰": "scale",
  "🧠": "sparkles",
  "🗄️": "folder",
  "🔍": "search",
  "◈": "globe",
  "📄": "fileText",
  "📕": "bookOpen",
  "🎓": "target",
  "✉️": "mail",
  "📬": "mail",
  "💬": "helpCircle",
  "🕊️": "heart",
  "💧": "info",
  "💝": "heart",
  "👨‍👩‍👧‍👦": "users",
  "🔁": "refresh",
  "🔂": "rotateCw",
  "🏃": "target",
  "✝️": "sparkles",
  "👩": "user",
  "🤝": "users",
  "⬜": "check",
  "🤖": "sparkles",
  "📊": "sort",
  "🏷️": "bookmark",
  "📌": "bookmark",
  "⏳": "clock",
  "⬇️": "download",
  "⚠️": "alert",
  "➕": "plus",
};

export function renderDesignIcon(icon: ReactNode, size = 24): ReactNode {
  if (typeof icon !== "string") return icon;
  const value = icon.trim();
  const iconName = ICON_ALIASES[value] ?? (
    Object.prototype.hasOwnProperty.call(iconMap, value) ? value as IconName : undefined
  );
  return iconName ? <Icon name={iconName} size={size} /> : icon;
}

// ------------------------------------------------------------
// Breadcrumbs — فتات الخبز
// ------------------------------------------------------------

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="breadcrumb" className={`mb-5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}>
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">‹</span>}
          {c.href ? (
            <Link href={c.href} className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              {c.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-200">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ------------------------------------------------------------
// PageHero — ترويسة موحّدة لكل الصفحات الداخلية
// ------------------------------------------------------------

export function PageHero({
  icon,
  title,
  subtitle,
  badge,
  crumbs,
  actions,
  stats,
  children,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  stats?: Array<{ value: string; label: string }>;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 dark:border-primary-900/40 dark:from-primary-950/40 dark:via-gray-900 dark:to-gold-950/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl"
      />
      <div className="container-page relative py-10 md:py-14">
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
        {badge && <span className="badge-gold mb-4">{badge}</span>}
        <div className="flex flex-wrap items-center gap-4">
          {icon && (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-4xl shadow-sm ring-1 ring-primary-100 dark:bg-white/10 dark:ring-primary-900/40"
            >
              {renderDesignIcon(icon, 30)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight text-slate-900 md:text-4xl dark:text-white" style={{ fontFamily: "var(--font-amiri)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}

        {stats && stats.length > 0 && (
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-primary-100 bg-white/70 p-4 text-center dark:border-primary-900/40 dark:bg-white/5">
                <p className="text-xl font-black text-primary-700 md:text-2xl dark:text-primary-300">{s.value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// SectionHeader — عنوان قسم موحّد
// ------------------------------------------------------------

export function SectionHeader({
  icon,
  title,
  subtitle,
  align = "center",
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  action?: ReactNode;
}) {
  const isCenter = align === "center";
  return (
    <div className={`mb-9 ${isCenter ? "text-center" : "flex flex-wrap items-end justify-between gap-4"}`}>
      <div className={isCenter ? "" : "min-w-0"}>
        <h2 className="section-title mb-0" style={{ fontFamily: "var(--font-amiri)" }}>
          {icon ? <span className="me-1 inline-flex align-middle" aria-hidden="true">{renderDesignIcon(icon, 22)}</span> : null}
          {title}
        </h2>
        <div className={`islamic-divider my-0 ${isCenter ? "mx-auto" : ""}`} aria-hidden="true">
          <span aria-hidden="true" className="text-xl text-gold-500">{renderDesignIcon("✦", 18)}</span>
        </div>
        {subtitle && <p className={`section-subtitle ${isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ------------------------------------------------------------
// CardGrid — شبكة بطاقات موحّدة
// ------------------------------------------------------------

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
};

const GRID_GAP: Record<number, string> = { 3: "gap-3", 4: "gap-4", 5: "gap-5" };

export function CardGrid({
  children,
  cols = 3,
  gap = 5,
  className = "",
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5;
  gap?: 3 | 4 | 5;
  className?: string;
}) {
  return <div className={`grid ${GRID_GAP[gap] ?? "gap-5"} ${GRID_COLS[cols] ?? GRID_COLS[3]} ${className}`}>{children}</div>;
}

// ------------------------------------------------------------
// InfoCard — بطاقة رابط (أيقونة + عنوان + وصف)
// ------------------------------------------------------------

export function InfoCard({
  href,
  icon,
  title,
  desc,
  badge,
  tone = "primary",
  cta,
  lang = "ar",
  gradientClass,
}: {
  href: string;
  icon?: ReactNode;
  title: string;
  desc?: string;
  badge?: string;
  tone?: "primary" | "gold";
  cta?: string;
  /** لغة الواجهة، لاختيار نص النداء الافتراضي دون تسريب العربية للإنجليزية. */
  lang?: Lang;
  /** كلاس تدرّج مخصّص (Tailwind) لتلوين البطاقة، مثل "from-primary-500 to-primary-600" */
  gradientClass?: string;
}) {
  const gradient = gradientClass ? `bg-gradient-to-r ${gradientClass}` : tone === "gold" ? "gradient-gold" : "gradient-primary";
  const iconBg = gradientClass
    ? `bg-gradient-to-br ${gradientClass} text-white shadow-md`
    : tone === "gold"
      ? "bg-gold-50 dark:bg-gold-900/40"
      : "bg-primary-50 dark:bg-primary-900/40";
  return (
    <Link
      href={href}
      className="card card-interactive group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1"
    >
      <div aria-hidden="true" className={`${gradient} absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="mb-3 flex items-start gap-3">
        {icon && (
          <span aria-hidden="true" className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} text-3xl shadow-sm`}>
            {renderDesignIcon(icon, 28)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3
            className="text-lg font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {title}
          </h3>
          {badge && (
            <span className="mt-1 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              {badge}
            </span>
          )}
        </div>
      </div>
      {desc && <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</p>}
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
        {cta ?? (lang === "en" ? "Read more" : "اقرأ المزيد")}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

// ------------------------------------------------------------
// EmptyState — حالة فارغة موحّدة
// ------------------------------------------------------------

export function EmptyState({
  icon = "🗂️",
  title,
  desc,
  actionHref,
  actionLabel,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span aria-hidden="true" className="text-5xl">
        {renderDesignIcon(icon, 34)}
      </span>
      <h3 className="text-lg font-black text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-amiri)" }}>
        {title}
      </h3>
      {desc && <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Callout — تنبيه/ملاحظة موحّدة
// ------------------------------------------------------------

const CALLOUT_TONES: Record<string, string> = {
  primary: "border-primary-200 bg-primary-50/70 dark:border-primary-900/40 dark:bg-primary-950/25",
  gold: "border-gold-200 bg-gold-50/70 dark:border-gold-900/30 dark:bg-gold-950/15",
  warning: "border-amber-300 bg-amber-50/80 dark:border-amber-800/40 dark:bg-amber-950/20",
};

export function Callout({
  icon = "💡",
  title,
  children,
  tone = "gold",
}: {
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
  tone?: "primary" | "gold" | "warning";
}) {
  return (
    <div className={`rounded-2xl border-2 p-5 md:p-6 ${CALLOUT_TONES[tone]}`}>
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-xl dark:bg-white/10">
          {renderDesignIcon(icon, 22)}
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h2 className="mb-1 text-base font-black text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-amiri)" }}>
              {title}
            </h2>
          )}
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// RelatedGrid — «صفحات ذات صلة» موحّد
// ------------------------------------------------------------

export function RelatedGrid({
  title,
  items,
  cols = 3,
  lang = "ar",
}: {
  title: string;
  items: Array<{ href: string; icon?: ReactNode; title: string; desc?: string }>;
  cols?: 2 | 3 | 4;
  lang?: Lang;
}) {
  if (items.length === 0) return null;
  return (
    <section className="container-page py-14 md:py-16">
      <SectionHeader icon="🔗" title={title} />
      <CardGrid cols={cols}>
        {items.map((it) => (
          <InfoCard key={it.href} href={it.href} icon={it.icon} title={it.title} desc={it.desc} lang={lang} />
        ))}
      </CardGrid>
    </section>
  );
}

// ------------------------------------------------------------
// StatCard + Skeleton
// ------------------------------------------------------------

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white/70 p-4 text-center dark:border-primary-900/40 dark:bg-white/5">
      <p className="text-xl font-black text-primary-700 md:text-2xl dark:text-primary-300">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function Skeleton({ height = 120, className = "" }: { height?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/40 ${className}`}
      style={{ height }}
    />
  );
}

export function SkeletonGrid({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 | 4 }) {
  return (
    <CardGrid cols={cols}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={160} />
      ))}
    </CardGrid>
  );
}

export type { Lang };
