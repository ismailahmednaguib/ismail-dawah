import test from "node:test";
import assert from "node:assert/strict";
import { mapQuranSearchResults, normalizeQuranSearchQuery } from "../lib/quran/search.ts";

test("تنقية بحث القرآن تحد الطول وتزيل الرموز", () => {
  assert.ok(normalizeQuranSearchQuery("  الصبر!!! ".repeat(20)).length <= 120);
  assert.equal(normalizeQuranSearchQuery("الله؟ رحيم"), "الله رحيم");
});

test("تحويل نتائج مصدر القرآن يبني رابط الآية باللغة المطلوبة", () => {
  const [result] = mapQuranSearchResults([
    {
      numberInSurah: 153,
      text: "Indeed, Allah is with the patient.",
      surah: { number: 2 },
    },
  ], "en");

  assert.equal(result?.type, "quran_ayah");
  assert.equal(result?.title, "Surah Al-Baqarah — Ayah 153");
  assert.equal(result?.url, "/en/quran/2#ayah-153");
});
