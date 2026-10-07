import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>الصفحة غير موجودة | ismail-dawah</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-[#0b2e22] to-[#0b2e22]/90 min-h-screen flex items-center justify-center text-white font-sans">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-block bg-[#c9a227]/20 rounded-full p-6 mb-8">
            <span className="text-8xl">🕌</span>
          </div>

          <h1 className="font-serif text-8xl md:text-9xl text-[#c9a227] mb-4">404</h1>
          
          <div className="mb-6">
            <div className="h-px w-32 bg-[#c9a227]/50 mx-auto mb-6"></div>
            <h2 className="font-serif text-3xl md:text-4xl mb-3">الصفحة غير موجودة</h2>
            <p className="text-white/80 text-lg">
              ربما تم نقل الصفحة أو حذفها
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8 border border-white/20">
            <p className="font-serif text-xl text-[#c9a227] leading-relaxed mb-2">
              ﴿فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾
            </p>
            <p className="text-white/70 text-sm">سورة آل عمران - الآية 159</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/ar"
              className="bg-[#c9a227] text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-[#c9a227]/90 transition shadow-xl"
            >
              🏠 الصفحة الرئيسية
            </Link>
            <Link
              href="/ar/search"
              className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition"
            >
              🔍 البحث في الموقع
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm">
              ismail-dawah — موقع دعوي شامل
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}