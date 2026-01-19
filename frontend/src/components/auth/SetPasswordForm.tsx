// frontend/src/components/auth/SetPasswordForm.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmSetPassword } from "@/lib/api/auth";

type Props = {
  token: string;
};

const MIN_PASSWORD_LENGTH = 8;

// ==============================
// Password rule checker (UX only)
// ==============================
function checkPasswordRules(pw: string) {
  const normalized = pw.normalize("NFKC");

  return {
    length: normalized.length >= MIN_PASSWORD_LENGTH,
    lower: /[a-z]/.test(normalized),
    upper: /[A-Z]/.test(normalized),
    digit: /[0-9]/.test(normalized),
    symbol: /[^a-zA-Z0-9]/.test(normalized),
  };
}

export default function SetPasswordForm({ token }: Props) {
  const router = useRouter();

  const normalizedToken =
    typeof token === "string" ? token.trim() : null;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasInvalidLink = !normalizedToken;

  // realtime rule status
  const rules = checkPasswordRules(password);
  const isStrongPassword =
    rules.length &&
    rules.lower &&
    rules.upper &&
    rules.digit &&
    rules.symbol;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setFieldError(null);

    if (hasInvalidLink) {
      setError(
        "The set-password link is invalid. Please request a new email."
      );
      return;
    }

    if (!password || !confirm) {
      setFieldError("Please fill in all required fields.");
      return;
    }

    if (!isStrongPassword) {
      setFieldError(
        "Password does not meet security requirements."
      );
      return;
    }

    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const normalizedPassword = password.normalize("NFKC");

      await confirmSetPassword({
        token: normalizedToken!,
        newPassword: normalizedPassword,
      });

      setSuccess(true);

      // redirect to login
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (e: any) {
      setError(
        e?.message ||
          "Unable to set password. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section
        className="
          w-full
          max-w-sm
          sm:max-w-md
          bg-white
          shadow-md
          sm:shadow-lg
          rounded-lg
          sm:rounded-xl
          p-6
          sm:p-8
          mx-auto
          text-center
        "
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">
          Password Set Successfully
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          You can now log in using your email and password.
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Redirecting to login...
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="set-password-heading"
      className="
        w-full
        max-w-sm
        sm:max-w-md
        md:max-w-lg
        bg-white
        shadow-md
        sm:shadow-lg
        rounded-lg
        sm:rounded-xl
        p-6
        sm:p-8
        mx-auto
      "
    >
      <header className="mb-5 sm:mb-6">
        <h1
          id="set-password-heading"
          className="
            text-xl
            sm:text-2xl
            md:text-3xl
            font-bold
            text-gray-900
            mb-2
            leading-tight
          "
        >
          Set your password
        </h1>

        <p className="text-sm sm:text-base text-gray-600">
          Create a password to enable email login for your account.
        </p>
      </header>

      {hasInvalidLink && (
        <div
          role="alert"
          className="
            mb-4
            rounded-md
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-xs
            sm:text-sm
            text-red-700
          "
        >
          The set-password link is invalid or missing. Please request
          a new email.
        </div>
      )}

      {fieldError && (
        <div
          role="alert"
          className="
            mb-4
            rounded-md
            border
            border-yellow-200
            bg-yellow-50
            px-4
            py-3
            text-xs
            sm:text-sm
            text-yellow-800
          "
        >
          {fieldError}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="
            mb-4
            rounded-md
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-xs
            sm:text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      <form
        className="space-y-4 sm:space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* New password */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="new-password"
            className="text-xs sm:text-sm font-medium text-gray-700"
          >
            New password
          </label>

          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              px-3
              py-2
              text-sm
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />

          {/* Password rules checklist */}
          <ul className="mt-2 space-y-1 text-[11px] sm:text-xs">
            <li className={rules.length ? "text-green-600" : "text-red-600"}>
              • At least {MIN_PASSWORD_LENGTH} characters
            </li>
            <li className={rules.upper ? "text-green-600" : "text-red-600"}>
              • One uppercase letter (A–Z)
            </li>
            <li className={rules.lower ? "text-green-600" : "text-red-600"}>
              • One lowercase letter (a–z)
            </li>
            <li className={rules.digit ? "text-green-600" : "text-red-600"}>
              • One number (0–9)
            </li>
            <li className={rules.symbol ? "text-green-600" : "text-red-600"}>
              • One symbol (e.g. !@#$%)
            </li>
          </ul>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirm-password"
            className="text-xs sm:text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>

          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              px-3
              py-2
              text-sm
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />
        </div>

        <button
          type="submit"
          disabled={loading || hasInvalidLink}
          className="
            mt-2
            inline-flex
            w-full
            items-center
            justify-center
            rounded-md
            bg-blue-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          "
        >
          {loading ? "Saving..." : "Set Password"}
        </button>

        <p className="mt-3 text-center text-[11px] sm:text-xs text-gray-500">
          If you did not request this, you can safely ignore this page.
        </p>
      </form>
    </section>
  );
}

