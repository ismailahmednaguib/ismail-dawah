import type { Lang } from '@/lib/i18n';

export type LocalizedText = { ar: string; en: string };

export type ReligionEntry = {
  slug: string;
  icon: string;
  kind: 'religion' | 'thought';
  title: LocalizedText;
  summary: LocalizedText;
  scope: LocalizedText;
};

/**
 * فهرس القسم فقط. لا يحتوي على أحكام أو اقتباسات دينية؛ المادة العلمية
 * الفعلية تُنشر من لوحة التحكم بعد إضافة مصادرها ومراجعتها.
 */
export const RELIGION_ENTRIES: ReligionEntry[] = [
  {
    slug: 'christianity',
    icon: '✝',
    kind: 'religion',
    title: { ar: 'النصرانية', en: 'Christianity' },
    summary: {
      ar: 'مساحة تعريفية لدراسة النشأة والمصادر والمذاهب والأسئلة المشتركة باحترام وإنصاف.',
      en: 'A respectful, sourced space for studying origins, sources, denominations, and shared questions.',
    },
    scope: {
      ar: 'النشأة · المصادر · الطوائف · نقاط التلاقي والاختلاف',
      en: 'Origins · sources · denominations · areas of agreement and difference',
    },
  },
  {
    slug: 'judaism',
    icon: '✡',
    kind: 'religion',
    title: { ar: 'اليهودية', en: 'Judaism' },
    summary: {
      ar: 'مدخل منظم إلى دراسة اليهودية من مصادرها مع التفريق بين نقد الفكرة واحترام الإنسان.',
      en: 'An organized introduction that distinguishes critique of ideas from respect for people.',
    },
    scope: {
      ar: 'التاريخ · النصوص · الاتجاهات · الحوار المشترك',
      en: 'History · texts · traditions · shared dialogue',
    },
  },
  {
    slug: 'hinduism',
    icon: 'ॐ',
    kind: 'religion',
    title: { ar: 'الهندوسية', en: 'Hinduism' },
    summary: {
      ar: 'مواد تمهيدية موثقة تساعد على فهم التنوع الداخلي والأسئلة الفلسفية المرتبطة بها.',
      en: 'Sourced introductory material that respects internal diversity and related philosophical questions.',
    },
    scope: {
      ar: 'التنوع الداخلي · النصوص · المفاهيم · المقارنة',
      en: 'Internal diversity · texts · concepts · comparison',
    },
  },
  {
    slug: 'buddhism',
    icon: '☸',
    kind: 'religion',
    title: { ar: 'البوذية', en: 'Buddhism' },
    summary: {
      ar: 'تعريف هادئ بالمصطلحات والمدارس والأسئلة الأخلاقية دون تعميم أو اختزال.',
      en: 'A calm introduction to terminology, schools, and ethical questions without overgeneralization.',
    },
    scope: {
      ar: 'النشأة · المدارس · الممارسات · الأسئلة الأخلاقية',
      en: 'Origins · schools · practices · ethical questions',
    },
  },
  {
    slug: 'atheism',
    icon: '✦',
    kind: 'thought',
    title: { ar: 'الإلحاد واللاأدرية', en: 'Atheism & Agnosticism' },
    summary: {
      ar: 'مناقشة الأسئلة الفلسفية الكبرى: الوجود، الشر، الأخلاق، والمعنى، بلغة هادئة ومصادر واضحة.',
      en: 'A calm, sourced discussion of existence, evil, ethics, and meaning.',
    },
    scope: {
      ar: 'الوجود · الشر · الأخلاق · المعنى · حدود المعرفة',
      en: 'Existence · evil · ethics · meaning · limits of knowledge',
    },
  },
];

export const RELIGION_RESOURCES: Array<{
  slug: string;
  icon: string;
  title: LocalizedText;
  summary: LocalizedText;
}> = [
  {
    slug: 'previous-books',
    icon: '▣',
    title: { ar: 'الإسلام في الكتب السابقة', en: 'Islam in Earlier Scriptures' },
    summary: {
      ar: 'دراسة النصوص والبشارات المنسوبة إلى الكتب السابقة مع توثيق النص وسياقه ودرجة الاستدلال.',
      en: 'A careful study of cited texts, context, and the strength of each argument.',
    },
  },
  {
    slug: 'questions',
    icon: '?',
    title: { ar: 'أسئلة غير المسلمين الشائعة', en: 'Common Questions from Non-Muslims' },
    summary: {
      ar: 'إجابات موثقة وهادئة عن الأسئلة المتكررة حول المرأة والجهاد والحرية والعلم والعنف.',
      en: 'Sourced, calm answers about women, jihad, freedom, science, and violence.',
    },
  },
  {
    slug: 'stories',
    icon: '↔',
    title: { ar: 'قصص المهتدين', en: 'Stories of Converts' },
    summary: {
      ar: 'قصص تُنشر بعد موافقة أصحابها الصريحة، مع حماية الخصوصية وعدم عرض بيانات حساسة.',
      en: 'Stories published only with explicit consent, protecting privacy and sensitive details.',
    },
  },
];

export const METHODOLOGY_POINTS: LocalizedText[] = [
  { ar: 'عرض كل دين من مصادره هو، لا من خصومه فقط.', en: 'Present each religion through its own sources, not only its opponents.' },
  { ar: 'توثيق كل معلومة بمصدر قابل للتحقق قبل النشر.', en: 'Cite every claim with a source that readers can verify.' },
  { ar: 'مناقشة المعتقدات والأفكار دون سخرية أو تعميم على الأتباع.', en: 'Discuss beliefs and ideas without ridicule or generalizing about followers.' },
  { ar: 'فصل الشخص عن الفكرة، واعتماد الحوار بالحسنى.', en: 'Separate the person from the idea and keep dialogue gracious.' },
  { ar: 'مراجعة شرعية ومراجعة متخصصة عند الإمكان قبل الاعتماد.', en: 'Use Islamic and subject-matter review before approval whenever possible.' },
];

export const COMPARISON_DIMENSIONS: LocalizedText[] = [
  { ar: 'التصور عن الإله والوجود', en: 'God and existence' },
  { ar: 'مصادر المعرفة والنصوص', en: 'Sources and scriptures' },
  { ar: 'النبوة والوحي', en: 'Prophethood and revelation' },
  { ar: 'الإنسان والأخلاق', en: 'Human nature and ethics' },
  { ar: 'المصير والمعنى', en: 'Destiny and meaning' },
];

export function localized(value: LocalizedText, lang: Lang): string {
  return value[lang] || value.ar;
}

export function getReligionEntry(slug: string): ReligionEntry | undefined {
  return RELIGION_ENTRIES.find((entry) => entry.slug === slug);
}

export function getReligionResource(slug: string) {
  return RELIGION_RESOURCES.find((resource) => resource.slug === slug);
}
