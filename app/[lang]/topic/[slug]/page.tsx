// app/[lang]/topic/[slug]/page.tsx
// صفحة مجموعة/موضوع عامة تُبنى من هيكل التنقّل (lib/navigation).
// تُستخدم لكل عقدة في القائمة لا تملك صفحة مخصّصة، وتعرض أبناءها + محتوى مرتبط.
// تعتمد نظام التصميم الموحّد من components/ui.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { decodeParam } from "@/lib/params";
import { getSiteSettings } from "@/lib/content";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import {
  NAV_TREE,
  applyNavigationConfig,
  findNavNode,
  navBreadcrumb,
  navHref,
  navLabel,
  type NavNode,
} from "@/lib/navigation";
import { getPublicList, type PublicItem } from "@/lib/learn/public";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentCard from "@/components/learn/ContentCard";
import { PageHero, SectionHeader, CardGrid, InfoCard, EmptyState, type Crumb } from "@/components/ui";

export const dynamic = "force-dynamic";

const UI: Record<string, Record<string, string>> = {
  ar: {
    home: "الرئيسية",
    subTopics: "المواضيع الفرعية",
    related: "محتوى ذو صلة",
    noContent: "لا يوجد محتوى منشور في هذا القسم بعد.",
    noContentHint: "سيظهر المحتوى هنا تلقائيًا بمجرد نشره من لوحة التحكم.",
    exploreAll: "استكشف كل المواضيع",
    itemsLabel: "عنصرًا",
  },
  en: {
    home: "Home",
    subTopics: "Sub-topics",
    related: "Related content",
    noContent: "No published content in this section yet.",
    noContentHint: "Content will appear here automatically once published.",
    exploreAll: "Explore all topics",
    itemsLabel: "items",
  },
};

function findNodeBySlug(slug: string, lang: Lang, settings: Record<string, unknown>): NavNode | null {
  const tree = applyNavigationConfig(settings?.navigation, NAV_TREE);
  const stack = [...tree];
  while (stack.length) {
    const node = stack.shift() as NavNode;
    if (node.key === slug) return node;
    if (node.children?.length) stack.push(...node.children);
  }
  // احتياط: ابحث في الشجرة الافتراضية
  return findNavNode(slug) ?? null;
}

async function getRelated(lang: Lang, node: NavNode): Promise<PublicItem[]> {
  const types = node.contentType ? [node.contentType] : ["lesson", "article", "fatwa", "hadith", "story"];
  const search = navLabel(node, lang);
  const results = await Promise.all(
    types.map((type) =>
      getPublicList(lang, type, {
        limit: 6,
        ...(node.taxonomy
          ? { taxonomySlug: node.taxonomy, includeDescendants: true }
          : { search }),
      }).catch(() => [] as PublicItem[])
    )
  );
  const seen = new Set<string>();
  return results
    .flat()
    .filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 9);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  if (!isValidLang(lang)) return {};
  const l = lang as Lang;
  const node = findNavNode(slug);
  if (!node) return {};
  const title = navLabel(node, l);
  const description = node.desc ? (l === "ar" ? node.desc.ar : node.desc.en) : title;
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/topic/${slug}`,
      languages: { ar: `/ar/topic/${slug}`, en: `/en/topic/${slug}` },
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      images: [
        {
          url: `/og/og-${l}.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/og-${l}.png`],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const isRTL = l === "ar";
  const ui = UI[l];
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings as Record<string, unknown>), "topic", l);

  const node = findNodeBySlug(slug, l, settings as Record<string, unknown>);
  if (!node) notFound();

  const title = navLabel(node, l);
  const crumb = navBreadcrumb(node.key);
  const items = await getRelated(l, node);
  const children = node.children ?? [];

  const breadcrumb: Crumb[] = [
    { label: ui.home, href: `/${l}` },
    ...crumb.slice(0, -1).map((c) => ({ label: navLabel(c, l), href: `/${l}${navHref(c)}` })),
    { label: title },
  ];

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <Header lang={l} settings={settings} />

      {gate.visible("hero") && (
        <PageHero
          icon={node.icon}
          title={title}
          subtitle={node.desc ? (isRTL ? node.desc.ar : node.desc.en) : undefined}
          crumbs={breadcrumb}
          stats={items.length > 0 ? [{ value: String(items.length), label: ui.itemsLabel }] : undefined}
        />
      )}

      {children.length > 0 && gate.visible("children") && (
        <section className="container-page py-14 md:py-16">
          <SectionHeader icon="🗂️" title={gate.title("children", ui.subTopics, l)} />
          <CardGrid cols={3} gap={4}>
            {children.map((child) => (
              <InfoCard
                key={child.key}
                href={`/${l}${navHref(child)}`}
                icon={child.icon}
                title={navLabel(child, l)}
                desc={child.desc ? (isRTL ? child.desc.ar : child.desc.en) : undefined}
                lang={l}
              />
            ))}
          </CardGrid>
        </section>
      )}

      {gate.visible("content") && (
        <section className="container-page pb-16">
          <SectionHeader icon="📚" title={gate.title("content", ui.related, l)} />
          {items.length > 0 ? (
            <CardGrid cols={3}>
              {items.map((item) => (
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
            <EmptyState icon="🗂️" title={ui.noContent} desc={ui.noContentHint} actionHref={`/${l}/fields`} actionLabel={ui.exploreAll} />
          )}
        </section>
      )}

      <Footer lang={l} settings={settings} />
    </main>
  );
}
