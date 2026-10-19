// lib/calculators/inheritance.ts
// منطق حاسبة الميراث — نقي بلا اعتماد على الواجهة أو React.
// الحاسبة مبسّطة ومعلنة الحدود في الواجهة، ولا تُغني عن فتوى شرعية.

import { Fraction, ONE, ZERO, f } from './fraction.ts';

export type DeceasedGender = 'male' | 'female';

export type HeirKey =
  | 'spouse'
  | 'father'
  | 'mother'
  | 'sons'
  | 'daughters'
  | 'fullBrothers'
  | 'fullSisters';

export type InheritanceWarningCode =
  | 'no_heirs'
  | 'awl'
  | 'radd'
  | 'spouse_only'
  | 'sons_daughters_rule'
  | 'brothers_sisters_rule'
  | 'daughters_block_note';

export type HeirShare = {
  key: HeirKey;
  count: number;
  share: Fraction;
  perShare: Fraction | null;
};

export type InheritanceResult = {
  rows: HeirShare[];
  warnings: InheritanceWarningCode[];
  appliedAwl: boolean;
  appliedRadd: boolean;
  totalShare: Fraction;
};

export type InheritanceInput = {
  deceasedGender: DeceasedGender;
  hasSpouse: boolean;
  hasFather: boolean;
  hasMother: boolean;
  sons: number;
  daughters: number;
  fullBrothers: number;
  fullSisters: number;
};

export function sumShares(shares: Record<HeirKey, Fraction>): Fraction {
  return Object.values(shares).reduce((acc, share) => acc.add(share), ZERO);
}

export function calculateInheritance(input: InheritanceInput): InheritanceResult {
  const {
    deceasedGender,
    hasSpouse,
    hasFather,
    hasMother,
    sons,
    daughters,
    fullBrothers,
    fullSisters,
  } = input;

  const warnings: InheritanceWarningCode[] = [];
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
      warnings: ['no_heirs'],
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
    if (deceasedGender === 'male') {
      shares.spouse = hasDescendant ? f(1, 8) : f(1, 4);
    } else {
      shares.spouse = hasDescendant ? f(1, 4) : f(1, 2);
    }
  }

  // ===== الأب =====
  if (hasFather && hasDescendant) {
    shares.father = f(1, 6);
  }

  // ===== الأم =====
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
    warnings.push('awl');
  }

  let residue = ONE.sub(fixedSum);
  if (residue.n < 0) residue = ZERO;

  let appliedRadd = false;

  // ===== توزيع الباقي: العصبة ثم الرد =====
  if (residue.toNumber() > 1e-12) {
    if (sons > 0) {
      const parts = 2 * sons + daughters;
      if (parts > 0) {
        const sonsShare = residue.mul(f(2 * sons, parts));
        const daughtersShare = residue.mul(f(daughters, parts));
        shares.sons = shares.sons.add(sonsShare);
        shares.daughters = shares.daughters.add(daughtersShare);
        residue = ZERO;
        if (daughters > 0) warnings.push('sons_daughters_rule');
      }
    } else if (hasFather) {
      shares.father = shares.father.add(residue);
      residue = ZERO;
    } else if (fullBrothers > 0 && !siblingsBlocked) {
      const parts = 2 * fullBrothers + fullSisters;
      if (parts > 0) {
        const brothersShare = residue.mul(f(2 * fullBrothers, parts));
        const sistersShare = residue.mul(f(fullSisters, parts));
        shares.fullBrothers = shares.fullBrothers.add(brothersShare);
        shares.fullSisters = shares.fullSisters.add(sistersShare);
        residue = ZERO;
        if (fullSisters > 0) warnings.push('brothers_sisters_rule');
      }
    } else {
      const raddCandidates: HeirKey[] = [
        'father',
        'mother',
        'daughters',
        'fullSisters',
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
          warnings.push('radd');
        }
      } else if (shares.spouse.toNumber() > 1e-12) {
        shares.spouse = shares.spouse.add(residue);
        warnings.push('spouse_only');
      }
      residue = ZERO;
    }
  }

  // ===== ملاحظات إضافية =====
  if (daughters > 0 && fullBrothers > 0 && !hasFather && sons === 0) {
    warnings.push('daughters_block_note');
  }

  const rows: HeirShare[] = [];

  const addRow = (key: HeirKey, count: number, share: Fraction) => {
    if (share.toNumber() <= 1e-12) return;
    rows.push({
      key,
      count,
      share,
      perShare: count > 0 ? share.div(f(count, 1)) : null,
    });
  };

  if (hasSpouse) addRow('spouse', 1, shares.spouse);
  if (hasFather) addRow('father', 1, shares.father);
  if (hasMother) addRow('mother', 1, shares.mother);
  if (sons > 0) addRow('sons', sons, shares.sons);
  if (daughters > 0) addRow('daughters', daughters, shares.daughters);
  if (fullBrothers > 0) addRow('fullBrothers', fullBrothers, shares.fullBrothers);
  if (fullSisters > 0) addRow('fullSisters', fullSisters, shares.fullSisters);

  return {
    rows,
    warnings,
    appliedAwl,
    appliedRadd,
    totalShare: sumShares(shares),
  };
}
