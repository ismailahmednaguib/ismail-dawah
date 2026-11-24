import type { Lang } from '@/lib/i18n';

export type NewMuslimJourneyLocalized = { ar: string; en: string };
export type NewMuslimJourneyDay = { subject: NewMuslimJourneyLocalized; body: NewMuslimJourneyLocalized; href: string };
export type NewMuslimJourneyConfig = { enabled: boolean; intervalHours: number; days: NewMuslimJourneyDay[] };

const day = (arSubject: string, enSubject: string, arBody: string, enBody: string, href = '/embrace-islam#first-30-days'): NewMuslimJourneyDay => ({
  subject: { ar: arSubject, en: enSubject }, body: { ar: arBody, en: enBody }, href,
});

/** خمسة عشر بريدًا بفاصل افتراضي 48 ساعة تغطي أول ثلاثين يومًا. */
export const DEFAULT_NEW_MUSLIM_JOURNEY_DAYS: NewMuslimJourneyDay[] = [
  day('ابدأ بهدوء', 'Begin gently', 'خذ أول خطوة دون ضغط: تعلّم معنى الشهادتين، واحفظ وقتًا للسؤال والراحة.', 'Take your first step without pressure: learn the meaning of the Shahadah and leave room for questions and rest.'),
  day('الطهارة والصلاة', 'Purification and prayer', 'ابدأ بتعلم الوضوء والصلاة من دليل موثوق، واطلب المساعدة العملية من مسجد أو شخص موثوق.', 'Begin learning wudu and prayer from a reliable guide, and seek practical help from a trusted mosque or person.', '/prayer-guide'),
  day('الفاتحة أولًا', 'Start with Al-Fatihah', 'تعلّم الفاتحة بالتدريج، واستمع إلى قارئ متقن، ولا تجعل النطق الكامل شرطًا للاستمرار.', 'Learn Al-Fatihah gradually, listen to a careful reciter, and do not let imperfect pronunciation stop your progress.', '/quran/1'),
  day('أركان الإسلام', 'The pillars of Islam', 'تعرّف على أركان الإسلام الخمسة، وركّز على ما تحتاجه اليوم بدل جمع معلومات كثيرة دفعة واحدة.', 'Learn the five pillars of Islam and focus on what you need today instead of collecting too much information at once.'),
  day('أركان الإيمان', 'The pillars of faith', 'راجع أركان الإيمان باختصار، واسأل عن أي معنى أشكل عليك من مصدر معتمد.', 'Review the pillars of faith briefly and ask about anything unclear using a trusted source.'),
  day('ورد قصير من القرآن', 'A short Quran habit', 'اجعل لك وردًا قليلًا ثابتًا، واقرأ المعنى من ترجمة موثوقة دون استعجال الختم.', 'Build a small consistent Quran habit and read a reliable translation without rushing to finish.'),
  day('الذكر والدعاء', 'Remembrance and supplication', 'تعلّم أذكارًا صحيحة قليلة، وابتعد عن النصوص غير المنسوبة أو الوعود المبالغ فيها.', 'Learn a few sourced adhkar and avoid unattributed texts or exaggerated promises.', '/adhkar'),
  day('الجماعة والدعم', 'Community and support', 'ابحث عن مجتمع آمن يحترمك، ولا ترسل بيانات حساسة لأي جهة قبل التحقق منها.', 'Find a safe community that respects you, and do not send sensitive information before verifying an organization.'),
  day('الأخلاق اليومية', 'Daily character', 'اختر خلقًا واحدًا تطبقه مع أهلك وزملائك؛ العبادة تظهر في الصدق والرحمة وحفظ الحقوق.', 'Choose one character trait to practice with family and colleagues; worship appears in honesty, mercy, and respecting rights.'),
  day('كيف تتعلم الفقه؟', 'How to learn fiqh', 'تعلم الحكم الذي تحتاجه من مصدر واضح، ولا تجعل نتائج البحث السريع فتوى شخصية لك.', 'Learn the ruling you need from a clear source, and do not treat a quick search as a personal fatwa.'),
  day('الأسئلة والخلاف', 'Questions and legitimate differences', 'وجود خلاف معتبر لا يعني ضياع الدين؛ اذكر السؤال والسياق، وارجع إلى أهل العلم في المسائل الخاصة.', 'Legitimate disagreement does not mean the religion is unclear; give context and consult qualified scholars for personal matters.'),
  day('الأسرة والسلامة', 'Family and safety', 'احفظ سلامتك وخصوصيتك. لا تعلن قرارك بطريقة تعرضك للضرر، واستعن بشخص موثوق عند الحاجة.', 'Protect your safety and privacy. Do not disclose your decision in a way that puts you at risk; seek trusted help when needed.'),
  day('ثبّت ما تعلمت', 'Consolidate what you learned', 'اكتب ما تعلمته وما تحتاج إلى مراجعته، واجعل التعلم قليلًا مستمرًا بدل دفعات مرهقة.', 'Write down what you learned and what needs review; prefer a small sustainable routine to exhausting bursts.'),
  day('اسأل سؤالًا واضحًا', 'Ask one clear question', 'اجمع أسئلتك، وأرسل سؤالًا عامًا واضحًا دون أسماء أو تفاصيل حساسة إلى فريق التواصل عند الحاجة.', 'Gather your questions and send one clear general question without names or sensitive details when needed.', '/dawah/ask-muslim'),
  day('بعد أول ثلاثين يومًا', 'After the first thirty days', 'استمر في الصلاة والقرآن والتعلم، واختر مسارًا يناسبك، ولا تتوقع الكمال في يوم واحد.', 'Continue with prayer, Quran, and learning. Choose a path that fits you and do not expect perfection in one day.', '/learn'),
];

export const DEFAULT_NEW_MUSLIM_JOURNEY_CONFIG: NewMuslimJourneyConfig = { enabled: false, intervalHours: 48, days: DEFAULT_NEW_MUSLIM_JOURNEY_DAYS };

function cleanText(value: unknown, fallback: string, max = 6_000): string {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max) || fallback;
}

function localized(value: unknown, fallback: NewMuslimJourneyLocalized): NewMuslimJourneyLocalized {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return { ar: cleanText(record.ar, fallback.ar), en: cleanText(record.en, fallback.en) };
}

export function normalizeNewMuslimJourneyConfig(raw: unknown): NewMuslimJourneyConfig {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const interval = Number(source.intervalHours);
  const rawDays = Array.isArray(source.days) ? source.days : [];
  const days = DEFAULT_NEW_MUSLIM_JOURNEY_DAYS.map((fallback, index) => {
    const item = rawDays[index] && typeof rawDays[index] === 'object' ? rawDays[index] as Record<string, unknown> : {};
    const href = cleanText(item.href, fallback.href, 200);
    return { subject: localized(item.subject, fallback.subject), body: localized(item.body, fallback.body), href: href.startsWith('/') ? href : fallback.href };
  });
  return { enabled: source.enabled === true, intervalHours: Number.isFinite(interval) ? Math.min(Math.max(Math.trunc(interval), 24), 168) : 48, days };
}

export function newMuslimJourneyText(value: NewMuslimJourneyLocalized, lang: Lang): string { return value[lang] || ''; }
