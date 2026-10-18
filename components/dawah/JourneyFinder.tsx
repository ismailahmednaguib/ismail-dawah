"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Choice = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type Props = {
  lang: Lang;
};

const COPY = {
  ar: {
    question: "ما الذي تبحث عنه الآن؟",
    question2: "كيف تفضّل أن تبدأ؟",
    step: "الخطوة",
    of: "من",
    next: "التالي",
    back: "السابق",
    result: "المسار المقترح لك",
    open: "ابدأ المسار",
    restart: "أعد الاختبار",
    resultDescription: "هذا اقتراح أولي، ويمكنك الانتقال إلى أي قسم آخر في أي وقت.",
  },
  en: {
    question: "What are you looking for today?",
    question2: "How would you like to begin?",
    step: "Step",
    of: "of",
    next: "Continue",
    back: "Back",
    result: "Your suggested path",
    open: "Start this path",
    restart: "Start again",
    resultDescription: "This is a gentle starting suggestion. You can explore any other section at any time.",
  },
} as const;

const OPTIONS = {
  ar: {
    focus: [
      { id: "discover", icon: "🌙", title: "أريد التعرف على الإسلام", description: "مدخل هادئ ومختصر إلى الإسلام ورسالة الأنبياء." },
      { id: "questions", icon: "❓", title: "لدي أسئلة أو مقارنات", description: "مواد موثقة للحوار والأسئلة الفكرية والدينية." },
      { id: "atheism", icon: "💡", title: "أبحث عن إجابات فكرية", description: "أسئلة الوجود والمعنى والأخلاق والإلحاد." },
      { id: "new-muslim", icon: "🤲", title: "أنا مسلم جديد", description: "خطوات عملية للبدء بثبات وطمأنينة." },
    ],
    format: [
      { id: "short", icon: "⚡", title: "أريد بداية قصيرة", description: "صفحة تمهيدية وأهم الروابط فقط." },
      { id: "deep", icon: "📚", title: "أريد القراءة بتوسع", description: "مكتبة موضوعية ومواد مترابطة للتعمق." },
      { id: "daee", icon: "💬", title: "أفضل الحوار مع شخص", description: "إرسال سؤال إلى فريق التواصل والدعوة." },
    ],
  },
  en: {
    focus: [
      { id: "discover", icon: "🌙", title: "I want to learn about Islam", description: "A calm introduction to Islam and the message of the prophets." },
      { id: "questions", icon: "❓", title: "I have questions or comparisons", description: "Sourced material for religious and intellectual dialogue." },
      { id: "atheism", icon: "💡", title: "I am exploring big questions", description: "Questions of existence, meaning, ethics, and atheism." },
      { id: "new-muslim", icon: "🤲", title: "I am a new Muslim", description: "Practical first steps with clarity and confidence." },
    ],
    format: [
      { id: "short", icon: "⚡", title: "I want a short start", description: "One introduction page and the most useful links." },
      { id: "deep", icon: "📚", title: "I want to read in depth", description: "A topic library with connected, sourced material." },
      { id: "daee", icon: "💬", title: "I would rather speak to someone", description: "Send a question to the dawah and support team." },
    ],
  },
} as const;

const PATHS = {
  discover: { href: "/dawah", ar: "بوابة التعريف بالإسلام", en: "Introduction to Islam" },
  questions: { href: "/religions/resources/questions", ar: "أسئلة غير المسلمين", en: "Questions from non-Muslims" },
  atheism: { href: "/religions/atheism", ar: "الأديان والفكر: الإلحاد", en: "Religions & Thought: Atheism" },
  "new-muslim": { href: "/embrace-islam", ar: "دليل المسلم الجديد", en: "New Muslim guide" },
} as const;

export default function JourneyFinder({ lang }: Props) {
  const copy = COPY[lang];
  const options = OPTIONS[lang];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  const destination = useMemo(() => {
    if (format === "daee") return { href: "/contact", ar: "التواصل مع داعية", en: "Talk to a daee" };
    if (!focus) return null;
    return PATHS[focus as keyof typeof PATHS];
  }, [focus, format]);

  const selected = step === 1 ? focus : format;
  const choose = (id: string) => {
    if (step === 1) setFocus(id);
    else setFormat(id);
  };

  return (
    <div className="card p-5 md:p-8">
      {step < 3 ? (
        <>
          <div className="mb-6 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{copy.step} {step} {copy.of} 2</span>
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2].map((item) => <span key={item} className={`h-2 w-8 rounded-full ${item <= step ? "bg-gold-500" : "bg-primary-100 dark:bg-night-700"}`} />)}
            </div>
          </div>
          <h2 className="text-2xl font-black text-primary-950 dark:text-white">{step === 1 ? copy.question : copy.question2}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(step === 1 ? options.focus : options.format).map((option: Choice) => (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                className={`rounded-2xl border p-4 text-start transition-colors ${selected === option.id ? "border-gold-500 bg-gold-50 dark:bg-gold-950/20" : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 dark:border-night-700 dark:bg-night-800 dark:hover:border-primary-500"}`}
                aria-pressed={selected === option.id}
              >
                <span className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                  <span>
                    <strong className="block text-base text-primary-950 dark:text-white">{option.title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{option.description}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {step === 2 && <button type="button" onClick={() => setStep(1)} className="btn-outline">{copy.back}</button>}
            <button type="button" onClick={() => setStep(step === 1 ? 2 : 3)} disabled={!selected} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{copy.next}</button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-3xl dark:bg-primary-900/40" aria-hidden="true">🧭</span>
          <h2 className="mt-5 text-2xl font-black text-primary-950 dark:text-white">{copy.result}</h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600 dark:text-slate-300">{copy.resultDescription}</p>
          {destination && <Link href={`/${lang}${destination.href}`} className="btn-primary mt-6 inline-flex">{lang === "ar" ? destination.ar : destination.en} ←</Link>}
          <div className="mt-4"><button type="button" onClick={() => { setStep(1); setFocus(null); setFormat(null); }} className="btn-outline">{copy.restart}</button></div>
        </div>
      )}
    </div>
  );
}
