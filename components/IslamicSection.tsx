import React from "react";

interface IslamicSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  align?: "center" | "right" | "left";
  background?: "white" | "light" | "gradient";
  id?: string;
  className?: string;
}

export default function IslamicSection({
  title,
  subtitle,
  children,
  align = "center",
  background = "white",
  id,
  className = "",
}: IslamicSectionProps) {
  const alignClasses = {
    center: "text-center items-center",
    right: "text-right items-end",
    left: "text-left items-start",
  };

  const backgroundClasses = {
    white: "bg-white dark:bg-night-900",
    light: "bg-primary-50/50 dark:bg-night-800/50",
    gradient: "bg-gradient-to-br from-primary-50 via-white to-gold-50/30 dark:from-night-900 dark:via-night-800 dark:to-night-900",
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-20 ${backgroundClasses[background]} ${className}`}
    >
      <div className="container-page">
        {/* رأس القسم */}
        <div className={`mb-12 flex flex-col gap-4 ${alignClasses[align]}`}>
          <h2 className="section-title mb-0">{title}</h2>
          
          {/* الفاصل الزخرفي الإسلامي */}
          <div className="islamic-divider my-0">
            <span className="text-xl text-gold-500">✦</span>
          </div>
          
          {subtitle && (
            <p className="section-subtitle max-w-2xl">{subtitle}</p>
          )}
        </div>

        {/* محتوى القسم */}
        {children}
      </div>
    </section>
  );
}