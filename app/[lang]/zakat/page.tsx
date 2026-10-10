// app/[lang]/zakat/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

// ============================================================
// الأنواع
// ============================================================

type NisabBasis = "silver" | "gold";
type Irrigation = "rain" | "irrigated" | "mixed";

type SearchParams = {
  currency?: string | string[];
  cash?: string | string[];
  gold?: string | string[];
  silver?: string | string[];
  goldPrice?: string | string[];
  silverPrice?: string | string[];
  goods?: string | string[];
  receivables?: string | string[];
  debts?: string | string[];
  nisabBasis?: string | string[];
  crops?: string | string[];
  irrigation?: string | string[];
};

interface CurrencyOption {
  id: string;
  symbolAr: string;
  symbolEn: string;
}

// ============================================================
// الثوابت
// ============================================================

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const ZAKAT_RATE = 0.025;

const CROPS_RAIN_RATE = 0.1;
const CROPS_IRRIGATED_RATE = 0.05;
const CROPS_MIXED_RATE = 0.075;

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
    cash: string;
    cashHelp: string;
    gold: string;
    goldHelp: string;
    silver: string;
    silverHelp: string;
    goldPrice: string;
    goldPriceHelp: string;
    silverPrice: string;
    silverPriceHelp: string;
    goods: string;
    goodsHelp: string;
    receivables: string;
    receivablesHelp: string;
    debts: string;
    debtsHelp: string;
    nisabBasis: string;
    nisabSilver: string;
    nisabGold: string;
    calculate: string;
    reset: string;
    resultsTitle: string;
    totalAssets: string;
    metalValue: string;
    debtsLabel: string;
    netWealth: string;
    nisabValue: string;
    status: string;
    payable: string;
    notPayable: string;
    zakatDue: string;
    rate: string;
    cropsTitle: string;
    crops: string;
    cropsHelp: string;
    irrigation: string;
    rain: string;
    irrigated: string;
    mixed: string;
    cropZakat: string;
    warningsTitle: string;
    warningGoldPrice: string;
    warningSilverPrice: string;
    warningNisab: string;
    warningDebts: string;
    warningCropsThreshold: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    note4: string;
    contact: string;
    fatwa: string;
    perGram: string;
    grams: string;
    optional: string;
    approximate: string;
    verse: string;
    verseSource: string;
    hadith: string;
    hadithSource: string;
    introTitle: string;
    introDesc: string;
    virtue1Title: string;
    virtue1Desc: string;
    virtue2Title: string;
    virtue2Desc: string;
    virtue3Title: string;
    virtue3Desc: string;
    virtue4Title: string;
    virtue4Desc: string;
    rateLabel: string;
    goldNisab: string;
    silverNisab: string;
    currenciesCount: string;
    relatedTitle: string;
    inheritancePage: string;
    inheritancePageDesc: string;
    fatwaPage: string;
    fatwaPageDesc: string;
    hajjPage: string;
    hajjPageDesc: string;
    contactPage: string;
    contactPageDesc: string;
  }
> = {
  ar: {
    title: "حاسبة الزكاة",
    subtitle: "احسب زكاة مالك بدقة حسب النصاب والديون",
    home: "الرئيسية",
    description:
      "حاسبة زكاة المال: تدخل النقود والذهب والفضة وعروض التجارة والديون، وتحسب الزكاة بنسبة 2.5% إذا بلغ المال النصاب وحال عليه الحول.",
    formTitle: "بيانات الزكاة",
    formSubtitle:
      "أدخل القيم الحالية لعملتك. هذه الحاسبة للتقدير، ويجب مراجعة أهل العلم في الحالات الخاصة.",
    currency: "العملة",
    cash: "النقود / الحسابات البنكية",
    cashHelp: "النقد الموجود، والودائع، والحسابات الجارية والتوفير.",
    gold: "الذهب بالجرام",
    goldHelp: "وزن الذهب الذي تملكه، سواء سبائك أو مشغولات معدة للادخار أو التجارة.",
    silver: "الفضة بالجرام",
    silverHelp: "وزن الفضة الذي تملكه.",
    goldPrice: "سعر جرام الذهب",
    goldPriceHelp: "أدخل سعر الجرام بعمتك الحالية.",
    silverPrice: "سعر جرام الفضة",
    silverPriceHelp: "أدخل سعر الجرام بعمتك الحالية.",
    goods: "قيمة عروض التجارة",
    goodsHelp: "قيمة البضائع المعدة للبيع بسعر السوق، بعد خصم الديون إن وجدت.",
    receivables: "أموال مرتجعة / ديون لك",
    receivablesHelp: "المبالغ التي يتوقع تحصيلها، مثل دين مرجو أو أرباح مستحقة.",
    debts: "الديون المستحقة عليك",
    debtsHelp: "الديون التي يجب سدادها الآن أو خلال العام.",
    nisabBasis: "أساس النصاب",
    nisabSilver: "الفضة (595 جرامًا)",
    nisabGold: "الذهب (85 جرامًا)",
    calculate: "احسب الزكاة",
    reset: "تصفير",
    resultsTitle: "نتيجة الحساب",
    totalAssets: "إجمالي الأصول",
    metalValue: "قيمة الذهب والفضة",
    debtsLabel: "الديون",
    netWealth: "صافي المال",
    nisabValue: "قيمة النصاب",
    status: "الحالة",
    payable: "بلغ النصاب، تجب فيه الزكاة",
    notPayable: "لم يبلغ النصاب",
    zakatDue: "الزكاة الواجبة",
    rate: "النسبة",
    cropsTitle: "زكاة الزراعة / الثمار (اختياري)",
    crops: "قيمة المحصول أو الثمار",
    cropsHelp:
      "أدخل قيمة المحصول بعد الحصاد والتجفيف إن كان مما تجب فيه الزكاة.",
    irrigation: "طريقة الري",
    rain: "مائي / بلا كلفة (العشر)",
    irrigated: "مكلَّف / بالري الصناعي (نصف العشر)",
    mixed: "مختلط (ثلاثة أرباع العشر)",
    cropZakat: "زكاة المحصول",
    warningsTitle: "تنبيهات",
    warningGoldPrice: "أدخل سعر جرام الذهب لحساب قيمة الذهب بدقة.",
    warningSilverPrice: "أدخل سعر جرام الفضة لحساب قيمة الفضة بدقة.",
    warningNisab:
      "لم يمكن تحديد النصاب المالي بسبب نقص أسعار الذهب أو الفضة. إذا كنت تملك 85 جرام ذهب أو 595 جرام فضة فقد بلغت النصاب وزنًا، لكن أدخل الأسعار لحساب المقدار.",
    warningDebts: "الديون أكبر من الأصول، لذلك صافي المال = صفر.",
    warningCropsThreshold:
      "زكاة المحصول تجب إذا بلغ النصاب، ويُقدَّر غالبًا بنحو 653 كجم من القمح أو ما يشابهه من الأقوات. هذه الحاسبة لا تتحقق من الوزن تلقائيًا.",
    noteTitle: "ملاحظات فقهية مهمة",
    note1:
      "الزكاة تجب في المال إذا بلغ النصاب وحال عليه الحول القمري.",
    note2:
      "الذهب والفضة والمال النقدي وعروض التجارة تُضم معًا في الغالب.",
    note3:
      "الديون المستحقة تُخصم من المال الزكوي عند جمهور أهل العلم.",
    note4:
      "هذه الحاسبة للتقدير العام، ولا تغني عن سؤال أهل العلم في المسائل الدقيقة أو الشركات أو الأسهم أو العقارات التجارية.",
    contact: "تواصل معنا",
    fatwa: "الفتاوى",
    perGram: "لكل جرام",
    grams: "جرام",
    optional: "اختياري",
    approximate: "تقريبي",
    verse: "﴿ خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا ﴾",
    verseSource: "سورة التوبة — الآية 103",
    hadith: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    hadithSource: "رواه مسلم",
    introTitle: "فضل الزكاة وشروطها",
    introDesc:
      "الزكاة ركن من أركان الإسلام الخمسة، وفرض على كل مسلم بلغ ماله النصاب وحال عليه الحول. وهي طهرة للمال والنفس، وسبب للبركة والنماء، وتكافل بين أفراد المجتمع المسلم.",
    virtue1Title: "تطهير المال والنفس",
    virtue1Desc: "الزكاة تطهر المال من الشح، وتطهر النفس من البخل.",
    virtue2Title: "البركة والنماء",
    virtue2Desc: "المال الذي تُخرج زكاته يبارك الله فيه ويزيده.",
    virtue3Title: "التكافل الاجتماعي",
    virtue3Desc: "الزكاة تربط الغني بالفقير برباط عبادة لا منّة.",
    virtue4Title: "النجاة يوم القيامة",
    virtue4Desc: "الزكاة ظل لصاحبها يوم القيامة، وسبب لدخول الجنة.",
    rateLabel: "نسبة الزكاة",
    goldNisab: "نصاب الذهب",
    silverNisab: "نصاب الفضة",
    currenciesCount: "عملات مدعومة",
    relatedTitle: "صفحات ذات صلة",
    inheritancePage: "حاسبة الميراث",
    inheritancePageDesc: "قسّم التركة حسب الفرائض.",
    fatwaPage: "الفتاوى",
    fatwaPageDesc: "أسئلة فقهية عن الزكاة.",
    hajjPage: "دليل الحج والعمرة",
    hajjPageDesc: "مناسك الحج والعمرة.",
    contactPage: "تواصل معنا",
    contactPageDesc: "للاستفسار عن الزكاة.",
  },
  en: {
    title: "Zakat Calculator",
    subtitle: "Calculate your zakat based on nisab and debts",
    home: "Home",
    description:
      "Zakat calculator for cash, gold, silver, trade goods, and debts. It estimates 2.5% zakat when wealth reaches nisab and a lunar year has passed.",
    formTitle: "Zakat Details",
    formSubtitle:
      "Enter current values in your currency. This calculator is an estimate; consult qualified scholars for special cases.",
    currency: "Currency",
    cash: "Cash / Bank balances",
    cashHelp: "Physical cash, current accounts, savings, and deposits.",
    gold: "Gold in grams",
    goldHelp: "Weight of gold you own, including bars or savings gold.",
    silver: "Silver in grams",
    silverHelp: "Weight of silver you own.",
    goldPrice: "Gold price per gram",
    goldPriceHelp: "Enter the current price per gram in your currency.",
    silverPrice: "Silver price per gram",
    silverPriceHelp: "Enter the current price per gram in your currency.",
    goods: "Trade goods value",
    goodsHelp: "Market value of inventory or goods intended for sale.",
    receivables: "Receivables / money owed to you",
    receivablesHelp: "Expected recoverable amounts, such as receivable debts.",
    debts: "Debts due",
    debtsHelp: "Liabilities you must pay now or within the year.",
    nisabBasis: "Nisab basis",
    nisabSilver: "Silver (595 grams)",
    nisabGold: "Gold (85 grams)",
    calculate: "Calculate Zakat",
    reset: "Reset",
    resultsTitle: "Result",
    totalAssets: "Total assets",
    metalValue: "Gold & silver value",
    debtsLabel: "Debts",
    netWealth: "Net wealth",
    nisabValue: "Nisab value",
    status: "Status",
    payable: "Nisab reached, zakat is due",
    notPayable: "Below nisab",
    zakatDue: "Zakat due",
    rate: "Rate",
    cropsTitle: "Agricultural zakat (optional)",
    crops: "Crop / fruit value",
    cropsHelp:
      "Enter the value after harvest and drying, if zakat applies.",
    irrigation: "Irrigation type",
    rain: "Rain-fed / natural (10%)",
    irrigated: "Artificial / costly (5%)",
    mixed: "Mixed (7.5%)",
    cropZakat: "Crop zakat",
    warningsTitle: "Warnings",
    warningGoldPrice: "Enter gold price per gram for accurate valuation.",
    warningSilverPrice: "Enter silver price per gram for accurate valuation.",
    warningNisab:
      "Monetary nisab could not be determined because gold/silver prices are missing. If you own 85g gold or 595g silver, you reached nisab by weight, but enter prices to calculate the amount.",
    warningDebts: "Debts exceed assets, so net wealth is zero.",
    warningCropsThreshold:
      "Crop zakat is due when the produce reaches nisab, commonly estimated around 653 kg of wheat or similar staple. This calculator does not verify weight automatically.",
    noteTitle: "Important fiqh notes",
    note1:
      "Zakat becomes due when wealth reaches nisab and one lunar year passes.",
    note2:
      "Gold, silver, cash, and trade goods are generally combined.",
    note3:
      "Due debts are deducted from zakatable wealth according to the majority view.",
    note4:
      "This calculator is for general estimation and does not replace scholarly consultation for companies, stocks, or commercial real estate.",
    contact: "Contact Us",
    fatwa: "Fatwas",
    perGram: "per gram",
    grams: "grams",
    optional: "optional",
    approximate: "approximate",
    verse: "\"Take from their wealth a charity by which you purify them and cause them increase.\"",
    verseSource: "Surah At-Tawbah — Verse 103",
    hadith: "Wealth does not decrease because of charity.",
    hadithSource: "Narrated by Muslim",
    introTitle: "Virtue of Zakat and Its Conditions",
    introDesc:
      "Zakat is one of the five pillars of Islam, obligatory on every Muslim whose wealth reaches nisab and a lunar year has passed. It purifies wealth and soul, causes blessing and growth, and creates solidarity among the Muslim community.",
    virtue1Title: "Purification of Wealth and Soul",
    virtue1Desc: "Zakat purifies wealth from stinginess and the soul from miserliness.",
    virtue2Title: "Blessing and Growth",
    virtue2Desc: "Wealth from which zakat is paid is blessed and increased by Allah.",
    virtue3Title: "Social Solidarity",
    virtue3Desc: "Zakat connects the rich and poor through worship, not favor.",
    virtue4Title: "Salvation on Judgment Day",
    virtue4Desc: "Zakat is a shade for its giver on Judgment Day and a means to enter Paradise.",
    rateLabel: "Zakat Rate",
    goldNisab: "Gold Nisab",
    silverNisab: "Silver Nisab",
    currenciesCount: "Supported Currencies",
    relatedTitle: "Related Pages",
    inheritancePage: "Inheritance Calculator",
    inheritancePageDesc: "Distribute estate according to faraid.",
    fatwaPage: "Fatwas",
    fatwaPageDesc: "Fiqh questions about zakat.",
    hajjPage: "Hajj & Umrah Guide",
    hajjPageDesc: "Rites of Hajj and Umrah.",
    contactPage: "Contact Us",
    contactPageDesc: "For zakat inquiries.",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseNumber(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseNonNegativeNumber(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
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

function formatCurrency(value: number, lang: Lang, currencyId: string): string {
  const currency = CURRENCIES.find((item) => item.id === currencyId);
  const symbol = currency
    ? lang === "ar" ? currency.symbolAr : currency.symbolEn
    : currencyId;
  return `${formatNumber(value, lang)} ${symbol}`;
}

function normalizeNisabBasis(value?: string | string[]): NisabBasis {
  const raw = getFirstValue(value).toLowerCase();
  return raw === "gold" ? "gold" : "silver";
}

function normalizeIrrigation(value?: string | string[]): Irrigation {
  const raw = getFirstValue(value).toLowerCase();
  if (raw === "irrigated") return "irrigated";
  if (raw === "mixed") return "mixed";
  return "rain";
}

function normalizeCurrency(value?: string | string[]): string {
  const raw = getFirstValue(value).toUpperCase();
  return CURRENCIES.some((c) => c.id === raw) ? raw : "EGP";
}

function cropRate(irrigation: Irrigation): number {
  if (irrigation === "irrigated") return CROPS_IRRIGATED_RATE;
  if (irrigation === "mixed") return CROPS_MIXED_RATE;
  return CROPS_RAIN_RATE;
}

function cropRateLabel(irrigation: Irrigation): string {
  if (irrigation === "irrigated") return "5%";
  if (irrigation === "mixed") return "7.5%";
  return "10%";
}

function irrigationLabel(irrigation: Irrigation, lang: Lang, ui: (typeof UI)[Lang]): string {
  if (irrigation === "irrigated") return ui.irrigated;
  if (irrigation === "mixed") return ui.mixed;
  return ui.rain;
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
      canonical: `/${l}/zakat`,
      languages: {
        ar: "/ar/zakat",
        en: "/en/zakat",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/zakat`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
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
      images: ["/icons/icon-512.png"],
    },
  };
}

// ============================================================
// الصفحة
// ============================================================

export default async function ZakatPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;
  const submitted = Object.keys(sp).length > 0;

  const currency = normalizeCurrency(sp.currency);
  const nisabBasis = normalizeNisabBasis(sp.nisabBasis);
  const irrigation = normalizeIrrigation(sp.irrigation);

  const cash = parseNonNegativeNumber(sp.cash);
  const goldGrams = parseNonNegativeNumber(sp.gold);
  const silverGrams = parseNonNegativeNumber(sp.silver);
  const goldPrice = parseNonNegativeNumber(sp.goldPrice);
  const silverPrice = parseNonNegativeNumber(sp.silverPrice);
  const goods = parseNonNegativeNumber(sp.goods);
  const receivables = parseNonNegativeNumber(sp.receivables);
  const debts = parseNonNegativeNumber(sp.debts);
  const crops = parseNonNegativeNumber(sp.crops);

  const goldValue = goldGrams * goldPrice;
  const silverValue = silverGrams * silverPrice;
  const metalValue = goldValue + silverValue;

  const totalAssets = cash + goods + receivables + metalValue;
  const netWealth = Math.max(0, totalAssets - debts);

  const goldNisabValue = GOLD_NISAB_GRAMS * goldPrice;
  const silverNisabValue = SILVER_NISAB_GRAMS * silverPrice;

  let nisabValue = nisabBasis === "gold" ? goldNisabValue : silverNisabValue;
  if (nisabValue <= 0) nisabValue = Math.max(goldNisabValue, silverNisabValue);

  const canCalculateMonetaryNisab = nisabValue > 0;
  const reachedMetalNisabByWeight =
    goldGrams >= GOLD_NISAB_GRAMS || silverGrams >= SILVER_NISAB_GRAMS;

  const payable = canCalculateMonetaryNisab
    ? netWealth >= nisabValue
    : reachedMetalNisabByWeight && netWealth > 0;

  const zakatAmount = canCalculateMonetaryNisab && payable ? netWealth * ZAKAT_RATE : 0;

  const rate = cropRate(irrigation);
  const cropZakat = crops > 0 ? crops * rate : 0;

  const warnings: string[] = [];
  if (goldGrams > 0 && goldPrice <= 0) warnings.push(ui.warningGoldPrice);
  if (silverGrams > 0 && silverPrice <= 0) warnings.push(ui.warningSilverPrice);
  if (!canCalculateMonetaryNisab && submitted) warnings.push(ui.warningNisab);
  if (debts > totalAssets && submitted) warnings.push(ui.warningDebts);
  if (crops > 0) warnings.push(ui.warningCropsThreshold);

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
        url: `/${l}/zakat`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "Article",
        headline: ui.title,
        description: ui.description,
        inLanguage: l,
        url: `/${l}/zakat`,
        articleSection: isRTL ? "العبادات" : "Worship",
        keywords: isRTL
          ? "الزكاة, النصاب, الذهب, الفضة, حاسبة الزكاة"
          : "zakat, nisab, gold, silver, zakat calculator",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: isRTL ? "ما هو نصاب الزكاة؟" : "What is the zakat nisab?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نصاب الزكاة هو مقدار المال الذي تجب فيه الزكاة، ويعادل 85 جراماً من الذهب أو 595 جراماً من الفضة."
                : "Zakat nisab is the minimum wealth threshold requiring zakat, equivalent to 85 grams of gold or 595 grams of silver.",
            },
          },
          {
            "@type": "Question",
            name: isRTL ? "كم نسبة الزكاة في المال؟" : "What is the zakat rate on wealth?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "نسبة الزكاة في المال هي 2.5% (ربع العشر) من صافي المال بعد خصم الديون."
                : "The zakat rate on wealth is 2.5% (one-fortieth) of net wealth after deducting debts.",
            },
          },
          {
            "@type": "Question",
            name: isRTL ? "متى تجب الزكاة؟" : "When is zakat due?",
            acceptedAnswer: {
              "@type": "Answer",
              text: isRTL
                ? "تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول القمري (سنة هجرية كاملة)."
                : "Zakat is due when wealth reaches nisab and one lunar year (hawl) has passed.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-cream-dark dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header lang={l} />

      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          { label: ui.home, href: `/${l}` },
          { label: ui.title },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== Hero محسّن ===== */}
        <div className="card relative mb-8 overflow-hidden border-2 border-gold-200 bg-gradient-to-br from-gold-50 via-cream-dark to-primary-50 p-8 md:p-12 dark:border-gold-800 dark:from-gold-950/30 dark:via-gray-900 dark:to-primary-950/30">
          <div className="gradient-gold absolute inset-x-0 top-0 h-1.5" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #d4af37, #0e7490)" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2z" fill="#d4af37" />
                </svg>
              </span>
            </div>

            <span className="badge-gold mb-5">
              💰 {isRTL ? "زكاة المال" : "Wealth Zakat"}
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

            {/* آية كريمة */}
            <div className="mt-8 rounded-2xl border border-gold-300 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gold-700 dark:bg-night-800/80">
              <p
                className="mb-2 text-xl font-black text-gold-700 md:text-2xl dark:text-gold-300"
                style={{ fontFamily: "var(--font-quran)" }}
              >
                {ui.verse}
              </p>
              <p className="text-xs text-gold-600 dark:text-gold-400">
                {ui.verseSource}
              </p>
            </div>

            {/* حديث شريف */}
            <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 backdrop-blur-sm dark:border-primary-800 dark:bg-primary-950/20">
              <p
                className="mb-1 text-base font-black text-primary-700 md:text-lg dark:text-primary-300"
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

        {/* ===== إحصائيات ===== */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon="%" label={ui.rateLabel} value="2.5" color="primary" />
          <StatCard icon="🥇" label={ui.goldNisab} value={`${GOLD_NISAB_GRAMS}g`} color="gold" />
          <StatCard icon="🥈" label={ui.silverNisab} value={`${SILVER_NISAB_GRAMS}g`} color="primary" />
          <StatCard icon="💱" label={ui.currenciesCount} value={CURRENCIES.length} color="gold" />
        </div>

        {/* ===== مقدمة ===== */}
        <div className="card mb-8 overflow-hidden">
          <div className="gradient-gold h-1.5 w-full" />
          <div className="p-6 md:p-8">
            <h2
              className="mb-4 text-2xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "var(--font-amiri)" }}
            >
              💎 {ui.introTitle}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {ui.introDesc}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <VirtueCard icon="✨" title={ui.virtue1Title} desc={ui.virtue1Desc} color="gold" />
              <VirtueCard icon="📈" title={ui.virtue2Title} desc={ui.virtue2Desc} color="primary" />
              <VirtueCard icon="🤝" title={ui.virtue3Title} desc={ui.virtue3Desc} color="gold" />
              <VirtueCard icon="🏆" title={ui.virtue4Title} desc={ui.virtue4Desc} color="primary" />
            </div>
          </div>
        </div>

        {/* ===== نموذج الحساب ===== */}
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

          <form method="get" action={`/${l}/zakat`} className="grid gap-6">
            {/* ===== العملة وأساس النصاب ===== */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="currency" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.currency}
                </label>
                <select id="currency" name="currency" defaultValue={currency} className="input-islamic">
                  {CURRENCIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {isRTL ? item.symbolAr : item.symbolEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nisabBasis" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.nisabBasis}
                </label>
                <select id="nisabBasis" name="nisabBasis" defaultValue={nisabBasis} className="input-islamic">
                  <option value="silver">{ui.nisabSilver}</option>
                  <option value="gold">{ui.nisabGold}</option>
                </select>
              </div>
            </div>

            {/* ===== الأصول الأساسية ===== */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="cash" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.cash}
                </label>
                <input
                  id="cash"
                  name="cash"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  defaultValue={getFirstValue(sp.cash)}
                  placeholder="0"
                  className="input-islamic"
                />
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.cashHelp}
                </p>
              </div>

              <div>
                <label htmlFor="goods" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.goods}
                </label>
                <input
                  id="goods"
                  name="goods"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  defaultValue={getFirstValue(sp.goods)}
                  placeholder="0"
                  className="input-islamic"
                />
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.goodsHelp}
                </p>
              </div>
            </div>

            {/* ===== الذهب والفضة ===== */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gold-200 bg-gold-50/40 p-5 dark:border-gold-900/30 dark:bg-gold-950/15">
                <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                  🥇 {isRTL ? "الذهب" : "Gold"}
                </h3>

                <div className="mb-4">
                  <label htmlFor="gold" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.gold}
                  </label>
                  <input
                    id="gold"
                    name="gold"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    defaultValue={getFirstValue(sp.gold)}
                    placeholder="0"
                    className="input-islamic"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.goldHelp}
                  </p>
                </div>

                <div>
                  <label htmlFor="goldPrice" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.goldPrice}
                  </label>
                  <input
                    id="goldPrice"
                    name="goldPrice"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    defaultValue={getFirstValue(sp.goldPrice)}
                    placeholder="0"
                    className="input-islamic"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.goldPriceHelp}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-night-700 dark:bg-night-800/40">
                <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                  🥈 {isRTL ? "الفضة" : "Silver"}
                </h3>

                <div className="mb-4">
                  <label htmlFor="silver" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.silver}
                  </label>
                  <input
                    id="silver"
                    name="silver"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    defaultValue={getFirstValue(sp.silver)}
                    placeholder="0"
                    className="input-islamic"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.silverHelp}
                  </p>
                </div>

                <div>
                  <label htmlFor="silverPrice" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.silverPrice}
                  </label>
                  <input
                    id="silverPrice"
                    name="silverPrice"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    defaultValue={getFirstValue(sp.silverPrice)}
                    placeholder="0"
                    className="input-islamic"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ui.silverPriceHelp}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== الديون والمستحقات ===== */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="receivables" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.receivables}
                </label>
                <input
                  id="receivables"
                  name="receivables"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  defaultValue={getFirstValue(sp.receivables)}
                  placeholder="0"
                  className="input-islamic"
                />
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.receivablesHelp}
                </p>
              </div>

              <div>
                <label htmlFor="debts" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  {ui.debts}
                </label>
                <input
                  id="debts"
                  name="debts"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  defaultValue={getFirstValue(sp.debts)}
                  placeholder="0"
                  className="input-islamic"
                />
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {ui.debtsHelp}
                </p>
              </div>
            </div>

            {/* ===== الزراعة ===== */}
            <div className="rounded-2xl border border-green-200 bg-green-50/40 p-5 dark:border-green-900/30 dark:bg-green-950/15">
              <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">
                🌾 {ui.cropsTitle}
              </h3>

              <p className="mb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {ui.cropsHelp}
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="crops" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.crops}
                  </label>
                  <input
                    id="crops"
                    name="crops"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    defaultValue={getFirstValue(sp.crops)}
                    placeholder="0"
                    className="input-islamic"
                  />
                </div>

                <div>
                  <label htmlFor="irrigation" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {ui.irrigation}
                  </label>
                  <select id="irrigation" name="irrigation" defaultValue={irrigation} className="input-islamic">
                    <option value="rain">{ui.rain}</option>
                    <option value="irrigated">{ui.irrigated}</option>
                    <option value="mixed">{ui.mixed}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ===== أزرار ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-night-700">
              <Link
                href={`/${l}/zakat`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                {ui.reset}
              </Link>

              <button type="submit" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            {/* ===== بطاقة النتيجة الرئيسية ===== */}
            <div className="card relative overflow-hidden p-6 md:p-8">
              <div className="gradient-primary absolute inset-x-0 top-0 h-1.5" />

              <h2
                className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "var(--font-amiri)" }}
              >
                {ui.resultsTitle}
              </h2>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
                  <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {ui.totalAssets}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(totalAssets, l, currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
                  <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {ui.metalValue}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(metalValue, l, currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-950/15">
                  <p className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">
                    {ui.debtsLabel}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(debts, l, currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-5 dark:border-primary-900/30 dark:bg-primary-950/15">
                  <p className="mb-2 text-xs font-bold text-primary-700 dark:text-primary-300">
                    {ui.netWealth}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(netWealth, l, currency)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* ===== الحالة ===== */}
                <div
                  className={`rounded-2xl border p-6 ${
                    payable
                      ? "border-green-200 bg-green-50/60 dark:border-green-900/30 dark:bg-green-950/15"
                      : "border-amber-200 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/15"
                  }`}
                >
                  <p className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                    {ui.status}
                  </p>

                  <p
                    className={`text-2xl font-black leading-relaxed ${
                      payable
                        ? "text-green-800 dark:text-green-200"
                        : "text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {payable ? ui.payable : ui.notPayable}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {ui.nisabValue}:{" "}
                    <span className="font-black">
                      {canCalculateMonetaryNisab
                        ? formatCurrency(nisabValue, l, currency)
                        : ui.approximate}
                    </span>
                  </p>

                  {reachedMetalNisabByWeight && !canCalculateMonetaryNisab && (
                    <p className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {isRTL
                        ? "بلغت النصاب وزنًا: 85 جرام ذهب أو 595 جرام فضة."
                        : "You reached nisab by weight: 85g gold or 595g silver."}
                    </p>
                  )}
                </div>

                {/* ===== مقدار الزكاة ===== */}
                <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-gold-50 p-6 text-center dark:border-primary-900/30 dark:from-night-800 dark:to-night-900">
                  <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                    {ui.zakatDue}
                  </p>

                  <p className="text-4xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(zakatAmount, l, currency)}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {ui.rate}: 2.5%
                  </p>
                </div>
              </div>
            </div>

            {/* ===== زكاة المحصول ===== */}
            {crops > 0 && (
              <div className="card p-6 md:p-8">
                <h2
                  className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  🌾 {ui.cropsTitle}
                </h2>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900/30 dark:bg-green-950/15">
                    <p className="mb-2 text-xs font-bold text-green-700 dark:text-green-300">
                      {ui.crops}
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(crops, l, currency)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-night-700 dark:bg-night-800/50">
                    <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {ui.irrigation}
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {irrigationLabel(irrigation, l, ui)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {cropRateLabel(irrigation)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-5 dark:border-primary-900/30 dark:bg-primary-950/15">
                    <p className="mb-2 text-xs font-bold text-primary-700 dark:text-primary-300">
                      {ui.cropZakat}
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(cropZakat, l, currency)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ===== التنبيهات ===== */}
            {warnings.length > 0 && (
              <div className="card border-amber-200 bg-amber-50/60 p-6 md:p-8 dark:border-amber-900/30 dark:bg-amber-950/15">
                <h2
                  className="mb-5 text-xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  ⚠️ {ui.warningsTitle}
                </h2>

                <ul className="space-y-3">
                  {warnings.map((warning, index) => (
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
          </div>
        )}

        {/* ===== صفحات ذات صلة ===== */}
        <div className="mt-10">
          <h2
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            🔗 {ui.relatedTitle}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${l}/inheritance`} className="card card-interactive group flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">📜</span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                  {ui.inheritancePage}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                  {ui.inheritancePageDesc}
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
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-xl dark:bg-primary-900/40">🕋</span>
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
          </div>
        </div>

        {/* ===== ملاحظات فقهية ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 md:p-8 dark:border-gold-900/30 dark:bg-gold-950/15">
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
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{ui.note4}</span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${l}/contact`} className="btn-primary">
                  {ui.contact}
                </Link>
                <Link href={`/${l}/fatwa`} className="btn-outline">
                  {ui.fatwa}
                </Link>
              </div>
            </div>
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
  value: string | number;
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
// مكون VirtueCard
// ============================================================

function VirtueCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: string;
  title: string;
  desc: string;
  color: "primary" | "gold";
}) {
  const borderClass =
    color === "gold"
      ? "border-gold-300 bg-gold-50/60 dark:border-gold-800/40 dark:bg-gold-950/20"
      : "border-primary-300 bg-primary-50/60 dark:border-primary-800/40 dark:bg-primary-950/20";
  const titleColor =
    color === "gold"
      ? "text-gold-700 dark:text-gold-300"
      : "text-primary-700 dark:text-primary-300";

  return (
    <div className={`rounded-2xl border-2 ${borderClass} p-5 transition-all hover:-translate-y-1`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-night-800">
          {icon}
        </span>
        <h3
          className={`text-base font-black ${titleColor}`}
          style={{ fontFamily: "var(--font-amiri)" }}
        >
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {desc}
      </p>
    </div>
  );
}