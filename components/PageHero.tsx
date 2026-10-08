import Link from "next/link";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
  gradient?: "teal" | "gold" | "night";
  children?: React.ReactNode;
}

const GRADIENTS = {
  teal: "linear-gradient(135deg, #083344 0%, #0e7490 55%, #06b6d4 100%)",
  gold: "linear-gradient(135deg, #78350f 0%, #a16207 55%, #d4af37 100%)",
  night: "linear-gradient(135deg, #020617 0%, #0a1628 55%, #1e3a5f 100%)",
};

export default function PageHero({
  title,
  subtitle,
  icon,
  backHref,
  backLabel,
  gradient = "teal",
  children,
}: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: GRADIENTS[gradient] }}
    >
      {/* زخرفة خلفية */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
          backgroundSize: "60px 60px, 90px 90px",
        }}
      />

      {/* دوائر متوهجة */}
      <div className="absolute -top-20 -end-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />

      <div className="container-page relative py-14 md:py-20">
        {/* زر الرجوع */}
        {backHref && (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="rtl:rotate-180"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {backLabel || "رجوع"}
          </Link>
        )}

        {/* المحتوى الرئيسي */}
        <div className="flex flex-col items-start gap-4">
          {/* الأيقونة */}
          {icon && (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl backdrop-blur-sm">
              {icon}
            </span>
          )}

          {/* العنوان */}
          <h1
            className="text-3xl font-black leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {title}
          </h1>

          {/* الوصف */}
          {subtitle && (
            <p className="max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              {subtitle}
            </p>
          )}

          {/* محتوى إضافي (أزرار، بحث، إلخ) */}
          {children && <div className="mt-4 w-full">{children}</div>}
        </div>
      </div>

      {/* موجة سفلية */}
      <div className="relative">
        <svg viewBox="0 0 1440 60" fill="none" className="block w-full">
          <path
            d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 35C1200 40 1320 40 1380 40L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
            className="fill-slate-50 dark:fill-night-900"
          />
        </svg>
      </div>
    </section>
  );
}