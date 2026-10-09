// app/[lang]/embrace-islam/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

export const dynamic = "force-static";

type Localized = {
  ar: string;
  en: string;
};

type Step = {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
  points: Localized[];
};

type QA = {
  id: string;
  question: Localized;
  answer: Localized[];
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  stepsTitle: string;
  stepsDesc: string;
  faqTitle: string;
  faqDesc: string;
  resourcesTitle: string;
  resourcesDesc: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  quran: string;
  prayerGuide: string;
  dawahGuide: string;
  articles: string;
  startNow: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "اعتناق الإسلام",
    subtitle: "دليل المسلم الجديد للبدء بثبات وطمأنينة",
    home: "الرئيسية",
    description:
      "صفحة مخصصة لمن يريد الدخول في الإسلام أو المسلم الجديد. خطوات مبسطة للشهادتين، الصلاة، التعلم، التعامل مع الأهل، وبناء حياة إيمانية هادئة.",
    stepsTitle: "خطوات البدء",
    stepsDesc:
      "الإسلام دين يسر، والمسلم الجديد يحتاج رفقًا وتدرجًا لا تضغطًا وتعقيدًا.",
    faqTitle: "أسئلة شائعة",
    faqDesc:
      "أسئلة يطرحها كثير من الباحثين عن الحق أو المسلمين الجدد.",
    resourcesTitle: "مواد مساعدة",
    resourcesDesc: "روابط داخلية تفيدك في البداية.",
    noteTitle: "تنبيه مهم",
    note1:
      "لا تستعجل على نفسك في معرفة كل شيء دفعة واحدة. Begin بالتوحيد والصلاة والأخلاق، ثم توسّع.",
    note2:
      "لو كان لديك أهل أو أصدقاء ضد إسلامك، فالرفق والصبر والدعاء أفضل من القطيعة أو الصدام.",
    note3:
      "هذه الصفحة للتوجيه العام، ولا تغني عن سؤال أهل العلم في التفاصيل الفقهية.",
    contact: "تواصل معنا",
    quran: "القرآن الكريم",
    prayerGuide: "دليل الصلاة",
    dawahGuide: "دليل الدعوة",
    articles: "المقالات",
    startNow: "ابدأ الآن",
  },
  en: {
    title: "Embracing Islam",
    subtitle: "A gentle guide for new Muslims and truth seekers",
    home: "Home",
    description:
      "A page for those who wish to enter Islam or new Muslims. Simple steps for Shahadah, prayer, learning, dealing with family, and building a calm faith life.",
    stepsTitle: "Getting Started Steps",
    stepsDesc:
      "Islam is a religion of ease. A new Muslim needs gentleness and gradual learning, not pressure and complexity.",
    faqTitle: "Common Questions",
    faqDesc:
      "Questions often asked by truth seekers and new Muslims.",
    resourcesTitle: "Helpful resources",
    resourcesDesc: "Internal links that can help you begin.",
    noteTitle: "Important notice",
    note1:
      "Do not rush yourself to know everything at once. Begin with tawhid, prayer, and manners, then expand.",
    note2:
      "If family or friends oppose your Islam, gentleness, patience, and supplication are better than rupture or confrontation.",
    note3:
      "This page is for general guidance and does not replace asking qualified scholars in detailed fiqh matters.",
    contact: "Contact Us",
    quran: "Holy Quran",
    prayerGuide: "Prayer Guide",
    dawahGuide: "Dawah Guide",
    articles: "Articles",
    startNow: "Start Now",
  },
};

const STEPS: Step[] = [
  {
    id: "intention",
    icon: "❤️",
    title: {
      ar: "1. صدق النية والبحث عن الحق",
      en: "1. Sincere Intention and Seeking Truth",
    },
    description: {
      ar: "أول خطوة أن تسأل الله بصدق أن يهديك للحق، وألا تمنعك العادات أو خوف الناس من اتباع الحقيقة.",
      en: "The first step is to sincerely ask Allah to guide you to truth, and not to let habits or fear of people prevent you from following truth.",
    },
    points: [
      {
        ar: "ادعُ: اللهم اهدني لما تحب وترضى.",
        en: "Supplicate: O Allah, guide me to what You love and are pleased with.",
      },
      {
        ar: "اقرأ عن التوحيد وأركان الإسلام بمصادر موثوقة.",
        en: "Read about tawhid and pillars of Islam from reliable sources.",
      },
      {
        ar: "لا تجعل الشك عذرًا للجمود، بل اجعله بداية بحث.",
        en: "Do not let doubt become an excuse for stagnation; let it be the start of seeking.",
      },
    ],
  },
  {
    id: "shahadah",
    icon: "🗣️",
    title: {
      ar: "2. النطق بالشهادتين",
      en: "2. Saying the Two Testimonies",
    },
    description: {
      ar: "بمجرد أن تؤمن بالله وحده لا شريك له وأن محمدًا عبده ورسوله، تنطق بالشهادتين بقلب موقن ولسان ناطق.",
      en: "Once you believe in Allah alone without partners and that Muhammad is His servant and messenger, you say the Shahadah with certain heart and speaking tongue.",
    },
    points: [
      {
        ar: "أشهد أن لا إله إلا الله.",
        en: "I bear witness that there is no god but Allah.",
      },
      {
        ar: "وأشهد أن محمدًا رسول الله.",
        en: "And I bear witness that Muhammad is the messenger of Allah.",
      },
      {
        ar: "يُستحب أن تشهد مجموعة من المسلمين أو شخصًا يفهم معنى الشهادة.",
        en: "It is recommended to have Muslims or someone who understands the Shahadah witness it.",
      },
    ],
  },
  {
    id: "ghusl",
    icon: "🚿",
    title: {
      ar: "3. الغسل والتنظف",
      en: "3. Ghusl and Cleanliness",
    },
    description: {
      ar: "يُستحب للمسلم الجديد أن يغتسل بعد الشهادة، لأن النظافة من الإيمان، والبدء بالطهارة يعطي شعورًا بالبداية الجديدة.",
      en: "It is recommended for a new Muslim to perform ghusl after Shahadah, because cleanliness is part of faith, and starting with purity gives a sense of a new beginning.",
    },
    points: [
      {
        ar: "الغسل سنة مؤكدة في حق من أسلم.",
        en: "Ghusl is a confirmed sunnah for one who embraces Islam.",
      },
      {
        ar: "لو لا يوجد ماء أو ضرر، التيمم يكفي عند الحاجة.",
        en: "If water is unavailable or harmful, tayammum suffices when needed.",
      },
      {
        ar: "لا تجعل الطهارة حاجزًا نفسيًا، فالله يريد بك اليسر.",
        en: "Do not make purity a psychological barrier; Allah wants ease for you.",
      },
    ],
  },
  {
    id: "prayer",
    icon: "🕌",
    title: {
      ar: "4. تعلم الصلاة تدريجيًا",
      en: "4. Learn Prayer Gradually",
    },
    description: {
      ar: "الصلاة أول ما يحاسب عليه العبد يوم القيامة. ابدأ بتعلم الوضوء، ثم حركات الصلاة، ثم القراءة، ولا تستعق الكمال من أول يوم.",
      en: "Prayer is the first deed to be accounted for on the Day of Resurrection. Begin by learning wudu, then prayer movements, then recitation, and do not demand perfection from the first day.",
    },
    points: [
      {
        ar: "تعلم الوضوء أولًا.",
        en: "Learn wudu first.",
      },
      {
        ar: "صلِّ الصلوات الخمس حسب استطاعتك.",
        en: "Pray the five prayers according to your ability.",
      },
      {
        ar: "استعن بمقطع عملي أو إمام يشرح لك.",
        en: "Use a practical video or an imam who can explain to you.",
      },
    ],
  },
  {
    id: "learning",
    icon: "📚",
    title: {
      ar: "5. تعلم الأساسيات لا التفاصيل",
      en: "5. Learn Basics, Not Details",
    },
    description: {
      ar: "لا تحمل نفسك فوق طاقتك. ابدأ بالتوحيد، معاني أسماء الله الحسنى، آداب الدعاء، وأخلاق الإسلام، ثم توسع في الفقه عند الحاجة.",
      en: "Do not burden yourself beyond capacity. Begin with tawhid, meanings of Allah’s names, etiquette of du’a, and Islamic manners, then expand into fiqh when needed.",
    },
    points: [
      {
        ar: "سورة الفاتحة أول ما تتعلمه من القرآن.",
        en: "Al-Fatihah is the first surah you should learn.",
      },
      {
        ar: "تعلم أذكار الصباح والمساء مبكرًا.",
        en: "Learn morning and evening adhkar early.",
      },
      {
        ar: "اصحب شخصًا صالحًا يجيب أسئلتك برفق.",
        en: "Keep company with a righteous person who answers your questions gently.",
      },
    ],
  },
  {
    id: "family",
    icon: "🏡",
    title: {
      ar: "6. التعامل مع الأهل والمجتمع",
      en: "6. Dealing with Family and Society",
    },
    description: {
      ar: "قد يواجه المسلم الجديد رفضًا من أهله. الأصل أن يجمع بين ثباته على الحق وحسن خُلقه مع أهله، ولا يقطع رحمًا بسبب الاختلاف.",
      en: "A new Muslim may face rejection from family. The principle is to combine firmness on truth with good conduct toward family, and not to sever ties due to disagreement.",
    },
    points: [
      {
        ar: "كن رحيمًا ولا تتحدى.",
        en: "Be merciful, not confrontational.",
      },
      {
        ar: "ادعُ لأهلك بالهداية.",
        en: "Supplicate for your family’s guidance.",
      },
      {
        ar: "استعن بمجتمع مسلم داعم.",
        en: "Seek support from a helpful Muslim community.",
      },
    ],
  },
];

const FAQS: QA[] = [
  {
    id: "need-arabic",
    question: {
      ar: "هل يجب أن أتكلم العربية؟",
      en: "Must I speak Arabic?",
    },
    answer: [
      {
        ar: "لا، الإسلام ليس عربيًا بالعرق واللغة، بل هو دين الله لكل الناس. يمكنك أن تشهد وتتعبد بلغتك، وتحفظ ما تحتاجه من العربية للصلاة.",
        en: "No, Islam is not ethnic or linguistic Arabness; it is Allah’s religion for all people. You can testify and worship in your language, and memorize what you need of Arabic for prayer.",
      },
    ],
  },
  {
    id: "past-sins",
    question: {
      ar: "ماذا عن ذنوب الماضي؟",
      en: "What about past sins?",
    },
    answer: [
      {
        ar: "الإسلام يهدم ما كان قبله. بالتوبة والإسلام تُغفر الذنوب بإذن الله، فلا تجعل الشيطان يذكّرك بالماضي لييأسك من الرحمة.",
        en: "Islam destroys what came before it. Through repentance and Islam, sins are forgiven by Allah’s permission, so do not let Satan remind you of the past to make you despair of mercy.",
      },
    ],
  },
  {
    id: "name-change",
    question: {
      ar: "هل يجب تغيير اسمي؟",
      en: "Must I change my name?",
    },
    answer: [
      {
        ar: "لا يجب إلا إذا كان الاسم فيه معنى شركي أو قبيح شرعًا. أما الأسماء المحايدة أو الجميلة فلا حرج فيها.",
        en: "It is not required unless the name contains shirk or legally ugly meaning. Neutral or good names are fine.",
      },
    ],
  },
  {
    id: "family-opposes",
    question: {
      ar: "أهلي يرفضون إسلامي، ماذا أفعل؟",
      en: "My family rejects my Islam. What should I do?",
    },
    answer: [
      {
        ar: "اصبر، وكن مثالًا حسنًا، ولا تقطع رحمك. ادعُ لهم، واستعن بمركز إسلامي أو داعية حكيم يساعدك على التعامل برفق وحكمة.",
        en: "Be patient, be a good example, and do not sever family ties. Pray for them and seek help from an Islamic center or wise da‘ee to deal gently and wisely.",
      },
    ],
  },
  {
    id: "feel-unworthy",
    question: {
      ar: "أشعر أنني لست جيدًا كفاية لأكون مسلمًا",
      en: "I feel I am not good enough to be Muslim",
    },
    answer: [
      {
        ar: "الإسلام ليس نادي المثاليين، بل مستشفى التائبين. الله يقبل العبد إذا صدق، وييسر له التعلم والتدرج.",
        en: "Islam is not a club for perfect people, but a hospital for repentant ones. Allah accepts a servant if sincere and makes learning and gradual growth easy for him.",
      },
    ],
  },
];

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
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/embrace-islam`,
      languages: {
        ar: "/ar/embrace-islam",
        en: "/en/embrace-islam",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/embrace-islam`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function EmbraceIslamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ui.title,
    description: ui.description,
    inLanguage: l,
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              🌙 {isRTL ? "بداية جديدة" : "New Beginning"}
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

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}/prayer-guide`} className="btn-primary">
                {ui.startNow}
              </Link>

              <Link href={`/${l}/contact`} className="btn-outline">
                {ui.contact}
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.stepsTitle}</h2>

            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>

            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.stepsDesc}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {STEPS.map((step) => (
              <article
                key={step.id}
                id={step.id}
                className="card relative scroll-mt-32 overflow-hidden p-6 md:p-7"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {step.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? step.title.ar : step.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? step.description.ar : step.description.en}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {step.points.map((point, index) => (
                    <li
                      key={`${step.id}-point-${index}`}
                      className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{isRTL ? point.ar : point.en}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div id="faq" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.faqTitle}</h2>

            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>

            <p className="section-subtitle mx-auto max-w-2xl">{ui.faqDesc}</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((qa) => (
              <details key={qa.id} className="card group p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-xl dark:bg-gold-900/40">
                      ❓
                    </span>

                    <h3
                      className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? qa.question.ar : qa.question.en}
                    </h3>
                  </div>

                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>

                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                  <div className="space-y-3">
                    {qa.answer.map((paragraph, index) => (
                      <p
                        key={`${qa.id}-answer-${index}`}
                        className="leading-relaxed text-slate-600 dark:text-slate-300"
                      >
                        {isRTL ? paragraph.ar : paragraph.en}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="card mb-8 p-6 md:p-8">
          <h2 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
            {ui.resourcesTitle}
          </h2>

          <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.resourcesDesc}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${l}/quran`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📖
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.quran}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/prayer-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🕌
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.prayerGuide}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/dawah-guide`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🤝
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.dawahGuide}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/articles`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ✍️
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.articles}
                </h3>
              </div>
            </Link>
          </div>
        </div>

        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <h2
            className="mb-5 text-xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-3">
            {[ui.note1, ui.note2, ui.note3].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}