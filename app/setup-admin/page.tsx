"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================
// Types
// ============================================================

type SetupStatusState =
  | "checking"
  | "ready"
  | "token_required"
  | "admin_exists"
  | "disabled"
  | "error";

type SetupStatus = {
  state: SetupStatusState;
  message?: string;
  retryAfter?: number;
};

// ============================================================
// Constants
// ============================================================

const LOGIN_URL = "/admin/login";
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 80;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// Helpers
// ============================================================

function getStringField(data: unknown, key: string): string {
  if (!data || typeof data !== "object") {
    return "";
  }

  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(data: unknown, fallback: string): string {
  const message = getStringField(data, "error");
  return message || fallback;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return {
      score: 0,
      label: "فارغة",
      color: "bg-gray-300",
    };
  }

  let score = 0;

  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const normalized = Math.min(score, 5);

  if (normalized <= 1) {
    return {
      score: normalized,
      label: "ضعيفة جدًا",
      color: "bg-red-500",
    };
  }

  if (normalized === 2) {
    return {
      score: normalized,
      label: "ضعيفة",
      color: "bg-orange-500",
    };
  }

  if (normalized === 3) {
    return {
      score: normalized,
      label: "متوسطة",
      color: "bg-yellow-500",
    };
  }

  if (normalized === 4) {
    return {
      score: normalized,
      label: "جيدة",
      color: "bg-lime-500",
    };
  }

  return {
    score: normalized,
    label: "قوية",
    color: "bg-green-600",
  };
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

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  // ------------------------------------------------------------
  // Check setup status
  // ------------------------------------------------------------

  const checkSetupStatus = useCallback(async (token?: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const headers: Record<string, string> = {};

      const cleanToken = token?.trim();
      if (cleanToken) {
        headers["x-admin-setup-token"] = cleanToken;
      }

      const res = await fetch("/api/admin/setup", {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as unknown;

      // If route does not implement GET, allow direct POST attempt.
      if (res.status === 405) {
        setStatus({
          state: "ready",
          message: "فحص حالة الإعداد غير متاح، سيتم محاولة الإنشاء مباشرة.",
        });
        return;
      }

      if (res.ok && Boolean((data as Record<string, unknown>)?.setupEnabled)) {
        setStatus({ state: "ready" });
        return;
      }

      if (res.status === 403) {
        const reason = getStringField(data, "reason");
        const serverMessage = getErrorMessage(data, "");

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

        if (reason === "token_required") {
          setStatus({
            state: "token_required",
            message:
              serverMessage ||
              "هذه الصفحة محمية. أدخل ADMIN_SETUP_TOKEN إذا كان لديك صلاح.",
          });
          return;
        }

        setStatus({
          state: "error",
          message: serverMessage || "غير مصرح لك بعرض صفحة الإعداد.",
        });
        return;
      }

      if (res.status === 429) {
        const retryAfterRaw = Number(
          (data as Record<string, unknown>)?.retryAfter
        );

        setStatus({
          state: "error",
          message:
            getErrorMessage(
              data,
              "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا."
            ),
          retryAfter: Number.isFinite(retryAfterRaw)
            ? retryAfterRaw
            : undefined,
        });
        return;
      }

      setStatus({
        state: "error",
        message:
          getErrorMessage(data, "تعذر التحقق من حالة الإعداد.") +
          (res.status ? ` (${res.status})` : ""),
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

    if (!cleanName) {
      return "الاسم مطلوب.";
    }

    if (cleanName.length < 2) {
      return "الاسم قصير جدًا.";
    }

    if (cleanName.length > MAX_NAME_LENGTH) {
      return `الاسم يجب ألا يزيد عن ${MAX_NAME_LENGTH} حرفًا.`;
    }

    if (!cleanEmail) {
      return "البريد الإلكتروني مطلوب.";
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return "صيغة البريد الإلكتروني غير صحيحة.";
    }

    if (!password) {
      return "كلمة المرور مطلوبة.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف.`;
    }

    if (password !== confirmPassword) {
      return "كلمة المرور وتأكيدها غير متطابقين.";
    }

    if (status.state === "token_required" && !setupToken.trim()) {
      return "هذه الصفحة تحتاج ADMIN_SETUP_TOKEN.";
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

    if (
      status.state !== "ready" &&
      status.state !== "token_required"
    ) {
      setError("صفحة الإعداد غير متاحة حاليًا.");
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
      if (cleanToken) {
        headers["x-admin-setup-token"] = cleanToken;
      }

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

      if (res.ok && Boolean((data as Record<string, unknown>)?.ok)) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSetupToken("");
        setError("");

        // Refresh status quietly so if user reloads, page shows closed state.
        void checkSetupStatus();
        return;
      }

      const reason = getStringField(data, "reason");
      const serverMessage = getErrorMessage(data, "");

      if (res.status === 403) {
        if (
          reason === "admin_exists" ||
          serverMessage.includes("admin_exists") ||
          serverMessage.includes("يوجد أدمن") ||
          serverMessage.includes("مسجل بالفعل")
        ) {
          setStatus({
            state: "admin_exists",
            message:
              serverMessage ||
              "يوجد حساب أدمن بالفعل. لا يمكن استخدام صفحة الإعداد.",
          });
          return;
        }

        if (
          reason === "token_required" ||
          serverMessage.includes("token") ||
          serverMessage.includes("توكن")
        ) {
          setStatus({
            state: "token_required",
            message:
              serverMessage ||
              "توكن الإعداد غير صحيح أو مفقود.",
          });
          return;
        }

        if (
          reason === "disabled" ||
          serverMessage.includes("معطل")
        ) {
          setStatus({
            state: "disabled",
            message: serverMessage || "إنشاء حساب الأدمن معطل حاليًا.",
          });
          return;
        }

        setError(serverMessage || "غير مصرح لك بإنشاء حساب الأدمن.");
        return;
      }

      if (res.status === 409) {
        setError(
          serverMessage ||
            "هذا البريد الإلكتروني مسجل بالفعل كأدمن."
        );
        return;
      }

      if (res.status === 429) {
        const retryAfterRaw = Number(
          (data as Record<string, unknown>)?.retryAfter
        );

        const retryAfter = Number.isFinite(retryAfterRaw)
          ? retryAfterRaw
          : undefined;

        setError(
          serverMessage ||
            "تم تجاوز عدد المحاولات المسموح. حاول لاحقًا." +
              (retryAfter ? ` (متبقي ${retryAfter} ثانية)` : "")
        );

        setStatus((prev) => ({
          ...prev,
          retryAfter,
        }));

        return;
      }

      if (res.status === 400) {
        setError(serverMessage || "بيانات غير صالحة. راجع الحقول.");
        return;
      }

      setError(
        serverMessage ||
          "فشل إنشاء حساب الأدمن. حاول لاحقًا أو تواصل مع المسؤول."
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

  // ------------------------------------------------------------
  // Success screen
  // ------------------------------------------------------------

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border-t-4 border-gold bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-center font-serif text-3xl text-primary">
            ✅ تم إنشاء الحساب
          </h1>

          <p className="mb-6 text-center text-sm text-gray-500">
            تم إنشاء حساب الأدمن بنجاح. يمكنك الآن تسجيل الدخول.
          </p>

          <div className="rounded-lg bg-green-50 p-4 text-center text-sm font-bold text-green-700">
            احتفظ ببيانات الدخول في مكان آمن.
          </div>

          <Link
            href={LOGIN_URL}
            className="mt-6 block w-full rounded-lg bg-gold py-3 text-center font-bold text-gray-900 transition hover:bg-gold-light"
          >
            الذهاب إلى تسجيل دخول الأدمن
          </Link>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setStatus({ state: "checking" });
              void checkSetupStatus();
            }}
            className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            إعادة فحص حالة الإعداد
          </button>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Checking screen
  // ------------------------------------------------------------

  if (status.state === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border-t-4 border-gold bg-white p-8 text-center shadow-lg">
          <h1 className="mb-3 font-serif text-2xl text-primary">
            ⏳ جاري فحص حالة الإعداد
          </h1>
          <p className="text-sm text-gray-500">
            يتم التحقق مما إذا كان إنشاء حساب الأدمن متاحًا.
          </p>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Disabled / admin exists screens
  // ------------------------------------------------------------

  if (
    status.state === "disabled" ||
    status.state === "admin_exists"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border-t-4 border-red-400 bg-white p-8 shadow-lg">
          <h1 className="mb-3 text-center font-serif text-3xl text-primary">
            🔒 الإعداد غير متاح
          </h1>

          <p className="mb-6 text-center text-sm text-gray-600">
            {status.message ||
              "لا يمكن إنشاء حساب أدمن من هذه الصفحة حاليًا."}
          </p>

          <Link
            href={LOGIN_URL}
            className="block w-full rounded-lg bg-gold py-3 text-center font-bold text-gray-900 transition hover:bg-gold-light"
          >
            تسجيل دخول الأدمن
          </Link>

          <button
            type="button"
            onClick={() => {
              setStatus({ state: "checking" });
              void checkSetupStatus();
            }}
            className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Error screen with retry
  // ------------------------------------------------------------

  if (status.state === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border-t-4 border-orange-400 bg-white p-8 shadow-lg">
          <h1 className="mb-3 text-center font-serif text-3xl text-primary">
            ⚠️ تعذر تحميل صفحة الإعداد
          </h1>

          <p className="mb-6 text-center text-sm text-gray-600">
            {status.message || "حدث خطأ غير متوقع."}
          </p>

          {status.retryAfter ? (
            <p className="mb-4 text-center text-xs text-gray-500">
              حاول مرة أخرى بعدประมาณ {status.retryAfter} ثانية.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setStatus({ state: "checking" });
              void checkSetupStatus(setupToken.trim() || undefined);
            }}
            className="w-full rounded-lg bg-gold py-3 font-bold text-gray-900 transition hover:bg-gold-light"
          >
            إعادة الفحص
          </button>

          <Link
            href={LOGIN_URL}
            className="mt-3 block w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            الذهاب إلى تسجيل الدخول
          </Link>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Form screen
  // ------------------------------------------------------------

  const canSubmit =
    !submitting &&
    (status.state === "ready" || status.state === "token_required");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-dark px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border-t-4 border-gold bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center font-serif text-3xl text-primary">
          🔐 إنشاء حساب الآدمن
        </h1>

        <p className="mb-6 text-center text-sm text-gray-500">
          هذه صفحة إنشاء حساب الأدمن لأول مرة.
        </p>

        {status.message ? (
          <div
            className={`mb-5 rounded-lg p-3 text-sm font-bold ${
              status.state === "token_required"
                ? "bg-amber-50 text-amber-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {status.state === "token_required" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
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
                onChange={(event) => setSetupToken(event.target.value)}
                placeholder="أدخل توكن الإعداد"
                dir="ltr"
                autoComplete="off"
                className="w-full rounded-lg border-2 border-amber-200 px-4 py-2 text-left focus:border-amber-500 focus:outline-none"
              />

              <p className="mt-2 text-xs text-amber-800">
                احصل على هذا التوكن من متغيرات بيئة السيرفر. لا تشاركه مع أحد.
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

          <div>
            <label
              htmlFor="admin-name"
              className="mb-1 block text-sm font-bold text-gray-600"
            >
              الاسم
            </label>

            <input
              id="admin-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="اسم الآدمن"
              autoComplete="name"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-email"
              className="mb-1 block text-sm font-bold text-gray-600"
            >
              البريد الإلكتروني
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              dir="ltr"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-left focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-sm font-bold text-gray-600"
            >
              كلمة المرور
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={`${MIN_PASSWORD_LENGTH} أحرف على الأقل`}
              autoComplete="new-password"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-gold focus:outline-none"
            />

            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all ${passwordStrength.color}`}
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                  }}
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                قوة كلمة المرور: {passwordStrength.label}
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
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="أعد كتابة كلمة المرور"
              autoComplete="new-password"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-gold focus:outline-none"
            />

            {confirmPassword && password !== confirmPassword ? (
              <p className="mt-1 text-xs font-bold text-red-600">
                كلمتا المرور غير متطابقتين.
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
              ❌ {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-gold py-3 font-bold text-gray-900 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "⏳ جاري الإنشاء…" : "إنشاء حساب الآدمن"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
          <p className="mb-2 font-bold text-gray-700">تنبيه أمني مهم:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              بعد إنشاء الحساب، يُفضَّل تعطيل هذه الصفحة عبر:
              <code className="mx-1 rounded bg-gray-200 px-1">
                DISABLE_ADMIN_SETUP=true
              </code>
            </li>
            <li>
              لا تستخدم هذه الصفحة في الإنتاج بدون
              <code className="mx-1 rounded bg-gray-200 px-1">
                ADMIN_SETUP_TOKEN
              </code>
              .
            </li>
            <li>
              تأكد أن الاتصال عبر HTTPS فقط.
            </li>
            <li>
              احفظ بيانات الدخول في مدير كلمات مرور آمن.
            </li>
          </ul>
        </div>

        <Link
          href={LOGIN_URL}
          className="mt-4 block text-center text-sm font-bold text-primary hover:underline"
        >
          عندي حساب بالفعل؟ تسجيل الدخول
        </Link>
      </div>
    </main>
  );
}