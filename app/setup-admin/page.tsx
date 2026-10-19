"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// ============================================================
// Types
// ============================================================

type SetupState =
  | "checking"
  | "ready"
  | "token_required"
  | "admin_exists"
  | "disabled"
  | "error";

type SetupStatus = {
  state: SetupState;
  message?: string;
  retryAfter?: number;
};

// ============================================================
// Constants
// ============================================================

const LOGIN_URL = "/ar/login";
// نفس حد السيرفر في الإنتاج (12). في التطوير السيرفر بيقبل 8 لكن الأفضل نستخدم 12 دايماً.
const MIN_PASSWORD_LENGTH = 12;
const MAX_NAME_LENGTH = 80;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// Helpers
// ============================================================

function getStringField(data: unknown, key: string): string {
  if (!data || typeof data !== "object") return "";
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function getNumberField(data: unknown, key: string): number | undefined {
  if (!data || typeof data !== "object") return undefined;
  const value = Number((data as Record<string, unknown>)[key]);
  return Number.isFinite(value) ? value : undefined;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "فارغة", color: "bg-gray-300" };

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "ضعيفة جدًا", color: "bg-red-500" };
  if (score === 2) return { score, label: "ضعيفة", color: "bg-orange-500" };
  if (score === 3) return { score, label: "متوسطة", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "جيدة", color: "bg-primary-500" };
  return { score, label: "قوية", color: "bg-primary-600" };
}

// ============================================================
// UI pieces
// ============================================================

const PRIMARY_BTN =
  "w-full rounded-lg bg-gold-500 py-3 font-bold text-gray-900 transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50";
const SECONDARY_BTN =
  "w-full rounded-lg border border-gray-200 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50";
const INPUT =
  "w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-gold-500 focus:outline-none";

function Shell({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "red" | "orange";
}) {
  const border =
    tone === "red"
      ? "border-red-400"
      : tone === "orange"
      ? "border-orange-400"
      : "border-gold-500";

  return (
    <main id="main-content" tabIndex={-1}
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12"
    >
      <div
        className={`w-full max-w-md rounded-2xl border-t-4 bg-white p-8 shadow-lg ${border}`}
      >
        {children}
      </div>
    </main>
  );
}

// ============================================================
// Page
// ============================================================

export default function SetupAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");

  const [status, setStatus] = useState<SetupStatus>({ state: "checking" });
  const [submitting, setSubmitting] = useState(false);
  const [checkingToken, setCheckingToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // ------------------------------------------------------------
  // Check setup status
  // ------------------------------------------------------------

  const checkSetupStatus = useCallback(async (token?: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const headers: Record<string, string> = {};
      const cleanToken = token?.trim();
      if (cleanToken) headers["x-admin-setup-token"] = cleanToken;

      const res = await fetch("/api/admin/setup", {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as unknown;
      const reason = getStringField(data, "reason");
      const serverMessage = getStringField(data, "error");

      if (res.ok && (data as Record<string, unknown> | null)?.setupEnabled) {
        setStatus({ state: "ready" });
        return;
      }

      if (res.status === 429) {
        setStatus({
          state: "error",
          message: serverMessage || "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا.",
          retryAfter: getNumberField(data, "retryAfter"),
        });
        return;
      }

      if (res.status === 403) {
        if (reason === "disabled") {
          setStatus({
            state: "disabled",
            message: serverMessage || "إنشاء حساب الأدمن معطل حاليًا.",
          });
          return;
        }

        if (reason === "admin_exists") {
          setStatus({
            state: "admin_exists",
            message:
              serverMessage ||
              "يوجد حساب أدمن بالفعل. لا يمكن استخدام صفحة الإعداد.",
          });
          return;
        }

        // token_required (أو أي 403 تاني)
        setStatus({
          state: "token_required",
          message:
            cleanToken && serverMessage
              ? serverMessage
              : "هذه الصفحة محمية. أدخل توكن الإعداد (ADMIN_SETUP_TOKEN).",
        });
        return;
      }

      setStatus({
        state: "error",
        message: `${serverMessage || "تعذر التحقق من حالة الإعداد."} (${res.status})`,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus({
          state: "error",
          message: "انتهت مهلة التحقق من حالة الإعداد. حاول مرة أخرى.",
        });
        return;
      }

      setStatus({
        state: "error",
        message: "تعذر الاتصال بالسيرفر. تأكد من الإنترنت وحاول مرة أخرى.",
      });
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void checkSetupStatus();
  }, [checkSetupStatus]);

  // ------------------------------------------------------------
  // Validate
  // ------------------------------------------------------------

  const validate = (): string | null => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) return "الاسم مطلوب.";
    if (cleanName.length < 2) return "الاسم قصير جدًا.";
    if (cleanName.length > MAX_NAME_LENGTH) {
      return `الاسم يجب ألا يزيد عن ${MAX_NAME_LENGTH} حرفًا.`;
    }
    if (!cleanEmail) return "البريد الإلكتروني مطلوب.";
    if (!EMAIL_REGEX.test(cleanEmail)) return "صيغة البريد الإلكتروني غير صحيحة.";
    if (!password) return "كلمة المرور مطلوبة.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف.`;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return "كلمة المرور يجب أن تحتوي على حروف وأرقام.";
    }
    if (password !== confirmPassword) {
      return "كلمة المرور وتأكيدها غير متطابقين.";
    }

    return null;
  };

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (status.state !== "ready") {
      setError("تحقق من التوكن أولًا ثم أنشئ الحساب.");
      return;
    }

    setSubmitting(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const cleanToken = setupToken.trim();
      if (cleanToken) headers["x-admin-setup-token"] = cleanToken;

      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: name.trim(),
        }),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (res.ok && (data as Record<string, unknown> | null)?.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSetupToken("");
        setError("");
        return;
      }

      const reason = getStringField(data, "reason");
      const serverMessage = getStringField(data, "error");

      if (res.status === 403) {
        if (reason === "admin_exists") {
          setStatus({ state: "admin_exists", message: serverMessage });
          return;
        }
        if (reason === "disabled") {
          setStatus({ state: "disabled", message: serverMessage });
          return;
        }
        if (reason === "token_required") {
          setStatus({
            state: "token_required",
            message: serverMessage || "توكن الإعداد غير صحيح أو مفقود.",
          });
          return;
        }
        setError(serverMessage || "غير مصرح لك بإنشاء حساب الأدمن.");
        return;
      }

      if (res.status === 429) {
        const retryAfter = getNumberField(data, "retryAfter");
        setError(
          (serverMessage || "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا.") +
            (retryAfter ? ` (متبقي ${retryAfter} ثانية)` : "")
        );
        return;
      }

      if (res.status === 409) {
        setError(serverMessage || "هذا البريد الإلكتروني مسجل بالفعل كأدمن.");
        return;
      }

      if (res.status === 400) {
        setError(serverMessage || "بيانات غير صالحة. راجع الحقول.");
        return;
      }

      setError(
        serverMessage || "فشل إنشاء حساب الأدمن. حاول لاحقًا أو تواصل مع المسؤول."
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("انتهت مهلة الطلب. حاول مرة أخرى.");
        return;
      }
      setError("تعذر الاتصال بالسيرفر. تأكد من الإنترنت وحاول مرة أخرى.");
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Check token manually
  // ------------------------------------------------------------

  const handleCheckToken = async () => {
    setError("");

    const cleanToken = setupToken.trim();
    if (!cleanToken) {
      setError("أدخل ADMIN_SETUP_TOKEN أولًا.");
      return;
    }

    setCheckingToken(true);
    await checkSetupStatus(cleanToken);
    setCheckingToken(false);
  };

  const recheck = (token?: string) => {
    setStatus({ state: "checking" });
    void checkSetupStatus(token);
  };

  // ------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------

  if (success) {
    return (
      <Shell>
        <h1 className="mb-2 text-center text-3xl font-bold text-primary-800">
          ✓ تم إنشاء الحساب
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          تم إنشاء حساب الأدمن بنجاح. يمكنك الآن تسجيل الدخول.
        </p>
        <div className="rounded-lg bg-primary-50 p-4 text-center text-sm font-bold text-primary-700">
          احتفظ ببيانات الدخول في مكان آمن، ثم عطّل هذه الصفحة
          (<code dir="ltr">DISABLE_ADMIN_SETUP=true</code>).
        </div>
        <Link
          href={LOGIN_URL}
          className="mt-6 block w-full rounded-lg bg-gold-500 py-3 text-center font-bold text-gray-900 transition hover:bg-gold-600"
        >
          الذهاب إلى تسجيل دخول الأدمن
        </Link>
      </Shell>
    );
  }

  if (status.state === "checking") {
    return (
      <Shell>
        <h1 className="mb-3 text-center text-2xl font-bold text-primary-800">
          ⏳ جاري فحص حالة الإعداد
        </h1>
        <p className="text-center text-sm text-gray-500">
          يتم التحقق مما إذا كان إنشاء حساب الأدمن متاحًا.
        </p>
      </Shell>
    );
  }

  if (status.state === "disabled" || status.state === "admin_exists") {
    return (
      <Shell tone="red">
        <h1 className="mb-3 text-center text-3xl font-bold text-primary-800">
          🔒 الإعداد غير متاح
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {status.message || "لا يمكن إنشاء حساب أدمن من هذه الصفحة حاليًا."}
        </p>
        <Link
          href={LOGIN_URL}
          className="block w-full rounded-lg bg-gold-500 py-3 text-center font-bold text-gray-900 transition hover:bg-gold-600"
        >
          تسجيل دخول الأدمن
        </Link>
        <button
          type="button"
          onClick={() => recheck(setupToken.trim() || undefined)}
          className={`mt-3 ${SECONDARY_BTN}`}
        >
          إعادة المحاولة
        </button>
      </Shell>
    );
  }

  if (status.state === "error") {
    return (
      <Shell tone="orange">
        <h1 className="mb-3 text-center text-3xl font-bold text-primary-800">
          ⚠️ تعذر تحميل صفحة الإعداد
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {status.message || "حدث خطأ غير متوقع."}
        </p>
        {status.retryAfter ? (
          <p className="mb-4 text-center text-xs text-gray-500">
            حاول مرة أخرى بعد حوالي {status.retryAfter} ثانية.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => recheck(setupToken.trim() || undefined)}
          className={PRIMARY_BTN}
        >
          إعادة الفحص
        </button>
        <Link
          href={LOGIN_URL}
          className={`mt-3 block text-center ${SECONDARY_BTN}`}
        >
          الذهاب إلى تسجيل الدخول
        </Link>
      </Shell>
    );
  }

  // ------------------------------------------------------------
  // Form
  // ------------------------------------------------------------

  const needsToken = status.state === "token_required";
  const canSubmit = !submitting && status.state === "ready";

  return (
    <Shell>
      <h1 className="mb-2 text-center text-3xl font-bold text-primary-800">
        🔐 إنشاء حساب الأدمن
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        هذه صفحة إنشاء حساب الأدمن لأول مرة.
      </p>

      {status.message ? (
        <div
          role="status"
          className={`mb-5 rounded-lg p-3 text-sm font-bold ${
            needsToken ? "bg-amber-50 text-amber-800" : "bg-primary-50 text-primary-800"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      {needsToken ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <label
            htmlFor="setup-token"
            className="mb-1 block text-sm font-bold text-amber-900"
          >
            ADMIN_SETUP_TOKEN
          </label>
          <input
            id="setup-token"
            type="password"
            value={setupToken}
            onChange={(e) => setSetupToken(e.target.value)}
            placeholder="أدخل توكن الإعداد"
            dir="ltr"
            autoComplete="off"
            className="w-full rounded-lg border-2 border-amber-200 px-4 py-2 text-left focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-amber-800">
            احصل على التوكن من متغيرات البيئة في Vercel. لا تشاركه مع أحد.
          </p>
          <button
            type="button"
            onClick={handleCheckToken}
            disabled={checkingToken || !setupToken.trim()}
            className="mt-3 w-full rounded-lg border border-amber-300 bg-white py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
          >
            {checkingToken ? "⏳ جاري التحقق..." : "تحقق من التوكن"}
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="admin-name" className="mb-1 block text-sm font-bold text-gray-600">
            الاسم
          </label>
          <input
            id="admin-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="اسم الأدمن"
            autoComplete="name"
            disabled={needsToken}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="admin-email" className="mb-1 block text-sm font-bold text-gray-600">
            البريد الإلكتروني
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            dir="ltr"
            disabled={needsToken}
            className={`${INPUT} text-left`}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-1 block text-sm font-bold text-gray-600">
            كلمة المرور
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`${MIN_PASSWORD_LENGTH} أحرف على الأقل (حروف وأرقام)`}
            autoComplete="new-password"
            disabled={needsToken}
            className={INPUT}
          />

          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${strength.color}`}
                style={{ width: `${(Math.min(strength.score, 5) / 5) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              قوة كلمة المرور: {strength.label}
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-confirm-password"
            className="mb-1 block text-sm font-bold text-gray-600"
          >
            تأكيد كلمة المرور
          </label>
          <input
            id="admin-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد كتابة كلمة المرور"
            autoComplete="new-password"
            disabled={needsToken}
            className={INPUT}
          />

          {confirmPassword && password !== confirmPassword ? (
            <p className="mt-1 text-xs font-bold text-red-600">
              كلمتا المرور غير متطابقتين.
            </p>
          ) : null}
        </div>

        {error ? (
          <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
            ❌ {error}
          </div>
        ) : null}

        <button type="submit" disabled={!canSubmit} className={PRIMARY_BTN}>
          {submitting ? "⏳ جاري الإنشاء…" : "إنشاء حساب الأدمن"}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
        <p className="mb-2 font-bold text-gray-700">تنبيه أمني مهم:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            بعد إنشاء الحساب عطّل هذه الصفحة بضبط
            <code dir="ltr" className="mx-1 rounded bg-gray-200 px-1">
              DISABLE_ADMIN_SETUP=true
            </code>
            في Vercel.
          </li>
          <li>استخدم توكن عشوائي طويل (32 حرف أو أكثر).</li>
          <li>احفظ بيانات الدخول في مدير كلمات مرور آمن.</li>
        </ul>
      </div>

      <Link
        href={LOGIN_URL}
        className="mt-4 block text-center text-sm font-bold text-primary-700 hover:underline"
      >
        عندي حساب بالفعل؟ تسجيل الدخول
      </Link>
    </Shell>
  );
}
