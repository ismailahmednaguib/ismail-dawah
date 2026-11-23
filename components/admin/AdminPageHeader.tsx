import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

/** ترويسة ثابتة لصفحات لوحة التحكم، مع إبقاء محتوى كل صفحة مستقلًا. */
export default function AdminPageHeader({
  title,
  description,
  eyebrow = "لوحة التحكم",
  actions,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header relative mb-6 overflow-hidden rounded-2xl border p-5 md:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -end-20 -top-24 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="admin-page-eyebrow">{eyebrow}</p>
          <h1 className="admin-page-title">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children && <div className="relative z-10">{children}</div>}
    </header>
  );
}
