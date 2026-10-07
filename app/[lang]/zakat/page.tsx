"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
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

  const goldPricePerGram = 3200;
  const silverPricePerGram = 38;
  const nisab = 85 * goldPricePerGram;

  const totalAssets = cash + (gold * goldPricePerGram) + (silver * silverPricePerGram) + stocks + business - debts;
  const zakatDue = totalAssets >= nisab ? totalAssets * 0.025 : 0;
  const isNisabReached = totalAssets >= nisab;

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="💰"
          title="حاسبة الزكاة"
          subtitle="احسب زكاة أموالك بسهولة ودقة"
          verse="وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ"
          verseSource="سورة البقرة - الآية 43"
          gradient="from-pink-600 via-pink-700 to-pink-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}/tools`} label={tr.back} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-6">
              <h3 className="font-serif text-2xl text-primary dark:text-gold mb-4">💵 أدخل أموالك</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">💵 النقدية (في البنك والبيت)</label>
                  <input
                    type="number"
                    value={cash || ""}
                    onChange={(e) => setCash(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">🥇 الذهب (بالجرام)</label>
                  <input
                    type="number"
                    value={gold || ""}
                    onChange={(e) => setGold(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {(gold * goldPricePerGram).toLocaleString("ar-EG")} جنيه
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">🥈 الفضة (بالجرام)</label>
                  <input
                    type="number"
                    value={silver || ""}
                    onChange={(e) => setSilver(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {(silver * silverPricePerGram).toLocaleString("ar-EG")} جنيه
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">📈 الأسهم والسندات</label>
                  <input
                    type="number"
                    value={stocks || ""}
                    onChange={(e) => setStocks(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">🏪 عروض التجارة</label>
                  <input
                    type="number"
                    value={business || ""}
                    onChange={(e) => setBusiness(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">💳 الديون المستحقة عليك</label>
                  <input
                    type="number"
                    value={debts || ""}
                    onChange={(e) => setDebts(Number(e.target.value))}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold"
                  />
                </div>
              </div>

              {/* النتيجة */}
              <div className="border-t-2 border-gold/30 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">إجمالي الأموال</p>
                    <p className="text-3xl font-bold text-primary dark:text-white">
                      {totalAssets.toLocaleString("ar-EG")} ج
                    </p>
                  </div>
                  <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">النصاب</p>
                    <p className="text-3xl font-bold text-primary dark:text-white">
                      {nisab.toLocaleString("ar-EG")} ج
                    </p>
                  </div>
                </div>

                <div className={`rounded-2xl p-8 text-center ${isNisabReached ? "bg-gradient-to-br from-green-500 to-green-600 text-white" : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"}`}>
                  {isNisabReached ? (
                    <>
                      <span className="text-5xl mb-3 block">✅</span>
                      <p className="text-lg mb-2">بلغ المال النصاب — تجب الزكاة</p>
                      <p className="text-5xl font-bold mb-2">
                        {zakatDue.toLocaleString("ar-EG")} ج
                      </p>
                      <p className="text-sm opacity-90">مقدار الزكاة (2.5%)</p>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl mb-3 block">⚠️</span>
                      <p className="text-lg mb-2">لم يبلغ المال النصاب</p>
                      <p className="text-3xl font-bold mb-2">لا تجب الزكاة</p>
                      <p className="text-sm opacity-90">
                        يحتاج {Math.max(0, nisab - totalAssets).toLocaleString("ar-EG")} ج للوصول للنصاب
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* ملاحظات فقهية */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 rounded-xl p-6 mt-6">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">📝 ملاحظات فقهية:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
                  <li>النصاب = 85 جرام ذهب أو 595 جرام فضة</li>
                  <li>يشترط مرور الحول الهجري على المال</li>
                  <li>ذهب الزينة المُباح لا زكاة فيه عند الجمهور</li>
                  <li>الديون المستحقة لك على مليء تُزكى</li>
                  <li>استشر أهل العلم في المسائل الخاصة</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}