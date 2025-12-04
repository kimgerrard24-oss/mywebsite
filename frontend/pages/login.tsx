// ==============================
// file: frontend/pages/login.tsx
// ==============================
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import LoginForm from '@/components/auth/LoginForm';

// Normalize API base URL
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.phlyphant.com'
).replace(/\/+$/, '');

function LoginPageInner() {
  const router = useRouter();

  useEffect(() => {
    const session = Cookies.get('__session');
    if (!session) return;

    async function verify() {
      try {
        const res = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        if (res.data?.valid === true) {
          router.replace('/feed');
          return;
        }

        // Retry once (Hybrid OAuth cookie propagate delay)
        await new Promise((resolve) => setTimeout(resolve, 200));

        const retry = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        if (retry.data?.valid === true) {
          router.replace('/feed');
        }
      } catch {
        // ignore errors
      }
    }

    verify();
  }, [router]);

  function startOAuth(provider: 'google' | 'facebook') {
    window.location.href = `${API_BASE}/auth/${provider}`;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>เข้าสู่ระบบ</h1>

      <LoginForm />

      <p>เลือกวิธีการเข้าสู่ระบบด้วยบัญชีผู้ให้บริการ:</p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => startOAuth('google')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Sign in with Google
        </button>

        <button
          onClick={() => startOAuth('facebook')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Sign in with Facebook
        </button>
      </div>
    </div>
  );
}

// Force client-only rendering (fixes prerender errors)
export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
