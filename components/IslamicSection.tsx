type IslamicSectionProps = {
  title: string;
  icon?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function IslamicSection({
  title,
  icon,
  subtitle,
  children,
  className = "",
}: IslamicSectionProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* عنوان القسم */}
        <div className="mb-8 text-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            {icon && <span className="text-3xl">{icon}</span>}
            <h2 className="font-serif text-3xl text-primary dark:text-gold font-bold whitespace-nowrap">
              {title}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
          )}
        </div>

        {/* المحتوى */}
        {children}
      </div>
    </section>
  );
}