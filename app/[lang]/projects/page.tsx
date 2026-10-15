// app/[lang]/projects/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getPublicList, type PublicItem } from "@/lib/learn/public";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = { ar: string; en: string; [key: string]: string };

type Project = {
  id: string;
  icon: string;
  gradient: string;
  title: Localized;
  desc: Localized;
  goal: Localized;
  category: Localized;
  raised?: Localized;
  progress?: number; // 0-100
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  contributeNow: string;
  contactUs: string;
  goal: string;
  raised: string;
  progress: string;
  whyContributeTitle: string;
  reason1Title: string;
  reason1Desc: string;
  reason2Title: string;
  reason2Desc: string;
  reason3Title: string;
  reason3Desc: string;
  reason4Title: string;
  reason4Desc: string;
  verse: string;
  verseSource: string;
  loading: string;
  noProjects: string;
  noProjectsDesc: string;
  projectsCount: string;
  fieldsCount: string;
  transparent: string;
  free: string;
  introTitle: string;
  introDesc: string;
  relatedTitle: string;
  contactPage: string;
  contactPageDesc: string;
  dawahPage: string;
  dawahPageDesc: string;
  fatwaPage: string;
  fatwaPageDesc: string;
  aboutPage: string;
  aboutPageDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  allProjects: string;
  chooseProject: string;
  hadith: string;
  hadithSource: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, UILang> = {
  ar: {
    title: "المشاريع الدعوية",
    subtitle: "ساهم معنا في نشر العلم والخير",
    home: "الرئيسية",
    description:
      "صفحة المشاريع الدعوية لمنصة إسماعيل أحمد نجيب. ساهم في مشاريع صدقة جارية لنشر العلم الشرعي ودعم الدعاة وطلاب العلم.",
    contributeNow: "ساهم الآن",
    contactUs: "تواصل معنا",
    goal: "الهدف",
    raised: "تم جمعه",
    progress: "التقدم",
    whyContributeTitle: "لماذا تساهم معنا؟",
    reason1Title: "صدقة جارية",
    reason1Desc: "أجر مستمر ما دام الناس ينتفعون بالمشروع، يُكتب في ميزان حسناتك إلى يوم القيامة.",
    reason2Title: "نشر العلم",
    reason2Desc: "ساهم في نشر العلم الشرعي الصحيح وتعليم الناس أمور دينهم.",
    reason3Title: "شفافية كاملة",
    reason3Desc: "تقارير دورية عن كل مشروع ومصاريفه، مع صور وأدلة على التنفيذ.",
    reason4Title: "أثر مستدام",
    reason4Desc: "مشاريع مصممة لتستمر سنوات وتخدم أجيالاً متعددة.",
    verse: "﴿ مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً ﴾",
    verseSource: "سورة البقرة — الآية 245",
    loading: "جاري تحميل المشاريع...",
    noProjects: "لا توجد مشاريع حالياً",
    noProjectsDesc: "سيتم إضافة مشاريع جديدة قريباً إن شاء الله. ترقب الإعلانات.",
    projectsCount: "مشروع",
    fieldsCount: "مجالات",
    transparent: "شفافية 100%",
    free: "لوجه الله",
    introTitle: "ساهم في صدقة جارية",
    introDesc:
      "كل مشروع من هذه المشاريع هو صدقة جارية، وكل مساهمة منك تُكتب في ميزان حسناتك ما دام الناس ينتفعون بها. قال ﷺ: «إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له».",
    relatedTitle: "صفحات ذات صلة",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار عن طرق المساهمة.",
    dawahPage: "دليل الدعوة",
    dawahPageDesc: "كيف تكون داعية ناجحاً.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أحكام الزكاة والصدقات.",
    aboutPage: "من نحن",
    aboutPageDesc: "تعرّف على رسالة المنصة.",
    noteTitle: "تنبيهات مهمة",
    note1: "جميع المساهمات تُصرف في وجوهها الشرعية المحددة، ولا تُستخدم في مصاريف إدارية إلا بنسب محدودة ومعروفة.",
    note2: "للاستفسار عن تفاصيل أي مشروع أو طرق التحويل، يُرجى التواصل معنا مباشرة عبر صفحة التواصل.",
    allProjects: "كل المشاريع",
    chooseProject: "اختر المشروع الذي تريد المساهمة فيه",
    hadith: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ",
    hadithSource: "رواه مسلم",
  },
  en: {
    title: "Dawah Projects",
    subtitle: "Contribute with us to spread knowledge and goodness",
    home: "Home",
    description:
      "Dawah projects page of the Ismail Ahmed Naguib Platform. Contribute to ongoing charity projects to spread Islamic knowledge and support da'ees and students of knowledge.",
    contributeNow: "Contribute Now",
    contactUs: "Contact Us",
    goal: "Goal",
    raised: "Raised",
    progress: "Progress",
    whyContributeTitle: "Why Contribute With Us?",
    reason1Title: "Ongoing Charity",
    reason1Desc: "Continuous reward as long as people benefit from the project, recorded in your good deeds until the Day of Judgment.",
    reason2Title: "Spread Knowledge",
    reason2Desc: "Contribute to spreading authentic Islamic knowledge and teaching people their religion.",
    reason3Title: "Full Transparency",
    reason3Desc: "Periodic reports on each project and its expenses, with photos and proof of implementation.",
    reason4Title: "Sustainable Impact",
    reason4Desc: "Projects designed to last for years and serve multiple generations.",
    verse: "\"Who is it that would loan Allah a goodly loan so He may multiply it for him many times over?\"",
    verseSource: "Surah Al-Baqarah — Verse 245",
    loading: "Loading projects...",
    noProjects: "No projects currently",
    noProjectsDesc: "New projects will be added soon, in sha Allah. Watch for announcements.",
    projectsCount: "Projects",
    fieldsCount: "Fields",
    transparent: "100% Transparent",
    free: "For Allah's Sake",
    introTitle: "Contribute to Ongoing Charity",
    introDesc:
      "Each of these projects is ongoing charity (sadaqah jariyah), and every contribution from you is recorded in your good deeds as long as people benefit from it. The Prophet ﷺ said: 'When a person dies, their deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for them.'",
    relatedTitle: "Related Pages",
    contactPage: "Contact Us",
    contactPageDesc: "For contribution inquiries.",
    dawahPage: "Dawah Guide",
    dawahPageDesc: "How to be an effective da'ee.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Rulings on zakat and charity.",
    aboutPage: "About Us",
    aboutPageDesc: "Learn about the platform's mission.",
    noteTitle: "Important Notices",
    note1: "All contributions are spent on their specified legitimate purposes and are not used for administrative expenses except in limited and known ratios.",
    note2: "For details on any project or transfer methods, please contact us directly through the contact page.",
    allProjects: "All Projects",
    chooseProject: "Choose the project you want to contribute to",
    hadith: "Whoever guides someone to goodness will have a reward like the one who does it.",
    hadithSource: "Narrated by Muslim",
  },
};

// ============================================================
// مصدر البيانات: واجهة المكتبة العامة (CMS)
// ============================================================

// نصوص حرفية حتى يلتقطها Tailwind عند البناء.
const GRADIENTS = [
  "from-primary-500 to-primary-700",
  "from-primary-500 to-primary-700",
  "from-purple-500 to-purple-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
  "from-indigo-500 to-indigo-700",
];

// يحوّل عنصر CMS إلى شكل المشروع الذي يتوقعه التصميم الحالي.
function toProject(item: PublicItem, index: number): Project {
  const term =
    item.terms.find((t) => t.kind === "category") || item.terms[0] || null;

  const name = term?.name?.trim() || "";
  const title = item.title?.trim() || "";
  const desc = item.summary?.trim() || item.body?.trim() || "";

  return {
    id: item.slug || item.id,
    icon: term?.icon || "🤝",
    gradient: GRADIENTS[index % GRADIENTS.length],
    category: { ar: name || "مشروع دعوي", en: name || "Dawah Project" },
    title: { ar: title, en: title },
    desc: { ar: desc, en: desc },
    // لا يوجد حقل «الهدف/المبلغ المُجمَّع» في CMS، فنُبقيه فارغًا مع الحفاظ على نفس التصميم.
    goal: { ar: "", en: "" },
  };
}

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
      canonical: `/${l}/projects`,
      languages: {
        ar: "/ar/projects",
        en: "/en/projects",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/projects`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          alt: ui.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.title,
      description: ui.description,
      images: ["/icon-512.png"],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ============================================================
// الصفحة
// ============================================================

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const L = lang as Lang;
  const ui = UI[L];
  const isRTL = L === "ar";

  // جلب المشاريع المنشورة من CMS
  const projects = (
    await getPublicList(L, "page", { taxonomySlug: "projects", limit: 60 })
  ).map(toProject);
  const uniqueCategories = new Set(projects.map((p) => p.category[L]));

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: L,
        url: `/${L}/projects`,
        articleSection: isRTL ? "المشاريع الدعوية" : "Dawah Projects",
        keywords: isRTL
          ? "مشاريع دعوية, صدقة جارية, تبرعات, دعم الدعوة"
          : "dawah projects, ongoing charity, donations, dawah support",
      },
      ...projects.map((project) => ({
        "@type": "Project",
        name: project.title[L],
        description: project.desc[L],
        inLanguage: L,
        url: `/${L}/projects#${project.id}`,
      })),
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={L} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${L}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${L}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-primary-50 via-cream-dark to-gold-50 p-8 md:p-12 dark:border-gold-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gold-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          {/* زخارف */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold-200/30 blur-3xl dark:bg-gold-800/20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-800/20" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0e7490, #d4af37)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              🌟 {isRTL ? "صدقة جارية" : "Ongoing Charity"}
            </span>

            <h1
              className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {ui.title}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.description}
            </p>

            {/* حديث شريف */}
            <div className="mt-8 rounded-2xl border border-primary-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-primary-800 dark:bg-night-800/80">
              <p
                className="mb-2 text-lg font-black text-primary-700 md:text-xl dark:text-primary-300"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                «{ui.hadith}»
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                📜 {ui.hadithSource}
              </p>
            </div>
          </div>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="🎯" label={ui.projectsCount} value={projects.length} color="primary" />
          <StatCard icon="📂" label={ui.fieldsCount} value={uniqueCategories.size} color="gold" />
          <StatCard icon="🤝" label={ui.transparent} value="✓" color="primary" />
          <StatCard icon="✨" label={ui.free} value="100%" color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card relative mb-10 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-3xl dark:bg-gold-900/40">
                🌟
              </span>
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.introTitle}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>
          </div>
        </div>

        {/* ===== المشاريع ===== */}
        <div className="mb-12">
          <div className="mb-6">
            <h2
              className="section-title mb-2"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              🎯 {ui.allProjects}
            </h2>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {ui.chooseProject}
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="mb-6 flex justify-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl dark:bg-night-800">
                  📭
                </span>
              </div>
              <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                {ui.noProjects}
              </h2>
              <p className="mb-6 text-slate-500 dark:text-slate-400">
                {ui.noProjectsDesc}
              </p>
              <Link href={`/${L}/contact`} className="btn-primary">
                {ui.contactUs}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  lang={L}
                  ui={ui}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== لماذا تساهم ===== */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2
              className="section-title mb-0"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💎 {ui.whyContributeTitle}
            </h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ReasonCard
              icon="🌟"
              title={ui.reason1Title}
              description={ui.reason1Desc}
              color="gold"
            />
            <ReasonCard
              icon="📚"
              title={ui.reason2Title}
              description={ui.reason2Desc}
              color="primary"
            />
            <ReasonCard
              icon="🔍"
              title={ui.reason3Title}
              description={ui.reason3Desc}
              color="gold"
            />
            <ReasonCard
              icon="🌱"
              title={ui.reason4Title}
              description={ui.reason4Desc}
              color="primary"
            />
          </div>
        </div>

        {/* ===== آية كريمة ===== */}
        <div className="card relative mb-10 overflow-hidden border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 text-center md:p-12 dark:border-gold-700 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <p
            className="mb-3 text-2xl font-black text-primary-700 md:text-4xl dark:text-gold-300"
            style={{ fontFamily: "var(--font-quran)" }}
          >
            {ui.verse}
          </p>
          <p className="text-sm text-gold-700 dark:text-gold-400">
            {ui.verseSource}
          </p>
        </div>

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mb-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${L}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📬</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/dawah-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🤝</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.dawahPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">⚖️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwaPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.fatwaPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${L}/about`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">ℹ️</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.aboutPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.aboutPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== تنبيهات ===== */}
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>
            <div>
              <h2
                className="mb-4 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={L} />
    </main>
  );
}

// ============================================================
// مكون ProjectCard
// ============================================================

function ProjectCard({
  project,
  lang,
  ui,
}: {
  project: Project;
  lang: Lang;
  ui: UILang;
}) {
  return (
    <article
      id={project.id}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${project.gradient} p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-7`}
    >
      {/* زخرفة خلفية */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        {/* الرأس */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            {project.icon}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm">
            {project.category[lang]}
          </span>
        </div>

        {/* العنوان */}
        <h3
          className="mb-3 text-2xl font-black leading-tight"
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {project.title[lang]}
        </h3>

        {/* الوصف */}
        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-white/90">
          {project.desc[lang]}
        </p>

        {/* الهدف والتقدم */}
        <div className="mb-5 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white/80">{ui.goal}:</span>
            <span
              className="text-lg font-black text-gold-300"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {project.goal[lang]}
            </span>
          </div>

          {project.raised && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-white/80">{ui.raised}:</span>
              <span className="text-sm font-black text-white">
                {project.raised[lang]}
              </span>
            </div>
          )}

          {typeof project.progress === "number" && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span>{ui.progress}</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-1000"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex gap-3">
          <Link
            href={`/${lang}/contact`}
            className="flex-1 rounded-xl bg-white py-3 text-center font-black text-slate-900 transition-all hover:bg-white/90 active:scale-95"
          >
            💬 {ui.contributeNow}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="rounded-xl border border-white/30 bg-white/15 px-5 py-3 font-black backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95"
            aria-label={ui.contactUs}
          >
            📞
          </Link>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// مكون StatCard
// ============================================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: "primary" | "gold";
}) {
  const colorClasses = {
    primary: "text-primary-700 dark:text-primary-300",
    gold: "text-gold-700 dark:text-gold-300",
  };

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// مكون ReasonCard
// ============================================================

function ReasonCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: "primary" | "gold";
}) {
  const borderClass = color === "gold" ? "border-gold-500" : "border-primary-500";
  const iconBg = color === "gold" ? "bg-gold-100 dark:bg-gold-900/40" : "bg-primary-100 dark:bg-primary-900/40";
  const titleColor = color === "gold" ? "text-gold-700 dark:text-gold-300" : "text-primary-700 dark:text-primary-300";

  return (
    <div className={`card border-t-4 ${borderClass} p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className="mb-4 flex justify-center">
        <span className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBg} text-4xl`}>
          {icon}
        </span>
      </div>
      <h3
        className={`mb-2 text-lg font-black ${titleColor}`}
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}


