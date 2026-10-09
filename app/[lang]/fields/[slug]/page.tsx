// app/[lang]/fields/page.tsx
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

type FieldItem = {
  id: string;
  href: string;
  icon: string;
  title: Localized;
  description: Localized;
  tags: Localized[];
};

type UILang = {
  title: string;
  subtitle: string;
  home: string;
  description: string;
  fieldsTitle: string;
  fieldsDesc: string;
  explore: string;
  noteTitle: string;
  note1: string;
  note2: string;
};

const UI: Record<Lang, UILang> = {
  ar: {
    title: "مجالات المنصة",
    subtitle: "استكشف مجالات المحتوى الدعوي والعلمي",
    home: "الرئيسية",
    description:
      "صفحة تجمع مجالات منصة إسماعيل أحمد نجيب الدعوية: القرآن، الفقه، الدعوة، الأسرة، الشباب، المرأة، الرد على الشبهات، والأدوات العملية.",
    fieldsTitle: "المجالات",
    fieldsDesc:
      "اختر المجال الذي تريد التعمق فيه، وستجد روابط مباشرة للأقسام المناسبة.",
    explore: "استكشف",
    noteTitle: "ملاحظة",
    note1:
      "بعض المجالات قد تكون صفحاتها قيد التطوير، لكن الروابط المباشرة تقودك لأقرب قسم متاح.",
    note2:
      "المحتوى العام للتوعية، ولا يغني عن مراجعة أهل العلم في المسائل الدقيقة.",
  },
  en: {
    title: "Platform Fields",
    subtitle: "Explore dawah and Islamic knowledge fields",
    home: "Home",
    description:
      "A page gathering the fields of the Ismail Ahmed Naguib Dawah Platform: Quran, fiqh, dawah, family, youth, women, responding to doubts, and practical tools.",
    fieldsTitle: "Fields",
    fieldsDesc:
      "Choose the field you want to explore, and you will find direct links to relevant sections.",
    explore: "Explore",
    noteTitle: "Notice",
    note1:
      "Some fields may still be under development, but direct links lead to the closest available section.",
    note2:
      "General content is for awareness and does not replace consulting qualified scholars in precise matters.",
  },
};

const FIELDS: FieldItem[] = [
  {
    id: "quran",
    href: "/quran",
    icon: "📖",
    title: {
      ar: "القرآن الكريم",
      en: "Holy Quran",
    },
    description: {
      ar: "تصفح السور، تعلم التلاوة، وخطة الحفظ والمراجعة.",
      en: "Browse surahs, learn recitation, and follow memorization plans.",
    },
    tags: [
      { ar: "تلاوة", en: "Recitation" },
      { ar: "حفظ", en: "Memorization" },
      { ar: "تدبر", en: "Reflection" },
    ],
  },
  {
    id: "adhkar",
    href: "/adhkar",
    icon: "🤲",
    title: {
      ar: "الأذكار والرقية",
      en: "Adhkar and Ruqyah",
    },
    description: {
      ar: "أذكار الصباح والمساء، النوم، بعد الصلاة، والرقية الشرعية.",
      en: "Morning, evening, sleep, post-prayer adhkar, and prophetic ruqyah.",
    },
    tags: [
      { ar: "ذكر", en: "Dhikr" },
      { ar: "تحصين", en: "Protection" },
      { ar: "دعاء", en: "Supplication" },
    ],
  },
  {
    id: "fiqh",
    href: "/fatwa",
    icon: "⚖️",
    title: {
      ar: "الفقه والفتاوى",
      en: "Fiqh and Fatwas",
    },
    description: {
      ar: "أسئلة فقهية مختصرة في الطهارة، الصلاة، الصيام، الزكاة، والأسرة.",
      en: "Concise fiqh questions on purity, prayer, fasting, zakat, and family.",
    },
    tags: [
      { ar: "عبادات", en: "Worship" },
      { ar: "معاملات", en: "Transactions" },
      { ar: "أسرة", en: "Family" },
    ],
  },
  {
    id: "dawah",
    href: "/dawah-guide",
    icon: "🤝",
    title: {
      ar: "الدعوة والحكمة",
      en: "Dawah and Wisdom",
    },
    description: {
      ar: "أصول الدعوة، مهارات الحوار، التعامل مع الشبهات، وخدمة المسلم الجديد.",
      en: "Dawah principles, dialogue skills, handling doubts, and serving new Muslims.",
    },
    tags: [
      { ar: "حوار", en: "Dialogue" },
      { ar: "شبهات", en: "Doubts" },
      { ar: "مسلم جديد", en: "New Muslim" },
    ],
  },
  {
    id: "aqeedah",
    href: "/atheism-response",
    icon: "🧠",
    title: {
      ar: "العقيدة والردود",
      en: "Creed and Responses",
    },
    description: {
      ar: "التوحيد، الرد على الإلحاد، الشبهات العقدية، وأسس الإيمان.",
      en: "Tawhid, responding to atheism, creedal doubts, and foundations of faith.",
    },
    tags: [
      { ar: "توحيد", en: "Tawhid" },
      { ar: "إلحاد", en: "Atheism" },
      { ar: "شبهات", en: "Doubts" },
    ],
  },
  {
    id: "family",
    href: "/women-fatwas",
    icon: "🏡",
    title: {
      ar: "الأسرة والمرأة",
      en: "Family and Women",
    },
    description: {
      ar: "أحكام وأسئلة تخص المرأة، الزواج، التربية، وحقوق الأسرة.",
      en: "Rulings and questions related to women, marriage, upbringing, and family rights.",
    },
    tags: [
      { ar: "زواج", en: "Marriage" },
      { ar: "تربية", en: "Upbringing" },
      { ar: "حقوق", en: "Rights" },
    ],
  },
  {
    id: "youth",
    href: "/youth-issues",
    icon: "🌱",
    title: {
      ar: "قضايا الشباب",
      en: "Youth Issues",
    },
    description: {
      ar: "الضغوط، الهوية، العلاقات، المعاصي، والتوبة في عمر الشباب.",
      en: "Pressure, identity, relationships, sins, and repentance in youth.",
    },
    tags: [
      { ar: "توبة", en: "Repentance" },
      { ar: "هوية", en: "Identity" },
      { ar: "ضغوط", en: "Pressure" },
    ],
  },
  {
    id: "stories",
    href: "/prophets-stories",
    icon: "📜",
    title: {
      ar: "القصص والسنن",
      en: "Stories and Sunan",
    },
    description: {
      ar: "قصص الأنبياء، السنن الإلهية، والعبر من تاريخ الأمم.",
      en: "Prophets’ stories, divine laws, and lessons from the history of nations.",
    },
    tags: [
      { ar: "أنبياء", en: "Prophets" },
      { ar: "عبر", en: "Lessons" },
      { ar: "تاريخ", en: "History" },
    ],
  },
  {
    id: "tools",
    href: "/prayer-times",
    icon: "🧰",
    title: {
      ar: "الأدوات العملية",
      en: "Practical Tools",
    },
    description: {
      ar: "مواقيت الصلاة، القبلة، المسبحة، الزكاة، الميراث، والتقويم.",
      en: "Prayer times, qibla, tasbih, zakat, inheritance, and calendar.",
    },
    tags: [
      { ar: "صلاة", en: "Prayer" },
      { ar: "زكاة", en: "Zakat" },
      { ar: "قبلة", en: "Qibla" },
    ],
  },
  {
    id: "hajj",
    href: "/hajj-guide",
    icon: "🕋",
    title: {
      ar: "الحج والعمرة",
      en: "Hajj and Umrah",
    },
    description: {
      ar: "خطوات النسك، الأدعية، المحظورات، والأخطاء الشائعة.",
      en: "Rites steps, supplications, prohibitions, and common mistakes.",
    },
    tags: [
      { ar: "مناسك", en: "Rites" },
      { ar: "دعاء", en: "Du'a" },
      { ar: "مكة", en: "Makkah" },
    ],
  },
  {
    id: "articles",
    href: "/articles",
    icon: "✍️",
    title: {
      ar: "المقالات",
      en: "Articles",
    },
    description: {
      ar: "مقالات دعوية وتربوية وشرعية مختصرة.",
      en: "Concise dawah, educational, and Islamic articles.",
    },
    tags: [
      { ar: "كتابة", en: "Writing" },
      { ar: "تربية", en: "Education" },
      { ar: "دعوة", en: "Dawah" },
    ],
  },
  {
    id: "khatm",
    href: "/khatm-dua",
    icon: "🌙",
    title: {
      ar: "ختم الدعاء",
      en: "Khatm Dua",
    },
    description: {
      ar: "برامج جماعية للفقر إلى الله، رفع الحوائج، والتوبة والاستغفار.",
      en: "Collective programs of neediness to Allah, raising needs, repentance, and istighfar.",
    },
    tags: [
      { ar: "دعاء", en: "Supplication" },
      { ar: "توبة", en: "Repentance" },
      { ar: "جماعي", en: "Collective" },
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
      canonical: `/${l}/fields`,
      languages: {
        ar: "/ar/fields",
        en: "/en/fields",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/fields`,
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

export default async function FieldsPage({
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
    "@type": "CollectionPage",
    name: ui.title,
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
              🧩 {isRTL ? "خريطة المحتوى" : "Content Map"}
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

        <div className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="section-title mb-0">{ui.fieldsTitle}</h2>

            <div className="islamic-divider my-0">
              <span className="text-xl text-gold-500">✦</span>
            </div>

            <p className="section-subtitle mx-auto max-w-2xl">
              {ui.fieldsDesc}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((field) => (
              <Link
                key={field.id}
                href={`/${l}${field.href}`}
                className="card card-interactive group relative overflow-hidden p-6"
              >
                <div className="gradient-primary absolute inset-x-0 top-0 h-1" />

                <div className="mb-4 flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/40">
                    {field.icon}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="text-xl font-black leading-relaxed text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300"
                      style={{ fontFamily: "var(--font-amiri)" }}
                    >
                      {isRTL ? field.title.ar : field.title.en}
                    </h3>

                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                      {isRTL ? field.description.ar : field.description.en}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {field.tags.map((tag, index) => (
                    <span
                      key={`${field.id}-tag-${index}`}
                      className="badge-gold text-xs"
                    >
                      {isRTL ? tag.ar : tag.en}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                  {ui.explore}

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
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
            {[ui.note1, ui.note2].map((note, index) => (
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