// tests/questions-client.test.ts
// اختبار منطق عرض أسئلة المستخدم النقي.
import test from "node:test";
import assert from "node:assert/strict";

import {
  formatQuestionDate,
  normalizeQuestions,
  questionStatusKind,
} from "../lib/questions/client.ts";
import { isWebQuestionRequest } from "../lib/questions/web.ts";

test("normalizeQuestions: يطبّع الصفوف الصالحة ويتجاهل الناقصة", () => {
  const questions = normalizeQuestions([
    {
      id: 12,
      question: "  ما حكم صلاة الوتر؟  ",
      answer: "  ",
      status: "answered",
      created_at: "2026-10-23T10:00:00.000Z",
      answered_at: "2026-10-23T12:00:00.000Z",
    },
    { id: "", question: "بلا معرّف" },
    { id: 3, question: "   " },
    null,
    ["ليست صفًا"],
  ]);

  assert.equal(questions.length, 1);
  assert.deepEqual(questions[0], {
    id: "12",
    question: "ما حكم صلاة الوتر؟",
    answer: null,
    status: "answered",
    createdAt: "2026-10-23T10:00:00.000Z",
    answeredAt: "2026-10-23T12:00:00.000Z",
  });
});

test("normalizeQuestions: يعيد مصفوفة فارغة للقيم غير الصالحة", () => {
  assert.deepEqual(normalizeQuestions(null), []);
  assert.deepEqual(normalizeQuestions({ questions: [] }), []);
});

test("normalizeQuestions: الحالة الافتراضية pending", () => {
  const [question] = normalizeQuestions([{ id: "1", question: "سؤال" }]);

  assert.equal(question.status, "pending");
  assert.equal(question.answer, null);
  assert.equal(question.createdAt, null);
});

test("questionStatusKind: يصنّف الإجابة والانتظار والإغلاق", () => {
  assert.equal(questionStatusKind("answered"), "answered");
  assert.equal(questionStatusKind("pending"), "pending");
  assert.equal(questionStatusKind("in_progress"), "pending");
  assert.equal(questionStatusKind("waiting"), "pending");
  assert.equal(questionStatusKind("rejected"), "closed");
  assert.equal(questionStatusKind(""), "closed");
});

test("formatQuestionDate: يتجاهل التاريخ الفارغ أو الفاسد", () => {
  assert.equal(formatQuestionDate(null, "ar"), "");
  assert.equal(formatQuestionDate("not-a-date", "en"), "");
});

test("formatQuestionDate: ينسّق التاريخ الصالح باللغتين", () => {
  const ar = formatQuestionDate("2026-10-23T10:00:00.000Z", "ar");
  const en = formatQuestionDate("2026-10-23T10:00:00.000Z", "en");

  assert.ok(ar.length > 0);
  assert.ok(en.length > 0);
  assert.notEqual(ar, en);
});

test("isWebQuestionRequest: يقبل true المنطقية فقط", () => {
  assert.equal(isWebQuestionRequest({ web: true }), true);
  assert.equal(isWebQuestionRequest({ web: "true" }), false);
  assert.equal(isWebQuestionRequest({ web: 1 }), false);
  assert.equal(isWebQuestionRequest({}), false);
  assert.equal(isWebQuestionRequest(null), false);
});
