// frontend/src/components/forms/RegisterForm.tsx

import { useState, useEffect, useRef } from "react";
import { registerUser } from "@/lib/api/auth";

declare global {
  interface Window {
    turnstile?: any;
  }
}

export default function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);

  // ==================================================
  // Render Invisible Turnstile widget
  // ==================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        window.turnstile &&
        turnstileRef.current &&
        !widgetId.current
      ) {
        widgetId.current = window.turnstile.render(
          turnstileRef.current,
          {
            sitekey:
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            size: "invisible",
          },
        );
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // ==================================================
  // Execute Turnstile and wait for token
  // ==================================================
  function getTurnstileToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.turnstile || !widgetId.current) {
        reject(new Error("Captcha not ready"));
        return;
      }

      window.turnstile.execute(widgetId.current, {
        callback: (token: string) => {
          resolve(token);
        },
        "error-callback": () => {
          reject(new Error("Captcha error"));
        },
        "timeout-callback": () => {
          reject(new Error("Captcha timeout"));
        },
      });
    });
  }

  // ==================================================
  // Handle Register Submission
  // ==================================================
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const form = new FormData(e.currentTarget);

    const email = String(form.get("email") || "").trim();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !username || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    let turnstileToken: string;

    try {
      turnstileToken = await getTurnstileToken();
    } catch {
      setLoading(false);
      setError(
        "Captcha verification failed. Please try again.",
      );
      return;
    }

    try {
      await registerUser({
        email,
        username,
        password,
        turnstileToken,
      });

      setMessage(
        "Registration successful. Please check your email to verify your account.",
      );

      // optional: reset form
      e.currentTarget.reset();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);

      // reset captcha for next attempt
      try {
        if (window.turnstile && widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }
      } catch {}
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label="Register form"
    >
      {/* Invisible Turnstile */}
      <div ref={turnstileRef} />

      <label className="block">
        <span className="text-sm text-gray-700">
          Email
        </span>
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">
          Username
        </span>
        <input
          required
          name="username"
          autoComplete="username"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">
          Password
        </span>
        <input
          required
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p
          className="text-sm text-green-600"
          role="status"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded
          bg-blue-600
          px-4
          py-2
          text-sm
          font-medium
          text-white
          hover:bg-blue-700
          disabled:opacity-50
        "
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}

