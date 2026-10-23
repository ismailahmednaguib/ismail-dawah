// app/[lang]/fields/page.tsx
// دليل المجالات الشرعية — يعتمد نظام التصميم الموحّد (components/ui).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, languages, type Lang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import { getPublicTaxonomies, getPublicTaxonomyCounts, type PublicTerm } from "@/lib/learn/public";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero, SectionHeader, CardGrid, InfoCard, Callout, RelatedGrid, EmptyState } from "@/components/ui";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  explore: string;
  verse: string;
  verseSource: string;
  totalFields: string;
  available: string;
  itemUnit: string;
  noFields: string;
  languages: string;
  comprehensive: string;
  freeAccess: string;
  introTitle: string;
  introDesc: string;
  relatedTitle: string;
  quranPage: string;
  quranPageDesc: string;
  articlesPage: string;
  articlesPageDesc: string;
  dawahPage: string;
  dawahPageDesc: string;
  doubtsPage: string;
  doubtsPageDesc: string;
  allFields: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, UILang> = {
  ar: {
    title: "مجالات المنصة",
    subtitle: "تصفح العلوم الشرعية والمجالات الدعوية المتنوعة",
    home: "الرئيسية",
    description:
      "اكتشف المجالات الشرعية المتنوعة التي تغطي العقيدة، الفقه، التفسير، الحديث، السيرة، الدعوة، الأخلاق، والقضايا المعاصرة.",
    explore: "استكشف المجال",
    verse: "﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾",
    verseSource: "سورة البقرة — الآية 31",
    totalFields: "مجال شرعي",
    available: "مجال متاح الآن",
    itemUnit: "مادة",
    noFields: "لا توجد مجالات منشورة حاليًا",
    languages: "لغات متاحة",
    comprehensive: "شامل",
    freeAccess: "مجاني بالكامل",
    introTitle: "لماذا مجالات متعددة؟",
    introDesc:
      "العلم الشرعي بحر واسع، وكل مجال يكمل الآخر. اخترنا لك أهم المجالات لتغطية احتياجات المسلم المعاصر: من التأسيس في العقيدة والعبادات، إلى التعامل مع قضايا العصر وشبهاته، مروراً بالدعوة والتربية والأسرة.",
    relatedTitle: "صفحات ذات صلة",
    quranPage: "القرآن الكريم",
    quranPageDesc: "اقرأ واستمع إلى كتاب الله.",
    articlesPage: "المقالات",
    articlesPageDesc: "مقالات تربوية ودعوية.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "أصول الدعوة ومهاراتها.",
    doubtsPage: "الشبهات والردود",
    doubtsPageDesc: "إجابات عن الشبهات الشائعة.",
    allFields: "جميع المجالات",
  },
  en: {
    title: "Platform Fields",
    subtitle: "Browse diverse Islamic sciences and Dawah fields",
    home: "Home",
    description:
      "Discover diverse Islamic fields covering Creed, Jurisprudence, Exegesis, Hadith, Biography, Dawah, Ethics, and Contemporary Issues.",
    explore: "Explore Field",
    verse: "\"And He taught Adam the names - all of them.\"",
    verseSource: "Surah Al-Baqarah — Verse 31",
    totalFields: "Islamic Fields",
    available: "Fields available now",
    itemUnit: "items",
    noFields: "No published fields are available yet",
    languages: "Available languages",
    comprehensive: "Comprehensive",
    freeAccess: "100% Free",
    introTitle: "Why Multiple Fields?",
    introDesc:
      "Islamic knowledge is a vast ocean, and each field complements the other. We selected the most important fields to cover the needs of the modern Muslim: from foundations in creed and worship, to dealing with contemporary issues and doubts, through dawah, upbringing, and family.",
    relatedTitle: "Related Pages",
    quranPage: "Holy Quran",
    quranPageDesc: "Read and listen to the Book of Allah.",
    articlesPage: "Articles",
    articlesPageDesc: "Educational and dawah articles.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "Principles and skills of dawah.",
    doubtsPage: "Doubts and Responses",
    doubtsPageDesc: "Answers to common doubts.",
    allFields: "All Fields",
  },
};

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/fields`,
      languages: { ar: "/ar/fields", en: "/en/fields" },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/fields`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{ url: `/og/og-${l}.png`, width: 1200, height: 630, alt: ui.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: [`/og/og-${l}.png`],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function FieldsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "fields", L);
  const ui = UI[L];
  const isRTL = L === "ar";

  const [fieldsRaw, counts] = await Promise.all([
    getPublicTaxonomies(L, "field"),
    getPublicTaxonomyCounts(),
  ]);
  // لا نعرض بابًا بلا مادة منشورة؛ هذا يمنع صفحات «قريبًا» الفارغة من الظهور للزائر.
  const fields = fieldsRaw
    .filter((field) => (counts[field.slug] ?? 0) > 0)
    .sort(
    (a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0)
  );
  const activeCount = fields.length;
  const fieldColor = (term: PublicTerm) => term.color ?? "from-primary-500 to-primary-600";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ui.title,
    description: ui.description,
    inLanguage: L,
    numberOfItems: fields.length,
    itemListElement: fields.map((field, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: field.name,
      description: field.name,
      url: `/${L}/fields/${field.slug}`,
    })),
  };

  const related = [
    { href: `/${L}/quran`, icon: "📖", title: ui.quranPage, desc: ui.quranPageDesc },
    { href: `/${L}/articles`, icon: "✍️", title: ui.articlesPage, desc: ui.articlesPageDesc },
    { href: `/${L}/dawah-guide`, icon: "🤝", title: ui.dawahPage, desc: ui.dawahPageDesc },
    { href: `/${L}/doubts`, icon: "❓", title: ui.doubtsPage, desc: ui.doubtsPageDesc },
  ];

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="site-page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={L} />

      <PageHero
        icon="📚"
        title={ui.title}
        subtitle={ui.description}
        badge={isRTL ? "📚 مجالات شرعية" : "📚 Islamic Fields"}
        crumbs={[{ label: ui.home, href: `/${L}` }, { label: ui.title }]}
        stats={
          gate.visible("k1")
            ? [
                { value: String(activeCount), label: ui.available },
                { value: String(languages.length), label: ui.languages },
                { value: "100%", label: ui.comprehensive },
                { value: "✓", label: ui.freeAccess },
              ]
            : undefined
        }
      />

      {gate.visible("k0") && (
        <section className="container-page pt-10">
          <Callout icon="🕌" tone="gold">
            <p
              className="text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {ui.verse}
            </p>
            <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">{ui.verseSource}</p>
          </Callout>
        </section>
      )}

      {gate.visible("k2") && (
        <section className="container-page pt-10">
          <Callout icon="💡" tone="primary" title={ui.introTitle}>
            {ui.introDesc}
          </Callout>
        </section>
      )}

      {gate.visible("k4") && (
        <section className="container-page py-14 md:py-16">
          {gate.visible("k3") && (
            <SectionHeader
              icon="📖"
              title={ui.allFields}
              action={<span className="badge-primary">{`${fields.length} ${ui.totalFields}`}</span>}
              align="start"
            />
          )}
          <CardGrid cols={3}>
            {fields.map((field) => {
              const count = counts[field.slug] ?? 0;
              return (
                <InfoCard
                  key={field.id}
                  href={`/${L}/fields/${field.slug}`}
                  icon={field.icon ?? "📖"}
                  title={field.name}
                  cta={ui.explore}
                  gradientClass={fieldColor(field)}
                  badge={`${count} ${ui.itemUnit}`}
                />
              );
            })}
          </CardGrid>
          {fields.length === 0 && <EmptyState icon="📭" title={ui.noFields} />}
        </section>
      )}

      {gate.visible("k5") && <RelatedGrid title={ui.relatedTitle} items={related} cols={4} lang={L} />}

      <Footer lang={L} />
    </main>
  );
}
