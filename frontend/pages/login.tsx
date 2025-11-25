// frontend/pages/login.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from '@/lib/axios';
import Cookies from 'js-cookie';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.phlyphant.com';

export default function LoginPage() {
  const router = useRouter();

  // ================================
  // FIX: ถ้ามี session แล้ว → ห้ามกลับหน้า login
  // ================================
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
        }
      } catch {
        // ignore error → user ยังไม่ login
      }
    }

    verify();
  }, [router]);

  function startOAuth(provider: 'google' | 'facebook') {
    const url = `${API_BASE}/auth/${provider}`;
    window.location.href = url;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>เข้าสู่ระบบ</h1>
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
