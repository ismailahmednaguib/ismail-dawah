// app/[lang]/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, t, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

type AboutContent = {
  intro: string;
  storyTitle: string;
  story: string[];
  missionTitle: string;
  mission: string;
  visionTitle: string;
  vision: string;
  valuesTitle: string;
  values: {
    icon: string;
    title: string;
    description: string;
  }[];
  founderTitle: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  ctaTitle: string;
  ctaDescription: string;
  contactBtn: string;
  homeBtn: string;
};

const CONTENT: Record<Lang, AboutContent> = {
  ar: {
    intro:
      "منصة إسماعيل أحمد نجيب الدعوية هي محاولة عملية لتقديم محتوى إسلامي منظم، سهل الوصول، ومتعدد اللغات، يخدم المسلم الجديد، وطالب العلم، والداعية، والعائلة المسلمة.",
    storyTitle: "فكرة المنصة",
    story: [
      "بدأت الفكرة من حاجة حقيقية: كثير من الناس يبحث عن إجابة شرعية واضحة، أو ذكر يومي، أو دليل عملي للصلاة والحج والزكاة، لكنه يتوه بين مصادر مشتتة أو محتوى غير منظم.",
      "لذلك جاءت هذه المنصة لتكون مكانًا واحدًا جامعًا: القرآن، الأذكار، الفتاوى، الدلائل الشرعية، الأدوات الدعوية، والمحتوى الموجز لغير المسلمين والمهتمين بالدخول في الإسلام.",
      "الهدف ليس مجرد نشر معلومة، بل بناء تجربة إسلامية متكاملة: سهلة، محترمة للوقت، مدعومة بالترجمة، وتعمل بشكل جيد على الموبايل.",
    ],
    missionTitle: "الرسالة",
    mission:
      "نشر العلم الشرعي النافع بأسلوب معاصر، وتيسير الوصول إليه لكل مسلم ومتطلع للحقيقة، مع الحفاظ على المنهج الوسطي والأدلة الشرعية.",
    visionTitle: "الرؤية",
    vision:
      "أن تكون المنصة مرجعًا دعويًا وتعليميًا موثوقًا، يخدم العرب والمسلمين حول العالم، ويساعد الدعاة والمؤسسات الدعوية على إنتاج ونشر المحتوى بفعالية.",
    valuesTitle: "القيم التي نعمل بها",
    values: [
      {
        icon: "📚",
        title: "العلم بالدليل",
        description:
          "نحرص على أن يكون المحتوى مبنيًا على القرآن والسنة وفهم السلف الصالح، مع ذكر المصدر متى أمكن.",
      },
      {
        icon: "",
        title: "سهولة الوصول",
        description:
          "نصمم التجربة لتكون بسيطة وسريعة، لأن إيصال الخير لا يجب أن يكون معقدًا.",
      },
      {
        icon: "🤝",
        title: "الرحمة والحكمة",
        description:
          "الدعوة تحتاج علمًا ورفقًا، لذلك نبتعد عن التشهير والتعالي ونقترب من البيان واللطف.",
      },
      {
        icon: "🧩",
        title: "التكامل",
        description:
          "نجمع بين العبادة والعلم والدعوة والأدوات اليومية في منظومة واحدة.",
      },
      {
        icon: "🔒",
        title: "احترام المستخدم",
        description:
          "لا نزعج الزائر، ونحاول تقديم قيمة حقيقية دون حشو أو إعلانات مزاحمة.",
      },
      {
        icon: "✨",
        title: "التجديد المستمر",
        description:
          "المنصة في تطوير دائم، ونستمع للاقتراحات لتحسين المحتوى والتجربة.",
      },
    ],
    founderTitle: "عن صاحب المنصة",
    founderName: "إسماعيل أحمد نجيب",
    founderRole: "باحث وداعية ومصمم تجربة إسلامية رقمية",
    founderBio:
      "يهتم بإنتاج المحتوى الدعوي والتعليمي، وربط العلوم الشرعية بالأدوات الرقمية الحديثة. يرى أن الدعوة في عصرنا تحتاج تنظيمًا واحترافية في العرض، لا فقط حماسًا في النقل.",
    ctaTitle: "هل تريد التواصل أو اقتراح محتوى؟",
    ctaDescription:
      "نسعد برسائلك، سواء كانت سؤالًا شرعيًا، اقتراح تحسين، أو تعاونًا دعويًا.",
    contactBtn: "تواصل معنا",
    homeBtn: "العودة للرئيسية",
  },
  en: {
    intro:
      "Ismail Ahmed Naguib Dawah Platform is a practical attempt to provide organized, accessible, multilingual Islamic content for new Muslims, students of knowledge, da‘ees, and Muslim families.",
    storyTitle: "The Idea Behind the Platform",
    story: [
      "The idea came from a real need: many people search for a clear Islamic answer, a daily adhkar routine, or a practical guide to prayer, Hajj, and Zakah, but they get lost between scattered sources and poorly organized content.",
      "That is why this platform was built as one unified place: Quran, adhkar, fatwas, Islamic guides, dawah tools, and concise content for non-Muslims and those interested in learning about Islam.",
      "The goal is not only to publish information, but to build a complete Islamic experience: simple, respectful of the user’s time, translation-ready, and mobile-friendly.",
    ],
    missionTitle: "Mission",
    mission:
      "To spread beneficial Islamic knowledge in a contemporary way, making it easy for every Muslim and truth-seeker to access it, while maintaining a balanced methodology and evidence-based approach.",
    visionTitle: "Vision",
    vision:
      "To become a trusted dawah and educational reference serving Arabs and Muslims worldwide, and helping da‘ees and Islamic institutions produce and distribute content effectively.",
    valuesTitle: "Our Working Values",
    values: [
      {
        icon: "📚",
        title: "Knowledge with Evidence",
        description:
          "We strive for content based on the Quran, Sunnah, and the understanding of the Salaf, citing sources when possible.",
      },
      {
        icon: "🌍",
        title: "Accessibility",
        description:
          "We design a simple and fast experience because delivering good should not be complicated.",
      },
      {
        icon: "🤝",
        title: "Mercy and Wisdom",
        description:
          "Dawah needs knowledge and gentleness, so we avoid harshness and focus on clear, kind communication.",
      },
      {
        icon: "🧩",
        title: "Integration",
        description:
          "We combine worship, knowledge, dawah, and daily tools in one ecosystem.",
      },
      {
        icon: "🔒",
        title: "Respect for Users",
        description:
          "We try not to overwhelm visitors and aim to provide real value without clutter.",
      },
      {
        icon: "✨",
        title: "Continuous Improvement",
        description:
          "The platform is always developing, and we welcome suggestions to improve content and UX.",
      },
    ],
    founderTitle: "About the Founder",
    founderName: "Ismail Ahmed Naguib",
    founderRole: "Researcher, da‘ee, and Islamic digital experience designer",
    founderBio:
      "He focuses on producing dawah and educational content, connecting Islamic sciences with modern digital tools. He believes dawah in our time needs organization and professional presentation, not only enthusiasm.",
    ctaTitle: "Want to contact us or suggest content?",
    ctaDescription:
      "We welcome your messages, whether an Islamic question, improvement suggestion, or dawah collaboration.",
    contactBtn: "Contact Us",
    homeBtn: "Back to Home",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;

  return {
    title: t(l, "about.title"),
    description: t(l, "about.subtitle"),
    alternates: {
      canonical: `/${l}/about`,
      languages: {
        ar: "/ar/about",
        en: "/en/about",
      },
    },
    openGraph: {
      title: t(l, "about.title"),
      description: t(l, "about.subtitle"),
      url: `/${l}/about`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const isRTL = l === "ar";
  const c = CONTENT[l];

  return (
    <main>
      <TopBar
        title={t(l, "about.title")}
        subtitle={t(l, "about.subtitle")}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: t(l, "nav.home"),
            href: `/${l}`,
          },
          {
            label: t(l, "about.title"),
          },
        ]}
      />

      <section className="container-page py-12 md:py-16">
        {/* ===== المقدمة ===== */}
        <div className="card relative overflow-hidden p-8 md:p-12">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              {isRTL ? "منصة دعوية شاملة" : "Complete Dawah Platform"}
            </span>

            <h1
              className="mb-5 text-3xl font-black text-slate-900 md:text-5xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {t(l, "about.title")}
            </h1>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {c.intro}
            </p>
          </div>
        </div>

        {/* ===== قصة المنصة ===== */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="card p-8">
            <h2
              className="mb-5 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {c.storyTitle}
            </h2>

            <div className="space-y-4">
              {c.story.map((paragraph, index) => (
                <p
                  key={index}
                  className="leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="card p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                  🎯
                </span>
                <h2
                  className="text-2xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {c.missionTitle}
                </h2>
              </div>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {c.mission}
              </p>
            </div>

            <div className="card p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/30">
                  👁️
                </span>
                <h2
                  className="text-2xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {c.visionTitle}
                </h2>
              </div>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {c.vision}
              </p>
            </div>
          </div>
        </div>

        {/* ===== القيم ===== */}
        <div className="mt-16">
          <div className="mb-10 text-center">
            <h2 className="section-title mb-0">{c.valuesTitle}</h2>
            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.values.map((value) => (
              <div key={value.title} className="card p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                  {value.icon}
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                  {value.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== المؤسس ===== */}
        <div className="mt-16">
          <div className="card overflow-hidden">
            <div className="gradient-hero relative p-8 text-white md:p-12">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1.5px, transparent 1.5px)",
                  backgroundSize: "60px 60px, 90px 90px",
                }}
              />

              <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-5xl backdrop-blur-sm">
                  👤
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-gold-300">
                    {c.founderTitle}
                  </p>

                  <h2
                    className="mb-2 text-3xl font-black md:text-4xl"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {c.founderName}
                  </h2>

                  <p className="mb-4 text-sm font-semibold text-primary-100">
                    {c.founderRole}
                  </p>

                  <p className="max-w-3xl leading-relaxed text-primary-50">
                    {c.founderBio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="mt-16">
          <div className="card p-8 text-center md:p-12">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 md:text-3xl dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              {c.ctaTitle}
            </h2>

            <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
              {c.ctaDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={`/${l}/contact`} className="btn-primary">
                {c.contactBtn}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className={isRTL ? "rotate-180" : ""}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href={`/${l}`}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 px-6 py-3 text-sm font-bold text-primary-700 transition-all hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-night-800"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className={isRTL ? "" : "rotate-180"}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {c.homeBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}