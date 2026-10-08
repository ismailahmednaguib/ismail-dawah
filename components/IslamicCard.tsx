import Link from "next/link";

interface IslamicCardProps {
  title: string;
  description?: string;
  icon?: string;
  href?: string;
  color?: "teal" | "gold";
  className?: string;
}

export default function IslamicCard({
  title,
  description,
  icon,
  href,
  color = "teal",
  className = "",
}: IslamicCardProps) {
  const cardContent = (
    <div
      className={`card card-interactive group p-6 ${className}`}
    >
      {/* الأيقونة */}
      {icon && (
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110 ${
            color === "teal"
              ? "bg-primary-100 dark:bg-primary-900/40"
              : "bg-gold-100 dark:bg-gold-700/20"
          }`}
        >
          {icon}
        </div>
      )}

      {/* العنوان */}
      <h3 className="mb-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
        {title}
      </h3>

      {/* الوصف */}
      {description && (
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {/* سهم "اقرأ المزيد" لو فيه رابط */}
      {href && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
          <span>اقرأ المزيد</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );

  // لو فيه رابط، ارجع الكارت جوه <Link>
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  // لو مفيش رابط، ارجع الكارت عادي
  return cardContent;
}