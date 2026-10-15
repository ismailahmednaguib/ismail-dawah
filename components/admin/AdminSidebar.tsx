"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AppRole } from "@/lib/types/content";
import { can, highestRole } from "@/lib/admin/permissions";

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
  editor: "محرر",
  scholar_reviewer: "مراجع علمي",
  translator: "مترجم",
  contributor: "مساهم",
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
  show: boolean;
}

export default function AdminSidebar({
  userName,
  roles,
}: {
  userName: string;
  roles: AppRole[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items: NavItem[] = [
    { href: "/admin", label: "لوحة المعلومات", icon: "▦", show: true },
    { href: "/admin/content", label: "المحتوى", icon: "✎", show: can(roles, "content.read") },
    { href: "/admin/taxonomies", label: "التصنيفات", icon: "⌘", show: can(roles, "taxonomy.manage") },
    { href: "/admin/translations", label: "الترجمات", icon: "文", show: can(roles, "content.read") },
    { href: "/admin/review", label: "المراجعة العلمية", icon: "✓", show: can(roles, "review.approve") },
    { href: "/admin/users", label: "المستخدمون والأدوار", icon: "♙", show: can(roles, "users.manage") },
    { href: "/admin/audit", label: "سجل التدقيق", icon: "≡", show: can(roles, "audit.read") },
  ];

  const role = highestRole(roles);
  const initials = userName.trim().slice(0, 1).toUpperCase() || "م";

  return (
    <aside className="flex w-full shrink-0 flex-col bg-primary-950 text-white lg:min-h-screen lg:w-72">
      <div className="flex items-center justify-between gap-4 border-b border-primary-800 px-4 py-4 md:px-5 lg:block lg:py-6">
        <div className="flex items-center gap-3 lg:block">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500 text-xl font-black text-primary-950 shadow-glow-gold lg:mb-4">
            إ
          </span>
          <div>
            <h1 className="font-black tracking-tight text-gold-200">أكاديمية إسماعيل</h1>
            <p className="mt-0.5 text-xs text-primary-200">مركز إدارة المنصة</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-primary-700 bg-primary-900/60 px-2.5 py-1 text-[10px] font-bold text-primary-200 lg:inline-flex">
          ADMIN
        </span>
      </div>

      <div className="border-b border-primary-800 px-4 py-4 md:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-black text-white ring-2 ring-primary-500/40">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{userName}</p>
            <span className="mt-1 inline-flex rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] font-bold text-gold-200">
              {ROLE_LABELS[role] ?? "مدير"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-y-auto" aria-label="قائمة لوحة التحكم">
        {items
          .filter((item) => item.show)
          .map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition lg:min-w-0 ${
                  active
                    ? "bg-gold-500 text-primary-950 shadow-glow-gold"
                    : "text-primary-100 hover:bg-primary-800 hover:text-white"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${active ? "bg-primary-950/10" : "bg-primary-900/70 group-hover:bg-primary-700"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-primary-800 p-3">
        <button
          type="button"
          onClick={() => {
            void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
              router.push("/ar/login");
            });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-primary-100 transition hover:bg-red-950/60 hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-900/70">↪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
