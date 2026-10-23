// app/[lang]/inheritance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";

import { getSiteSettings } from "@/lib/content";
import { buildPageControls, pageGate, toolFallbackMessage } from "@/lib/page-sections";
import ToolUnavailablePage from "@/components/ToolUnavailablePage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero, Callout, renderDesignIcon } from "@/components/ui";
import type { Fraction } from "@/lib/calculators/fraction";
import {
  calculateInheritance,
  type DeceasedGender,
  type HeirKey,
  type InheritanceWarningCode,
} from "@/lib/calculators/inheritance";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type SearchParams = {
  currency?: string | string[];
  estateAmount?: string | string[];
  deceasedGender?: string | string[];
  hasSpouse?: string | string[];
  hasFather?: string | string[];
  hasMother?: string | string[];
  sons?: string | string[];
  daughters?: string | string[];
  fullBrothers?: string | string[];
  fullSisters?: string | string[];
};

type YesNo = "yes" | "no";

interface CurrencyOption {
  id: string;
  symbolAr: string;
  symbolEn: string;
}

// ============================================================
// الثوابت
// ============================================================

const CURRENCIES: CurrencyOption[] = [
  { id: "EGP", symbolAr: "ج.م", symbolEn: "EGP" },
  { id: "USD", symbolAr: "$", symbolEn: "USD" },
  { id: "SAR", symbolAr: "ر.س", symbolEn: "SAR" },
  { id: "AED", symbolAr: "د.إ", symbolEn: "AED" },
  { id: "KWD", symbolAr: "د.ك", symbolEn: "KWD" },
  { id: "EUR", symbolAr: "€", symbolEn: "EUR" },
  { id: "GBP", symbolAr: "£", symbolEn: "GBP" },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<string,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    formTitle: string;
    formSubtitle: string;
    currency: string;
    estateAmount: string;
    estateAmountHelp: string;
    deceasedGender: string;
    male: string;
    female: string;
    hasSpouse: string;
    hasSpouseHelp: string;
    hasFather: string;
    hasMother: string;
    sons: string;
    sonsHelp: string;
    daughters: string;
    daughtersHelp: string;
    fullBrothers: string;
    fullSisters: string;
    yes: string;
    no: string;
    calculate: string;
    reset: string;
    resultsTitle: string;
    resultsSubtitle: string;
    heir: string;
    count: string;
    share: string;
    percent: string;
    amount: string;
    perPerson: string;
    total: string;
    warningsTitle: string;
    noHeirs: string;
    awl: string;
    radd: string;
    spouseOnly: string;
    sonsDaughtersRule: string;
    brothersSistersRule: string;
    daughtersBlockNote: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    note4: string;
    note5: string;
    contact: string;
    fatwa: string;
    wife: string;
    husband: string;
    father: string;
    mother: string;
    sonsLabel: string;
    daughtersLabel: string;
    fullBrothersLabel: string;
    fullSistersLabel: string;
    optional: string;
    verse: string;
    verseSource: string;
    currenciesCount: string;
    heirsCount: string;
    awlRadd: string;
    instant: string;
    relatedTitle: string;
    zakatPage: string;
    zakatPageDesc: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    hajjPage: string;
    hajjPageDesc: string;
    contactPage: string;
    contactPageDesc: string;
  }
> = {
  ar: {
    title: "حاسبة الميراث",
    subtitle: "قسّم التركة شرعًا حسب الفرائض المبسطة",
    home: "الرئيسية",
    description:
      "حاسبة فرائض مبسطة تدعم الزوج/الزوجة، الأب، الأم، الأبناء، البنات، الإخوة الأشقاء، والأخوات الشقيقات، مع حساب العول والرد ونصيب كل وارث.",
    formTitle: "بيانات الميراث",
    formSubtitle:
      "أدخل الوارثين وقيمة التركة بعد سداد الديون وتنفيذ الوصية المشروعة. هذه الحاسبة للتعليم والتقدير، وليست فتوى.",
    currency: "العملة",
    estateAmount: "قيمة التركة",
    estateAmountHelp:
      "أدخل الصافي بعد الخصم: النفقات، الديون، والوصية في حدود الثلث.",
    deceasedGender: "جنس المتوفى",
    male: "ذكر",
    female: "أنثى",
    hasSpouse: "هل ترك زوجًا أو زوجة؟",
    hasSpouseHelp: "لو المتوفى ذكرًا فالزوجة، ولو أنثى فالزوج.",
    hasFather: "هل ترك أبًا؟",
    hasMother: "هل ترك أمًا؟",
    sons: "عدد الأبناء",
    sonsHelp: "الابن عصبة بنفسه، ويشارك البنت بالترجيح 2:1.",
    daughters: "عدد البنات",
    daughtersHelp: "البنت الواحدة لها النصف، والاثنتان فأكثر لهما الثلثان.",
    fullBrothers: "عدد الإخوة الأشقاء",
    fullSisters: "عدد الأخوات الشقيقات",
    yes: "نعم",
    no: "لا",
    calculate: "احسب الميراث",
    reset: "تصفير",
    resultsTitle: "نتيجة القسمة",
    resultsSubtitle: "النصيب محسوب بالكسور، والمبلغ التقريبي حسب التركة.",
    heir: "الوارث",
    count: "العدد",
    share: "النصيب",
    percent: "النسبة",
    amount: "المبلغ",
    perPerson: "للفرد",
    total: "الإجمالي",
    warningsTitle: "تنبيهات",
    noHeirs: "لم يتم تحديد أي وارث. أدخل وارثًا واحدًا على الأقل.",
    awl:
      "زادت الفروض على الواحد، فتم تطبيق العول proportionally لتوزيع التركة.",
    radd:
      "بقى فضل بعد أصحاب الفروض ولم يوجد عصبة، فتم تطبيق الرد على غير الزوجين إن أمكن.",
    spouseOnly:
      "لم يوجد سوى الزوج/الزوجة، فتم إعطاء الفضل له/لها في هذه الحاسبة المبسطة.",
    sonsDaughtersRule:
      "وجود الابن يجعل البنت عصبة معه، والذكر مثل حظ الأنثيين.",
    brothersSistersRule:
      "الأخ الشقيق يعصب الأخت الشقيقة، والذكر مثل حظ الأنثيين.",
    daughtersBlockNote:
      "البنات لا يحرمن الإخوة الأشقاء من العصوبة في هذه الحاسبة المبسطة، لكن قد تختلف المسائل عند الفقهاء.",
    noteTitle: "ملاحظات فقهية مهمة",
    note1:
      "التركة تُقسم بعد تجهيز الميت، وقضاء ديونه، وتنفيذ وصيته في حدود الثلث لمن لا يرث.",
    note2:
      "هذه الحاسبة مبسطة ولا تشمل الجدات، الإخوة لغير الأم، العصبات البعيدين، أو مسائل التعصيب الخاصة.",
    note3:
      "الزوجان لا يرد عليهما عند جمهور أهل العلم إلا في حالات خاصة، لكن الحاسبة تتعامل مع الحالة البسيطة.",
    note4:
      "العول وارد في القرآن في مسائل مثل: زوج وأبوان وبنتان، أو زوج وأختان شقيقتان.",
    note5:
      "لا تعتمد على هذه النتيجة في قسمة حقيقية إلا بعد مراجعة عالم ثقة أو جهة إفتاء مختصة.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    wife: "الزوجة",
    husband: "الزوج",
    father: "الأب",
    mother: "الأم",
    sonsLabel: "الأبناء",
    daughtersLabel: "البنات",
    fullBrothersLabel: "الإخوة الأشقاء",
    fullSistersLabel: "الأخوات الشقيقات",
    optional: "اختياري",
    verse: "﴿ يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ ﴾",
    verseSource: "سورة النساء — الآية 11",
    currenciesCount: "عملة مدعومة",
    heirsCount: "أنواع الورثة",
    awlRadd: "العول والرد",
    instant: "حساب فوري",
    relatedTitle: "صفحات ذات صلة",
    zakatPage: "حاسبة الزكاة",
    zakatPageDesc: "احسب زكاة أموالك.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية عن المواريث.",
    hajjPage: "دليل الحج والعمرة",
    hajjPageDesc: "مناسك الحج والعمرة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "أرسل استفسارك المباشر.",
  },
  en: {
    title: "Inheritance Calculator",
    subtitle: "Distribute the estate according to simplified faraid rules",
    home: "Home",
    description:
      "A simplified Islamic inheritance calculator supporting spouse, father, mother, sons, daughters, full brothers, and full sisters, with awl, radd, and heir shares.",
    formTitle: "Inheritance Details",
    formSubtitle:
      "Enter heirs and net estate after expenses, debts, and valid bequests. This calculator is educational and not a fatwa.",
    currency: "Currency",
    estateAmount: "Estate value",
    estateAmountHelp:
      "Enter net amount after funeral costs, debts, and bequests within one third.",
    deceasedGender: "Deceased gender",
    male: "Male",
    female: "Female",
    hasSpouse: "Did the deceased leave a spouse?",
    hasSpouseHelp: "If deceased is male, spouse is wife. If female, spouse is husband.",
    hasFather: "Did the deceased leave a father?",
    hasMother: "Did the deceased leave a mother?",
    sons: "Number of sons",
    sonsHelp: "A son is residuary and shares with daughters 2:1.",
    daughters: "Number of daughters",
    daughtersHelp: "One daughter gets 1/2; two or more get 2/3.",
    fullBrothers: "Number of full brothers",
    fullSisters: "Number of full sisters",
    yes: "Yes",
    no: "No",
    calculate: "Calculate Inheritance",
    reset: "Reset",
    resultsTitle: "Distribution Result",
    resultsSubtitle: "Shares are calculated as fractions; amounts are approximate.",
    heir: "Heir",
    count: "Count",
    share: "Share",
    percent: "Percent",
    amount: "Amount",
    perPerson: "Per person",
    total: "Total",
    warningsTitle: "Warnings",
    noHeirs: "No heirs were selected. Add at least one heir.",
    awl:
      "Fixed shares exceeded one, so awl was applied proportionally.",
    radd:
      "A remainder was left after fixed shares and no residuary was available, so radd was applied to non-spouse sharers when possible.",
    spouseOnly:
      "Only spouse was present, so the remainder was given to the spouse in this simplified calculator.",
    sonsDaughtersRule:
      "A son makes daughters residuary with him, male gets twice female share.",
    brothersSistersRule:
      "A full brother makes full sister residuary with him, male gets twice female share.",
    daughtersBlockNote:
      "Daughters do not fully block full brothers from residuary inheritance in this simplified calculator, though detailed fiqh may vary.",
    noteTitle: "Important fiqh notes",
    note1:
      "Estate is distributed after funeral expenses, debts, and valid bequests up to one third.",
    note2:
      "This calculator is simplified and does not cover grandmothers, consanguine/unilateral siblings, distant agnates, or special cases.",
    note3:
      "Spouses generally do not receive radd according to the majority, but this calculator handles simple cases.",
    note4:
      "Awl occurs in Quranic cases such as husband/wife + parents + daughters, or husband + full sisters.",
    note5:
      "Do not rely on this result for actual distribution except after consulting a qualified scholar or official fatwa authority.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    wife: "Wife",
    husband: "Husband",
    father: "Father",
    mother: "Mother",
    sonsLabel: "Sons",
    daughtersLabel: "Daughters",
    fullBrothersLabel: "Full Brothers",
    fullSistersLabel: "Full Sisters",
    optional: "optional",
    verse: "\"Allah instructs you concerning your children: for the male, what is equal to the share of two females.\"",
    verseSource: "Surah An-Nisa — Verse 11",
    currenciesCount: "Supported Currencies",
    heirsCount: "Heir Types",
    awlRadd: "Awl & Radd",
    instant: "Instant",
    relatedTitle: "Related Pages",
    zakatPage: "Zakat Calculator",
    zakatPageDesc: "Calculate your wealth zakat.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Fiqh questions about inheritance.",
    hajjPage: "Hajj & Umrah Guide",
    hajjPageDesc: "Rites of Hajj and Umrah.",
    contactPage: "Contact Us",
    contactPageDesc: "Send your direct inquiry.",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function parseNumber(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseCount(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(200, Math.floor(parsed));
}

function parseYesNo(value?: string | string[]): YesNo {
  return getFirstValue(value).toLowerCase() === "yes" ? "yes" : "no";
}

function parseGender(value?: string | string[]): DeceasedGender {
  return getFirstValue(value).toLowerCase() === "female" ? "female" : "male";
}

function parseCurrency(value?: string | string[]): string {
  const raw = getFirstValue(value).toUpperCase();
  return CURRENCIES.some((currency) => currency.id === raw) ? raw : "EGP";
}

function formatNumber(value: number, lang: Lang): string {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return safe.toFixed(2);
  }
}

function formatPercent(share: Fraction, lang: Lang): string {
  const value = share.toNumber() * 100;
  return `${formatNumber(value, lang)}%`;
}

function formatAmount(value: number, lang: Lang, currencyId: string): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currencyId,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${formatNumber(value, lang)} ${currencyId}`;
  }
}

function heirLabel(
  key: HeirKey,
  gender: DeceasedGender,
  ui: (typeof UI)[Lang]
): string {
  switch (key) {
    case "spouse":
      return gender === "male" ? ui.wife : ui.husband;
    case "father":
      return ui.father;
    case "mother":
      return ui.mother;
    case "sons":
      return ui.sonsLabel;
    case "daughters":
      return ui.daughtersLabel;
    case "fullBrothers":
      return ui.fullBrothersLabel;
    case "fullSisters":
      return ui.fullSistersLabel;
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
  if (!isValidLang(lang)) return {};

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/inheritance`,
      languages: {
        ar: "/ar/inheritance",
        en: "/en/inheritance",
      },
    },
    openGraph: {
      siteName: l === "ar" ? SITE_NAME : SITE_NAME_EN,
      title: ui.title,
      description: ui.description,
      url: `/${l}/inheritance`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: `/og/og-${l}.png`,
          width: 1200,
          height: 630,
          alt: ui.title,
        },
      ],
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

export default async function InheritancePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const __pageSettings = await getSiteSettings();
  const controls = buildPageControls(__pageSettings as Record<string, unknown>);
  const gate = pageGate(controls, "inheritance", l);
  if (!gate.pageVisible) return <ToolUnavailablePage lang={l} message={toolFallbackMessage(controls, "inheritance", l)} />;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const submitted = Object.keys(sp).length > 0;

  const currency = parseCurrency(sp.currency);
  const estateAmount = parseNumber(sp.estateAmount);
  const deceasedGender = parseGender(sp.deceasedGender);
  const hasSpouse = parseYesNo(sp.hasSpouse) === "yes";
  const hasFather = parseYesNo(sp.hasFather) === "yes";
  const hasMother = parseYesNo(sp.hasMother) === "yes";
  const sons = parseCount(sp.sons);
  const daughters = parseCount(sp.daughters);
  const fullBrothers = parseCount(sp.fullBrothers);
  const fullSisters = parseCount(sp.fullSisters);

  const warningText: Record<InheritanceWarningCode, string> = {
    no_heirs: ui.noHeirs,
    awl: ui.awl,
    radd: ui.radd,
    spouse_only: ui.spouseOnly,
    sons_daughters_rule: ui.sonsDaughtersRule,
    brothers_sisters_rule: ui.brothersSistersRule,
    daughters_block_note: ui.daughtersBlockNote,
  };

  const inherited = calculateInheritance({
    deceasedGender,
    hasSpouse,
    hasFather,
    hasMother,
    sons,
    daughters,
    fullBrothers,
    fullSisters,
  });

  const result = {
    ...inherited,
    warnings: inherited.warnings.map((code) => warningText[code]),
  };

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: ui.title,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description: ui.description,
        inLanguage: l,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/inheritance`,
        articleSection: isRTL ? "المعاملات" : "Transactions",
        keywords: isRTL
          ? "الميراث, الفرائض, العول, الرد, التركات"
          : "inheritance, faraid, awl, radd, estate",
      },
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <PageHero
        icon="📜"
         badge={isRTL ? "الفرائض" : "Faraid"}
        title={ui.title}
        subtitle={ui.description}
        crumbs={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        <div className="mb-8">
          <Callout icon="🕌" tone="gold">
            <p
              className="text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
              style={{ fontFamily: "var(--font-quran)" }}
            >
              {ui.verse}
            </p>
            <p className="mt-1 text-xs text-gold-600 dark:text-gold-400">{ui.verseSource}</p>
          </Callout>
        </div>

        {/* ===== إحصائيات سريعة ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="💱" label={ui.currenciesCount} value={CURRENCIES.length} color="primary" />
          <StatCard icon="👥" label={ui.heirsCount} value={7} color="gold" />
          <StatCard icon="⚖️" label={ui.awlRadd} value="✓" color="primary" />
          <StatCard icon="⚡" label={ui.instant} value="✓" color="gold" />
        </div>

        {/* ===== النموذج ===== */}
        <div className="card mb-8 p-6 md:p-8">
          <h2
            className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            {ui.formTitle}
          </h2>

          <p className="mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
            {ui.formSubtitle}
          </p>

          <form
            method="get"
            action={`/${l}/inheritance`}
            className="grid gap-6"
          >
            {/* ===== العملة وقيمة التركة ===== */}
            {gate.visible('k0') && (<>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.currency}
                </label>

                <select
                  id="currency"
                  name="currency"
                  defaultValue={currency}
                  className="input-islamic"
                >
                  {CURRENCIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {isRTL ? item.symbolAr : item.symbolEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="estateAmount"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.estateAmount}{" "}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({ui.optional})
                  </span>
                </label>

                <input
                  id="estateAmount"
                  name="estateAmount"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  defaultValue={getFirstValue(sp.estateAmount)}
                  placeholder="0"
                  className="input-islamic"
                />

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.estateAmountHelp}
                </p>
              </div>
            </div>

            </>)}
            {/* ===== جنس المتوفى والزوج ===== */}
            {gate.visible('k1') && (<>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="deceasedGender"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.deceasedGender}
                </label>

                <select
                  id="deceasedGender"
                  name="deceasedGender"
                  defaultValue={deceasedGender}
                  className="input-islamic"
                >
                  <option value="male">{ui.male}</option>
                  <option value="female">{ui.female}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="hasSpouse"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.hasSpouse}
                </label>

                <select
                  id="hasSpouse"
                  name="hasSpouse"
                  defaultValue={hasSpouse ? "yes" : "no"}
                  className="input-islamic"
                >
                  <option value="no">{ui.no}</option>
                  <option value="yes">{ui.yes}</option>
                </select>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.hasSpouseHelp}
                </p>
              </div>
            </div>

            </>)}
            {/* ===== الأب والأم ===== */}
            {gate.visible('k2') && (<>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="hasFather"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.hasFather}
                </label>

                <select
                  id="hasFather"
                  name="hasFather"
                  defaultValue={hasFather ? "yes" : "no"}
                  className="input-islamic"
                >
                  <option value="no">{ui.no}</option>
                  <option value="yes">{ui.yes}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="hasMother"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.hasMother}
                </label>

                <select
                  id="hasMother"
                  name="hasMother"
                  defaultValue={hasMother ? "yes" : "no"}
                  className="input-islamic"
                >
                  <option value="no">{ui.no}</option>
                  <option value="yes">{ui.yes}</option>
                </select>
              </div>
            </div>

            </>)}
            {/* ===== الأبناء والبنات ===== */}
            {gate.visible('k3') && (<>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-5 dark:border-primary-900/30 dark:bg-primary-950/15">
                <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                  👦 {isRTL ? "الفرع الوارث" : "Descendants"}
                </h3>

                <div className="mb-4">
                  <label
                    htmlFor="sons"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.sons}
                  </label>

                  <input
                    id="sons"
                    name="sons"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    defaultValue={getFirstValue(sp.sons)}
                    placeholder="0"
                    className="input-islamic"
                  />

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.sonsHelp}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="daughters"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.daughters}
                  </label>

                  <input
                    id="daughters"
                    name="daughters"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    defaultValue={getFirstValue(sp.daughters)}
                    placeholder="0"
                    className="input-islamic"
                  />

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.daughtersHelp}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gold-200 bg-gold-50/40 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
                <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                  👥 {isRTL ? "الإخوة الأشقاء" : "Full Siblings"}
                </h3>

                <div className="mb-4">
                  <label
                    htmlFor="fullBrothers"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.fullBrothers}
                  </label>

                  <input
                    id="fullBrothers"
                    name="fullBrothers"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    defaultValue={getFirstValue(sp.fullBrothers)}
                    placeholder="0"
                    className="input-islamic"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fullSisters"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.fullSisters}
                  </label>

                  <input
                    id="fullSisters"
                    name="fullSisters"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    defaultValue={getFirstValue(sp.fullSisters)}
                    placeholder="0"
                    className="input-islamic"
                  />
                </div>
              </div>
            </div>

            </>)}
            {/* ===== أزرار ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-night-700">
              <Link
                href={`/${l}/inheritance`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                {ui.reset}
              </Link>

              <button type="submit" className="btn-primary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <path d="M8 6h8" />
                  <path d="M8 10h2" />
                  <path d="M14 10h2" />
                  <path d="M8 14h2" />
                  <path d="M14 14h2" />
                  <path d="M8 18h8" />
                </svg>
                {ui.calculate}
              </button>
            </div>
          </form>
        </div>

        {/* ===== النتائج ===== */}
        {submitted && (
          <div className="space-y-8">
            {/* ===== تنبيهات ===== */}
            {gate.visible('k4') && (<>
            {result.warnings.length > 0 && (
              <div className="card border-amber-200 bg-amber-50/60 p-6 md:p-8 dark:border-amber-900/30 dark:bg-amber-950/15">
                <h2
                  className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("⚠️", 18)}</span>{ui.warningsTitle}
                </h2>

                <ul className="space-y-3">
                  {result.warnings.map((warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                      className="flex items-start gap-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            </>)}
            {/* ===== جدول القسمة ===== */}
            {gate.visible('k5') && (<>
            {result.rows.length > 0 ? (
              <div className="card relative overflow-hidden p-6 md:p-8">
                <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

                <div className="mb-6">
                  <h2
                    className="mb-2 text-2xl font-black text-slate-900 dark:text-white"
                    style={{ fontFamily: "var(--font-amiri)" }}
                  >
                    {ui.resultsTitle}
                  </h2>

                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.resultsSubtitle}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-start dark:border-night-700">
                        <th className="p-3 text-start font-black text-slate-900 dark:text-white">
                          {ui.heir}
                        </th>
                        <th className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {ui.count}
                        </th>
                        <th className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {ui.share}
                        </th>
                        <th className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {ui.percent}
                        </th>
                        <th className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {ui.perPerson}
                        </th>
                        {estateAmount > 0 && (
                          <th className="p-3 text-center font-black text-slate-900 dark:text-white">
                            {ui.amount}
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {result.rows.map((row) => {
                        const amountValue =
                          estateAmount > 0
                            ? row.share.toNumber() * estateAmount
                            : 0;

                        const perAmountValue =
                          estateAmount > 0 && row.perShare
                            ? row.perShare.toNumber() * estateAmount
                            : 0;

                        return (
                          <tr
                            key={row.key}
                            className="border-b border-slate-100 last:border-b-0 dark:border-night-700"
                          >
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-100">
                              {heirLabel(row.key, deceasedGender, ui)}
                            </td>

                            <td className="p-3 text-center text-slate-600 dark:text-slate-300">
                              {row.count > 1
                                ? formatNumber(row.count, l)
                                : "—"}
                            </td>

                            <td className="p-3 text-center font-black text-primary-700 dark:text-primary-300">
                              {row.share.toString()}
                            </td>

                            <td className="p-3 text-center text-slate-600 dark:text-slate-300">
                              {formatPercent(row.share, l)}
                            </td>

                            <td className="p-3 text-center text-slate-600 dark:text-slate-300">
                              {row.perShare ? row.perShare.toString() : "—"}
                            </td>

                            {estateAmount > 0 && (
                              <td className="p-3 text-center font-bold text-slate-800 dark:text-slate-100">
                                {formatAmount(amountValue, l, currency)}

                                {row.count > 1 && row.perShare && (
                                  <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
                                    {formatAmount(perAmountValue, l, currency)}
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50 dark:border-night-700 dark:bg-night-800/50">
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          {ui.total}
                        </td>

                        <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                          —
                        </td>

                        <td className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {result.totalShare.toString()}
                        </td>

                        <td className="p-3 text-center font-black text-slate-900 dark:text-white">
                          {formatPercent(result.totalShare, l)}
                        </td>

                        <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                          —
                        </td>

                        {estateAmount > 0 && (
                          <td className="p-3 text-center font-black text-slate-900 dark:text-white">
                            {formatAmount(estateAmount, l, currency)}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div aria-hidden="true" className="mb-4 inline-flex">{renderDesignIcon("📭", 48)}</div>

                <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {ui.noHeirs}
                </h2>
              </div>
            )}
            </>)}
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
             <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("🔗", 22)}</span>{ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/zakat`} className="card card-interactive group flex items-center gap-3 p-5">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">{renderDesignIcon("💰", 24)}</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.zakatPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.zakatPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/fatwa`} className="card card-interactive group flex items-center gap-3 p-5">
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

            <Link href={`/${l}/hajj-guide`} className="card card-interactive group flex items-center gap-3 p-5">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">{renderDesignIcon("🕋", 24)}</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.hajjPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.hajjPageDesc}
                </p>
              </div>
            </Link>

            <Link href={`/${l}/contact`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">{renderDesignIcon("mail", 24)}</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.contactPage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.contactPageDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ===== ملاحظات فقهية ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
             <span aria-hidden="true" className="me-1 inline-flex align-middle">{renderDesignIcon("📌", 22)}</span>{ui.noteTitle}
          </h2>

          <ul className="space-y-4">
            {[ui.note1, ui.note2, ui.note3, ui.note4, ui.note5].map(
              (note, index) => (
                <li
                  key={`${note}-${index}`}
                  className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>{note}</span>
                </li>
              )
            )}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${l}/contact`} className="btn-primary">
              {ui.contact}
            </Link>

            <Link href={`/${l}/fatwa`} className="btn-outline">
              {ui.fatwa}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={l} />
    </main>
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
          {renderDesignIcon(icon, 28)}
        </span>
      </div>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
