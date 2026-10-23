"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AppRole } from "@/lib/types/content";
import { can, highestRole } from "@/lib/admin/permissions";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import type { IconComponent } from "@/lib/icons";
import {
  BellIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  LanguageIcon,
  LogOutIcon,
  MailIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
} from "@/lib/icons";

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
  icon: IconComponent;
  show: boolean;
}

export default function AdminSidebar({
  userName,
  roles,
  siteName,
}: {
  userName: string;
  roles: AppRole[];
  siteName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items: NavItem[] = [
    { href: "/admin", label: "لوحة المعلومات", icon: HomeIcon, show: true },
    { href: "/admin/control", label: "التحكم الموحد", icon: SettingsIcon, show: true },
    { href: "/admin/content", label: "المحتوى", icon: EditIcon, show: can(roles, "content.read") },
    { href: "/admin/taxonomies", label: "التصنيفات", icon: BookOpenIcon, show: can(roles, "taxonomy.manage") },
    { href: "/admin/translations", label: "الترجمات", icon: LanguageIcon, show: can(roles, "content.read") },
    { href: "/admin/quality", label: "جودة المحتوى", icon: SparklesIcon, show: can(roles, "content.read") },
    { href: "/admin/review", label: "المراجعة العلمية", icon: CheckCircleIcon, show: can(roles, "review.approve") },
    { href: "/admin/analytics", label: "التحليلات", icon: SparklesIcon, show: can(roles, "audit.read") },
    { href: "/admin/questions", label: "أسئلة الزوار", icon: HelpCircleIcon, show: can(roles, "questions.manage") },
    { href: "/admin/notifications", label: "الإشعارات", icon: BellIcon, show: can(roles, "notifications.manage") },
    { href: "/admin/newsletter", label: "النشرة البريدية", icon: MailIcon, show: can(roles, "notifications.manage") },
    { href: "/admin/users", label: "المستخدمون والأدوار", icon: UsersIcon, show: can(roles, "users.manage") },
    { href: "/admin/audit", label: "سجل التدقيق", icon: FileTextIcon, show: can(roles, "audit.read") },
    { href: "/admin/security", label: "الأمان", icon: ShieldIcon, show: can(roles, "audit.read") },
    { href: "/admin/backup", label: "النسخ الاحتياطي", icon: DownloadIcon, show: can(roles, "settings.manage") },
    { href: "/admin/settings", label: "إعدادات المنصة", icon: SettingsIcon, show: can(roles, "settings.manage") },
  ];

  const role = highestRole(roles);
  const initials = userName.trim().slice(0, 1).toUpperCase() || "م";
  const fullBrandName = siteName?.trim() || SITE_NAME;
  const brandName = fullBrandName.split("–")[0]?.trim() || fullBrandName;
  const brandNameEn = fullBrandName.split("–")[1]?.trim() || "Discover Islam";

  return (
    <aside className="admin-sidebar flex w-full shrink-0 flex-col rounded-b-3xl text-white lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:w-72 lg:rounded-none">
      <div className="relative overflow-hidden border-b border-white/10 px-4 py-5 md:px-5 lg:py-7">
        <div className="pointer-events-none absolute -left-12 -top-16 h-36 w-36 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4 lg:block">
          <div className="flex items-center gap-3 lg:block">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-xl font-black text-white shadow-glow-primary lg:mb-4">
              إ
            </span>
            <div>
              <p className="font-black tracking-tight text-white">{brandName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-primary-100">{brandNameEn} · {SITE_TAGLINE.ar}</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-gold-300/30 bg-gold-300/10 px-2.5 py-1 text-[10px] font-bold text-gold-200 lg:inline-flex">
            ADMIN
          </span>
        </div>
      </div>

      <div className="mx-3 my-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 md:px-4">
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

      <nav className="flex flex-1 gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1.5 lg:overflow-y-auto lg:px-4" aria-label="قائمة لوحة التحكم">
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
                  <item.icon size={16} aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3 lg:p-4">
        <button
          type="button"
          onClick={() => {
            void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
              router.push("/ar/login");
            });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-primary-100 transition hover:bg-red-950/60 hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-900/70">
            <LogOutIcon size={16} aria-hidden="true" />
          </span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
