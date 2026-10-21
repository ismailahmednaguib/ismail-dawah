'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_DAWAH_JOURNEY_CONFIG } from '@/lib/dawah-journey';
import { DEFAULT_ASSISTANT_CONFIG } from '@/lib/assistant-core';
import { DEFAULT_EMAIL_VERIFICATION_CONFIG } from '@/lib/email-verification-config';
import { DEFAULT_PASSWORD_RESET_CONFIG } from '@/lib/password-reset-config';
import { DEFAULT_PASSWORD_CHANGE_CONFIG } from '@/lib/password-change-config';
import EmailTestCard from '@/components/admin/EmailTestCard';

type SettingsRecord = Record<string, any>;
type Message = { type: 'success' | 'error'; text: string } | null;

const DEFAULT_SETTINGS: SettingsRecord = {
  ownerName: 'اكتشف الإسلام – Discover Islam',
  shortName: 'اكتشف الإسلام',
  jobTitle: '',
  motto: 'منصة دعوية شاملة',
  homeKicker: '',
  homeHeroText: '',
  homeTitle: { ar: 'اكتشف الإسلام – Discover Islam', en: 'Discover Islam' },
  homeSubtitle: { ar: '', en: '' },
  homeCta1: { ar: 'ابدأ رحلة العلم', en: 'Start Learning' },
  homeCta2: { ar: 'البث المباشر', en: 'Live Stream' },
  metaTitle: { ar: 'اكتشف الإسلام – Discover Islam', en: 'Discover Islam' },
  metaDescription: { ar: '', en: '' },
  bio: [],
  interests: [],
  portraitSrc: '',
  ogImage: '',
  email: '',
  wa: '',
  address: '',
  cred1: '',
  cred2: '',
  facebookUrl: '',
  youtubeUrl: '',
  telegramUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  liveUrl: '',
  meetingLink: '',
  liveTitle: { ar: '', en: '' },
  meetingDay: { ar: '', en: '' },
  meetingTime: { ar: '', en: '' },
  meetingPlace: { ar: '', en: '' },
  showPrayerBar: false,
  playStoreUrl: '',
  emailVerification: DEFAULT_EMAIL_VERIFICATION_CONFIG,
  passwordReset: DEFAULT_PASSWORD_RESET_CONFIG,
  passwordChange: DEFAULT_PASSWORD_CHANGE_CONFIG,
  publicApiEnabled: false,
  dawahJourney: DEFAULT_DAWAH_JOURNEY_CONFIG,
  assistant: DEFAULT_ASSISTANT_CONFIG,
};

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.ar === 'string') return record.ar;
    if (typeof record.en === 'string') return record.en;
  }
  return '';
}

function flag(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.ar === 'boolean') return record.ar;
    if (typeof record.en === 'boolean') return record.en;
  }
  return false;
}

function listText(value: unknown): string {
  return Array.isArray(value) ? value.filter(Boolean).join('\n') : text(value);
}

function listValue(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 100);
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  dir = 'rtl',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-primary-950">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="input-islamic w-full"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-primary-950">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="input-islamic w-full resize-y"
      />
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 border-b border-cream-100 pb-4">
        <h2 className="text-lg font-black text-primary-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function SiteSettingsClient() {
  const [settings, setSettings] = useState<SettingsRecord>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'تعذر تحميل الإعدادات.');

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data.settings && typeof data.settings === 'object' ? data.settings : {}),
      });
      setUpdatedAt(data.updatedAt ?? null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر تحميل الإعدادات.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = (key: string, value: unknown) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const setLocalized = (key: string, lang: 'ar' | 'en', value: string) => {
    setSettings((current) => {
      const existing = current[key];
      const base =
        existing && typeof existing === 'object' && !Array.isArray(existing)
          ? (existing as Record<string, unknown>)
          : existing
            ? { ar: String(existing), en: String(existing) }
            : {};

      return {
        ...current,
        [key]: { ...base, [lang]: value },
      };
    });
  };

  const setJourney = (patch: Record<string, unknown>) => {
    setSettings((current) => ({
      ...current,
      dawahJourney: {
        ...DEFAULT_DAWAH_JOURNEY_CONFIG,
        ...(current.dawahJourney && typeof current.dawahJourney === 'object' ? current.dawahJourney : {}),
        ...patch,
      },
    }));
  };

  const setJourneyDay = (index: number, field: 'subject' | 'body', lang: 'ar' | 'en', value: string) => {
    setSettings((current) => {
      const journey = current.dawahJourney && typeof current.dawahJourney === 'object'
        ? current.dawahJourney
        : DEFAULT_DAWAH_JOURNEY_CONFIG;
      const days = Array.isArray(journey.days) ? [...journey.days] : [...DEFAULT_DAWAH_JOURNEY_CONFIG.days];
      const day = days[index] && typeof days[index] === 'object' ? days[index] : DEFAULT_DAWAH_JOURNEY_CONFIG.days[index];
      days[index] = {
        ...day,
        [field]: {
          ...(day[field] && typeof day[field] === 'object' ? day[field] : {}),
          [lang]: value,
        },
      };
      return { ...current, dawahJourney: { ...journey, days } };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'تعذر حفظ الإعدادات.');

      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setMessage({ type: 'success', text: 'تم حفظ إعدادات المنصة بنجاح.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'تعذر حفظ الإعدادات.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-label="جارٍ تحميل الإعدادات">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-52 animate-pulse rounded-2xl bg-cream-100" />
        ))}
      </div>
    );
  }

  const brandName = text(settings.ownerName).trim();
  const metaTitleAr = text(settings.metaTitle?.ar).trim();
  const brandMismatch = Boolean(brandName && (!metaTitleAr || brandName !== metaTitleAr));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gold-700">Owner controls</span>
          <h1 className="mt-2 text-3xl font-black text-primary-950">إعدادات المنصة</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
            تحكم في هوية الموقع وبيانات التواصل ورسالة الصفحة الرئيسية والبث من مكان واحد.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt ? (
            <span className="hidden text-xs text-stone-500 sm:inline">
              آخر تحديث: {new Date(updatedAt).toLocaleString('ar-EG')}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-primary-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-primary-800 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? 'جارٍ الحفظ...' : 'حفظ كل الإعدادات'}
          </button>
        </div>
      </div>

      {message ? (
        <div className={`rounded-2xl border p-4 text-sm font-bold ${message.type === 'success' ? 'border-primary-200 bg-primary-50 text-primary-800' : 'border-red-200 bg-red-50 text-red-800'}`} role="status">
          {message.text}
        </div>
      ) : null}

      <Section title="الهوية والبيانات الأساسية" description="هذه البيانات تظهر في الهيدر والفوتر والصفحات التعريفية.">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="اسم المنصة (يظهر في الهيدر)" value={text(settings.ownerName)} onChange={(value) => setLocalized('ownerName', 'ar', value)} />
          <InputField label="الاسم المختصر" value={text(settings.shortName)} onChange={(value) => setLocalized('shortName', 'ar', value)} />
          <InputField label="المسمى أو الصفة" value={text(settings.jobTitle)} onChange={(value) => setLocalized('jobTitle', 'ar', value)} />
          <InputField label="الشعار المختصر" value={text(settings.motto)} onChange={(value) => setLocalized('motto', 'ar', value)} />
          <InputField label="رابط الصورة الشخصية" value={text(settings.portraitSrc)} onChange={(value) => setValue('portraitSrc', value)} dir="ltr" placeholder="https://..." />
          <InputField label="رابط صورة المشاركة" value={text(settings.ogImage)} onChange={(value) => setValue('ogImage', value)} dir="ltr" placeholder="https://..." />
        </div>
        {brandMismatch ? (
          <p className="mt-4 rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 text-sm leading-7 text-primary-950">
            {metaTitleAr ? (
              <>
                اسم المنصة في الهيدر («{brandName}») يختلف عن عنوان SEO العربي
                («{metaTitleAr}»). وحّدهما لتظهر الهوية نفسها في الهيدر ومحركات البحث.
              </>
            ) : (
              <>
                لم تحدد عنوان SEO عربيًّا؛ سيستخدم الموقع العنوان الافتراضي، وقد يختلف عن
                اسم الهيدر («{brandName}»). أضف عنوان SEO موحّدًا من قسم «تحسين الظهور
                والمشاركة».
              </>
            )}
          </p>
        ) : null}
      </Section>

      <Section title="الصفحة الرئيسية" description="تحكم في الرسالة التي يراها الزائر أولًا.">
        <div className="space-y-4">
          <InputField label="العنوان التمهيدي" value={text(settings.homeKicker)} onChange={(value) => setLocalized('homeKicker', 'ar', value)} />
          <TextareaField label="النص الرئيسي" value={text(settings.homeHeroText)} onChange={(value) => setLocalized('homeHeroText', 'ar', value)} rows={5} />
          {[
            ['homeTitle', 'عنوان الصفحة الرئيسية'],
            ['homeSubtitle', 'وصف الصفحة الرئيسية'],
            ['homeCta1', 'زر الدعوة الأول'],
            ['homeCta2', 'زر الدعوة الثاني'],
          ].map(([key, label]) => (
            <div key={key} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
              <p className="mb-3 text-sm font-black text-primary-950">{label}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextareaField label="العربية" value={text(settings[key]?.ar)} onChange={(value) => setLocalized(key, 'ar', value)} rows={key === 'homeSubtitle' ? 3 : 2} />
                <TextareaField label="English" value={text(settings[key]?.en)} onChange={(value) => setLocalized(key, 'en', value)} rows={key === 'homeSubtitle' ? 3 : 2} />
              </div>
            </div>
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <TextareaField label="نبذة تعريفية — كل سطر نقطة" value={listText(settings.bio)} onChange={(value) => setValue('bio', listValue(value))} />
            <TextareaField label="الاهتمامات — كل سطر نقطة" value={listText(settings.interests)} onChange={(value) => setValue('interests', listValue(value))} />
          </div>
        </div>
      </Section>

      <Section title="تحسين الظهور والمشاركة" description="تحكم في عنوان ووصف الموقع عند ظهورهما في محركات البحث ووسائل المشاركة.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['metaTitle', 'عنوان SEO'],
            ['metaDescription', 'وصف SEO'],
          ].map(([key, label]) => (
            <div key={key} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
              <p className="mb-3 text-sm font-black text-primary-950">{label}</p>
              <div className="space-y-3">
                <TextareaField label="العربية" value={text(settings[key]?.ar)} onChange={(value) => setLocalized(key, 'ar', value)} rows={3} />
                <TextareaField label="English" value={text(settings[key]?.en)} onChange={(value) => setLocalized(key, 'en', value)} rows={3} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="التواصل والاعتمادات" description="بيانات التواصل والعبارات التعريفية الخاصة بصاحب المنصة.">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="البريد الإلكتروني" value={text(settings.email)} onChange={(value) => setValue('email', value)} dir="ltr" />
          <InputField label="واتساب أو هاتف" value={text(settings.wa)} onChange={(value) => setValue('wa', value)} dir="ltr" />
          <InputField label="العنوان" value={text(settings.address)} onChange={(value) => setLocalized('address', 'ar', value)} />
          <InputField label="اعتماد أو مؤهل أول" value={text(settings.cred1)} onChange={(value) => setLocalized('cred1', 'ar', value)} />
          <InputField label="اعتماد أو مؤهل ثانٍ" value={text(settings.cred2)} onChange={(value) => setLocalized('cred2', 'ar', value)} />
        </div>
      </Section>

      <Section title="روابط التواصل الاجتماعي" description="ضع الروابط الكاملة للحسابات التي تريد إظهارها في الموقع.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['facebookUrl', 'Facebook'],
            ['youtubeUrl', 'YouTube'],
            ['telegramUrl', 'Telegram'],
            ['twitterUrl', 'X / Twitter'],
            ['instagramUrl', 'Instagram'],
          ].map(([key, label]) => (
            <InputField key={key} label={label} value={text(settings[key])} onChange={(value) => setValue(key, value)} dir="ltr" placeholder="https://..." />
          ))}
        </div>
      </Section>

      <Section title="البث والمجلس" description="إعدادات صفحة البث والمواعيد، بالعربية والإنجليزية.">
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="رابط البث" value={text(settings.liveUrl)} onChange={(value) => setValue('liveUrl', value)} dir="ltr" placeholder="https://..." />
          <InputField label="رابط المجلس" value={text(settings.meetingLink)} onChange={(value) => setValue('meetingLink', value)} dir="ltr" placeholder="https://..." />
          {[
            ['liveTitle', 'عنوان البث'],
            ['meetingDay', 'يوم المجلس'],
            ['meetingTime', 'وقت المجلس'],
            ['meetingPlace', 'مكان المجلس'],
          ].map(([key, label]) => (
            <div key={key} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
              <p className="mb-3 text-sm font-black text-primary-950">{label}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="العربية" value={text(settings[key]?.ar)} onChange={(value) => setLocalized(key, 'ar', value)} />
                <InputField label="English" value={text(settings[key]?.en)} onChange={(value) => setLocalized(key, 'en', value)} dir="ltr" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="التطبيق والتوزيع" description="رابط صفحة التطبيق في Google Play. يُقبل رابط https الرسمي فقط، ويُعرض تلقائيًا في صفحة التحميل بدل الاعتماد على ملف APK وحده.">
        <InputField
          label="رابط Google Play"
          value={text(settings.playStoreUrl)}
          onChange={(value) => setValue('playStoreUrl', value)}
          dir="ltr"
          placeholder="https://play.google.com/store/apps/details?id=..."
        />
        <p className="mt-2 text-xs leading-6 text-stone-500">
          اتركه فارغًا حتى نشر التطبيق. عند إضافته سيظهر زر المتجر أولًا، ويبقى ملف APK متاحًا كخيار ثانوي.
        </p>
      </Section>

      <Section title="تفعيل البريد الإلكتروني" description="عند التفعيل يُرسل رابط تأكيد للحسابات الجديدة. الحسابات الحالية تبقى مفعّلة، ولا يُمنع أحد من الدخول. يتطلب ضبط SMTP_HOST و SMTP_USER و SMTP_PASS، أو RESEND_API_KEY و EMAIL_FROM في بيئة الخادم.">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
          <input
            type="checkbox"
            checked={Boolean(settings.emailVerification?.enabled ?? DEFAULT_EMAIL_VERIFICATION_CONFIG.enabled)}
            onChange={(event) => setValue('emailVerification', { enabled: event.target.checked })}
            className="mt-1 h-4 w-4 accent-primary-700"
          />
          <span>
            <span className="block text-sm font-black text-primary-950">إرسال رابط التفعيل للحسابات الجديدة</span>
            <span className="mt-1 block text-xs leading-6 text-stone-500">
              إن لم يكن مزوّد البريد مضبوطًا، يبقى الحساب مفعّلًا تلقائيًا ولا يُقفل. يمكن للمستخدم إعادة إرسال الرابط من صفحة حسابه.
            </span>
          </span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
          <input
            type="checkbox"
            checked={Boolean(settings.passwordReset?.enabled ?? DEFAULT_PASSWORD_RESET_CONFIG.enabled)}
            onChange={(event) => setValue('passwordReset', { enabled: event.target.checked })}
            className="mt-1 h-4 w-4 accent-primary-700"
          />
          <span>
            <span className="block text-sm font-black text-primary-950">السماح باستعادة كلمة المرور عبر البريد</span>
            <span className="mt-1 block text-xs leading-6 text-stone-500">
              يظهر رابط «نسيت كلمة المرور؟» في صفحة الدخول، ويُرسل رابط صالح ساعة واحدة. تعطيله لا يحذف كلمات المرور ولا يمنع الدخول الحالي.
            </span>
          </span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
          <input
            type="checkbox"
            checked={Boolean(settings.passwordChange?.enabled ?? DEFAULT_PASSWORD_CHANGE_CONFIG.enabled)}
            onChange={(event) => setValue('passwordChange', { enabled: event.target.checked })}
            className="mt-1 h-4 w-4 accent-primary-700"
          />
          <span>
            <span className="block text-sm font-black text-primary-950">السماح بتغيير كلمة المرور من صفحة الحساب</span>
            <span className="mt-1 block text-xs leading-6 text-stone-500">
              يعرض بطاقة «تغيير كلمة المرور» للمستخدم المسجّل بعد التحقق من كلمة المرور الحالية. تعطيله لا يمنع استعادة كلمة المرور عبر البريد.
            </span>
          </span>
        </label>
      </Section>

      <EmailTestCard />

      <Section title="رحلة غير المسلم البريدية" description="فعّل رحلة اختيارية من سبعة أيام وعدّل رسائلها. لن تُرسل أي رسالة ما لم تفعّلها وتضبط مزود البريد في بيئة الخادم.">
        <div className="space-y-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
            <input
              type="checkbox"
              checked={Boolean(settings.dawahJourney?.enabled)}
              onChange={(event) => setJourney({ enabled: event.target.checked })}
              className="mt-1 h-4 w-4 accent-primary-700"
            />
            <span>
              <span className="block text-sm font-black text-primary-950">تفعيل الاشتراك في الرحلة</span>
              <span className="mt-1 block text-xs leading-6 text-stone-500">يظهر النموذج في «اختبر مسارك الدعوي» فقط عند التفعيل.</span>
            </span>
          </label>
          <InputField
            label="الفاصل بين الرسائل بالساعات"
            value={String(settings.dawahJourney?.intervalHours ?? 24)}
            onChange={(value) => setJourney({ intervalHours: Math.max(1, Math.min(168, Number(value) || 24)) })}
            dir="ltr"
          />
          <div className="space-y-4">
            {DEFAULT_DAWAH_JOURNEY_CONFIG.days.map((day, index) => (
              <div key={day.href + index} className="rounded-xl border border-cream-200 bg-cream-50 p-4">
                <p className="mb-3 text-sm font-black text-primary-950">اليوم {index + 1}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextareaField label="موضوع الرسالة — العربية" value={text(settings.dawahJourney?.days?.[index]?.subject?.ar) || day.subject.ar} onChange={(value) => setJourneyDay(index, 'subject', 'ar', value)} rows={2} />
                  <TextareaField label="Subject — English" value={text(settings.dawahJourney?.days?.[index]?.subject?.en) || day.subject.en} onChange={(value) => setJourneyDay(index, 'subject', 'en', value)} rows={2} />
                  <TextareaField label="نص الرسالة — العربية" value={text(settings.dawahJourney?.days?.[index]?.body?.ar) || day.body.ar} onChange={(value) => setJourneyDay(index, 'body', 'ar', value)} rows={4} />
                  <TextareaField label="Email body — English" value={text(settings.dawahJourney?.days?.[index]?.body?.en) || day.body.en} onChange={(value) => setJourneyDay(index, 'body', 'en', value)} rows={4} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="الواجهات العامة" description="واجهات قراءة عامة اختيارية للمطورين: عناوين وملخصات المحتوى المنشور ومواقيت الصلاة، دون بيانات خاصة.">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-200 bg-cream-50 p-4">
          <input type="checkbox" checked={flag(settings.publicApiEnabled)} onChange={(event) => setValue('publicApiEnabled', event.target.checked)} className="mt-1 h-4 w-4 accent-primary-700" />
          <span>
              <span className="block text-sm font-black text-primary-950">تفعيل الواجهات العامة</span>
              <span className="mt-1 block text-xs leading-6 text-stone-500">يشمل `/api/public/content` و`/api/public/prayer-times`، مع حدّ معدل قابل للتعديل من مركز الأمان.</span>
          </span>
        </label>
      </Section>

      <Section title="المساعد المعرفي المقيّد" description="لا يظهر للزوار إلا بعد التفعيل، ويبحث في المحتوى المنشور فقط ثم يرسل مقتطفات المصادر إلى مزود الذكاء الاصطناعي. لا تستخدمه للفتاوى الشخصية.">
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold-200 bg-gold-50/60 p-4">
            <input
              type="checkbox"
              checked={Boolean(settings.assistant?.enabled)}
              onChange={(event) => setValue('assistant', { ...DEFAULT_ASSISTANT_CONFIG, ...(settings.assistant || {}), enabled: event.target.checked })}
              className="mt-1 h-4 w-4 accent-primary-700"
            />
            <span>
              <span className="block text-sm font-black text-primary-950">تفعيل المساعد للزوار</span>
              <span className="mt-1 block text-xs leading-6 text-stone-500">يتطلب ضبط `AI_ASSISTANT_API_KEY` على الخادم. يظل مغلقًا افتراضيًا.</span>
            </span>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="اسم النموذج"
              value={text(settings.assistant?.model) || DEFAULT_ASSISTANT_CONFIG.model}
              onChange={(value) => setValue('assistant', { ...DEFAULT_ASSISTANT_CONFIG, ...(settings.assistant || {}), model: value })}
              dir="ltr"
            />
            <InputField
              label="أقصى عدد للمصادر"
              value={String(settings.assistant?.maxSources ?? DEFAULT_ASSISTANT_CONFIG.maxSources)}
              onChange={(value) => setValue('assistant', { ...DEFAULT_ASSISTANT_CONFIG, ...(settings.assistant || {}), maxSources: Math.max(1, Math.min(8, Number(value) || DEFAULT_ASSISTANT_CONFIG.maxSources)) })}
              dir="ltr"
            />
          </div>
        </div>
      </Section>

      <Section title="خيارات العرض" description="تحكم في العناصر المساندة الظاهرة للزوار.">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-200 bg-cream-50 p-4">
          <input
            type="checkbox"
            checked={flag(settings.showPrayerBar)}
            onChange={(event) => setValue('showPrayerBar', event.target.checked)}
            className="mt-1 h-4 w-4 accent-primary-700"
          />
          <span>
            <span className="block text-sm font-black text-primary-950">إظهار شريط مواقيت الصلاة</span>
            <span className="mt-1 block text-xs leading-6 text-stone-500">فعّله إذا أردت ظهور الشريط في واجهة الموقع.</span>
          </span>
        </label>
      </Section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-2xl bg-gold-500 px-6 py-3 text-sm font-black text-primary-950 shadow-glow-gold transition hover:bg-gold-400 disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}
