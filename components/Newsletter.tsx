"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!email || !email.includes("@")) {
      setMsg("❌ أدخل إيميل صحيح");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const j = await r.json();
      if (j.ok) {
        setSuccess(true);
        setMsg("✅ " + j.message);
        setEmail("");
        setName("");
      } else {
        setMsg("❌ " + (j.error || "خطأ"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 text-center shadow-xl">
        <span className="text-5xl mb-3 block">✅</span>
        <h3 className="font-bold text-xl mb-2">شكراً لاشتراكك!</h3>
        <p className="text-white/90">
          سيصلك كل جديد من الدروس والفتاوى على إيميلك
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">📧</span>
        <h3 className="font-serif text-2xl text-gold mb-2">اشترك في النشرة البريدية</h3>
        <p className="text-white/80 text-sm">
          احصل على جديد الدروس والفتاوى والمقالات مباشرة على إيميلك
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك (اختياري)"
          className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/60 focus:border-gold focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          dir="ltr"
          className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/60 focus:border-gold focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
        >
          {loading ? "⏳ جاري الاشتراك..." : "📬 اشترك الآن"}
        </button>
        {msg && <p className="text-sm text-center text-white/90">{msg}</p>}
      </div>

      <div className="mt-6 text-center text-xs text-white/60">
        🔒 إيميلك آمن ولن نشاركه مع أحد
      </div>
    </div>
  );
}