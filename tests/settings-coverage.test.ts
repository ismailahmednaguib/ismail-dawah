import test from "node:test";
import assert from "node:assert/strict";

import { findMissingEnglishFields } from "../lib/settings-coverage.ts";

const FIELDS = [
  { key: "jobTitle", label: "الوظيفة", ar: true, en: true },
  { key: "address", label: "العنوان", ar: true, en: true },
  { key: "email", label: "البريد", type: "text" },
  { key: "weeklySchedule", label: "الجدول", ar: true, en: true },
] as const;

test("تغطية الإعدادات: يكشف الحقل الذي له عربية بلا إنجليزية", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    jobTitle: { ar: "مدرس", en: "" },
    address: { ar: "القاهرة", en: "Cairo" },
  });

  assert.deepEqual(
    missing.map((field) => field.key),
    ["jobTitle"]
  );
});

test("تغطية الإعدادات: لا يعدّ الحقل ناقصًا إذا كانت الإنجليزية مسافات فقط", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    jobTitle: { ar: "مدرس", en: "   " },
  });

  assert.deepEqual(
    missing.map((field) => field.key),
    ["jobTitle"]
  );
});

test("تغطية الإعدادات: يتجاهل الحقل غير المترجم", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    email: { ar: "a@example.com", en: "" },
  });

  assert.deepEqual(missing, []);
});

test("تغطية الإعدادات: لا يعدّ الحقل ناقصًا إذا لم تكن له قيمة عربية", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    jobTitle: { ar: "", en: "Teacher" },
  });

  assert.deepEqual(missing, []);
});

test("تغطية الإعدادات: يتجاهل القيم النصية القديمة غير الملفوفة", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    jobTitle: "مدرس",
    weeklySchedule: "السبت | بعد العشاء",
  });

  assert.deepEqual(missing, []);
});

test("تغطية الإعدادات: يعيد الحقل كاملًا للحفاظ على النوع والخصائص", () => {
  const missing = findMissingEnglishFields(FIELDS, {
    weeklySchedule: { ar: "السبت | بعد العشاء", en: "" },
  });

  assert.equal(missing.length, 1);
  assert.equal(missing[0].key, "weeklySchedule");
  assert.equal(missing[0].label, "الجدول");
});
