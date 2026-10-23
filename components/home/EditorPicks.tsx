// components/home/EditorPicks.tsx
// ============================================================
// مختارات المحرر — بطاقات منتقاة يدويًّا من اللوحة.
// تُعرض بالترتيب المحفوظ، وتُخفى تلقائيًّا إذا لم توجد مختارات
// صالحة أو إذا لم تملك المادة ترجمة باللغة الحالية.
// ============================================================

import Link from "next/link";

import ContentCard from "@/components/learn/ContentCard";
import type { PublicItem } from "@/lib/learn/public";
import type { Lang } from "@/lib/i18n";

export default function EditorPicks({
  items,
  lang,
  title,
  subtitle,
  viewAll,
  href,
}: {
  items: PublicItem[];
  lang: Lang;
  title: string;
  subtitle: string;
  viewAll: string;
  href: string;
}) {
  if (items.length === 0) return null;

  const isRTL = lang === "ar";

  return (
    <section
      aria-labelledby="editor-picks-title"
      className="container-page py-16 md:py-20"
    >
      <div className="mb-10 text-center">
        <h2
          id="editor-picks-title"
          className="section-title mb-0"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          ✦ {title}
        </h2>
        <div className="islamic-divider my-0" aria-hidden="true">
          <span className="text-xl text-gold-500">✦</span>
        </div>
        <p className="section-subtitle mx-auto max-w-2xl">{subtitle}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            lang={lang}
            type={item.content_type}
            slug={item.slug}
            title={item.title}
            summary={item.summary}
            published_at={item.published_at}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-5 py-2.5 text-sm font-bold text-primary-700 transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-primary-800 dark:bg-night-800/70 dark:text-primary-200 dark:hover:bg-primary-950/40"
        >
          {viewAll}
          <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
        </Link>
      </div>
    </section>
  );
}
