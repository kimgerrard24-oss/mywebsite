// frontend/src/components/forms/RegisterForm.tsx

import { useState, useEffect, useRef } from 'react';
import { registerUser } from '@/lib/api/auth';

declare global {
  interface Window {
    turnstile?: any;
    turnstileToken?: string | null;
  }
}

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<any>(null);

  // Render Invisible Turnstile widget
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          size: 'invisible',
          callback: (token: string) => {
            window.turnstileToken = token;
          },
          'error-callback': () => {
            window.turnstileToken = null;
          },
          'timeout-callback': () => {
            window.turnstileToken = null;
          },
        });
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Execute invisible widget to generate a token
    if (window.turnstile && widgetId.current) {
      window.turnstile.execute(widgetId.current);
    }

    // Wait a moment for token to be generated
    await new Promise((resolve) => setTimeout(resolve, 300));

    const turnstileToken = window.turnstileToken;
    if (!turnstileToken) {
      setMessage('Captcha verification failed. Please try again.');
      return;
    }

    try {
      // *** STEP 3 — ส่ง turnstileToken ไป Backend ***
      const res = await registerUser({
        email: form.email,
        username: form.username,
        password: form.password,
        turnstileToken,     // << ====== ส่ง token ตรงนี้ ======
      });

      setMessage(res.message || 'Registered successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      // Reset Token
      window.turnstileToken = null;

      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Invisible Turnstile Element */}
      <div ref={turnstileRef} />

      <label className="block">
        <span>Email</span>
        <input
          required
          type="email"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>

      <label className="block">
        <span>Username</span>
        <input
          required
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </label>

      <label className="block">
        <span>Password</span>
        <input
          required
          type="password"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>

      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white rounded"
      >
        Register
      </button>

      {message && <p className="text-green-600">{message}</p>}
    </form>
  );
}
