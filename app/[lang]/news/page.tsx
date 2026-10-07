"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function NewsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        setNews(j.content?.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="📰"
          title="الأخبار والنشاطات"
          subtitle="تابع آخر أخبار ونشاطات الشيخ الدعوية"
          verse="وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ"
          verseSource="سورة العصر - الآية 3"
          gradient="from-blue-600 via-blue-700 to-blue-800"
        />

        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {loading ? (
              <p className="text-center text-gray-500 py-10">⏳ جاري التحميل...</p>
            ) : news.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                <span className="text-6xl mb-4 block">📰</span>
                <p className="text-gray-500">لا توجد أخبار حالياً</p>
                <p className="text-sm text-gray-400 mt-2">ترقب آخر الأخبار قريباً بإذن الله</p>
              </div>
            ) : (
              <IslamicSection title={`${news.length} خبر`} icon="📢" subtitle="آخر الأخبار والنشاطات">
                <div className="space-y-6">
                  {news.map((n, i) => (
                    <article
                      key={n.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border-r-4 border-gold"
                    >
                      <div className="p-6">
                        {/* التاريخ */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full font-bold">
                            📅 {formatDate(n.date)}
                          </span>
                          {i === 0 && (
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                              🆕 الأحدث
                            </span>
                          )}
                        </div>

                        {/* العنوان */}
                        <h2 className="font-serif text-2xl text-primary dark:text-gold mb-3">
                          {n.title}
                        </h2>

                        {/* المحتوى */}
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {n.body}
                        </p>

                        {/* فاصل */}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-sm text-gray-500">
                            نشر في {formatDate(n.date)}
                          </span>
                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: n.title,
                                  text: n.body.slice(0, 100),
                                  url: window.location.href,
                                });
                              }
                            }}
                            className="text-gold font-bold text-sm hover:underline"
                          >
                            📤 مشاركة الخبر
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </IslamicSection>
            )}

            {/* اشترك في النشرة */}
            <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-10">
              <span className="text-6xl mb-4 block">📧</span>
              <h3 className="font-serif text-2xl text-gold mb-4">
                لا تفوت أي خبر
              </h3>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
                اشترك في نشرتنا البريدية لتصلك آخر الأخبار والدروس والفتاوى مباشرة على إيميلك
              </p>
              <a
                href={`/${lang}/#newsletter`}
                className="inline-flex items-center gap-2 bg-gold text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition shadow-xl"
              >
                <span>📧</span>
                <span>اشترك الآن</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}