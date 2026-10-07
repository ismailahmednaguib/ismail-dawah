"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { defaultContent } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

type Question = {
  id: number;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
};

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "ar";
  const L = lang as Lang;
  const tr = t(L);
  const c = defaultContent;

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.user) {
          setUser(j.user);
          loadQuestions();
        } else {
          router.push(`/${lang}/login`);
        }
      })
      .catch(() => router.push(`/${lang}/login`));
  }, [lang, router]);

  const loadQuestions = () => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((j) => setQuestions(j.questions || []))
      .finally(() => setLoading(false));
  };

  const sendQuestion = async () => {
    if (!newQ.trim()) return;
    setSending(true);
    setMsg("");
    try {
      const r = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ }),
      });
      const j = await r.json();
      if (j.ok) {
        setNewQ("");
        setMsg("✅ تم إرسال سؤالك للشيخ. ستظهر الإجابة هنا.");
        loadQuestions();
      } else {
        setMsg("❌ " + (j.error || "خطأ"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setSending(false);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${lang}`);
  };

  if (loading) {
    return (
      <>
        <Header settings={c.settings} lang={L} />
        <main className="py-24 text-center text-gray-500">⏳ جاري التحميل…</main>
        <Footer settings={c.settings} lang={L} />
      </>
    );
  }

  return (
    <>
      <Header settings={c.settings} lang={L} />
      <main className="py-16 bg-cream-dark dark:bg-gray-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          {/* رأس الحساب */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl text-primary dark:text-gold">👤 {user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="border-2 border-red-200 text-red-500 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              خروج
            </button>
          </div>

          {/* إرسال سؤال */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6 border-r-4 border-gold">
            <h2 className="font-bold text-primary dark:text-gold mb-3">❓ اسأل الشيخ خصوصيًا</h2>
            <textarea
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              rows={3}
              placeholder="اكتب سؤالك هنا… (يظهر لك أنت فقط)"
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:border-gold focus:outline-none mb-3"
            />
            {msg && <p className="text-sm mb-2">{msg}</p>}
            <button
              onClick={sendQuestion}
              disabled={sending || !newQ.trim()}
              className="bg-gold text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
            >
              {sending ? "⏳ جاري الإرسال…" : "إرسال السؤال"}
            </button>
          </div>

          {/* أسئلتي */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-primary dark:text-gold mb-4">📋 أسئلتي وإجاباتها</h2>
            {questions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                لسه ما سألتش أي سؤال. اسأل الشيخ من فوق 👆
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-gold font-black">❓</span>
                      <p className="font-bold text-primary dark:text-white">{q.question}</p>
                    </div>
                    {q.answer ? (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-2">
                        <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">{q.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        ⏳ في انتظار إجابة الشيخ…
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      📅 {new Date(q.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer settings={c.settings} lang={L} />
    </>
  );
}