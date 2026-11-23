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
    <header className="admin-page-header mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="admin-page-eyebrow">{eyebrow}</p>
          <h1 className="admin-page-title">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
