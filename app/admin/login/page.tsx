"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMsg("");
    if (!email.trim() || !password) {
      setMsg("❌ الإيميل وكلمة المرور مطلوبين");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (j.ok) {
        router.push("/admin");
      } else {
        setMsg("❌ " + (j.error || "خطأ في الدخول"));
      }
    } catch {
      setMsg("❌ خطأ في الاتصال");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-cream-dark flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-t-4 border-gold">
        <h1 className="font-serif text-3xl text-primary text-center mb-2">🔑 تسجيل دخول الآدمن</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          دخول خاص بصاحب الموقع فقط
        </p>

        <div className="space-y-4">
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
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="كلمة المرور"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>

          {msg && <p className="text-sm text-red-500 text-center">{msg}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gold text-gray-900 py-3 rounded-lg font-bold hover:bg-gold-light transition disabled:opacity-50"
          >
            {loading ? "⏳ جاري الدخول…" : "تسجيل الدخول"}
          </button>
        </div>
      </div>
    </main>
  );
}