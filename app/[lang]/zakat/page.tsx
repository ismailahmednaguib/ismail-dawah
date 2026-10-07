"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

export default function ZakatPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [business, setBusiness] = useState(0);
  const [debts, setDebts] = useState(0);

  // أسعار تقريبية (بالجنيه المصري) - يمكن تحديثها
  const goldPricePerGram = 3200;
  const silverPricePerGram = 38;
  const nisab = 85 * goldPricePerGram; // نصاب الذهب (85 جرام)

  const totalAssets = cash + (gold * goldPricePerGram) + (silver * silverPricePerGram) + stocks + business - debts;
  const zakatDue = totalAssets >= nisab ? totalAssets * 0.025 : 0;
  const isNisabReached = totalAssets >= nisab;

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>🧮 حاسبة الزكاة</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            احسب زكاة أموالك بسهولة ودقة
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md space-y-4">
            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">💵 النقدية (في البنك والبيت)</label>
              <input
                type="number"
                value={cash || ""}
                onChange={(e) => setCash(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">🥇 الذهب (بالجرام)</label>
              <input
                type="number"
                value={gold || ""}
                onChange={(e) => setGold(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {gold * goldPricePerGram} جنيه (سعر الجرام: {goldPricePerGram} ج)
              </p>
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">🥈 الفضة (بالجرام)</label>
              <input
                type="number"
                value={silver || ""}
                onChange={(e) => setSilver(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {silver * silverPricePerGram} جنيه
              </p>
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">📈 الأسهم والسندات</label>
              <input
                type="number"
                value={stocks || ""}
                onChange={(e) => setStocks(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">🏪 عروض التجارة</label>
              <input
                type="number"
                value={business || ""}
                onChange={(e) => setBusiness(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-1 text-primary dark:text-gold">💳 الديون المستحقة عليك</label>
              <input
                type="number"
                value={debts || ""}
                onChange={(e) => setDebts(Number(e.target.value))}
                placeholder="0"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
              />
            </div>

            {/* النتيجة */}
            <div className="border-t-2 border-gold/30 pt-4 mt-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي الأموال</p>
                  <p className="text-2xl font-bold text-primary dark:text-white">
                    {totalAssets.toLocaleString("ar-EG")} ج
                  </p>
                </div>
                <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">النصاب</p>
                  <p className="text-2xl font-bold text-primary dark:text-white">
                    {nisab.toLocaleString("ar-EG")} ج
                  </p>
                </div>
              </div>

              <div className={`rounded-xl p-6 text-center ${isNisabReached ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300" : "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300"}`}>
                {isNisabReached ? (
                  <>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      ✅ بلغ المال النصاب — تجب الزكاة
                    </p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                      {zakatDue.toLocaleString("ar-EG")} ج
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      مقدار الزكاة (2.5%)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      ⚠️ لم يبلغ المال النصاب
                    </p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      لا تجب الزكاة
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      يحتاج {Math.max(0, nisab - totalAssets).toLocaleString("ar-EG")} ج للوصول للنصاب
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ملاحظات فقهية */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mt-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">📝 ملاحظات فقهية:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>النصاب = 85 جرام ذهب أو 595 جرام فضة</li>
                <li>يشترط مرور الحول الهجري على المال</li>
                <li>ذهب الزينة المُباح لا زكاة فيه عند الجمهور</li>
                <li>الديون المستحقة لك على مليء تُزكى</li>
                <li>استشر أهل العلم في المسائل الخاصة</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}