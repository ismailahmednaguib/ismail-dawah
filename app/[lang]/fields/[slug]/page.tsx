// app/[lang]/fields/[slug]/page.tsx
// صفحة مجال/فرع/تحت-فرع — تعتمد نظام التصميم الموحّد (components/ui).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { decodeParam } from "@/lib/params";
import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import {
  getPublicTaxonomies,
  getPublicList,
  type PublicTerm,
  type PublicItem,
} from "@/lib/learn/public";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentCard from "@/components/learn/ContentCard";
import { PageHero, SectionHeader, CardGrid, InfoCard, EmptyState, renderDesignIcon } from "@/components/ui";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

/** أنواع المحتوى التي تُعرض في صفحة المجال/الفرع. */
const FIELD_CONTENT_TYPES = [
  "lesson",
  "article",
  "fatwa",
  "faq",
  "hadith",
  "khutbah",
  "story",
  "video",
  "page",
] as const;

// ============================================================
// نصوص الواجهة العامة
// ============================================================

const UI: Record<string, {
  home: string;
  explore: string;
  topicsTitle: string;
  topicsDesc: string;
  relatedTitle: string;
  nextField: string;
  prevField: string;
  allFields: string;
  noContent: string;
  lessons: string;
  articles: string;
  content: string;
  kinds: Record<string, string>;
}> = {
  ar: {
    home: "الرئيسية",
    explore: "استكشف",
    topicsTitle: "محتوى ذو صلة",
    topicsDesc: "أحدث ما نُشر في هذا المجال",
    relatedTitle: "مجالات ذات صلة",
    nextField: "المجال التالي",
    prevField: "المجال السابق",
    allFields: "جميع المجالات",
    noContent: "لا يوجد محتوى منشور في هذا المجال بعد.",
    lessons: "دروس",
    articles: "مقالات",
    content: "محتوى",
    kinds: { field: "مجال شرعي", branch: "فرع", subbranch: "موضوع", category: "تصنيف" },
  },
  en: {
    home: "Home",
    explore: "Explore",
    topicsTitle: "Related content",
    topicsDesc: "Latest published in this field",
    relatedTitle: "Related Fields",
    nextField: "Next Field",
    prevField: "Previous Field",
    allFields: "All Fields",
    noContent: "No published content in this field yet.",
    lessons: "Lessons",
    articles: "Articles",
    content: "Content",
    kinds: { field: "Islamic Field", branch: "Branch", subbranch: "Topic", category: "Category" },
  },
};

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  // نبحث عن التصنيف في كل الأنواع (مجال/فرع/تحت-فرع/تصنيف) كما تفعل الصفحة،
  // وإلا رجعت صفحات الفروع بلا عنوان أو بوصف الصفحة الرئيسية.
  const [fields, branches, subbranches, categories] = await Promise.all([
    getPublicTaxonomies(l, "field"),
    getPublicTaxonomies(l, "branch"),
    getPublicTaxonomies(l, "subbranch"),
    getPublicTaxonomies(l, "category"),
  ]);
  const field = [...fields, ...branches, ...subbranches, ...categories].find(
    (item) => item.slug === slug
  );
  if (!field) return {};

  const description = `${field.name} — ${UI[l].topicsDesc}`;
  const path = `/${l}/fields/${encodeURIComponent(slug)}`;

  return {
    title: field.name,
    description,
    alternates: {
      canonical: path,
      languages: { ar: `/ar/fields/${encodeURIComponent(slug)}`, en: `/en/fields/${encodeURIComponent(slug)}` },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: field.name,
      description,
      url: path,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
      images: [{ url: `/og/og-${l}.png`, width: 1200, height: 630, alt: field.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: field.name,
      description,
      images: [`/og/og-${l}.png`],
    },
  };
}

// ============================================================
// الصفحة
// ============================================================

export default async function FieldPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "field", l);
  const isRTL = l === "ar";
  const ui = UI[l];

  // نبحث عن التصنيف في كل الأنواع (مجال/فرع/تحت-فرع/تصنيف)
  const [fields, branches, subbranches, categories] = await Promise.all([
    getPublicTaxonomies(l, "field"),
    getPublicTaxonomies(l, "branch"),
    getPublicTaxonomies(l, "subbranch"),
    getPublicTaxonomies(l, "category"),
  ]);
  const groups: Array<{ kind: string; list: PublicTerm[] }> = [
    { kind: "field", list: fields },
    { kind: "branch", list: branches },
    { kind: "subbranch", list: subbranches },
    { kind: "category", list: categories },
  ];
  let field: PublicTerm | null = null;
  let taxKind: string | undefined;
  let siblings: PublicTerm[] = fields;
  for (const g of groups) {
    const found = g.list.find((f) => f.slug === slug);
    if (found) {
      field = found;
      taxKind = g.kind;
      siblings = g.list;
      break;
    }
  }
  if (!field) notFound();

  const currentIndex = siblings.findIndex((f) => f.slug === slug);
  const prevField = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextField = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  const relatedFields = siblings.filter((f) => f.slug !== field!.slug).slice(0, 3);

  // نعرض في صفحة المجال كل أنواع المحتوى المرتبط به، لا الدروس والمقالات فقط؛
  // وإلّا ظهر الباب فارغًا رغم أن تحتَه فتاوى أو أحاديث أو صفحات تعريفية.
  const lists = await Promise.all(
    FIELD_CONTENT_TYPES.map((type) =>
      getPublicList(l, type, {
        taxonomySlug: slug,
        taxonomyKind: taxKind,
        includeDescendants: true,
        limit: 6,
      })
    )
  );

  const seenIds = new Set<string>();
  const relatedContent: PublicItem[] = lists
    .flat()
    .filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    })
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 9);

  const countsByType = new Map<string, number>();
  for (const item of lists.flat()) {
    countsByType.set(item.content_type, (countsByType.get(item.content_type) ?? 0) + 1);
  }

  const fieldColor = (term: PublicTerm) => term.color ?? "from-primary-500 to-primary-600";
  const icon = field.icon ?? "📖";
  const kindLabel = ui.kinds[taxKind ?? "field"] ?? ui.kinds.field;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: field.name,
    description: field.name,
    inLanguage: l,
    url: `/${l}/fields/${slug}`,
    articleSection: isRTL ? "العلوم الشرعية" : "Islamic Sciences",
  };

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <PageHero
        icon={icon}
        title={field.name}
        subtitle={ui.topicsDesc}
        badge={kindLabel}
        crumbs={[
          { label: ui.home, href: `/${l}` },
          { label: ui.allFields, href: `/${l}/fields` },
          { label: field.name },
        ]}
        stats={
          gate.visible("k1")
            ? [
                { value: String(countsByType.get("lesson") ?? 0), label: ui.lessons },
                { value: String(countsByType.get("article") ?? 0), label: ui.articles },
                { value: String(relatedContent.length), label: ui.content },
              ]
            : undefined
        }
      />

      {gate.visible("k2") && (
        <section className="container-page py-14 md:py-16">
          <SectionHeader icon="📚" title={ui.topicsTitle} subtitle={ui.topicsDesc} />
          {relatedContent.length > 0 ? (
            <CardGrid cols={3}>
              {relatedContent.map((item) => (
                <ContentCard
                  key={item.id}
                  lang={l}
                  type={item.content_type}
                  slug={item.slug}
                  title={item.title}
                  summary={item.summary}
                  published_at={item.published_at}
                  isFallback={item.isFallback}
                />
              ))}
            </CardGrid>
          ) : (
            <EmptyState icon="📭" title={ui.noContent} />
          )}
        </section>
      )}

      {gate.visible("k3") && relatedFields.length > 0 && (
        <section className="container-page pb-14">
          <SectionHeader icon="🔗" title={ui.relatedTitle} />
          <CardGrid cols={3}>
            {relatedFields.map((relField) => (
              <InfoCard
                key={relField.id}
                href={`/${l}/fields/${relField.slug}`}
                icon={relField.icon ?? "📖"}
                title={relField.name}
                cta={ui.explore}
                gradientClass={fieldColor(relField)}
              />
            ))}
          </CardGrid>
        </section>
      )}

      {gate.visible("k4") && (
        <section className="container-page pb-14">
          <div className="grid gap-4 md:grid-cols-2">
            {prevField && (
              <Link
                href={`/${l}/fields/${prevField.slug}`}
                className="card card-interactive group flex items-center gap-4 p-5"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(prevField)} text-2xl text-white shadow-md`}>
                  {renderDesignIcon(prevField.icon ?? "📖", 24)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">← {ui.prevField}</p>
                  <p className="truncate font-black text-slate-900 dark:text-white">{prevField.name}</p>
                </div>
              </Link>
            )}

            {nextField && (
              <Link
                href={`/${l}/fields/${nextField.slug}`}
                className="card card-interactive group flex items-center gap-4 p-5 text-end md:text-start"
              >
                <div className="min-w-0 flex-1 text-end md:text-start">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{ui.nextField} →</p>
                  <p className="truncate font-black text-slate-900 dark:text-white">{nextField.name}</p>
                </div>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(nextField)} text-2xl text-white shadow-md`}>
                  {renderDesignIcon(nextField.icon ?? "📖", 24)}
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {gate.visible("k5") && (
        <div className="container-page pb-16 text-center">
          <Link href={`/${l}/fields`} className="btn-primary inline-flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? "rotate-180" : ""}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {ui.allFields}
          </Link>
        </div>
      )}

      <Footer lang={l} />
    </main>
  );
}
