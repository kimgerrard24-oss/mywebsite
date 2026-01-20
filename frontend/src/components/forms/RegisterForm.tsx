// frontend/src/components/forms/RegisterForm.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { registerUser } from '@/lib/api/auth';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    turnstile?: any;
  }
}

// ==============================
// Password rule checker (frontend UX only)
// ==============================
function checkPasswordRules(pw: string) {
  const normalized = pw.normalize('NFKC');

  return {
    length: normalized.length >= 8,
    lower: /[a-z]/.test(normalized),
    upper: /[A-Z]/.test(normalized),
    digit: /[0-9]/.test(normalized),
    symbol: /[^a-zA-Z0-9]/.test(normalized),
  };
}

export default function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const rules = checkPasswordRules(passwordValue);

  const isStrongPassword =
  rules.length &&
  rules.lower &&
  rules.upper &&
  rules.digit &&
  rules.symbol;

  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<any>(null);
  const router = useRouter();

  // async resolver for turnstile token
  const tokenResolver = useRef<
    ((token: string | null) => void) | null
  >(null);

  // =================================================
  // Render Invisible Turnstile widget (client only)
  // =================================================
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
              process.env
                .NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            size: 'invisible',

            callback: (token: string) => {
              tokenResolver.current?.(token);
            },

            'error-callback': () => {
              tokenResolver.current?.(null);
            },

            'timeout-callback': () => {
              tokenResolver.current?.(null);
            },
          },
        );
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // =================================================
  // Request Turnstile token
  // =================================================
  const getTurnstileToken = (): Promise<string | null> => {
    return new Promise((resolve) => {
      tokenResolver.current = resolve;

      if (window.turnstile && widgetId.current) {
        window.turnstile.execute(widgetId.current);
      } else {
        resolve(null);
      }
    });
  };

  // =================================================
  // Handle Register Submission
  // =================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const formEl = e.target as HTMLFormElement;
    const form = new FormData(formEl);

    const password = String(form.get('password') || '').normalize('NFKC');
    const confirmPassword = String(form.get('confirmPassword') || '').normalize('NFKC');

    // ---- Frontend UX validation only (backend is authority) ----
if (!isStrongPassword) {
  setError('Password does not meet security requirements.');
  setIsSubmitting(false);
  return;
}

if (password !== confirmPassword) {
  setError('Passwords do not match.');
  setIsSubmitting(false);
  return;
}


    const token = await getTurnstileToken();

    if (!token) {
      setError(
        'Captcha verification failed. Please try again.',
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      email: String(form.get('email') || '').trim(),
      username: String(form.get('username') || '').trim(),
      displayName: String(
        form.get('displayName') || '',
      ).trim(),
      password,
      countryCode: String(
        form.get('countryCode') || '',
      ).trim() || undefined,
      dateOfBirth: form.get('dateOfBirth')
        ? new Date(
            String(form.get('dateOfBirth')),
          ).toISOString()
        : undefined,
      turnstileToken: token,
    };

    try {
      await registerUser(payload);

      setMessage(
        'Registration successful. Please check your email to verify your account.',
      );
      formEl.reset();
      setPasswordValue('');

      setTimeout(() => {
    router.replace('/');
  }, 1200);
    } catch (err: any) {
      setError(
        err?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);

      if (window.turnstile && widgetId.current) {
        try {
          window.turnstile.reset(widgetId.current);
        } catch {}
      }
    }
  };

  return (
    <section
      aria-labelledby="register-title"
      className="w-full max-w-md mx-auto"
    >
      <h1
        id="register-title"
        className="text-2xl font-semibold text-center mb-6"
      >
        Create your PhlyPhant account
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {/* Invisible Turnstile Element */}
        <div ref={turnstileRef} />

        {/* ================= Email ================= */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            autoComplete="email"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Username ================= */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lowercase letters and numbers only.
          </p>
        </div>

        {/* ================= Display Name ================= */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            autoComplete="name"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Country + DOB ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="countryCode"
              className="block text-sm font-medium"
            >
              Country (optional)
            </label>
            <input
              id="countryCode"
              name="countryCode"
              placeholder="TH"
              maxLength={2}
              className="mt-1 w-full p-2 border rounded-md uppercase focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium"
            >
              Date of birth (optional)
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* ================= Password ================= */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Password
          </label>
          <input
  id="password"
  name="password"
  required
  type="password"
  autoComplete="new-password"
  value={passwordValue}
  onChange={(e) => setPasswordValue(e.target.value)}
  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"

/>

          <ul className="mt-1 text-xs space-y-1">
  <li className={rules.length ? 'text-green-600' : 'text-red-600'}>
    • At least 8 characters
  </li>
  <li className={rules.upper ? 'text-green-600' : 'text-red-600'}>
    • One uppercase letter (A–Z)
  </li>
  <li className={rules.lower ? 'text-green-600' : 'text-red-600'}>
    • One lowercase letter (a–z)
  </li>
  <li className={rules.digit ? 'text-green-600' : 'text-red-600'}>
    • One number (0–9)
  </li>
  <li className={rules.symbol ? 'text-green-600' : 'text-red-600'}>
    • One symbol (e.g. !@#$%)
  </li>
</ul>

        </div>

        {/* ================= Confirm Password ================= */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ================= Submit ================= */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full py-2.5 rounded-md
            text-white font-medium
            bg-blue-600 hover:bg-blue-700
            disabled:opacity-60 disabled:cursor-not-allowed
            transition
          "
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        {/* ================= Messages ================= */}
        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 text-center"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-700 text-center">
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          By creating an account, you agree to our Terms and Privacy
          Policy.
        </p>
      </form>
    </section>
  );
}

