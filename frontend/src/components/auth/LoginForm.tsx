// components/auth/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth/auth.service";
import { useUserStore } from "@/stores/user.store";

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

  // user.store ไม่มี setUser แล้ว แต่เราใช้ destructure ได้ตามปกติ
  const { isAuthenticated } = useUserStore();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
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
      setErrorMsg("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      });

      // Backend success → cookie ถูกเซตแล้ว
      // AuthContext จะโหลด user เองหลังจากหน้า feed render
      if (res?.success === true) {
        router.push("/feed");
        return;
      }

      setErrorMsg(res.message || "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง");
    } catch (err: any) {
      console.error("Login error", err);

      if (err.response?.status === 401) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (err.response?.status === 429) {
        const retry = err.response.data?.retryAfterSec || 60;
        setErrorMsg(`คุณพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ ${retry} วินาที`);
        return;
      }

      setErrorMsg("เกิดข้อผิดพลาดในระบบ กรุณาลองอีกครั้งภายหลัง");
    } finally {
      setLoading(false);
    }
  }

 return (
  <form
    onSubmit={handleSubmit}
    aria-describedby="login-error"
    noValidate
    className="
      w-full
      max-w-sm
      sm:max-w-md
      mx-auto
    "
  >
    <fieldset className="space-y-4 sm:space-y-5">
      <legend className="sr-only">Login form</legend>

      {/* Email */}
      <label className="block">
        <span className="text-xs sm:text-sm font-medium text-slate-700">
          อีเมล
        </span>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          aria-label="Email"
          aria-required="true"
          placeholder="you@example.com"
          className="
            mt-1
            block
            w-full
            rounded-md
            sm:rounded-lg
            border
            border-slate-200
            px-3
            py-2
            text-sm
            shadow-sm
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-slate-300
          "
        />
      </label>

      {/* Password */}
      <label className="block">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            รหัสผ่าน
          </span>

          <button
            type="button"
            tabIndex={0}
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="
              text-xs
              sm:text-sm
              text-slate-500
              underline
              hover:text-slate-700
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-slate-300
              rounded
            "
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
          aria-label="Password"
          aria-required="true"
          placeholder="••••••••"
          minLength={8}
          className="
            mt-1
            block
            w-full
            rounded-md
            sm:rounded-lg
            border
            border-slate-200
            px-3
            py-2
            text-sm
            shadow-sm
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-slate-300
          "
        />
      </label>

      {/* Remember + Forgot */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center text-xs sm:text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => onChange('remember', e.target.checked)}
            aria-label="Remember me"
            className="
              mr-2
              h-4
              w-4
              rounded
              border-slate-300
              focus-visible:ring-2
              focus-visible:ring-slate-300
            "
          />
          จดจำฉัน
        </label>

        <a
          href="/auth/forgot"
          className="
            text-xs
            sm:text-sm
            text-slate-600
            hover:underline
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-slate-300
            rounded
          "
        >
          ลืมรหัสผ่าน?
        </a>
      </div>

      {/* Error */}
      {errorMsg ? (
        <div
          id="login-error"
          role="alert"
          className="
            text-xs
            sm:text-sm
            text-red-600
          "
        >
          {errorMsg}
        </div>
      ) : null}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            rounded-md
            sm:rounded-lg
            bg-slate-800
            px-4
            py-2
            sm:py-2.5
            text-sm
            font-medium
            text-white
            transition-colors
            hover:bg-slate-900
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-slate-400
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </fieldset>
  </form>
);

}
