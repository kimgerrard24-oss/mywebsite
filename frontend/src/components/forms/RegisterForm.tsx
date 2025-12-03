// frontend/src/components/forms/RegisterForm.tsx

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    turnstile?: any;
    turnstileToken?: string | null;
  }
}

export default function RegisterForm() {
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

  // Handle Register Submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Execute Turnstile challenge
    if (window.turnstile && widgetId.current) {
      window.turnstile.execute(widgetId.current);
    }

    // Wait for token generation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const turnstileToken = window.turnstileToken;
    if (!turnstileToken) {
      setMessage('Captcha verification failed. Please try again.');
      return;
    }

    // Extract form fields
    const form = new FormData(e.target);
    const payload = {
      email: form.get('email'),
      username: form.get('username'),
      password: form.get('password'),
      turnstileToken, // required for backend verification
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/local/register`,
        payload
      );
      setMessage('Registration successful. Please check your email to verify.');
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || 'Registration failed.'
      );
    } finally {
      // Reset token
      window.turnstileToken = null;
      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Invisible Turnstile Element */}
      <div ref={turnstileRef} />

      <label className="block">
        <span>Email</span>
        <input
          required
          name="email"
          type="email"
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span>Username</span>
        <input
          required
          name="username"
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span>Password</span>
        <input
          required
          name="password"
          type="password"
          className="w-full p-2 border rounded"
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
