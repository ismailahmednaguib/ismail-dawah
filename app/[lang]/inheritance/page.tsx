// app/[lang]/inheritance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

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

type DeceasedGender = "male" | "female";
type YesNo = "yes" | "no";

type HeirKey =
  | "spouse"
  | "father"
  | "mother"
  | "sons"
  | "daughters"
  | "fullBrothers"
  | "fullSisters";

interface CurrencyOption {
  id: string;
  symbolAr: string;
  symbolEn: string;
}

interface HeirRow {
  key: HeirKey;
  labelAr: string;
  labelEn: string;
  count: number;
  share: Fraction;
  perShare: Fraction | null;
}

interface CalculationResult {
  rows: HeirRow[];
  warnings: string[];
  appliedAwl: boolean;
  appliedRadd: boolean;
  totalShare: Fraction;
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
// الكسور — حساب دقيق بدون أخطاء فاصلة عائمة
// ============================================================

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }

  return a || 1;
}

class Fraction {
  readonly n: number;
  readonly d: number;

  constructor(n: number = 0, d: number = 1) {
    if (d === 0) {
      throw new Error("Denominator cannot be zero");
    }

    let num = n;
    let den = d;

    if (den < 0) {
      num = -num;
      den = -den;
    }

    if (num === 0) {
      this.n = 0;
      this.d = 1;
      return;
    }

    const g = gcd(num, den);
    this.n = num / g;
    this.d = den / g;
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.n * other.n, this.d * other.d);
  }

  div(other: Fraction): Fraction {
    if (other.isZero()) {
      return new Fraction(0);
    }

    return new Fraction(this.n * other.d, this.d * other.n);
  }

  isZero(): boolean {
    return this.n === 0;
  }

  toNumber(): number {
    return this.n / this.d;
  }

  toString(): string {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
}

const ZERO = new Fraction(0);
const ONE = new Fraction(1);

function f(n: number, d: number = 1): Fraction {
  return new Fraction(n, d);
}

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
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

  if (!raw) {
    return 0;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseCount(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();

  if (!raw) {
    return 0;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

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
  if (!Number.isFinite(value)) {
    return "—";
  }

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

function sumShares(shares: Record<HeirKey, Fraction>): Fraction {
  return Object.values(shares).reduce((acc, share) => acc.add(share), ZERO);
}

// ============================================================
// الحساب
// ============================================================

function calculateInheritance(input: {
  lang: Lang;
  deceasedGender: DeceasedGender;
  hasSpouse: boolean;
  hasFather: boolean;
  hasMother: boolean;
  sons: number;
  daughters: number;
  fullBrothers: number;
  fullSisters: number;
  ui: (typeof UI)[Lang];
}): CalculationResult {
  const {
    deceasedGender,
    hasSpouse,
    hasFather,
    hasMother,
    sons,
    daughters,
    fullBrothers,
    fullSisters,
    ui,
  } = input;

  const warnings: string[] = [];
  const hasAnyHeir =
    hasSpouse ||
    hasFather ||
    hasMother ||
    sons > 0 ||
    daughters > 0 ||
    fullBrothers > 0 ||
    fullSisters > 0;

  if (!hasAnyHeir) {
    return {
      rows: [],
      warnings: [ui.noHeirs],
      appliedAwl: false,
      appliedRadd: false,
      totalShare: ZERO,
    };
  }

  const hasDescendant = sons + daughters > 0;
  const hasMaleDescendant = sons > 0;
  const siblingCount = fullBrothers + fullSisters;
  const siblingsBlocked = hasMaleDescendant || hasFather;

  const shares: Record<HeirKey, Fraction> = {
    spouse: ZERO,
    father: ZERO,
    mother: ZERO,
    sons: ZERO,
    daughters: ZERO,
    fullBrothers: ZERO,
    fullSisters: ZERO,
  };

  // ===== الزوج / الزوجة =====
  if (hasSpouse) {
    if (deceasedGender === "male") {
      // الزوجة
      shares.spouse = hasDescendant ? f(1, 8) : f(1, 4);
    } else {
      // الزوج
      shares.spouse = hasDescendant ? f(1, 4) : f(1, 2);
    }
  }

  // ===== الأب =====
  // الأب له السدس مع وجود فرع وارث، وإلا فهو عصبة.
  if (hasFather && hasDescendant) {
    shares.father = f(1, 6);
  }

  // ===== الأم =====
  // مسألة عمرية: زوج/زوجة + أب + أم، لا فرع ولا إخوة:
  // للأم ثلث الباقي بعد نصير الزوجين.
  const specialUmariyyah =
    hasSpouse &&
    hasFather &&
    hasMother &&
    !hasDescendant &&
    siblingCount === 0;

  if (hasMother) {
    if (specialUmariyyah) {
      const remainderAfterSpouse = ONE.sub(shares.spouse);
      shares.mother = f(1, 3).mul(remainderAfterSpouse);
    } else if (hasDescendant || siblingCount >= 2) {
      shares.mother = f(1, 6);
    } else {
      shares.mother = f(1, 3);
    }
  }

  // ===== البنات =====
  if (daughters > 0 && sons === 0) {
    shares.daughters = daughters === 1 ? f(1, 2) : f(2, 3);
  }

  // ===== الأخوات الشقيقات =====
  // يفترضن بالفرض إذا لم يوجد فرع وارث ذكر ولا أب ولا أخ شقيق.
  if (
    !siblingsBlocked &&
    fullSisters > 0 &&
    fullBrothers === 0 &&
    !hasDescendant
  ) {
    shares.fullSisters = fullSisters === 1 ? f(1, 2) : f(2, 3);
  }

  // ===== العول =====
  let fixedSum = sumShares(shares);
  let appliedAwl = false;

  if (fixedSum.toNumber() > 1 + 1e-12) {
    const factor = ONE.div(fixedSum);

    (Object.keys(shares) as HeirKey[]).forEach((key) => {
      shares[key] = shares[key].mul(factor);
    });

    fixedSum = ONE;
    appliedAwl = true;
    warnings.push(ui.awl);
  }

  let residue = ONE.sub(fixedSum);

  if (residue.n < 0) {
    residue = ZERO;
  }

  let appliedRadd = false;

  // ===== توزيع الباقي: العصبة ثم الرد =====
  if (residue.toNumber() > 1e-12) {
    if (sons > 0) {
      // الأبناء يعصبون البنات: للذكر مثل حظ الأنثيين
      const parts = 2 * sons + daughters;

      if (parts > 0) {
        const sonsShare = residue.mul(f(2 * sons, parts));
        const daughtersShare = residue.mul(f(daughters, parts));

        shares.sons = shares.sons.add(sonsShare);
        shares.daughters = shares.daughters.add(daughtersShare);
        residue = ZERO;

        if (daughters > 0) {
          warnings.push(ui.sonsDaughtersRule);
        }
      }
    } else if (hasFather) {
      // الأب يأخذ الباقي عصبة
      shares.father = shares.father.add(residue);
      residue = ZERO;
    } else if (fullBrothers > 0 && !siblingsBlocked) {
      // الإخوة الأشقاء يعصبون الأخوات الشقيقات
      const parts = 2 * fullBrothers + fullSisters;

      if (parts > 0) {
        const brothersShare = residue.mul(f(2 * fullBrothers, parts));
        const sistersShare = residue.mul(f(fullSisters, parts));

        shares.fullBrothers = shares.fullBrothers.add(brothersShare);
        shares.fullSisters = shares.fullSisters.add(sistersShare);
        residue = ZERO;

        if (fullSisters > 0) {
          warnings.push(ui.brothersSistersRule);
        }
      }
    } else {
      // الرد على غير الزوجين إن وجدوا
      const raddCandidates: HeirKey[] = [
        "father",
        "mother",
        "daughters",
        "fullSisters",
      ];

      const candidates = raddCandidates.filter(
        (key) => shares[key].toNumber() > 1e-12
      );

      if (candidates.length > 0) {
        const total = candidates.reduce(
          (acc, key) => acc.add(shares[key]),
          ZERO
        );

        if (total.toNumber() > 0) {
          candidates.forEach((key) => {
            const portion = shares[key].div(total);
            shares[key] = shares[key].add(residue.mul(portion));
          });

          appliedRadd = true;
          warnings.push(ui.radd);
        }
      } else if (shares.spouse.toNumber() > 1e-12) {
        shares.spouse = shares.spouse.add(residue);
        warnings.push(ui.spouseOnly);
      }

      residue = ZERO;
    }
  }

  // ===== ملاحظات إضافية =====
  if (daughters > 0 && fullBrothers > 0 && !hasFather && sons === 0) {
    warnings.push(ui.daughtersBlockNote);
  }

  const rows: HeirRow[] = [];

  const addRow = (
    key: HeirKey,
    labelAr: string,
    labelEn: string,
    count: number,
    share: Fraction
  ) => {
    if (share.toNumber() <= 1e-12) {
      return;
    }

    rows.push({
      key,
      labelAr,
      labelEn,
      count,
      share,
      perShare: count > 0 ? share.div(f(count, 1)) : null,
    });
  };

  if (hasSpouse) {
    addRow(
      "spouse",
      deceasedGender === "male" ? ui.wife : ui.husband,
      deceasedGender === "male" ? "Wife" : "Husband",
      1,
      shares.spouse
    );
  }

  if (hasFather) {
    addRow("father", ui.father, "Father", 1, shares.father);
  }

  if (hasMother) {
    addRow("mother", ui.mother, "Mother", 1, shares.mother);
  }

  if (sons > 0) {
    addRow("sons", ui.sonsLabel, ui.sonsLabel, sons, shares.sons);
  }

  if (daughters > 0) {
    addRow(
      "daughters",
      ui.daughtersLabel,
      ui.daughtersLabel,
      daughters,
      shares.daughters
    );
  }

  if (fullBrothers > 0) {
    addRow(
      "fullBrothers",
      ui.fullBrothersLabel,
      ui.fullBrothersLabel,
      fullBrothers,
      shares.fullBrothers
    );
  }

  if (fullSisters > 0) {
    addRow(
      "fullSisters",
      ui.fullSistersLabel,
      ui.fullSistersLabel,
      fullSisters,
      shares.fullSisters
    );
  }

  return {
    rows,
    warnings,
    appliedAwl,
    appliedRadd,
    totalShare: sumShares(shares),
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

  if (!isValidLang(lang)) {
    return {};
  }

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
      title: ui.title,
      description: ui.description,
      url: `/${l}/inheritance`,
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

export default async function InheritancePage({
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

  const result = calculateInheritance({
    lang: l,
    deceasedGender,
    hasSpouse,
    hasFather,
    hasMother,
    sons,
    daughters,
    fullBrothers,
    fullSisters,
    ui,
  });

  return (
    <main>
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
              📜 {isRTL ? "الفرائض" : "Faraid"}
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

            {/* ===== جنس المتوفى والزوج ===== */}
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

            {/* ===== الأب والأم ===== */}
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

            {/* ===== الأبناء والبنات ===== */}
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

            {/* ===== أزرار ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-night-700">
              <Link
                href={`/${l}/inheritance`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
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
            {result.warnings.length > 0 && (
              <div className="card border-amber-200 bg-amber-50/60 p-6 md:p-8 dark:border-amber-900/30 dark:bg-amber-950/15">
                <h2
                  className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  ⚠️ {ui.warningsTitle}
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

            {/* ===== جدول القسمة ===== */}
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
                              {isRTL ? row.labelAr : row.labelEn}
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
                <div className="mb-4 text-5xl">📭</div>

                <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                  {ui.noHeirs}
                </h2>
              </div>
            )}
          </div>
        )}

        {/* ===== ملاحظات فقهية ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
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
    </main>
  );
}