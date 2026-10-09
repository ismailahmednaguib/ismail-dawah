// app/[lang]/atheism-response/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

export const dynamic = "force-static";

// ============================================================
// الأنواع
// ============================================================

type Localized = {
  ar: string;
  en: string;
};

type Section = {
  id: string;
  icon: string;
  title: Localized;
  paragraphs: Localized[];
  bullets?: Localized[];
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
  quickNav: string;
  sectionsTitle: string;
  faqTitle: string;
  faqDesc: string;
  answer: string;
  noteTitle: string;
  note1: string;
  note2: string;
  note3: string;
  contact: string;
  fatwa: string;
  articles: string;
  dawahGuide: string;
};

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<Lang, UILang> = {
  ar: {
    title: "الرد على الإلحاد",
    subtitle: "شبهات وإجابات عقلية وشرعية مبسطة",
    home: "الرئيسية",
    description:
      "صفحة مختصة بالرد على بعض الشبهات الإلحادية بأسلوب هادئ، يعتمد على العقل والنقل، ويساعد الباحث عن الحق على فهم أساس الإيمان بالله.",
    quickNav: "تنقل سريع",
    sectionsTitle: "أسس الرد",
    faqTitle: "أسئلة وشبهات",
    faqDesc:
      "أشهر الشبهات التي يطرحها بعض الملاحدة، مع إجابات مختصرة ومبسطة.",
    answer: "الإجابة",
    noteTitle: "تنبيه منهجي",
    note1:
      "الرد على الإلحاد لا يكون بالسخرية أو التخوين، بل بالحكمة والموعظة الحسنة والبرهان.",
    note2:
      "ليس كل سؤال يدل على إلحاد؛ فقد يكون شكًا عابرًا أو بحثًا عن الحقيقة، والعلاج يكون بالحوار لا بالتكفير.",
    note3:
      "هذه الصفحة للتوعية العامة، ولا تغني عن الرجوع إلى أهل العلم في المسائل العقدية الدقيقة.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    articles: "المقالات",
    dawahGuide: "دليل الدعوة",
  },
  en: {
    title: "Responding to Atheism",
    subtitle: "Doubts answered with reason and revelation",
    home: "Home",
    description:
      "A page addressing common atheist doubts in a calm manner, relying on reason and revelation, helping truth-seekers understand the basis of belief in Allah.",
    quickNav: "Quick navigation",
    sectionsTitle: "Foundations of Response",
    faqTitle: "Questions and Doubts",
    faqDesc:
      "Common doubts raised by atheists, with concise and simplified answers.",
    answer: "Answer",
    noteTitle: "Methodological note",
    note1:
      "Responding to atheism should not be done mockery or accusation, but with wisdom, good advice, and evidence.",
    note2:
      "Not every question indicates atheism; it may be passing doubt or a search for truth. The remedy is dialogue, not takfir.",
    note3:
      "This page is for general awareness and does not replace consulting qualified scholars in precise creedal matters.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    articles: "Articles",
    dawahGuide: "Dawah Guide",
  },
};

// ============================================================
// أقسام الرد
// ============================================================

const SECTIONS: Section[] = [
  {
    id: "fitrah",
    icon: "🌱",
    title: {
      ar: "الفطرة تعرف خالقها",
      en: "Fitrah Recognizes its Creator",
    },
    paragraphs: [
      {
        ar: "الله فطر الناس على معرفة وجوده وربوبيته، ولذلك يجد الإنسان في نفسه ميلًا طبيعيًا إلى التعظيم والدعاء عند الضيق، حتى مع إنكار اللسان.",
        en: "Allah created people with an innate recognition of His existence and lordship. Therefore, a person naturally feels inclinations toward reverence and supplication in distress, even if the tongue denies it.",
      },
      {
        ar: "الفطرة لا تعني أن كل إنسان يعرف الله بالتفصيل، لكنها ميل داخلي إلى الإقرار بمصدر أعلى للوجود، يحتاج إلى تهذيب بالوحي والعقل.",
        en: "Fitrah does not mean every person knows Allah in detail, but it is an inner inclination to acknowledge a higher source of existence, needing refinement through revelation and reason.",
      },
    ],
    bullets: [
      {
        ar: "الدعاء عند الاضطرار دليل داخلي على الإيمان بوجود خالق.",
        en: "Supplication in necessity is an inner sign of belief in a Creator.",
      },
      {
        ar: "إنكار الفطرة لا يلغيها، بل قد يكون هروبًا من المسؤولية.",
        en: "Denying fitrah does not erase it; it may be escape from responsibility.",
      },
    ],
  },
  {
    id: "cosmos",
    icon: "🌌",
    title: {
      ar: "الكون يدل على خالقه",
      en: "The Universe Points to its Creator",
    },
    paragraphs: [
      {
        ar: "هذا الكون منظم دقيق، له قوانين وثوابت، ولا يُعقل أن ينشأ نظام محكم من عدم محض بلا مدبر. فالهندسة الدقيقة في الذرة والمجرى تدل على علم وإرادة.",
        en: "This universe is precisely ordered, with laws and constants. It is unreasonable that a tight system arises from pure nothingness without an administrator. The fine geometry in atoms and galaxies indicates knowledge and will.",
      },
      {
        ar: "حتى من يرفض فكرة الخالق يواجه سؤالًا صعبًا: من أين جاء الوجود؟ ولماذا يوجد شيء بدل لا شيء؟",
        en: "Even one who rejects the idea of a Creator faces a difficult question: Where did existence come from? Why is there something rather than nothing?",
      },
    ],
    bullets: [
      {
        ar: "النظام يدل على منظّم، والقانون يدل على واضع.",
        en: "Order indicates an Orderer, and law indicates a Lawgiver.",
      },
      {
        ar: "الصدفة العمياء لا تفسر المعلومات الوراثية المعقدة.",
        en: "Blind chance does not explain complex genetic information.",
      },
    ],
  },
  {
    id: "revelation",
    icon: "📖",
    title: {
      ar: "الوحي يكمل العقل",
      en: "Revelation Completes Reason",
    },
    paragraphs: [
      {
        ar: "العقل وحده لا يكفي لمعرفة كل تفاصيل الإيمان، لأنه محدود. لذلك أرسل الله الرسل وأنزل الكتب ليوضح العبادة، والأخلاق، والمصير، وعلاقة الإنسان بربه.",
        en: "Reason alone is not sufficient to know all details of faith because it is limited. Therefore Allah sent messengers and revealed books to clarify worship, ethics, destiny, and the human relationship with his Lord.",
      },
      {
        ar: "القرآن الكريم أعجز العرب ببلاغته وتحديه، واحتفظ بحفظه عبر القرون، وهو دليل حي على مصدره الإلهي.",
        en: "The Noble Quran challenged the Arabs with its eloquence and inimitability, and has been preserved across centuries, serving as a living proof of its divine source.",
      },
    ],
    bullets: [
      {
        ar: "العقل يقر بوجود خالق، والوحي يوضح من هو وكيف نعبده.",
        en: "Reason affirms a Creator; revelation clarifies who He is and how to worship Him.",
      },
      {
        ar: "لا تعارض صحيح بين العقل السليم والنقل الصحيح.",
        en: "There is no true conflict between sound reason and authentic revelation.",
      },
    ],
  },
  {
    id: "morality",
    icon: "⚖️",
    title: {
      ar: "الأخلاق تحتاج أساسًا ثابتًا",
      en: "Morality Needs a Firm Foundation",
    },
    paragraphs: [
      {
        ar: "إذا لم يوجد إله، فمن أين تأتي قيمة العدل والرحمة والكرامة الإنسانية؟ هل تصبح الأخلاق مجرد اتفاق بشري قابل للتغيير حسب القوة والمصلحة؟",
        en: "If there is no God, where does the value of justice, mercy, and human dignity come from? Does morality become merely a human agreement subject to change according to power and interest?",
      },
      {
        ar: "الإيمان بالله يجعل الأخلاق مسؤولية أمام خالق يعلم السر وأخفى، لا مجرد عرف اجتماعي.",
        en: "Belief in Allah makes morality a responsibility before a Creator who knows secrets and what is hidden, not merely a social custom.",
      },
    ],
    bullets: [
      {
        ar: "الضمير الإنساني شاهد داخلي على وجود معيار أعلى.",
        en: "The human conscience is an inner witness to a higher standard.",
      },
      {
        ar: "بدون إله، تفقد الأخلاق إلزاميتها المطلقة.",
        en: "Without God, morality loses its absolute obligation.",
      },
    ],
  },
  {
    id: "science",
    icon: "🔬",
    title: {
      ar: "العلم لا ينافي الإيمان",
      en: "Science Does Not Contradict Faith",
    },
    paragraphs: [
      {
        ar: "العلم يدرس كيف يعمل الكون، أما الدين فيجيب عن لماذا يوجد الكون ومن خلقه. لذلك لا يصح أن نجعل العلم بديلًا عن الميتافيزيقا وهو لا يبحث فيها أصلًا.",
        en: "Science studies how the universe works, while religion answers why the universe exists and who created it. Therefore it is invalid to make science a substitute for metaphysics when it does not investigate it in the first place.",
      },
      {
        ar: "كثير من العلماء آمنوا بالله لأنهم رأوا في دقة الخلق آية، لا حجة على إنكار الخالق.",
        en: "Many scientists believed in Allah because they saw in the precision of creation a sign, not an argument to deny the Creator.",
      },
    ],
    bullets: [
      {
        ar: "الاكتشاف العلمي يزيده المؤمن يقينًا، ويترك الملحد أمام سؤال الأصل.",
        en: "Scientific discovery increases the believer's certainty and leaves the atheist before the question of origin.",
      },
      {
        ar: "العلم يصف الظواهر، ولا يثبت عدم وجود خالق.",
        en: "Science describes phenomena and does not prove the non-existence of a Creator.",
      },
    ],
  },
  {
    id: "problem-evil",
    icon: "️",
    title: {
      ar: "شبهة الشر والألم",
      en: "The Problem of Evil and Pain",
    },
    paragraphs: [
      {
        ar: "وجود الألم لا ينفي وجود الله، لأن الحياة ابتلاء، والإنسان ليس مخيرًا في كل شيء، لكنه محاسب على اختياره. والله حكيم قد يخفى علينا وجه الحكم في الشيء.",
        en: "The existence of pain does not negate Allah's existence, because life is a test. Man is not omnipotent, but he is accountable for his choice. Allah is Wise, and the wisdom behind something may be hidden from us.",
      },
      {
        ar: "بل إن إنكار الملحد للظلم نفسه يدل على وجود معيار مطلق للعدل، وهذا المعيار لا يجد له تفسيرًا كافيًا في مادة عمياء.",
        en: "Indeed, the atheist's denial of injustice itself indicates an absolute standard of justice, a standard for which he finds no sufficient explanation in blind matter.",
      },
    ],
    bullets: [
      {
        ar: "الشر ليس عدميًا محضًا، بل قد يكون نتيجة اختيار مخلوق أو حكمة خالق.",
        en: "Evil is not pure non-existence; it may result from creaturely choice or Creator's wisdom.",
      },
      {
        ar: "غضب الإنسان من الظلم شاهد على فطرة تعرف العدل.",
        en: "Human anger at injustice witnesses to a fitrah that knows justice.",
      },
    ],
  },
];

// ============================================================
// الأسئلة والشبهات
// ============================================================

const FAQS: QA[] = [
  {
    id: "who-created-god",
    question: {
      ar: "من خلق الله؟",
      en: "Who created God?",
    },
    answer: [
      {
        ar: "السؤال نفسه فيه مغالطة، لأنه يفترض أن كل شيء يحتاج خالق، ثم يسأل عن خالق الخالق. الصحيح أن الله أزلي أبدي، لم يسبقه عدم، ولا يحتاج إلى سبب، لأنه واجب الوجود.",
        en: "The question itself contains a fallacy, because it assumes everything needs a creator, then asks about the Creator's creator. The correct answer is that Allah is eternal, without prior non-existence, and needs no cause because He is the Necessary Being.",
      },
      {
        ar: "كل ما في الكون حادث مفتقر، أما خالق الكون فليس جزءًا من الكون ولا يخضع لقوانينه.",
        en: "Everything in the universe is contingent and needy, but the Creator of the universe is not part of the universe and is not subject to its laws.",
      },
    ],
  },
  {
    id: "god-invisible",
    question: {
      ar: "لماذا لا نرى الله؟",
      en: "Why do we not see God?",
    },
    answer: [
      {
        ar: "عدم الرؤية لا يعني عدم الوجود. أنت ترى أثر الخالق في نفسك وفي الكون، كما ترى الريح ولا ترى ذاتها، وترى الدماغ ولا ترى العقل المجرد.",
        en: "Not seeing does not mean non-existence. You see the effect of the Creator in yourself and the universe, just as you see wind without seeing its essence, and observe the brain without seeing abstract intellect.",
      },
      {
        ar: "الله ليس جسمًا محدودًا تدركه العيون، بل هو خالق الحواس والكون، ويدرك بالآيات والفطرة والعقل.",
        en: "Allah is not a limited body perceived by eyes; He is the Creator of senses and the universe, known through signs, fitrah, and reason.",
      },
    ],
  },
  {
    id: "science-explains",
    question: {
      ar: "العلم يفسر كل شيء، فلماذا نحتاج إلى الله؟",
      en: "Science explains everything, so why do we need God?",
    },
    answer: [
      {
        ar: "العلم يفسر الآليات، لا الأسباب الأولى. يعرف كيف تكوّن الكون بعد لحظة البداية، لكنه لا يجيب عن سبب وجود القوانين نفسها، ولا عن لماذا يوجد شيء بدل لا شيء.",
        en: "Science explains mechanisms, not first causes. It may describe how the universe formed after the initial moment, but it does not answer why the laws themselves exist, nor why there is something rather than nothing.",
      },
      {
        ar: "الاكتشاف العلمي يزيد المؤمن بصيرة، لأنه يرى دقة الصنع، أما الملحد فيقف عاجزًا أمام سؤال المصدر.",
        en: "Scientific discovery increases the believer's insight because he sees precision in making, while the atheist stands helpless before the question of source.",
      },
    ],
  },
  {
    id: "evil-exists",
    question: {
      ar: "إذا كان الله رحيمًا، فلماذا يوجد شر وألم؟",
      en: "If God is merciful, why is there evil and pain?",
    },
    answer: [
      {
        ar: "الحياة الدنيا دار ابتلاء، لا دار جزاء كامل. فيه الخير والشر، والاختيار والنتيجة. والله عادل حكيم، وقد يبتلي ليظهر الصبر، أو ليكفر السيئات، أو ليرفع الدرجات.",
        en: "This worldly life is a place of test, not complete recompense. It contains good and evil, choice and consequence. Allah is Just and Wise; He may test to reveal patience, expiate sins, or raise ranks.",
      },
      {
        ar: "حتى اعتراضك على الظلم يدل على أنك تعرف عدلًا مطلقًا، وهذا يعرفك بوجود خالق عادل.",
        en: "Even your objection to injustice shows that you recognize absolute justice, which points you to a Just Creator.",
      },
    ],
  },
  {
    id: "religion-caused-war",
    question: {
      ar: "الدين سبب الحروب، فلماذا نتبعه؟",
      en: "Religion causes wars, so why follow it?",
    },
    answer: [
      {
        ar: "الحروب تحدث باسم العلم والقومية والشيوعية والرأسمالية أيضًا. المشكلة ليست في الدين ذاته، بل في سوء الفهم أو استغلال الناس.",
        en: "Wars also occur in the name of science, nationalism, communism, and capitalism. The problem is not religion itself, but misunderstanding or exploitation by people.",
      },
      {
        ar: "الإسلام الحقيقي أمر بالعدل والرحمة وحفظ الدماء، والاعتداء باسمه انحراف عنه لا حجة عليه.",
        en: "True Islam commands justice, mercy, and preservation of blood. Aggression in its name is a deviation from it, not an argument against it.",
      },
    ],
  },
  {
    id: "faith-blind",
    question: {
      ar: "هل الإيمان مجرد تصديق أعمى؟",
      en: "Is faith merely blind belief?",
    },
    answer: [
      {
        ar: "الإيمان في الإسلام ليس تصديقًا بلا دليل، بل يقوم على الفطرة والعقل والآيات والنقل الصحيح. لذلك يُذم التقليد الأعمى، ويُمدح النظر والتفكر.",
        en: "Faith in Islam is not belief without evidence; it rests on fitrah, reason, signs, and authentic transmission. Therefore blind imitation is blameworthy, while contemplation and reflection are praised.",
      },
      {
        ar: "قال تعالى: ﴿سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ﴾، فالكون والإنسان كتاب مفتوح لمن أراد الهداية.",
        en: "Allah said: 'We will show them Our signs in the horizons and within themselves.' The universe and man are an open book for whoever seeks guidance.",
      },
    ],
  },
];

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
      canonical: `/${l}/atheism-response`,
      languages: {
        ar: "/ar/atheism-response",
        en: "/en/atheism-response",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/atheism-response`,
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

export default async function AtheismResponsePage({
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
        {/* ===== ترويسة ===== */}
        <div className="card relative mb-8 overflow-hidden p-8 md:p-10">
          <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-primary mb-5">
              🧠 {isRTL ? "شبهات وردود" : "Doubts and Responses"}
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
          </div>
        </div>

        {/* ===== تنقل سريع ===== */}
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

        {/* ===== أسس الرد ===== */}
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

                  <h3
                    className="text-xl font-black leading-relaxed text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {isRTL ? section.title.ar : section.title.en}
                  </h3>
                </div>

                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={`${section.id}-paragraph-${index}`}
                      className="leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      {isRTL ? paragraph.ar : paragraph.en}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
                    <ul className="space-y-3">
                      {section.bullets.map((bullet, index) => (
                        <li
                          key={`${section.id}-bullet-${index}`}
                          className="flex items-start gap-3 leading-relaxed text-slate-700 dark:text-slate-200"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                          <span>{isRTL ? bullet.ar : bullet.en}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ===== الأسئلة والشبهات ===== */}
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
            {FAQS.map((qa) => (
              <details
                key={qa.id}
                className="card group p-6 md:p-7"
              >
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
                  <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">
                    {ui.answer}
                  </p>

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

        {/* ===== تنبيه منهجي ===== */}
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

        {/* ===== روابط مفيدة ===== */}
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
          </div>
        </div>
      </section>
    </main>
  );
}