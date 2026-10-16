// app/[lang]/topic/[slug]/page.tsx
// صفحة مجموعة/موضوع عامة تُبنى من هيكل التنقّل (lib/navigation).
// تُستخدم لكل عقدة في القائمة لا تملك صفحة مخصّصة، وتعرض أبناءها + محتوى مرتبط.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/content";
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
import TopBar from "@/components/TopBar";
import ContentCard from "@/components/learn/ContentCard";

export const dynamic = "force-dynamic";

const UI: Record<string, Record<string, string>> = {
  ar: {
    home: "الرئيسية",
    subTopics: "المواضيع الفرعية",
    related: "محتوى ذو صلة",
    noContent: "لا يوجد محتوى منشور في هذا القسم بعد. يمكن للمشرف إضافة محتوى من لوحة التحكم.",
    exploreAll: "استكشف كل المواضيع",
    readMore: "اقرأ المزيد",
  },
  en: {
    home: "Home",
    subTopics: "Sub-topics",
    related: "Related content",
    noContent: "No published content in this section yet. An admin can add content from the dashboard.",
    exploreAll: "Explore all topics",
    readMore: "Read more",
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
          ? { taxonomySlug: node.taxonomy }
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
  const { lang, slug } = await params;
  if (!isValidLang(lang)) return {};
  const l = lang as Lang;
  const node = findNavNode(slug);
  if (!node) return {};
  const title = navLabel(node, l);
  return {
    title,
    description: node.desc ? (l === "ar" ? node.desc.ar : node.desc.en) : title,
    alternates: {
      canonical: `/${l}/topic/${slug}`,
      languages: { ar: `/ar/topic/${slug}`, en: `/en/topic/${slug}` },
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
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

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <Header lang={l} settings={settings} />

      {gate.visible("hero") && (
        <>
          <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 py-16 text-white">
            <div className="container-page">
              <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-primary-100" aria-label="breadcrumb">
                <Link href={`/${l}`} className="hover:text-white">
                  {ui.home}
                </Link>
                {crumb.slice(0, -1).map((c) => (
                  <span key={c.key} className="flex items-center gap-2">
                    <span aria-hidden="true">/</span>
                    <Link href={`/${l}${navHref(c)}`} className="hover:text-white">
                      {navLabel(c, l)}
                    </Link>
                  </span>
                ))}
              </nav>

              <div className="flex items-start gap-4">
                {node.icon && (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                    {node.icon}
                  </span>
                )}
                <div>
                  <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
                  {node.desc && (
                    <p className="mt-3 max-w-2xl text-primary-100">
                      {l === "ar" ? node.desc.ar : node.desc.en}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <TopBar
        title={title}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          ...crumb.slice(0, -1).map((c) => ({
            label: navLabel(c, l),
            href: `/${l}${navHref(c)}`,
          })),
          { label: title },
        ]}
      />

      {children.length > 0 && gate.visible("children") && (
        <>
          <section className="container-page py-12">
            <h2 className="mb-6 text-2xl font-black text-primary-900 dark:text-white">
              {ui.subTopics}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <Link
                  key={child.key}
                  href={`/${l}${navHref(child)}`}
                  className="card card-interactive flex items-start gap-3 p-5"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {child.icon}
                  </span>
                  <span>
                    <span className="block font-bold text-primary-900 dark:text-white">
                      {navLabel(child, l)}
                    </span>
                    {child.desc && (
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                        {l === "ar" ? child.desc.ar : child.desc.en}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {gate.visible("content") && (
        <>
          <section className="container-page pb-16">
            <h2 className="mb-6 text-2xl font-black text-primary-900 dark:text-white">
              {ui.related}
            </h2>
            {items.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 dark:border-night-700 dark:bg-night-800 dark:text-slate-400">
                {ui.noContent}
              </div>
            )}
          </section>
        </>
      )}

      <Footer lang={l} settings={settings} />
    </main>
  );
}
