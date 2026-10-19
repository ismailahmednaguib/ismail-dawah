// lib/calculators/zakat.ts
// منطق حاسبة الزكاة — نقي بلا اعتماد على الواجهة أو React.

export type NisabBasis = 'silver' | 'gold';
export type Irrigation = 'rain' | 'irrigated' | 'mixed';

export type ZakatWarningCode =
  | 'gold_price_missing'
  | 'silver_price_missing'
  | 'nisab_unknown'
  | 'debts_exceed_assets'
  | 'crops_threshold';

export type ZakatInput = {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  goldPrice: number;
  silverPrice: number;
  goods: number;
  receivables: number;
  debts: number;
  crops: number;
  nisabBasis: NisabBasis;
  irrigation: Irrigation;
  submitted: boolean;
};

export type ZakatResult = {
  goldValue: number;
  silverValue: number;
  metalValue: number;
  totalAssets: number;
  netWealth: number;
  goldNisabValue: number;
  silverNisabValue: number;
  nisabValue: number;
  canCalculateMonetaryNisab: boolean;
  reachedMetalNisabByWeight: boolean;
  payable: boolean;
  zakatAmount: number;
  cropRate: number;
  cropZakat: number;
  warnings: ZakatWarningCode[];
};

export const GOLD_NISAB_GRAMS = 85;
export const SILVER_NISAB_GRAMS = 595;
export const ZAKAT_RATE = 0.025;

export const CROPS_RAIN_RATE = 0.1;
export const CROPS_IRRIGATED_RATE = 0.05;
export const CROPS_MIXED_RATE = 0.075;

export function firstValue(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function parseNonNegativeNumber(value?: string | string[]): number {
  const raw = firstValue(value).replace(/,/g, '').trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function normalizeNisabBasis(value?: string | string[]): NisabBasis {
  return firstValue(value).toLowerCase() === 'gold' ? 'gold' : 'silver';
}

export function normalizeIrrigation(value?: string | string[]): Irrigation {
  const raw = firstValue(value).toLowerCase();
  if (raw === 'irrigated') return 'irrigated';
  if (raw === 'mixed') return 'mixed';
  return 'rain';
}

export function cropRateFor(irrigation: Irrigation): number {
  if (irrigation === 'irrigated') return CROPS_IRRIGATED_RATE;
  if (irrigation === 'mixed') return CROPS_MIXED_RATE;
  return CROPS_RAIN_RATE;
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const {
    cash,
    goldGrams,
    silverGrams,
    goldPrice,
    silverPrice,
    goods,
    receivables,
    debts,
    crops,
    nisabBasis,
    irrigation,
    submitted,
  } = input;

  const goldValue = goldGrams * goldPrice;
  const silverValue = silverGrams * silverPrice;
  const metalValue = goldValue + silverValue;

  const totalAssets = cash + goods + receivables + metalValue;
  const netWealth = Math.max(0, totalAssets - debts);

  const goldNisabValue = GOLD_NISAB_GRAMS * goldPrice;
  const silverNisabValue = SILVER_NISAB_GRAMS * silverPrice;

  let nisabValue = nisabBasis === 'gold' ? goldNisabValue : silverNisabValue;
  if (nisabValue <= 0) nisabValue = Math.max(goldNisabValue, silverNisabValue);

  const canCalculateMonetaryNisab = nisabValue > 0;
  const reachedMetalNisabByWeight =
    goldGrams >= GOLD_NISAB_GRAMS || silverGrams >= SILVER_NISAB_GRAMS;

  const payable = canCalculateMonetaryNisab
    ? netWealth >= nisabValue
    : reachedMetalNisabByWeight && netWealth > 0;

  const zakatAmount = canCalculateMonetaryNisab && payable ? netWealth * ZAKAT_RATE : 0;

  const cropRate = cropRateFor(irrigation);
  const cropZakat = crops > 0 ? crops * cropRate : 0;

  const warnings: ZakatWarningCode[] = [];
  if (goldGrams > 0 && goldPrice <= 0) warnings.push('gold_price_missing');
  if (silverGrams > 0 && silverPrice <= 0) warnings.push('silver_price_missing');
  if (!canCalculateMonetaryNisab && submitted) warnings.push('nisab_unknown');
  if (debts > totalAssets && submitted) warnings.push('debts_exceed_assets');
  if (crops > 0) warnings.push('crops_threshold');

  return {
    goldValue,
    silverValue,
    metalValue,
    totalAssets,
    netWealth,
    goldNisabValue,
    silverNisabValue,
    nisabValue,
    canCalculateMonetaryNisab,
    reachedMetalNisabByWeight,
    payable,
    zakatAmount,
    cropRate,
    cropZakat,
    warnings,
  };
}
