"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function InheritancePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [estate, setEstate] = useState(0);
  const [debts, setDebts] = useState(0);
  const [funeralCosts, setFuneralCosts] = useState(0);
  const [will, setWill] = useState(0);
  const [heirs, setHeirs] = useState({
    father: false,
    mother: false,
    wife: 0,
    husband: false,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0,
    grandfather: false,
    grandmother: 0,
  });

  // حساب التركات
  const afterFuneral = Math.max(0, estate - funeralCosts);
  const afterDebts = Math.max(0, afterFuneral - debts);
  const maxWill = afterDebts / 3;
  const actualWill = Math.min(will, maxWill);
  const afterWill = Math.max(0, afterDebts - actualWill);

  const calculateShares = () => {
    const shares: { name: string; icon: string; share: number; fraction: string; note: string }[] = [];
    let remaining = afterWill;

    // الأب
    if (heirs.father) {
      const hasChildren = heirs.sons > 0 || heirs.daughters > 0;
      const share = hasChildren ? afterWill / 6 : afterWill / 6;
      shares.push({ 
        name: "الأب", icon: "👴", share, 
        fraction: "السدس", 
        note: hasChildren ? "مع وجود فرع وارث" : "له السدس فرضاً والباقي تعصيباً"
      });
      remaining -= share;
    }

    // الأم
    if (heirs.mother) {
      const hasMultiple = (heirs.sons + heirs.daughters) > 1 || (heirs.brothers + heirs.sisters) > 1;
      const share = hasMultiple ? afterWill / 6 : afterWill / 3;
      shares.push({ 
        name: "الأم", icon: "👵", share, 
        fraction: hasMultiple ? "السدس" : "الثلث",
        note: hasMultiple ? "مع تعدد الإخوة أو الأبناء" : "لها الثلث كاملاً"
      });
      remaining -= share;
    }

    // الزوج
    if (heirs.husband) {
      const hasChildren = heirs.sons + heirs.daughters > 0;
      const share = hasChildren ? afterWill / 4 : afterWill / 2;
      shares.push({ 
        name: "الزوج", icon: "👨", share, 
        fraction: hasChildren ? "الربع" : "النصف",
        note: hasChildren ? "مع وجود فرع وارث" : "بدون فرع وارث"
      });
      remaining -= share;
    }

    // الزوجة
    if (heirs.wife > 0) {
      const hasChildren = heirs.sons + heirs.daughters > 0;
      const share = hasChildren ? afterWill / 8 : afterWill / 4;
      const perWife = share / heirs.wife;
      shares.push({ 
        name: `الزوجة (${heirs.wife})`, icon: "👩", share, 
        fraction: hasChildren ? "الثمن" : "الربع",
        note: `لكل واحدة ${perWife.toLocaleString("ar-EG")} ج`
      });
      remaining -= share;
    }

    // الأبناء والبنات
    if (heirs.sons > 0 || heirs.daughters > 0) {
      const totalParts = heirs.sons * 2 + heirs.daughters;
      const perPart = remaining / totalParts;
      
      if (heirs.sons > 0) {
        const sonsShare = perPart * 2 * heirs.sons;
        shares.push({ 
          name: `الأبناء (${heirs.sons})`, icon: "👦", share: sonsShare,
          fraction: "لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ",
          note: `لكل ابن ${Math.round(perPart * 2).toLocaleString("ar-EG")} ج`
        });
      }
      if (heirs.daughters > 0) {
        const daughersShare = perPart * heirs.daughters;
        shares.push({ 
          name: `البنات (${heirs.daughters})`, icon: "👧", share: daughersShare,
          fraction: heirs.daughters === 1 ? "النصف" : "الثلثين",
          note: `لكل بنت ${Math.round(perPart).toLocaleString("ar-EG")} ج`
        });
      }
    }

    return shares;
  };

  const shares = calculateShares();
  const totalDistributed = shares.reduce((sum, s) => sum + s.share, 0);

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📊"
          title="حاسبة المواريث"
          subtitle="احسب توزيع التركة حسب الشريعة الإسلامية"
          verse="يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ"
          verseSource="سورة النساء - الآية 11"
          gradient="from-amber-600 via-amber-700 to-amber-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* مقدمة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 mb-8 text-center shadow-2xl">
              <span className="text-6xl mb-4 block">⚖️</span>
              <h2 className="font-serif text-2xl text-gold mb-3">علم الفرائض</h2>
              <p className="text-white/90 max-w-3xl mx-auto">
                علم الفرائض من أشرف العلوم، وهو قسمة التركات وفق ما أنزل الله في كتابه.
                هذه الحاسبة تعطيك تقديراً تقريبياً، والمسائل المعقدة تحتاج عالم متخصص.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* بيانات التركة */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="font-serif text-xl text-primary dark:text-gold mb-4">💰 بيانات التركة</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-sm mb-2">إجمالي التركة</label>
                    <input
                      type="number"
                      value={estate || ""}
                      onChange={(e) => setEstate(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sm mb-2">تكاليف التجهيز والدفن</label>
                    <input
                      type="number"
                      value={funeralCosts || ""}
                      onChange={(e) => setFuneralCosts(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sm mb-2">الديون المستحقة</label>
                    <input
                      type="number"
                      value={debts || ""}
                      onChange={(e) => setDebts(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sm mb-2">
                      الوصية (الحد الأقصى: {Math.round(maxWill).toLocaleString("ar-EG")} ج)
                    </label>
                    <input
                      type="number"
                      value={will || ""}
                      onChange={(e) => setWill(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                    />
                    {will > maxWill && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ الوصية لا تتجاوز الثلث. سيتم تطبيق {Math.round(maxWill).toLocaleString("ar-EG")} ج فقط
                      </p>
                    )}
                  </div>
                </div>

                {/* ملخص الحساب */}
                <div className="mt-6 bg-cream-dark dark:bg-gray-700 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>إجمالي التركة:</span>
                    <span className="font-bold">{estate.toLocaleString("ar-EG")} ج</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- تكاليف التجهيز:</span>
                    <span>{funeralCosts.toLocaleString("ar-EG")} ج</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- الديون:</span>
                    <span>{debts.toLocaleString("ar-EG")} ج</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- الوصية:</span>
                    <span>{actualWill.toLocaleString("ar-EG")} ج</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 font-bold">
                    <span>صافي التركة:</span>
                    <span className="text-gold">{afterWill.toLocaleString("ar-EG")} ج</span>
                  </div>
                </div>
              </div>

              {/* الورثة */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="font-serif text-xl text-primary dark:text-gold mb-4">👥 الورثة</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-cream-dark dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={heirs.father} onChange={(e) => setHeirs({...heirs, father: e.target.checked})} className="w-5 h-5 accent-gold" />
                    <span>👴 الأب</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-cream-dark dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={heirs.mother} onChange={(e) => setHeirs({...heirs, mother: e.target.checked})} className="w-5 h-5 accent-gold" />
                    <span>👵 الأم</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-cream-dark dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={heirs.husband} onChange={(e) => setHeirs({...heirs, husband: e.target.checked})} className="w-5 h-5 accent-gold" />
                    <span>👨 الزوج</span>
                  </label>
                  <div className="p-3 bg-cream-dark dark:bg-gray-700 rounded-lg">
                    <label className="block font-bold text-sm mb-2">عدد الزوجات</label>
                    <input type="number" min={0} max={4} value={heirs.wife} onChange={(e) => setHeirs({...heirs, wife: Number(e.target.value)})} className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-1" />
                  </div>
                  <div className="p-3 bg-cream-dark dark:bg-gray-700 rounded-lg">
                    <label className="block font-bold text-sm mb-2">عدد الأبناء</label>
                    <input type="number" min={0} value={heirs.sons} onChange={(e) => setHeirs({...heirs, sons: Number(e.target.value)})} className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-1" />
                  </div>
                  <div className="p-3 bg-cream-dark dark:bg-gray-700 rounded-lg">
                    <label className="block font-bold text-sm mb-2">عدد البنات</label>
                    <input type="number" min={0} value={heirs.daughters} onChange={(e) => setHeirs({...heirs, daughters: Number(e.target.value)})} className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* النتيجة */}
            {estate > 0 && shares.length > 0 && (
              <IslamicSection title="توزيع التركة" icon="📋" subtitle={`${shares.length} وارث`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">صافي التركة</p>
                      <p className="text-xl font-bold text-gold">{afterWill.toLocaleString("ar-EG")} ج</p>
                    </div>
                    <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">الموزع</p>
                      <p className="text-xl font-bold text-green-600">{totalDistributed.toLocaleString("ar-EG")} ج</p>
                    </div>
                    <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">عدد الورثة</p>
                      <p className="text-xl font-bold text-primary dark:text-gold">{shares.length}</p>
                    </div>
                    <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">نسبة التوزيع</p>
                      <p className="text-xl font-bold text-blue-600">
                        {afterWill > 0 ? Math.round((totalDistributed/afterWill)*100) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {shares.map((s, i) => (
                      <div key={i} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-gold transition">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{s.icon}</span>
                            <h4 className="font-bold text-primary dark:text-gold text-lg">{s.name}</h4>
                          </div>
                          <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full font-bold">
                            {s.fraction}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-primary dark:text-gold mb-1">
                          {s.share.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج
                        </p>
                        <p className="text-sm text-gray-500">{s.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </IslamicSection>
            )}

            {/* تحذير */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ تنبيه مهم:</h3>
              <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                هذه حاسبة تقريبية تعليمية. المواريث من أصعب أبواب الفقه، وتحتوي على مسائل معقدة (عول، رد، حجب، إرث ذوي الأرحام). 
                <strong> يُرجى الرجوع لأهل العلم المختصين</strong> في المسائل الحقيقية قبل قسمة أي تركة.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}