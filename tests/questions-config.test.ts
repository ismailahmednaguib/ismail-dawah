// tests/questions-config.test.ts
// اختبار تطبيع إعداد «أسئلة المستخدمين» القابل للتحكم من اللوحة.
import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_QUESTIONS_CONFIG,
  normalizeQuestionsConfig,
} from "../lib/questions/config.ts";

test("normalizeQuestionsConfig: الافتراضي مفعّل للقيم الغائبة أو الفاسدة", () => {
  assert.deepEqual(normalizeQuestionsConfig(null), DEFAULT_QUESTIONS_CONFIG);
  assert.deepEqual(normalizeQuestionsConfig("false"), DEFAULT_QUESTIONS_CONFIG);
  assert.deepEqual(normalizeQuestionsConfig({ enabled: "false" }), DEFAULT_QUESTIONS_CONFIG);
});

test("normalizeQuestionsConfig: يحترم القيمة المنطقية صراحةً", () => {
  assert.deepEqual(normalizeQuestionsConfig({ enabled: false }), { enabled: false });
  assert.deepEqual(normalizeQuestionsConfig({ enabled: true }), { enabled: true });
});

test("normalizeQuestionsConfig: يتجاهل المصفوفات", () => {
  assert.deepEqual(normalizeQuestionsConfig([false]), DEFAULT_QUESTIONS_CONFIG);
});
