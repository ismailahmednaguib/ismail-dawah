import test from "node:test";
import assert from "node:assert/strict";
import { searchAyahs } from "../lib/quran/ayah-search.ts";

const ayahs = [
  { numberInSurah: 1, text: "إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ", translation: "Indeed, Allah is Forgiving and Merciful." },
  { numberInSurah: 2, text: "وَاللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ", translation: "And Allah is Aware of what you do." },
  { numberInSurah: 3, text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient." },
];

test("البحث في الآيات العربية يتجاهل التشكيل", () => {
  const result = searchAyahs(ayahs, "الله غفور", "ar");
  assert.deepEqual(result.map((ayah) => ayah.numberInSurah), [1]);
});

test("البحث في الصفحة الإنجليزية يستخدم الترجمة فقط", () => {
  const result = searchAyahs(ayahs, "patient", "en");
  assert.deepEqual(result.map((ayah) => ayah.numberInSurah), [3]);
});

test("البحث يضع المطابقة التي تبدأ بالعبارة أولًا ويحد العدد", () => {
  const result = searchAyahs(ayahs, "Allah", "en", 2);
  assert.deepEqual(result.map((ayah) => ayah.numberInSurah), [1, 2]);
});
