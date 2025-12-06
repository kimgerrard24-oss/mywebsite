// components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth/auth.service';
import { useUserStore } from '@/stores/user.store';

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    remember: false,
  });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateEmail(form.email)) {
      setErrorMsg('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      });

      const hasData =
        res && typeof res === 'object' && 'data' in res && res.data;

      if (hasData && res.success && res.data?.user) {
        setUser(res.data.user);
        router.push('/feed');
        return;
      }

      // fallback from backend (rare)
      setErrorMsg(res.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง');
    } catch (err: any) {
      console.error('Login error', err);

      // -----------------------------
      // 🔥 Handle 401 - Invalid Credentials
      // -----------------------------
      if (err.response?.status === 401) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }

      // -----------------------------
      // 🔥 Handle 429 - Rate Limit
      // -----------------------------
      if (err.response?.status === 429) {
        const retry = err.response.data?.retryAfterSec || 60;
        setErrorMsg(`คุณพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ ${retry} วินาที`);
        return;
      }

      // -----------------------------
      // ⚠️ Everything else
      // -----------------------------
      setErrorMsg('เกิดข้อผิดพลาดในระบบ กรุณาลองอีกครั้งภายหลัง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby="login-error" noValidate>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">อีเมล</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Email"
            aria-required="true"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              รหัสผ่าน
            </span>
            <button
              type="button"
              tabIndex={0}
              onClick={() => setVisible((v) => !v)}
              className="text-sm text-slate-500 underline"
              aria-pressed={visible}
            >
              {visible ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>
          <input
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => onChange('password', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Password"
            aria-required="true"
            placeholder="••••••••"
            minLength={8}
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center text-sm">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => onChange('remember', e.target.checked)}
              className="mr-2"
              aria-label="Remember me"
            />
            จดจำฉัน
          </label>

          <a
            href="/auth/forgot"
            className="text-sm text-slate-600 hover:underline"
          >
            ลืมรหัสผ่าน?
          </a>
        </div>

        {errorMsg ? (
          <div id="login-error" role="alert" className="text-sm text-red-600">
            {errorMsg}
          </div>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            aria-disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </form>
  );
}
