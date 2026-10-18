import type { Lang } from '@/lib/i18n';

export type JourneyLocalized = { ar: string; en: string };

export type DawahJourneyDay = {
  subject: JourneyLocalized;
  body: JourneyLocalized;
  href: string;
};

export type DawahJourneyConfig = {
  enabled: boolean;
  intervalHours: number;
  days: DawahJourneyDay[];
};

export const DEFAULT_DAWAH_JOURNEY_DAYS: DawahJourneyDay[] = [
  {
    subject: { ar: 'رحلتك الأولى: ابدأ بهدوء', en: 'Your first step: begin gently' },
    body: {
      ar: 'هذه بداية قصيرة للتعرّف على الإسلام وأسئلته الكبرى. خذ وقتك واقرأ من الصفحة التمهيدية ثم اختر ما يناسبك.',
      en: 'This is a short beginning for learning about Islam and its big questions. Take your time, start with the introduction, and choose what fits you.',
    },
    href: '/dawah',
  },
  {
    subject: { ar: 'اليوم الثاني: كيف تتعلم؟', en: 'Day two: how to learn' },
    body: {
      ar: 'التعلم الهادئ يبدأ بسؤال واضح ومصدر يمكن التحقق منه. استكشف دليل الحوار والدعوة، ثم دوّن ما تريد أن تسأل عنه.',
      en: 'Calm learning begins with a clear question and a source you can check. Explore the dialogue and dawah guide, then note what you would like to ask.',
    },
    href: '/dawah-guide',
  },
  {
    subject: { ar: 'اليوم الثالث: اقرأ بنفسك', en: 'Day three: read for yourself' },
    body: {
      ar: 'يمكنك الانتقال إلى المصحف وقراءة ما يناسبك، مع الرجوع إلى الترجمة والشرح الميسر المتاحين في الصفحة.',
      en: 'You can open the Quran and read at your own pace, using the translation and accessible explanations available on the page.',
    },
    href: '/quran',
  },
  {
    subject: { ar: 'اليوم الرابع: اسأل دون حرج', en: 'Day four: ask without pressure' },
    body: {
      ar: 'الأسئلة الصادقة جزء من رحلة الفهم. اكتب سؤالك بوضوح، وسيتعامل معه فريق التواصل باحترام وخصوصية.',
      en: 'Honest questions are part of understanding. Write your question clearly, and the support team will handle it respectfully and privately.',
    },
    href: '/contact',
  },
  {
    subject: { ar: 'اليوم الخامس: تعرّف على المقارنة المنصفة', en: 'Day five: fair comparison' },
    body: {
      ar: 'في قسم الأديان والفكر نوضح منهج المقارنة ومتى تكون المعلومة قابلة للتحقق، مع احترام الأشخاص وعدم التعميم.',
      en: 'The Religions & Thought section explains a fair comparison method, how claims can be checked, and why people should not be generalized about.',
    },
    href: '/religions/methodology',
  },
  {
    subject: { ar: 'اليوم السادس: أسئلة متكررة', en: 'Day six: common questions' },
    body: {
      ar: 'استكشف الأسئلة الشائعة والمواد المنشورة، وتذكّر أن الإجابة العامة لا تغني عن السؤال المتخصص عند الحاجة.',
      en: 'Explore common questions and published material. Remember that general information does not replace specialist guidance when it is needed.',
    },
    href: '/religions/resources/questions',
  },
  {
    subject: { ar: 'اليوم السابع: اختر خطوتك التالية', en: 'Day seven: choose your next step' },
    body: {
      ar: 'انتهت الرحلة البريدية القصيرة، لكن التعلم مستمر. يمكنك متابعة القراءة أو التواصل أو زيارة دليل المسلم الجديد.',
      en: 'This short email journey is complete, but learning continues. Keep reading, contact us, or visit the new Muslim guide.',
    },
    href: '/embrace-islam',
  },
];

export const DEFAULT_DAWAH_JOURNEY_CONFIG: DawahJourneyConfig = {
  enabled: false,
  intervalHours: 24,
  days: DEFAULT_DAWAH_JOURNEY_DAYS,
};

function cleanText(value: unknown, fallback: string, max = 6000): string {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim().slice(0, max) || fallback;
}

function cleanLocalized(value: unknown, fallback: JourneyLocalized): JourneyLocalized {
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    ar: cleanText(record.ar, fallback.ar),
    en: cleanText(record.en, fallback.en),
  };
}

export function normalizeDawahJourneyConfig(raw: unknown): DawahJourneyConfig {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
  const interval = Number(source.intervalHours);
  const rawDays = Array.isArray(source.days) ? source.days : [];
  const days = DEFAULT_DAWAH_JOURNEY_DAYS.map((fallback, index) => {
    const sourceDay = rawDays[index] && typeof rawDays[index] === 'object'
      ? rawDays[index] as Record<string, unknown>
      : {};
    const rawHref = cleanText(sourceDay.href, fallback.href, 200);
    return {
      subject: cleanLocalized(sourceDay.subject, fallback.subject),
      body: cleanLocalized(sourceDay.body, fallback.body),
      href: rawHref.startsWith('/') ? rawHref : fallback.href,
    };
  });

  return {
    enabled: source.enabled === true,
    intervalHours: Number.isFinite(interval) ? Math.min(Math.max(Math.trunc(interval), 1), 168) : 24,
    days,
  };
}

export function journeyText(value: JourneyLocalized, lang: Lang): string {
  return value[lang] || value.ar;
}
