// lib/questions/client.ts
// منطق نقي لعرض أسئلة المستخدم: تطبيع استجابة API وتنسيق التواريخ والحالات.
// لا يستورد React ولا أي طبقة خادمية، لذلك يُختبر بمُشغّل Node مباشرة.

export type QuestionView = {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  createdAt: string | null;
  answeredAt: string | null;
};

export type QuestionStatusKind = "answered" | "pending" | "closed";

/** يطبّع مصفوفة الأسئلة القادمة من `/api/questions` ويتجاهل الصفوف الناقصة. */
export function normalizeQuestions(value: unknown): QuestionView[] {
  if (!Array.isArray(value)) return [];

  const questions: QuestionView[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const row = item as Record<string, unknown>;
    const id =
      typeof row.id === "string" || typeof row.id === "number"
        ? String(row.id).trim()
        : "";
    const question =
      typeof row.question === "string" ? row.question.trim() : "";

    if (!id || !question) continue;

    const answer =
      typeof row.answer === "string" && row.answer.trim()
        ? row.answer
        : null;
    const status =
      typeof row.status === "string" && row.status.trim()
        ? row.status.trim()
        : "pending";
    const createdAt =
      typeof row.created_at === "string" ? row.created_at : null;
    const answeredAt =
      typeof row.answered_at === "string" ? row.answered_at : null;

    questions.push({
      id,
      question,
      answer,
      status,
      createdAt,
      answeredAt,
    });
  }

  return questions;
}

/** يصنّف حالة السؤال إلى ثلاث فئات للعرض فقط. */
export function questionStatusKind(status: string): QuestionStatusKind {
  if (status === "answered") return "answered";
  if (
    status === "pending" ||
    status === "in_progress" ||
    status === "waiting"
  ) {
    return "pending";
  }
  return "closed";
}

/** ينسّق تاريخ ISO بلغة الواجهة، ويعيد نصًا فارغًا عند غياب التاريخ أو فساده. */
export function formatQuestionDate(
  value: string | null,
  lang: "ar" | "en"
): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return "";
  }
}
