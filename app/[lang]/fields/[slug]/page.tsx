// app/[lang]/fields/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
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
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

// ============================================================
// نصوص الواجهة العامة
// ============================================================

const UI: Record<string, {
  home: string;
  explore: string;
  topicsTitle: string;
  topicsDesc: string;
  booksTitle: string;
  booksDesc: string;
  faqTitle: string;
  relatedTitle: string;
  relatedFields: string;
  nextField: string;
  prevField: string;
  author: string;
  allFields: string;
  notFoundTitle: string;
  notFoundDesc: string;
  backToFields: string;
}> = {
  ar: {
    home: "الرئيسية",
    explore: "استكشف",
    topicsTitle: "المواضيع الرئيسية",
    topicsDesc: "أهم المواضيع التي يغطيها هذا المجال",
    booksTitle: "كتب مقترحة",
    booksDesc: "أهم المراجع في هذا المجال",
    faqTitle: "أسئلة شائعة",
    relatedTitle: "مجالات ذات صلة",
    relatedFields: "مجالات مرتبطة",
    nextField: "المجال التالي",
    prevField: "المجال السابق",
    author: "المؤلف",
    allFields: "جميع المجالات",
    notFoundTitle: "المجال غير موجود",
    notFoundDesc: "عذراً، لم نتمكن من العثور على هذا المجال.",
    backToFields: "العودة للمجالات",
  },
  en: {
    home: "Home",
    explore: "Explore",
    topicsTitle: "Main Topics",
    topicsDesc: "Key topics covered in this field",
    booksTitle: "Recommended Books",
    booksDesc: "Important references in this field",
    faqTitle: "Frequently Asked Questions",
    relatedTitle: "Related Fields",
    relatedFields: "Related fields",
    nextField: "Next Field",
    prevField: "Previous Field",
    author: "Author",
    allFields: "All Fields",
    notFoundTitle: "Field Not Found",
    notFoundDesc: "Sorry, we couldn't find this field.",
    backToFields: "Back to Fields",
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
  const { lang, slug } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const fields = await getPublicTaxonomies(l, "field");
  const field = fields.find((f) => f.slug === slug);
  if (!field) return {};

  return {
    title: field.name,
    description: field.name,
    alternates: {
      canonical: `/${l}/fields/${slug}`,
      languages: {
        ar: `/ar/fields/${slug}`,
        en: `/en/fields/${slug}`,
      },
    },
    openGraph: {
      title: field.name,
      description: field.name,
      url: `/${l}/fields/${slug}`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "article",
      images: [{ url: "/icon-512.png", width: 512, height: 512, alt: field.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: field.name,
      description: field.name,
      images: ["/icon-512.png"],
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
  const { lang, slug } = await params;
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
  const nextField =
    currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  const relatedFields = siblings.filter((f) => f.slug !== field!.slug).slice(0, 3);

  const [lessons, articles] = await Promise.all([
    getPublicList(l, "lesson", { taxonomySlug: slug, taxonomyKind: taxKind, limit: 6 }),
    getPublicList(l, "article", { taxonomySlug: slug, taxonomyKind: taxKind, limit: 6 }),
  ]);
  const relatedContent: PublicItem[] = [...lessons, ...articles];

  const fieldColor = (term: PublicTerm) =>
    term.color ?? "from-primary-500 to-primary-600";
  const color = fieldColor(field);
  const icon = field.icon ?? "📖";

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
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={field.name}
        backHref={`/${l}/fields`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.allFields, href: `/${l}/fields` },
          { label: field.name },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero مخصص ===== */}
        {gate.visible('k0') && (<>
        <div className={`card relative mb-8 overflow-hidden border-2 border-transparent p-8 md:p-12 bg-gradient-to-br ${color} text-white`}>
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-5xl backdrop-blur-sm shadow-2xl">
                {icon}
              </span>
            </div>

            <h1
              className="mb-4 text-3xl font-black leading-tight md:text-5xl"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {field.name}
            </h1>
          </div>
        </div>

        </>)}
        {/* ===== إحصائيات ===== */}
        {gate.visible('k1') && (<>
        <div className="mb-10 grid grid-cols-3 gap-4">
          <StatCard icon="📚" value={lessons.length} label={isRTL ? "دروس" : "Lessons"} color={color} />
          <StatCard icon="✍️" value={articles.length} label={isRTL ? "مقالات" : "Articles"} color={color} />
          <StatCard icon="✨" value={relatedContent.length} label={isRTL ? "محتوى" : "Content"} color={color} />
        </div>

        </>)}
        {/* ===== محتوى مرتبط ===== */}
        {gate.visible('k2') && (<>
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.topicsTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">{ui.topicsDesc}</p>
          </div>

          {relatedContent.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/${l}/learn/${item.content_type}/${item.slug}`}
                  className="card card-interactive group relative overflow-hidden p-5"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-lg text-white shadow-md`}>
                      {contentIcon(item.content_type)}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className="text-base font-black text-slate-900 dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card border-dashed px-6 py-12 text-center">
              <p className="mb-2 text-4xl">📭</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRTL
                  ? "لا يوجد محتوى منشور في هذا المجال بعد."
                  : "No published content in this field yet."}
              </p>
            </div>
          )}
        </div>

        </>)}
        {/* ===== مجالات ذات صلة ===== */}
        {gate.visible('k3') && (<>
        {relatedFields.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 text-center">
              <h2 className="section-title mb-0">{ui.relatedTitle}</h2>
              <div className="islamic-divider my-0">
                <span className="text-xl text-gold-500">✦</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {relatedFields.map((relField) => (
                <Link
                  key={relField.id}
                  href={`/${l}/fields/${relField.slug}`}
                  className="card card-interactive group relative overflow-hidden p-6"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${fieldColor(relField)}`} />
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(relField)} text-2xl text-white shadow-md`}>
                      {relField.icon ?? "📖"}
                    </span>
                    <h3
                      className="text-lg font-black text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {relField.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        </>)}
        {/* ===== التنقل بين المجالات ===== */}
        {gate.visible('k4') && (<>
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {prevField && (
            <Link
              href={`/${l}/fields/${prevField.slug}`}
              className="card card-interactive group flex items-center gap-4 p-5"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(prevField)} text-2xl text-white shadow-md`}>
                {prevField.icon ?? "📖"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  ← {ui.prevField}
                </p>
                <p className="truncate font-black text-slate-900 dark:text-white">
                  {prevField.name}
                </p>
              </div>
            </Link>
          )}

          {nextField && (
            <Link
              href={`/${l}/fields/${nextField.slug}`}
              className="card card-interactive group flex items-center gap-4 p-5 text-end md:text-start"
            >
              <div className="min-w-0 flex-1 text-end md:text-start">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ui.nextField} →
                </p>
                <p className="truncate font-black text-slate-900 dark:text-white">
                  {nextField.name}
                </p>
              </div>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${fieldColor(nextField)} text-2xl text-white shadow-md`}>
                {nextField.icon ?? "📖"}
              </span>
            </Link>
          )}
        </div>

        </>)}
        {/* ===== CTA العودة ===== */}
        {gate.visible('k5') && (<>
        <div className="text-center">
          <Link href={`/${l}/fields`} className="btn-primary inline-flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? "rotate-180" : ""}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {ui.allFields}
          </Link>
        </div>
        </>)}
      </section>

      <Footer lang={l} />
    </main>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon, value, label, color,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl text-white shadow-md`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// أيقونة نوع المحتوى المرتبط
// ============================================================

function contentIcon(type: string): string {
  switch (type) {
    case "lesson":
      return "📚";
    case "article":
      return "✍️";
    case "fatwa":
      return "⚖️";
    case "hadith":
      return "📜";
    case "khutbah":
      return "🕌";
    case "faq":
      return "❓";
    case "story":
      return "📖";
    default:
      return "📄";
  }
}

