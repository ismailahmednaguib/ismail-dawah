import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui";
import JourneyFinder from "@/components/dawah/JourneyFinder";
import JourneySignup from "@/components/dawah/JourneySignup";
import { getSiteSettings } from "@/lib/content";
import { normalizeDawahJourneyConfig } from "@/lib/dawah-journey";
import { emailProviderConfigured } from "@/lib/email-verification-config";
import { isValidLang, type Lang } from "@/lib/i18n";
import { buildPageControls, pageGate } from "@/lib/page-sections";

export const dynamic = "force-dynamic";

const COPY = {
  ar: {
    title: "اختبر مسارك الدعوي",
    subtitle: "أجب عن سؤالين فقط لنقترح عليك بداية مناسبة، بلا تسجيل أو جمع بيانات شخصية.",
    home: "الرئيسية",
    privacy: "خصوصيتك أولًا",
    privacyText: "لا نحفظ إجابات هذا الاختبار ولا نطلب بريدك أو هويتك. الاختيار مجرد وسيلة لتسهيل الوصول إلى المحتوى.",
    journeyNotice: "الاشتراك في الرحلة منفصل واختياري، ولا يرتبط بنتيجة الاختبار.",
  },
  en: {
    title: "Find your learning path",
    subtitle: "Answer two short questions for a gentle starting point—no account or personal data required.",
    home: "Home",
    privacy: "Privacy first",
    privacyText: "We do not save your answers or ask for your email or identity. This is only a way to guide you to useful material.",
    journeyNotice: "The email journey is optional and separate from your quiz result.",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const current = isValidLang(lang) ? (lang as Lang) : "ar";
  return { title: COPY[current].title, description: COPY[current].subtitle };
}

export default async function DawahPathPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const current = lang as Lang;
  const copy = COPY[current];
  const settings = await getSiteSettings();
  const gate = pageGate(buildPageControls(settings), "dawah-path", current);
  const journey = normalizeDawahJourneyConfig(settings.dawahJourney);
  if (!gate.pageVisible) notFound();

  return (
    <>
      <Header lang={current} />
      <main id="main-content" tabIndex={-1} dir={current === "ar" ? "rtl" : "ltr"} className="site-page-shell">
        {gate.visible("k0") && <PageHero icon="🧭" title={copy.title} subtitle={copy.subtitle} crumbs={[{ label: copy.home, href: `/${current}` }, { label: copy.title }]} />}
        <div className="container-page space-y-6 py-10 md:py-14">
          {gate.visible("k1") && <JourneyFinder lang={current} />}
          {gate.visible("k2") && <aside className="rounded-2xl border border-primary-100 bg-primary-50/70 p-5 dark:border-night-700 dark:bg-night-800" aria-label={copy.privacy}><p className="font-black text-primary-950 dark:text-white">{copy.privacy}</p><p className="mt-2 text-sm leading-7 text-primary-900 dark:text-primary-100">{copy.privacyText}</p></aside>}
          {gate.visible("k3") && <><JourneySignup lang={current} enabled={journey.enabled && emailProviderConfigured(process.env)} /><p className="text-center text-xs text-stone-500 dark:text-stone-400">{copy.journeyNotice}</p></>}
        </div>
      </main>
      <Footer lang={current} />
    </>
  );
}
