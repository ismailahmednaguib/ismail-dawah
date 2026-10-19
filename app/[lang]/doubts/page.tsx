// app/[lang]/doubts/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";

import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate } from "@/lib/page-sections";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";
import { getPublicList, type PublicItem } from "@/lib/learn/public";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type DoubtSection = {
  id: string;
  icon: string;
  title: Localized;
  intro: Localized;
  points: Localized[];
};

type DoubtQA = {
  id: string;
  category: Localized;
  question: Localized;
  answer: Localized[];
  tip?: Localized;
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  quickNav: string;
  sectionsTitle: string;
  faqTitle: string;
  faqDesc: string;
  answer: string;
  tip: string;
  category: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  fatwa: string;
  articles: string;
  dawahGuide: string;
  atheismResponse: string;
};

type SearchParams = {
  q?: string | string[];
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string, UILang> = {
  ar: {
    title: "الشبهات",
    subtitle: "شبهات شائعة وإجابات مبسطة بالحكمة والعلم",
    home: "الرئيسية",
    description:
      "صفحة تجمع أشهر الشبهات التي يطرحها بعض الناس حول الإسلام والقرآن والقدَر والمرأة والعلم، مع إجابات مختصرة تقوم على البيان لا السخرية، وعلى الحوار لا التكفير.",
    quickNav: "تنقل سريع",
    sectionsTitle: "قواعد في التعامل مع الشبهات",
    faqTitle: "شبهات وإجابات",
    faqDesc:
      "أسئلة يكثر طرحها، وقد تكون شبهة عند بعض الناس أو حيرة عند باحث عن الحق.",
    answer: "الإجابة",
    tip: "نصيحة",
    category: "التصنيف",
    noteTitle: "تنبيه منهجي",
    note1:
      "ليس كل سؤال كفرًا، وليس كل متردد ملحدًا؛ فقد يكون السؤال بداية بحث، والعلاج يكون بالبيان والحلم.",
    note2:
      "الرد على الشبهة لا يكون دائمًا بتفصيل علمي ثقيل، بل أحيانًا بتقرير أصل بسيط يزيل اللبس.",
    note3:
      "هذه الصفحة للتوعية العامة، ولا تغني عن مراجعة أهل العلم في المسائل العقدية والفقهية الدقيقة.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    articles: "المقالات",
    dawahGuide: "دليل الدعوة",
    atheismResponse: "الرد على الإلحاد",
  },
  en: {
    title: "Doubts",
    subtitle: "Common doubts with concise, wise, and knowledgeable answers",
    home: "Home",
    description:
      "A page gathering common doubts raised about Islam, the Quran, divine decree, women, and science, with concise answers based on clarification rather than mockery, and dialogue rather than condemnation.",
    quickNav: "Quick navigation",
    sectionsTitle: "Principles for Handling Doubts",
    faqTitle: "Doubts and Answers",
    faqDesc:
      "Frequently raised questions that may be a doubt for some or a search for truth for others.",
    answer: "Answer",
    tip: "Tip",
    category: "Category",
    noteTitle: "Methodological notice",
    note1:
      "Not every question is disbelief, and not every hesitant person is an atheist; a question may be the beginning of seeking truth, and the remedy is explanation and patience.",
    note2:
      "Answering a doubt is not always with heavy scholarly detail; sometimes a simple foundational statement removes confusion.",
    note3:
      "This page is for general awareness and does not replace consulting qualified scholars in precise creedal or jurisprudential matters.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    articles: "Articles",
    dawahGuide: "Dawah Guide",
    atheismResponse: "Responding to Atheism",
  },
};

// ============================================================
// قواعد في التعامل مع الشبهات
// ============================================================

const SECTIONS: DoubtSection[] = [
  {
    id: "calm",
    icon: "🤝",
    title: {
      ar: "الهدوء قبل الرد",
      en: "Calm Before Responding",
    },
    intro: {
      ar: "أول خطوة في مواجهة الشبهة ألا يغضب المجيب أو يسخر، لأن الغضب قد يحوّل السؤال إلى عداوة.",
      en: "The first step in facing a doubt is not to become angry or mocking, because anger may turn a question into hostility.",
    },
    points: [
      {
        ar: "اسأل السائل: ما الذي فهمته؟ وما الدليل الذي اعتمد عليه؟",
        en: "Ask the questioner: what did you understand? What evidence did you rely on?",
      },
      {
        ar: "افصل بين الشخص والشبهة، فلا تهاجم السائل لأن السؤال قد يكون بريئًا.",
        en: "Separate the person from the doubt; do not attack the questioner because the question may be innocent.",
      },
      {
        ar: "ابدأ بالمتفق عليه قبل الخوض في المختلف فيه.",
        en: "Begin with agreed-upon fundamentals before entering disputed details.",
      },
    ],
  },
  {
    id: "knowledge",
    icon: "📚",
    title: {
      ar: "العلم قبل الكلام",
      en: "Knowledge Before Speech",
    },
    intro: {
      ar: "الرد على الشبهة يحتاج علمًا بالمسألة ودليلها وموضع الخلاف، لا مجرد حماس أو شعارات.",
      en: "Answering a doubt requires knowledge of the issue, its evidence, and the scope of disagreement, not merely enthusiasm or slogans.",
    },
    points: [
      {
        ar: "لا ترد في مسألة إلا بعد مراجعتها في مصدر معتبر.",
        en: "Do not answer an issue except after checking it in a reliable source.",
      },
      {
        ar: "إذا لم تعلم الجواب، قل: سأتحقق وأرد عليك، أو أحيلك إلى أهل العلم.",
        en: "If you do not know the answer, say: I will verify and reply, or refer you to qualified scholars.",
      },
      {
        ar: "احذر النقل عن ضعيف العلم أو المتعالم في الدين.",
        en: "Beware of transmitting from weak knowledge or religious pretension.",
      },
    ],
  },
  {
    id: "context",
    icon: "🫂",
    title: {
      ar: "مراعاة حال السائل",
      en: "Considering the Questioner's State",
    },
    intro: {
      ar: "الناس يختلفون: باحث عن الحق، وغاضب من واقع مسلم، ومتأثر بشبهة إعلامية، ومبتلى بوسوسة.",
      en: "People differ: a truth-seeker, someone angry due to the behavior of Muslims, someone influenced by media doubts, or someone afflicted with whisperings.",
    },
    points: [
      {
        ar: "عالج أصل السؤال لا مجرد لفظه.",
        en: "Address the root of the question, not merely its wording.",
      },
      {
        ar: "قد يكون الجواب الأنسب قصة أو مثالًا لا تفصيلًا نظريًا.",
        en: "The most suitable answer may be a story or example, not theoretical detail.",
      },
      {
        ar: "لا تحمل السائل ما لا يطيق، وابدأ باليسير.",
        en: "Do not burden the questioner beyond capacity; begin with what is easy.",
      },
    ],
  },
  {
    id: "evidence",
    icon: "⚖️",
    title: {
      ar: "الدليل قبل الدعوى",
      en: "Evidence Before Claim",
    },
    intro: {
      ar: "الرد الصحيح لا يعتمد على العاطفة فقط، بل على نص شرعي صحيح، أو عقل سليم، أو واقع مشاهد.",
      en: "A sound answer does not rely only on emotion, but on authentic revelation, sound reason, or observed reality.",
    },
    points: [
      {
        ar: "اذكر الدليل وبيّن وجه الدلالة.",
        en: "Mention the evidence and clarify how it indicates the answer.",
      },
      {
        ar: "لا تستخدم حديثًا ضعيفًا أو موضوعًا في العقائد والعبادات.",
        en: "Do not use weak or fabricated hadith in creed or worship.",
      },
      {
        ar: "فرّق بين القطعي والظني في المسائل الخلافية.",
        en: "Distinguish between definitive and speculative issues in disagreements.",
      },
    ],
  },
  {
    id: "followup",
    icon: "✦",
    title: {
      ar: "المتابعة لا الخصومة",
      en: "Follow-up, Not Conflict",
    },
    intro: {
      ar: "كثير من الشبهات لا تُحسم في جلسة واحدة، بل تحتاج متابعة لطيفة وصبرًا على التغيير.",
      en: "Many doubts are not resolved in one session; they require gentle follow-up and patience with change.",
    },
    points: [
      {
        ar: "اترك بابًا مفتوحًا للحوار بعد الجواب.",
        en: "Leave the door open for dialogue after answering.",
      },
      {
        ar: "اقترح مصدرًا بسيطًا يقرأه السائل بعد النقاش.",
        en: "Suggest a simple resource for the questioner to read after discussion.",
      },
      {
        ar: "ادعُ للسائل بالهداية، فإن القلوب بيد الله.",
        en: "Supplicate for the questioner's guidance, for hearts are in Allah's hand.",
      },
    ],
  },
  {
    id: "moderation",
    icon: "🧭",
    title: {
      ar: "الاعتدال بين التفريط والغلو",
      en: "Balance Between Negligence and Extremism",
    },
    intro: {
      ar: "بعض من يرد على الشبهات يقع في التشدد أو التكفير، وبعضهم يقع في التساهل أو تبرير الباطل.",
      en: "Some who respond to doubts fall into harshness or takfir, while others fall into laxity or justifying falsehood.",
    },
    points: [
      {
        ar: "لا تحكم على شخص بالكفر لمجرد سؤال أو شبهة.",
        en: "Do not declare a person disbeliever merely due to a question or doubt.",
      },
      {
        ar: "لا تمرر باطلًا بحجة الحوار أو حرية الرأي.",
        en: "Do not pass falsehood under the pretext of dialogue or freedom of opinion.",
      },
      {
        ar: "الاعتصام بالكتاب والسنة مع فقه الواقع هو الطريق.",
        en: "Holding to the Quran and Sunnah with understanding of reality is the way.",
      },
    ],
  },
];

// ============================================================
// شبهات وإجابات — تُقرأ من CMS (نوع المحتوى: faq)
// ============================================================

/** أول قيمة من قيمة searchParam قد تكون مصفوفة. */
function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** المحتوى يصل مُترجمًا حسب اللغة المطلوبة، فنعرضه في الحقلين معًا. */
function toLocalized(value: string): Localized {
  return { ar: value, en: value };
}

/** تصنيف افتراضي عند عدم وجود تصنيفات للعنصر. */
const DEFAULT_DOUBT_CATEGORY: Localized = {
  ar: "عام",
  en: "General",
};

/** تقسيم نص الإجابة القادم من CMS إلى فقرات. */
function splitAnswer(body: string): string[] {
  return body
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** تحويل عنصر CMS إلى شكل العرض المستخدم في الصفحة. */
function toDoubt(item: PublicItem): DoubtQA {
  const question = (item.title ?? "").trim();
  const answer = splitAnswer((item.body ?? "").trim());

  if (answer.length === 0 && (item.summary ?? "").trim()) {
    answer.push((item.summary ?? "").trim());
  }

  const term = item.terms?.[0];

  return {
    id: item.id,
    category: term?.name ? toLocalized(term.name) : DEFAULT_DOUBT_CATEGORY,
    question: toLocalized(question),
    answer: answer.map(toLocalized),
  };
}

/** جلب الشبهات والإجابات من CMS مع دعم البحث. */
async function getDoubts(lang: Lang, search?: string): Promise<DoubtQA[]> {
  try {
    const items = await getPublicList(lang, "faq", {
      limit: 60,
      search,
    });

    return items.map(toDoubt).filter((doubt) => doubt.question.ar);
  } catch (error) {
    console.error("[DoubtsPage] CMS error:", error);
    return [];
  }
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

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/doubts`,
      languages: {
        ar: "/ar/doubts",
        en: "/en/doubts",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/doubts`,
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

// ============================================================
// الصفحة
// ============================================================

export default async function DoubtsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const gate = pageGate(buildPageControls(__pageSettings as Record<string, unknown>), "doubts", l);
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const search = getFirstValue(sp.q).trim();

  const doubts = await getDoubts(l, search || undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: l,
    name: ui.title,
    description: ui.description,
    mainEntity: doubts.map((doubt) => ({
      "@type": "Question",
      name: isRTL ? doubt.question.ar : doubt.question.en,
      acceptedAnswer: {
        "@type": "Answer",
        // ✓ الإصلاح: doubt.answer مصفوفة، نستخدم map لدمج الفقرات
        text: doubt.answer.map((p) => (isRTL ? p.ar : p.en)).join(" "),
      },
    })),
  };

  return (
    <>
      <Header lang={l} />

      <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {gate.visible('k0') && (
        <PageHero
          icon="🧠"
          badge={isRTL ? "🧠 شبهات وردود" : "🧠 Doubts and Responses"}
          title={ui.title}
          subtitle={ui.description}
          crumbs={[
            { label: isRTL ? "الرئيسية" : "Home", href: `/${l}` },
            { label: ui.title },
          ]}
        />
      )}

      <section className="container-page py-10 md:py-14">
        {/* ===== تنقل سريع ===== */}
        {gate.visible('k1') && (<>
        <div className="card mb-8 p-6 md:p-7">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.quickNav}
          </h2>

          <div className="flex flex-wrap gap-3">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
              >
                <span>{section.icon}</span>
                <span>{isRTL ? section.title.ar : section.title.en}</span>
              </a>
            ))}

            <a
              href="#faq"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-200 dark:hover:border-gold-600 dark:hover:bg-night-700 dark:hover:text-gold-300"
            >
              ❓ {ui.faqTitle}
            </a>
          </div>
        </div>

        </>)}
        {/* ===== قواعد في التعامل مع الشبهات ===== */}
        {gate.visible('k2') && (<>
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">
              {ui.sectionsTitle}
            </h2>

            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {SECTIONS.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="card relative scroll-mt-32 overflow-hidden p-6 md:p-7"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {section.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? section.title.ar : section.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? section.intro.ar : section.intro.en}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {section.points.map((point, index) => (
                    <li
                      key={`${section.id}-point-${index}`}
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

        </>)}
        {/* ===== شبهات وإجابات ===== */}
        {gate.visible('k3') && (<>
        <div id="faq" className="mb-12 scroll-mt-32">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">
              {ui.faqTitle}
            </h2>

            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>

            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.faqDesc}
            </p>
          </div>

          <div className="space-y-4">
            {doubts.map((doubt) => (
              <details
                key={doubt.id}
                className="card group p-6 md:p-7"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-xl dark:bg-gold-900/40">
                      ❓
                    </span>

                    <div className="min-w-0">
                      <span className="badge-primary mb-2">
                        {ui.category}:{" "}
                        {isRTL ? doubt.category.ar : doubt.category.en}
                      </span>

                      <h3
                        className="text-lg font-black leading-relaxed text-slate-900 md:text-xl dark:text-white"
                        style={{ fontFamily: "var(--font-amiri)" }}
                      >
                        {isRTL ? doubt.question.ar : doubt.question.en}
                      </h3>
                    </div>
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
                  <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">
                    {ui.answer}
                  </p>

                  <div className="space-y-3">
                    {doubt.answer.map((paragraph, index) => (
                      <p
                        key={`${doubt.id}-answer-${index}`}
                        className="leading-relaxed text-slate-600 dark:text-slate-300"
                      >
                        {isRTL ? paragraph.ar : paragraph.en}
                      </p>
                    ))}
                  </div>

                  {doubt.tip && (
                    <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50/60 p-4 dark:border-gold-900/30 dark:bg-gold-950/15">
                      <p className="mb-1 text-xs font-black text-gold-700 dark:text-gold-300">
                        {ui.tip}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {isRTL ? doubt.tip.ar : doubt.tip.en}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        </>)}
        {/* ===== تنبيه منهجي ===== */}
        {gate.visible('k4') && (<>
        <div className="card border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              📌
            </span>

            <div>
              <h2
                className="mb-3 text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.noteTitle}
              </h2>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note1}</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note2}</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note3}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        </>)}
        {/* ===== روابط مفيدة ===== */}
        {gate.visible('k5') && (<>
        <div className="card mt-8 p-6 md:p-8">
          <h2 className="mb-5 text-xl font-black text-slate-900 dark:text-white">
            {isRTL ? "روابط مفيدة" : "Useful links"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${l}/contact`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                📬
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contact}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/fatwa`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                ⚖️
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.fatwa}
                </h3>
              </div>
            </Link>

            <Link
              href={`/${l}/atheism-response`}
              className="card card-interactive group flex items-center gap-3 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">
                🧠
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.atheismResponse}
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
        </>)}
      </section>
      </main>

      <Footer lang={l} />
    </>
  );
}
