// app/[lang]/zakat/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

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

function parseNonNegativeNumber(value?: string | string[]): number {
  const raw = getFirstValue(value).replace(/,/g, "").trim();

  if (!raw) {
    return 0;
  }

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
    ? lang === "ar"
      ? currency.symbolAr
      : currency.symbolEn
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

  return CURRENCIES.some((currency) => currency.id === raw) ? raw : "EGP";
}

function cropRate(irrigation: Irrigation): number {
  if (irrigation === "irrigated") return CROPS_IRRIGATED_RATE;
  if (irrigation === "mixed") return CROPS_MIXED_RATE;

  return CROPS_RAIN_RATE;
}

function cropRateLabel(irrigation: Irrigation, lang: Lang, ui: (typeof UI)[Lang]): string {
  if (irrigation === "irrigated") {
    return lang === "ar" ? "5%" : "5%";
  }

  if (irrigation === "mixed") {
    return lang === "ar" ? "7.5%" : "7.5%";
  }

  return lang === "ar" ? "10%" : "10%";
}

function irrigationLabel(irrigation: Irrigation, lang: Lang, ui: (typeof UI)[Lang]): string {
  if (irrigation === "irrigated") {
    return lang === "ar" ? ui.irrigated : ui.irrigated;
  }

  if (irrigation === "mixed") {
    return lang === "ar" ? ui.mixed : ui.mixed;
  }

  return lang === "ar" ? ui.rain : ui.rain;
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
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
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

  if (!isValidLang(lang)) {
    notFound();
  }

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

  let nisabValue =
    nisabBasis === "gold" ? goldNisabValue : silverNisabValue;

  if (nisabValue <= 0) {
    nisabValue = Math.max(goldNisabValue, silverNisabValue);
  }

  const canCalculateMonetaryNisab = nisabValue > 0;
  const reachedMetalNisabByWeight =
    goldGrams >= GOLD_NISAB_GRAMS || silverGrams >= SILVER_NISAB_GRAMS;

  const payable = canCalculateMonetaryNisab
    ? netWealth >= nisabValue
    : reachedMetalNisabByWeight && netWealth > 0;

  const zakatAmount =
    canCalculateMonetaryNisab && payable ? netWealth * ZAKAT_RATE : 0;

  const rate = cropRate(irrigation);
  const cropZakat = crops > 0 ? crops * rate : 0;

  const warnings: string[] = [];

  if (goldGrams > 0 && goldPrice <= 0) {
    warnings.push(ui.warningGoldPrice);
  }

  if (silverGrams > 0 && silverPrice <= 0) {
    warnings.push(ui.warningSilverPrice);
  }

  if (!canCalculateMonetaryNisab && submitted) {
    warnings.push(ui.warningNisab);
  }

  if (debts > totalAssets && submitted) {
    warnings.push(ui.warningDebts);
  }

  if (crops > 0) {
    warnings.push(ui.warningCropsThreshold);
  }

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

          <form
            method="get"
            action={`/${l}/zakat`}
            className="grid gap-6"
          >
            {/* ===== العملة وأساس النصاب ===== */}
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
                  htmlFor="nisabBasis"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {ui.nisabBasis}
                </label>

                <select
                  id="nisabBasis"
                  name="nisabBasis"
                  defaultValue={nisabBasis}
                  className="input-islamic"
                >
                  <option value="silver">{ui.nisabSilver}</option>
                  <option value="gold">{ui.nisabGold}</option>
                </select>
              </div>
            </div>

            {/* ===== الأصول الأساسية ===== */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="cash"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
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
                <label
                  htmlFor="goods"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
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
                  <label
                    htmlFor="gold"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
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
                  <label
                    htmlFor="goldPrice"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
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
                  <label
                    htmlFor="silver"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
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
                  <label
                    htmlFor="silverPrice"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
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
                <label
                  htmlFor="receivables"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
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
                <label
                  htmlFor="debts"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
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
                  <label
                    htmlFor="crops"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
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
                  <label
                    htmlFor="irrigation"
                    className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    {ui.irrigation}
                  </label>

                  <select
                    id="irrigation"
                    name="irrigation"
                    defaultValue={irrigation}
                    className="input-islamic"
                  >
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
                      {cropRateLabel(irrigation, l, ui)}
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

        {/* ===== ملاحظات فقهية ===== */}
        <div className="card mt-10 p-6 md:p-8">
          <h2
            className="mb-6 text-2xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "var(--font-amiri)" }}
          >
            📌 {ui.noteTitle}
          </h2>

          <ul className="space-y-4">
            {[ui.note1, ui.note2, ui.note3, ui.note4].map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="flex items-start gap-3 leading-relaxed text-slate-600 dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{note}</span>
              </li>
            ))}
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