"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { SectionTitle } from "@/components/Cards";
import { t, type Lang } from "@/lib/i18n";

type Heir = {
  id: string;
  name: string;
  category: "male" | "female" | "spouse" | "parent" | "child";
  count: number;
  share: number;
  note: string;
};

export default function InheritancePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [estate, setEstate] = useState(0);
  const [debts, setDebts] = useState(0);
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

  // حساب تقريبي للمواريث
  const netEstate = Math.max(0, estate - debts);
  const afterWill = Math.max(0, netEstate - Math.min(netEstate * 1/3, will));

  const calculateShares = () => {
    const shares: Heir[] = [];
    let remaining = afterWill;

    // الأب
    if (heirs.father) {
      const share = heirs.sons > 0 || heirs.daughters > 0 ? afterWill * 1/6 : afterWill * 1/6;
      shares.push({ id: "father", name: "الأب", category: "parent", count: 1, share, note: "له السدس" });
      remaining -= share;
    }

    // الأم
    if (heirs.mother) {
      const share = (heirs.sons + heirs.daughters > 1) ? afterWill * 1/6 : afterWill * 1/3;
      shares.push({ id: "mother", name: "الأم", category: "parent", count: 1, share, note: heirs.sons + heirs.daughters > 1 ? "لها السدس" : "لها الثلث" });
      remaining -= share;
    }

    // الزوج
    if (heirs.husband) {
      const share = heirs.sons + heirs.daughters > 0 ? afterWill * 1/4 : afterWill * 1/2;
      shares.push({ id: "husband", name: "الزوج", category: "spouse", count: 1, share, note: heirs.sons + heirs.daughters > 0 ? "له الربع" : "له النصف" });
      remaining -= share;
    }

    // الزوجة/الزوجات
    if (heirs.wife > 0) {
      const share = heirs.sons + heirs.daughters > 0 ? afterWill * 1/8 : afterWill * 1/4;
      const perWife = share / heirs.wife;
      shares.push({ id: "wife", name: `الزوجة (${heirs.wife})`, category: "spouse", count: heirs.wife, share, note: `لكل واحدة ${perWife.toLocaleString("ar-EG")} ج` });
      remaining -= share;
    }

    // الأبناء والبنات (تعصيب)
    if (heirs.sons > 0 || heirs.daughters > 0) {
      const totalParts = heirs.sons * 2 + heirs.daughters;
      const perPart = remaining / totalParts;
      if (heirs.sons > 0) {
        shares.push({ id: "sons", name: `الابن (${heirs.sons})`, category: "child", count: heirs.sons, share: perPart * 2 * heirs.sons, note: `لكل ابن ${perPart * 2} ج (للذكر مثل حظ الأنثيين)` });
      }
      if (heirs.daughters > 0) {
        shares.push({ id: "daughters", name: `البنت (${heirs.daughters})`, category: "child", count: heirs.daughters, share: perPart * heirs.daughters, note: `لكل بنت ${perPart} ج` });
      }
    }

    return shares;
  };

  const shares = calculateShares();
  const totalDistributed = shares.reduce((sum, s) => sum + s.share, 0);

  return (
    <>
      <Header lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <BackButton href={`/${lang}/tools`} label={tr.back} />
          <SectionTitle>📊 حاسبة المواريث</SectionTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            احسب توزيع التركة حسب الشريعة الإسلامية
          </p>

          {/* بيانات التركة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
            <h3 className="font-bold text-primary dark:text-gold mb-4">💰 بيانات التركة</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-sm mb-1">إجمالي التركة</label>
                <input
                  type="number"
                  value={estate || ""}
                  onChange={(e) => setEstate(Number(e.target.value))}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">الديون</label>
                <input
                  type="number"
                  value={debts || ""}
                  onChange={(e) => setDebts(Number(e.target.value))}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">الوصية (حد أقصى 1/3)</label>
                <input
                  type="number"
                  value={will || ""}
                  onChange={(e) => setWill(Number(e.target.value))}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2 focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* الورثة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
            <h3 className="font-bold text-primary dark:text-gold mb-4">👥 الورثة</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirs.father}
                  onChange={(e) => setHeirs({...heirs, father: e.target.checked})}
                  className="w-5 h-5 accent-gold"
                />
                <span>الأب</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirs.mother}
                  onChange={(e) => setHeirs({...heirs, mother: e.target.checked})}
                  className="w-5 h-5 accent-gold"
                />
                <span>الأم</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirs.husband}
                  onChange={(e) => setHeirs({...heirs, husband: e.target.checked})}
                  className="w-5 h-5 accent-gold"
                />
                <span>الزوج</span>
              </label>
              <div>
                <label className="block font-bold text-sm mb-1">عدد الزوجات</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={heirs.wife}
                  onChange={(e) => setHeirs({...heirs, wife: Number(e.target.value)})}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">عدد الأبناء</label>
                <input
                  type="number"
                  min={0}
                  value={heirs.sons}
                  onChange={(e) => setHeirs({...heirs, sons: Number(e.target.value)})}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">عدد البنات</label>
                <input
                  type="number"
                  min={0}
                  value={heirs.daughters}
                  onChange={(e) => setHeirs({...heirs, daughters: Number(e.target.value)})}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* النتيجة */}
          {estate > 0 && shares.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-primary dark:text-gold mb-4">📋 توزيع التركة</h3>
              <div className="bg-cream-dark dark:bg-gray-700 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">صافي التركة</p>
                    <p className="text-lg font-bold">{afterWill.toLocaleString("ar-EG")} ج</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الموزع</p>
                    <p className="text-lg font-bold text-green-600">{totalDistributed.toLocaleString("ar-EG")} ج</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {shares.map(s => (
                  <div key={s.id} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-primary dark:text-gold">{s.name}</h4>
                      <span className="text-xl font-bold">{s.share.toLocaleString("ar-EG")} ج</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.note}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>تنبيه:</strong> هذه حاسبة تقريبية. المواريث من أصعب أبواب الفقه، يُرجى الرجوع لأهل العلم المختصين في المسائل المعقدة (عول، رد، حجب، إرث ذوي الأرحام).
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer lang={L} />
    </>
  );
}