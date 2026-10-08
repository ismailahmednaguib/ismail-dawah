import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isValidLang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ===== Metadata ديناميكية حسب اللغة =====
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    alternates: {
      canonical: `/${lang}`,
    },
  };
}

// ===== الـ Layout =====
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // في Next.js 15+ الـ params بتبقى Promise فبنعملها await
  const { lang } = await params;

  // 🛡️ حماية المسار: لو حد كتب لغة غلط (زي /fr/quran) ارجع صفحة 404
  if (!isValidLang(lang)) {
    notFound();
  }

  return (
    <>
      {/* الهيدر الثابت (بيستخدم usePathname internally) */}
      <Header />
      
      {/* المحتوى الرئيسي (مع padding عشان ميختفيش تحت الهيدر) */}
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      
      {/* الفوتر */}
      <Footer />
    </>
  );
}