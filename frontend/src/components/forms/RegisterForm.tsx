// frontend/src/components/forms/RegisterForm.tsx

import { useState, useEffect, useRef } from 'react';
import { registerUser } from '@/lib/api/auth';

declare global {
  interface Window {
    turnstile?: any;
  }
}

export default function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<any>(null);

  // store resolver for async token wait
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
  // Request Turnstile token (deterministic)
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

    const token = await getTurnstileToken();

    if (!token) {
      setMessage(
        'Captcha verification failed. Please try again.',
      );
      setIsSubmitting(false);
      return;
    }

    const form = new FormData(e.target as HTMLFormElement);

    const payload = {
      email: String(form.get('email') || '').trim(),
      username: String(form.get('username') || '').trim(),
      password: String(form.get('password') || ''),
      turnstileToken: token,
    };

    try {
      await registerUser(payload);

      setMessage(
        'Registration successful. Please check your email to verify.',
      );
    } catch (err: any) {
      // do not leak internal errors
      setMessage(
        err?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);

      // reset widget safely
      if (window.turnstile && widgetId.current) {
        try {
          window.turnstile.reset(widgetId.current);
        } catch {}
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      {/* Invisible Turnstile Element */}
      <div ref={turnstileRef} />

      <label className="block">
        <span>Email</span>
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span>Username</span>
        <input
          required
          name="username"
          autoComplete="username"
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span>Password</span>
        <input
          required
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full p-2 border rounded"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full p-2 rounded
          text-white
          bg-blue-600
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {isSubmitting ? 'Registering…' : 'Register'}
      </button>

      {message && (
        <p className="text-sm text-green-700">{message}</p>
      )}
    </form>
  );
}
