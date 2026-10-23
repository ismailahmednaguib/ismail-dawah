// app/[lang]/responses/page.tsx
// مركز الردود على الشبهات والتيارات
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";
import type { IconComponent } from "@/lib/icons";
import {
  BookOpenIcon,
  FileTextIcon,
  HelpCircleIcon,
  MosqueIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/lib/icons";
import { SITE_NAME, SITE_NAME_EN, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const COPY: Record<string, {
  title: string;
  subtitle: string;
  intro: string;
  overviewTitle: string;
  featuredTitle: string;
  sourceLabel: string;
  categories: Array<{ id: string; icon: IconComponent; title: string; desc: string; href: string }>;
  featured: Array<{ id: string; question: string; answer: string; source: string }>;
}> = {
  ar: {
    title: "مركز الردود على الشبهات",
    subtitle: "الرد على الشبهات المثارة حول الإسلام بالاستدلال من الكتاب والسنة، ومنطق السلف الصالح.",
    intro: "يُخصص هذا القسم للرد على الشبهات التي تُثار حول الدين الإسلامي، سواء من داخل المجتمع الإسلامي أو من خارجه، مع توثيق كل رد بالمراجع العلمية المعتمدة.",
    overviewTitle: "نبذة عن المركز",
    featuredTitle: "الردود المميزة",
    sourceLabel: "المصدر:",
    categories: [
      { id: "quran", icon: BookOpenIcon, title: "الشبهات حول القرآن", desc: "الرد على ما يُثار حول القرآن الكريم من تأويلات وشبهات.", href: "/doubts" },
      { id: "hadith", icon: FileTextIcon, title: "الشبهات حول السنة", desc: "الرد على الشبهات المتعلقة بالحديث الشريف وسنة النبي ﷺ.", href: "/doubts" },
      { id: "aqeedah", icon: MosqueIcon, title: "الشبهات حول العقيدة", desc: "الرد على الشبهات المتعلقة بالتوحيد، والأسماء والصفات، والقدر.", href: "/doubts" },
      { id: "women", icon: ShieldIcon, title: "الشبهات حول المرأة", desc: "الرد على ما يُثار حول مكانة المرأة وحقوقها في الإسلام.", href: "/women-fatwas" },
      { id: "jihad", icon: ShieldIcon, title: "الشبهات حول الجهاد", desc: "الرد على الشبهات المتعلقة بالجهاد والقتال والحرب والسلم.", href: "/doubts" },
      { id: "science", icon: SparklesIcon, title: "الشبهات حول العلم والدين", desc: "الرد على الادعاءات بعدم توافق العلم مع الدين.", href: "/doubts" },
    ],
    featured: [
      {
        id: "1",
        question: "لماذا خلقنا الله إذا كان يعلم من سيطيعه ومن سيعصيه؟",
        answer: "علم الله السابق لا يُبطل الاختيار، فالله يعلم لكن العبد يختار ويحاسب على اختياره. العلم السابق ليس إجبارًا على الفعل.",
        source: "علماء أهل السنة والجماعة",
      },
      {
        id: "2",
        question: "لماذا يُسمح بتعدد الزوجات في الإسلام؟",
        answer: "تعدد الزوجات في الإسلام مقيد بشروط صارمة أبرزها العدل بين الزوجات، وهو رحمة لا إكراه.",
        source: "فقه الأسرة في الإسلام",
      },
    ],
  },
  en: {
    title: "Center for Responses to Doubts",
    subtitle: "Responding to doubts raised about Islam with evidence from the Quran and Sunnah, following the methodology of the righteous predecessors.",
    intro: "This section is dedicated to responding to doubts raised about the Islamic religion, whether from within the Muslim community or from outside it, with each response documented using accepted scholarly references.",
    overviewTitle: "About the center",
    featuredTitle: "Featured responses",
    sourceLabel: "Source:",
    categories: [
      { id: "quran", icon: BookOpenIcon, title: "Doubts About the Quran", desc: "Responding to allegations and doubts raised about the Holy Quran.", href: "/doubts" },
      { id: "hadith", icon: FileTextIcon, title: "Doubts About the Sunnah", desc: "Responding to doubts related to the Holy Hadith and the Sunnah of the Prophet ﷺ.", href: "/doubts" },
      { id: "aqeedah", icon: MosqueIcon, title: "Doubts About Creed", desc: "Responding to doubts related to monotheism, the names and attributes of Allah, and predestination.", href: "/doubts" },
      { id: "women", icon: ShieldIcon, title: "Doubts About Women", desc: "Responding to allegations about the status and rights of women in Islam.", href: "/women-fatwas" },
      { id: "jihad", icon: ShieldIcon, title: "Doubts About Jihad", desc: "Responding to doubts related to jihad, fighting, war and peace.", href: "/doubts" },
      { id: "science", icon: SparklesIcon, title: "Doubts About Science and Religion", desc: "Responding to claims of incompatibility between science and religion.", href: "/doubts" },
    ],
    featured: [
      {
        id: "1",
        question: "Why did God create us if He knows who will obey and who will disobey?",
        answer: "God's prior knowledge does not negate free will. God knows, but the servant chooses and is held accountable for their choice. Prior knowledge is not compulsion.",
        source: "Scholars of Ahl al-Sunnah wal-Jama'ah",
      },
      {
        id: "2",
        question: "Why is polygamy allowed in Islam?",
        answer: "Polygamy in Islam is restricted by strict conditions, the most prominent being justice between wives. It is a mercy, not compulsion.",
        source: "Islamic Family Law",
      },
    ],
  },
};

export default async function ResponsesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const L = lang as Lang;
  const c = COPY[L] ?? COPY.en;

  return (
    <>
      <Header lang={L} />
      <main id="main-content" tabIndex={-1} dir={L === "ar" ? "rtl" : "ltr"} className="site-page-shell">
        <PageHero
          icon={<ShieldIcon size={28} aria-hidden="true" />}
          badge={L === "ar" ? "مركز الردود" : "Responses Center"}
          title={c.title}
          subtitle={c.subtitle}
          crumbs={[
            { label: L === "ar" ? "الرئيسية" : "Home", href: `/${L}` },
            { label: c.title },
          ]}
        />

        <section className="section">
          <div className="container-page">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-primary-950 mb-3">{c.overviewTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{c.intro}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${L}${cat.href}`}
                  className="card-interactive group p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 text-xl group-hover:bg-primary-100 group-hover:text-primary-800 transition">
                    <cat.icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-bold text-primary-950">{cat.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-gold-50/70 dark:bg-gold-950/10">
          <div className="container-page max-w-4xl">
            <h2 className="text-2xl font-black text-primary-950 text-center mb-10">{c.featuredTitle}</h2>
            <div className="space-y-4">
              {c.featured.map((item) => (
                <div key={item.id} className="card p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-black w-6 h-6">
                      <HelpCircleIcon size={14} aria-hidden="true" />
                    </span>
                    <p className="font-bold text-primary-900">{item.question}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{item.answer}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-700 border-t border-cream-100 pt-3">
                    <span>{c.sourceLabel}</span>
                    <span className="italic">{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const L = isValidLang(lang) ? (lang as Lang) : "ar";
  const c = COPY[L] ?? COPY.en;
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/${L}/responses`;
  const ogImage = `${siteUrl}/og/og-${L}.png`;

  return {
    title: c.title,
    description: c.intro,
    alternates: {
      canonical: pageUrl,
      languages: {
        ar: `${siteUrl}/ar/responses`,
        en: `${siteUrl}/en/responses`,
        "x-default": `${siteUrl}/ar/responses`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.intro,
      type: "website",
      url: pageUrl,
      siteName: L === "ar" ? SITE_NAME : SITE_NAME_EN,
      locale: L === "ar" ? "ar_EG" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: c.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.intro,
      images: [ogImage],
    },
  };
}

