"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import PageHero from "@/components/PageHero";
import IslamicSection from "@/components/IslamicSection";
import { t, type Lang } from "@/lib/i18n";

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.user) {
          router.push(`/${lang}/login`);
          return;
        }
        setUser(j.user);
        return fetch("/api/questions/my", { credentials: "include" });
      })
      .then((r) => r?.json())
      .then((j) => {
        if (j) setQuestions(j.questions || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push(`/${lang}/login`);
      });
  }, [lang, router]);

  const sendQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSending(true);
    setMsg("");
    try {
      const r = await fetch("/api/questions/ask", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg("✅ تم إرسال سؤالك بنجاح");
        setNewQuestion("");
        setQuestions([{ id: j.id, question: newQuestion, status: "pending", created_at: new Date().toISOString() }, ...questions]);
      } else {
        setMsg("❌ " + (j.error || "فشل الإرسال"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setSending(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push(`/${lang}/login`);
  };

  if (loading) {
    return (
      <>
        <Header lang={L} />
        <main className="py-24 text-center text-gray-500">⏳ جاري التحميل...</main>
        <Footer lang={L} />
      </>
    );
  }

  return (
    <>
      <Header lang={L} />
      <main className="min-h-screen bg-cream-dark dark:bg-gray-900">
        <PageHero
          icon="👤"
          title={`مرحباً، ${user?.name || "زائر"}`}
          subtitle="حسابك الشخصي وأسئلتك الخاصة"
          verse="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          verseSource="سورة طه - الآية 114"
          gradient="from-violet-600 via-violet-700 to-violet-800"
        />

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4">
            <BackButton href={`/${lang}`} label={tr.back} />

            {/* معلومات الحساب */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full grid place-items-center text-gold text-2xl font-bold">
                    {user?.name?.charAt(0) || "👤"}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-primary dark:text-gold">{user?.name}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition"
                >
                  🚪 تسجيل خروج
                </button>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-gold mb-1">{questions.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأسئلة</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-amber-600 mb-1">
                  {questions.filter(q => q.status === "pending").length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">في الانتظار</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-md">
                <p className="text-4xl font-bold text-green-600 mb-1">
                  {questions.filter(q => q.status === "answered").length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">تمت الإجابة</p>
              </div>
            </div>

            {/* طرح سؤال جديد */}
            <IslamicSection title="اطرح سؤالك الخاص" icon="❓" subtitle="الشيخ سيرد عليك شخصياً">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <textarea
                  rows={4}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="اكتب سؤالك هنا بوضوح وتفصيل..."
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:border-gold focus:outline-none mb-3"
                />
                {msg && (
                  <p className={`text-sm font-bold mb-3 ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {msg}
                  </p>
                )}
                <button
                  onClick={sendQuestion}
                  disabled={sending || !newQuestion.trim()}
                  className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
                >
                  {sending ? "⏳ جاري الإرسال..." : "📨 إرسال السؤال"}
                </button>
              </div>
            </IslamicSection>

            {/* أسئلتك السابقة */}
            <IslamicSection title="أسئلتك السابقة" icon="📜">
              {questions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-md">
                  <span className="text-6xl mb-4 block">📭</span>
                  <p className="text-gray-500">لم تطرح أي أسئلة بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          q.status === "answered"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        }`}>
                          {q.status === "answered" ? "✅ تمت الإجابة" : "⏳ في الانتظار"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(q.created_at).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="font-bold text-primary dark:text-gold mb-2">❓ {q.question}</p>
                      {q.answer && (
                        <div className="bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500 rounded-lg p-4 mt-3">
                          <p className="text-sm font-bold text-green-700 dark:text-green-300 mb-1">💡 إجابة الشيخ:</p>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </IslamicSection>
          </div>
        </section>
      </main>
      <Footer lang={L} />
    </>
  );
}