// lib/translations.ts

export type Lang = "ar" | "en";

type TranslationEntry = Partial<Record<Lang, string>>;

/**
 * ضع هنا الترجمات الحقيقية إذا كانت عندك.
 * مثال:
 *
 * const dictionaries: Record<string, TranslationEntry> = {
 *   home: { ar: "الرئيسية", en: "Home" },
 *   quran: { ar: "القرآن", en: "Quran" },
 * };
 */
const dictionaries: Record<string, TranslationEntry> = {};

function toLang(lang: any): Lang {
  return lang === "en" ? "en" : "ar";
}

function toKey(key: any): string {
  if (typeof key === "string") {
    return key;
  }

  if (key === null || key === undefined) {
    return "";
  }

  return String(key);
}

export function translate(lang: any, key: any): string {
  const l = toLang(lang);
  const k = toKey(key);

  const entry = dictionaries[k];

  if (!entry) {
    return k;
  }

  return entry[l] ?? entry.ar ?? entry.en ?? k;
}

const reservedFunctionProps = new Set([
  "then",
  "toJSON",
  "call",
  "apply",
  "bind",
  "length",
  "name",
  "prototype",
  "constructor",
  "toString",
  "valueOf",
  "Symbol(Symbol.toPrimitive)",
  "Symbol(Symbol.toStringTag)",
  "Symbol(Symbol.iterator)",
]);

/**
 * تدعم الاستخدامين:
 *
 * 1) t(lang, "key")
 * 2) const tr = t(lang); tr.key
 * 3) const tr = t(lang); tr("key")
 */
export function t(lang: any, key?: any): any {
  if (key === undefined) {
    const callable = ((k: any) => translate(lang, k)) as any;

    return new Proxy(callable, {
      get(target, prop, receiver) {
        if (typeof prop !== "string") {
          return Reflect.get(target, prop, receiver);
        }

        if (reservedFunctionProps.has(prop)) {
          return Reflect.get(target, prop, receiver);
        }

        return translate(lang, prop);
      },

      apply(target, thisArg, argumentsList) {
        return Reflect.apply(target, thisArg, argumentsList);
      },
    });
  }

  return translate(lang, key);
}

export default t;