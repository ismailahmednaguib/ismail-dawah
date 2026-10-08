import Link from "next/link";
import React from "react";

// ===== كارت أساسي =====
interface BasicCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function BasicCard({ children, className = "", hover = false }: BasicCardProps) {
  return (
    <div
      className={`card overflow-hidden rounded-2xl bg-white dark:bg-night-800 border border-primary-100/60 dark:border-night-700/50 ${
        hover ? "card-interactive" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ===== كارت بأيقونة =====
interface IconCardProps {
  icon: string | React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  color?: "teal" | "gold" | "emerald" | "purple";
  className?: string;
}

export function IconCard({
  icon,
  title,
  description,
  href,
  color = "teal",
  className = "",
}: IconCardProps) {
  const colorClasses = {
    teal: "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400",
    gold: "bg-gold-100 dark:bg-gold-700/20 text-gold-600 dark:text-gold-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  };

  const content = (
    <div className="card card-interactive group p-6 h-full">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${colorClasses[color]} ${className}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

// ===== كارت قائمة =====
interface ListCardProps {
  title: string;
  items: Array<{ label: string; href?: string; icon?: string }>;
  color?: "teal" | "gold";
  className?: string;
}

export function ListCard({ title, items, color = "teal", className = "" }: ListCardProps) {
  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <span
          className={`w-2 h-6 rounded-full ${
            color === "teal" ? "bg-primary-500" : "bg-gold-500"
          }`}
        />
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors group"
              >
                {item.icon && <span>{item.icon}</span>}
                <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  {item.label}
                </span>
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== كارت مميزات =====
interface FeatureCardProps {
  icon?: string;
  title: string;
  description: string;
  badge?: string;
  href?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
  href,
  className = "",
}: FeatureCardProps) {
  const content = (
    <div className="card card-interactive group p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-2xl transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
        {badge && (
          <span className="badge badge-gold text-xs">{badge}</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
        {description}
      </p>
      {href && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-300">
          <span>اعرف المزيد</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

// ===== كارت إحصائية =====
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  color?: "teal" | "gold";
  className?: string;
}

export function StatCard({ value, label, icon, color = "teal", className = "" }: StatCardProps) {
  return (
    <div className={`card p-6 text-center ${className}`}>
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div
        className={`text-3xl font-black mb-1 ${
          color === "teal" ? "text-primary-600 dark:text-primary-400" : "text-gold-600 dark:text-gold-400"
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

// ===== كارت صورة =====
interface ImageCardProps {
  image: string;
  title: string;
  description?: string;
  href?: string;
  badge?: string;
  className?: string;
}

export function ImageCard({
  image,
  title,
  description,
  href,
  badge,
  className = "",
}: ImageCardProps) {
  const content = (
    <div className="card card-interactive group overflow-hidden h-full">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {badge && (
          <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 badge badge-gold text-xs">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}

// ===== كارت اقتباس =====
interface QuoteCardProps {
  quote: string;
  source?: string;
  className?: string;
}

export function QuoteCard({ quote, source, className = "" }: QuoteCardProps) {
  return (
    <div className={`card p-8 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-bl-full rtl:rounded-bl-none rtl:rounded-br-full opacity-50" />
      <svg
        className="w-10 h-10 text-primary-200 dark:text-primary-800 mb-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <blockquote className="text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-4 relative z-10">
        {quote}
      </blockquote>
      {source && (
        <cite className="text-sm text-primary-600 dark:text-primary-400 font-semibold not-italic">
          — {source}
        </cite>
      )}
    </div>
  );
}

// ===== كارت خطوة =====
interface StepCardProps {
  step: number;
  title: string;
  description?: string;
  className?: string;
}

export function StepCard({ step, title, description, className = "" }: StepCardProps) {
  return (
    <div className={`card p-6 relative ${className}`}>
      <div className="absolute -top-4 right-6 rtl:right-auto rtl:left-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg">
          {step}
        </span>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ===== شبكة كروت =====
interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, columns = 3, className = "" }: CardGridProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid gap-6 ${gridClasses[columns]} ${className}`}>{children}</div>;
}