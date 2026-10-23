import Link from 'next/link';
import type { Lang } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ToolUnavailablePage({
  lang,
  message,
}: {
  lang: Lang;
  message: string;
}) {
  const isArabic = lang === 'ar';
  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-cream-50 text-primary-950">
      <Header lang={lang} />
      <main className="mx-auto flex min-h-[55vh] w-full max-w-4xl items-center px-4 py-24 md:px-6">
        <section className="w-full rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-sm md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-700">{isArabic ? 'إشعار الخدمة' : 'Service notice'}</p>
          <h1 className="mt-3 text-3xl font-black text-primary-950">{isArabic ? 'الأداة غير متاحة مؤقتًا' : 'This tool is temporarily unavailable'}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-stone-600">{message}</p>
          <Link href={`/${lang}`} className="mt-7 inline-flex rounded-xl bg-primary-700 px-5 py-3 text-sm font-black text-white hover:bg-primary-800">
            {isArabic ? 'العودة للرئيسية' : 'Back to home'}
          </Link>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
