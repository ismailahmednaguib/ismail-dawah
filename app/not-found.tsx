import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-cream-dark text-center px-4">
      <div className="fade-up">
        <div className="text-7xl mb-4">🧭</div>
        <h1 className="font-serif text-4xl text-primary mb-3">الصفحة غير موجودة</h1>
        <p className="text-gray-500 mb-6">ربما تم نقل الصفحة أو حذفها.</p>
        <Link href="/" className="bg-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-light transition inline-block">
          ← العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}