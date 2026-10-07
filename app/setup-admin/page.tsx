"use client";

import { useState } from "react";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setMsg("");
    if (!email || !password || !name) {
      setMsg("❌ كل الحقول مطلوبة");
      return;
    }
    if (password.length < 8) {
      setMsg("❌ كلمة المرور لازم تكون 8 حروف على الأقل");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg("✅ تم إنشاء حساب الآدمن بنجاح! اذهب إلى /admin/login لتسجيل الدخول");
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setMsg("❌ " + (j.error || "خطأ في الإنشاء"));
      }
    } catch (e) {
      setMsg("❌ خطأ في الاتصال: " + String(e));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-cream-dark flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-t-4 border-gold">
        <h1 className="font-serif text-3xl text-primary text-center mb-2">🔐 إنشاء حساب الآدمن</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          دي صفحة إنشاء حساب الآدمن لأول مرة
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">الاسم</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم الآدمن"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">الإيميل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              dir="ltr"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 حروف على الأقل"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>

          {msg && <p className="text-sm text-center font-bold">{msg}</p>}

          <button
            onClick={create}
            disabled={loading}
            className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
          >
            {loading ? "⏳ جاري الإنشاء…" : "إنشاء حساب الآدمن"}
          </button>
        </div>
      </div>
    </main>
  );
}