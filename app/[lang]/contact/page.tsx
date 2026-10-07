"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { getContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export default function ContactPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // هنا ممكن تضيف API للإرسال
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="💬"
          title="تواصل معنا"
          subtitle="نسعد بتواصلكم واستفساراتكم"
          hadith="الْمُسْلِمُ أَخُو الْمُسْلِمِ"
          gradient="from-teal-600 via-teal-700 to-teal-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            <div className="grid md:grid-cols-2 gap-8">
              {/* معلومات التواصل */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4">📞 طرق التواصل</h2>
                  
                  <div className="space-y-4">
                    {true && (
                      <a
                        href={`https://wa.me/2`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:shadow-md transition"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full grid place-items-center text-white text-2xl">
                          💬
                        </div>
                        <div>
                          <p className="font-bold text-green-800 dark:text-green-200">واتساب</p>
                          <p className="text-sm text-green-600 dark:text-green-400" dir="ltr">+2</p>
                        </div>
                      </a>
                    )}

                    <a
                      href="mailto:contact@ismail-dawah.com"
                      className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:shadow-md transition"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-full grid place-items-center text-white text-2xl">
                        ✉️
                      </div>
                      <div>
                        <p className="font-bold text-blue-800 dark:text-blue-200">البريد الإلكتروني</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">contact@ismail-dawah.com</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <div className="w-12 h-12 bg-amber-500 rounded-full grid place-items-center text-white text-2xl">
                        📍
                      </div>
                      <div>
                        <p className="font-bold text-amber-800 dark:text-amber-200">الموقع</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">جمهورية مصر العربية</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* السوشيال ميديا */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h2 className="font-serif text-xl text-primary dark:text-gold mb-4">🌐 تابعنا على</h2>
                  <div className="flex gap-3 flex-wrap">
                    <a href="#" className="w-12 h-12 bg-blue-600 rounded-full grid place-items-center text-white text-xl hover:opacity-80 transition">📘</a>
                    <a href="#" className="w-12 h-12 bg-red-600 rounded-full grid place-items-center text-white text-xl hover:opacity-80 transition">📺</a>
                    <a href="#" className="w-12 h-12 bg-cyan-500 rounded-full grid place-items-center text-white text-xl hover:opacity-80 transition">✈️</a>
                    <a href="#" className="w-12 h-12 bg-gray-900 rounded-full grid place-items-center text-white text-xl hover:opacity-80 transition">🐦</a>
                  </div>
                </div>

                {/* آية */}
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl p-6 text-center">
                  <p className="font-serif text-xl text-gold leading-relaxed mb-2">
                    ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾
                  </p>
                  <p className="text-white/70 text-sm">سورة المائدة - الآية 2</p>
                </div>
              </div>

              {/* نموذج التواصل */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                {sent ? (
                  <div className="text-center py-10">
                    <div className="inline-block bg-green-100 dark:bg-green-900/20 rounded-full p-6 mb-4">
                      <span className="text-6xl">✅</span>
                    </div>
                    <h3 className="font-serif text-2xl text-primary dark:text-gold mb-2">
                      تم إرسال رسالتك بنجاح
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      سنرد عليك في أقرب وقت بإذن الله
                    </p>
                    <button
                      onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
                      className="bg-gold text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gold-light transition"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="font-serif text-2xl text-primary dark:text-gold mb-4">📝 أرسل رسالة</h2>
                    
                    <div>
                      <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">الاسم</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                        placeholder="اسمك الكريم"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">البريد الإلكتروني</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                        placeholder="email@example.com"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-sm mb-2 text-primary dark:text-gold">الرسالة</label>
                      <textarea
                        required
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none"
                        placeholder="اكتب رسالتك هنا..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gold text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gold-light transition disabled:opacity-50"
                    >
                      {loading ? "⏳ جاري الإرسال..." : "📨 إرسال الرسالة"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}