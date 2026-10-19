// lib/calculators/fraction.ts
// كسور دقيقة للحسابات الشرعية (ميراث) بلا أخطاء فاصلة عائمة.

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x || 1;
}

export class Fraction {
  readonly n: number;
  readonly d: number;

  constructor(n: number = 0, d: number = 1) {
    if (d === 0) throw new Error('Denominator cannot be zero');

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
    if (other.isZero()) return new Fraction(0);
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

export const ZERO = new Fraction(0);
export const ONE = new Fraction(1);

export function f(n: number, d: number = 1): Fraction {
  return new Fraction(n, d);
}
